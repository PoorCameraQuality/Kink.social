export type StaffShift = {
  role: string
  startsAt: string
  endsAt: string
}

export type StaffShiftPerson = {
  name: string
  shifts: StaffShift[]
}

export type StaffShiftRoster = {
  eventSlug: string
  people: StaffShiftPerson[]
}

export function staffShiftKey(startsAt: string, endsAt: string) {
  return `${startsAt}__${endsAt}`
}

function formatTimeInTz(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** One-line label: weekday · role (left column in roster) · start–end time in `tz`. */
export function formatStaffShiftTitle(shift: StaffShift, tz: string): string {
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: tz,
  }).format(new Date(shift.startsAt))
  const start = formatTimeInTz(shift.startsAt, tz)
  const end = formatTimeInTz(shift.endsAt, tz)
  return `${weekday} · ${shift.role} · ${start} – ${end}`
}
