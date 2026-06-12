import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

type StaffRow = {
  person_name: string
  role: string
  starts_at: string
  ends_at: string
  sort_order: number
}

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
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
    if (!session.isStaff) {
      return NextResponse.json({ error: 'staff access required' }, { status: 401 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_staff_shifts')
      .select('person_name, role, starts_at, ends_at, sort_order')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true })
    if (error) throw error

    const byName = new Map<string, { name: string; shifts: { role: string; startsAt: string; endsAt: string }[] }>()
    for (const r of (rows ?? []) as StaffRow[]) {
      const name = String(r.person_name ?? '').trim()
      if (!name) continue
      let entry = byName.get(name)
      if (!entry) {
        entry = { name, shifts: [] }
        byName.set(name, entry)
      }
      entry.shifts.push({
        role: r.role,
        startsAt: r.starts_at,
        endsAt: r.ends_at,
      })
    }

    const people = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name))
    const body = { eventSlug: slug, people }
    return NextResponse.json(body, {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
