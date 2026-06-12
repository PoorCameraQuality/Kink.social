import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS or pass password as argv[2]')
  process.exit(1)
}

const REMOTE = '/opt/c2k'
const compose = `docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production`

const blocks = [
  ['DISK (df)', 'df -h / /var /opt 2>/dev/null || df -h'],
  ['INODES', 'df -i / 2>/dev/null | tail -1'],
  ['DOCKER SYSTEM DF', 'docker system df 2>/dev/null'],
  ['DOCKER IMAGES (sorted by size)', 'docker images --format "{{.Size}}\\t{{.Repository}}:{{.Tag}}" | sort -hr | head -25'],
  ['CONTAINER DISK (top)', 'docker ps -as --format "{{.Size}}\\t{{.Names}}" | sort -hr | head -15'],
  ['/var/lib/docker breakdown', 'du -xh --max-depth=1 /var/lib/docker 2>/dev/null | sort -hr | head -12'],
  ['/opt breakdown', 'du -xh --max-depth=2 /opt 2>/dev/null | sort -hr | head -20'],
  ['/var/log breakdown', 'du -xh --max-depth=1 /var/log 2>/dev/null | sort -hr | head -15'],
  ['Journal', 'journalctl --disk-usage 2>/dev/null || echo n/a'],
  ['Apt cache', 'du -sh /var/cache/apt/archives 2>/dev/null || echo n/a'],
  ['Root home', 'du -xh --max-depth=1 /root 2>/dev/null | sort -hr | head -10'],
  ['Dangling images count', 'docker images -f dangling=true -q | wc -l'],
  ['Build cache', 'docker builder du 2>/dev/null | tail -8 || echo n/a'],
  ['C2K containers', `cd ${REMOTE} && ${compose} ps`],
  ['User count', `cd ${REMOTE} && ${compose} exec -T postgres psql -U c2k -d c2k -t -c "SELECT count(*) FROM users;" 2>/dev/null | tr -d ' '`],
  ['Health home', 'curl -sf -o /dev/null -w "home_http=%{http_code}\\n" https://kink.social/ || echo home_FAIL'],
  ['Health API', 'curl -sf https://kink.social/api/health/ready || echo api_FAIL'],
  ['Docker root', 'docker info 2>/dev/null | grep -E "Docker Root|Storage Driver|Data Space" || true'],
  ['Top-level / usage', 'du -xh --max-depth=1 / 2>/dev/null | sort -hr | head -18'],
  ['containerd + overlay2', 'du -sh /var/lib/containerd /var/lib/docker/overlay2 2>/dev/null || true'],
  ['visual-audit-output', 'du -sh /opt/c2k/visual-audit-output /opt/c2k/node_modules /opt/c2k/audit-output 2>/dev/null || true'],
  ['Worker not restarted?', `cd ${REMOTE} && ${compose} ps worker --format '{{.Status}}'`],
]

function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn.on('ready', () => resolve(conn)).on('error', reject)
    conn.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 45000 })
  })
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => { out += d.toString() })
      stream.stderr.on('data', (d) => { out += d.toString() })
      stream.on('close', (code) => {
        if (code !== 0) resolve(`(exit ${code})\n${out}`)
        else resolve(out.trim())
      })
    })
  })
}

async function main() {
  const conn = await connect()
  console.log('Connected to srv1747903 / 2.25.196.84\n')
  for (const [label, cmd] of blocks) {
    console.log(`\n=== ${label} ===`)
    try {
      const out = await exec(conn, cmd)
      console.log(out || '(empty)')
    } catch (e) {
      console.log(`ERROR: ${e.message}`)
    }
  }
  conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
