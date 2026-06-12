/** Build RFC 5545 .ics for a personal dancecard (program + manual + reservations). */

export type IcsSelection = {
  id: string
  kind: string
  startsAt: string
  endsAt: string
  programTitle?: string | null
  programRoom?: string | null
  note?: string | null
}

export type IcsReservation = {
  id: string
  startsAt: string
  endsAt: string
  note: string | null
  role: string
  host: { displayName: string }
  guest: { displayName: string }
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function formatUtcForIcs(iso: string): string | null {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  return new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function reservationPartnerName(r: IcsReservation): string {
  return r.role === 'host' ? r.guest.displayName : r.host.displayName
}

type IcEvent = { uid: string; start: string; end: string; summary: string; description: string | null }

export function countDancecardIcsEvents(selections: IcsSelection[], reservations: IcsReservation[]): number {
  let n = 0
  for (const s of selections) {
    if (s.kind !== 'program' && s.kind !== 'manual') continue
    if (Date.parse(s.endsAt) <= Date.parse(s.startsAt)) continue
    if (!formatUtcForIcs(s.startsAt) || !formatUtcForIcs(s.endsAt)) continue
    n++
  }
  for (const r of reservations) {
    if (Date.parse(r.endsAt) <= Date.parse(r.startsAt)) continue
    if (!formatUtcForIcs(r.startsAt) || !formatUtcForIcs(r.endsAt)) continue
    n++
  }
  return n
}

function collectEvents(
  selections: IcsSelection[],
  reservations: IcsReservation[],
  attendeeName: string
): IcEvent[] {
  const out: IcEvent[] = []

  for (const s of selections) {
    const ds = formatUtcForIcs(s.startsAt)
    const de = formatUtcForIcs(s.endsAt)
    if (!ds || !de) continue
    if (Date.parse(s.endsAt) <= Date.parse(s.startsAt)) continue

    if (s.kind === 'program') {
      const title = (s.programTitle ?? 'Program session').trim() || 'Program session'
      const room = (s.programRoom ?? '').trim()
      const note = (s.note ?? '').trim()
      const desc = [room ? `Room: ${room}` : null, note ? `Note: ${note}` : null, `Event: ${attendeeName}`]
        .filter(Boolean)
        .join('\n')
      out.push({
        uid: `${s.id}@dancecard.eastcoastkinkevents`,
        start: ds,
        end: de,
        summary: title,
        description: desc,
      })
    } else if (s.kind === 'manual') {
      const note = (s.note ?? '').trim()
      out.push({
        uid: `${s.id}@dancecard.eastcoastkinkevents`,
        start: ds,
        end: de,
        summary: 'Busy (dancecard)',
        description: [note ? `Note: ${note}` : null, `Manual busy block`, attendeeName].filter(Boolean).join('\n'),
      })
    }
  }

  for (const r of reservations) {
    const ds = formatUtcForIcs(r.startsAt)
    const de = formatUtcForIcs(r.endsAt)
    if (!ds || !de) continue
    if (Date.parse(r.endsAt) <= Date.parse(r.startsAt)) continue
    const partner = reservationPartnerName(r)
    const note = (r.note ?? '').trim()
    const desc = [note ? `Note: ${note}` : null, attendeeName].filter(Boolean).join('\n')
    out.push({
      uid: `${r.id}@dancecard.eastcoastkinkevents`,
      start: ds,
      end: de,
      summary: `Together with ${partner}`,
      description: desc,
    })
  }

  out.sort((a, b) => a.start.localeCompare(b.start))
  return out
}

export function buildDancecardIcs(args: {
  calendarName: string
  attendeeDisplayName: string
  selections: IcsSelection[]
  reservations: IcsReservation[]
}): string {
  const events = collectEvents(args.selections, args.reservations, args.attendeeDisplayName)
  const stamp = formatUtcForIcs(new Date().toISOString()) ?? '19700101T000000Z'

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//East Coast Kink Events//Dancecard//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(args.calendarName)}`,
  ]

  for (const ev of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.uid}`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`DTSTART:${ev.start}`)
    lines.push(`DTEND:${ev.end}`)
    lines.push(`SUMMARY:${escapeIcsText(ev.summary.slice(0, 200))}`)
    if (ev.description) lines.push(`DESCRIPTION:${escapeIcsText(ev.description.slice(0, 2000))}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/** Selections only (no reservations) — used by GET /api/dancecard/.../ics */
export function buildDancecardSelectionsOnlyIcs(args: {
  calendarName: string
  attendeeDisplayName: string
  selections: IcsSelection[]
}): string {
  const emptyReservations: IcsReservation[] = []
  return buildDancecardIcs({
    calendarName: args.calendarName,
    attendeeDisplayName: args.attendeeDisplayName,
    selections: args.selections,
    reservations: emptyReservations,
  })
}

export function downloadIcsFile(filename: string, icsBody: string) {
  const blob = new Blob([icsBody], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function googleCalendarImportHintUrl(): string {
  return 'https://support.google.com/calendar/answer/37118'
}
