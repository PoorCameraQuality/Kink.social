import { Link } from 'react-router-dom'

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">
      <h3 className="mb-3 text-sm font-semibold text-dc-text">{title}</h3>
      {children}
    </div>
  )
}

export default function ActivityRightRail() {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24" aria-label="Activity shortcuts">
      <RailCard title="Notification settings">
        <p className="text-xs leading-relaxed text-dc-text-muted">
          Choose which alerts you receive by email and in-app.
        </p>
        <Link to="/settings/notifications" className="mt-3 inline-block text-xs font-medium text-dc-accent hover:underline">
          Open settings
        </Link>
      </RailCard>

      <RailCard title="Message safety">
        <p className="text-xs leading-relaxed text-dc-text-muted">
          Block, report, or review message requests from your inbox.
        </p>
        <Link to="/messaging" className="mt-3 inline-block text-xs font-medium text-dc-accent hover:underline">
          Go to Messages
        </Link>
      </RailCard>

      <RailCard title="Connection requests">
        <p className="text-xs leading-relaxed text-dc-text-muted">
          Accept or decline pending requests on your Connections page.
        </p>
        <Link
          to="/connections?tab=requests"
          className="mt-3 inline-block text-xs font-medium text-dc-accent hover:underline"
        >
          View requests
        </Link>
      </RailCard>
    </aside>
  )
}
