/**
 * Apply presenter/venue ECKE publish SQL on VPS Postgres.
 * Usage: SSH_PASS=... node scripts/_vps-apply-ecke-presenter-venue-sql.mjs
 */
import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('SSH_PASS required')
  process.exit(1)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sql = readFileSync(join(root, 'packages/api/sql-drafts/ecke_presenter_venue_publish.sql'), 'utf8')
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const conn = new Client()
await new Promise((resolve, reject) => {
  conn.on('ready', resolve).on('error', reject)
  conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
})

function exec(cmd, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> ${label}`)
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => {
        out += d
        process.stdout.write(d)
      })
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`${label} exit ${code}\n${out.slice(-1500)}`))
        else resolve(out)
      })
    })
  })
}

const escaped = sql.replace(/'/g, `'\\''`)
await exec(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -v ON_ERROR_STOP=1 <<'EOSQL'\n${sql}\nEOSQL`,
  'Apply ecke_presenter_venue_publish.sql',
)

await exec(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='presenter_profiles' AND column_name='ecke_publish') AS presenter_ecke, EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='community_places' AND column_name='ecke_publish') AS place_ecke, EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ecke_publish_targets' AND column_name='presenter_user_id') AS target_presenter;"`,
  'Verify columns',
)

await exec(
  'curl -sf https://kink.social/api/health/ready && echo "" && curl -sf -o /dev/null -w "home=%{http_code}\\n" https://kink.social/',
  'Health check',
)

conn.end()
console.log('\nSQL APPLY OK')
