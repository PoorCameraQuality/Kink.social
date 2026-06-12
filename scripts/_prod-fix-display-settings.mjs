/**
 * Apply missing profile_photos.display_settings column via postgres (additive, safe).
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) process.exit(1)

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 45000 })
  })
}

function exec(conn, cmd, label = '') {
  return new Promise((resolve, reject) => {
    if (label) console.log(`\n>>> ${label}`)
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => {
        out += d
        process.stdout.write(d)
      })
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`${label || cmd} exit ${code}\n${out}`))
        else resolve(out.trim())
      })
    })
  })
}

function remote(conn, shell, label) {
  return exec(conn, `cd /opt/c2k && ${shell}`, label)
}

const conn = await connect()

const usersBefore = await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
  'Users BEFORE',
)
const photosBefore = await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM profile_photos;" | tr -d ' '`,
  'Photos BEFORE',
)

await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -c "ALTER TABLE profile_photos ADD COLUMN IF NOT EXISTS display_settings jsonb;"`,
  'Add display_settings column',
)

await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='profile_photos' AND column_name='display_settings';"`,
  'Verify column',
)

const usersAfter = await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
  'Users AFTER',
)
const photosAfter = await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM profile_photos;" | tr -d ' '`,
  'Photos AFTER',
)

if (usersBefore !== usersAfter || photosBefore !== photosAfter) {
  throw new Error('Row counts changed!')
}

await remote(conn, `${compose} restart api 2>&1`, 'Restart API')
await exec(conn, 'sleep 10')

await exec(
  conn,
  `curl -sf https://kink.social/api/health/ready`,
  'Health ready',
)

// Public profile for tarkiz should not 500 (401/404 ok without cookie; we test from inside api)
await remote(
  conn,
  `${compose} exec -T api node -e "fetch('http://127.0.0.1:3001/api/profile/tarkiz').then(r=>r.text().then(t=>console.log('status',r.status,t.slice(0,120)))).catch(e=>{console.error(e);process.exit(1)})"`,
  'Smoke GET /api/profile/tarkiz from inside api',
)

conn.end()
console.log('\nFIX OK')
