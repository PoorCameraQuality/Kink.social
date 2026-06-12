import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerProgramSlotPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { assertSlotInsideWindow } from '@/lib/dancecard/organizerSlotValidation'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; slotId: string } }
) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const slotId = context.params.slotId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_program_slots')
      .select('id, starts_at, ends_at, title, track, room, description, sort_order')
      .eq('id', slotId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    const body = organizerProgramSlotPatchSchema.parse(await request.json())
    const startsAt = body.startsAt ?? existing.starts_at
    const endsAt = body.endsAt ?? existing.ends_at
    assertSlotInsideWindow({
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      startsAt,
      endsAt,
    })

    const patch: Record<string, unknown> = {}
    if (body.startsAt !== undefined) patch.starts_at = new Date(body.startsAt).toISOString()
    if (body.endsAt !== undefined) patch.ends_at = new Date(body.endsAt).toISOString()
    if (body.title !== undefined) patch.title = body.title
    if (body.track !== undefined) patch.track = body.track
    if (body.room !== undefined) patch.room = body.room
    if (body.description !== undefined) patch.description = body.description
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: row, error } = await admin
      .from('dancecard_program_slots')
      .update(patch)
      .eq('id', slotId)
      .eq('event_id', eventId)
      .select('id, starts_at, ends_at, title, track, room, description, sort_order')
      .single()
    if (error) throw error

    return NextResponse.json({
      slot: {
        id: row.id,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        title: row.title,
        track: row.track,
        room: row.room,
        description: row.description,
        sortOrder: row.sort_order,
      },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; slotId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const slotId = context.params.slotId
    const { data, error } = await admin
      .from('dancecard_program_slots')
      .delete()
      .eq('id', slotId)
      .eq('event_id', eventId)
      .select('id')
    if (error) throw error
    if (!data?.length) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
