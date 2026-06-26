import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
process.env.SSH_PASS = process.env.SSH_PASS || process.argv[2]
if (!process.env.SSH_PASS) {
  console.error('Missing SSH_PASS')
  process.exit(1)
}

console.log('Starting full prod deploy from', root)

const child = spawn(process.execPath, [join(root, 'scripts/_deploy-full-prod.mjs')], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
})

child.on('exit', (code) => {
  console.log('Deploy process exit', code)
  process.exit(code ?? 1)
})
