import { Link } from 'react-router-dom'
import type { MockEvent } from '@/data/mock-data'
import MediaSurfaceFallback from '@/components/ui/MediaSurfaceFallback'
import { eventDateBlock } from '@/lib/explore-hub'

type Props = {
  event: MockEvent
  /** Hide thumbnail for narrow sidebars (e.g. Explore upcoming column). */
  hideThumb?: boolean
  className?: string
}

export default function ExploreCompactEventRow({ event, hideThumb = false, className = '' }: Props) {
  const { month, day } = eventDateBlock(event.date)
  const thumb = event.imageUrl ?? event.bannerUrl ?? null
  const goingLabel =
    event.capacityLimit && event.capacityLimit > 0 ?
      `${event.rsvpCount}/${event.capacityLimit} going`
    : `${event.rsvpCount} going`

  return (
    <li className={className}>
      <Link
        to={`/events/${encodeURIComponent(String(event.id))}`}
        className="flex gap-3 rounded-xl border border-dc-border border-l-[3px] border-l-dc-accent bg-dc-elevated-solid p-3 transition-colors hover:border-dc-accent-border/40"
      >
        <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-dc-border bg-dc-surface-muted text-center">
          <span className="text-[10px] font-semibold uppercase text-dc-accent">{month}</span>
          <span className="text-lg font-bold leading-none text-dc-text">{day}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-dc-text line-clamp-2">{event.title}</p>
          <p className="text-xs text-dc-muted mt-0.5">{event.date}</p>
          {event.location ?
            <p className="text-xs text-dc-muted line-clamp-1">{event.location}</p>
          : null}
          <p className="text-xs text-dc-text-muted mt-1">{goingLabel}</p>
          {event.mutualGoingCount != null && event.mutualGoingCount > 0 ?
            <p className="text-[10px] text-dc-accent mt-0.5">{event.mutualGoingCount} connections going</p>
          : null}
        </div>
        {hideThumb ? null : (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-dc-border">
            {thumb ?
              <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
            : <MediaSurfaceFallback variant="event" compact className="h-full" />}
          </div>
        )}
      </Link>
    </li>
  )
}
