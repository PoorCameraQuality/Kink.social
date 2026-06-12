/**
 * One-shot repair for data/paf26-program-slots.json after bad Excel→JSON parses.
 * Run: node scripts/paf26-repair-program-slots.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const TZ = '-04:00'
const jsonPath = path.join(process.cwd(), 'data', 'paf26-program-slots.json')

function nextCalendarDay(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(y, m - 1, d + 1)
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

function setDay(iso, day) {
  const d = String(day).padStart(2, '0')
  return iso.replace(/^\d{4}-\d{2}-\d{2}/, `2026-05-${d}`)
}

function main() {
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  const slots = raw.slots
  if (!Array.isArray(slots)) throw new Error('Expected { slots: [] }')

  const out = slots.map((s) => {
    let { startsAt, endsAt, room, title, sortOrder } = s

    if (room && /uggla'?s forge/i.test(room)) {
      const i = room.toLowerCase().indexOf('reserve your spot')
      if (i >= 0) room = room.slice(0, i).trim()
    }

    if (
      /^(Registration Opens|Lunch in the Dining Hall|Dinner in the Dining Hall|Breakfast in the Dining Hall)/i.test(
        title,
      )
    ) {
      room = 'All locations'
    }

    // "10 am – 11:30 am" parsed end as 11:30 pm
    if (endsAt.includes('T23:30:00') && /T1[01]:[0-5][0-9]:00/.test(startsAt)) {
      const d = startsAt.slice(0, 10)
      endsAt = `${d}T11:30:00${TZ}`
    }

    if (title.startsWith('Breakfast in the Dining') && endsAt.includes('T21:30')) {
      const d = startsAt.slice(0, 10)
      endsAt = `${d}T09:30:00${TZ}`
    }

    // Excel often dropped "pm" on the first clock: "7 - 8:30 pm" → 7:00am–8:30pm same day (13+ hours).
    const dayS = startsAt.slice(0, 10)
    const dayE = endsAt.slice(0, 10)
    if (dayS === dayE && startsAt.includes('T07:00:00')) {
      const dur = (new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 36e5
      if (dur >= 11) {
        startsAt = `${dayS}T19:00:00${TZ}`
        if (endsAt.includes('T20:30:00')) endsAt = `${dayS}T20:30:00${TZ}`
        else if (endsAt.includes('T21:30:00')) endsAt = `${dayS}T20:30:00${TZ}`
      }
    }

    if (startsAt.includes('T04:15:00') && endsAt.includes('T17:45:00')) {
      const d = startsAt.slice(0, 10)
      startsAt = `${d}T16:15:00${TZ}`
      endsAt = `${d}T17:45:00${TZ}`
    }

    if (typeof sortOrder === 'number' && sortOrder >= 46 && sortOrder <= 78) {
      if (startsAt.includes('2026-05-08')) startsAt = setDay(startsAt, 9)
      if (endsAt.includes('2026-05-08')) endsAt = setDay(endsAt, 9)
    }

    if (typeof sortOrder === 'number' && sortOrder >= 106) {
      if (startsAt.includes('2026-05-10')) startsAt = setDay(startsAt, 11)
      if (endsAt.includes('2026-05-10')) endsAt = setDay(endsAt, 11)
    }

    if (title.includes('Death Fetish 101') && title.includes('Rebecca Doll')) {
      const d = startsAt.slice(0, 10)
      startsAt = `${d}T13:30:00${TZ}`
      endsAt = `${d}T15:00:00${TZ}`
    }

    if (title.includes("Uggla's Session Number Seven")) {
      const d = startsAt.slice(0, 10)
      startsAt = `${d}T13:00:00${TZ}`
      endsAt = `${d}T15:30:00${TZ}`
    }

    if (title.startsWith('Concluding Ritual')) {
      startsAt = `2026-05-11T11:00:00${TZ}`
      endsAt = `2026-05-11T11:30:00${TZ}`
    }
    if (title.startsWith('Brunch')) {
      startsAt = `2026-05-11T10:00:00${TZ}`
      endsAt = `2026-05-11T12:00:00${TZ}`
    }
    if (title.startsWith('Goodbye')) {
      startsAt = `2026-05-11T13:00:00${TZ}`
      endsAt = `2026-05-11T13:30:00${TZ}`
    }

    if (title.includes('Mead, Wead,')) {
      title = title.replace('Mead, Wead,', 'Mead, Weed,')
    }

    if (title.includes('Ritual Alternative Revel')) {
      startsAt = `2026-05-09T22:00:00${TZ}`
      endsAt = `2026-05-10T02:00:00${TZ}`
    }
    if (
      (title.includes('Fire 401: Fire Caning') || title.includes('Ritual Fire Night Three')) &&
      endsAt.includes('T24:00:00')
    ) {
      const d = startsAt.slice(0, 10)
      endsAt = `${d}T23:30:00${TZ}`
    }

    if (endsAt.includes('T24:00:00')) {
      const nextD = nextCalendarDay(startsAt.slice(0, 10))
      endsAt = `${nextD}T00:00:00${TZ}`
    }

    return { ...s, startsAt, endsAt, room, title }
  })

  fs.writeFileSync(jsonPath, JSON.stringify({ slots: out }, null, 2))
  console.log('Repaired', out.length, 'slots →', jsonPath)
}

main()
