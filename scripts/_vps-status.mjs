import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) process.exit(1)

const extraArgs = process.env.SSH_PASS ? process.argv.slice(2) : process.argv.slice(3)
const cmd = extraArgs.join(' ') || `cd /opt/c2k && docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production ps && echo '---' && curl -sf https://kink.social/api/health/ready && echo '' && curl -sf https://kink.social/ -o /dev/null -w 'home=%{http_code}\n'`

const conn = new Client()
conn.on('ready', () => {
  conn.exec(cmd, (err, stream) => {
    if (err) process.exit(1)
    stream.on('close', (c) => { conn.end(); process.exit(c ?? 0) })
    stream.on('data', (d) => process.stdout.write(d))
    stream.stderr.on('data', (d) => process.stderr.write(d))
  })
})
conn.on('error', (e) => { console.error(e.message); process.exit(1) })
conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
