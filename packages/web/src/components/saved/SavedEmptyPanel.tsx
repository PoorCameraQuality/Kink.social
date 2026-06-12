import { Link } from 'react-router-dom'

export default function SavedEmptyPanel() {
  return (
    <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid px-6 py-12 text-center shadow-[var(--dc-shadow-soft)]">
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center" aria-hidden>
        <span className="absolute -right-1 -top-1 text-lg text-dc-accent/80">✦</span>
        <span className="absolute -bottom-0.5 -left-1 text-sm text-dc-accent/60">✦</span>
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dc-accent-border/40 bg-dc-accent-muted">
          <svg className="h-9 w-9 text-dc-accent" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-4 7 4V5c0-1.1-.9-2-2-2z" />
          </svg>
        </div>
      </div>
      <h2 className="mt-6 text-lg font-semibold text-dc-text">Nothing saved yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dc-text-muted">
        Save events, articles, media, vendors, and posts so you can come back to them later.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/events"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-dc-accent px-5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover sm:w-auto"
        >
          Browse events
        </Link>
        <Link
          to="/education"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-dc-border px-5 text-sm font-semibold text-dc-text-muted hover:border-dc-accent-border hover:text-dc-text sm:w-auto"
        >
          Explore education
        </Link>
      </div>
      <Link to="/media" className="mt-4 inline-block text-sm font-medium text-dc-accent hover:underline">
        Media hub
      </Link>
    </div>
  )
}
