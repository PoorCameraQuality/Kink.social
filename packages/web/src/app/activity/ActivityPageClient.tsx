import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ActivityEmptyPanel from '@/components/activity/ActivityEmptyPanel'
import ActivityRightRail from '@/components/activity/ActivityRightRail'
import ActivityTabs from '@/components/activity/ActivityTabs'
import type { ActivityTab } from '@/components/activity/activity-ui'
import PersonalUtilityPageShell from '@/components/layout/PersonalUtilityPageShell'
import SavedBackLink from '@/components/saved/SavedBackLink'
import LoadErrorBanner from '@/components/ui/LoadErrorBanner'
import { FeedCardSkeleton } from '@/components/ui/skeleton'
import {
  useApiActivityInbox,
  type ActivityInboxFilter,
  type ActivityInboxItem,
} from '@/hooks/useApiActivityInbox'
import { shortTime } from '@/lib/format-time'
import { ACTIVITY_PAGE_INTRO } from '@/lib/notifications-copy'

function kindLabel(kind: ActivityInboxItem['kind']): string {
  if (kind === 'message') return 'Message'
  if (kind === 'connection_request') return 'Request'
  if (kind === 'notification') return 'Notification'
  return 'Update'
}

export default function ActivityPageClient() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<ActivityTab>('all')
  const apiFilter: ActivityInboxFilter = filter
  const { items, error, loading, reload } = useApiActivityInbox(apiFilter)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const rows = items ?? []
  const isEmpty = !loading && rows.length === 0 && !error

  return (
    <PersonalUtilityPageShell
      showMobileNavToggle
      mobileNavOpen={mobileNavOpen}
      onMobileNavToggle={() => setMobileNavOpen((o) => !o)}
    >
      <div className="mx-auto w-full max-w-[52rem]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <SavedBackLink />

            <header className="mt-4 mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">Activity</h1>
              <p className="mt-2 text-sm leading-relaxed text-dc-text-muted">{ACTIVITY_PAGE_INTRO}</p>
            </header>

            <ActivityTabs active={filter} onChange={setFilter} />

            {error ?
              <LoadErrorBanner className="mb-4" message={error} onRetry={() => void reload()} />
            : null}

            {loading && items === null ?
              <div className="dc-skeleton-stagger space-y-4">
                <FeedCardSkeleton />
                <FeedCardSkeleton />
              </div>
            : isEmpty ?
              <ActivityEmptyPanel />
            : <ul className="space-y-3">
                {rows.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
                        item.unread ?
                          'border-dc-accent-border/40 bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)]'
                        : 'border-dc-border bg-dc-elevated-solid/80 hover:border-dc-accent-border/30'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0 rounded-md bg-dc-elevated-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-dc-muted">
                        {kindLabel(item.kind)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-dc-text">{item.title}</p>
                        {item.body ?
                          <p className="mt-1 line-clamp-2 text-sm text-dc-text-muted">{item.body}</p>
                        : null}
                        <p className="mt-1 text-xs text-dc-muted">{shortTime(item.createdAt)}</p>
                      </div>
                      {item.unread ?
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-dc-accent" aria-label="Unread" />
                      : null}
                    </button>
                  </li>
                ))}
              </ul>
            }

            <div className="mt-8 lg:hidden">
              <ActivityRightRail />
            </div>
          </div>

          <div className="hidden lg:block">
            <ActivityRightRail />
          </div>
        </div>
      </div>
    </PersonalUtilityPageShell>
  )
}
