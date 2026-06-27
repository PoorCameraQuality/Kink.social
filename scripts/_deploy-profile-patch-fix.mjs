import { Client } from 'ssh2'
import { createReadStream, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

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

function uploadFile(conn, local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      sftp.createWriteStream(remote).on('error', reject).on('close', resolve).end(readFileSync(local))
    })
  })
}

function uploadTar(conn, local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      const rs = createReadStream(local)
      const ws = sftp.createWriteStream(remote)
      ws.on('close', resolve)
      ws.on('error', reject)
      rs.on('error', reject)
      rs.pipe(ws)
    })
  })
}

const conn = await connect()
console.log('Connected to VPS')
await uploadTar(conn, join(root, '_deploy-ui.tar.gz'), '/opt/c2k/_deploy-ui.tar.gz')
await uploadFile(conn, join(root, 'packages/api/src/routes/profile.ts'), '/opt/c2k/packages/api/src/routes/profile.ts')
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
console.log('\nDEPLOY OK')
