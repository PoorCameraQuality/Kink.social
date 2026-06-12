'use client'

import EventCard from '@/components/cards/EventCard'
import EmptyState from '@/components/ui/EmptyState'
import GroupEventCalendar from '@/components/GroupEventCalendar'
import type { MockEvent } from '@/data/mock-data'

interface GroupEventsSectionProps {
  events: MockEvent[]
}

export default function GroupEventsSection({ events }: GroupEventsSectionProps) {
  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState message="No events yet." ctaLabel="Browse all events" ctaHref="/events" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <GroupEventCalendar events={events} onEventClick={() => {}} />
      <div>
        <h3 className="text-sm font-semibold text-c2k-text-muted uppercase mb-3">Upcoming Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}
