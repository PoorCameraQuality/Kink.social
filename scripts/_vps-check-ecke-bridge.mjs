import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.env.SSH_PASSWORD
if (!password) process.exit(1)

const conn = new Client()
conn.on('ready', () => {
  const cmd = `docker exec c2k-api-1 sh -c 'echo ECKE_PUBLISH_ENABLED=$ECKE_PUBLISH_ENABLED; echo ECKE_SUPABASE_URL=$([ -n "$ECKE_SUPABASE_URL" ] && echo set || echo missing); echo ECKE_SUPABASE_SERVICE_ROLE_KEY=$([ -n "$ECKE_SUPABASE_SERVICE_ROLE_KEY" ] && echo set || echo missing); echo ECKE_PUBLISH_LISTING_WEBHOOK_URL=$([ -n "$ECKE_PUBLISH_LISTING_WEBHOOK_URL" ] && echo set || echo missing)'`
  conn.exec(cmd, (err, stream) => {
    stream.on('data', (d) => process.stdout.write(d))
    stream.on('close', () => conn.end())
  })
}).connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
