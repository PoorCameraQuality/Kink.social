/**
 * Post-deploy: prune old Docker builds, restart Caddy, sync profile media URLs.
 * Does NOT touch postgres volumes, users, or MinIO user data.
 * Usage: SSH_PASS='...' node scripts/_vps-post-deploy-cleanup.mjs
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
      stream.on('data', (d) => {
        out += d.toString()
        process.stdout.write(d)
      })
      stream.stderr.on('data', (d) => {
        out += d.toString()
        process.stderr.write(d)
      })
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`${label || cmd} exit ${code}\n${out.slice(-1500)}`))
        else resolve(out.trim())
      })
    })
  })
}

async function main() {
  const conn = await connect()
  const remote = (shell, label) => exec(conn, `cd ${REMOTE} && ${shell}`, label)

  await remote(
    `${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" | tr -d ' '`,
    'User count (must be unchanged)',
  )

  await remote('docker image prune -f 2>&1', 'Prune dangling images')
  await remote('docker builder prune -f 2>&1', 'Prune build cache')
  await remote(
    `docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}' | grep -E '^c2k-(api|web|worker):' | grep -v latest | awk '{print $2}' | xargs -r docker rmi -f 2>&1 || echo 'no old tagged c2k images'`,
    'Remove old c2k tagged images (keep running containers)',
  )

  await remote(`${COMPOSE} restart caddy 2>&1`, 'Restart Caddy for routing changes')
  await exec(conn, 'sleep 5', 'Wait for Caddy')

  await remote(
    `${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "UPDATE profile_photos pp SET url = '/api/v1/media/assets/' || pp.media_asset_id::text || '/content' FROM media_assets ma WHERE ma.id = pp.media_asset_id AND pp.media_asset_id IS NOT NULL AND (pp.url LIKE '%/c2k-uploads/media/%' OR pp.url LIKE '%/c2k-uploads/quarantine/%'); UPDATE profiles p SET avatar_url = pp.url, updated_at = NOW() FROM profile_photos pp WHERE pp.profile_id = p.id AND pp.sort_order = 0 AND pp.media_asset_id IS NOT NULL AND pp.url LIKE '/api/v1/media/assets/%' AND (p.avatar_url LIKE '%/c2k-uploads/media/%' OR p.avatar_url LIKE '%/c2k-uploads/quarantine/%'); SELECT (SELECT count(*) FROM profile_photos WHERE url LIKE '%c2k-uploads%') AS stale_photos, (SELECT count(*) FROM profiles WHERE avatar_url LIKE '%c2k-uploads%') AS stale_avatars;"`,
    'Backfill profile photo / avatar proxy URLs (SQL)',
  )

  await exec(
    conn,
    'curl -sf -o /dev/null -w "public_seed=%{http_code}\\n" https://kink.social/api/public-seed/ecke/dungeons/black-rose-dc.svg && curl -sf https://kink.social/api/health/ready',
    'Smoke public-seed + health',
  )

  await remote(`${COMPOSE} ps api web caddy`, 'Final container status')
  conn.end()
  console.log('\nPOST-DEPLOY CLEANUP OK')
}

main().catch((e) => {
  console.error('\nFAILED:', e.message)
  process.exit(1)
})
