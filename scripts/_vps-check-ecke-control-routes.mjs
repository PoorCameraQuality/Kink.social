import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
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

function exec(conn, cmd, label) {
  return new Promise((resolve) => {
    console.log(`\n>>> ${label}`)
    conn.exec(cmd, (_err, stream) => {
      stream.on('data', (d) => process.stdout.write(d))
      stream.stderr.on('data', (d) => process.stderr.write(d))
      stream.on('close', () => resolve())
    })
  })
}

const conn = await connect()
await exec(
  conn,
  `cd /opt/c2k && ${compose} exec -T api sh -lc "test -f packages/api/dist/routes/ecke-publish-control-routes.js && echo control_routes=yes || echo control_routes=no"`,
  'control routes in api container',
)
await exec(
  conn,
  `cd /opt/c2k && ${compose} exec -T api sh -lc "ls packages/api/dist/routes/ecke* 2>/dev/null || echo no_ecke_route_files"`,
  'ecke route files',
)
await exec(
  conn,
  `curl -s -o /dev/null -w '%{http_code}' -H 'Cookie: c2k_session=invalid' https://kink.social/api/v1/groups/4362af5e-eb8d-40e2-9cc6-700d883604eb/ecke-publish; echo`,
  'ecke-publish HTTP (unauth)',
)
conn.end()
