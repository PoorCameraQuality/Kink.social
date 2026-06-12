'use client'

import { useMemo, useState } from 'react'
import { formatRange, formatTime } from '@/components/dancecard/time'
import { roleColor } from '@/lib/dancecard/roleColors'
import { locationColor } from '@/lib/dancecard/locationColors'
import type { StaffShift } from '@/lib/dancecard/staffSchedule'

type SelectionRow = {
  id: string
  kind: string
  slotId: string | null
  startsAt: string
  endsAt: string
  programTitle?: string | null
  programRoom?: string | null
  programTrack?: string | null
  note?: string | null
}

type ReservationRow = {
  id: string
  startsAt: string
  endsAt: string
  status: string
  role: string
  host: { displayName: string }
  guest: { displayName: string }
}

export type CompactAgendaRow =
  | { type: 'selection'; selection: SelectionRow }
  | { type: 'reservation'; reservation: ReservationRow }

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function dayKey(iso: string, tz: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: tz,
  }).format(new Date(iso))
}

function reservationPartnerName(r: ReservationRow): string {
  return r.role === 'host' ? r.guest.displayName : r.host.displayName
}

export function DancecardCompactList(props: {
  rows: CompactAgendaRow[]
  tz: string
  findMatchingStaffShift: (selection: SelectionRow) => StaffShift | null
  staffManualBlockTitle: (selection: SelectionRow, fallback: string) => string
  onRemoveSelection: (id: string) => void
  onNoteBlur: (selection: SelectionRow, note: string) => void
}) {
  const { rows, tz, findMatchingStaffShift, staffManualBlockTitle, onRemoveSelection, onNoteBlur } = props
  const [openId, setOpenId] = useState<string | null>(null)

  const withDayBreaks = useMemo(() => {
    const out: { row: CompactAgendaRow; showDay: boolean; day: string }[] = []
    let prevDay = ''
    for (const row of rows) {
      const starts = row.type === 'selection' ? row.selection.startsAt : row.reservation.startsAt
      const day = dayKey(starts, tz)
      const showDay = day !== prevDay
      prevDay = day
      out.push({ row, showDay, day })
    }
    return out
  }, [rows, tz])

  function roleLabel(row: CompactAgendaRow): string | null {
    if (row.type === 'reservation') return 'Reservation'
    const s = row.selection
    if (s.kind === 'program') {
      const t = (s.programTrack ?? '').trim()
      return t || 'Class'
    }
    const shift = findMatchingStaffShift(s)
    if (shift) return shift.role
    return 'Busy'
  }

  function chipColorForRow(row: CompactAgendaRow): ReturnType<typeof roleColor> {
    if (row.type === 'reservation') return roleColor('Reservation')
    const s = row.selection
    if (s.kind === 'program') return roleColor(s.programTrack || 'track')
    const shift = findMatchingStaffShift(s)
    return roleColor(shift?.role ?? 'Busy')
  }

  return (
    <div className="space-y-2">
      {withDayBreaks.map(({ row, showDay, day }) => {
        if (row.type === 'reservation') {
          const r = row.reservation
          const rc = chipColorForRow(row)
          return (
            <div key={`r-${r.id}`}>
              {showDay ? (
                <div className="mb-2 mt-4 first:mt-0 font-serif text-lg text-white/90">{day}</div>
              ) : null}
              <div
                className={cx(
                  'rounded-2xl border border-emerald-400/25 bg-emerald-950/20 px-3 py-3 sm:px-4',
                  openId === r.id && 'ring-1 ring-emerald-400/30'
                )}
              >
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center gap-2 text-left sm:gap-3"
                  onClick={() => setOpenId((id) => (id === r.id ? null : r.id))}
                >
                  <div className="min-w-[7rem] shrink-0 text-sm font-medium text-emerald-100/95">
                    {formatTime(r.startsAt, tz)} – {formatTime(r.endsAt, tz)}
                  </div>
                  <span
                    className={cx(
                      'inline-flex max-w-[10rem] shrink-0 truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 sm:max-w-[12rem] sm:text-xs',
                      rc.bg,
                      rc.fg,
                      rc.ring
                    )}
                  >
                    Reservation
                  </span>
                  <div className="min-w-0 flex-1 text-sm font-semibold text-white">
                    Together with {reservationPartnerName(r)}
                  </div>
                </button>
                {openId === r.id ? (
                  <p className="mt-2 border-t border-white/10 pt-2 text-xs text-slate-400">
                    {formatRange(r.startsAt, r.endsAt, tz)}
                  </p>
                ) : null}
              </div>
            </div>
          )
        }

        const s = row.selection
        const title = staffManualBlockTitle(
          s,
          s.kind === 'program'
            ? s.programTitle || 'Program session'
            : s.kind === 'manual'
              ? 'Manual busy block'
              : s.kind
        )
        const metaFromStaff = Boolean(findMatchingStaffShift(s))
        const meta = metaFromStaff
          ? 'From PAF staff & volunteer schedule'
          : `${s.kind === 'program' && s.programRoom ? `${s.programRoom} · ` : ''}${formatRange(s.startsAt, s.endsAt, tz)}`
        const label = roleLabel(row)
        const rc = chipColorForRow(row)
        const roomColor = locationColor(s.programRoom)
        const hasRoomTint = s.kind === 'program' && Boolean(s.programRoom)
        const hasNote = Boolean((s.note ?? '').trim())

        return (
          <div key={`s-${s.id}`}>
            {showDay ? (
              <div className="mb-2 mt-4 first:mt-0 font-serif text-lg text-white/90">{day}</div>
            ) : null}
            <div
              className={cx(
                'rounded-2xl border px-3 py-3 sm:px-4',
                hasRoomTint ? `${roomColor.border} ${roomColor.surface}` : 'border-white/10 bg-[#0a1322]',
                openId === s.id && 'ring-1 ring-cyan-400/25'
              )}
            >
              <button
                type="button"
                className="flex w-full flex-wrap items-center gap-2 text-left sm:gap-3"
                onClick={() => setOpenId((id) => (id === s.id ? null : s.id))}
              >
                <div className="min-w-[7rem] shrink-0 text-sm font-medium text-cyan-100/90">
                  {formatTime(s.startsAt, tz)} – {formatTime(s.endsAt, tz)}
                </div>
                {label ? (
                  <span
                    className={cx(
                      'inline-flex max-w-[10rem] shrink-0 truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 sm:max-w-[12rem] sm:text-xs',
                      rc.bg,
                      rc.fg,
                      rc.ring
                    )}
                  >
                    {label}
                  </span>
                ) : null}
                <div className="min-w-0 flex-1 text-sm font-semibold text-white">{title}</div>
                {s.kind === 'program' && s.programRoom ? (
                  <span
                    className={cx(
                      'hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ring-1 sm:inline',
                      roomColor.bg,
                      roomColor.fg,
                      roomColor.ring
                    )}
                  >
                    {s.programRoom}
                  </span>
                ) : null}
                {hasNote ? (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" title="Has a note" aria-hidden />
                ) : null}
              </button>
              {openId === s.id ? (
                <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                  <p className="text-xs text-slate-400">{meta}</p>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500">Personal note</label>
                  <textarea
                    className="min-h-[72px] w-full rounded-xl border border-slate-700 bg-[#111a2c] px-3 py-2 text-sm text-white placeholder:text-slate-600"
                    defaultValue={s.note ?? ''}
                    placeholder="Only you see this note…"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => onNoteBlur(s, e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded-full border border-rose-400/25 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/25"
                    onClick={() => onRemoveSelection(s.id)}
                  >
                    Remove from dancecard
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
