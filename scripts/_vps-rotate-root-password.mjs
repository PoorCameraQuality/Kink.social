import { readFileSync } from 'node:fs'
import { Client } from 'ssh2'

const oldPass = process.env.SSH_PASS || process.argv[2]
if (!oldPass) {
  console.error('Usage: SSH_PASS=old node scripts/_vps-rotate-root-password.mjs')
  process.exit(1)
}

const file = 'C:/Users/shkin/Desktop/c2k-vps-root-password-ROTATED.txt'
const lines = readFileSync(file, 'utf8').split(/\r?\n/)
const newPass =
  process.argv[3] ||
  process.env.NEW_ROOT_PASS ||
  lines.find((l) => l && !l.startsWith('VPS ') && !l.startsWith('Update') && !l.startsWith('Delete'))
if (!newPass) {
  console.error('Pass new password as argv[3] or NEW_ROOT_PASS')
  process.exit(1)
}

const conn = new Client()
await new Promise((resolve, reject) => {
  conn.on('ready', resolve).on('error', reject)
  conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password: oldPass, readyTimeout: 45000 })
})

await new Promise((resolve, reject) => {
  conn.exec(`echo 'root:${newPass.replace(/'/g, `'\\''`)}' | chpasswd`, (err, stream) => {
    if (err) return reject(err)
    stream.on('close', (code) => (code ? reject(new Error(`chpasswd exit ${code}`)) : resolve()))
  })
})

console.log('Root password rotated on VPS.')
console.log('New password saved in Desktop file only — update GitHub deploy secret SSH_PASS.')
conn.end()
