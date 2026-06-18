/**
 * Scoped VPS deploy: ECKE education publish hardening (api/shared) + education article prose UX (web).
 * Usage: SSH_PASS='...' node scripts/_deploy-education-ecke-pass-vps.mjs
 */
import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
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
  'package-lock.json',
  'packages/shared/src/seo-policy.ts',
  'packages/shared/src/index.ts',
  'packages/api/src/lib/ecke-public-publish.ts',
  'packages/api/src/lib/ecke-publish-client.ts',
  'packages/web/package.json',
  'packages/web/tailwind.config.js',
  'packages/web/src/globals.css',
  'packages/web/src/app/education/[slug]/page.tsx',
]

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: HOST, port: 22, username: USER, password, readyTimeout: 120000 })
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
        if (code !== 0) reject(new Error(`${label || cmd} failed exit ${code}\n${out.slice(-2000)}`))
        else resolve(out.trim())
      })
    })
  })
}

function remote(conn, shell, label) {
  return exec(conn, `cd ${REMOTE} && ${shell}`, label)
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

  const usersBefore = await remote(
    conn,
    `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
    'User count BEFORE',
  )
  console.log(`users_before=${usersBefore}`)

  for (const rel of files) {
    console.log('Upload', rel)
    await sftpUpload(conn, join(root, rel), `${REMOTE}/${rel.replace(/\\/g, '/')}`)
  }

  await remote(conn, `${compose} build api worker web 2>&1`, 'Docker build api + worker + web')
  await remote(conn, `${compose} up -d api worker web 2>&1`, 'Restart api + worker + web')
  await exec(conn, 'sleep 18', 'Wait for services')

  const usersAfter = await remote(
    conn,
    `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
    'User count AFTER',
  )
  console.log(`users_after=${usersAfter}`)
  if (usersBefore !== usersAfter) {
    conn.end()
    throw new Error(`USER COUNT CHANGED ${usersBefore} -> ${usersAfter}`)
  }

  await exec(
    conn,
    'curl -sf -o /dev/null -w "home=%{http_code}\\n" https://kink.social/ && curl -sf https://kink.social/api/health/ready | head -c 300',
    'Smoke: home + health/ready',
  )

  const proseCheck = await exec(
    conn,
    `CSS=$(curl -sf https://kink.social/ | grep -o 'assets/index-[^"]*\\.css' | head -1) && curl -sf "https://kink.social/$CSS" | grep -q -- '--tw-prose' && echo PROSE_CSS_OK || echo PROSE_CSS_MISSING`,
    'Verify typography (prose) CSS in web bundle',
  )
  if (!proseCheck.includes('PROSE_CSS_OK')) {
    conn.end()
    throw new Error('Prose CSS missing from web bundle after deploy')
  }

  await remote(conn, `${compose} ps`, 'Container status')

  conn.end()
  console.log('\nSCOPED DEPLOY OK')
}

main().catch((e) => {
  console.error('\nSCOPED DEPLOY FAILED:', e.message)
  process.exit(1)
})
