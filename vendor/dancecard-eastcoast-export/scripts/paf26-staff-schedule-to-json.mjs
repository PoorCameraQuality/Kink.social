import fs from 'node:fs'
import path from 'node:path'
import XLSX from 'xlsx'

const SHEET_DATE_MAP = {
  'Tuesday (Build)': '2026-05-05',
  'Wednesday (Build)': '2026-05-06',
  Thursday: '2026-05-07',
  Friday: '2026-05-08',
  Saturday: '2026-05-09',
  Sunday: '2026-05-10',
  'Monday(Strike)': '2026-05-11',
}

const SKIP_NAME_RE =
  /^(lunch|dinner|breakfast|brunch|meal plans?|please arrive|you are welcome|staff fire|overnight onsite lodging|opening ritual|half hour blocks)/i

function pad(n) {
  return String(n).padStart(2, '0')
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00-04:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function parseClockLabel(clock) {
  const m = String(clock).trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)\.?$/i)
  if (!m) return null
  let hour = Number(m[1]) % 12
  const minute = Number(m[2])
  if (m[3].toUpperCase().startsWith('P')) hour += 12
  return hour * 60 + minute
}

function parseRangeLabel(value) {
  const m = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .match(/(\d{1,2}:\d{2}\s*[AP]M)\s+(\d{1,2}:\d{2}\s*[AP]M)/i)
  if (!m) return null
  return [m[1], m[2]]
}

function formatIso(dateStr, minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${dateStr}T${pad(hours)}:${pad(mins)}:00-04:00`
}

function looksLikeName(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!text || SKIP_NAME_RE.test(text)) return false
  if (/^break$/i.test(text)) return false
  if (text.length > 40) return false
  if (!/[A-Za-z]/.test(text)) return false
  if (/[,:;*]/.test(text)) return false
  const words = text.split(' ').filter(Boolean)
  if (words.length > 4) return false
  return /^[A-Za-z0-9 _()/'’.\-]+$/.test(text)
}

function normalizeRole(role) {
  let r = String(role ?? '').trim()
  if (/strike crew until/i.test(r)) return 'Strike Crew'
  if (r === 'Presenter Liason') return 'Presenter Liaison'
  if (r === 'Entrace Greeter') return 'Entrance Greeter'
  return r
}

const GAP_MERGE_MS = 120 * 60 * 1000

/** Merge same-role shifts that touch; then merge across gaps ≤120min (same person, any role). */
function mergeAdjacentShifts(shifts) {
  const norm = shifts.map((s) => ({
    ...s,
    role: normalizeRole(s.role),
  }))
  norm.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.role.localeCompare(b.role))
  const pass1 = []
  for (const s of norm) {
    const prev = pass1[pass1.length - 1]
    if (prev && prev.role === s.role && prev.endsAt === s.startsAt) prev.endsAt = s.endsAt
    else pass1.push({ ...s })
  }
  const pass2 = []
  for (const s of pass1) {
    const prev = pass2[pass2.length - 1]
    if (prev) {
      const gap = Date.parse(s.startsAt) - Date.parse(prev.endsAt)
      if (gap >= 0 && gap <= GAP_MERGE_MS) {
        if (!prev._roles) prev._roles = [prev.role]
        if (!prev._roles.includes(s.role)) prev._roles.push(s.role)
        prev.endsAt = s.endsAt
        const uniq = [...new Set(prev._roles)]
        prev.role = uniq.length === 1 ? uniq[0] : `${uniq[0]} (+${uniq.length - 1} more roles)`
        continue
      }
    }
    pass2.push({ ...s })
  }
  return pass2.map(({ _roles, ...rest }) => rest)
}

function postProcessPeople(people) {
  const list = Array.from(people.entries()).map(([name, shifts]) => {
    let s = mergeAdjacentShifts(shifts)
    if (name === 'barbs') s = s.filter((x) => x.role !== 'MOD B')
    let displayName = name
    if (name === 'Adrienne / Athena516') displayName = 'Adrienne / Athena816'
    return [displayName, s]
  })
  const merged = new Map()
  for (const [name, shifts] of list) {
    if (!merged.has(name)) merged.set(name, [])
    merged.get(name).push(...shifts)
  }
  for (const [name, shifts] of merged.entries()) {
    merged.set(name, mergeAdjacentShifts(shifts))
  }
  return merged
}

/** Column indices where any row marks a meal or non-shift social block (applies to all rows in sheet). */
function findMealAndSocialColumns(rows, timeSlotColIndices) {
  const cols = new Set()
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r] || []
    for (const colIndex of timeSlotColIndices) {
      const raw = String(row[colIndex] ?? '')
        .replace(/\s+/g, ' ')
        .trim()
      if (!raw) continue
      if (/^(break|lunch|dinner|breakfast|brunch)$/i.test(raw)) cols.add(colIndex)
      if (/staff fire|upper fire pit|\bmixer\b/i.test(raw)) cols.add(colIndex)
    }
  }
  return cols
}

function buildTimeSlots(headerRow, dateStr) {
  const slots = new Map()
  let dayOffset = 0
  let prevStart = null
  for (let i = 1; i < headerRow.length; i++) {
    const range = parseRangeLabel(headerRow[i])
    if (!range) continue
    const startMinutes = parseClockLabel(range[0])
    const endMinutes = parseClockLabel(range[1])
    if (startMinutes == null || endMinutes == null) continue
    if (prevStart != null && startMinutes < prevStart) dayOffset += 1
    const endOffset = endMinutes <= startMinutes ? dayOffset + 1 : dayOffset
    slots.set(i, {
      startsAt: formatIso(addDays(dateStr, dayOffset), startMinutes),
      endsAt: formatIso(addDays(dateStr, endOffset), endMinutes),
    })
    prevStart = startMinutes
  }
  return slots
}

function main() {
  const inPath =
    process.argv[2] || 'C:/Users/shkin/Downloads/PAF 26 Staff & Volunteer Schedule.xlsx'
  const outPath =
    process.argv[3] || path.join(process.cwd(), 'data', 'paf26-staff-volunteer-shifts.json')

  if (!fs.existsSync(inPath)) {
    console.error('Input not found:', inPath)
    process.exit(1)
  }

  const wb = XLSX.readFile(inPath, { cellDates: true, raw: false })
  const people = new Map()

  for (const [sheetName, dateStr] of Object.entries(SHEET_DATE_MAP)) {
    const sheet = wb.Sheets[sheetName]
    if (!sheet) continue
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    const timeSlots = buildTimeSlots(rows[1] || [], dateStr)
    const mealOrSocialCols = findMealAndSocialColumns(rows, timeSlots.keys())
    let currentRole = ''

    for (let r = 2; r < rows.length; r++) {
      const row = rows[r] || []
      const firstCell = String(row[0] ?? '').replace(/\s+/g, ' ').trim()
      if (firstCell) currentRole = firstCell.split('\n')[0].trim()
      if (!currentRole) continue

      let carryNameForRow = null
      for (const [colIndex, slot] of timeSlots.entries()) {
        const raw = String(row[colIndex] ?? '').replace(/\s+/g, ' ').trim()
        if (
          /^break$/i.test(raw) ||
          /^lunch$/i.test(raw) ||
          /^dinner$/i.test(raw) ||
          /^breakfast$/i.test(raw) ||
          /^brunch$/i.test(raw)
        ) {
          carryNameForRow = null
          continue
        }
        let name = null
        if (looksLikeName(raw)) {
          carryNameForRow = raw
          name = raw
        } else if (!raw && carryNameForRow) {
          // Merged Excel cells leave blanks; carry the active name across empties.
          const startsH = parseInt(slot.startsAt.slice(11, 13), 10)
          // Build crew: meal/social labels often sit on another row — stop carry in those time columns.
          if (/^build crew$/i.test(currentRole) && mealOrSocialCols.has(colIndex)) {
            carryNameForRow = null
            continue
          }
          // Burrow rows use sparse anchors; do not infer coverage across empty half-hours.
          if (/^burrow$/i.test(currentRole)) continue
          if (/proctor/i.test(currentRole)) continue
          // Registration / check-in: only daytime grid (avoid carrying into overnight columns).
          if (/registration|check in/i.test(currentRole) && (startsH < 9 || startsH >= 18)) continue
          // Strike crew shift block is ~noon–8pm; do not carry names across the empty evening columns.
          if (/strike crew/i.test(currentRole) && (startsH < 12 || startsH >= 20)) continue
          name = carryNameForRow
        }
        if (!name) continue
        const shifts = people.get(name) ?? []
        const last = shifts[shifts.length - 1]
        if (last && last.role === currentRole && last.endsAt === slot.startsAt) {
          last.endsAt = slot.endsAt
        } else {
          shifts.push({
            role: currentRole,
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
          })
        }
        people.set(name, shifts)
      }
    }
  }

  const mergedPeople = postProcessPeople(people)

  const payload = {
    eventSlug: 'paf26',
    people: Array.from(mergedPeople.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, shifts]) => ({ name, shifts })),
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2))
  console.log(`Wrote ${outPath} with ${payload.people.length} staff/volunteer names.`)
}

main()
