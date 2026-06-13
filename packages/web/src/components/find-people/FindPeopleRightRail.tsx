import { Link } from 'react-router-dom'

import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import RailCard from '@/components/ui/RailCard'
import { railAsideClass } from '@/lib/card-surface'

import { mockCoAttendanceSuggestions, mockNearbyPeopleSuggestions } from '@/data/mock-home-surface'

import type { MockPerson } from '@/data/types'

type SuggestRow = {

  userId: string

  username: string

  displayName: string | null

  avatarUrl: string | null

  sharedCount?: number

  mutualCount?: number

}



type Props = {

  suggested: MockPerson[]

  useDemoFallback: boolean

}



function SuggestedRows({ rows }: { rows: SuggestRow[] }) {

  return (

    <ul className="space-y-3">

      {rows.slice(0, 4).map((row) => (

        <li key={row.userId}>

          <div className="flex items-center gap-2">

            <Link to={`/profile/${row.username}`} className="shrink-0">

              {row.avatarUrl ?

                <img src={row.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />

              : <PlaceholderAvatar size="sm" className="!rounded-full" />}

            </Link>

            <div className="min-w-0 flex-1">

              <Link to={`/profile/${row.username}`} className="block truncate text-sm font-medium text-dc-text hover:text-dc-accent">

                {row.displayName ?? row.username}

              </Link>

              <p className="text-xs text-dc-muted">@{row.username}</p>

            </div>

            <Link

              to={`/profile/${row.username}`}

              className="shrink-0 rounded-lg border border-dc-accent-border/60 px-2 py-1 text-[11px] font-semibold text-dc-accent hover:bg-dc-accent-muted"

              aria-label={`Connect with ${row.displayName ?? row.username}`}

            >

              Connect

            </Link>

          </div>

        </li>

      ))}

    </ul>

  )

}



function personToSuggestRow(p: MockPerson): SuggestRow {

  return {

    userId: String(p.id),

    username: p.username,

    displayName: p.sceneName ?? null,

    avatarUrl: p.avatarUrl ?? null,

  }

}



export default function FindPeopleRightRail({ suggested, useDemoFallback }: Props) {

  const coRows: SuggestRow[] = useDemoFallback

    ? mockCoAttendanceSuggestions().map((r) => ({

        userId: r.userId,

        username: r.username,

        displayName: r.displayName,

        avatarUrl: r.avatarUrl ?? null,

        sharedCount: r.sharedCount,

      }))

    : suggested.slice(0, 4).map(personToSuggestRow)



  const nearbyRows: SuggestRow[] = useDemoFallback

    ? mockNearbyPeopleSuggestions().map((r) => ({

        userId: r.userId,

        username: r.username,

        displayName: r.displayName,

        avatarUrl: r.avatarUrl ?? null,

      }))

    : suggested.slice(4, 12).map(personToSuggestRow)

  const mayKnow = suggested.filter((p) => (p.mutualCount ?? 0) > 0).slice(0, 4)



  return (

    <aside className={railAsideClass} aria-label="People discovery suggestions">

      <div className="rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]">

        <div className="flex items-start gap-2">

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dc-accent-muted text-dc-accent" aria-hidden>

            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

              <path

                strokeLinecap="round"

                strokeLinejoin="round"

                strokeWidth={1.75}

                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"

              />

            </svg>

          </span>

          <div>

            <h3 className="text-sm font-semibold text-dc-text">Connection safety</h3>

            <p className="mt-1 text-xs leading-relaxed text-dc-text-muted">

              Only connect with people you trust. You can ignore, block, or report someone anytime.

            </p>

            <Link to="/support" className="mt-2 inline-block text-xs font-medium text-dc-accent hover:underline">

              Safety tips

            </Link>

          </div>

        </div>

      </div>



      <RailCard title="Suggested for you" footerHref="/people" footerLabel="See all →">

        <SuggestedRows rows={coRows} />

      </RailCard>



      <RailCard title="Recently active near you">

        <div className="flex flex-wrap items-center gap-1">

          {nearbyRows.slice(0, 8).map((row) => (

            <Link

              key={row.userId}

              to={`/profile/${row.username}`}

              className="relative"

              title={row.displayName ?? row.username}

            >

              {row.avatarUrl ?

                <img src={row.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-dc-elevated-solid" />

              : <PlaceholderAvatar size="sm" className="!rounded-full ring-2 ring-dc-elevated-solid" />}

            </Link>

          ))}

          {nearbyRows.length > 8 ?

            <span className="ml-1 text-xs font-medium text-dc-accent">+{nearbyRows.length - 8}</span>

          : null}

        </div>

      </RailCard>



      <RailCard title="People you may know" footerHref="/connections" footerLabel="View connections →">

        {mayKnow.length === 0 ?

          <p className="text-xs text-dc-text-muted">Connect at events to see mutual suggestions here.</p>

        : <ul className="space-y-2 text-sm">

            {mayKnow.map((p) => (

              <li key={String(p.id)} className="flex items-center justify-between gap-2">

                <Link to={`/profile/${p.username}`} className="min-w-0 truncate text-dc-text-muted hover:text-dc-text">

                  {p.sceneName ?? p.username}

                  <span className="block text-xs text-dc-muted">{p.mutualCount} mutual</span>

                </Link>

                <Link

                  to={`/profile/${p.username}`}

                  className="shrink-0 text-xs font-semibold text-dc-accent hover:underline"

                >

                  Connect

                </Link>

              </li>

            ))}

          </ul>

        }

      </RailCard>



      <div className="rounded-2xl border border-dc-accent-border/60 bg-dc-accent-muted/30 p-4">

        <p className="text-lg" aria-hidden>

          ✨

        </p>

        <p className="mt-1 text-sm font-semibold text-dc-accent">Expand your circle</p>

        <p className="mt-1 text-xs leading-relaxed text-dc-text-muted">

          Meet educators, organizers, and friends who share your region and community interests.

        </p>

        <Link

          to="/groups"

          className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-dc-accent text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"

        >

          Find your people

        </Link>

      </div>

    </aside>

  )

}


