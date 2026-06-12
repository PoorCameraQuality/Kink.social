/**
 * Grant dancecard organizer access to an auth user by email.
 *
 * Requires: DATABASE_URL or DIRECT_URL (Postgres URI with access to auth.users).
 * Does NOT create the auth user — sign up once in the app or Supabase Dashboard → Authentication.
 *
 * Usage:
 *   node scripts/dancecard-add-organizer.mjs <email> <eventSlug> [role]
 * Example:
 *   node scripts/dancecard-add-organizer.mjs you@example.com paf26 owner
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config()

const email = process.argv[2]?.trim().toLowerCase()
const slug = (process.argv[3] || 'paf26').trim().toLowerCase()
const role = (process.argv[4] || 'owner').trim().toLowerCase()

if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/dancecard-add-organizer.mjs <email> <eventSlug> [owner|editor]')
  process.exit(1)
}

if (role !== 'owner' && role !== 'editor') {
  console.error('role must be owner or editor')
  process.exit(1)
}

const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
if (!dbUrl) {
  console.error('Missing DATABASE_URL or DIRECT_URL in .env.local')
  process.exit(1)
}

let pg
try {
  pg = await import('pg')
} catch {
  console.error('Install pg: npm i -D pg')
  process.exit(1)
}

const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
await client.connect()
try {
  const { rows: users } = await client.query('select id, email from auth.users where lower(email) = lower($1)', [
    email,
  ])
  if (!users.length) {
    console.error(
      `No auth.users row for "${email}". Create the user first:\n` +
        '  Supabase Dashboard → Authentication → Users → Add user → Email + password,\n' +
        '  or use your site’s sign-up flow if you have one.',
    )
    process.exit(1)
  }
  const userId = users[0].id

  const { rows: events } = await client.query('select id, slug from dancecard_events where lower(slug) = lower($1)', [
    slug,
  ])
  if (!events.length) {
    console.error(`No dancecard_events row with slug "${slug}".`)
    process.exit(1)
  }
  const eventId = events[0].id

  await client.query(
    `insert into dancecard_event_organizers (event_id, user_id, role)
     values ($1, $2, $3)
     on conflict (event_id, user_id) do update set role = excluded.role`,
    [eventId, userId, role],
  )

  console.log('OK: organizer access granted.')
  console.log('  user_id:', userId)
  console.log('  email:', users[0].email)
  console.log('  event:', slug, '→', eventId)
  console.log('  role:', role)
  console.log('\nOpen: http://localhost:3000/organizer/login (or your dev port), then /organizer/dancecard/' + slug)
} finally {
  await client.end()
}
