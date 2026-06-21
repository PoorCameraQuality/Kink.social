import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
const articleId = process.argv[password ? 2 : 3] || '407058cc-70b2-433d-a51f-134ef8a0721d'
if (!password) process.exit(1)

const conn = new Client()
conn.on('ready', () => {
  const sql = `SELECT title, slug, left(body_html, 4000) AS body FROM education_articles WHERE id = '${articleId}'`
  conn.exec(
    `cd /opt/c2k && docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml exec -T postgres psql -U c2k -d c2k -t -A -c "${sql}"`,
    (err, stream) => {
      if (err) throw err
      stream.on('data', (d) => process.stdout.write(d))
      stream.on('close', () => conn.end())
    },
  )
}).connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
