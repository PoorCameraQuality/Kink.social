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
console.log('=== Server data preservation checks ===')
await exec(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -c "SELECT count(*) AS users FROM users; SELECT count(*) AS profiles FROM profiles; SELECT count(*) AS profile_photos FROM profile_photos;"`,
)
await exec(
  conn,
  `${compose} exec -T web sh -c "grep -o 'Sora' /usr/share/nginx/html/index.html | head -1 || echo NO_SORA"`,
)
conn.end()
console.log('=== Server checks done ===')
