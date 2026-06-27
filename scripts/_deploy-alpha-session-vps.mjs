/**
 * Deploy current api + web session to VPS (security hardening, trending images, event cover, explore).
 * Usage: SSH_PASS='...' node scripts/_deploy-alpha-session-vps.mjs
 */
import { Client } from 'ssh2'
import { createReadStream, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS or pass password as argv[2]')
  process.exit(1)
}

const TAR_UI = join(root, '_deploy-ui.tar.gz')
const TAR_API = join(root, '_deploy-api.tar.gz')
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 120000 })
  })
}

function exec(conn, cmd, label = '') {
  return new Promise((resolve, reject) => {
    if (label) console.log(`\n>>> ${label}`)
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      stream.on('data', (d) => process.stdout.write(d))
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => (code !== 0 ? reject(new Error(`${label || cmd} exit ${code}`)) : resolve()))
    })
  })
}

function withSftp(conn) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => (err ? reject(err) : resolve(sftp)))
  })
}

function uploadStream(sftp, local, remote) {
  return new Promise((resolve, reject) => {
    const rs = createReadStream(local)
    const ws = sftp.createWriteStream(remote)
    ws.on('close', resolve)
    ws.on('error', reject)
    rs.on('error', reject)
    rs.pipe(ws)
  })
}

console.log('Building _deploy-ui.tar.gz …')
execSync(
  'tar -czf _deploy-ui.tar.gz packages/web packages/shared package.json package-lock.json docker/web.Dockerfile docker/nginx-spa.conf',
  { cwd: root, stdio: 'inherit' },
)

console.log('Building _deploy-api.tar.gz …')
execSync(
  'tar -czf _deploy-api.tar.gz packages/api/src packages/api/package.json packages/api/sql-drafts/ecke_publish_target_media.sql',
  { cwd: root, stdio: 'inherit' },
)

if (!existsSync(TAR_UI) || !existsSync(TAR_API)) {
  console.error('Tarball build failed')
  process.exit(1)
}

const conn = await connect()
console.log('Connected to VPS')

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
await exec(
  conn,
  `cd /opt/c2k && cp -a .env.production .env.production.bak-${stamp}`,
  'Backup .env.production',
)

const sftp = await withSftp(conn)
console.log('Upload _deploy-ui.tar.gz')
await uploadStream(sftp, TAR_UI, '/opt/c2k/_deploy-ui.tar.gz')
console.log('Upload _deploy-api.tar.gz')
await uploadStream(sftp, TAR_API, '/opt/c2k/_deploy-api.tar.gz')

await exec(conn, 'cd /opt/c2k && tar -xzf _deploy-ui.tar.gz && rm -f _deploy-ui.tar.gz', 'Extract web+shared')
await exec(conn, 'cd /opt/c2k && tar -xzf _deploy-api.tar.gz && rm -f _deploy-api.tar.gz', 'Extract api')

await exec(
  conn,
  `cd /opt/c2k && cat packages/api/sql-drafts/ecke_publish_target_media.sql | ${compose} exec -T postgres psql -U c2k -d c2k -v ON_ERROR_STOP=1 2>&1 || true`,
  'Apply ecke_publish_target_media SQL (idempotent)',
)

await exec(
  conn,
  `cd /opt/c2k && grep -q '^C2K_TRUST_PROXY=' .env.production || echo 'C2K_TRUST_PROXY=true' >> .env.production`,
  'Ensure C2K_TRUST_PROXY=true',
)

await exec(conn, `cd /opt/c2k && ${compose} build api web 2>&1`, 'Build api+web')
await exec(conn, `cd /opt/c2k && ${compose} up -d api web 2>&1`, 'Restart api+web')
await exec(conn, 'sleep 18', 'Wait')
await exec(
  conn,
  'curl -sf -o /dev/null -w "home=%{http_code}\\n" https://kink.social/ && curl -sf https://kink.social/api/health/ready | head -c 400',
  'Smoke',
)
await exec(
  conn,
  'curl -sf "https://kink.social/api/v1/trending?limit=3" | head -c 600',
  'Smoke trending API',
)

conn.end()
console.log('\nDEPLOY OK — https://kink.social')
