import { Link } from 'react-router-dom'

export default function MyPostsEmptyPanel() {
  return (
    <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid px-6 py-12 text-center shadow-[var(--dc-shadow-soft)]">
      <h2 className="text-lg font-semibold text-dc-text">You have not posted yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dc-text-muted">
        Share an update, write an article, or create an event to start contributing to the community.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/home?mode=discover&tab=Local#home-feed-composer"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-dc-accent px-5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover sm:w-auto"
        >
          Create post
        </Link>
        <Link
          to="/education/write"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-dc-border px-5 text-sm font-semibold text-dc-text-muted hover:border-dc-accent-border hover:text-dc-text sm:w-auto"
        >
          Write article
        </Link>
      </div>
      <Link
        to="/events?create=event"
        className="mt-4 inline-block text-sm font-medium text-dc-accent hover:underline"
      >
        Create event
      </Link>
    </div>
  )
}
