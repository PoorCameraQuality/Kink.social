import { NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const { data: row, error } = await admin
      .from('dancecard_events')
      .select('registration_access_code')
      .eq('id', event.id)
      .maybeSingle()
    if (error) throw error
    const code = String((row as { registration_access_code?: string } | null)?.registration_access_code ?? '').trim()
    return NextResponse.json({
      requiresRegistrationCode: code.length > 0,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
