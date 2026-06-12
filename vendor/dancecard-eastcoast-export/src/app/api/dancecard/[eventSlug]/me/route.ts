import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { loadPrefs, loadSelections } from '@/lib/dancecard/data'
import { z, ZodError } from 'zod'
import { displayNameSchema } from '@/lib/dancecard/schemas'

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
    const buffer = await loadPrefs(admin, session.accountId)
    const selections = await loadSelections(admin, session.accountId)
    return NextResponse.json({
      account: {
        id: session.accountId,
        username: session.username,
        displayName: session.displayName,
        isStaff: session.isStaff,
      },
      prefs: { bufferMinutes: buffer },
      selections: selections.map((s) => ({
        id: s.id,
        kind: s.kind,
        slotId: s.slot_id,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        programTitle: s.program_title,
        programRoom: s.program_room,
        programTrack: s.program_track,
        note: s.note ?? null,
      })),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(
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
    const patchSchema = z.object({ displayName: displayNameSchema })
    const { displayName } = patchSchema.parse(await request.json())
    const { data, error } = await admin
      .from('dancecard_accounts')
      .update({ display_name: displayName })
      .eq('id', session.accountId)
      .select('id, display_name')
      .single()
    if (error) throw error
    return NextResponse.json({
      account: { id: data.id, displayName: data.display_name },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
