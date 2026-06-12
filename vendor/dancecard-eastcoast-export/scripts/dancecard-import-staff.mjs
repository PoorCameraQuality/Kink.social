/**
 * Replace all staff shift rows in Supabase for a dancecard event slug.
 *
 * Usage:
 *   node scripts/dancecard-import-staff.mjs --slug paf26 --json ./data/paf26-staff-volunteer-shifts.json
 *
 * JSON shape: { eventSlug?: string, people: [{ name, shifts: [{ role, startsAt, endsAt }] }] }
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })
dotenv.config()

async function importStaffJson(filePath, supabase, eventId) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const people = raw.people
  if (!Array.isArray(people)) throw new Error('JSON must have { people: [...] }')

  const { error: delErr } = await supabase.from('dancecard_staff_shifts').delete().eq('event_id', eventId)
  if (delErr) throw delErr

  const sortedPeople = [...people].sort((a, b) => String(a.name).localeCompare(String(b.name)))
  let sortOrder = 0
  const rows = []
  for (const person of sortedPeople) {
    const name = String(person.name ?? '').trim()
    if (!name) continue
    const shifts = Array.isArray(person.shifts) ? person.shifts : []
    const sortedShifts = [...shifts].sort(
      (a, b) => String(a.startsAt).localeCompare(String(b.startsAt)) || String(a.role).localeCompare(String(b.role)),
    )
    for (const sh of sortedShifts) {
      const role = String(sh.role ?? '').trim()
      if (!role) continue
      const s = new Date(sh.startsAt)
      const e = new Date(sh.endsAt)
      if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) continue
      rows.push({
        event_id: eventId,
        person_name: name,
        role,
        starts_at: s.toISOString(),
        ends_at: e.toISOString(),
        sort_order: sortOrder++,
      })
    }
  }

  if (!rows.length) {
    console.log('No staff shift rows to insert (roster empty after validation).')
    return
  }

  const { error: insErr } = await supabase.from('dancecard_staff_shifts').insert(rows)
  if (insErr) throw insErr
  console.log(`Imported ${rows.length} staff shift rows for ${sortedPeople.length} people from JSON.`)
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
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slug = args[++i].toLowerCase()
    } else if (args[i] === '--json' && args[i + 1]) {
      jsonPath = args[++i]
    }
  }
  if (!jsonPath) {
    console.error('Usage: node scripts/dancecard-import-staff.mjs --slug paf26 --json path/to/paf26-staff-volunteer-shifts.json')
    process.exit(1)
  }
  const fp = path.resolve(jsonPath)
  if (!fs.existsSync(fp)) throw new Error(`File not found: ${fp}`)

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

  await importStaffJson(fp, supabase, ev.id)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
