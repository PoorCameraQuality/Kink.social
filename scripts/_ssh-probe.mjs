import { Client } from 'ssh2'

const password = process.argv[2]
const cmd = process.argv[3]
if (!password || !cmd) {
  console.error('Usage: node _ssh-probe.mjs <password> "<cmd>"')
  process.exit(1)
}

const conn = new Client()
conn
  .on('ready', () => {
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error(err.message)
        conn.end()
        process.exit(1)
      }
      stream.on('data', (d) => process.stdout.write(d))
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => {
        conn.end()
        process.exit(code ?? 0)
      })
    })
  })
  .on('error', (e) => {
    console.error('ssh error:', e.message)
    process.exit(1)
  })
  .connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 30000 })
