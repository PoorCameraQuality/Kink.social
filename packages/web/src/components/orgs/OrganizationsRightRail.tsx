import { Link } from 'react-router-dom'
import { useOrganizerOrgScopes } from '@/hooks/useOrganizerOrgScopes'

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">
      <h3 className="mb-3 text-sm font-semibold text-dc-text">{title}</h3>
      {children}
    </div>
  )
}

const CAPABILITY_ITEMS = [
  'Create events and conventions',
  'Manage staff and volunteers',
  'Run groups and announcements',
  'Coordinate vendors and presenters',
  'Build reputation over time',
] as const

export default function OrganizationsRightRail() {
  const { hasAnyScope, loading: scopesLoading } = useOrganizerOrgScopes()

  return (
    <aside className="sticky top-24 space-y-4" aria-label="About organizations on Kink Social">
      <RailCard title="What organizations can do">
        <ul className="space-y-2">
          {CAPABILITY_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs leading-relaxed text-dc-text-muted">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dc-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </RailCard>

      <RailCard title="For organizers">
        <p className="text-xs leading-relaxed text-dc-text-muted">
          Bring your community tools, schedules, staff, and attendee workflows into one place.
        </p>
        <Link
          to="/orgs/new"
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-dc-accent text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
        >
          Create organization
        </Link>
        {!scopesLoading && hasAnyScope ?
          <Link
            to="/organizer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-dc-accent hover:underline"
          >
            Organizer dashboard
            <span aria-hidden>→</span>
          </Link>
        : null}
      </RailCard>

      <div className="rounded-2xl border border-dc-border bg-dc-elevated-muted/40 p-4">
        <h3 className="text-sm font-semibold text-dc-text">Already helping run a community?</h3>
        <p className="mt-2 text-xs leading-relaxed text-dc-text-muted">
          Ask an organization owner to add you as staff so you can help manage events, groups, or convention
          tools.
        </p>
        <Link to="/guidelines" className="mt-2 inline-block text-xs font-medium text-dc-accent hover:underline">
          Learn about roles
        </Link>
      </div>

      <div className="rounded-2xl border border-dc-border bg-dc-elevated-muted/40 p-4">
        <h3 className="text-sm font-semibold text-dc-text">Why reputation matters</h3>
        <p className="mt-2 text-xs leading-relaxed text-dc-text-muted">
          Reviews and consistent real-world participation help communities trust organizers. Higher standing
          improves visibility across events and discovery.
        </p>
        <Link to="/guidelines" className="mt-2 inline-block text-xs font-medium text-dc-accent hover:underline">
          How reputation works
        </Link>
      </div>
    </aside>
  )
}
