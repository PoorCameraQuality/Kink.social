import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

for (const file of ['.env.development', '.env.local'] as const) {
  const path = resolve(repoRoot, file)
  if (existsSync(path)) {
    loadEnv({ path, override: file === '.env.local' })
  }
}
