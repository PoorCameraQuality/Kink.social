import { Link } from 'react-router-dom'
import EventSaveButton from '@/components/events/EventSaveButton'
import TagLink from '@/components/TagLink'
import PlaceholderAvatar from '@/components/PlaceholderAvatar'
import MediaSurfaceFallback from '@/components/ui/MediaSurfaceFallback'
import {
  filterPublicEventTags,
  formatEventListDateBlock,
  formatEventLocationForDisplay,
  resolveEventHeroUrl,
} from '@/lib/events-page-utils'
import type { MockEvent } from '@/data/types'

type Props = {
  event: MockEvent
}

export default function EventsListRow({ event }: Props) {
  const { weekday, monthDay } = formatEventListDateBlock(event)
  const heroSrc = resolveEventHeroUrl(event)
  const capacity = event.capacityLimit ?? 100
  const fillPct = Math.min(100, Math.round(((event.rsvpCount ?? 0) / Math.max(capacity, 1)) * 100))
  const isVirtual = event.eventFormat === 'virtual'
  const displayLocation = formatEventLocationForDisplay(event.location, isVirtual)
  const tags = filterPublicEventTags(
    event.tags?.length ? event.tags : event.category ? [event.category] : [],
  )
  const preview = event.connectionRsvpPreview?.slice(0, 3) ?? []
  const formatLabel = isVirtual ? 'Online' : 'In person'

  return (
    <article className="overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)] transition-colors hover:border-dc-accent-border/40 lg:hover:shadow-[var(--dc-shadow-panel)]">
      <div className="flex items-start justify-between gap-2 p-3 pb-2 sm:p-4 sm:pb-2">
        <div className="c2k-event-date-badge min-w-[4.25rem] flex-col items-center py-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-dc-accent">{weekday}</span>
          <span className="text-sm font-bold leading-none text-dc-text">{monthDay}</span>
        </div>
        <EventSaveButton eventId={event.id} />
      </div>

      <Link to={`/events/${event.id}`} className="c2k-event-list-thumb relative mx-3 block rounded-xl border border-dc-border sm:mx-4 md:hidden">
        <div className="aspect-[16/9] w-full">
          {heroSrc ?
            <img src={heroSrc} alt="" loading="lazy" />
          : <MediaSurfaceFallback variant="event" className="h-full w-full" />}
        </div>
      </Link>

      <div className="flex flex-col gap-2 p-3 pt-2 sm:p-4 sm:pt-3 md:flex-row md:gap-4">
        <Link
          to={`/events/${event.id}`}
          className="c2k-event-list-thumb relative hidden h-28 w-36 shrink-0 rounded-xl border border-dc-border md:block lg:h-32 lg:w-40"
        >
          {heroSrc ?
            <img src={heroSrc} alt="" loading="lazy" />
          : <MediaSurfaceFallback variant="event" className="h-full w-full" />}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <Link
            to={`/events/${event.id}`}
            className="line-clamp-2 text-base font-semibold leading-snug text-dc-text hover:text-dc-accent sm:text-lg"
          >
            {event.title}
          </Link>
          <p className="mt-1 text-sm">
            <span className="font-medium text-dc-text">{displayLocation}</span>
            <span className="text-dc-muted"> · {formatLabel}</span>
          </p>

          {tags.length > 0 ?
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <TagLink
                  key={tag}
                  tag={tag.replace(/^#/, '')}
                  className="!rounded-full !bg-dc-surface-muted !px-2 !py-0.5 !text-[11px]"
                />
              ))}
              {tags.length > 3 ?
                <span className="inline-flex items-center rounded-full bg-dc-surface-muted px-2 py-0.5 text-[11px] text-dc-muted">
                  +{tags.length - 3}
                </span>
              : null}
            </div>
          : null}

          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-dc-border/60 pt-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {preview.length > 0 ?
                <span className="flex -space-x-1.5" aria-hidden>
                  {preview.map((p, i) =>
                    p.avatarUrl ?
                      <img key={p.username} src={p.avatarUrl} alt="" className="h-6 w-6 rounded-full ring-2 ring-dc-elevated-solid" style={{ zIndex: i }} />
                    : <PlaceholderAvatar key={p.username} size="sm" className="!h-6 !w-6 ring-2 ring-dc-elevated-solid" />,
                  )}
                </span>
              : null}
              <span className="text-xs text-dc-muted">
                {event.rsvpCount} going
                {(event.mutualGoingCount ?? 0) > 0 ? ` · ${event.mutualGoingCount} mutual` : ''}
              </span>
            </div>
            <div className="hidden min-w-[80px] flex-1 md:block">
              <div className="h-1 overflow-hidden rounded-full bg-dc-surface-muted">
                <div className="h-full rounded-full bg-dc-accent transition-all" style={{ width: `${Math.max(fillPct, 2)}%` }} />
              </div>
            </div>
            <Link
              to={`/events/${event.id}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-dc-accent-border bg-dc-accent/10 px-4 text-sm font-semibold text-dc-accent hover:bg-dc-accent-muted lg:border-transparent lg:bg-dc-accent lg:text-dc-accent-foreground lg:hover:bg-dc-accent-hover"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
