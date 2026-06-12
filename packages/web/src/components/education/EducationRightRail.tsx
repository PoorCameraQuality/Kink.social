import { Link } from 'react-router-dom'

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">
      <h3 className="mb-3 text-sm font-semibold text-dc-text">{title}</h3>
      {children}
    </div>
  )
}

export default function EducationRightRail() {
  return (
    <aside className="sticky top-24 space-y-4" aria-label="Education discovery">
      <RailCard title="Progress &amp; follows">
        <p className="text-xs leading-relaxed text-dc-text-muted">
          Account progress, saved lessons, and educator follows are not wired on this overview yet. Use{' '}
          <Link to="/saved" className="font-medium text-dc-accent hover:underline">
            Saved
          </Link>{' '}
          for bookmarks and browse articles in the center column.
        </p>
      </RailCard>

      <div className="rounded-2xl border border-dc-accent-border/50 bg-dc-accent-muted/25 p-4">
        <p className="text-lg" aria-hidden>
          ✨
        </p>
        <p className="mt-1 text-sm font-semibold text-dc-text">Reputation tip</p>
        <p className="mt-1 text-xs leading-relaxed text-dc-text-muted">
          Thoughtful articles and peer endorsements raise your educator score over time.
        </p>
        <Link to="/guidelines" className="mt-3 inline-flex text-xs font-medium text-dc-accent hover:underline">
          How reputation works
        </Link>
      </div>
    </aside>
  )
}
