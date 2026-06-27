import { Client } from 'ssh2'
const password = process.env.SSH_PASS || process.argv[2]
if (!password) { console.error('Set SSH_PASS'); process.exit(1) }
const REMOTE = '/opt/c2k'
const COMPOSE = 'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'
const cmds = [
  ['1 status counts', `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT storage_state, upload_status, scan_status, visibility, count(*) FROM media_assets WHERE removed_at IS NULL GROUP BY 1,2,3,4 ORDER BY count DESC;"`],
  ['2 recent sample', `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT id, created_at, storage_state, upload_status, scan_status, visibility, source_surface, publish_lane, left(storage_key,40) AS storage_key FROM media_assets WHERE removed_at IS NULL ORDER BY created_at DESC LIMIT 5;"`],
  ['3 compose ps', `cd ${REMOTE} && ${COMPOSE} ps api worker redis 2>&1`],
  ['4 env grep', `cd ${REMOTE} && grep -iE 'CLAMAV|SCANNER|MEDIA_|C2K_ALLOW|QUARANTINE|AUTO_APPROVE|FAIL' .env.production 2>&1 || echo '(no matches)'`],
  ['5a api logs', `cd ${REMOTE} && ${COMPOSE} logs api --tail=200 2>&1 | grep -iE 'scan|quarantine|clamav|media-pipeline|media.pipeline' || echo '(no matching api log lines)'`],
  ['5b worker logs', `cd ${REMOTE} && ${COMPOSE} logs worker --tail=200 2>&1 | grep -iE 'scan|quarantine|clamav|media-pipeline|media.pipeline|error' || echo '(no matching worker log lines)'`],
  ['6 redis bullmq', `cd ${REMOTE} && ${COMPOSE} exec -T redis redis-cli KEYS 'bull:*' 2>&1 | head -30; echo '---'; ${COMPOSE} exec -T redis redis-cli INFO keyspace 2>&1; echo '---'; for q in media-scan mediaScan media-pipeline mediaPipeline; do echo "LLEN $q:"; ${COMPOSE} exec -T redis redis-cli LLEN "$q" 2>&1; done`],
  ['7 clamav ps', `docker ps -a 2>&1 | grep -i clam || echo '(no clam container)'`],
]
function connect() { return new Promise((resolve, reject) => { const conn = new Client(); conn.on('ready', () => resolve(conn)).on('error', reject); conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 45000 }) }) }
function exec(conn, cmd) { return new Promise((resolve, reject) => { conn.exec(cmd, (err, stream) => { if (err) return reject(err); let out = ''; stream.on('data', d => { out += d.toString() }); stream.stderr.on('data', d => { out += d.toString() }); stream.on('close', () => resolve(out.trim())) }) }) }
async function main() { const conn = await connect(); for (const [label, cmd] of cmds) { console.log(`\n=== ${label} ===`); console.log(await exec(conn, cmd)) }; conn.end() }
main().catch(e => { console.error(e.message || e); process.exit(1) })
