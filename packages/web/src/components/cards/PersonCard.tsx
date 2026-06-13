import { Link } from 'react-router-dom'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import CommunityTrustChip from '@/components/trust/CommunityTrustChip'
import Card from '@/components/ui/Card'
import { activityIndicatorFromISO } from '@/lib/profile-activity'

/** Mini profile preview - no gender, pronouns, or orientation (those live on the full profile only). */
export type PersonCardProps = {
  person: {
    id?: number | string
    username: string
    /** Scene / display name shown as the primary heading. */
    sceneName?: string | null
    age?: number | null
    location?: string | null
    verified?: boolean
    mutualCount?: number
    /** e.g. co-attendance suggestion */
    sharedEventsCount?: number
    distance?: string
    avatarUrl?: string
    lastActiveAt?: string | null
  }
}

export default function PersonCard({ person }: PersonCardProps) {
  const {
    username,
    sceneName,
    age,
    location,
    verified,
    mutualCount = 0,
    sharedEventsCount = 0,
    distance,
    avatarUrl,
    lastActiveAt,
  } = person

  const trimmedScene = sceneName?.trim()
  const hasSceneName = Boolean(trimmedScene)
  const activityResult = activityIndicatorFromISO(lastActiveAt ?? undefined)
  const activityLabel = activityResult.hidden ? null : activityResult.label
  const ageLocation =
    [age != null ? `${age}` : null, location?.trim() || null].filter(Boolean).join(' · ') || null

  return (
    <Card interactive className="min-w-0 p-4">
      <Link to={`/profile/${username}`} className="block min-w-0">
      <div className="flex gap-3 min-w-0">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <PlaceholderAvatar size="md" className="!rounded-full" />
          )}
          {verified && (
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-dc-accent rounded-full flex items-center justify-center ring-2 ring-dc-border">
              <svg className="w-2.5 h-2.5 text-dc-text" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <h3 className="min-w-0 text-base font-semibold text-dc-text leading-snug break-words line-clamp-2">
              {hasSceneName ? trimmedScene : username}
            </h3>
          </div>
          {hasSceneName ? <p className="text-xs text-dc-muted">@{username}</p> : null}
          <CommunityTrustChip username={username} />
          {ageLocation ? <p className="text-sm text-dc-text-muted">{ageLocation}</p> : null}
          {activityLabel ? (
            <span className="inline-flex w-fit items-center rounded-md border border-dc-border bg-dc-elevated-muted px-2 py-0.5 text-[11px] font-medium text-dc-muted">
              {activityLabel}
            </span>
          ) : null}
          {mutualCount > 0 || sharedEventsCount > 0 || distance ? (
            <p className="text-xs text-dc-muted mt-0.5">
              {sharedEventsCount > 0 ? `${sharedEventsCount} shared events` : null}
              {sharedEventsCount > 0 && mutualCount > 0 ? ' · ' : null}
              {mutualCount > 0 ? `${mutualCount} mutual` : null}
              {(mutualCount > 0 || sharedEventsCount > 0) && distance ? ' · ' : null}
              {distance ? distance : null}
            </p>
          ) : null}
        </div>
      </div>
      </Link>
    </Card>
  )
}
