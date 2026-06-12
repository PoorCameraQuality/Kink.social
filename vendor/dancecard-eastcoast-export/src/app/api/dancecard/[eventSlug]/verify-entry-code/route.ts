import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { codesEqual } from '@/lib/dancecard/accessCodes'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'

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
    const { data: row, error } = await admin
      .from('dancecard_events')
      .select('registration_access_code')
      .eq('id', event.id)
      .maybeSingle()
    if (error) throw error
    const expected = String((row as { registration_access_code?: string } | null)?.registration_access_code ?? '').trim()
    if (!expected) {
      return NextResponse.json({ ok: true, skipped: true })
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

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
