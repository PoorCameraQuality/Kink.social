import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const queries = [
  'SELECT count(*) AS total_users FROM users;',
  'SELECT batch_key, created_at::date FROM alpha_seed_batches ORDER BY batch_key;',
  `SELECT username, email, created_at::date AS created FROM users
   WHERE username LIKE 'AlphaQATest%'
      OR username LIKE 'alpha_%'
      OR email LIKE 'alphaqa.test.%'
      OR email LIKE 'alpha+%@example.test'
      OR email LIKE '%@ecke-seed.local'
      OR email LIKE '%@ecke-vendor.local'
      OR username IN ('RopeDreamer','LeatherCraftDemo','ShutterSeed','TrustedRoleApplicantDemo','TestAdmin')
   ORDER BY username;`,
  `SELECT username, email, created_at::date AS created FROM users
   WHERE username NOT LIKE 'AlphaQATest%'
     AND username NOT LIKE 'alpha_%'
     AND email NOT LIKE 'alphaqa.test.%'
     AND email NOT LIKE 'alpha+%@example.test'
     AND email NOT LIKE '%@ecke-seed.local'
     AND email NOT LIKE '%@ecke-vendor.local'
     AND username NOT IN ('RopeDreamer','LeatherCraftDemo','ShutterSeed','TrustedRoleApplicantDemo','TestAdmin')
   ORDER BY username;`,
  `SELECT count(*) AS alpha_qa_orgs FROM organizations WHERE name ILIKE '%ALPHA QA TEST%' OR slug LIKE 'alpha-qa-test%';`,
  `SELECT count(*) AS alpha_qa_conventions FROM conventions WHERE slug LIKE 'alpha-qa-test%' OR name ILIKE '%ALPHA QA TEST%';`,
]

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
  })
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      stream.on('data', (d) => process.stdout.write(d))
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => (code !== 0 ? reject(new Error(`exit ${code}`)) : resolve()))
    })
  })
}

const conn = await connect()
for (const q of queries) {
  console.log('\n---')
  console.log(q.split('\n')[0].trim(), '...')
  await exec(conn, `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "${q.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`)
}
conn.end()
