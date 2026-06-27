import { Client } from 'ssh2'

const password = process.env.SSH_PASS
const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const sql = `
SELECT tc.table_name, kcu.column_name, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name;
`

const conn = await connect()

function connect() {
  return new Promise((resolve, reject) => {
    const c = new Client()
    c.on('ready', () => resolve(c)).on('error', reject)
    c.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 60000 })
  })
}

conn.exec(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "${sql.replace(/\n/g, ' ')}"`,
  (err, stream) => {
    stream.on('data', (d) => process.stdout.write(d))
    stream.on('close', () => conn.end())
  },
)
