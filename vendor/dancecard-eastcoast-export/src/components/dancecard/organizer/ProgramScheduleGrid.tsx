'use client'

import type { CSSProperties } from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { formatInTimeZone } from 'date-fns-tz'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import {
  dayKeysInWindow,
  formatDayHeader,
  formatTimeLabel,
  instantFromRow,
  rowIndexForInstant,
} from '@/components/dancecard/organizer/organizerTimeline'

export type ProgramSlotRow = {
  id: string
  startsAt: string
  endsAt: string
  title: string
  track: string | null
  room: string | null
  description: string | null
  sortOrder: number
}

const ROW_H = 26
const COL_MIN_W = 120
const GRID_START_HOUR = 6
const GRID_END_HOUR_EXCL = 25
const SLOT_STEP = 30

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function DraggableProgramSlot({
  slot,
  top,
  height,
  tz,
  colWidth,
}: {
  slot: ProgramSlotRow
  top: number
  height: number
  tz: string
  colWidth: number
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: slot.id })
  const style: CSSProperties = {
    top,
    height,
    width: colWidth - 6,
    left: 3,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 20 : 2,
  }
  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      className="absolute rounded-lg border border-cyan-400/40 bg-gradient-to-br from-cyan-950/90 to-slate-900/95 px-2 py-1 text-left text-[11px] font-medium text-cyan-50 shadow-md hover:border-cyan-300/60"
      {...listeners}
      {...attributes}
    >
      <div className="line-clamp-2">{slot.title}</div>
      <div className="mt-0.5 text-[10px] text-cyan-200/80">
        {formatTimeLabel(slot.startsAt, tz)} – {formatTimeLabel(slot.endsAt, tz)}
      </div>
      {slot.room ? <div className="truncate text-[10px] text-slate-300">{slot.room}</div> : null}
    </button>
  )
}

export function ProgramScheduleGrid({
  eventSlug,
  timezone,
  windowStartsAt,
  windowEndsAt,
  slots,
  onRefresh,
}: {
  eventSlug: string
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  slots: ProgramSlotRow[]
  onRefresh: () => Promise<void>
}) {
  const dayKeys = useMemo(
    () => dayKeysInWindow(windowStartsAt, windowEndsAt, timezone),
    [windowStartsAt, windowEndsAt, timezone]
  )
  const rowsPerDay = useMemo(
    () => Math.max(1, Math.ceil(((GRID_END_HOUR_EXCL - GRID_START_HOUR) * 60) / SLOT_STEP)),
    []
  )
  const rowLabels = useMemo(() => {
    const labels: string[] = []
    for (let r = 0; r < rowsPerDay; r++) {
      const mins = GRID_START_HOUR * 60 + r * SLOT_STEP
      const h = Math.floor(mins / 60)
      const m = mins % 60
      const wall = new Date(2000, 0, 1, h, m, 0, 0)
      labels.push(
        new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(wall)
      )
    }
    return labels
  }, [rowsPerDay])

  const [sel, setSel] = useState<null | { day: string; r0: number; r1: number }>(null)
  const [dragging, setDragging] = useState(false)
  const anchor = useRef<{ day: string; row: number } | null>(null)
  const [modal, setModal] = useState<null | { day: string; startRow: number; endRow: number }>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formRoom, setFormRoom] = useState('')
  const [formTrack, setFormTrack] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  )

  const layoutForSlot = useCallback(
    (slot: ProgramSlotRow) => {
      const startDay = formatInTimeZone(new Date(slot.startsAt), timezone, 'yyyy-MM-dd')
      const col = dayKeys.indexOf(startDay)
      if (col < 0) return null
      const r0 = clamp(rowIndexForInstant(slot.startsAt, startDay, timezone, GRID_START_HOUR, SLOT_STEP), 0, rowsPerDay - 1)
      const r1Raw = rowIndexForInstant(slot.endsAt, startDay, timezone, GRID_START_HOUR, SLOT_STEP)
      const r1 = clamp(Math.max(r0 + 1, r1Raw), r0 + 1, rowsPerDay)
      const top = r0 * ROW_H
      const bottom = r1 * ROW_H
      return { col, top, height: Math.max(ROW_H, bottom - top) }
    },
    [dayKeys, rowsPerDay, timezone]
  )

  const onPointerDownCell = (day: string, row: number) => {
    anchor.current = { day, row }
    setDragging(true)
    setSel({ day, r0: row, r1: row })
  }

  const onPointerEnterCell = (day: string, row: number) => {
    if (!dragging || !anchor.current || anchor.current.day !== day) return
    const r0 = Math.min(anchor.current.row, row)
    const r1 = Math.max(anchor.current.row, row)
    setSel({ day, r0, r1 })
  }

  const endSelect = () => {
    setDragging(false)
    anchor.current = null
  }

  const openCreateModal = () => {
    if (!sel) return
    setFormTitle('')
    setFormRoom('')
    setFormTrack('')
    setFormDesc('')
    setErr(null)
    setModal({ day: sel.day, startRow: sel.r0, endRow: sel.r1 })
    setSel(null)
  }

  const saveNewSlot = async () => {
    if (!modal) return
    const title = formTitle.trim()
    if (!title) {
      setErr('Title is required')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const start = instantFromRow(modal.day, modal.startRow, timezone, GRID_START_HOUR, SLOT_STEP)
      const end = instantFromRow(modal.day, modal.endRow + 1, timezone, GRID_START_HOUR, SLOT_STEP)
      await organizerDancecardFetch(eventSlug, '/program-slots', {
        method: 'POST',
        body: JSON.stringify({
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          title,
          room: formRoom.trim() || null,
          track: formTrack.trim() || null,
          description: formDesc.trim() || null,
        }),
      })
      setModal(null)
      await onRefresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const id = String(event.active.id)
    const slot = slots.find((s) => s.id === id)
    if (!slot || !event.delta) return
    const rowDelta = Math.round(event.delta.y / ROW_H)
    if (rowDelta === 0) return
    const startMs = new Date(slot.startsAt).getTime() + rowDelta * SLOT_STEP * 60 * 1000
    const endMs = new Date(slot.endsAt).getTime() + rowDelta * SLOT_STEP * 60 * 1000
    const ws = new Date(windowStartsAt).getTime()
    const we = new Date(windowEndsAt).getTime()
    const clampedStart = clamp(startMs, ws, we - SLOT_STEP * 60 * 1000)
    const clampedEnd = clamp(endMs, clampedStart + SLOT_STEP * 60 * 1000, we)
    try {
      await organizerDancecardFetch(eventSlug, `/program-slots/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          startsAt: new Date(clampedStart).toISOString(),
          endsAt: new Date(clampedEnd).toISOString(),
        }),
      })
      await onRefresh()
    } catch {
      setErr('Could not move session')
    }
  }

  const deleteSlot = async (id: string) => {
    if (!window.confirm('Delete this program slot? Attendee picks for this slot will be removed.')) return
    try {
      await organizerDancecardFetch(eventSlug, `/program-slots/${id}`, { method: 'DELETE' })
      await onRefresh()
    } catch {
      setErr('Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      {err ? <p className="text-sm text-rose-300">{err}</p> : null}
      <DndContext sensors={sensors} onDragEnd={(e) => void handleDragEnd(e)}>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-2">
          <div
            className="inline-flex min-w-full gap-0"
            onPointerLeave={() => {
              if (dragging) endSelect()
            }}
            onPointerUp={() => {
              if (dragging) endSelect()
            }}
          >
            <div
              className="shrink-0 border-r border-white/10 pr-1 text-right text-[10px] text-slate-500"
              style={{ width: 52, paddingTop: 22 }}
            >
              {rowLabels.map((lb, i) => (
                <div key={lb + i} style={{ height: ROW_H }} className="pr-1 leading-none">
                  {lb}
                </div>
              ))}
            </div>
            {dayKeys.map((day) => (
              <div
                key={day}
                className="relative shrink-0 border-r border-white/10"
                style={{ width: COL_MIN_W, minHeight: rowsPerDay * ROW_H + 22 }}
              >
                <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 px-1 py-1 text-center text-[11px] font-semibold text-slate-200">
                  {formatDayHeader(day, timezone)}
                </div>
                <div className="relative" style={{ height: rowsPerDay * ROW_H }}>
                  {Array.from({ length: rowsPerDay }).map((_, row) => (
                    <div
                      key={row}
                      role="presentation"
                      className="absolute left-0 right-0 border-b border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/30"
                      style={{ top: row * ROW_H, height: ROW_H }}
                      onPointerDown={() => onPointerDownCell(day, row)}
                      onPointerEnter={() => onPointerEnterCell(day, row)}
                    />
                  ))}
                  {sel && sel.day === day
                    ? (() => {
                        const top = Math.min(sel.r0, sel.r1) * ROW_H
                        const h = (Math.abs(sel.r1 - sel.r0) + 1) * ROW_H
                        return (
                          <div
                            className="pointer-events-none absolute left-1 right-1 rounded-md border border-cyan-400/50 bg-cyan-500/20"
                            style={{ top, height: h, zIndex: 1 }}
                          />
                        )
                      })()
                    : null}
                  {slots.map((slot) => {
                    const L = layoutForSlot(slot)
                    if (!L || L.col !== dayKeys.indexOf(day)) return null
                    return (
                      <DraggableProgramSlot
                        key={slot.id}
                        slot={slot}
                        top={L.top}
                        height={L.height}
                        tz={timezone}
                        colWidth={COL_MIN_W}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DndContext>

      {sel ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-100 ring-1 ring-cyan-400/40 hover:bg-cyan-500/30"
            onClick={() => openCreateModal()}
          >
            Create session in selection
          </button>
          <button
            type="button"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
            onClick={() => setSel(null)}
          >
            Clear selection
          </button>
        </div>
      ) : null}

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <h3 className="font-serif text-xl text-white">New program session</h3>
            <p className="mt-1 text-xs text-slate-400">
              {formatDayHeader(modal.day, timezone)} ·{' '}
              {formatTimeLabel(
                instantFromRow(modal.day, modal.startRow, timezone, GRID_START_HOUR, SLOT_STEP).toISOString(),
                timezone
              )}{' '}
              –{' '}
              {formatTimeLabel(
                instantFromRow(modal.day, modal.endRow + 1, timezone, GRID_START_HOUR, SLOT_STEP).toISOString(),
                timezone
              )}
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-xs uppercase tracking-wide text-slate-400">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </label>
              <label className="block text-xs uppercase tracking-wide text-slate-400">
                Room / location
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                />
              </label>
              <label className="block text-xs uppercase tracking-wide text-slate-400">
                Track
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  value={formTrack}
                  onChange={(e) => setFormTrack(e.target.value)}
                />
              </label>
              <label className="block text-xs uppercase tracking-wide text-slate-400">
                Description
                <textarea
                  className="mt-1 min-h-[72px] w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </label>
            </div>
            {err ? <p className="mt-3 text-sm text-rose-300">{err}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                onClick={() => void saveNewSlot()}
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-white/10 bg-black/25 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Edit existing</p>
        <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto text-sm text-slate-200">
          {slots.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 border-b border-white/5 py-1">
              <span className="min-w-0 truncate">
                {formatTimeLabel(s.startsAt, timezone)} — {s.title}
              </span>
              <button
                type="button"
                className="shrink-0 text-xs text-rose-300 hover:text-rose-200"
                onClick={() => void deleteSlot(s.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-slate-500">
          Drag a colored card vertically to shift time (snaps to {SLOT_STEP}-minute steps). Sessions are clipped to the
          same calendar day column as their start time.
        </p>
      </div>
    </div>
  )
}
