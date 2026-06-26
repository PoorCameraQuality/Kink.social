/**
 * Run debug-media-asset on production VPS.
 * Usage: SSH_PASS='...' node scripts/_vps-debug-media-asset.mjs <mediaAssetId>
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[3]
const mediaAssetId = process.argv[2]
if (!password || !mediaAssetId) {
  console.error('Usage: SSH_PASS=... node scripts/_vps-debug-media-asset.mjs <mediaAssetId>')
  process.exit(1)
}

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
  const cmd = `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -A -c "SELECT json_build_object('id', id, 'upload_status', upload_status, 'scan_status', scan_status, 'storage_state', storage_state, 'visibility', visibility, 'source_surface', source_surface, 'quarantine_key', left(quarantine_storage_key, 60)) FROM media_assets WHERE id = '${mediaAssetId}';"`
  console.log(await exec(conn, cmd))
  console.log('\n--- scanner results ---')
  const scanCmd = `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT scanner_name, status, left(user_facing_summary, 70) FROM media_scanner_results WHERE media_asset_id = '${mediaAssetId}' ORDER BY created_at DESC LIMIT 8;"`
  console.log(await exec(conn, scanCmd))
  conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
