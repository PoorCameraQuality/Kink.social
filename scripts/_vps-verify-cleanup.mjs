import { Client } from 'ssh2'

const password = process.env.SSH_PASS
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const checks = [
  'SELECT count(*) AS seed_batches FROM alpha_seed_batches;',
  'SELECT count(*) AS seed_users FROM users WHERE username LIKE \'alpha_%\' OR username LIKE \'AlphaQATest%\' OR email LIKE \'%@ecke-%\' OR email LIKE \'%@demo.local\' OR username LIKE \'shop-%\';',
  'SELECT count(*) AS organizations FROM organizations;',
  'SELECT count(*) AS events FROM events;',
  'SELECT count(*) AS conventions FROM conventions;',
  'SELECT count(*) AS vendor_profiles FROM vendor_profiles;',
  'SELECT count(*) AS feed_posts FROM feed_posts;',
  'SELECT slug FROM conventions WHERE slug LIKE \'alpha-%\' LIMIT 5;',
]

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
  })
}

const conn = await connect()
for (const q of checks) {
  console.log('\n---', q.split(' ').slice(0, 6).join(' '), '...')
  await new Promise((resolve, reject) => {
    conn.exec(
      `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "${q}"`,
      (err, stream) => {
        if (err) return reject(err)
        stream.on('data', (d) => process.stdout.write(d))
        stream.on('close', (code) => (code !== 0 ? reject(new Error(`exit ${code}`)) : resolve()))
      },
    )
  })
}
await new Promise((resolve, reject) => {
  conn.exec('curl -sf https://kink.social/api/health/ready', (err, stream) => {
    stream.on('data', (d) => process.stdout.write(d))
    stream.on('close', (code) => (code !== 0 ? reject(new Error('health failed')) : resolve()))
  })
})
conn.end()
