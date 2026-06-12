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
      let out = ''
      stream.on('data', (d) => {
        out += d.toString()
        process.stdout.write(d)
      })
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => (code !== 0 ? reject(new Error(`exit ${code}: ${out}`)) : resolve(out)))
    })
  })
}

const conn = await connect()
await exec(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -c "SELECT u.username, p.visibility FROM users u JOIN profiles p ON p.user_id = u.id LIMIT 10;"`,
)
await exec(
  conn,
  `${compose} exec -T api sh -c "grep -l followsSummary dist/routes/profile.js 2>/dev/null && echo API_HAS_SOCIAL || echo API_MISSING_SOCIAL"`,
)
conn.end()
