/**
 * Patch Caddy on VPS so legacy `/api/public-seed/*` URLs serve web static `/seed/*`.
 * Usage: SSH_PASS='...' node scripts/_vps-patch-public-seed-caddy.mjs
 */
import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const REMOTE = '/opt/c2k'
const BLOCK = `    handle /api/public-seed/* {
        uri replace /api/public-seed /seed
        reverse_proxy web:80
    }

`

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
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(out || `exit ${code}`))
        else resolve(out.trim())
      })
    })
  })
}

function upload(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      sftp.writeFile(remotePath, readFileSync(localPath), (wErr) => {
        if (wErr) reject(wErr)
        else resolve()
      })
    })
  })
}

async function main() {
  const conn = await connect()
  const localCaddy = join(root, 'Caddyfile')
  await upload(conn, localCaddy, `${REMOTE}/Caddyfile`)
  console.log('Uploaded Caddyfile')

  const COMPOSE =
    'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

  console.log(await exec(conn, `cd ${REMOTE} && ${COMPOSE} exec -T caddy caddy validate --config /etc/caddy/Caddyfile 2>&1 || true`))
  console.log(await exec(conn, `cd ${REMOTE} && ${COMPOSE} exec -T caddy caddy reload --config /etc/caddy/Caddyfile 2>&1`))

  console.log('\nVerify:')
  console.log(
    await exec(
      conn,
      'curl -sI "https://kink.social/api/public-seed/ecke/dungeons/black-rose-dc.svg" | head -5',
    ),
  )
  conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
