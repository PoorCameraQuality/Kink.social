import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { loadPrefs, loadReservationsForAccount, loadSelections, selectionsToBusyInput } from '@/lib/dancecard/data'
import {
  computeBusyForAccount,
  computeFreeGapsForAccount,
  computeMutualFree,
  eventWindowFromRow,
} from '@/lib/dancecard/busy'

export async function GET(
  request: NextRequest,
  context: { params: { eventSlug: string; token: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug, token } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const { data: slots } = await admin
      .from('dancecard_program_slots')
      .select('id, starts_at, ends_at, title, track, room, description, sort_order')
      .eq('event_id', event.id)
      .order('starts_at', { ascending: true })
      .order('sort_order', { ascending: true })

    const { data: link, error: lErr } = await admin
      .from('dancecard_share_links')
      .select('id, account_id, token, revoked_at')
      .eq('token', token)
      .is('revoked_at', null)
      .maybeSingle()
    if (lErr) throw lErr
    if (!link) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 })
    }

    const { data: host, error: hErr } = await admin
      .from('dancecard_accounts')
      .select('id, display_name, event_id')
      .eq('id', link.account_id)
      .maybeSingle()
    if (hErr || !host || host.event_id !== event.id) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }

    const window = eventWindowFromRow({
      window_starts_at: event.window_starts_at,
      window_ends_at: event.window_ends_at,
    })
    const hostBuffer = await loadPrefs(admin, host.id)
    const hostSel = await loadSelections(admin, host.id)
    const hostRes = await loadReservationsForAccount(admin, event.id, host.id)
    const hostBusy = computeBusyForAccount(
      window,
      hostBuffer,
      selectionsToBusyInput(hostSel),
      hostRes,
      host.id
    )
    const hostFree = computeFreeGapsForAccount(
      window,
      hostBuffer,
      selectionsToBusyInput(hostSel),
      hostRes,
      host.id
    )

    const viewer = await resolveAccountFromSession(admin, request, slug)
    let mutualFree: { start: string; end: string }[] | null = null
    let viewerYou: string | null = null
    if (viewer && viewer.accountId !== host.id) {
      viewerYou = viewer.displayName
      const vb = await loadPrefs(admin, viewer.accountId)
      const vs = await loadSelections(admin, viewer.accountId)
      const vr = await loadReservationsForAccount(admin, event.id, viewer.accountId)
      const m = computeMutualFree(
        window,
        hostBuffer,
        selectionsToBusyInput(hostSel),
        hostRes,
        host.id,
        vb,
        selectionsToBusyInput(vs),
        vr,
        viewer.accountId
      )
      mutualFree = m.map((g) => ({ start: g.start.toISOString(), end: g.end.toISOString() }))
    }

    return NextResponse.json({
      meta: {
        productTitle: event.product_title,
        eventTitle: event.event_title,
        subtitle: event.subtitle,
        timezone: event.timezone,
        windowStartsAt: event.window_starts_at,
        windowEndsAt: event.window_ends_at,
        sharedByLabel: event.shared_by_label,
        sharedByDetail: event.shared_by_detail,
        logoUrl: event.logo_url,
      },
      host: { id: host.id, displayName: host.display_name },
      viewerYou,
      hostFreeGaps: hostFree.map((g) => ({ start: g.start.toISOString(), end: g.end.toISOString() })),
      hostBusy: hostBusy.map((g) => ({ start: g.start.toISOString(), end: g.end.toISOString() })),
      mutualFreeGaps: mutualFree,
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
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
