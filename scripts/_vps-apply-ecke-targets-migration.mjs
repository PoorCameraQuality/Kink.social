/**
 * Apply ECKE publish targets Pass 3 columns on kink.social prod Postgres.
 * Usage: SSH_PASS='...' node scripts/_vps-apply-ecke-targets-migration.mjs
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Usage: SSH_PASS=... node scripts/_vps-apply-ecke-targets-migration.mjs')
  process.exit(1)
}

const REMOTE = '/opt/c2k'
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const sql = `
ALTER TABLE ecke_publish_targets ADD COLUMN IF NOT EXISTS ecke_public_url text;
ALTER TABLE ecke_publish_targets ADD COLUMN IF NOT EXISTS ecke_record_id uuid;
ALTER TABLE ecke_publish_targets ADD COLUMN IF NOT EXISTS unpublished_at timestamptz;
DO $$ BEGIN
  ALTER TYPE ecke_publish_status ADD VALUE IF NOT EXISTS 'unpublished';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
`

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({
      host: '2.25.196.84',
      port: 22,
      username: 'root',
      password,
      readyTimeout: 45000,
    })
  })
}

function exec(conn, cmd, label = '') {
  return new Promise((resolve, reject) => {
    if (label) console.log(`\n>>> ${label}`)
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => {
        out += d.toString()
        process.stdout.write(d)
      })
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`${label || cmd} exit ${code}\n${out.slice(-1000)}`))
        else resolve(out.trim())
      })
    })
  })
}

async function main() {
  const conn = await connect()
  const b64 = Buffer.from(sql).toString('base64')
  await exec(
    conn,
    `cd ${REMOTE} && echo '${b64}' | base64 -d | ${compose} exec -T postgres psql -U c2k -d c2k`,
    'Apply ECKE publish targets migration',
  )
  await exec(
    conn,
    `cd ${REMOTE} && ${compose} exec -T postgres psql -U c2k -d c2k -c "select column_name from information_schema.columns where table_name = 'ecke_publish_targets' and column_name in ('ecke_public_url','ecke_record_id','unpublished_at') order by column_name;"`,
    'Verify columns',
  )
  conn.end()
}

main().catch((e) => {
  console.error('\nFAILED:', e.message)
  process.exit(1)
})
