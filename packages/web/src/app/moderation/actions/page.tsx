import { useState } from 'react'
import { useApiModerationActions } from '@/hooks/useApiModerationActions'
import { useApiPlatformStaff } from '@/hooks/useApiPlatformStaff'

export default function ModerationActionsPage() {
  const { staff } = useApiPlatformStaff(true)
  const { status, items, error, approve, reject, executeNow } = useApiModerationActions(true)
  const [overrideId, setOverrideId] = useState<string | null>(null)
  const [overrideReason, setOverrideReason] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-dc-text">Action approvals</h2>
        <p className="text-sm text-dc-muted mt-1">
          Platform enforcement proposals need two different moderators to approve before they run.
        </p>
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {status === 'loading' ? <p className="text-sm text-dc-muted">Loading…</p> : null}

      {status === 'ready' && items.length === 0 ?
        <p className="text-sm text-dc-muted border border-dashed border-dc-border rounded-xl px-4 py-8 text-center">
          No pending actions.
        </p>
      : null}

      <ul className="space-y-4">
        {items.map((row) => (
          <li key={row.id} className="rounded-2xl border border-dc-border bg-dc-elevated/95 p-4 space-y-3">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium text-dc-text">{row.actionType.replace(/_/g, ' ')}</p>
                <p className="text-xs text-dc-muted">
                  Proposed by {row.proposerUsername} · {new Date(row.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="text-xs rounded-lg border border-dc-border px-2 py-1 text-dc-muted">
                Approvals {row.approvalCount}/{row.requiredApprovals}
              </span>
            </div>
            <p className="text-xs font-mono text-dc-text-muted break-all">
              {row.targetType} / {row.targetId}
            </p>
            {row.overrideReason ?
              <p className="text-xs text-amber-200 border border-amber-500/30 rounded-lg px-3 py-2">
                Rule of two overridden: {row.overrideReason}
              </p>
            : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy === row.id}
                onClick={() => {
                  setBusy(row.id)
                  void approve(row.id).finally(() => setBusy(null))
                }}
                className="px-3 py-1.5 rounded-lg bg-dc-accent text-dc-accent-foreground text-xs font-medium disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy === row.id}
                onClick={() => {
                  setBusy(row.id)
                  void reject(row.id).finally(() => setBusy(null))
                }}
                className="px-3 py-1.5 rounded-lg border border-dc-border text-xs text-dc-text"
              >
                Reject
              </button>
              {staff?.siteAdmin ?
                <button
                  type="button"
                  onClick={() => setOverrideId(overrideId === row.id ? null : row.id)}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-xs text-amber-200"
                >
                  Admin override
                </button>
              : null}
            </div>
            {overrideId === row.id && staff?.siteAdmin ?
              <div className="space-y-2 border-t border-dc-border pt-3">
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Required reason for override (logged permanently)"
                  rows={2}
                  className="w-full rounded-xl border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={!overrideReason.trim() || busy === row.id}
                  onClick={() => {
                    setBusy(row.id)
                    void executeNow(row.id, overrideReason.trim()).finally(() => setBusy(null))
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium disabled:opacity-50"
                >
                  Execute now (override rule of two)
                </button>
              </div>
            : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
