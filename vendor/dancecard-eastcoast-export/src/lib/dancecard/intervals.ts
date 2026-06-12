export type Interval = { start: Date; end: Date }

function maxDate(a: Date, b: Date): Date {
  return a > b ? a : b
}

function minDate(a: Date, b: Date): Date {
  return a < b ? a : b
}

/** Merge overlapping / touching intervals (sorted). */
export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return []
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime())
  const out: Interval[] = []
  let cur = { ...sorted[0]! }
  for (let i = 1; i < sorted.length; i++) {
    const n = sorted[i]!
    if (n.start <= cur.end) {
      cur.end = maxDate(cur.end, n.end)
    } else {
      out.push(cur)
      cur = { ...n }
    }
  }
  out.push(cur)
  return out
}

export function expandInterval(iv: Interval, bufferMinutes: number): Interval {
  const ms = bufferMinutes * 60_000
  return {
    start: new Date(iv.start.getTime() - ms),
    end: new Date(iv.end.getTime() + ms),
  }
}

export function clipInterval(iv: Interval, window: Interval): Interval | null {
  const start = maxDate(iv.start, window.start)
  const end = minDate(iv.end, window.end)
  if (start >= end) return null
  return { start, end }
}

/** Busy intervals clipped to window, merged. */
export function clipAndMergeBusy(busy: Interval[], window: Interval): Interval[] {
  const clipped = busy
    .map((b) => clipInterval(b, window))
    .filter((x): x is Interval => x !== null)
  return mergeIntervals(clipped)
}

/** Free gaps inside window given busy merged intervals. */
export function freeGapsFromBusy(busyMerged: Interval[], window: Interval): Interval[] {
  const gaps: Interval[] = []
  let cursor = window.start
  for (const b of busyMerged) {
    if (b.start > cursor) {
      gaps.push({ start: cursor, end: minDate(b.start, window.end) })
    }
    cursor = maxDate(cursor, b.end)
    if (cursor >= window.end) break
  }
  if (cursor < window.end) {
    gaps.push({ start: cursor, end: window.end })
  }
  return gaps.filter((g) => g.start < g.end)
}

/** Intersection of two free-gap lists (assumed ordered, non-overlapping within each). */
export function intersectFree(a: Interval[], b: Interval[]): Interval[] {
  const out: Interval[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    const x = a[i]!
    const y = b[j]!
    const start = maxDate(x.start, y.start)
    const end = minDate(x.end, y.end)
    if (start < end) out.push({ start, end })
    if (x.end <= y.end) i++
    else j++
  }
  return mergeIntervals(out)
}

export function intervalFullyInsideWindow(iv: Interval, gaps: Interval[]): boolean {
  return gaps.some((g) => iv.start >= g.start && iv.end <= g.end)
}

/** Union of busy intervals (for conflict visualization). */
export function mergeBusyUnion(a: Interval[], b: Interval[], window: Interval): Interval[] {
  return clipAndMergeBusy([...a, ...b], window)
}
