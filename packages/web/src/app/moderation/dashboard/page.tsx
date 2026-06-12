import { Link, useOutletContext } from 'react-router-dom'
import {
  MODERATION_QUEUES,
  MODERATION_QUEUE_VALUES,
  POLICY_REASON_LABELS,
  POLICY_SEVERITIES,
  POLICY_SEVERITY_VALUES,
  type PolicyReason,
} from '@c2k/shared'
import { useApiModerationTsDashboard } from '@/hooks/useApiModerationTs'
import { useApiPlatformStaff } from '@/hooks/useApiPlatformStaff'
import {
  defaultModerationOutletContext,
  type ModerationOutletContext,
} from '@/lib/moderation/moderation-outlet-context'

const QUEUE_LABELS: Record<string, string> = {
  GENERAL_REVIEW: 'General review',
  MEDIA_REVIEW: 'Media review',
  NCII_URGENT: 'NCII urgent',
  MINOR_SAFETY_RESTRICTED: 'Minor safety (restricted)',
  SPAM_ABUSE: 'Spam & abuse',
  APPEALS: 'Appeals',
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'border-red-500/40 bg-red-500/10 text-red-200',
  HIGH: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  MEDIUM: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100',
  LOW: 'border-dc-border bg-dc-elevated-muted text-dc-muted',
}

function labelQueue(queue: string): string {
  return QUEUE_LABELS[queue] ?? queue.replace(/_/g, ' ').toLowerCase()
}

function labelReason(reason: string): string {
  return POLICY_REASON_LABELS[reason as PolicyReason] ?? reason.replace(/_/g, ' ').toLowerCase()
}

function labelStatus(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase()
}

export default function ModerationDashboardPage() {
  const { moderationRefreshKey } = useOutletContext<ModerationOutletContext>() ?? defaultModerationOutletContext
  const { status, data, error, reload } = useApiModerationTsDashboard(true, moderationRefreshKey)
  const { staff } = useApiPlatformStaff(true)

  const visibleQueues = MODERATION_QUEUE_VALUES.filter(
    (queue) =>
      queue !== MODERATION_QUEUES.minorSafetyRestricted || staff?.siteAdmin || data?.canViewRestrictedQueue
  )

  const isEmpty =
    data &&
    data.openCases === 0 &&
    data.openQueueItems === 0 &&
    Object.values(data.bySeverity).every((n) => n === 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-dc-text">T&amp;S dashboard</h2>
          <p className="text-sm text-dc-muted mt-1">
            Queue and severity counts for cases awaiting review (open, triaged, or escalated).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          className="hidden min-h-10 rounded-xl border border-dc-border px-4 text-sm text-dc-text hover:bg-dc-elevated-muted sm:inline-flex"
        >
          Refresh
        </button>
      </div>

      {status === 'loading' ?
        <p className="text-sm text-dc-muted">Loading dashboard…</p>
      : null}
      {error ?
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 space-y-2" role="alert">
          <p className="text-sm text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="text-sm font-medium text-dc-accent hover:underline"
          >
            Retry
          </button>
        </div>
      : null}

      {status === 'ready' && data ?
        <>
          {(data.nciiUrgentCount ?? 0) > 0 ?
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <strong>{data.nciiUrgentCount}</strong> open NCII-urgent case
              {(data.nciiUrgentCount ?? 0) === 1 ? '' : 's'} -{' '}
              <Link
                to={`/moderation/cases?queue=${encodeURIComponent(MODERATION_QUEUES.nciiUrgent)}`}
                className="text-dc-accent hover:underline"
              >
                review now
              </Link>
            </div>
          : null}

          {staff?.siteAdmin && (data.minorSafetyRestrictedCount ?? 0) > 0 ?
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <strong>{data.minorSafetyRestrictedCount}</strong> minor-safety restricted case
              {(data.minorSafetyRestrictedCount ?? 0) === 1 ? '' : 's'} (site admin only) -{' '}
              <Link
                to={`/moderation/cases?queue=${encodeURIComponent(MODERATION_QUEUES.minorSafetyRestricted)}`}
                className="text-dc-accent hover:underline"
              >
                open queue
              </Link>
            </div>
          : null}

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-3 sm:p-4">
              <p className="text-[10px] text-dc-muted uppercase tracking-wide sm:text-xs">Open cases</p>
              <p className="mt-1 text-xl font-bold text-dc-text sm:text-2xl">{data.openCases}</p>
              <Link to="/moderation/cases" className="mt-2 inline-block text-xs text-dc-accent hover:underline">
                View all cases
              </Link>
            </div>
            <div className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-3 sm:p-4">
              <p className="text-[10px] text-dc-muted uppercase tracking-wide sm:text-xs">Queue items</p>
              <p className="mt-1 text-xl font-bold text-dc-text sm:text-2xl">{data.openQueueItems}</p>
              <Link to="/moderation/queues" className="mt-2 inline-block text-xs text-dc-accent hover:underline">
                Open queues
              </Link>
            </div>
            <div className="rounded-2xl border border-dc-border bg-dc-elevated/60 p-3 text-xs text-dc-muted sm:p-4 sm:text-sm">
              <p>Human-in-the-loop only. Snapshots stay blurred until you explicitly reveal on a case.</p>
            </div>
          </div>

          {isEmpty ?
            <div className="rounded-xl border border-dashed border-dc-border px-4 py-10 text-center space-y-2">
              <p className="text-sm text-dc-text">No open moderation cases</p>
              <p className="text-xs text-dc-muted max-w-md mx-auto">
                When members report content, cases appear here with queue routing. Seed demo data with{' '}
                <code className="text-[11px] bg-dc-elevated-muted px-1 py-0.5 rounded">db:seed</code> or file a
                test report from a non-admin account.
              </p>
            </div>
          : null}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-dc-text">By severity</h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {POLICY_SEVERITY_VALUES.map((severity) => {
                const count = data.bySeverity[severity] ?? 0
                return (
                  <Link
                    key={severity}
                    to={`/moderation/cases?severity=${encodeURIComponent(severity)}`}
                    className={[
                      'rounded-xl border px-4 py-3 transition-colors hover:opacity-90',
                      SEVERITY_STYLES[severity] ?? 'border-dc-border bg-dc-elevated-muted text-dc-text',
                    ].join(' ')}
                  >
                    <p className="text-xs font-medium uppercase">{severity}</p>
                    <p className="mt-1 text-xl font-bold">{count}</p>
                  </Link>
                )
              })}
            </div>
            {data.bySeverity[POLICY_SEVERITIES.critical] ?
              <p className="text-xs text-amber-200/90">
                Critical cases may include P0 policy reasons. Prioritize NCII and minor-safety queues.
              </p>
            : null}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-dc-text">By queue</h3>
            <ul className="space-y-2">
              {visibleQueues.map((queue) => {
                const count = data.byQueue[queue] ?? 0
                return (
                  <li key={queue}>
                    <Link
                      to={`/moderation/queues?queue=${encodeURIComponent(queue)}`}
                      className="flex items-center justify-between rounded-xl border border-dc-border bg-dc-elevated/95 px-4 py-3 text-sm hover:bg-dc-elevated-muted"
                    >
                      <span className="text-dc-text">{labelQueue(queue)}</span>
                      <span className="min-w-[1.5rem] rounded-full bg-dc-accent/15 px-2 py-0.5 text-center text-xs font-semibold text-dc-accent">
                        {count}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>

          {data.recentCases && data.recentCases.length > 0 ?
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-dc-text">Recent cases</h3>
                <Link to="/moderation/cases" className="text-xs text-dc-accent hover:underline">
                  View all
                </Link>
              </div>
              <ul className="space-y-2">
                {data.recentCases.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/moderation/cases/${encodeURIComponent(c.id)}`}
                      className="block rounded-xl border border-dc-border bg-dc-elevated/95 px-4 py-3 text-sm hover:bg-dc-elevated-muted"
                    >
                      <p className="font-medium text-dc-text">{labelReason(c.policyReason)}</p>
                      <p className="text-xs text-dc-muted mt-0.5">
                        {labelQueue(c.queue)} · {c.severity} · {labelStatus(c.status)} ·{' '}
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          : null}
        </>
      : null}
    </div>
  )
}
