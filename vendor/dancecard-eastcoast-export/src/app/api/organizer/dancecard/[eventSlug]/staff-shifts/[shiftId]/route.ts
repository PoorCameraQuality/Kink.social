import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerStaffShiftPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { assertSlotInsideWindow } from '@/lib/dancecard/organizerSlotValidation'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; shiftId: string } }
) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const shiftId = context.params.shiftId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_staff_shifts')
      .select('id, person_name, role, starts_at, ends_at, sort_order')
      .eq('id', shiftId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }

    const body = organizerStaffShiftPatchSchema.parse(await request.json())
    const startsAt = body.startsAt ?? existing.starts_at
    const endsAt = body.endsAt ?? existing.ends_at
    assertSlotInsideWindow({
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      startsAt,
      endsAt,
    })

    const patch: Record<string, unknown> = {}
    if (body.personName !== undefined) patch.person_name = body.personName
    if (body.role !== undefined) patch.role = body.role
    if (body.startsAt !== undefined) patch.starts_at = new Date(body.startsAt).toISOString()
    if (body.endsAt !== undefined) patch.ends_at = new Date(body.endsAt).toISOString()
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data: row, error } = await admin
      .from('dancecard_staff_shifts')
      .update(patch)
      .eq('id', shiftId)
      .eq('event_id', eventId)
      .select('id, person_name, role, starts_at, ends_at, sort_order')
      .single()
    if (error) throw error

    return NextResponse.json({
      shift: {
        id: row.id,
        personName: row.person_name,
        role: row.role,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
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

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; shiftId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const shiftId = context.params.shiftId
    const { data, error } = await admin
      .from('dancecard_staff_shifts')
      .delete()
      .eq('id', shiftId)
      .eq('event_id', eventId)
      .select('id')
    if (error) throw error
    if (!data?.length) {
      return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
