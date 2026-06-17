/** Run a local shell script on VPS via SSH. Usage: SSH_PASS=... node scripts/_vps-run-script.mjs scripts/vps/remote-deploy-steps.sh */
import { Client } from 'ssh2'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const password = process.env.SSH_PASS || process.argv[2]
const scriptArg = process.argv[2]
const scriptPath = scriptArg ? join(root, scriptArg) : join(root, 'scripts/vps/remote-deploy-steps.sh')
if (!password || !existsSync(scriptPath)) process.exit(1)

const body = readFileSync(scriptPath, 'utf8').replace(/\r\n/g, '\n')
const remote = '/tmp/c2k-remote-deploy.sh'

const conn = new Client()
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err
    const ws = sftp.createWriteStream(remote, { mode: 0o755 })
    ws.on('close', () => {
      conn.exec(`bash ${remote} 2>&1`, (e, stream) => {
        stream.on('data', (d) => process.stdout.write(d))
        stream.stderr.on('data', (d) => process.stderr.write(d))
        stream.on('close', (code) => { conn.end(); process.exit(code ?? 0) })
      })
    })
    ws.end(body)
  })
})
conn.on('error', (e) => { console.error(e.message); process.exit(1) })
conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
