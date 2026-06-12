/**
 * Run additive prod migrations only — fixes schema drift without db:seed.
 * Usage: SSH_PASS='...' node scripts/_prod-run-migrations.mjs
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

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
        if (code !== 0) reject(new Error(`${label || cmd} failed exit ${code}\n${out}`))
        else resolve(out.trim())
      })
    })
  })
}

function remote(conn, shell, label) {
  return exec(conn, `cd /opt/c2k && ${shell}`, label)
}

const conn = await connect()
console.log('Connected')

const usersBefore = await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
  'User count BEFORE',
)
console.log(`users_before=${usersBefore}`)

const photosBefore = await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM profile_photos;" | tr -d ' '`,
  'Profile photos count BEFORE',
)
console.log(`photos_before=${photosBefore}`)

await remote(
  conn,
  'set -a && source .env.production && set +a && export NODE_ENV=production USE_DATABASE=true && npm run db:migrate-prod 2>&1',
  'Run db:migrate-prod (additive only, no seed)',
)

await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -c "SELECT column_name FROM information_schema.columns WHERE table_name='profile_photos' AND column_name='display_settings';"`,
  'Verify display_settings column',
)

const usersAfter = await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
  'User count AFTER',
)
const photosAfter = await remote(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM profile_photos;" | tr -d ' '`,
  'Profile photos count AFTER',
)

if (usersBefore !== usersAfter || photosBefore !== photosAfter) {
  conn.end()
  throw new Error(`Data count changed: users ${usersBefore}->${usersAfter}, photos ${photosBefore}->${photosAfter}`)
}

await remote(conn, `${compose} restart api 2>&1`, 'Restart API')

await exec(conn, 'sleep 12', 'Wait for API')

await exec(
  conn,
  'curl -sf -o /dev/null -w "health=%{http_code}\\n" https://kink.social/api/health/ready',
  'Health check',
)

conn.end()
console.log('\nMIGRATION OK — user and photo counts unchanged')
