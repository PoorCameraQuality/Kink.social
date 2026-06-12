import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { hashToken, DANCECARD_SESSION_COOKIE } from './session'

export function normalizeEventSlug(raw: string): string {
  return raw.trim().toLowerCase()
}

export function getDancecardAdmin(): SupabaseClient {
  const admin = getSupabaseAdminClient()
  if (!admin) {
    throw new Error('Dancecard requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL')
  }
  return admin
}

export async function loadEventBySlug(admin: SupabaseClient, eventSlug: string) {
  const slug = normalizeEventSlug(eventSlug)
  const { data, error } = await admin
    .from('dancecard_events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  return data as
    | {
        id: string
        slug: string
        product_title: string
        event_title: string
        subtitle: string | null
        timezone: string
        window_starts_at: string
        window_ends_at: string
        shared_by_label: string
        shared_by_detail: string | null
        logo_url: string | null
        status: string
        staff_access_code?: string | null
        registration_access_code?: string | null
      }
    | null
}

/** Load event by slug for any status (draft or published). Service-role only. */
export async function loadEventBySlugAnyStatus(admin: SupabaseClient, eventSlug: string) {
  const slug = normalizeEventSlug(eventSlug)
  const { data, error } = await admin.from('dancecard_events').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data as
    | {
        id: string
        slug: string
        product_title: string
        event_title: string
        subtitle: string | null
        timezone: string
        window_starts_at: string
        window_ends_at: string
        shared_by_label: string
        shared_by_detail: string | null
        logo_url: string | null
        status: string
        staff_access_code?: string | null
        registration_access_code?: string | null
      }
    | null
}

export async function resolveAccountFromSession(
  admin: SupabaseClient,
  request: NextRequest,
  eventSlug: string
): Promise<{
  accountId: string
  username: string
  displayName: string
  eventId: string
  isStaff: boolean
} | null> {
  const token = request.cookies.get(DANCECARD_SESSION_COOKIE)?.value
  if (!token) return null
  const tokenHash = hashToken(token)
  const nowIso = new Date().toISOString()
  const { data: sess, error: sErr } = await admin
    .from('dancecard_sessions')
    .select('id, account_id, expires_at')
    .eq('token_hash', tokenHash)
    .gt('expires_at', nowIso)
    .maybeSingle()
  if (sErr || !sess) return null

  const { data: acc, error: aErr } = await admin
    .from('dancecard_accounts')
    .select('id, username, display_name, event_id, is_staff')
    .eq('id', sess.account_id)
    .maybeSingle()
  if (aErr || !acc) return null

  const { data: ev } = await admin
    .from('dancecard_events')
    .select('slug')
    .eq('id', acc.event_id)
    .maybeSingle()
  if (!ev || normalizeEventSlug(ev.slug) !== normalizeEventSlug(eventSlug)) return null

  return {
    accountId: acc.id,
    username: acc.username,
    displayName: acc.display_name,
    eventId: acc.event_id,
    isStaff: Boolean((acc as { is_staff?: boolean }).is_staff),
  }
}
