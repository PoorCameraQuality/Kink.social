import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
  })
}

function psql(conn, sql) {
  return new Promise((resolve, reject) => {
    const cmd = `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c ${JSON.stringify(sql)}`
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      stream.on('data', (d) => process.stdout.write(d))
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => (code !== 0 ? reject(new Error(`exit ${code}`)) : resolve()))
    })
  })
}

const conn = await connect()
await psql(conn, 'SELECT count(*) AS total FROM users;')
await psql(conn, "SELECT count(*) AS keep_candidates FROM users WHERE username = 'Brax' OR (email IS NOT NULL AND email <> '' AND email NOT LIKE '%@demo.local' AND email NOT LIKE '%@ecke-seed.local' AND email NOT LIKE '%@ecke-vendor.local' AND email NOT LIKE 'alpha+%@example.test' AND username NOT LIKE 'alpha_%' AND username NOT LIKE 'AlphaQATest%' AND username NOT IN ('RopeDreamer','LeatherCraftDemo','ShutterSeed','TrustedRoleApplicantDemo','TestAdmin'));")
await psql(conn, "SELECT username, email FROM users WHERE username = 'Brax' OR (email IS NOT NULL AND email <> '' AND email NOT LIKE '%@demo.local' AND email NOT LIKE '%@ecke-seed.local' AND email NOT LIKE '%@ecke-vendor.local' AND email NOT LIKE 'alpha+%@example.test' AND username NOT LIKE 'alpha_%' AND username NOT LIKE 'AlphaQATest%' AND username NOT IN ('RopeDreamer','LeatherCraftDemo','ShutterSeed','TrustedRoleApplicantDemo','TestAdmin')) ORDER BY username;")
await psql(conn, "SELECT count(*) AS null_email_users FROM users WHERE email IS NULL OR email = '';")
await psql(conn, "SELECT username, created_at::date FROM users WHERE email IS NULL OR email = '' ORDER BY username LIMIT 20;")
conn.end()
