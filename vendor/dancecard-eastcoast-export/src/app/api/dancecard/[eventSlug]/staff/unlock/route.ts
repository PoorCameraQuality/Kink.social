import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { codesEqual } from '@/lib/dancecard/accessCodes'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  code: z.string().min(1).max(200),
})

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.isStaff) {
      return NextResponse.json({ ok: true, alreadyStaff: true })
    }

    const { data: evRow, error: evErr } = await admin
      .from('dancecard_events')
      .select('staff_access_code')
      .eq('id', event.id)
      .maybeSingle()
    if (evErr) throw evErr
    const expected = String((evRow as { staff_access_code?: string } | null)?.staff_access_code ?? '').trim()
    if (!expected) {
      return NextResponse.json({ error: 'Staff access is not configured for this event' }, { status: 503 })
    }

    let parsed: z.infer<typeof bodySchema>
    try {
      parsed = bodySchema.parse(await request.json())
    } catch {
      await sleep(80)
      return NextResponse.json({ error: 'invalid code' }, { status: 401 })
    }

    const ok = codesEqual(parsed.code.trim(), expected)
    if (!ok) {
      await sleep(120)
      return NextResponse.json({ error: 'invalid code' }, { status: 401 })
    }

    const { error: upErr } = await admin
      .from('dancecard_accounts')
      .update({ is_staff: true })
      .eq('id', session.accountId)
      .eq('event_id', event.id)
    if (upErr) throw upErr

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
