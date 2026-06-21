/**
 * Limited VPS deploy: profile orientation save/display fix + expanded catalog (max 10).
 * No migrations, no .env changes.
 * Usage: SSH_PASS='...' node scripts/_deploy-orientation-fixes.mjs
 */
import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Usage: SSH_PASS=... node scripts/_deploy-orientation-fixes.mjs')
  process.exit(1)
}

const files = [
  'packages/shared/src/profile-identity-arrays.ts',
  'packages/shared/src/profile-identity-options.ts',
  'packages/web/src/contexts/ProfileEditContext.tsx',
  'packages/web/src/app/profile/ProfilePageClient.tsx',
]

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
  })
}

function sftpUpload(conn, local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      sftp.createWriteStream(remote).on('error', reject).on('close', resolve).end(readFileSync(local))
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

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const conn = await connect()
for (const rel of files) {
  console.log('upload', rel)
  await sftpUpload(conn, join(root, rel), `/opt/c2k/${rel.replace(/\\/g, '/')}`)
}
console.log('build api+web (shared orientation cap used by API)')
await exec(conn, `cd /opt/c2k && ${compose} build api web 2>&1`)
console.log('restart api+web')
await exec(conn, `cd /opt/c2k && ${compose} up -d api web 2>&1`)
console.log('health check')
await exec(conn, 'sleep 12 && curl -sf https://kink.social/api/health/ready | head -c 400 && echo')
conn.end()
console.log('DONE — orientation fix live; hard-refresh kink.social/profile')
