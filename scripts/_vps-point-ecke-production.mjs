/**
 * Point kink.social VPS ECKE bridge back at production ECKE.
 * Usage: SSH_PASS='...' node scripts/_vps-point-ecke-production.mjs
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Usage: SSH_PASS=... node scripts/_vps-point-ecke-production.mjs')
  process.exit(1)
}

const HOST = '2.25.196.84'
const REMOTE = '/opt/c2k'
const PROD = 'https://www.eastcoastkinkevents.com'
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: HOST, port: 22, username: 'root', password, readyTimeout: 45000 })
  })
}

function exec(conn, cmd, label = '') {
  return new Promise((resolve, reject) => {
    if (label) console.log(`\n>>> ${label}`)
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => {
        out += d.toString()
        process.stdout.write(d)
      })
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`${label || cmd} failed exit ${code}\n${out.slice(-800)}`))
        else resolve(out.trim())
      })
    })
  })
}

function remote(conn, shell, label) {
  return exec(conn, `cd ${REMOTE} && ${shell}`, label)
}

async function setEnv(conn, key, value) {
  await remote(
    conn,
    `grep -q "^${key}=" .env.production && sed -i "s|^${key}=.*|${key}=${value}|" .env.production || echo '${key}=${value}' >> .env.production`,
    `Set ${key}`,
  )
}

async function main() {
  const conn = await connect()
  console.log(`Pointing ECKE bridge at production: ${PROD}`)

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await remote(conn, `cp -a .env.production .env.production.bak-prod-${stamp}`, 'Backup .env.production')

  await setEnv(conn, 'ECKE_PUBLISH_ENABLED', 'true')
  await setEnv(conn, 'ECKE_PUBLISH_ENDPOINT', `${PROD}/api/kink-social/ingest`)
  await setEnv(conn, 'ECKE_UNPUBLISH_ENDPOINT', `${PROD}/api/kink-social/unpublish`)
  await setEnv(conn, 'ECKE_PUBLIC_BASE_URL', PROD)

  await remote(conn, `${compose} up -d api worker 2>&1`, 'Restart api + worker')
  await exec(conn, 'sleep 8', 'Wait for api')

  await remote(
    conn,
    `grep -E '^ECKE_(PUBLISH_ENABLED|PUBLISH_ENDPOINT|UNPUBLISH_ENDPOINT|PUBLIC_BASE_URL)=' .env.production`,
    'Verify ECKE endpoints',
  )

  conn.end()
  console.log('\nPRODUCTION BRIDGE OK')
  console.log('Set KINK_SOCIAL_INGEST_SECRET on ECKE production to match VPS ECKE_PUBLISH_SECRET.')
}

main().catch((e) => {
  console.error('\nPRODUCTION BRIDGE FAILED:', e.message)
  process.exit(1)
})
