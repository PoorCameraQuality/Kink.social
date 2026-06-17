/**
 * Full VPS deploy: upload source, migrate, rebuild stack, ECKE seed, smoke.
 * Usage: SSH_PASS='...' node scripts/_deploy-full-prod.mjs
 */
import { Client } from 'ssh2'
import { execSync } from 'node:child_process'
import { createReadStream, existsSync, unlinkSync } from 'node:fs'
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
const TARBALL = join(root, '.deploy-c2k-full.tgz')
const COMPOSE =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: HOST, port: 22, username: USER, password, readyTimeout: 60000 })
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
      stream.stderr.on('data', (d) => {
        out += d.toString()
        process.stderr.write(d)
      })
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

function sftpUpload(conn, local, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      const rs = createReadStream(local)
      const ws = sftp.createWriteStream(remotePath)
      ws.on('close', () => resolve())
      ws.on('error', reject)
      rs.on('error', reject)
      rs.pipe(ws)
    })
  })
}

async function main() {
  console.log('Creating deploy tarball...')
  execSync(
    `tar -czf "${TARBALL}" --exclude=node_modules --exclude=.git --exclude=e2e/test-results --exclude=playwright-report --exclude=.deploy-c2k-full.tgz --exclude=visual-audit-output --exclude=docker/mailserver/data --exclude=docker/mailserver/state --exclude=docker/mailserver/logs --exclude=docker/mailserver/config --exclude=packages/api/dist --exclude=*.log -C "${root}" .`,
    { stdio: 'inherit', shell: true },
  )

  const conn = await connect()
  console.log('Connected to VPS')

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await remote(
    conn,
    `test -f .env.production && cp -a .env.production .env.production.bak-${stamp} || echo "no env yet"`,
    'Backup .env.production',
  )

  const usersBefore = await remote(
    conn,
    `${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" 2>/dev/null | tr -d ' ' || echo 0`,
    'User count BEFORE',
  )
  console.log(`users_before=${usersBefore}`)

  console.log('\n>>> Upload tarball')
  await sftpUpload(conn, TARBALL, '/tmp/c2k-deploy-full.tgz')
  await remote(conn, 'tar -xzf /tmp/c2k-deploy-full.tgz && rm -f /tmp/c2k-deploy-full.tgz', 'Extract source')

  await remote(conn, 'npm ci --omit=optional 2>&1', 'npm ci on host')

  await remote(
    conn,
    `set -a && source .env.production && set +a && export NODE_ENV=production USE_DATABASE=true DATABASE_URL="postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@127.0.0.1:5432/\${POSTGRES_DB}" && node scripts/migrate-prod.mjs 2>&1`,
    'Production migrations',
  )

  await remote(conn, `${COMPOSE} build api web worker 2>&1`, 'Docker build api + web + worker')
  await remote(conn, `${COMPOSE} up -d 2>&1`, 'Restart full stack')

  await exec(conn, 'sleep 25', 'Wait for services')

  await remote(
    conn,
    `set -a && source .env.production && set +a && export NODE_ENV=production USE_DATABASE=true ALLOW_ALPHA_SEED=true DATABASE_URL="postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@127.0.0.1:5432/\${POSTGRES_DB}" && npm run db:seed:alpha:ecke -w @c2k/api 2>&1`,
    'ECKE alpha seed',
  )

  await exec(
    conn,
    'curl -sf -o /dev/null -w "home_http=%{http_code}\\n" https://kink.social/ && curl -sf https://kink.social/api/health/ready && echo "" && curl -sf https://kink.social/api/health/mail | head -c 300',
    'On-server health smoke',
  )

  const usersAfter = await remote(
    conn,
    `${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
    'User count AFTER',
  )
  console.log(`users_after=${usersAfter}`)

  await remote(conn, `${COMPOSE} ps`, 'Container status')

  conn.end()
  if (existsSync(TARBALL)) unlinkSync(TARBALL)
  console.log('\nDEPLOY OK')
}

main().catch((e) => {
  console.error('\nDEPLOY FAILED:', e.message)
  process.exit(1)
})
