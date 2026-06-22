import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('SSH_PASS required')
  process.exit(1)
}

const conn = new Client()
conn
  .on('ready', () => {
    conn.exec(
      "cd /opt/c2k && grep -E '^ECKE_(PUBLISH_SECRET|PUBLISH_ENDPOINT|UNPUBLISH_ENDPOINT|PUBLIC_BASE_URL|PUBLISH_ENABLED)=' .env.production",
      (err, stream) => {
        if (err) throw err
        stream.on('data', (d) => process.stdout.write(d))
        stream.on('close', () => conn.end())
      },
    )
  })
  .connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
