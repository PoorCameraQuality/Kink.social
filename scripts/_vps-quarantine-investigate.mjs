/**
 * Production media quarantine pipeline investigation.
 * Usage: SSH_PASS='...' node scripts/_vps-quarantine-investigate.mjs
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

const cmds = [
  [
    '1 status counts',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT storage_state, upload_status, scan_status, visibility, count(*) AS n FROM media_assets WHERE removed_at IS NULL GROUP BY 1,2,3,4 ORDER BY n DESC;"`,
  ],
  [
    '2 recent samples',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT id, left(storage_key,45) AS key, storage_state, upload_status, scan_status, visibility, content_rating, source_surface, created_at FROM media_assets WHERE removed_at IS NULL ORDER BY created_at DESC LIMIT 8;"`,
  ],
  [
    '3 scanner results sample',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT ma.id, msr.scanner_name, msr.status, msr.labels, left(msr.user_facing_summary,60) AS summary FROM media_scanner_results msr JOIN media_assets ma ON ma.id = msr.media_asset_id WHERE ma.removed_at IS NULL ORDER BY msr.created_at DESC LIMIT 15;"`,
  ],
  [
    '4 compose ps',
    `cd ${REMOTE} && ${COMPOSE} ps api worker redis clamav 2>&1 || ${COMPOSE} ps api worker redis 2>&1`,
  ],
  [
    '5 env scanner',
    `cd ${REMOTE} && grep -E '^(CLAMD_|ENABLE_CLAMAV|MEDIA_SCAN|MEDIA_SCANNER|C2K_ALLOW|MEDIA_POLICY|QUARANTINE)' .env.production 2>/dev/null | sed 's/=.*/=***/' || echo none`,
  ],
  [
    '6 api env in container',
    `cd ${REMOTE} && ${COMPOSE} exec -T api printenv | grep -E 'CLAMD|MEDIA_SCAN|MEDIA_SCANNER|C2K_ALLOW|MEDIA_POLICY' | sed 's/=.*/=***/' || echo none`,
  ],
  [
    '7 api scan logs',
    `cd ${REMOTE} && ${COMPOSE} logs api --tail=300 2>&1 | grep -iE 'media-scanner|clamav|clamd|quarantine|finalizeMedia|PENDING_SCAN|scanner_unavailable' | tail -25 || echo none`,
  ],
  [
    '8 health ready',
    'curl -sf https://kink.social/api/health/ready | head -c 2000; echo',
  ],
  [
    '9 pending vs approved',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT upload_status, count(*) FROM media_assets WHERE removed_at IS NULL GROUP BY 1 ORDER BY count DESC;"`,
  ],
]

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
  for (const [label, cmd] of cmds) {
    console.log(`\n=== ${label} ===`)
    console.log(await exec(conn, cmd))
  }
  conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
