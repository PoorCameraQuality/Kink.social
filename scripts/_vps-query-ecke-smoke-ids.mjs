/**
 * Query prod DB for ECKE smoke entity IDs.
 * Usage: SSH_PASS=... node scripts/_vps-query-ecke-smoke-ids.mjs
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const conn = new Client()
await new Promise((r, j) =>
  conn.on('ready', r).on('error', j).connect({
    host: '2.25.196.84',
    port: 22,
    username: 'root',
    password,
    readyTimeout: 45000,
  }),
)

function run(sql, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> ${label}`)
    const cmd = `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -t -A -F'|' -c "${sql.replace(/"/g, '\\"')}"`
    conn.exec(cmd, (_e, s) => {
      let out = ''
      s.on('data', (d) => {
        out += d
        process.stdout.write(d)
      })
      s.stderr.on('data', (d) => process.stderr.write(d))
      s.on('close', (code) => (code ? reject(new Error(label)) : resolve(out.trim())))
    })
  })
}

await run(
  `select o.id, o.slug, o.display_name from organizations o where o.visibility = 'PUBLIC' order by o.display_name limit 5`,
  'Public orgs',
)
await run(
  `select c.id, c.slug, c.name from conventions c order by c.name limit 5`,
  'Conventions',
)
await run(
  `select vp.id, vp.slug from vendor_profiles vp where vp.visibility = 'PUBLIC' limit 5`,
  'Vendor profiles',
)
await run(
  `select u.id, u.username from users u join presenter_profiles pp on pp.user_id = u.id where pp.directory_visibility = 'PUBLIC' limit 5`,
  'Public presenters',
)
await run(
  `select id, slug, name from community_places where status = 'published' limit 5`,
  'Published places',
)
await run(
  `select g.id, g.slug, g.name from groups g where g.visibility = 'public' limit 5`,
  'Public groups',
)

conn.end()
