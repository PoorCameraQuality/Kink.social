import { Link } from 'react-router-dom'
import type { GraphStatus } from '@/hooks/useGraphStatus'

type ConnectNotice = { kind: 'success' | 'error'; text: string } | null

type Props = {
  username: string
  viewerUsername: string | null
  apiBacked: boolean
  graphStatus: GraphStatus | null
  connectBusy: boolean
  graphBusy: boolean
  connectNotice: ConnectNotice
  isAuthenticated: boolean
  onConnect: () => void
  onToggleFollow: () => void
  onDismissConnectNotice: () => void
  mutualConnectionsCount?: number | null
}

export default function ProfileViewerActions({
  username,
  viewerUsername,
  apiBacked,
  graphStatus,
  connectBusy,
  graphBusy,
  connectNotice,
  isAuthenticated: _isAuthenticated,
  onConnect,
  onToggleFollow,
  onDismissConnectNotice,
  mutualConnectionsCount,
}: Props) {
  const isSelf = username === viewerUsername

  if (isSelf) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          to="/profile"
          className="min-h-11 inline-flex items-center px-4 py-2 bg-dc-accent hover:bg-dc-accent-hover text-dc-accent-foreground text-sm font-medium rounded-xl"
        >
          Your dashboard
        </Link>
        <Link
          to="/profile/edit"
          className="min-h-11 inline-flex items-center px-4 py-2 bg-dc-elevated-solid hover:bg-dc-elevated-muted text-dc-text text-sm font-medium rounded-xl border border-dc-border"
        >
          Edit profile
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {apiBacked ?
          <>
            {graphStatus?.connectionStatus === 'connected' ?
              <span className="inline-flex min-h-11 items-center px-4 py-2 text-sm font-medium text-emerald-400 rounded-xl border border-emerald-500/30">
                Connected
              </span>
            : graphStatus?.connectionStatus === 'pending_outgoing' ?
              <span className="inline-flex min-h-11 items-center px-4 py-2 text-sm text-dc-muted rounded-xl border border-dc-border">
                Request sent
              </span>
            : graphStatus?.connectionStatus === 'pending_incoming' ?
              <Link
                to="/connections?tab=requests"
                className="inline-flex min-h-11 items-center justify-center px-4 py-2 bg-dc-accent text-dc-accent-foreground text-sm font-medium rounded-xl"
              >
                Respond to request
              </Link>
            : (
              <button
                type="button"
                disabled={connectBusy}
                onClick={onConnect}
                className="inline-flex min-h-11 items-center justify-center px-4 py-2 bg-dc-accent hover:bg-dc-accent-hover text-dc-accent-foreground text-sm font-medium rounded-xl disabled:opacity-50"
              >
                {connectBusy ? 'Sending…' : 'Connect'}
              </button>
            )}
            <button
              type="button"
              disabled={graphBusy}
              onClick={onToggleFollow}
              className="inline-flex min-h-11 items-center justify-center px-4 py-2 bg-dc-elevated-solid hover:bg-dc-elevated-muted text-dc-text text-sm font-medium rounded-xl border border-dc-border disabled:opacity-50"
            >
              {graphBusy ? '…' : graphStatus?.isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          </>
        : (
          <Link
            to="/people"
            className="inline-flex items-center justify-center px-4 py-2 min-h-11 bg-dc-accent hover:bg-dc-accent-hover text-dc-accent-foreground text-sm font-medium rounded-xl"
          >
            Find on Kink Social
          </Link>
        )}
        <Link
          to={`/messaging?user=${encodeURIComponent(username)}`}
          className="inline-flex items-center justify-center px-4 py-2 min-h-11 bg-dc-elevated-solid hover:bg-dc-elevated-muted text-dc-text text-sm font-medium rounded-xl border border-dc-border"
        >
          Message
        </Link>
      </div>

      {mutualConnectionsCount != null &&
      mutualConnectionsCount > 0 &&
      graphStatus?.connectionStatus === 'connected' ?
        <p className="text-xs text-dc-muted">
          {mutualConnectionsCount} mutual {mutualConnectionsCount === 1 ? 'connection' : 'connections'}
        </p>
      : null}

      {connectNotice ?
        <div
          className={`rounded-xl border px-3 py-2 text-sm max-w-lg ${
            connectNotice.kind === 'success' ?
              'border-emerald-500/30 bg-emerald-950/30 text-emerald-100'
            : 'border-red-500/30 bg-red-950/25 text-red-200'
          }`}
          role={connectNotice.kind === 'success' ? 'status' : 'alert'}
        >
          <p>{connectNotice.text}</p>
          {connectNotice.kind === 'success' ?
            <Link to="/connections" className="mt-2 inline-block text-sm font-medium text-emerald-200 underline">
              View connections
            </Link>
          : (
            <button
              type="button"
              onClick={onDismissConnectNotice}
              className="mt-2 text-xs underline text-dc-text-muted"
            >
              Dismiss
            </button>
          )}
        </div>
      : null}
    </div>
  )
}
