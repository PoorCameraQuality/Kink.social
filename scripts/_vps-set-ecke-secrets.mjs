/**
 * One-time: set ECKE bridge secrets + URLs on VPS.
 * Usage: SSH_PASS='...' node scripts/_vps-set-ecke-secrets.mjs
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
const secret = process.env.ECKE_SHARED_SECRET || process.argv[3]
if (!password || !secret) {
  console.error('Usage: SSH_PASS=... ECKE_SHARED_SECRET=... node scripts/_vps-set-ecke-secrets.mjs')
  process.exit(1)
}

const HOST = '2.25.196.84'
const REMOTE = '/opt/c2k'
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const vars = {
  ECKE_PUBLISH_ENABLED: 'true',
  ECKE_PUBLISH_ENDPOINT: 'https://www.eastcoastkinkevents.com/api/kink-social/ingest',
  ECKE_UNPUBLISH_ENDPOINT: 'https://www.eastcoastkinkevents.com/api/kink-social/unpublish',
  ECKE_PUBLISH_LISTING_WEBHOOK_URL: 'https://www.eastcoastkinkevents.com/api/kink-social/listing',
  ECKE_PUBLIC_BASE_URL: 'https://www.eastcoastkinkevents.com',
  ECKE_PUBLISH_SECRET: secret,
  ECKE_PUBLISH_WEBHOOK_SECRET: secret,
  ECKE_SUPABASE_URL: 'https://affiefoslsewiwfqahhk.supabase.co',
  ECKE_SUPABASE_SERVICE_ROLE_KEY: process.env.ECKE_SUPABASE_SERVICE_ROLE_KEY || '',
}

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

async function setEnv(conn, key, value) {
  if (!value) {
    console.log(`Skip ${key} (empty)`)
    return
  }
  const shellValue = value.replace(/'/g, `'\\''`)
  await exec(
    conn,
    `cd ${REMOTE} && (grep -q '^${key}=' .env.production && sed -i 's|^${key}=.*|${key}=${shellValue}|' .env.production || echo '${key}=${shellValue}' >> .env.production)`,
    `Set ${key}`,
  )
}

async function main() {
  const conn = await connect()
  console.log('Connected to VPS')

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await exec(conn, `cd ${REMOTE} && cp -a .env.production .env.production.bak-ecke-secret-${stamp}`, 'Backup')

  for (const [key, value] of Object.entries(vars)) {
    await setEnv(conn, key, value)
  }

  await exec(
    conn,
    `cd ${REMOTE} && grep -E '^ECKE_' .env.production | sed 's/=.*/=***/'`,
    'Verify ECKE vars (redacted)',
  )

  await exec(conn, `cd ${REMOTE} && ${compose} up -d api worker 2>&1`, 'Restart api + worker')
  await exec(conn, 'sleep 10', 'Wait')
  await exec(conn, 'curl -sf https://kink.social/api/health/ready | head -c 200; echo', 'Health check')

  conn.end()
  console.log('\nVPS ECKE env updated.')
}

main().catch((e) => {
  console.error('\nFAILED:', e.message)
  process.exit(1)
})
