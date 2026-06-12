import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) process.exit(1)

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 45000 })
  })
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(`cd /opt/c2k && ${cmd}`, (err, stream) => {
      if (err) return reject(err)
      stream.on('data', (d) => process.stdout.write(d))
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => (code !== 0 ? reject(new Error(`exit ${code}`)) : resolve()))
    })
  })
}

const conn = await connect()
console.log('=== API logs (last 120 lines) ===')
await exec(conn, `${compose} logs api --tail=120 2>&1`)
conn.end()
