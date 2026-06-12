import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'

/** Always hit origin + Supabase; avoid any edge cache of an empty first response. */
export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const { data: slots, error } = await admin
      .from('dancecard_program_slots')
      .select('id, starts_at, ends_at, title, track, room, description, sort_order')
      .eq('event_id', event.id)
      .order('starts_at', { ascending: true })
      .order('sort_order', { ascending: true })
    if (error) throw error
    const body = {
      meta: {
        productTitle: event.product_title,
        eventTitle: event.event_title,
        subtitle: event.subtitle,
        timezone: event.timezone,
        windowStartsAt: event.window_starts_at,
        windowEndsAt: event.window_ends_at,
        sharedByLabel: event.shared_by_label,
        sharedByDetail: event.shared_by_detail,
        logoUrl: event.logo_url,
      },
      slots: (slots ?? []).map((s) => ({
        id: s.id,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        title: s.title,
        track: s.track,
        room: s.room,
        description: s.description,
        sortOrder: s.sort_order,
      })),
    }
    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
