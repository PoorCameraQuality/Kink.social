import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { dancecardPutSchema } from '@/lib/dancecard/schemas'
import { eventWindowFromRow, parseIso } from '@/lib/dancecard/busy'
import { ZodError } from 'zod'

export async function PUT(
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
    const body = dancecardPutSchema.parse(await request.json())
    if (body.bufferMinutes % 15 !== 0) {
      return NextResponse.json({ error: 'bufferMinutes must be a multiple of 15' }, { status: 400 })
    }
    const window = eventWindowFromRow({
      window_starts_at: event.window_starts_at,
      window_ends_at: event.window_ends_at,
    })

    const normalized: {
      slot_id: string | null
      starts_at: string
      ends_at: string
      kind: string
      note: string | null
    }[] = []

    for (const sel of body.selections) {
      const start = parseIso(sel.startsAt)
      const end = parseIso(sel.endsAt)
      if (end <= start) {
        return NextResponse.json({ error: 'Each selection needs endsAt > startsAt' }, { status: 400 })
      }
      if (start < window.start || end > window.end) {
        return NextResponse.json({ error: 'Selections must fall inside the event window' }, { status: 400 })
      }
      if (sel.kind === 'program') {
        if (!sel.slotId) {
          return NextResponse.json({ error: 'program selections require slotId' }, { status: 400 })
        }
        const { data: slot, error: slotErr } = await admin
          .from('dancecard_program_slots')
          .select('id, starts_at, ends_at')
          .eq('id', sel.slotId)
          .eq('event_id', event.id)
          .maybeSingle()
        if (slotErr) throw slotErr
        if (!slot) {
          return NextResponse.json({ error: `Unknown slot ${sel.slotId}` }, { status: 400 })
        }
        const slotStart = parseIso(slot.starts_at as string)
        const slotEnd = parseIso(slot.ends_at as string)
        if (slotStart.getTime() !== start.getTime() || slotEnd.getTime() !== end.getTime()) {
          return NextResponse.json(
            { error: 'Program selection times must match the official slot' },
            { status: 400 }
          )
        }
        const note = sel.note?.trim() ? sel.note.trim().slice(0, 1000) : null
        normalized.push({
          slot_id: slot.id,
          starts_at: sel.startsAt,
          ends_at: sel.endsAt,
          kind: 'program',
          note,
        })
      } else {
        const note = sel.note?.trim() ? sel.note.trim().slice(0, 1000) : null
        normalized.push({
          slot_id: null,
          starts_at: sel.startsAt,
          ends_at: sel.endsAt,
          kind: 'manual',
          note,
        })
      }
    }

    const { error: delErr } = await admin
      .from('dancecard_selections')
      .delete()
      .eq('account_id', session.accountId)
    if (delErr) throw delErr

    const { error: upPref } = await admin
      .from('dancecard_prefs')
      .update({ buffer_minutes: body.bufferMinutes, updated_at: new Date().toISOString() })
      .eq('account_id', session.accountId)
    if (upPref) throw upPref

    if (normalized.length) {
      const { error: insErr } = await admin.from('dancecard_selections').insert(
        normalized.map((n) => ({
          account_id: session.accountId,
          slot_id: n.slot_id,
          starts_at: n.starts_at,
          ends_at: n.ends_at,
          kind: n.kind,
          note: n.note,
        }))
      )
      if (insErr) throw insErr
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
