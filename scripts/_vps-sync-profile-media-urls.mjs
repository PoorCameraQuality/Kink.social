/**
 * Run profile media URL sync inside API container (avoids host sharp mismatch).
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const REMOTE = '/opt/c2k'
const COMPOSE =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
  })
}

function exec(conn, cmd, label) {
  return new Promise((resolve, reject) => {
    if (label) console.log(`\n>>> ${label}`)
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => { out += d.toString(); process.stdout.write(d) })
      stream.stderr.on('data', (d) => { out += d.toString(); process.stderr.write(d) })
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`${label} exit ${code}\n${out.slice(-2000)}`))
        else resolve(out.trim())
      })
    })
  })
}

async function main() {
  const conn = await connect()
  await exec(
    conn,
    `cd ${REMOTE} && ${COMPOSE} exec -T api npm run db:sync-profile-media-urls 2>&1`,
    'Sync profile media URLs via API container',
  )
  await exec(
    conn,
    'curl -sf -o /dev/null -w "public_seed=%{http_code}\\n" https://kink.social/api/public-seed/ecke/dungeons/black-rose-dc.svg && curl -sf https://kink.social/api/health/ready && echo',
    'Smoke',
  )
  conn.end()
  console.log('\nSYNC OK')
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
