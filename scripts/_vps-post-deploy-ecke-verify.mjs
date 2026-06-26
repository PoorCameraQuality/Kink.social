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

function run(cmd, label) {
  return new Promise((resolve) => {
    console.log(`\n>>> ${label}`)
    conn.exec(cmd, (_e, s) => {
      s.on('data', (d) => process.stdout.write(d))
      s.stderr.on('data', (d) => process.stderr.write(d))
      s.on('close', () => resolve())
    })
  })
}

await run(
  `cd /opt/c2k && ${compose} exec -T api sh -lc 'find /app -name "ecke-publish-control-routes.js" 2>/dev/null; ls /app/packages/api/dist/routes/ecke* 2>/dev/null || true'`,
  'Find ecke routes in api container',
)
await run(
  `cd /opt/c2k && ${compose} exec -T api sh -lc 'grep -R ecke-publish-control /app/packages/api/dist/server.js 2>/dev/null | head -3 || echo no_server_match'`,
  'Server registration grep',
)
await run(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "select column_name from information_schema.columns where table_name = 'ecke_publish_targets' and column_name in ('ecke_public_url','ecke_record_id','unpublished_at') order by column_name;"`,
  'DB columns',
)
await run(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "select enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'ecke_publish_status' and enumlabel = 'unpublished';"`,
  'DB unpublished enum',
)

conn.end()
