import { Link } from 'react-router-dom'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import TagLink from '@/components/TagLink'
import type { GroupDiscoverCardGroup } from '@/components/groups/GroupDiscoverCard'
import type { GroupDiscoverBadge } from '@/lib/groups-page-utils'
import { groupActivityLabel } from '@/lib/groups-page-utils'

type Props = {
  group: GroupDiscoverCardGroup
  badge?: GroupDiscoverBadge | null
  friendsHere?: number
}

const BADGE_CLASS: Record<GroupDiscoverBadge, string> = {
  Featured: 'bg-dc-accent/20 text-dc-accent',
  Popular: 'bg-amber-500/15 text-amber-300',
  New: 'bg-emerald-500/15 text-emerald-300',
  'Near you': 'bg-sky-500/15 text-sky-300',
}

export default function GroupDiscoverListCard({ group, badge, friendsHere }: Props) {
  const location = group.placeLabel ?? group.location
  const snippet = group.descriptionSnippet ?? group.description
  const isApply = group.joinMode === 'apply'
  const activity = groupActivityLabel(group, badge)
  const purposeLine = [group.category, group.tags?.[0]].filter(Boolean).join(' · ')

  return (
    <article className="rounded-2xl border border-dc-border/80 bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)] transition-colors hover:border-dc-accent-border/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link to={`/groups/${group.id}`} className="relative shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-xl bg-gradient-to-br from-violet-950/60 via-dc-elevated-muted to-amber-950/40 sm:h-24 sm:w-24">
            {group.coverImageUrl ?
              <img src={group.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
            : <div className="flex h-full w-full items-center justify-center text-dc-muted" aria-hidden>
                <svg className="h-10 w-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            }
            {badge ?
              <span
                className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${BADGE_CLASS[badge]}`}
              >
                {badge === 'New' ? 'NEW' : badge}
              </span>
            : null}
          </div>
        </Link>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-dc-text sm:text-lg">
            <Link to={`/groups/${group.id}`} className="hover:text-dc-accent">
              {group.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-dc-muted">
            {group.members.toLocaleString()} member{group.members === 1 ? '' : 's'}
            {friendsHere != null && friendsHere > 0 ?
              <span className="text-dc-accent">
                {' '}
                · {friendsHere} friend{friendsHere === 1 ? '' : 's'} here
              </span>
            : null}
          </p>
          {purposeLine ?
            <p className="mt-1 text-xs font-medium text-dc-text-muted">{purposeLine}</p>
          : null}
          {location ?
            <p className="mt-0.5 text-xs text-dc-muted">
              {location}
              {group.distanceMi != null ? ` · ${group.distanceMi} mi` : null}
            </p>
          : null}
          {snippet ?
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-dc-text-muted">{snippet}</p>
          : null}
          {group.tags && group.tags.length > 0 ?
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group.tags.slice(0, 4).map((t) => (
                <TagLink key={t} tag={t} />
              ))}
            </div>
          : null}
          {activity ?
            <p className="mt-2 text-xs text-emerald-400/80">{activity}</p>
          : null}
        </div>

        <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-stretch">
          {isApply ?
            <>
              <Link
                to={`/groups/${group.id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-dc-accent px-4 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover sm:flex-none"
              >
                View group
              </Link>
              <Link
                to={`/groups/${group.id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-dc-border px-4 text-sm font-medium text-dc-text-muted hover:text-dc-text sm:flex-none"
              >
                Request to join
              </Link>
            </>
          : <>
              <Link
                to={`/groups/${group.id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-dc-accent px-4 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover sm:flex-none"
              >
                View group
              </Link>
              <Link
                to={`/groups/${group.id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-dc-border px-4 text-sm font-medium text-dc-text-muted hover:text-dc-text sm:flex-none"
                title="Join from the group page"
              >
                Join on group page
              </Link>
            </>
          }
        </div>
      </div>

      {group.memberAvatars && group.memberAvatars.length > 0 ?
        <div className="mt-3 flex items-center gap-1 border-t border-dc-border/60 pt-3">
          {group.memberAvatars.slice(0, 4).map((m) =>
            m.avatarUrl ?
              <img
                key={m.userId}
                src={m.avatarUrl}
                alt=""
                className="h-6 w-6 rounded-full ring-2 ring-dc-elevated-solid"
              />
            : <PlaceholderAvatar key={m.userId} size="sm" className="!h-6 !w-6 !rounded-full ring-2 ring-dc-elevated-solid" />,
          )}
        </div>
      : null}
    </article>
  )
}
