/**
 * Convert PAF26 "Grid" sheet (time × venue matrix) to dancecard import JSON.
 * Usage: node scripts/paf26-grid-to-json.mjs [path/to.xlsx] [out.json]
 * Default xlsx: user's Downloads path (override with argv[2]).
 */
import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'

/** May 2026 festival — all times interpreted as America/New_York (EDT, UTC-4). */
const TZ_OFFSET = '-04:00'
const YEAR = 2026
const MONTH = 5

function pad(n) {
  return String(n).padStart(2, '0')
}

function etIso(day, hour, minute) {
  return `${YEAR}-${pad(MONTH)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${TZ_OFFSET}`
}

/** Parse "Thursday May 7th" / "Fri May 8" / "Saturday, May 9th" → day of month */
function parseDayLine(cell) {
  const s = String(cell ?? '').replace(/\s+/g, ' ')
  const m = s.match(
    /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:day)?\b.*?\bMay\b\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
  )
  if (!m) return null
  return parseInt(m[1], 10)
}

function normalizeTimeToken(t) {
  return String(t ?? '')
    .trim()
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s*pm\s*$/i, ' pm')
    .replace(/\s*am\s*$/i, ' am')
}

/** Parse single clock like 1:30 pm, 10 am, 7, 5:30 pm → {h24, m} */
function parseClock(str, defaultMeridiem) {
  const raw = String(str ?? '').trim()
  const hadExplicitMeridiem = /\b(am|pm)\b/i.test(raw)
  let s = normalizeTimeToken(str).toLowerCase()
  if (!s) return null
  let mer = s.includes('pm') ? 'pm' : s.includes('am') ? 'am' : defaultMeridiem
  s = s.replace(/\s*(am|pm)\s*$/i, '').trim()
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?$/)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = m[2] ? parseInt(m[2], 10) : 0
  if (mer === 'pm' && h < 12) h += 12
  if (mer === 'am' && h === 12) h = 0
  // Only apply "assume PM" when the token had no am/pm (avoid turning 11:30 am into 11:30 pm).
  if (!hadExplicitMeridiem && defaultMeridiem === 'pm' && h < 12) h += 12
  return { h, m: min }
}

/**
 * Parse time cell into [start,end] hours/minutes on `dayOfMonth`.
 * Returns null to skip row.
 */
function parseTimeCell(timeCell, dayOfMonth) {
  let raw = String(timeCell ?? '').replace(/\s+/g, ' ').trim()
  if (!raw || /midnight/i.test(raw)) return null
  raw = raw.replace(/\u2013|\u2014/g, '-')

  const toParts = (s) =>
    s
      .split(/\s+to\s+/i)
      .flatMap((x) => x.split(/\s*-\s*/))
      .map((x) => x.trim())
      .filter(Boolean)

  let parts = toParts(raw)
  if (parts.length === 0) return null

  if (parts.length === 1) {
    const c = parseClock(parts[0], 'am')
    if (!c) return null
    let endH = c.h + 1
    let endM = c.m
    if (endH >= 24) endH = 23
    return {
      start: etIso(dayOfMonth, c.h, c.m),
      end: etIso(dayOfMonth, endH, endM),
    }
  }

  let startMer = /pm/i.test(parts[0]) ? 'pm' : /am/i.test(parts[0]) ? 'am' : null
  let c1 = parseClock(parts[0], startMer || 'am')
  if (!c1) return null
  // "7 - 8:30 pm" / "4:15 - 5:45 pm": first clock has no meridiem but the range ends in the evening.
  if (
    startMer == null &&
    parts.length >= 2 &&
    /\bpm\b/i.test(parts[1]) &&
    !/\bam\b/i.test(parts[1])
  ) {
    c1 = parseClock(parts[0], 'pm')
  }
  const endHasMer = /\b(am|pm)\b/i.test(parts[1])
  const endDefault = /pm/i.test(parts[1])
    ? 'pm'
    : /am/i.test(parts[1])
      ? 'am'
      : startMer === 'pm' || c1.h >= 12
        ? 'pm'
        : 'am'
  let c2 = parseClock(parts[1], endDefault)
  if (!c2) return null

  // "4 pm - 5:30" second clock missing meridiem → treat as pm if start is pm
  if (!/am|pm/i.test(parts[1]) && c2.h <= 12 && c1.h >= 12) {
    c2 = parseClock(parts[1] + ' pm', 'pm')
  }

  let sh = c1.h
  let sm = c1.m
  let eh = c2.h
  let em = c2.m
  if (/pm/i.test(parts[0]) && !/am|pm/i.test(parts[1]) && eh < sh) {
    eh += 12
  }
  if (eh < sh || (eh === sh && em <= sm)) {
    eh += 12
  }

  return { start: etIso(dayOfMonth, sh, sm), end: etIso(dayOfMonth, eh, em) }
}

function cleanTitle(s) {
  return String(s ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

function main() {
  const inPath =
    process.argv[2] ||
    'C:/Users/shkin/Downloads/PAF26 Schedule Daily At-A-Glance & Grid.xlsx'
  const outPath = process.argv[3] || path.join(process.cwd(), 'data', 'paf26-program-slots.json')

  if (!fs.existsSync(inPath)) {
    console.error('Input not found:', inPath)
    process.exit(1)
  }

  const wb = XLSX.readFile(inPath, { cellDates: true, raw: false })
  const sh = wb.Sheets['Grid']
  if (!sh) {
    console.error('No Grid sheet')
    process.exit(1)
  }

  const rows = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '' })
  let dayOfMonth = null
  let headers = []
  const slots = []
  let sortOrder = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || []
    const c0 = row[0]

    const d = parseDayLine(c0)
    if (d) {
      dayOfMonth = d
      headers = []
      continue
    }

    const t0 = String(c0 ?? '').trim().toLowerCase()
    if (t0.startsWith('time') && row.length > 2) {
      headers = row.map((h, idx) => {
        if (idx === 0) return 'Time'
        const t = cleanTitle(h)
        if (!t) return `Col${idx}`
        const low = t.toLowerCase()
        const cut = low.indexOf('reserve your spot')
        if (cut >= 0) return t.slice(0, cut).trim() || "Uggla's Forge"
        return t
      })
      continue
    }

    if (dayOfMonth == null || headers.length < 2) continue

    const tr = parseTimeCell(c0, dayOfMonth)
    if (!tr) continue

    for (let j = 1; j < headers.length; j++) {
      const title = cleanTitle(row[j])
      if (!title || title.length < 4) continue
      const room = headers[j] || 'Location'
      if (/^time$/i.test(room)) continue

      slots.push({
        startsAt: tr.start,
        endsAt: tr.end,
        title,
        track: 'PAF26',
        room,
        sortOrder: sortOrder++,
      })
    }
  }

  const campwide = /^(Registration Opens|Lunch in the Dining Hall|Dinner in the Dining Hall|Breakfast in the Dining Hall)/i
  for (const s of slots) {
    if (campwide.test(s.title)) s.room = 'All locations'
  }

  const starts = slots.map((s) => new Date(s.startsAt).getTime())
  const ends = slots.map((s) => new Date(s.endsAt).getTime())
  const minT = new Date(Math.min(...starts))
  const maxT = new Date(Math.max(...ends))

  const payload = {
    generatedFrom: path.basename(inPath),
    slotCount: slots.length,
    windowHint: {
      windowStartsAt: new Date(minT.getTime() - 6 * 3600 * 1000).toISOString(),
      windowEndsAt: new Date(maxT.getTime() + 12 * 3600 * 1000).toISOString(),
    },
    slots,
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify({ slots }, null, 2))
  console.log('Wrote', outPath, 'slots=', slots.length)
  console.log('Suggested window (UTC):', payload.windowHint)
}

main()
