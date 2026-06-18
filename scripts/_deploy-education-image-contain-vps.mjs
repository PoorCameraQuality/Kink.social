/**
 * Patch deploy: education article image containment (web only).
 * Usage: SSH_PASS='...' node scripts/_deploy-education-image-contain-vps.mjs
 */
import { Client } from 'ssh2'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS or pass password as argv[2]')
  process.exit(1)
}

const REMOTE = '/opt/c2k'
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const files = [
  'packages/web/src/globals.css',
  'packages/web/src/app/education/[slug]/page.tsx',
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
      stream.on('close', (code) => (code !== 0 ? reject(new Error(`${label} exit ${code}`)) : resolve()))
    })
  })
}

async function main() {
  const conn = await connect()
  console.log('Connected to VPS')
  await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      let pending = files.length
      for (const rel of files) {
        sftp.writeFile(`${REMOTE}/${rel}`, readFileSync(join(root, rel)), (wErr) => {
          if (wErr) return reject(wErr)
          console.log('uploaded', rel)
          if (--pending === 0) resolve()
        })
      }
    })
  })
  await exec(conn, `cd ${REMOTE} && ${compose} build web && ${compose} up -d web`, 'Rebuild web')
  await exec(conn, 'sleep 12', 'Wait')
  await exec(conn, 'curl -sf -o /dev/null -w "home=%{http_code}\\n" https://kink.social/', 'Smoke')
  conn.end()
  console.log('\nWEB PATCH OK')
}

main().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
