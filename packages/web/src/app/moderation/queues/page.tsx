import { useMemo, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { MODERATION_QUEUE_VALUES, POLICY_REASON_LABELS, type PolicyReason } from '@c2k/shared'
import { useApiModerationTsQueues } from '@/hooks/useApiModerationTs'
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

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'closed', label: 'Closed' },
] as const

function labelQueue(queue: string): string {
  return QUEUE_LABELS[queue] ?? queue.replace(/_/g, ' ').toLowerCase()
}

function labelReason(reason: string): string {
  return POLICY_REASON_LABELS[reason as PolicyReason] ?? reason.replace(/_/g, ' ').toLowerCase()
}

function severityBadgeClass(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-200'
    case 'HIGH':
      return 'bg-amber-500/20 text-amber-200'
    case 'MEDIUM':
      return 'bg-yellow-500/15 text-yellow-100'
    default:
      return 'bg-dc-elevated-muted text-dc-muted'
  }
}

export default function ModerationQueuesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { moderationRefreshKey } = useOutletContext<ModerationOutletContext>() ?? defaultModerationOutletContext
  const initialQueue = searchParams.get('queue') ?? ''
  const [queueFilter, setQueueFilter] = useState(initialQueue)
  const [statusFilter, setStatusFilter] = useState('')
  const { staff } = useApiPlatformStaff(true)

  const filters = useMemo(
    () => ({ queue: queueFilter || undefined, status: statusFilter || undefined }),
    [queueFilter, statusFilter]
  )
  const { status, items, error, reload } = useApiModerationTsQueues(true, filters, moderationRefreshKey)

  const onQueueChange = (value: string) => {
    setQueueFilter(value)
    if (value) {
      setSearchParams({ queue: value })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm">
        <Link to="/moderation/dashboard" className="text-dc-accent hover:underline">
          ← T&amp;S dashboard
        </Link>
      </p>
      <div>
        <h2 className="text-lg font-semibold text-dc-text">Moderation queues</h2>
        <p className="text-sm text-dc-muted mt-1">
          Routed inbox items by policy reason. Minor-safety restricted queue requires site admin.
        </p>
        {!staff?.siteAdmin ?
          <p className="text-xs text-dc-muted mt-2">
            Restricted queues are hidden from your role. Contact a site admin for minor-safety cases.
          </p>
        : null}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-xs text-dc-muted">
          Queue
          <select
            value={queueFilter}
            onChange={(e) => onQueueChange(e.target.value)}
            className="mt-1 block min-h-10 rounded-xl border border-dc-border bg-dc-surface-muted px-3 text-sm text-dc-text min-w-[14rem]"
          >
            <option value="">All queues</option>
            {MODERATION_QUEUE_VALUES.map((q) => (
              <option key={q} value={q}>
                {labelQueue(q)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-dc-muted">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 block min-h-10 rounded-xl border border-dc-border bg-dc-surface-muted px-3 text-sm text-dc-text"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void reload()}
          className="min-h-10 px-4 rounded-xl border border-dc-border text-sm text-dc-text hover:bg-dc-elevated-muted"
        >
          Refresh
        </button>
      </div>

      {status === 'loading' ? <p className="text-sm text-dc-muted">Loading queue items…</p> : null}
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
      {status === 'ready' && !items.length ?
        <p className="text-sm text-dc-muted rounded-xl border border-dashed border-dc-border px-4 py-8 text-center">
          No queue items match this filter.
        </p>
      : null}

      {status === 'ready' && items.length > 0 ?
        <ul className="space-y-3">
          {items.map((row) => (
            <li key={row.id} className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-dc-text">{labelQueue(row.queue)}</p>
                  <p className="text-xs text-dc-muted">
                    {row.policyReason ? labelReason(row.policyReason) : 'Policy reason pending'}
                    {row.targetContentType ?
                      ` · ${row.targetContentType}`
                    : null}
                    {' · '}
                    {new Date(row.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={[
                      'text-xs font-medium rounded-lg px-2 py-1',
                      severityBadgeClass(row.severity),
                    ].join(' ')}
                  >
                    {row.severity}
                  </span>
                  <span className="text-xs font-medium rounded-lg border border-dc-border px-2 py-1 text-dc-muted capitalize">
                    {row.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <Link
                  to={`/moderation/cases/${encodeURIComponent(row.caseId)}`}
                  className="text-dc-accent hover:underline font-medium"
                >
                  Open case
                </Link>
                {row.assignedToUsername ?
                  <span className="text-dc-muted">Assigned to {row.assignedToUsername}</span>
                : (
                  <span className="text-dc-muted">Unassigned</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      : null}
    </div>
  )
}
