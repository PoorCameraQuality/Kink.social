/**
 * Safe VPS deploy: web UI only — no migrations, no api/worker restart, no .env overwrite.
 * Usage: SSH_PASS='...' node scripts/_deploy-mobile-ui-vps.mjs
 */
import { Client } from 'ssh2'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS or pass password as argv[2]')
  process.exit(1)
}

const HOST = '2.25.196.84'
const USER = 'root'
const REMOTE = '/opt/c2k'
const TAR_LOCAL = join(root, '_deploy-ui.tar.gz')
const TAR_REMOTE = `${REMOTE}/_deploy-ui.tar.gz`

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: HOST, port: 22, username: USER, password, readyTimeout: 45000 })
  })
}

function exec(conn, cmd, label = '') {
  return new Promise((resolve, reject) => {
    if (label) console.log(`\n>>> ${label}`)
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => {
        out += d.toString()
        process.stdout.write(d)
      })
      stream.stderr.on('data', (d) => {
        out += d.toString()
        process.stderr.write(d)
      })
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`${label || cmd} failed exit ${code}\n${out}`))
        else resolve(out.trim())
      })
    })
  })
}

function remote(conn, shell, label) {
  return exec(conn, `cd ${REMOTE} && ${shell}`, label)
}

function sftpUpload(conn, local, remotePath) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      sftp
        .createWriteStream(remotePath)
        .on('error', reject)
        .on('close', resolve)
        .end(readFileSync(local))
    })
  })
}

async function main() {
  if (!existsSync(TAR_LOCAL)) {
    console.error(`Missing ${TAR_LOCAL} — run tar step first`)
    process.exit(1)
  }

  const conn = await connect()
  console.log('Connected to VPS')

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  await remote(
    conn,
    `cp -a .env.production .env.production.bak-${stamp} && echo "env backup: .env.production.bak-${stamp}"`,
    'Backup .env.production',
  )

  const usersBefore = await remote(
    conn,
    `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
    'User count BEFORE',
  )
  console.log(`users_before=${usersBefore}`)

  await remote(conn, `${compose} ps`, 'Container status BEFORE')

  console.log('\n>>> Upload tarball')
  await sftpUpload(conn, TAR_LOCAL, TAR_REMOTE)

  await remote(conn, 'tar -xzf _deploy-ui.tar.gz && rm -f _deploy-ui.tar.gz', 'Extract web source')

  await remote(conn, `${compose} build web 2>&1`, 'Docker build web ONLY')

  await remote(conn, `${compose} up -d web 2>&1`, 'Restart web container ONLY')

  await exec(conn, 'sleep 12', 'Wait for web')

  const usersAfter = await remote(
    conn,
    `${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
    'User count AFTER',
  )
  console.log(`users_after=${usersAfter}`)

  if (usersBefore !== usersAfter) {
    conn.end()
    throw new Error(`USER COUNT CHANGED ${usersBefore} -> ${usersAfter} — investigate immediately`)
  }

  await exec(
    conn,
    'curl -sf -o /dev/null -w "home_http=%{http_code}\\n" https://kink.social/ && curl -sf https://kink.social/api/health/ready | head -c 400',
    'On-server smoke: home + health/ready',
  )

  await remote(
    conn,
    `${compose} exec -T web sh -c "grep -r c2k-main-mobile-pb /usr/share/nginx/html/assets/*.css 2>/dev/null | head -1 | cut -c1-120 || echo MISSING_CSS_TOKEN"`,
    'Verify new mobile CSS token in web bundle',
  )

  await remote(conn, `${compose} ps`, 'Container status AFTER')

  conn.end()
  console.log('\nDEPLOY OK — user count unchanged, web rebuilt only')
}

main().catch((e) => {
  console.error('\nDEPLOY FAILED:', e.message)
  process.exit(1)
})
