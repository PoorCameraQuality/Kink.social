import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) process.exit(1)

const files = [
  'packages/api/src/lib/media-sanitize.ts',
  'packages/api/src/routes/profile-photos.ts',
  'packages/api/src/routes/upload.ts',
  'packages/web/src/lib/profile-photo-upload.ts',
  'packages/web/src/contexts/ProfileEditContext.tsx',
  'packages/web/src/components/home/HomeFeedRichComposer.tsx',
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
console.log('build api+web')
await exec(conn, `cd /opt/c2k && ${compose} build api web 2>&1`)
console.log('restart')
await exec(conn, `cd /opt/c2k && ${compose} up -d api web 2>&1`)
conn.end()
console.log('DONE — wait ~20s then hard-refresh kink.social')
