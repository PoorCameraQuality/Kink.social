import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getDancecardAdmin, normalizeEventSlug } from '@/lib/dancecard/routeCommon'

/** Placeholder user id when `organizerDevBypassEnabled()` (API audit only; never in production). */
const DEV_BYPASS_USER_ID = '00000000-0000-4000-8000-000000000001'

/**
 * Local preview only: `next dev` + `.env.local` must set BOTH:
 *   DANCECARD_ORGANIZER_DEV_BYPASS=1
 * Unauthenticated access to organizer UI + APIs for any existing event slug.
 * Never enable in production (NODE_ENV must be `development`).
 */
export function organizerDevBypassEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.DANCECARD_ORGANIZER_DEV_BYPASS === '1'
}

export async function isUserSiteAdmin(userId: string): Promise<boolean> {
  const admin = getDancecardAdmin()
  const { data, error } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle()
  if (error || !data) return false
  return (data as { role?: string }).role === 'admin'
}

export function organizerErrorResponse(e: unknown): NextResponse {
  if (e instanceof Error) {
    if (e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (e.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (e.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (e.message === 'BAD_REQUEST') {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }
    if (e.message.startsWith('BAD_REQUEST:')) {
      return NextResponse.json({ error: e.message.replace(/^BAD_REQUEST:\s*/, '') }, { status: 400 })
    }
  }
  const msg = e instanceof Error ? e.message : 'Internal error'
  return NextResponse.json({ error: msg }, { status: 500 })
}

export function createSupabaseServerClientForOrganizer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  const cookieStore = cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // ignore when cookies are read-only (e.g. some static renders)
        }
      },
    },
  })
}

export async function getAuthedUserId(): Promise<string | null> {
  const supabase = createSupabaseServerClientForOrganizer()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user?.id) return null
  return user.id
}

export async function isUserOrganizerForSlug(userId: string, eventSlug: string): Promise<boolean> {
  const admin = getDancecardAdmin()
  const slug = normalizeEventSlug(eventSlug)
  const { data: ev, error: evErr } = await admin
    .from('dancecard_events')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (evErr || !ev) return false

  if (await isUserSiteAdmin(userId)) {
    return true
  }

  const { data: row, error } = await admin
    .from('dancecard_event_organizers')
    .select('id')
    .eq('event_id', (ev as { id: string }).id)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return false
  return Boolean(row)
}

/** Throws if not organizer; returns admin client + event id + slug row. */
export async function requireOrganizerForSlug(
  eventSlug: string
): Promise<{ userId: string; admin: SupabaseClient; eventId: string; slug: string }> {
  const admin = getDancecardAdmin()
  const slug = normalizeEventSlug(eventSlug)

  if (organizerDevBypassEnabled()) {
    const { data: ev, error: evErr } = await admin.from('dancecard_events').select('id').eq('slug', slug).maybeSingle()
    if (evErr || !ev) {
      const err = new Error('NOT_FOUND')
      ;(err as Error & { status: number }).status = 404
      throw err
    }
    return { userId: DEV_BYPASS_USER_ID, admin, eventId: (ev as { id: string }).id, slug }
  }

  const userId = await getAuthedUserId()
  if (!userId) {
    const err = new Error('UNAUTHORIZED')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
  const ok = await isUserOrganizerForSlug(userId, eventSlug)
  if (!ok) {
    const err = new Error('FORBIDDEN')
    ;(err as Error & { status: number }).status = 403
    throw err
  }
  const { data: ev, error: evErr } = await admin
    .from('dancecard_events')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (evErr || !ev) {
    const err = new Error('NOT_FOUND')
    ;(err as Error & { status: number }).status = 404
    throw err
  }
  return { userId, admin, eventId: (ev as { id: string }).id, slug }
}
