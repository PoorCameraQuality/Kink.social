import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import HomeFeedSuggestedPerson from '@/components/home/HomeFeedSuggestedPerson'
import RailCard from '@/components/ui/RailCard'

type Suggestion = {
  userId?: string | number
  username: string
  displayName?: string | null
  subtitle?: string | null
  avatarUrl?: string | null
}

type UpcomingItem = { id: string; title: string; href: string; meta?: string }

type Props = {
  suggestions: Suggestion[]
  upcomingNearYou?: UpcomingItem[]
  trendingEvents?: { id: string; title: string; href: string; mentions?: string }[]
  spotlight?: { username: string; bio: string; href: string; role?: string }
}

function EmptyHint({ message }: { message: string }) {
  return <p className="text-xs leading-relaxed text-dc-muted">{message}</p>
}

function RailGroup({
  label,
  helper,
  children,
}: {
  label: string
  helper: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3" aria-label={label}>
      <div className="hidden lg:block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-dc-muted">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-dc-text-muted">{helper}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export default function HomeFeedDiscoverRail({
  suggestions,
  upcomingNearYou = [],
  trendingEvents = [],
  spotlight,
}: Props) {
  const peopleList = suggestions.slice(0, 4)

  return (
    <aside className="dc-rail-aside sticky top-[7.5rem] space-y-6" aria-label="Discovery">
      <RailGroup label="Plan your week" helper="Events and gatherings based on your area and RSVPs.">
        <RailCard title="Upcoming near you" footerHref="/events" footerLabel="See all →">
          <p className="mb-2.5 text-xs leading-relaxed text-dc-muted">
            From events near your saved location — not paid placements.
          </p>
          {upcomingNearYou.length > 0 ?
            <ul className="space-y-2.5">
              {upcomingNearYou.slice(0, 4).map((e) => (
                <li key={e.id}>
                  <Link to={e.href} className="block rounded-lg p-1 hover:bg-dc-elevated-hover">
                    <span className="block text-sm font-medium text-dc-text hover:text-dc-accent">{e.title}</span>
                    {e.meta ? <span className="mt-0.5 block text-xs text-dc-muted">{e.meta}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          : <EmptyHint message="No events near you yet. Browse events to RSVP." />}
        </RailCard>
      </RailGroup>

      <RailGroup label="Grow your network" helper="People and profiles surfaced from your area and activity.">
        <RailCard title="People you may know" footerHref="/people" footerLabel="See all →">
          <p className="mb-2.5 text-xs leading-relaxed text-dc-muted">
            Suggested from shared communities and geography — dismiss anyone you are not interested in.
          </p>
          {peopleList.length > 0 ?
            <div className="space-y-2">
              {peopleList.map((p) => (
                <HomeFeedSuggestedPerson
                  key={p.username}
                  userId={p.userId}
                  username={p.username}
                  displayName={p.displayName}
                  subtitle={p.subtitle}
                  avatarUrl={p.avatarUrl}
                />
              ))}
            </div>
          : <EmptyHint message="No suggestions yet. Complete your profile or explore people." />}
        </RailCard>

        {spotlight ?
          <RailCard title="Community spotlight">
            <p className="mb-2 text-xs leading-relaxed text-dc-muted">
              A member profile highlighted for community contribution — not an ad.
            </p>
            <p className="text-sm font-semibold text-dc-text">@{spotlight.username}</p>
            {spotlight.role ?
              <p className="mt-0.5 text-xs font-medium text-dc-accent">{spotlight.role}</p>
            : null}
            <p className="mt-1 text-xs leading-relaxed text-dc-text-muted">{spotlight.bio}</p>
            <Link
              to={spotlight.href}
              className="mt-3 inline-flex min-h-9 items-center rounded-lg border border-dc-accent-border px-3 text-xs font-semibold text-dc-accent hover:bg-dc-accent-muted"
            >
              View profile
            </Link>
          </RailCard>
        : null}
      </RailGroup>

      <RailGroup label="See what is active" helper="Conversations and events gaining traction in the community.">
        <RailCard title="Trending in the community" footerHref="/home?mode=discover&tab=Trending" footerLabel="See all →">
          <p className="mb-2.5 text-xs leading-relaxed text-dc-muted">
            Posts and events with recent engagement — open the Trending tab for the full list.
          </p>
          {trendingEvents.length > 0 ?
            <ul className="space-y-2.5">
              {trendingEvents.map((e) => (
                <li key={e.id} className="flex gap-2">
                  <span className="mt-0.5 text-dc-muted" aria-hidden>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" d="M4 18l4-6 4 3 4-9 4 12" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <Link to={e.href} className="block text-sm font-medium text-dc-text hover:text-dc-accent">
                      {e.title}
                    </Link>
                    {e.mentions ? <span className="text-xs text-dc-muted">{e.mentions}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          : <EmptyHint message="No trending activity yet." />}
        </RailCard>
      </RailGroup>
    </aside>
  )
}
