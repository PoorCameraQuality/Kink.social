import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('SSH_PASS required')
  process.exit(1)
}

const vars = [
  'ECKE_PUBLISH_ENABLED',
  'ECKE_PUBLISH_ENDPOINT',
  'ECKE_UNPUBLISH_ENDPOINT',
  'ECKE_PUBLISH_SECRET',
  'ECKE_PUBLIC_BASE_URL',
  'C2K_PUBLIC_WEB_URL',
  'ECKE_SUPABASE_URL',
]

const conn = new Client()
conn
  .on('ready', () => {
    conn.exec(
      `cd /opt/c2k && ${vars.map((v) => `grep -q '^${v}=.' .env.production && echo ${v}=present || echo ${v}=missing`).join(' && ')}`,
      (err, stream) => {
        if (err) throw err
        stream.on('data', (d) => process.stdout.write(d))
        stream.on('close', () => conn.end())
      },
    )
  })
  .connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
