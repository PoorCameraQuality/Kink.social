/**
 * Remove seeded orgs/groups/vendors on VPS.
 *   node scripts/_vps-clear-seeded-entities.mjs          # dry run
 *   node scripts/_vps-clear-seeded-entities.mjs --apply
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Client } from 'ssh2'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const apply = process.argv.includes('--apply')
const password = process.env.SSH_PASS
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'
const distJs = 'packages/api/dist/db/clear-seeded-entities-prod.js'

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
      sftp
        .createWriteStream(`/opt/c2k/${rel.replace(/\\/g, '/')}`)
        .on('error', reject)
        .on('close', resolve)
        .end(readFileSync(join(root, rel)))
    })
  })
}

const conn = await connect()
console.log(`Connected (${apply ? 'APPLY' : 'DRY RUN'})`)
await upload(conn, distJs)
await exec(
  conn,
  `cd /opt/c2k && ${compose} cp ${distJs} api:/app/packages/api/dist/db/clear-seeded-entities-prod.js`,
  'Copy into api container',
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
  `cd /opt/c2k && ${compose} exec -T ${envFlags} api node dist/db/clear-seeded-entities-prod.js`,
  apply ? 'Live cleanup' : 'Dry run',
)
conn.end()
console.log(`\n${apply ? 'DONE' : 'Dry run complete — use --apply to execute'}`)
