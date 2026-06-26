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

conn.exec(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "select u.username, g.id, g.name, g.slug, gm.role from group_members gm join users u on u.id = gm.user_id join groups g on g.id = gm.group_id where g.slug like 'alpha-social%' and gm.role in ('owner','admin','moderator') order by g.name, u.username;"`,
  (_e, s) => {
    s.on('data', (d) => process.stdout.write(d))
    s.on('close', () => conn.end())
  },
)
