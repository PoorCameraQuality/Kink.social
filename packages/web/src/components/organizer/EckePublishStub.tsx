import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import OrganizerPublishConfirmDialog from '@/components/organizer/ui/OrganizerPublishConfirmDialog'
import ConventionListingDetailsEditor from '@/components/organizer/ConventionListingDetailsEditor'
import { patchConventionOrganizerSettings } from '@/lib/organizer/conventionProgramApi'
import {
  eckePublishHadListingWebhookSkip,
  getEckePublishFailureMessage,
} from '@/lib/ecke-publish-utils'

type PublishTarget = {
  targetKind:
    | 'ecke_listing'
    | 'dancecard_event'
    | 'ecke_event'
    | 'ecke_vendor'
    | 'ecke_article'
    | 'ecke_dungeon'
  externalSlug: string
  status: 'never' | 'draft' | 'published' | 'error' | 'stale'
  contentHash: string | null
  publishedContentHash: string | null
  lastPublishedAt: string | null
  lastPreviewAt: string | null
  lastError: string | null
  slotCount: number | null
  staffShiftCount?: number | null
}

type PublishResponse = {
  scope: { type: 'organization' | 'convention' | 'group'; slug: string; name: string }
  bridgeConnected: boolean
  targets: PublishTarget[]
}

type Props = {
  scopeLabel: string
  scopeType?: 'organization' | 'convention' | 'group'
  scopeSlug?: string
  organizerSettingsHref?: string
  settingsLinkLabel?: string
  /** Lighter chrome when embedded in organizer settings publish tab. */
  variant?: 'default' | 'settings'
}

const TARGET_LABELS: Record<PublishTarget['targetKind'], string> = {
  ecke_listing: 'East Coast Kink Events listing',
  dancecard_event: 'Dancecard attendee app',
  ecke_event: 'ECKE events directory (Supabase)',
  ecke_vendor: 'ECKE vendor directory',
  ecke_article: 'ECKE education article',
  ecke_dungeon: 'ECKE dungeon listing',
}

const STATUS_LABELS: Record<PublishTarget['status'], string> = {
  never: 'Not previewed yet',
  draft: 'Preview ready',
  published: 'Published',
  error: 'Last publish failed',
  stale: 'Changes since last publish',
}

function statusTone(status: PublishTarget['status']): string {
  switch (status) {
    case 'published':
      return 'text-emerald-300 border-emerald-500/30 bg-emerald-950/30'
    case 'stale':
      return 'text-amber-200 border-amber-500/30 bg-amber-950/30'
    case 'error':
      return 'text-red-300 border-red-500/30 bg-red-950/30'
    default:
      return 'text-slate-300 border-dc-border bg-dc-elevated-muted'
  }
}

export default function EckePublishStub({
  scopeLabel,
  scopeType,
  scopeSlug,
  organizerSettingsHref,
  settingsLinkLabel = 'Edit publishing settings',
  variant = 'default',
}: Props) {
  const [data, setData] = useState<PublishResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadAttempted, setLoadAttempted] = useState(false)
  const [loadOk, setLoadOk] = useState(false)
  const [previewBusy, setPreviewBusy] = useState(false)
  const [publishBusy, setPublishBusy] = useState(false)
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)
  const [previewMessageKind, setPreviewMessageKind] = useState<'success' | 'error' | null>(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [includeEcke, setIncludeEcke] = useState(false)

  const apiBase =
    scopeType && scopeSlug ?
      scopeType === 'organization' ?
        `/api/v1/organizer/ecke-publish/organizations/${encodeURIComponent(scopeSlug)}`
      : scopeType === 'convention' ?
        `/api/v1/organizer/ecke-publish/conventions/${encodeURIComponent(scopeSlug)}`
      : `/api/v1/organizer/ecke-publish/groups/${encodeURIComponent(scopeSlug)}`
    : null

  const loadStatus = useCallback(async () => {
    if (!apiBase) return
    setLoadError(null)
    setLoadOk(false)
    try {
      const r = await fetch(apiBase, { credentials: 'include' })
      if (!r.ok) {
        setLoadError(r.status === 403 ? 'You need moderator access to view publish status.' : 'Could not load ECKE publish status.')
        return
      }
      setData((await r.json()) as PublishResponse)
      setLoadOk(true)
    } catch {
      setLoadError('Network error loading publish status.')
    } finally {
      setLoadAttempted(true)
    }
  }, [apiBase])

  useEffect(() => {
    if (apiBase) void loadStatus()
  }, [apiBase, loadStatus])

  useEffect(() => {
    if (!previewMessage || previewMessageKind !== 'success') return
    const timer = window.setTimeout(() => {
      setPreviewMessage(null)
      setPreviewMessageKind(null)
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [previewMessage, previewMessageKind])

  const runPreview = async () => {
    if (!apiBase) return
    setPreviewBusy(true)
    setPreviewMessage(null)
    setPreviewMessageKind(null)
    try {
      const r = await fetch(`${apiBase}/preview`, { method: 'POST', credentials: 'include' })
      if (!r.ok) {
        setPreviewMessage('Preview failed. Check your program and try again.')
        setPreviewMessageKind('error')
        return
      }
      const j = (await r.json()) as PublishResponse
      setData(j)
      setPreviewMessage('Preview saved. Outbound public listing ships when the publish bridge is connected.')
      setPreviewMessageKind('success')
    } catch {
      setPreviewMessage('Network error running preview.')
      setPreviewMessageKind('error')
    } finally {
      setPreviewBusy(false)
    }
  }

  const runPublish = async (withEcke: boolean) => {
    if (!apiBase) return
    setPublishBusy(true)
    setPreviewMessage(null)
    setPreviewMessageKind(null)
    try {
      if (scopeType === 'organization' && !withEcke) {
        setPreviewMessage(
          'Organization listings on East Coast Kink Events require the ECKE option above. For Kink Social hub visibility only, use Settings → Content.',
        )
        setPreviewMessageKind('error')
        setPublishDialogOpen(false)
        return
      }
      if (scopeType === 'convention' && scopeSlug) {
        await patchConventionOrganizerSettings(scopeSlug, {
          settings: { publicProgramListing: true, dancecardPublishStatus: 'published' },
        })
      }
      let publishTargets: Array<PublishTarget & { ok?: boolean; error?: string }> | undefined
      if (withEcke) {
        if (!data?.bridgeConnected) {
          setPreviewMessage(
            scopeType === 'convention' ?
              'Listed on Kink Social. East Coast Kink Events sync is not enabled on this server yet.'
            : 'East Coast Kink Events publish bridge is not connected on this server yet.',
          )
          setPreviewMessageKind('error')
          setPublishDialogOpen(false)
          return
        }
        const r = await fetch(`${apiBase}/publish`, { method: 'POST', credentials: 'include' })
        type PublishTargetResult = PublishTarget & { ok?: boolean; error?: string }
        type PublishApiResponse = Omit<PublishResponse, 'targets'> & {
          error?: string
          targets?: PublishTargetResult[]
        }
        const j = (await r.json()) as PublishApiResponse
        if (!r.ok) {
          setPreviewMessage(j.error ?? 'East Coast Kink Events publish failed.')
          setPreviewMessageKind('error')
          return
        }
        const publishFailure = getEckePublishFailureMessage(j.targets)
        if (publishFailure) {
          setPreviewMessage(publishFailure)
          setPreviewMessageKind('error')
          return
        }
        publishTargets = j.targets
        setData({
          scope: j.scope,
          bridgeConnected: j.bridgeConnected,
          targets: (j.targets ?? []).map(({ ok: _ok, error: _err, ...t }) => t),
        })
      }
      setPreviewMessage(
        withEcke ?
          eckePublishHadListingWebhookSkip(publishTargets) ?
            `${scopeLabel} is live on East Coast Kink Events (event + Dancecard). The legacy directory listing webhook is not configured on this server.`
          : `${scopeLabel} is now public${scopeType === 'convention' ? '' : ' on Kink Social'} and listed on East Coast Kink Events.`
        : `${scopeLabel} is now listed for the public to see.`,
      )
      setPreviewMessageKind('success')
      setPublishDialogOpen(false)
    } catch {
      setPreviewMessage('Network error during publish.')
      setPreviewMessageKind('error')
    } finally {
      setPublishBusy(false)
    }
  }

  const shellClass =
    variant === 'settings' ?
      'rounded-2xl border border-dc-border bg-dc-elevated-solid p-5 space-y-4 shadow-[var(--dc-shadow-soft)]'
    : 'rounded-2xl border border-teal-500/25 bg-teal-950/20 p-5 space-y-4'

  return (
    <section className={shellClass}>
      {variant === 'default' ?
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-300/90">East Coast Kink Events listing</p>
          <p className="mt-1 text-sm text-dc-text-muted">
            Optionally list {scopeLabel} on East Coast Kink Events. Our Google-searchable public directory. In addition to
            the Kink Social public {scopeType === 'convention' ? 'convention' : scopeType === 'group' ? 'group' : 'organization'} page.
          </p>
        </div>
      : (
        <div>
          <h4 className="text-sm font-semibold text-dc-text">Publishing status</h4>
          <p className="mt-1 text-sm text-dc-text-muted">
            Build a preview, review it, then publish when your listing is ready for East Coast Kink Events.
          </p>
        </div>
      )}

      {scopeType === 'convention' && scopeSlug ?
        <ConventionListingDetailsEditor slug={scopeSlug} />
      : null}

      {loadError ?
        <div
          className="mb-4 rounded-xl border border-red-500/30 bg-red-950/25 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadStatus()}
              className="min-h-10 shrink-0 rounded-xl border border-dc-border px-3 text-sm text-dc-text hover:bg-dc-elevated-muted"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setLoadError(null)}
              className="min-h-10 shrink-0 rounded-xl border border-dc-border px-3 text-sm text-dc-text hover:bg-dc-elevated-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
      : null}

      {!apiBase ?
        <p className="text-xs text-amber-200/80 rounded-lg border border-amber-500/20 bg-amber-950/30 px-3 py-2">
          Wire <code className="font-mono">scopeType</code> and <code className="font-mono">scopeSlug</code> to load
          publish status.
        </p>
      : null}

      {apiBase && data ?
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`rounded-full border px-2.5 py-1 ${data.bridgeConnected ? 'text-emerald-300 border-emerald-500/30' : 'text-amber-200 border-amber-500/30'}`}
            >
              {data.bridgeConnected ? 'Publish bridge connected' : 'Publish bridge: preview only'}
            </span>
          </div>

          <ul className="space-y-2">
            {data.targets.map((t) => (
              <li
                key={t.targetKind}
                className={`rounded-xl border px-4 py-3 text-sm ${statusTone(t.status)}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{TARGET_LABELS[t.targetKind]}</span>
                  <span className="text-xs uppercase tracking-wide">{STATUS_LABELS[t.status]}</span>
                </div>
                <p className="mt-1 text-xs opacity-90">
                  Slug: <code className="font-mono">{t.externalSlug}</code>
                  {t.slotCount != null ? ` · ${t.slotCount} program slots` : null}
                  {t.staffShiftCount != null && t.staffShiftCount > 0 ?
                    ` · ${t.staffShiftCount} staff shift${t.staffShiftCount === 1 ? '' : 's'}`
                  : null}
                </p>
                {t.lastPreviewAt ?
                  <p className="mt-1 text-xs opacity-75">Last preview: {new Date(t.lastPreviewAt).toLocaleString()}</p>
                : null}
                {t.lastError ?
                  <p className="mt-1 text-xs text-red-200">{t.lastError}</p>
                : null}
              </li>
            ))}
          </ul>
        </div>
      : loadAttempted && !loadError && !loadOk && apiBase ?
        <div className="rounded-xl border border-dc-border bg-dc-elevated/80 px-4 py-3 text-sm text-dc-muted">
          <p>ECKE publish status unavailable.</p>
          <button
            type="button"
            onClick={() => void loadStatus()}
            className="mt-2 min-h-10 rounded-xl border border-dc-border px-3 text-sm text-dc-text hover:bg-dc-elevated-muted"
          >
            Retry
          </button>
        </div>
      : !loadAttempted && apiBase ?
        <div className="h-20 animate-pulse rounded-xl bg-dc-elevated-muted" aria-busy="true" />
      : null}

      {apiBase ?
        <div className="space-y-3">
          <ol className="flex flex-wrap gap-2 text-xs text-dc-muted" aria-hidden>
            <li className="rounded-full border border-dc-border px-2.5 py-1">1. Preview</li>
            <li className="rounded-full border border-dc-border px-2.5 py-1">2. Publish</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runPreview()}
              disabled={previewBusy || publishBusy || !!loadError}
              className="inline-flex min-h-11 items-center rounded-xl border border-dc-border px-4 text-sm font-medium text-dc-text hover:border-dc-accent-border/40 disabled:opacity-50"
            >
              {previewBusy ? 'Building preview…' : '1. Build publish preview'}
            </button>
            <button
              type="button"
              onClick={() => setPublishDialogOpen(true)}
              disabled={publishBusy || previewBusy || !!loadError}
              className="inline-flex min-h-11 items-center rounded-xl bg-dc-accent px-4 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
            >
              {publishBusy ? 'Publishing…' : '2. Publish'}
            </button>
            {organizerSettingsHref && variant !== 'settings' ?
              <Link
                to={organizerSettingsHref}
                className="inline-flex min-h-11 items-center rounded-xl border border-dc-border px-4 text-sm text-dc-text-muted hover:text-dc-text"
              >
                {settingsLinkLabel}
              </Link>
            : null}
          </div>
          {variant === 'settings' && data?.targets.some((t) => t.status === 'never') ?
            <p className="text-xs text-amber-200/80">
              Publishing is connected, but this listing has not been previewed yet. Build a preview before you publish.
            </p>
          : null}
        </div>
      : null}

      {previewMessage ?
        <div
          className={`rounded-xl border px-3 py-2 text-sm ${
            previewMessageKind === 'error' ?
              'border-red-500/30 bg-red-950/25 text-red-200'
            : 'border-emerald-500/30 bg-emerald-950/30 text-emerald-100'
          }`}
          role={previewMessageKind === 'error' ? 'alert' : 'status'}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1 text-xs sm:text-sm">{previewMessage}</p>
            <button
              type="button"
              onClick={() => {
                setPreviewMessage(null)
                setPreviewMessageKind(null)
              }}
              className="min-h-10 shrink-0 rounded-xl border border-dc-border px-3 text-sm text-dc-text hover:bg-dc-elevated-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
      : null}

      {!apiBase || !data?.bridgeConnected ?
        <p className="text-xs text-amber-200/80 rounded-lg border border-amber-500/20 bg-amber-950/30 px-3 py-2">
          {apiBase && !data?.bridgeConnected ?
            <>East Coast Kink Events outbound sync is preview-only until the publish bridge is enabled. You can still publish publicly on Kink Social; check the box when the bridge is live to list on eastcoastkinkevents.com.</>
          : null}
        </p>
      : null}

      <OrganizerPublishConfirmDialog
        open={publishDialogOpen}
        title={
          scopeType === 'convention' ? 'Publish convention?'
          : scopeType === 'group' ? 'Publish group?'
          : 'Publish organization?'
        }
        itemLabel={scopeLabel}
        itemKind={scopeType ?? 'convention'}
        includeEcke={includeEcke}
        onIncludeEckeChange={setIncludeEcke}
        busy={publishBusy}
        onConfirm={() => void runPublish(includeEcke)}
        onCancel={() => {
          if (!publishBusy) setPublishDialogOpen(false)
        }}
      />
    </section>
  )
}
