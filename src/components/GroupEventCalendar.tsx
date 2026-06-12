'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { MockEvent } from '@/data/mock-data'

type GroupEventCalendarProps = {
  events: MockEvent[]
  onEventClick?: (event: MockEvent) => void
  /** Compact mode for sidebar - smaller grid, fewer event links */
  compact?: boolean
  /** When compact, link to switch to Events tab (group page) */
  groupId?: string
}

function parseEventDate(dateStr: string): Date | null {
  const m = dateStr.match(/(\w{3}), (\w{3}) (\d{1,2}) at (\d{1,2}):(\d{2}) (AM|PM)/)
  if (m) {
    const [, , month, day, hour, min, ampm] = m
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
    let h = parseInt(hour, 10)
    if (ampm === 'PM' && h !== 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    return new Date(2026, months[month] ?? 0, parseInt(day, 10), h, parseInt(min, 10))
  }
  const range = dateStr.match(/(\w{3}) (\d{1,2})–(\d{1,2}), (\d{4})/)
  if (range) {
    const [, month, startDay, , year] = range
    const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
    return new Date(parseInt(year, 10), months[month] ?? 0, parseInt(startDay, 10))
  }
  return null
}

export default function GroupEventCalendar({ events, onEventClick, compact, groupId }: GroupEventCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const eventsByDay: Record<number, MockEvent[]> = {}
  for (const e of events) {
    const d = parseEventDate(e.date)
    if (d && d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      eventsByDay[day].push(e)
    }
  }

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const blanks = Array(firstDay).fill(null)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className={`bg-c2k-bg-card rounded-2xl border border-white/10 shadow-c2k-soft ${compact ? 'p-3' : 'p-4'}`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
        <button type="button" onClick={prevMonth} className="p-1.5 text-c2k-text-muted hover:text-white rounded-lg hover:bg-white/5">
          <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-lg'}`}>{monthNames[month]} {year}</h3>
        <button type="button" onClick={nextMonth} className="p-1.5 text-c2k-text-muted hover:text-white rounded-lg hover:bg-white/5">
          <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {dayNames.map((d) => (
          <div key={d} className={`font-medium text-c2k-text-muted ${compact ? 'text-[10px] py-0.5' : 'text-xs py-1'}`}>{d}</div>
        ))}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const dayEvents = eventsByDay[day] ?? []
          return (
            <div
              key={day}
              className={`aspect-square rounded flex flex-col items-center justify-center ${
                dayEvents.length > 0 ? 'bg-c2k-accent-primary/20 text-c2k-accent-primary' : 'text-c2k-text-secondary'
              } ${compact ? 'text-[10px]' : 'text-sm'}`}
            >
              <span>{day}</span>
              {dayEvents.length > 0 && !compact && (
                <span className="text-xs">{dayEvents.length}</span>
              )}
            </div>
          )
        })}
      </div>
      {!compact && (
        <div className="mt-4 space-y-2">
          {Object.entries(eventsByDay).map(([day, evs]) =>
            evs.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                onClick={() => onEventClick?.(e)}
                className="block text-sm text-c2k-text-secondary hover:text-c2k-accent-primary"
              >
                {monthNames[month]} {day}: {e.title}
              </Link>
            ))
          )}
        </div>
      )}
      {compact && groupId && (
        <div className="mt-2">
          <Link href={`/groups/${groupId}?tab=Events`} className="text-xs text-c2k-accent-primary hover:underline">
            View events →
          </Link>
        </div>
      )}
    </div>
  )
}
