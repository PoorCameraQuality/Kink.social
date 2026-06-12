import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerProgramSlotCreateSchema } from '@/lib/dancecard/organizerSchemas'
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
    const { data: slots, error } = await admin
      .from('dancecard_program_slots')
      .select('id, starts_at, ends_at, title, track, room, description, sort_order')
      .eq('event_id', eventId)
      .order('starts_at', { ascending: true })
      .order('sort_order', { ascending: true })
    if (error) throw error
    return NextResponse.json({
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

    const body = organizerProgramSlotCreateSchema.parse(await request.json())
    assertSlotInsideWindow({
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
    })

    const { count } = await admin
      .from('dancecard_program_slots')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    const sortOrder = body.sortOrder ?? (typeof count === 'number' ? count : 0)

    const { data: row, error } = await admin
      .from('dancecard_program_slots')
      .insert({
        event_id: eventId,
        starts_at: new Date(body.startsAt).toISOString(),
        ends_at: new Date(body.endsAt).toISOString(),
        title: body.title,
        track: body.track ?? null,
        room: body.room ?? null,
        description: body.description ?? null,
        sort_order: sortOrder,
      })
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
