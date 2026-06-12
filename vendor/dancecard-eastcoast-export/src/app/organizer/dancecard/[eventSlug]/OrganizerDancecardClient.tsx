'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { EventSettingsPanel } from '@/components/dancecard/organizer/EventSettingsPanel'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import type { ProgramSlotRow } from '@/components/dancecard/organizer/ProgramScheduleGrid'
import { ProgramScheduleGrid } from '@/components/dancecard/organizer/ProgramScheduleGrid'
import type { StaffShiftRow } from '@/components/dancecard/organizer/StaffShiftsPanel'
import { StaffShiftsPanel } from '@/components/dancecard/organizer/StaffShiftsPanel'

type Tab = 'program' | 'staff' | 'settings'

export function OrganizerDancecardClient({ eventSlug }: { eventSlug: string }) {
  const slug = eventSlug.toLowerCase()
  const [tab, setTab] = useState<Tab>('program')
  const [timezone, setTimezone] = useState('America/New_York')
  const [windowStartsAt, setWindowStartsAt] = useState('')
  const [windowEndsAt, setWindowEndsAt] = useState('')
  const [slots, setSlots] = useState<ProgramSlotRow[]>([])
  const [shifts, setShifts] = useState<StaffShiftRow[]>([])
  const [eventTitle, setEventTitle] = useState('')
  const [loadErr, setLoadErr] = useState<string | null>(null)

  const refreshProgram = useCallback(async () => {
    try {
      const res = await organizerDancecardFetch<{
        slots: ProgramSlotRow[]
        timezone: string
        windowStartsAt: string
        windowEndsAt: string
      }>(slug, '/program-slots')
      setSlots(res.slots)
      setTimezone(res.timezone)
      setWindowStartsAt(res.windowStartsAt)
      setWindowEndsAt(res.windowEndsAt)
      setLoadErr(null)
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : 'Could not load program')
    }
  }, [slug])

  const refreshStaff = useCallback(async () => {
    try {
      const res = await organizerDancecardFetch<{ shifts: StaffShiftRow[]; timezone: string }>(
        slug,
        '/staff-shifts'
      )
      setShifts(res.shifts)
      setTimezone(res.timezone)
    } catch {
      /* ignore */
    }
  }, [slug])

  const refreshMeta = useCallback(async () => {
    try {
      const res = await organizerDancecardFetch<{ event: { eventTitle: string } }>(slug, '/event')
      setEventTitle(res.event.eventTitle)
    } catch {
      /* ignore */
    }
  }, [slug])

  useEffect(() => {
    void refreshProgram()
    void refreshStaff()
    void refreshMeta()
  }, [refreshProgram, refreshStaff, refreshMeta])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Organizer</p>
          <h1 className="font-serif text-3xl text-white">{eventTitle || slug}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Public dancecard:{' '}
            <Link className="text-cyan-300 underline-offset-2 hover:underline" href={`/dancecard/${slug}`}>
              /dancecard/{slug}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['program', 'staff', 'settings'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={
                tab === k
                  ? 'rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-50 ring-1 ring-cyan-400/50'
                  : 'rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5'
              }
            >
              {k === 'program' ? 'Program grid' : k === 'staff' ? 'Staff shifts' : 'Event settings'}
            </button>
          ))}
        </div>
      </div>

      {loadErr ? <p className="mt-6 text-sm text-rose-300">{loadErr}</p> : null}

      <div className="mt-8">
        {tab === 'settings' ? <EventSettingsPanel eventSlug={slug} /> : null}
        {tab === 'program' && windowStartsAt && windowEndsAt ? (
          <ProgramScheduleGrid
            eventSlug={slug}
            timezone={timezone}
            windowStartsAt={windowStartsAt}
            windowEndsAt={windowEndsAt}
            slots={slots}
            onRefresh={refreshProgram}
          />
        ) : null}
        {tab === 'staff' ? (
          <StaffShiftsPanel eventSlug={slug} timezone={timezone} shifts={shifts} onRefresh={refreshStaff} />
        ) : null}
      </div>
    </div>
  )
}
