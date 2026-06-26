/**
 * Hotfix stale profile media URLs on VPS (post remediation).
 * Usage: SSH_PASS='...' node scripts/_vps-backfill-profile-media-urls.mjs
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

const SQL = `
UPDATE profile_photos pp
SET url = '/api/v1/media/assets/' || pp.media_asset_id::text || '/content'
FROM media_assets ma
WHERE ma.id = pp.media_asset_id
  AND pp.media_asset_id IS NOT NULL
  AND (pp.url LIKE '%/c2k-uploads/media/%' OR pp.url LIKE '%/c2k-uploads/quarantine/%');

UPDATE profiles p
SET avatar_url = pp.url, updated_at = NOW()
FROM profile_photos pp
WHERE pp.profile_id = p.id
  AND pp.sort_order = 0
  AND pp.media_asset_id IS NOT NULL
  AND pp.url LIKE '/api/v1/media/assets/%'
  AND (p.avatar_url LIKE '%/c2k-uploads/media/%' OR p.avatar_url LIKE '%/c2k-uploads/quarantine/%');

SELECT
  (SELECT count(*) FROM profile_photos WHERE url LIKE '/api/v1/media/assets/%') AS proxy_photos,
  (SELECT count(*) FROM profile_photos WHERE url LIKE '%c2k-uploads%') AS stale_photos,
  (SELECT count(*) FROM profiles WHERE avatar_url LIKE '%c2k-uploads%') AS stale_avatars;
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
      stream.on('close', () => resolve(out.trim()))
    })
  })
}

async function main() {
  const conn = await connect()
  console.log('Before:')
  console.log(
    await exec(
      conn,
      `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT (SELECT count(*) FROM profile_photos WHERE url LIKE '%c2k-uploads%') AS stale_photos, (SELECT count(*) FROM profiles WHERE avatar_url LIKE '%c2k-uploads%') AS stale_avatars;"`,
    ),
  )
  console.log('\nApplying backfill...')
  console.log(await exec(conn, `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "${SQL.replace(/\n/g, ' ')}"`))
  conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
