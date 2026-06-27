import { Client } from 'ssh2'

const password = process.env.SSH_PASS
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const sql = `
SELECT count(*) AS community_places FROM community_places;
SELECT slug, name FROM community_places ORDER BY slug LIMIT 15;
SELECT count(*) AS education FROM education_articles;
SELECT title, slug FROM education_articles LIMIT 10;
SELECT count(*) AS products FROM products;
SELECT count(*) AS schedule_slots FROM schedule_slots;
SELECT body FROM feed_posts WHERE body LIKE '%seed%' OR body LIKE '%ALPHA%' OR body LIKE '%demo-east%' LIMIT 5;
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
    stream.on('close', () => conn.end())
  },
)
