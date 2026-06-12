import { Link } from 'react-router-dom'
import { demoMockImageUrl } from '@/data/mock-data'
import { EVENT_CATEGORY_VALUES } from '@c2k/shared'
import type { MockEvent } from '@/data/types'
import { countEventsByCategory } from '@/lib/events-page-utils'

const LOCATION_COUNTS = [
  { city: 'Philadelphia, PA', count: 46 },
  { city: 'New York, NY', count: 38 },
  { city: 'Baltimore, MD', count: 29 },
  { city: 'Pittsburgh, PA', count: 22 },
  { city: 'Washington, DC', count: 19 },
]

type Props = {
  allEvents: MockEvent[]
  suggested: MockEvent[]
}

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">
      <h3 className="mb-3 text-sm font-semibold text-dc-text">{title}</h3>
      {children}
    </div>
  )
}

export default function EventsRightRail({ allEvents, suggested }: Props) {
  const categoryCounts = countEventsByCategory(allEvents)
  const picks = suggested.length > 0 ? suggested.slice(0, 3) : allEvents.slice(3, 6)

  return (
    <aside className="sticky top-24 space-y-4" aria-label="Events discovery">
      <RailCard title="Host an event">
        <p className="text-2xl" aria-hidden>
          🎉
        </p>
        <p className="mt-2 text-xs leading-relaxed text-dc-text-muted">
          Bring your community together. Use <strong className="font-medium text-dc-text">+ Create</strong> in the
          header to publish a munch, class, or convention.
        </p>
      </RailCard>

      <RailCard title="Suggested for you">
        <ul className="space-y-3">
          {picks.map((ev) => {
            const img = ev.imageUrl ?? demoMockImageUrl(`sug-${ev.id}`, 80, 80)
            return (
              <li key={String(ev.id)}>
                <Link to={`/events/${ev.id}`} className="flex gap-2 rounded-lg p-1 hover:bg-dc-elevated-hover">
                  <img src={img} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-dc-text line-clamp-2">{ev.title}</span>
                    <span className="text-xs text-dc-muted">
                      {(ev.mutualGoingCount ?? 0) > 0 ? `${ev.mutualGoingCount} friends going` : `${ev.rsvpCount} going`}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </RailCard>

      <RailCard title="Browse by category">
        <ul className="space-y-2 text-sm">
          {EVENT_CATEGORY_VALUES.slice(0, 6).map((cat) => (
            <li key={cat} className="flex items-center justify-between gap-2 text-dc-text-muted">
              <span>{cat}</span>
              <span className="tabular-nums text-dc-muted">{categoryCounts.get(cat) ?? 0}</span>
            </li>
          ))}
        </ul>
      </RailCard>

      <RailCard title="Popular locations">
        <ul className="space-y-2 text-sm">
          {LOCATION_COUNTS.map((row) => (
            <li key={row.city} className="flex items-center justify-between gap-2">
              <span className="text-dc-text-muted">{row.city}</span>
              <span className="shrink-0 text-xs text-dc-muted">{row.count} events</span>
            </li>
          ))}
        </ul>
      </RailCard>

      <div className="rounded-2xl border border-dc-accent-border/60 bg-dc-accent-muted/30 p-4">
        <p className="text-lg" aria-hidden>
          👑
        </p>
        <p className="mt-1 text-sm font-semibold text-dc-accent">Get more with Kink Social+</p>
        <p className="mt-1 text-xs text-dc-text-muted">Visibility, analytics, and organizer tools.</p>
        <Link
          to="/settings"
          className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-dc-accent px-3 text-xs font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
        >
          Learn more
        </Link>
      </div>
    </aside>
  )
}
