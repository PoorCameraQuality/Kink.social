/**
 * Test VPS → production ECKE ingest auth (does not print secrets).
 * Usage: SSH_PASS='...' node scripts/_vps-test-ecke-production-auth.mjs
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Usage: SSH_PASS=... node scripts/_vps-test-ecke-production-auth.mjs')
  process.exit(1)
}

const conn = new Client()
conn
  .on('ready', () => {
    conn.exec(
      `cd /opt/c2k && set -a && . ./.env.production && set +a && code=$(curl -s -o /tmp/ecke-auth-test.json -w "%{http_code}" -X POST "$ECKE_PUBLISH_ENDPOINT" -H "Authorization: Bearer $ECKE_PUBLISH_SECRET" -H "Content-Type: application/json" -d '{}') && echo "http=$code" && head -c 400 /tmp/ecke-auth-test.json && echo`,
      (err, stream) => {
        if (err) throw err
        stream.on('data', (d) => process.stdout.write(d))
        stream.on('close', () => conn.end())
      },
    )
  })
  .connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
