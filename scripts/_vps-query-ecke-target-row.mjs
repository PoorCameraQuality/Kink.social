import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
const groupId = '4362af5e-eb8d-40e2-9cc6-700d883604eb'
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

conn.exec(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "select target_kind, status, ecke_public_url, ecke_record_id, last_published_at, last_error, unpublished_at from ecke_publish_targets where group_id = '${groupId}' order by updated_at desc limit 3;"`,
  (_e, s) => {
    s.on('data', (d) => process.stdout.write(d))
    s.on('close', () => conn.end())
  },
)
