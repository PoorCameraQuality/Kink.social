import { groupSlotsByDay } from '@/components/dancecard/time'

export type IsoInterval = { start: string; end: string }

export function mergeIsoIntervals(intervals: IsoInterval[]): { start: number; end: number }[] {
  const sorted = intervals
    .map((i) => ({ s: Date.parse(i.start), e: Date.parse(i.end) }))
    .filter((x) => Number.isFinite(x.s) && Number.isFinite(x.e) && x.e > x.s)
    .sort((a, b) => a.s - b.s)
  const out: { start: number; end: number }[] = []
  for (const cur of sorted) {
    const last = out[out.length - 1]
    if (!last || cur.s > last.end) {
      out.push({ start: cur.s, end: cur.e })
    } else {
      last.end = Math.max(last.end, cur.e)
    }
  }
  return out
}

export function intervalFullyInsideAnyUnion(
  blockStart: number,
  blockEnd: number,
  union: { start: number; end: number }[]
): boolean {
  return union.some((g) => blockStart >= g.start && blockEnd <= g.end)
}

export function buildAvailabilityFlags(
  rangeStart: number,
  rangeEnd: number,
  freeUnion: { start: number; end: number }[],
  stepMs: number
): boolean[] {
  const flags: boolean[] = []
  if (!(rangeEnd > rangeStart) || stepMs <= 0) return flags
  for (let t = rangeStart; t + stepMs <= rangeEnd; t += stepMs) {
    flags.push(intervalFullyInsideAnyUnion(t, t + stepMs, freeUnion))
  }
  return flags
}

type HasStartsAt = { startsAt: string; endsAt: string }

export function dayRangesFromSchedule<T extends HasStartsAt>(
  slots: T[],
  meta: { windowStartsAt: string; windowEndsAt: string } | null,
  tz: string,
  shortDayLabel: (dayHeading: string) => string
): { label: string; startMs: number; endMs: number }[] {
  if (!meta || !slots.length) return []
  const grouped = groupSlotsByDay(slots, tz)
  const w0 = Date.parse(meta.windowStartsAt)
  const w1 = Date.parse(meta.windowEndsAt)
  if (!(w1 > w0)) return []
  return grouped.map((g) => {
    const times: number[] = []
    for (const i of g.items) {
      times.push(Date.parse(i.startsAt), Date.parse(i.endsAt))
    }
    const lo = Math.min(...times)
    const hi = Math.max(...times)
    return {
      label: shortDayLabel(g.day),
      startMs: Math.max(w0, lo),
      endMs: Math.min(w1, hi),
    }
  })
}
