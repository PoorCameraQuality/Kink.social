/**
 * Import program slots into Supabase for a dancecard event slug.
 *
 * Usage:
 *   node scripts/dancecard-import-schedule.mjs --slug paf26 --json ./path/to/slots.json
 *   node scripts/dancecard-import-schedule.mjs --slug paf26 ./path/to/schedule.xlsx
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })
dotenv.config()

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

function normKey(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function pickCol(row, candidates) {
  const keys = Object.keys(row)
  const map = new Map(keys.map((k) => [normKey(k), k]))
  for (const c of candidates) {
    const hit = map.get(normKey(c))
    if (hit) return hit
  }
  return undefined
}

function toDate(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v
  if (typeof v === 'number' && Number.isFinite(v)) {
    const utc = (v - 25569) * 86400 * 1000
    const d = new Date(utc)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof v === 'string') {
    const t = Date.parse(v)
    if (!Number.isNaN(t)) return new Date(t)
  }
  return null
}

async function importJson(filePath, supabase, eventId) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const slots = raw.slots
  if (!Array.isArray(slots)) throw new Error('JSON must have { slots: [...] }')
  const { error: delErr } = await supabase.from('dancecard_program_slots').delete().eq('event_id', eventId)
  if (delErr) throw delErr
  let i = 0
  const rows = slots.map((s) => ({
    event_id: eventId,
    starts_at: new Date(s.startsAt).toISOString(),
    ends_at: new Date(s.endsAt).toISOString(),
    title: s.title,
    track: s.track ?? null,
    room: s.room ?? null,
    description: s.description ?? null,
    sort_order: s.sortOrder ?? i++,
  }))
  const { error: insErr } = await supabase.from('dancecard_program_slots').insert(rows)
  if (insErr) throw insErr
  console.log(`Imported ${rows.length} slots from JSON.`)
}

async function importXlsx(filePath, supabase, eventId) {
  const wb = XLSX.readFile(filePath, { cellDates: true, raw: false })
  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase().includes('grid')) ?? wb.SheetNames[0]
  if (!sheetName) throw new Error('Workbook has no sheets')
  const sheet = wb.Sheets[sheetName]
  if (!sheet) throw new Error(`Missing sheet ${sheetName}`)
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  if (!rows.length) throw new Error('No rows in sheet')
  const first = rows[0]
  const sk = pickCol(first, ['starts_at', 'start', 'start time', 'begin', 'starts', 'from'])
  const ek = pickCol(first, ['ends_at', 'end', 'end time', 'finish', 'ends', 'to'])
  const tk = pickCol(first, ['title', 'session', 'class', 'name', 'event', 'description'])
  if (!sk || !ek || !tk) {
    throw new Error(`Could not detect columns. Found keys: ${Object.keys(first).join(', ')}`)
  }
  const trk = pickCol(first, ['track', 'track name', 'series'])
  const rm = pickCol(first, ['room', 'location', 'space', 'venue'])
  const desc = pickCol(first, ['description', 'details', 'summary'])

  const slots = []
  let sortOrder = 0
  for (const row of rows) {
    const s = toDate(row[sk])
    const e = toDate(row[ek])
    const title = String(row[tk] ?? '').trim()
    if (!s || !e || !title) continue
    if (e <= s) continue
    slots.push({
      event_id: eventId,
      starts_at: s.toISOString(),
      ends_at: e.toISOString(),
      title,
      track: trk ? String(row[trk] ?? '').trim() || null : null,
      room: rm ? String(row[rm] ?? '').trim() || null : null,
      description: desc ? String(row[desc] ?? '').trim() || null : null,
      sort_order: sortOrder++,
    })
  }
  if (!slots.length) throw new Error('No valid slot rows parsed')
  const { error: delErr } = await supabase.from('dancecard_program_slots').delete().eq('event_id', eventId)
  if (delErr) throw delErr
  const { error: insErr } = await supabase.from('dancecard_program_slots').insert(slots)
  if (insErr) throw insErr
  console.log(`Imported ${slots.length} slots from ${sheetName}.`)
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  const args = process.argv.slice(2)
  let slug = 'paf26'
  let jsonPath = null
  const rest = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slug = args[++i].toLowerCase()
    } else if (args[i] === '--json' && args[i + 1]) {
      jsonPath = args[++i]
    } else {
      rest.push(args[i])
    }
  }
  const fileArg = rest.find((a) => a && !a.startsWith('--'))
  const supabase = createClient(url, key)
  const { data: ev, error: evErr } = await supabase
    .from('dancecard_events')
    .select('id, status')
    .eq('slug', slug)
    .maybeSingle()
  if (evErr) throw evErr
  if (!ev) throw new Error(`Event slug not found: ${slug} (create event row first)`)
  if (ev.status !== 'published') {
    throw new Error(
      `Event "${slug}" has status "${ev.status}" but the public API only loads published events. ` +
        `In Supabase SQL: UPDATE dancecard_events SET status = 'published' WHERE slug = ${JSON.stringify(slug)};`,
    )
  }

  if (jsonPath) {
    await importJson(path.resolve(jsonPath), supabase, ev.id)
    return
  }
  if (!fileArg) {
    console.error('Usage: node scripts/dancecard-import-schedule.mjs --slug paf26 [--json file.json] [file.xlsx]')
    process.exit(1)
  }
  const fp = path.resolve(fileArg)
  if (!fs.existsSync(fp)) throw new Error(`File not found: ${fp}`)
  if (fp.endsWith('.json')) {
    await importJson(fp, supabase, ev.id)
  } else {
    await importXlsx(fp, supabase, ev.id)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
