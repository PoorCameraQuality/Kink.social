import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerPatchEventSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({
      event: {
        id: event.id,
        slug: event.slug,
        productTitle: event.product_title,
        eventTitle: event.event_title,
        subtitle: event.subtitle,
        timezone: event.timezone,
        windowStartsAt: event.window_starts_at,
        windowEndsAt: event.window_ends_at,
        sharedByLabel: event.shared_by_label,
        sharedByDetail: event.shared_by_detail,
        logoUrl: event.logo_url,
        status: event.status,
        staffAccessCode: event.staff_access_code ?? '',
        registrationAccessCode: event.registration_access_code ?? '',
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = organizerPatchEventSchema.parse(await request.json())
    const patch: Record<string, unknown> = {}
    if (body.productTitle !== undefined) patch.product_title = body.productTitle
    if (body.eventTitle !== undefined) patch.event_title = body.eventTitle
    if (body.subtitle !== undefined) patch.subtitle = body.subtitle
    if (body.timezone !== undefined) patch.timezone = body.timezone
    if (body.windowStartsAt !== undefined) patch.window_starts_at = new Date(body.windowStartsAt).toISOString()
    if (body.windowEndsAt !== undefined) patch.window_ends_at = new Date(body.windowEndsAt).toISOString()
    if (body.sharedByLabel !== undefined) patch.shared_by_label = body.sharedByLabel
    if (body.sharedByDetail !== undefined) patch.shared_by_detail = body.sharedByDetail
    if (body.logoUrl !== undefined) {
      patch.logo_url = body.logoUrl === '' ? null : body.logoUrl
    }
    if (body.status !== undefined) patch.status = body.status
    if (body.staffAccessCode !== undefined) {
      patch.staff_access_code =
        body.staffAccessCode === '' || body.staffAccessCode === null ? null : body.staffAccessCode
    }
    if (body.registrationAccessCode !== undefined) {
      patch.registration_access_code =
        body.registrationAccessCode === '' || body.registrationAccessCode === null
          ? null
          : body.registrationAccessCode
    }

    if (body.windowStartsAt !== undefined && body.windowEndsAt !== undefined) {
      const a = new Date(body.windowStartsAt).getTime()
      const b = new Date(body.windowEndsAt).getTime()
      if (a >= b) {
        return NextResponse.json({ error: 'windowStartsAt must be before windowEndsAt' }, { status: 400 })
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('dancecard_events')
      .update(patch)
      .eq('id', eventId)
      .select(
        'id, slug, product_title, event_title, subtitle, timezone, window_starts_at, window_ends_at, shared_by_label, shared_by_detail, logo_url, status, staff_access_code, registration_access_code',
      )
      .single()
    if (error) throw error

    const row = data as {
      id: string
      slug: string
      product_title: string
      event_title: string
      subtitle: string | null
      timezone: string
      window_starts_at: string
      window_ends_at: string
      shared_by_label: string
      shared_by_detail: string | null
      logo_url: string | null
      status: string
      staff_access_code: string | null
      registration_access_code: string | null
    }

    return NextResponse.json({
      event: {
        id: row.id,
        slug: row.slug,
        productTitle: row.product_title,
        eventTitle: row.event_title,
        subtitle: row.subtitle,
        timezone: row.timezone,
        windowStartsAt: row.window_starts_at,
        windowEndsAt: row.window_ends_at,
        sharedByLabel: row.shared_by_label,
        sharedByDetail: row.shared_by_detail,
        logoUrl: row.logo_url,
        status: row.status,
        staffAccessCode: row.staff_access_code ?? '',
        registrationAccessCode: row.registration_access_code ?? '',
      },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
