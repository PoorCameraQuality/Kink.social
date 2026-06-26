/**
 * Check production profiles columns required by profile PATCH.
 * Usage: SSH_PASS='...' node scripts/_vps-check-profile-columns.mjs
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const REMOTE = '/opt/c2k'
const COMPOSE =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const COLS = [
  'genders',
  'sexual_orientations',
  'romantic_orientations',
  'pronoun_tags',
  'lifestyle_activity',
  'looking_for',
  'not_looking_for',
  'home_zip',
  'field_visibility',
  'bio',
]

const SQL = `
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name IN (${COLS.map((c) => `'${c}'`).join(', ')})
ORDER BY column_name;
`

const TARKIZ_SQL = `
SELECT u.username,
       left(p.bio, 80) AS bio,
       p.genders,
       p.sexual_orientations,
       p.romantic_orientations,
       p.pronoun_tags,
       p.lifestyle_activity,
       p.looking_for,
       p.not_looking_for,
       p.field_visibility
FROM profiles p
JOIN users u ON u.id = p.user_id
WHERE u.username = 'tarkiz';
`

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 45000 })
  })
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => { out += d.toString() })
      stream.stderr.on('data', (d) => { out += d.toString() })
      stream.on('close', () => resolve(out.trim()))
    })
  })
}

async function main() {
  const conn = await connect()
  console.log('=== profiles columns ===')
  console.log(await exec(conn, `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "${SQL.replace(/\n/g, ' ')}"`))
  console.log('\n=== missing vs expected ===')
  console.log(`Expected ${COLS.length} columns`)
  console.log('\n=== tarkiz profile row ===')
  console.log(await exec(conn, `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "${TARKIZ_SQL.replace(/\n/g, ' ')}"`))
  console.log('\n=== recent api profile errors ===')
  console.log(
    await exec(
      conn,
      `cd ${REMOTE} && ${COMPOSE} logs api --tail=400 2>&1 | grep -iE 'profile/me|column.*does not exist|ZodError|profiles' | tail -20 || echo none`,
    ),
  )
  conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
