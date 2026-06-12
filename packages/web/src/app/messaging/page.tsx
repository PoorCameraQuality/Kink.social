import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import UserAvatar from '@/components/UserAvatar'
import { shellDirectoryClass } from '@/lib/shell-contract'
import { cn } from '@/lib/cn'
import LoadErrorBanner from '@/components/ui/LoadErrorBanner'
import EmptyState from '@/components/ui/EmptyState'
import { ConversationSkeleton } from '@/components/ui/skeleton'
import StatusBanner from '@/components/ui/StatusBanner'
import MessagingEmptyPanel from '@/components/messaging/MessagingEmptyPanel'
import MessagingFolderTabs from '@/components/messaging/MessagingFolderTabs'
import MessagingInboxFilters, { type InboxFilter } from '@/components/messaging/MessagingInboxFilters'
import MessagingSafetyPanel from '@/components/messaging/MessagingSafetyPanel'
import ReportAction from '@/components/moderation/ReportAction'
import CommunityTrustChip from '@/components/trust/CommunityTrustChip'
import DmTrustContext from '@/components/trust/DmTrustContext'
import { conversationTarget, messageTarget } from '@/lib/moderation/report-targets'
import { useAuth } from '@/contexts/AuthContext'
import { mockConversations } from '@/data/mock-data'
import { getMockPersonByUsername } from '@/data/mock-seeds'

type ChatMsg = { id: string; from: 'them' | 'me'; text: string; time: string }

type ConvRow = {
  id: string
  name: string
  partnerUsername?: string
  partnerAvatarUrl?: string | null
  lastMessage: string
  date: string
  unread: boolean
}


function shortTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`
  return d.toLocaleDateString()
}

const MOCK_MESSAGES: ChatMsg[] = [
  { id: '1', from: 'them', text: "Let's Get You Certified! Complete your profile verification to boost your visibility.", time: '1 min ago' },
  { id: '2', from: 'me', text: "I'll check that out, thanks!", time: 'Just now' },
]

function initialMockMessagesByConversation(): Record<string, ChatMsg[]> {
  const map: Record<string, ChatMsg[]> = {}
  for (const c of mockConversations) {
    map[c.id] = MOCK_MESSAGES.map((m) => ({ ...m, id: `${c.id}-${m.id}` }))
  }
  return map
}

export default function MessagingPage() {
  const convSearchId = useId()
  const messageInputId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, status, viewerUserId } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [convSearch, setConvSearch] = useState('')
  const [mockMessagesByConv, setMockMessagesByConv] = useState<Record<string, ChatMsg[]>>(initialMockMessagesByConversation)
  const parseFolder = (raw: string | null): 'main' | 'requests' | 'iso' => {
    if (raw === 'requests' || raw === 'iso' || raw === 'main') return raw
    return 'main'
  }
  const [inboxFolder, setInboxFolder] = useState<'main' | 'requests' | 'iso'>(() =>
    parseFolder(searchParams.get('folder')),
  )
  const parseInboxFilter = (raw: string | null): InboxFilter => {
    if (raw === 'unread' || raw === 'friends' || raw === 'followers' || raw === 'following' || raw === 'favorites') {
      return raw
    }
    return 'all'
  }
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>(() => parseInboxFilter(searchParams.get('filter')))
  const [inboxSort, setInboxSort] = useState<'newest' | 'oldest'>(() =>
    searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest',
  )
  const [apiConversations, setApiConversations] = useState<ConvRow[] | null>(null)
  const [apiMessagesByConv, setApiMessagesByConv] = useState<Record<string, ChatMsg[]>>({})
  const [messagesFetchByConv, setMessagesFetchByConv] = useState<Record<string, 'loading' | 'loaded'>>({})
  const [partnerUsernameByConvId, setPartnerUsernameByConvId] = useState<Record<string, string>>({})
  const [loadError, setLoadError] = useState<string | null>(null)
  const openedUserRef = useRef<string | null>(null)
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null)
  const [deepLinkBusy, setDeepLinkBusy] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [folderCounts, setFolderCounts] = useState({ requests: 0, iso: 0 })
  const [convSearchOpen, setConvSearchOpen] = useState(false)

  const mockRows: ConvRow[] = useMemo(
    () =>
      mockConversations.map((c) => ({
        id: c.id,
        name: c.name,
        partnerUsername: c.name,
        partnerAvatarUrl: getMockPersonByUsername(c.name)?.avatarUrl ?? null,
        lastMessage: c.lastMessage,
        date: c.date,
        unread: !!c.unread,
      })),
    []
  )

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setApiConversations(null)
      return
    }
    setLoadError(null)
    try {
      const p = new URLSearchParams()
      if (inboxFolder === 'requests') p.set('folder', 'requests')
      else if (inboxFolder === 'iso') p.set('folder', 'iso')
      else p.set('folder', 'main')
      if (inboxFilter !== 'all') p.set('filter', inboxFilter)
      if (inboxSort === 'oldest') p.set('sort', 'oldest')
      const qStr = convSearch.trim()
      if (qStr) p.set('q', qStr)
      const r = await fetch(`/api/v1/conversations?${p.toString()}`, { credentials: 'include' })
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string }
        setLoadError(j.error ?? `HTTP ${r.status}`)
        setApiConversations(null)
        return
      }
      const data = (await r.json()) as {
        items: Array<{
          id: string
          title: string
          partnerUsername?: string | null
          partnerAvatarUrl?: string | null
          lastMessageBody: string | null
          lastMessageAt: string | null
          unreadCount: number
        }>
      }
      setApiConversations(
        (data.items ?? []).map((item) => ({
          id: item.id,
          name: item.title,
          partnerUsername:
            typeof item.partnerUsername === 'string' && item.partnerUsername.trim() ?
              item.partnerUsername.trim()
            : partnerUsernameByConvId[item.id],
          partnerAvatarUrl: item.partnerAvatarUrl ?? null,
          lastMessage: item.lastMessageBody ?? 'No messages yet',
          date: item.lastMessageAt ? shortTime(item.lastMessageAt) : '',
          unread: (item.unreadCount ?? 0) > 0,
        }))
      )
    } catch {
      setLoadError('Failed to load conversations')
      setApiConversations(null)
    }
  }, [isAuthenticated, inboxFolder, inboxFilter, inboxSort, convSearch, partnerUsernameByConvId])

  const refreshFolderCounts = useCallback(async () => {
    if (!isAuthenticated) {
      setFolderCounts({ requests: 0, iso: 0 })
      return
    }
    try {
      const [reqRes, isoRes] = await Promise.all([
        fetch('/api/v1/conversations?folder=requests', { credentials: 'include' }),
        fetch('/api/v1/conversations?folder=iso', { credentials: 'include' }),
      ])
      const parseCount = async (r: Response) => {
        if (!r.ok) return 0
        const data = (await r.json()) as { items?: unknown[] }
        return data.items?.length ?? 0
      }
      setFolderCounts({
        requests: await parseCount(reqRes),
        iso: await parseCount(isoRes),
      })
    } catch {
      setFolderCounts({ requests: 0, iso: 0 })
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (status !== 'ready' || !isAuthenticated) return
    void refreshFolderCounts()
  }, [status, isAuthenticated, refreshFolderCounts, apiConversations])

  const applyInboxFilter = useCallback(
    (filter: InboxFilter) => {
      setInboxFilter(filter)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (filter === 'all') next.delete('filter')
          else next.set('filter', filter)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const applyInboxSort = useCallback(
    (sort: 'newest' | 'oldest') => {
      setInboxSort(sort)
      try {
        sessionStorage.setItem('c2k:inbox-sort', sort)
      } catch {
        /* ignore */
      }
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev)
          if (sort === 'oldest') p.set('sort', 'oldest')
          else p.delete('sort')
          return p
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    const folder = parseFolder(searchParams.get('folder'))
    setInboxFolder((prev) => (prev === folder ? prev : folder))
    setInboxFilter(parseInboxFilter(searchParams.get('filter')))
    setInboxSort(searchParams.get('sort') === 'oldest' ? 'oldest' : 'newest')
    const urlQ = searchParams.get('q')
    if (urlQ != null && urlQ !== convSearch) setConvSearch(urlQ)
  }, [searchParams])

  const setFolderInUrl = useCallback(
    (folder: 'main' | 'requests' | 'iso', clearConversation = true) => {
      setInboxFolder(folder)
      if (clearConversation) setSelectedConversation(null)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (folder === 'main') next.delete('folder')
          else next.set('folder', folder)
          if (clearConversation) next.delete('c')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const selectConversation = useCallback(
    (convId: string | null) => {
      setSelectedConversation(convId)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (convId) next.set('c', convId)
          else next.delete('c')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    if (status !== 'ready') return
    void loadConversations()
  }, [status, loadConversations])

  const conversationRows = useMemo(
    () => (isAuthenticated ? (apiConversations ?? []) : mockRows),
    [isAuthenticated, apiConversations, mockRows],
  )
  const conversationsLoading = isAuthenticated && apiConversations === null && !loadError

  useEffect(() => {
    const c = searchParams.get('c')
    if (!c) return
    if (conversationRows.some((row) => row.id === c)) {
      selectConversation(c)
    }
  }, [searchParams, conversationRows])

  useEffect(() => {
    const username = searchParams.get('user')?.trim()
    if (!username || !isAuthenticated || status !== 'ready') return
    if (openedUserRef.current === username) return
    openedUserRef.current = username
    setDeepLinkError(null)
    setDeepLinkBusy(true)
    let cancelled = false
    void (async () => {
      try {
        const r = await fetch('/api/v1/conversations', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantUsername: username }),
        })
        if (cancelled) return
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string }
          setDeepLinkError(j.error ?? 'Could not open conversation with that member.')
          return
        }
        const data = (await r.json()) as { conversation: { id: string } }
        if (cancelled) return
        selectConversation(data.conversation.id)
        setPartnerUsernameByConvId((prev) => ({ ...prev, [data.conversation.id]: username }))
        setFolderInUrl('main', false)
        await loadConversations()
      } catch {
        if (!cancelled) setDeepLinkError('Could not open conversation. Check your connection and try again.')
      } finally {
        if (!cancelled) setDeepLinkBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchParams, isAuthenticated, status, loadConversations])

  const loadMessagesFor = useCallback(
    async (convId: string) => {
      if (!isAuthenticated || !viewerUserId) return
      setMessagesFetchByConv((prev) => ({ ...prev, [convId]: 'loading' }))
      try {
        const r = await fetch(`/api/v1/conversations/${encodeURIComponent(convId)}/messages?limit=80`, {
          credentials: 'include',
        })
        if (!r.ok) {
          setMessagesFetchByConv((prev) => ({ ...prev, [convId]: 'loaded' }))
          return
        }
        const data = (await r.json()) as {
          items: Array<{ id: string; senderId: string; body: string; createdAt: string }>
        }
        const mapped: ChatMsg[] = (data.items ?? []).map((m) => ({
          id: m.id,
          from: m.senderId === viewerUserId ? 'me' : 'them',
          text: m.body,
          time: shortTime(m.createdAt),
        }))
        setApiMessagesByConv((prev) => ({ ...prev, [convId]: mapped }))
        setMessagesFetchByConv((prev) => ({ ...prev, [convId]: 'loaded' }))
      } catch {
        setMessagesFetchByConv((prev) => ({ ...prev, [convId]: 'loaded' }))
      }
    },
    [isAuthenticated, viewerUserId]
  )

  useEffect(() => {
    if (!selectedConversation || !isAuthenticated) return
    void loadMessagesFor(selectedConversation)
  }, [selectedConversation, isAuthenticated, loadMessagesFor])

  useEffect(() => {
    setSendError(null)
  }, [selectedConversation])

  const activeConv = selectedConversation ? conversationRows.find((c) => c.id === selectedConversation) : null
  const activePartnerUsername = activeConv ?
    activeConv.partnerUsername?.trim() ||
    partnerUsernameByConvId[activeConv.id]?.trim() ||
    (!isAuthenticated || apiConversations === null ? activeConv.name.trim() : '')
  : ''
  const activePartnerProfileHref =
    activePartnerUsername ? `/profile/${encodeURIComponent(activePartnerUsername)}` : null
  const threadMessagesLoading = Boolean(
    activeConv &&
      isAuthenticated &&
      apiConversations !== null &&
      (messagesFetchByConv[activeConv.id] === 'loading' ||
        (messagesFetchByConv[activeConv.id] !== 'loaded' && !(activeConv.id in apiMessagesByConv))),
  )
  const apiBackedMessaging = Boolean(isAuthenticated && apiConversations !== null)

  const acceptDm = useCallback(async () => {
    if (!activeConv || !isAuthenticated) return
    try {
      const r = await fetch(`/api/v1/conversations/${encodeURIComponent(activeConv.id)}/accept-dm`, {
        method: 'POST',
        credentials: 'include',
      })
      if (r.ok) {
        setFolderInUrl('main')
        await loadConversations()
      }
    } catch {
      /* ignore */
    }
  }, [activeConv, isAuthenticated, loadConversations, setFolderInUrl])

  const threadMessages = activeConv
    ? isAuthenticated && apiConversations !== null
      ? apiMessagesByConv[activeConv.id] ?? []
      : mockMessagesByConv[activeConv.id] ?? MOCK_MESSAGES
    : []

  const handleSend = async () => {
    if (!activeConv || !messageText.trim()) return
    const text = messageText.trim()
    if (isAuthenticated && apiConversations !== null) {
      setSendError(null)
      try {
        const r = await fetch('/api/v1/messages', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: activeConv.id, body: text }),
        })
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string }
          setSendError(j.error ?? 'Could not send message.')
          return
        }
        setMessageText('')
        await loadMessagesFor(activeConv.id)
        await loadConversations()
      } catch {
        setSendError('Network error sending message.')
      }
      return
    }
    setMockMessagesByConv((prev) => ({
      ...prev,
      [activeConv.id]: [
        ...(prev[activeConv.id] ?? MOCK_MESSAGES),
        { id: `local-${Date.now()}`, from: 'me', text, time: 'Just now' },
      ],
    }))
    setMessageText('')
  }

  const filteredConversations = conversationRows.filter((c) => {
    if (isAuthenticated && apiConversations !== null && convSearch.trim()) return true
    const q = convSearch.trim().toLowerCase()
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
  })

  const listEmptyPanel = useMemo(() => {
    if (convSearch.trim()) {
      return {
        icon: 'inbox' as const,
        title: 'No matches',
        message: 'No conversations match your search.',
        actions: [] as const,
      }
    }
    if (inboxFolder === 'requests') {
      return {
        icon: 'requests' as const,
        title: 'No message requests',
        message: 'When someone new messages you, requests will appear here until you accept them.',
        actions: [{ label: 'People', href: '/people', primary: true }] as const,
      }
    }
    if (inboxFolder === 'iso') {
      return {
        icon: 'iso' as const,
        title: 'No ISO messages yet',
        message: 'Replies from personal or convention ISO boards will appear here.',
        actions: [{ label: 'Browse events', href: '/events', primary: true }] as const,
      }
    }
    return {
      icon: 'inbox' as const,
      title: 'No messages yet',
      message:
        'Start by connecting with people you trust, or open a profile and send a message request.',
      actions: [
        { label: 'People', href: '/people', primary: true },
        { label: 'View connections', href: '/connections' },
      ] as const,
    }
  }, [convSearch, inboxFolder])

  const inboxHasMessages = conversationRows.length > 0
  const showConvSearch = convSearchOpen || Boolean(convSearch.trim()) || inboxHasMessages

  return (
    <div
      className={cn(
        shellDirectoryClass,
        'c2k-mobile-scroll-pad c2k-mobile-viewport-fill flex min-h-0 flex-1 flex-col py-2 sm:py-3',
      )}
    >
      <header className="mb-1 shrink-0 sm:mb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-dc-text sm:text-2xl">Messages</h1>
            <p className="mt-0.5 hidden text-sm text-dc-text-muted sm:block">Private conversations, requests, and ISO replies.</p>
          </div>
          <Link
            to="/support"
            className="hidden min-h-touch items-center gap-1.5 rounded-xl border border-dc-border px-3 text-sm font-medium text-dc-accent hover:bg-dc-accent-muted sm:inline-flex"
          >
            Help
          </Link>
        </div>
      </header>
      <MessagingSafetyPanel variant="banner" />
      {loadError && isAuthenticated ? <LoadErrorBanner className="mb-2 shrink-0" message={loadError} onRetry={() => void loadConversations()} /> : null}
      {deepLinkError && isAuthenticated ?
        <StatusBanner tone="error" className="mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1">{deepLinkError}</p>
            <button
              type="button"
              onClick={() => setDeepLinkError(null)}
              className="min-h-11 shrink-0 rounded-xl border border-dc-border px-3 text-sm text-dc-text hover:bg-dc-elevated-muted"
            >
              Dismiss
            </button>
          </div>
        </StatusBanner>
      : deepLinkBusy && isAuthenticated ?
        <p className="mb-2 text-sm text-dc-text-muted" role="status">
          Opening conversation with @{searchParams.get('user')?.trim()}…
        </p>
      : null}
      {!isAuthenticated ?
        <p className="mb-2 shrink-0 text-sm text-dc-muted">Showing demo threads. Log in to load your real conversations.</p>
      : null}

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated/95 lg:flex-row">
        <aside
          className={`flex w-full shrink-0 flex-col border-b border-dc-border lg:w-[min(100%,340px)] lg:border-b-0 lg:border-r ${
            selectedConversation ? 'hidden lg:flex' : 'flex'
          }`}
          aria-label="Conversations"
        >
          <div className="shrink-0 border-b border-dc-border p-3 sm:p-4">
            <MessagingFolderTabs
              active={inboxFolder}
              onChange={setFolderInUrl}
              counts={isAuthenticated ? folderCounts : undefined}
              showHint={false}
            />
            <MessagingInboxFilters
              inboxFilter={inboxFilter}
              inboxSort={inboxSort}
              onFilterChange={applyInboxFilter}
              onSortChange={applyInboxSort}
              showAdvanced={inboxFolder === 'main' && inboxHasMessages && (isAuthenticated ? apiConversations !== null : true)}
            />
            <div className="mt-2 flex items-center gap-2 sm:mt-3">
              {!showConvSearch ?
                <button
                  type="button"
                  onClick={() => setConvSearchOpen(true)}
                  className="inline-flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-dc-border bg-[var(--dc-input)] px-3 text-sm text-dc-muted sm:hidden"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search conversations…
                </button>
              : null}
              <label htmlFor={convSearchId} className="sr-only">
                Search conversations
              </label>
              <input
                id={convSearchId}
                type="search"
                name="conversation-search"
                placeholder="Search conversations…"
                autoComplete="off"
                value={convSearch}
                onChange={(e) => {
                  const v = e.target.value
                  setConvSearch(v)
                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev)
                      const t = v.trim()
                      if (t) next.set('q', t)
                      else next.delete('q')
                      return next
                    },
                    { replace: true },
                  )
                }}
                className={`w-full min-h-10 rounded-xl border border-dc-border bg-[var(--dc-input)] px-3 py-2 text-sm text-dc-text placeholder-dc-muted focus:border-dc-accent focus:outline-none focus:ring-1 focus:ring-dc-accent sm:min-h-11 ${
                  showConvSearch ? 'block' : 'hidden sm:block'
                }`}
              />
              {showConvSearch && !convSearch.trim() ?
                <button
                  type="button"
                  onClick={() => setConvSearchOpen(false)}
                  className="shrink-0 inline-flex min-h-10 items-center px-2 text-xs text-dc-muted hover:text-dc-text sm:hidden"
                >
                  Cancel
                </button>
              : null}
            </div>
            {showConvSearch ?
              <p className="mt-1.5 hidden text-[11px] text-dc-muted sm:block">
                Can&apos;t find a thread? Check <button type="button" className="text-dc-accent hover:underline" onClick={() => setFolderInUrl('requests')}>Requests</button> or{' '}
                <button type="button" className="text-dc-accent hover:underline" onClick={() => setFolderInUrl('iso')}>ISO</button>.
              </p>
            : null}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ?
              <div className="p-2 dc-panel-enter" aria-busy="true" role="status">
                <p className="mb-2 px-2 text-xs text-dc-muted">Loading conversations…</p>
                <ConversationSkeleton />
              </div>
            : filteredConversations.length === 0 ?
              <div className="p-2 sm:p-4">
                {loadError && isAuthenticated && !convSearch.trim() ?
                  <EmptyState
                    inline
                    compact
                    title="Could not load inbox"
                    message="Use Retry above or check that the API database migrations are up to date."
                    actionLabel="Retry"
                    onAction={() => void loadConversations()}
                  />
                : conversationsLoading ?
                  null
                : <MessagingEmptyPanel
                    compact
                    icon={listEmptyPanel.icon}
                    title={listEmptyPanel.title}
                    message={listEmptyPanel.message}
                    actions={[...listEmptyPanel.actions]}
                  />
                }
              </div>
            : (
              filteredConversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-current={selectedConversation === c.id ? 'true' : undefined}
                  onClick={() => selectConversation(c.id)}
                  className={`w-full min-h-[3rem] flex items-center gap-3 p-3 text-left hover:bg-dc-elevated-muted transition-colors sm:min-h-[3.25rem] sm:p-4 ${
                    selectedConversation === c.id ? 'bg-dc-accent/10' : ''
                  }`}
                >
                  <UserAvatar
                    avatarUrl={c.partnerAvatarUrl}
                    alt=""
                    size="md"
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium truncate ${c.unread ? 'text-dc-text' : 'text-dc-text-muted'}`}>{c.name}</span>
                      <span className="text-xs text-dc-muted flex-shrink-0 ml-2">{c.date}</span>
                    </div>
                    <p className="text-sm text-dc-muted truncate">{c.lastMessage}</p>
                  </div>
                  {c.unread && <span className="w-2 h-2 rounded-full bg-dc-accent flex-shrink-0" aria-label="Unread" />}
                </button>
              ))
            )}
          </div>
        </aside>

        <main
          className={`flex-1 flex flex-col min-h-0 ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}
        >
          {activeConv ? (
            <>
              {isAuthenticated && apiConversations !== null && inboxFolder === 'requests' && (
                <div className="px-4 py-3 border-b border-amber-500/30 bg-amber-500/10 text-sm text-amber-100 flex flex-wrap items-center justify-between gap-2">
                  <span>Someone you aren&apos;t connected with messaged you. Accept to move this thread to Main and reply.</span>
                  <button
                    type="button"
                    onClick={() => void acceptDm()}
                    className="shrink-0 px-4 py-2 rounded-lg bg-dc-accent text-dc-accent-foreground text-sm font-medium"
                  >
                    Accept conversation
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 border-b border-dc-border">
                <button
                  type="button"
                  onClick={() => selectConversation(null)}
                  className="lg:hidden min-h-11 min-w-11 p-2 -ml-2 text-dc-muted hover:text-dc-text"
                  aria-label="Back to conversations"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {activePartnerProfileHref ?
                  <Link to={activePartnerProfileHref} className="flex min-w-0 flex-1 items-center gap-2">
                    <UserAvatar avatarUrl={activeConv.partnerAvatarUrl} alt="" size="sm" className="shrink-0" />
                    <span className="truncate font-medium text-dc-text">{activeConv.name}</span>
                    <CommunityTrustChip username={activePartnerUsername} />
                  </Link>
                :   <div className="flex min-w-0 flex-1 items-center gap-2">
                    <UserAvatar avatarUrl={activeConv.partnerAvatarUrl} alt="" size="sm" className="shrink-0" />
                    <span className="truncate font-medium text-dc-text">{activeConv.name}</span>
                    <CommunityTrustChip username={activePartnerUsername} />
                  </div>
                }
                <div className="flex items-center gap-1">
                  {apiBackedMessaging && activeConv ?
                    (() => {
                      const target = conversationTarget(activeConv.id)
                      return (
                        <ReportAction
                          variant="button"
                          targetType={target.targetType}
                          targetId={target.targetId}
                          targetLabel="conversation"
                          surface="messaging"
                          className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-xs font-medium text-dc-text-muted hover:text-dc-text px-2"
                        />
                      )
                    })()
                  : (
                    <Link
                      to="/support"
                      className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-xs font-medium text-dc-text-muted hover:text-dc-text"
                    >
                      Report
                    </Link>
                  )}
                  <button type="button" className="min-h-11 min-w-11 p-2 text-dc-muted hover:text-dc-text" aria-label="More actions">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <DmTrustContext partnerUsername={activePartnerUsername} />

              <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
                {threadMessagesLoading ?
                  <div className="dc-panel-enter" aria-busy="true" role="status">
                    <p className="sr-only">Loading messages…</p>
                    <ul className="dc-skeleton-stagger space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <li key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div
                            className={`dc-skeleton-bone h-14 w-[min(80%,16rem)] rounded-2xl ${
                              i % 2 === 0 ? 'rounded-bl-md' : 'rounded-br-md'
                            }`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                : threadMessages.length === 0 ?
                  <p className="py-8 text-center text-sm text-dc-muted">No messages yet. Say hello.</p>
                : (
                  threadMessages.map((msg) => (
                    <div key={msg.id} className={`group flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`relative max-w-[80%] px-4 py-2 rounded-2xl ${
                          msg.from === 'me'
                            ? 'bg-dc-accent text-dc-accent-foreground rounded-br-md'
                            : 'bg-dc-elevated-solid text-dc-text rounded-bl-md'
                        }`}
                      >
                        {apiBackedMessaging && msg.from !== 'me' ?
                          (() => {
                            const target = messageTarget(msg.id)
                            return (
                              <div className="absolute -top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <ReportAction
                                  variant="icon"
                                  targetType={target.targetType}
                                  targetId={target.targetId}
                                  targetLabel="message"
                                  surface="messaging"
                                  className="!min-h-6 !min-w-6 rounded-md bg-dc-elevated/90"
                                />
                              </div>
                            )
                          })()
                        : null}
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {sendError ?
                <div className="mx-4 mb-0 rounded-xl border border-red-500/30 bg-red-950/25 px-3 py-2 text-sm text-red-200" role="alert">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="flex-1">{sendError}</p>
                    <button
                      type="button"
                      onClick={() => setSendError(null)}
                      className="min-h-11 shrink-0 rounded-xl border border-dc-border px-3 text-sm text-dc-text hover:bg-dc-elevated-muted"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              : null}

              <div className="safe-area-pb flex items-end gap-2 border-t border-dc-border p-4">
                <button type="button" className="min-h-11 min-w-11 p-2 text-dc-muted hover:text-dc-text rounded-lg" aria-label="Attach file">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <label htmlFor={messageInputId} className="sr-only">
                    Message to {activeConv.name}
                  </label>
                  <input
                    id={messageInputId}
                    type="text"
                    placeholder="Type a message…"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        void handleSend()
                      }
                    }}
                    className="w-full min-h-11 px-4 py-2 bg-dc-surface-muted border border-dc-border rounded-xl text-dc-text placeholder-dc-muted text-sm focus:border-dc-accent outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!messageText.trim()}
                  className="min-h-11 px-4 py-2 bg-dc-accent hover:bg-dc-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-dc-text text-sm font-medium rounded-xl"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-10">
              <MessagingEmptyPanel
                icon="select"
                title="Select a conversation"
                message="Choose a message from the left, or start a new conversation with someone you trust."
                actions={[
                  { label: 'People', href: '/people', primary: true },
                  { label: 'View connections', href: '/connections' },
                ]}
                footer={
                  <>
                    Need help?{' '}
                    <Link to="/support" className="text-dc-accent hover:underline">
                      Report abuse
                    </Link>{' '}
                    or visit{' '}
                    <Link to="/support" className="text-dc-accent hover:underline">
                      Support
                    </Link>
                    .
                  </>
                }
                className="w-full max-w-lg"
              />
            </div>
          )}
        </main>
        </div>

        <aside id="messaging-safety" className="hidden w-[280px] shrink-0 xl:block" aria-label="Messaging safety">
          <MessagingSafetyPanel defaultOpen={false} />
        </aside>
      </div>
    </div>
  )
}
