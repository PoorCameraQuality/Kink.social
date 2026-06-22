/**
 * Patch deploy: education article ECKE bridge + production-only endpoints on VPS.
 * Usage: SSH_PASS='...' node scripts/_deploy-ecke-bridge-vps.mjs
 */
import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS or pass password as argv[2]')
  process.exit(1)
}

const HOST = '2.25.196.84'
const USER = 'root'
const REMOTE = '/opt/c2k'
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const files = [
  'packages/shared/src/seo-policy.ts',
  'packages/shared/src/index.ts',
  'packages/api/src/lib/ecke-public-publish.ts',
  'packages/api/src/lib/ecke-public-publish-executor.ts',
  'packages/api/src/lib/ecke-publish-client.ts',
  'packages/api/src/routes/ecke-publish-entity-routes.ts',
]

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: HOST, port: 22, username: USER, password, readyTimeout: 45000 })
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
        if (code !== 0) reject(new Error(`${label || cmd} failed exit ${code}\n${out.slice(-1500)}`))
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

function sftpUpload(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      sftp
        .createWriteStream(remotePath)
        .on('error', reject)
        .on('close', resolve)
        .end(readFileSync(localPath))
    })
  })
}

async function main() {
  const conn = await connect()
  console.log('Connected to VPS')

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await remote(conn, `cp -a .env.production .env.production.bak-${stamp}`, 'Backup .env.production')

  const secret = randomBytes(32).toString('hex')
  const hasSecret = await remote(
    conn,
    `grep -q '^ECKE_PUBLISH_SECRET=.' .env.production && echo yes || echo no`,
    'Check existing ECKE_PUBLISH_SECRET',
  )
  const envLines = [
    ['ECKE_PUBLISH_ENABLED', 'true'],
    ['ECKE_PUBLISH_ENDPOINT', 'https://www.eastcoastkinkevents.com/api/kink-social/ingest'],
    ['ECKE_UNPUBLISH_ENDPOINT', 'https://www.eastcoastkinkevents.com/api/kink-social/unpublish'],
    ['ECKE_PUBLIC_BASE_URL', 'https://www.eastcoastkinkevents.com'],
    ['C2K_PUBLIC_WEB_URL', 'https://kink.social'],
  ]

  for (const [key, value] of envLines) {
    await setEnv(conn, key, value)
  }

  if (!hasSecret.includes('yes')) {
    await setEnv(conn, 'ECKE_PUBLISH_SECRET', secret)
    console.log('\n>>> ECKE_PUBLISH_SECRET was generated on VPS (not printed).')
    console.log('>>> Set the same value as KINK_SOCIAL_INGEST_SECRET on ECKE Vercel production.')
  }

  for (const rel of files) {
    console.log('Upload', rel)
    await sftpUpload(conn, join(root, rel), `${REMOTE}/${rel.replace(/\\/g, '/')}`)
  }

  await remote(conn, `${compose} build api worker 2>&1`, 'Docker build api + worker')
  await remote(conn, `${compose} up -d api worker 2>&1`, 'Restart api + worker')
  await exec(conn, 'sleep 12', 'Wait for api')

  await exec(
    conn,
    'curl -sf https://kink.social/api/health/ready | head -c 200',
    'Health check',
  )

  conn.end()
  console.log('\nPATCH DEPLOY OK')
}

main().catch((e) => {
  console.error('\nPATCH DEPLOY FAILED:', e.message)
  process.exit(1)
})
