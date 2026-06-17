import { Link } from 'react-router-dom'
import EventSaveButton from '@/components/events/EventSaveButton'
import TagLink from '@/components/TagLink'
import {
  filterPublicEventTags,
  formatEventListDateBlock,
  formatEventLocationForDisplay,
} from '@/lib/events-page-utils'
import type { MockEvent } from '@/data/types'

type Props = {
  event: MockEvent
}

export default function EventsListRow({ event }: Props) {
  const { weekday, monthDay } = formatEventListDateBlock(event)
  const isVirtual = event.eventFormat === 'virtual'
  const displayLocation = formatEventLocationForDisplay(event.location, isVirtual)
  const tags = filterPublicEventTags(
    event.tags?.length ? event.tags : event.category ? [event.category] : [],
  )
  const formatLabel = isVirtual ? 'Online' : 'In person'
  const goingLabel =
    (event.mutualGoingCount ?? 0) > 0 ?
      `${event.rsvpCount} going · ${event.mutualGoingCount} mutual`
    : `${event.rsvpCount} going`

  return (
    <article className="overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)] transition-colors hover:border-dc-accent-border/40 lg:hover:shadow-[var(--dc-shadow-panel)]">
      <div className="flex gap-3 p-3 sm:p-4">
        <div className="c2k-event-date-badge flex min-w-[3.75rem] shrink-0 flex-col items-center justify-center py-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-dc-accent">{weekday}</span>
          <span className="text-sm font-bold leading-none text-dc-text">{monthDay}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/events/${event.id}`}
              className="line-clamp-2 text-base font-semibold leading-snug text-dc-text hover:text-dc-accent"
            >
              {event.title}
            </Link>
            <EventSaveButton eventId={event.id} className="shrink-0" />
          </div>

          <p className="mt-1 text-sm text-dc-text-muted">
            <span className="font-medium text-dc-text">{displayLocation}</span>
            <span> · {formatLabel}</span>
          </p>

          {tags.length > 0 ?
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.slice(0, 2).map((tag) => (
                <TagLink
                  key={tag}
                  tag={tag.replace(/^#/, '')}
                  className="!rounded-full !bg-dc-surface-muted !px-2 !py-0.5 !text-[11px]"
                />
              ))}
            </div>
          : null}

          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-dc-border/60 pt-3">
            <span className="text-xs text-dc-muted">{goingLabel}</span>
            <Link
              to={`/events/${event.id}`}
              className="ml-auto inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-dc-accent-border bg-dc-accent/10 px-4 text-sm font-semibold text-dc-accent hover:bg-dc-accent-muted lg:border-transparent lg:bg-dc-accent lg:text-dc-accent-foreground lg:hover:bg-dc-accent-hover"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
