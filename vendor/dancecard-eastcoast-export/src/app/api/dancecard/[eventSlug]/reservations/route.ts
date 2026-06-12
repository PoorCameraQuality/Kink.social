import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'

export async function GET(
  request: NextRequest,
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
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_reservations')
      .select('id, host_account_id, guest_account_id, starts_at, ends_at, status, note, created_at')
      .eq('event_id', event.id)
      .or(`host_account_id.eq.${session.accountId},guest_account_id.eq.${session.accountId}`)
      .order('created_at', { ascending: false })
    if (error) throw error
    const list = rows ?? []
    if (!list.length) {
      return NextResponse.json({ reservations: [] })
    }
    const ids = Array.from(new Set(list.flatMap((r) => [r.host_account_id, r.guest_account_id])))
    const { data: names } = await admin.from('dancecard_accounts').select('id, display_name').in('id', ids)
    const nameBy = new Map((names ?? []).map((n) => [n.id, n.display_name as string]))
    return NextResponse.json({
      reservations: list.map((b) => ({
        id: b.id,
        status: b.status,
        startsAt: b.starts_at,
        endsAt: b.ends_at,
        note: b.note,
        role: b.host_account_id === session.accountId ? 'host' : 'guest',
        host: { id: b.host_account_id, displayName: nameBy.get(b.host_account_id) ?? '?' },
        guest: { id: b.guest_account_id, displayName: nameBy.get(b.guest_account_id) ?? '?' },
        createdAt: b.created_at,
      })),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
