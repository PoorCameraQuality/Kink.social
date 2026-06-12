import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) process.exit(1)

const files = [
  'packages/web/src/components/media/MediaUploadProgress.tsx',
  'packages/web/src/styles/dancecard-motion.css',
  'packages/web/src/components/ui/skeleton/C2kSkeleton.tsx',
  'packages/web/src/components/ui/skeleton/index.ts',
  'packages/web/src/components/profile/edit/ProfileBasicsPanel.tsx',
  'packages/web/src/components/profile/studio/ProfileStudioLivePreview.tsx',
  'packages/web/src/components/profile/studio/ProfileStudioCoachRail.tsx',
  'packages/web/src/app/profile/edit/ProfileEditLayout.tsx',
  'packages/web/src/components/PhotoUpload.tsx',
  'packages/web/src/hooks/useProfilePhotos.ts',
  'packages/web/src/components/profile/ProfilePhotoManager.tsx',
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
console.log('build web')
await exec(conn, `cd /opt/c2k && ${compose} build web 2>&1`)
console.log('restart web')
await exec(conn, `cd /opt/c2k && ${compose} up -d web 2>&1`)
conn.end()
console.log('DONE — hard-refresh kink.social (Ctrl+Shift+R)')
