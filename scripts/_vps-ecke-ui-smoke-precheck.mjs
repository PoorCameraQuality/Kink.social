/**
 * Pre-checks for kink.social ECKE group listing UI smoke.
 * Usage: SSH_PASS='...' node scripts/_vps-ecke-ui-smoke-precheck.mjs
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Usage: SSH_PASS=... node scripts/_vps-ecke-ui-smoke-precheck.mjs')
  process.exit(1)
}

const REMOTE = '/opt/c2k'
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

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
  console.log('Connected')

  await exec(
    conn,
    `cd ${REMOTE} && grep -E '^ECKE_(PUBLISH_ENABLED|PUBLISH_LISTING_WEBHOOK_URL|PUBLISH_WEBHOOK_SECRET|PUBLIC_BASE_URL)=' .env.production | sed 's/=.*/=***/'`,
    'ECKE env (redacted)',
  )

  try {
    await exec(conn, `cd ${REMOTE} && git rev-parse HEAD && git log -1 --oneline`, 'Git HEAD')
    await exec(
      conn,
      `cd ${REMOTE} && (git merge-base --is-ancestor 67bce63 HEAD && echo PR14_ancestor=yes || echo PR14_ancestor=no)`,
      'PR #14 ancestor check',
    )
  } catch {
    console.log('\n>>> Git HEAD: skipped (no git repo on VPS deploy tree)')
  }

  await exec(
    conn,
    `cd ${REMOTE} && ${compose} exec -T postgres psql -U c2k -d c2k -c "select column_name from information_schema.columns where table_name = 'ecke_publish_targets' and column_name in ('ecke_public_url', 'ecke_record_id', 'unpublished_at') order by column_name;"`,
    'ecke_publish_targets columns',
  )

  await exec(
    conn,
    `cd ${REMOTE} && ${compose} exec -T postgres psql -U c2k -d c2k -c "select column_name, data_type from information_schema.columns where table_name = 'ecke_publish_targets' order by ordinal_position;"`,
    'ecke_publish_targets full schema',
  )

  await exec(
    conn,
    `cd ${REMOTE} && ${compose} exec -T postgres psql -U c2k -d c2k -c "select u.username, g.id, g.name, g.slug, gm.role from group_members gm join users u on u.id = gm.user_id join groups g on g.id = gm.group_id where u.username = 'alpha_mod' and g.visibility = 'public' order by g.name;"`,
    'alpha_mod public groups',
  )

  await exec(
    conn,
    `curl -sf https://kink.social/api/health/ecke || curl -sf https://kink.social/api/health/ready`,
    'Health',
  )

  conn.end()
}

main().catch((e) => {
  console.error('\nFAILED:', e.message)
  process.exit(1)
})
