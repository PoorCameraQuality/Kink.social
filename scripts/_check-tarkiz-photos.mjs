import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) process.exit(1)

const compose =
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
    conn.exec(`cd /opt/c2k && ${cmd}`, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => { out += d; process.stdout.write(d) })
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => (code !== 0 ? reject(new Error(`exit ${code}`)) : resolve(out)))
    })
  })
}

const conn = await connect()
const sql = `SELECT u.username, pp.sort_order, left(pp.url, 80) AS url_prefix, (pp.media_asset_id IS NOT NULL) AS linked, ma.upload_status, ma.content_rating, ma.visibility, ma.is_blurred_by_default, p.visibility AS profile_visibility FROM users u JOIN profiles p ON p.user_id = u.id LEFT JOIN profile_photos pp ON pp.profile_id = p.id LEFT JOIN media_assets ma ON ma.id = pp.media_asset_id WHERE u.username = 'tarkiz' ORDER BY pp.sort_order NULLS LAST;`
await exec(
  conn,
  `${compose} exec -T postgres psql -U c2k -d c2k -c "${sql.replace(/\n/g, ' ')}"`,
)
conn.end()
