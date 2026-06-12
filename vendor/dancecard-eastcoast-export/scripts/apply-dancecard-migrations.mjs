/**
 * Apply dancecard SQL migrations to the remote Postgres database.
 *
 * Requires a direct Postgres URL (not the Supabase REST URL). Add to `.env.local`:
 *   DATABASE_URL=postgresql://postgres.[ref]:[YOUR-DB-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
 * or the "URI" from Supabase Dashboard → Project Settings → Database.
 *
 * Usage:
 *   node scripts/apply-dancecard-migrations.mjs
 *
 * Env: DATABASE_URL (or DIRECT_URL), optional DANCECARD_SQL_FILES=path1;path2
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config()

const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
if (!dbUrl) {
  console.error(
    'Missing DATABASE_URL or DIRECT_URL in .env.local.\n' +
      'Get it from Supabase → Project Settings → Database → Connection string (URI), then run this script again.',
  )
  process.exit(1)
}

const defaultFiles = [
  path.join(root, 'database', 'dancecard_002_staff_gate.sql'),
  path.join(root, 'database', 'dancecard_003_selection_notes.sql'),
  path.join(root, 'database', 'dancecard_004_organizers.sql'),
]

const files = process.env.DANCECARD_SQL_FILES
  ? process.env.DANCECARD_SQL_FILES.split(';').map((p) => path.resolve(root, p.trim()))
  : defaultFiles

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
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error('File not found:', file)
      process.exit(1)
    }
    const sql = fs.readFileSync(file, 'utf8')
    console.log('Applying', path.relative(root, file))
    await client.query(sql)
  }
  console.log('OK: dancecard migrations applied.')
} finally {
  await client.end()
}
