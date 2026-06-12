import { useLocation } from 'react-router-dom'
import EventsSectionNavLinks from '@/components/events/EventsSectionNavLinks'

export default function EventsPersonalNav() {
  const { pathname, search } = useLocation()

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="My events navigation">
      <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-dc-muted">My event life</p>
        <EventsSectionNavLinks pathname={pathname} search={search} />
      </div>
    </aside>
  )
}
