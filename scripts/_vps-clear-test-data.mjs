/**
 * Upload prod test-data cleanup script and run on VPS.
 *
 * Dry run (default):
 *   node scripts/_vps-clear-test-data.mjs
 *
 * Apply:
 *   node scripts/_vps-clear-test-data.mjs --apply
 */
import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const apply = process.argv.includes('--apply')
const password = process.env.SSH_PASS || process.argv.find((a) => !a.startsWith('-') && a !== process.argv[1])
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const uploadFiles = [
  'packages/api/dist/db/clear-alpha-prod-test-data.js',
  'packages/api/dist/db/clear-alpha-seed.js',
  'packages/api/src/db/clear-alpha-prod-test-data.ts',
  'packages/api/src/db/clear-alpha-seed.ts',
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

function upload(conn, rel) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      const remote = `/opt/c2k/${rel.replace(/\\/g, '/')}`
      sftp
        .createWriteStream(remote)
        .on('error', reject)
        .on('close', resolve)
        .end(readFileSync(join(root, rel)))
    })
  })
}

const conn = await connect()
console.log(`Connected (${apply ? 'APPLY' : 'DRY RUN'})`)

for (const rel of uploadFiles) {
  console.log('Upload', rel)
  await upload(conn, rel)
}

const distJs = 'packages/api/dist/db/clear-alpha-prod-test-data.js'
await exec(
  conn,
  `cd /opt/c2k && ${compose} cp ${distJs} api:/app/packages/api/dist/db/clear-alpha-prod-test-data.js`,
  'Copy cleanup script into api container',
)

const envFlags = [
  '-e USE_DATABASE=true',
  '-e ALLOW_ALPHA_PROD_CLEANUP=true',
  '-e FORCE_ALPHA_PROD_CLEANUP=true',
  apply ? '' : '-e DRY_RUN=true',
]
  .filter(Boolean)
  .join(' ')

await exec(
  conn,
  `cd /opt/c2k && ${compose} exec -T ${envFlags} api node dist/db/clear-alpha-prod-test-data.js`,
  apply ? 'Live cleanup' : 'Dry run',
)

await exec(
  conn,
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "SELECT count(*) AS users FROM users;"`,
  'User count after',
)

conn.end()
console.log(`\n${apply ? 'CLEANUP APPLIED' : 'DRY RUN COMPLETE — re-run with --apply to execute'}`)
