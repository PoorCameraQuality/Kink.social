import { Client } from 'ssh2'

const password = process.env.SSH_PASS
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const sql = `
SELECT o.id, o.slug, o.display_name, u.username AS owner, o.created_at::date
FROM organizations o JOIN users u ON u.id = o.owner_id ORDER BY o.created_at;

SELECT g.id, g.slug, g.name, u.username AS owner, g.created_at::date
FROM groups g JOIN users u ON u.id = g.owner_id ORDER BY g.created_at;

SELECT v.id, v.slug, v.display_name, u.username AS owner, v.created_at::date
FROM vendor_profiles v JOIN users u ON u.id = v.user_id ORDER BY v.created_at;

SELECT e.id, e.title, u.username AS host, e.created_at::date
FROM events e JOIN users u ON u.id = e.host_id ORDER BY e.created_at;

SELECT c.id, c.slug, c.name, c.created_at::date FROM conventions c ORDER BY c.created_at;

SELECT count(*) AS groups FROM groups;
SELECT count(*) AS orgs FROM organizations;
SELECT count(*) AS vendors FROM vendor_profiles;
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
