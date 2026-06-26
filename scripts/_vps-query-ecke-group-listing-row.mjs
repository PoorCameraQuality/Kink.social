/**
 * Query ECKE group_listings row for a c2k source id via Supabase REST.
 * Usage: SSH_PASS='...' node scripts/_vps-query-ecke-group-listing-row.mjs [c2k_source_id]
 */
import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
const sourceId = process.argv[3] || '4362af5e-eb8d-40e2-9cc6-700d883604eb'
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

const q = encodeURIComponent(`c2k_source_id=eq.${sourceId}&select=slug,status,last_synced_at`)
conn.exec(
  `cd /opt/c2k && set -a && . ./.env.production && set +a && curl -s -H "apikey: $ECKE_SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $ECKE_SUPABASE_SERVICE_ROLE_KEY" "$ECKE_SUPABASE_URL/rest/v1/group_listings?$q"`,
  (_e, s) => {
    s.on('data', (d) => process.stdout.write(d))
    s.on('close', () => conn.end())
  },
)
