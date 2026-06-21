import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) process.exit(1)

const conn = new Client()
conn.on('ready', () => {
  conn.exec(
    'cd /opt/c2k && docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml logs api --tail 80 2>&1 | grep -i ecke || docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml logs api --tail 40',
    (err, stream) => {
      if (err) throw err
      stream.on('data', (d) => process.stdout.write(d))
      stream.on('close', () => conn.end())
    },
  )
}).connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
