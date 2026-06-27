import { Client } from 'ssh2'

const password = process.env.SSH_PASS
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const sql = `
SELECT username, email FROM users
WHERE username LIKE 'AlphaQATest%'
   OR username LIKE 'alpha_%'
   OR username LIKE 'shop-%'
   OR email LIKE '%@ecke-seed.local'
   OR email LIKE '%@ecke-vendor.local'
   OR email LIKE '%@demo.local'
   OR username IN ('RopeDreamer','LeatherCraftDemo','ShutterSeed','TrustedRoleApplicantDemo','TestAdmin')
ORDER BY username;
SELECT count(*) AS total FROM users;
`

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
  })
}

const conn = await connect()
conn.exec(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "${sql.replace(/\n/g, ' ')}"`,
  (err, stream) => {
    stream.on('data', (d) => process.stdout.write(d))
    stream.stderr.on('data', (d) => process.stderr.write(d))
    stream.on('close', () => conn.end())
  },
)
