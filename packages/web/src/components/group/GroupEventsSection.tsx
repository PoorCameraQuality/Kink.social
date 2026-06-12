import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '@/components/cards/EventCard'
import EmptyState from '@/components/ui/EmptyState'
import GroupEventCalendar from '@/components/GroupEventCalendar'
import type { MockEvent } from '@/data/mock-data'

const CATEGORY_FILTERS = ['All', 'Munch', 'Social', 'Workshop'] as const

interface GroupEventsSectionProps {
  events: MockEvent[]
  loading?: boolean
  groupId?: string
  groupName?: string
  canModerate?: boolean
}

export default function GroupEventsSection({
  events,
  loading = false,
  groupId,
  groupName,
  canModerate = false,
}: GroupEventsSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<(typeof CATEGORY_FILTERS)[number]>('All')

  const filtered = useMemo(() => {
    if (categoryFilter === 'All') return events
    return events.filter((e) => (e.category ?? '').toLowerCase() === categoryFilter.toLowerCase())
  }, [events, categoryFilter])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ta = a.startsAt ? new Date(a.startsAt).getTime() : Number.NaN
      const tb = b.startsAt ? new Date(b.startsAt).getTime() : Number.NaN
      if (!Number.isNaN(ta) && !Number.isNaN(tb)) return ta - tb
      return a.date.localeCompare(b.date)
    })
  }, [filtered])

  const createHref =
    groupId ?
      `/events?create=event&prefillGroupId=${encodeURIComponent(groupId)}&kind=munch`
    : '/events?create=event&kind=munch'

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-48 animate-pulse rounded-2xl bg-dc-elevated-muted" />
        <div className="h-32 animate-pulse rounded-2xl bg-dc-elevated-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-dc-text">Group calendar</h2>
          <p className="text-sm text-dc-muted mt-1">
            {groupName ?
              `Munches and events hosted by ${groupName}.`
            : 'Upcoming munches and events for this group.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canModerate ?
            <Link
              to={createHref}
              className="min-h-10 inline-flex items-center rounded-xl bg-dc-accent px-4 text-sm font-medium text-dc-text hover:bg-dc-accent-hover"
            >
              + Group event
            </Link>
          : null}
          {groupId ?
            <Link
              to={`/events?groupId=${encodeURIComponent(groupId)}`}
              className="min-h-10 inline-flex items-center rounded-xl border border-dc-border px-4 text-sm text-dc-text-muted hover:text-dc-text hover:bg-dc-elevated-muted"
            >
              Open in event finder
            </Link>
          : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORY_FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setCategoryFilter(label)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              categoryFilter === label ?
                'border-dc-accent-border/50 bg-dc-accent/15 text-dc-accent'
              : 'border-dc-border text-dc-text-muted hover:text-dc-text hover:bg-dc-elevated-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ?
        <EmptyState
          message={
            events.length === 0 ? 'No events yet.'
            : `No ${categoryFilter === 'All' ? '' : categoryFilter.toLowerCase() + ' '}events in this filter.`
          }
          ctaLabel={canModerate ? 'Create a munch' : 'Browse all events'}
          ctaHref={canModerate ? createHref : '/events'}
        />
      : <>
          <GroupEventCalendar events={sorted} groupId={groupId} />
          <div>
            <h3 className="text-sm font-semibold text-dc-muted uppercase mb-3">Upcoming</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sorted.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </>
      }
    </div>
  )
}
