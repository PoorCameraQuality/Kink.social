import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Usage: SSH_PASS=... node scripts/_deploy-api-fixes.mjs')
  process.exit(1)
}

const files = [
  'packages/api/src/lib/media-sanitize.ts',
  'packages/api/src/routes/profile-photos.ts',
]

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
  })
}

function sftpUpload(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      sftp.createWriteStream(remotePath).on('error', reject).on('close', resolve).end(readFileSync(localPath))
    })
  })
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      stream.on('data', (d) => process.stdout.write(d))
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => (code !== 0 ? reject(new Error(`exit ${code}`)) : resolve()))
    })
  })
}

const conn = await connect()
console.log('==> Upload API fixes')
for (const rel of files) {
  console.log(' ', rel)
  await sftpUpload(conn, join(root, rel), `/opt/c2k/${rel.replace(/\\/g, '/')}`)
}
console.log('==> Rebuild api')
await exec(
  conn,
  'cd /opt/c2k && docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production build api 2>&1',
)
console.log('==> Restart api')
await exec(
  conn,
  'cd /opt/c2k && docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production up -d api 2>&1',
)
console.log('==> Smoke test')
await exec(conn, 'cd /opt/c2k && node scripts/vps/smoke-photo-bucket.mjs 2>&1')
conn.end()
console.log('DONE')
