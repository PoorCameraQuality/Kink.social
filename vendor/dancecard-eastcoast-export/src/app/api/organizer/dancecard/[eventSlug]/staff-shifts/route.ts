import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerStaffShiftCreateSchema } from '@/lib/dancecard/organizerSchemas'
import { assertSlotInsideWindow } from '@/lib/dancecard/organizerSlotValidation'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_staff_shifts')
      .select('id, person_name, role, starts_at, ends_at, sort_order')
      .eq('event_id', eventId)
      .order('starts_at', { ascending: true })
      .order('sort_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({
      shifts: (rows ?? []).map((r) => ({
        id: r.id,
        personName: r.person_name,
        role: r.role,
        startsAt: r.starts_at,
        endsAt: r.ends_at,
        sortOrder: r.sort_order,
      })),
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      timezone: event.timezone,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = organizerStaffShiftCreateSchema.parse(await request.json())
    assertSlotInsideWindow({
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
    })

    const { count } = await admin
      .from('dancecard_staff_shifts')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    const sortOrder = body.sortOrder ?? (typeof count === 'number' ? count : 0)

    const { data: row, error } = await admin
      .from('dancecard_staff_shifts')
      .insert({
        event_id: eventId,
        person_name: body.personName,
        role: body.role,
        starts_at: new Date(body.startsAt).toISOString(),
        ends_at: new Date(body.endsAt).toISOString(),
        sort_order: sortOrder,
      })
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
