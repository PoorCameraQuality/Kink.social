import { Link } from 'react-router-dom'
import TagLink from '@/components/TagLink'
import EventSaveButton from '@/components/events/EventSaveButton'
import Card from '@/components/ui/Card'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import { demoMockImageUrl } from '@/data/mock-data'
import { filterPublicEventTags, formatEventLocationForDisplay } from '@/lib/events-page-utils'

export type EventCardProps = {
  event: {
    id: number | string
    title: string
    date: string
    location: string
    rsvpCount: number
    capacityLimit?: number
    mutualGoingCount?: number
    connectionRsvpPreview?: Array<{ username: string; avatarUrl?: string | null }>
    imageUrl?: string | null
    bannerUrl?: string | null
    tags?: string[]
    eventFormat?: 'in-person' | 'virtual'
    isFeatured?: boolean
  }
}

export default function EventCard({ event }: EventCardProps) {
  const {
    id,
    title,
    date,
    location,
    rsvpCount,
    capacityLimit,
    mutualGoingCount = 0,
    connectionRsvpPreview = [],
    imageUrl,
    bannerUrl,
    tags,
    eventFormat,
    isFeatured,
  } = event
  const isVirtual = eventFormat === 'virtual'
  const heroSrc = imageUrl ?? bannerUrl ?? demoMockImageUrl(`event-hero-${String(id)}`, 960, 480)
  const fillPct = capacityLimit && capacityLimit > 0 ? Math.min(100, Math.round((rsvpCount / capacityLimit) * 100)) : Math.min(100, Math.round((rsvpCount / 100) * 100))
  const attendanceLabel = capacityLimit && capacityLimit > 0 ? `${rsvpCount}/${capacityLimit} going` : `${rsvpCount} going`
  const previewAvatars = connectionRsvpPreview.slice(0, 3)
  const mutualOverflow = Math.max(0, mutualGoingCount - previewAvatars.length)
  const displayLocation = formatEventLocationForDisplay(location, isVirtual)
  const displayTags = filterPublicEventTags(tags)

  return (
    <Card interactive className="relative min-w-0 overflow-hidden p-0">
      <div className="relative aspect-[2/1] bg-dc-elevated-solid">
        <Link
          to={`/events/${id}`}
          className="absolute inset-0 z-0 block"
          aria-label={`View event: ${title}`}
        >
          {heroSrc ? (
            <img
              src={heroSrc}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              data-sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dc-surface-muted to-dc-elevated-solid">
              <svg className="w-12 h-12 text-dc-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </Link>
        <span className="c2k-event-date-badge absolute top-3 left-3 z-10 pointer-events-none">
          {date}
        </span>
        {isFeatured && (
          <span className="absolute bottom-3 left-3 z-10 px-2 py-1 bg-emerald-600/90 rounded-lg text-xs font-semibold text-white pointer-events-none">
            Featured
          </span>
        )}
        <div className="absolute bottom-3 right-3 z-20 rounded-full bg-dc-elevated/95/90 backdrop-blur-sm">
          <EventSaveButton eventId={id} size="sm" className="!min-h-11 !min-w-11 !rounded-full" />
        </div>
      </div>
      <Link to={`/events/${id}`} className="block p-4 pt-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display font-semibold text-dc-text line-clamp-2 flex-1 min-w-0 text-[15px] sm:text-base">{title}</h3>
          {isVirtual && (
            <span className="shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/35">
              Virtual
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-dc-text-muted flex items-center gap-1">
          {isVirtual ?
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          : <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          }
          <span className="min-w-0 break-words [overflow-wrap:anywhere]">{displayLocation === location && isVirtual && (location === 'TBA' || !location.trim()) ? 'Online. Tap for details' : displayLocation}</span>
        </p>
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {displayTags.slice(0, 3).map((t) => (
              <TagLink key={t} tag={t} />
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md border border-dc-border bg-dc-elevated-solid px-2 py-0.5 text-xs text-dc-text-muted">
            {attendanceLabel}
          </span>
          {mutualGoingCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-dc-accent-border/30 bg-dc-accent/10 px-2 py-0.5 text-xs text-dc-accent-hover">
              {previewAvatars.length > 0 ? (
                <span className="flex items-center -space-x-1.5" aria-hidden>
                  {previewAvatars.map((person, i) => (
                    <Link
                      key={person.username}
                      to={`/profile/${encodeURIComponent(person.username)}`}
                      style={{ zIndex: i + 1 }}
                      title={person.username}
                      aria-label={`${person.username}, connection going`}
                      onClick={(e) => e.stopPropagation()}
                      className="relative inline-flex rounded-full ring-2 ring-[var(--dc-surface-card)]"
                    >
                      {person.avatarUrl ?
                        <img
                          src={person.avatarUrl}
                          alt=""
                          width={20}
                          height={20}
                          loading="lazy"
                          decoding="async"
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      : <PlaceholderAvatar size="sm" className="!h-5 !w-5 !min-h-5 !min-w-5 !rounded-full [&>svg]:!h-2.5 [&>svg]:!w-2.5" />}
                    </Link>
                  ))}
                  {mutualOverflow > 0 ?
                    <span className="relative z-[4] flex h-5 min-w-5 items-center justify-center rounded-full bg-dc-elevated-solid px-0.5 text-[10px] font-semibold tabular-nums ring-2 ring-[var(--dc-surface-card)]">
                      +{mutualOverflow}
                    </span>
                  : null}
                </span>
              ) : null}
              <span>
                {mutualGoingCount} mutual{mutualGoingCount === 1 ? '' : 's'} going
              </span>
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-dc-elevated-solid rounded-full overflow-hidden">
            <div
              className="h-full bg-dc-accent rounded-full"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className="text-xs text-dc-muted">{fillPct}%</span>
        </div>
      </Link>
    </Card>
  )
}
