import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReservationRow, SelectionRow } from './busy'

export async function loadPrefs(admin: SupabaseClient, accountId: string): Promise<number> {
  const { data } = await admin
    .from('dancecard_prefs')
    .select('buffer_minutes')
    .eq('account_id', accountId)
    .maybeSingle()
  return data?.buffer_minutes ?? 0
}

export type LoadedSelectionRow = {
  id: string
  kind: string
  slot_id: string | null
  starts_at: string
  ends_at: string
  note: string | null
  /** Joined from dancecard_program_slots when kind is program */
  program_title: string | null
  program_room: string | null
  program_track: string | null
}

export async function loadSelections(admin: SupabaseClient, accountId: string): Promise<LoadedSelectionRow[]> {
  const { data, error } = await admin
    .from('dancecard_selections')
    .select(
      `
      id,
      kind,
      slot_id,
      starts_at,
      ends_at,
      note,
      dancecard_program_slots ( title, room, track )
    `,
    )
    .eq('account_id', accountId)
    .order('starts_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row: Record<string, unknown>) => {
    const slot = row.dancecard_program_slots as {
      title: string
      room: string | null
      track: string | null
    } | null | undefined
    return {
      id: row.id as string,
      kind: row.kind as string,
      slot_id: (row.slot_id as string | null) ?? null,
      starts_at: row.starts_at as string,
      ends_at: row.ends_at as string,
      note: (row.note as string | null) ?? null,
      program_title: slot?.title ?? null,
      program_room: slot?.room ?? null,
      program_track: slot?.track ?? null,
    }
  })
}

export async function loadReservationsForAccount(
  admin: SupabaseClient,
  eventId: string,
  accountId: string
): Promise<ReservationRow[]> {
  const { data, error } = await admin
    .from('dancecard_reservations')
    .select('host_account_id, guest_account_id, starts_at, ends_at, status')
    .eq('event_id', eventId)
    .or(`host_account_id.eq.${accountId},guest_account_id.eq.${accountId}`)
  if (error) throw error
  return (data ?? []) as ReservationRow[]
}

export function selectionsToBusyInput(
  rows: { starts_at: string; ends_at: string }[]
): SelectionRow[] {
  return rows.map((r) => ({ starts_at: r.starts_at, ends_at: r.ends_at }))
}
