import { Link } from 'react-router-dom'

export default function ActivityEmptyPanel() {
  return (
    <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid px-6 py-12 text-center shadow-[var(--dc-shadow-soft)]">
      <h2 className="text-lg font-semibold text-dc-text">No activity yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dc-text-muted">
        Messages, notifications, and connection requests will appear here as you use Kink Social.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/people"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-dc-accent px-5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover sm:w-auto"
        >
          Find people
        </Link>
        <Link
          to="/events"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-dc-border px-5 text-sm font-semibold text-dc-text-muted hover:border-dc-accent-border hover:text-dc-text sm:w-auto"
        >
          Browse events
        </Link>
      </div>
    </div>
  )
}
