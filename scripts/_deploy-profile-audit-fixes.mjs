/**
 * Deploy profile audit fixes (P0–P3): api + shared + web.
 * Usage: SSH_PASS='...' node scripts/_deploy-profile-audit-fixes.mjs
 *
 * Builds _deploy-ui.tar.gz locally if missing (web + shared for Docker build).
 */
import { Client } from 'ssh2'
import { createReadStream, existsSync, readFileSync } from 'node:fs'
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

const TAR_LOCAL = join(root, '_deploy-ui.tar.gz')
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const files = [
  'packages/api/src/lib/media-mod-actions.ts',
  'packages/api/src/lib/media-upload-validate.ts',
  'packages/api/src/lib/profile-field-redaction.ts',
  'packages/api/src/lib/profile-gallery-scan-policy.ts',
  'packages/api/src/routes/presenter-profiles.ts',
  'packages/api/src/routes/profile-kinks.ts',
  'packages/api/src/routes/profile-links.ts',
  'packages/api/src/routes/profile-photos.ts',
  'packages/api/src/routes/profile-references.ts',
  'packages/api/src/routes/profile-relationships.ts',
  'packages/api/src/routes/profile.ts',
  'packages/shared/src/media-types.ts',
  'packages/shared/src/profile-kinks.ts',
]

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

function uploadBuffer(sftp, remote, data) {
  return new Promise((resolve, reject) => {
    sftp.createWriteStream(remote).on('error', reject).on('close', resolve).end(data)
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

if (!existsSync(TAR_LOCAL)) {
  console.log('Building _deploy-ui.tar.gz …')
  execSync(
    'tar -czf _deploy-ui.tar.gz packages/web packages/shared package.json package-lock.json docker/web.Dockerfile docker/nginx-spa.conf',
    { cwd: root, stdio: 'inherit' },
  )
}

const conn = await connect()
console.log('Connected to VPS')

const sftp = await withSftp(conn)
for (const rel of files) {
  console.log('Upload', rel)
  await uploadBuffer(sftp, `/opt/c2k/${rel.replace(/\\/g, '/')}`, readFileSync(join(root, rel)))
}
console.log('Upload _deploy-ui.tar.gz')
await uploadStream(sftp, TAR_LOCAL, '/opt/c2k/_deploy-ui.tar.gz')
await exec(conn, 'cd /opt/c2k && tar -xzf _deploy-ui.tar.gz && rm -f _deploy-ui.tar.gz', 'Extract web')
await exec(conn, `cd /opt/c2k && ${compose} build api web 2>&1`, 'Build api+web')
await exec(conn, `cd /opt/c2k && ${compose} up -d api web 2>&1`, 'Restart api+web')
await exec(conn, 'sleep 15', 'Wait')
await exec(
  conn,
  'curl -sf -o /dev/null -w "home=%{http_code}\\n" https://kink.social/ && curl -sf https://kink.social/api/health/ready',
  'Smoke',
)
conn.end()
console.log('\nDEPLOY OK — profile audit fixes live')
