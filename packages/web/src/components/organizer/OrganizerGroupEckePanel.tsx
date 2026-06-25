import { useCallback, useEffect, useState } from 'react'
import EckePublishPanel from '@/components/ecke/EckePublishPanel'
import type { EckePreviewData } from '@/components/ecke/EckePublishPreviewDrawer'

type OverviewCard = {
  section: string
  sourceKind?: string
  sourceId?: string
  title: string
  supportState: string
  eligible?: boolean
  reason?: string
  status?: EckePreviewData['status']
  summary?: string
  plannedMessage?: string
  preview?: EckePreviewData
}

type OverviewResponse = {
  groupId: string
  groupSlug: string
  groupName: string
  bridgeConnected: boolean
  readOnlyPass: boolean
  passNotice: string
  cards: OverviewCard[]
  history: Array<{
    targetKind: string
    externalSlug: string
    status: string
    lastPublishedAt: string | null
    lastError: string | null
    lastPreviewAt: string | null
  }>
}

type Props = {
  groupId: string
}

const SECTION_ORDER = [
  'overview',
  'group_listing',
  'events',
  'education',
  'venues',
  'vendors',
  'dancecard',
  'history',
] as const

const SECTION_HEADINGS: Record<string, string> = {
  overview: 'Overview',
  group_listing: 'Group listing',
  events: 'Events',
  education: 'Education',
  venues: 'Venues / Dungeons / Places',
  vendors: 'Vendors / Sponsors',
  dancecard: 'Dancecard',
  history: 'Publish history',
}

export default function OrganizerGroupEckePanel({ groupId }: Props) {
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const r = await fetch(`/api/v1/groups/${encodeURIComponent(groupId)}/ecke-publish`, {
        credentials: 'include',
      })
      if (!r.ok) {
        setLoadError(r.status === 403 ? 'You need moderator access to view ECKE publish.' : 'Could not load ECKE publish overview.')
        setData(null)
        return
      }
      setData((await r.json()) as OverviewResponse)
    } catch {
      setLoadError('Network error loading ECKE publish overview.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  const loadPreview = useCallback(
    async (sourceKind: string, sourceId: string): Promise<EckePreviewData | null> => {
      const params = new URLSearchParams({ sourceKind, sourceId })
      const r = await fetch(
        `/api/v1/groups/${encodeURIComponent(groupId)}/ecke-publish/preview?${params.toString()}`,
        { credentials: 'include' },
      )
      if (!r.ok) return null
      return (await r.json()) as EckePreviewData
    },
    [groupId],
  )

  const runWriteAction = useCallback(
    async (action: 'publish' | 'sync' | 'unpublish', sourceKind: string, sourceId: string): Promise<boolean> => {
      const r = await fetch(
        `/api/v1/groups/${encodeURIComponent(groupId)}/ecke-publish/${action}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceKind, sourceId }),
        },
      )
      return r.ok
    },
    [groupId],
  )

  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-2xl bg-dc-elevated-muted" aria-busy="true" aria-label="Loading ECKE publish" />
    )
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-dc-border bg-dc-elevated-muted p-6 text-center">
        <p className="text-dc-text-muted">{loadError}</p>
      </div>
    )
  }

  if (!data) return null

  const cardsBySection = new Map<string, OverviewCard[]>()
  for (const card of data.cards) {
    const list = cardsBySection.get(card.section) ?? []
    list.push(card)
    cardsBySection.set(card.section, list)
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-dc-accent">East Coast Kink Events</p>
        <h2 className="text-2xl font-semibold text-dc-text">ECKE Publish</h2>
        <p className="max-w-2xl text-sm text-dc-text-muted">
          Preview exactly what would appear on East Coast Kink Events for {data.groupName}.{' '}
          <span className="text-amber-200/90">{data.passNotice}</span>
        </p>
        <p className="text-xs text-dc-text-muted">
          Bridge: {data.bridgeConnected ? 'configured on this server' : 'not configured on this server'}
        </p>
      </header>

      {SECTION_ORDER.map((section) => {
        if (section === 'history') {
          return (
            <section key={section} className="space-y-3">
              <h3 className="text-lg font-semibold text-dc-text">{SECTION_HEADINGS[section]}</h3>
              {data.history.length === 0 ?
                <p className="text-sm text-dc-text-muted">No publish history recorded for this group yet.</p>
              : (
                <ul className="divide-y divide-dc-border rounded-xl border border-dc-border">
                  {data.history.map((row) => (
                    <li key={`${row.targetKind}-${row.externalSlug}`} className="flex flex-wrap gap-3 px-4 py-3 text-sm">
                      <span className="font-medium text-dc-text">{row.targetKind}</span>
                      <span className="text-dc-text-muted">{row.externalSlug}</span>
                      <span className="text-dc-text-muted">{row.status}</span>
                      {row.lastPublishedAt ?
                        <span className="text-dc-text-muted">Published {row.lastPublishedAt}</span>
                      : null}
                      {row.lastError ?
                        <span className="text-red-300">{row.lastError}</span>
                      : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        }

        const sectionCards = cardsBySection.get(section)
        if (!sectionCards?.length) return null

        return (
          <section key={section} className="space-y-3">
            {section !== 'overview' ?
              <h3 className="text-lg font-semibold text-dc-text">{SECTION_HEADINGS[section]}</h3>
            : null}
            <div className="space-y-4">
              {sectionCards.map((card) => (
                <EckePublishPanel
                  key={`${card.section}-${card.sourceId ?? card.title}`}
                  title={card.title}
                  sourceKind={card.sourceKind}
                  sourceId={card.sourceId}
                  supportState={card.supportState}
                  eligible={card.eligible}
                  reason={card.reason}
                  status={card.status ?? card.preview?.status}
                  summary={card.summary}
                  plannedMessage={card.plannedMessage}
                  preview={card.preview}
                  staleNotice={card.preview?.staleNotice}
                  eckePublicUrl={card.preview?.eckePublicUrl}
                  eckePublicUrlKnown={card.preview?.eckePublicUrlKnown}
                  writeEnabled={card.section === 'group_listing' || card.section === 'events'}
                  writeKind={card.section === 'events' ? 'event_listing' : 'group_listing'}
                  onLoadPreview={card.sourceKind && card.sourceId ? loadPreview : undefined}
                  onPublish={
                    (card.section === 'group_listing' || card.section === 'events') && card.sourceKind && card.sourceId ?
                      (sk, sid) => runWriteAction('publish', sk, sid)
                    : undefined
                  }
                  onSync={
                    (card.section === 'group_listing' || card.section === 'events') && card.sourceKind && card.sourceId ?
                      (sk, sid) => runWriteAction('sync', sk, sid)
                    : undefined
                  }
                  onUnpublish={
                    (card.section === 'group_listing' || card.section === 'events') && card.sourceKind && card.sourceId ?
                      (sk, sid) => runWriteAction('unpublish', sk, sid)
                    : undefined
                  }
                  onActionComplete={() => void loadOverview()}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
