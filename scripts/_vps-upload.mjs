/** Upload tarball + extract on VPS. Usage: SSH_PASS=... node scripts/_vps-upload.mjs */
import { Client } from 'ssh2'
import { createReadStream, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const password = process.env.SSH_PASS || process.argv[2]
const tarball = join(root, '.deploy-c2k-full.tgz')
if (!password || !existsSync(tarball)) {
  console.error('Need SSH_PASS and .deploy-c2k-full.tgz')
  process.exit(1)
}

const conn = new Client()
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err
    console.log('Uploading', tarball, '...')
    const rs = createReadStream(tarball)
    let bytes = 0
    rs.on('data', (c) => {
      bytes += c.length
      if (bytes % (50 * 1024 * 1024) < c.length) console.log(`  ${Math.round(bytes / 1024 / 1024)} MB`)
    })
    const ws = sftp.createWriteStream('/tmp/c2k-deploy-full.tgz')
    ws.on('close', () => {
      console.log('Upload done. Extracting...')
      conn.exec('cd /opt/c2k && rm -f /tmp/c2k-deploy-full.tgz.partial && tar -xzf /tmp/c2k-deploy-full.tgz && rm -f /tmp/c2k-deploy-full.tgz && stat -c "%y %n" package.json', (e, stream) => {
        stream.on('data', (d) => process.stdout.write(d))
        stream.stderr.on('data', (d) => process.stderr.write(d))
        stream.on('close', (code) => {
          conn.end()
          process.exit(code ?? 0)
        })
      })
    })
    ws.on('error', (e) => { console.error(e); process.exit(1) })
    rs.pipe(ws)
  })
})
conn.on('error', (e) => { console.error(e.message); process.exit(1) })
conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
