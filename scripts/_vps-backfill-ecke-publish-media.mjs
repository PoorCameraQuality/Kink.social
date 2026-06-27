/**
 * Upload backfill code, rebuild api, run dry-run then --apply on VPS.
 * Usage: SSH_PASS='...' node scripts/_vps-backfill-ecke-publish-media.mjs
 *        SSH_PASS='...' node scripts/_vps-backfill-ecke-publish-media.mjs --dry-run-only
 */
import { Client } from 'ssh2'
import { execSync } from 'node:child_process'
import { createReadStream, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
const dryRunOnly = process.argv.includes('--dry-run-only')

if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const TAR = join(root, '_deploy-backfill-api.tar.gz')

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: process.env.SSH_HOST || '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 120000 })
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

const runBackfillCmd = (apply) =>
  `cd /opt/c2k && set -a && . ./.env.production && set +a && export ECKE_PUBLISH_PHOTOS_ENABLED=true && ${compose} exec -T api node --input-type=module -e "
import { runEckePublishTargetMediaBackfill } from './dist/lib/ecke-publish-target-media-backfill.js';
const summary = await runEckePublishTargetMediaBackfill({ apply: ${apply} });
console.log('');
console.log('summary:', JSON.stringify(summary, null, 2));
if (summary.errors > 0) process.exit(1);
"`

console.log('Building api tarball for backfill deploy…')
execSync(
  'tar -czf _deploy-backfill-api.tar.gz packages/api packages/shared package.json package-lock.json docker/api.Dockerfile',
  { cwd: root, stdio: 'inherit' },
)

if (!existsSync(TAR)) {
  console.error('Tarball missing')
  process.exit(1)
}

const conn = await connect()
console.log('Connected to VPS')

const sftp = await withSftp(conn)
console.log('Upload _deploy-backfill-api.tar.gz')
await uploadStream(sftp, TAR, '/opt/c2k/_deploy-backfill-api.tar.gz')

await exec(conn, 'cd /opt/c2k && tar -xzf _deploy-backfill-api.tar.gz && rm -f _deploy-backfill-api.tar.gz', 'Extract api+shared')

await exec(conn, `cd /opt/c2k && ${compose} build api 2>&1`, 'Rebuild api image')
await exec(conn, `cd /opt/c2k && ${compose} up -d api worker 2>&1`, 'Restart api+worker')

await exec(conn, 'sleep 12', 'Wait for api')

await exec(conn, runBackfillCmd(false), 'Backfill dry-run')

if (!dryRunOnly) {
  await exec(conn, runBackfillCmd(true), 'Backfill --apply')
}

conn.end()
console.log('\nBackfill VPS run complete')
