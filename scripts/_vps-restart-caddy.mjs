/**
 * Restart Caddy after Caddyfile upload so public-seed rewrite applies.
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) process.exit(1)

const REMOTE = '/opt/c2k'
const COMPOSE =
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
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => { out += d.toString() })
      stream.stderr.on('data', (d) => { out += d.toString() })
      stream.on('close', () => resolve(out.trim()))
    })
  })
}

async function main() {
  const conn = await connect()
  console.log(await exec(conn, `cd ${REMOTE} && ${COMPOSE} restart caddy`))
  await new Promise((r) => setTimeout(r, 3000))
  console.log(
    await exec(
      conn,
      'curl -sI "https://kink.social/api/public-seed/ecke/dungeons/black-rose-dc.svg" | head -6',
    ),
  )
  conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
