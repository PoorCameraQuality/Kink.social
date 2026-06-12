import {
  type Interval,
  expandInterval,
  clipAndMergeBusy,
  freeGapsFromBusy,
  intersectFree,
  mergeBusyUnion,
} from './intervals'

export type SelectionRow = {
  starts_at: string
  ends_at: string
}

export type ReservationRow = {
  host_account_id: string
  guest_account_id: string
  starts_at: string
  ends_at: string
  status: string
}

export function parseIso(s: string): Date {
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) throw new Error('Invalid datetime')
  return d
}

export function eventWindowFromRow(row: {
  window_starts_at: string
  window_ends_at: string
}): Interval {
  return {
    start: parseIso(row.window_starts_at),
    end: parseIso(row.window_ends_at),
  }
}

/** Busy = selections expanded by buffer + confirmed reservations touching this account. */
export function computeBusyForAccount(
  window: Interval,
  bufferMinutes: number,
  selections: SelectionRow[],
  reservations: ReservationRow[],
  accountId: string
): Interval[] {
  const selectionIntervals = selections.map((r) => ({
    start: parseIso(r.starts_at),
    end: parseIso(r.ends_at),
  }))
  const selectionExpanded = selectionIntervals.map((r) => expandInterval(r, bufferMinutes))
  const bookingIntervals = reservations
    .filter((b) => b.status === 'confirmed')
    .filter((b) => b.host_account_id === accountId || b.guest_account_id === accountId)
    .map((b) => ({
      start: parseIso(b.starts_at),
      end: parseIso(b.ends_at),
    }))
  return clipAndMergeBusy([...selectionExpanded, ...bookingIntervals], window)
}

export function computeFreeGapsForAccount(
  window: Interval,
  bufferMinutes: number,
  selections: SelectionRow[],
  reservations: ReservationRow[],
  accountId: string
): Interval[] {
  const busy = computeBusyForAccount(window, bufferMinutes, selections, reservations, accountId)
  return freeGapsFromBusy(busy, window)
}

export function computeMutualFree(
  window: Interval,
  bufferHost: number,
  selHost: SelectionRow[],
  resHost: ReservationRow[],
  hostId: string,
  bufferGuest: number,
  selGuest: SelectionRow[],
  resGuest: ReservationRow[],
  guestId: string
): Interval[] {
  const hostFree = computeFreeGapsForAccount(window, bufferHost, selHost, resHost, hostId)
  const guestFree = computeFreeGapsForAccount(window, bufferGuest, selGuest, resGuest, guestId)
  return intersectFree(hostFree, guestFree)
}

export function computeConflictOverlay(
  window: Interval,
  bufferA: number,
  selA: SelectionRow[],
  resA: ReservationRow[],
  idA: string,
  bufferB: number,
  selB: SelectionRow[],
  resB: ReservationRow[],
  idB: string
): Interval[] {
  const busyA = computeBusyForAccount(window, bufferA, selA, resA, idA)
  const busyB = computeBusyForAccount(window, bufferB, selB, resB, idB)
  return mergeBusyUnion(busyA, busyB, window)
}

export { intersectFree, intervalFullyInsideWindow, freeGapsFromBusy } from './intervals'
