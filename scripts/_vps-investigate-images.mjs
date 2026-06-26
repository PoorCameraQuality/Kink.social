import { Client } from 'ssh2'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const REMOTE = '/opt/c2k'
const COMPOSE =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'

const cmds = [
  [
    'IMGPROXY all',
    `cd ${REMOTE} && grep -i imgproxy .env.production || echo none`,
  ],
  [
    'caddy uploads',
    `cd ${REMOTE} && grep -R c2k-uploads Caddyfile docker-compose.prod.vps.yml 2>/dev/null | head -15 || echo none`,
  ],
  [
    'media content no auth',
    'curl -sI "https://kink.social/api/v1/media/assets/16324d6b-e151-44a7-be89-6f87b18fd0d8/content" | head -8',
  ],
  [
    'asset row',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT id, storage_key, public_storage_key, storage_state, visibility, upload_status FROM media_assets WHERE id='16324d6b-e151-44a7-be89-6f87b18fd0d8';"`,
  ],
  [
    'profile photos sample',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT pp.id, pp.media_asset_id, left(ma.storage_key,50), ma.storage_state, ma.visibility FROM profile_photos pp JOIN media_assets ma ON ma.id=pp.media_asset_id ORDER BY pp.created_at DESC LIMIT 5;"`,
  ],
  [
    'api media errors',
    `cd ${REMOTE} && ${COMPOSE} logs api --tail=300 2>&1 | grep -iE '403|Forbidden|media/assets' | tail -15 || echo none`,
  ],
  [
    'deployed image-delivery',
    `test -f ${REMOTE}/packages/api/src/lib/image-delivery.ts && echo yes || echo no`,
  ],
  [
    'storage state counts',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT storage_state, count(*) FROM media_assets WHERE removed_at IS NULL GROUP BY storage_state ORDER BY count DESC;"`,
  ],
  [
    'profile url column',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT left(pp.url,80) AS url, ma.visibility, ma.storage_state FROM profile_photos pp JOIN media_assets ma ON ma.id=pp.media_asset_id ORDER BY pp.created_at DESC LIMIT 5;"`,
  ],
  [
    's3 public HEAD',
    'curl -sI "https://kink.social/c2k-uploads/" | head -5',
  ],
  [
    'public asset curl',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -A -c "SELECT public_storage_key FROM media_assets WHERE public_storage_key IS NOT NULL AND public_storage_key <> '' LIMIT 1;" | head -1 | xargs -I{} curl -sI "https://kink.social/c2k-uploads/{}" | head -5 || echo none`,
  ],
  [
    'minio object exists',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -A -c "SELECT storage_key FROM media_assets WHERE id='16324d6b-e151-44a7-be89-6f87b18fd0d8';" | head -1`,
  ],
  [
    'minio get from api',
    `cd ${REMOTE} && KEY=$( ${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -A -c "SELECT storage_key FROM media_assets WHERE id='16324d6b-e151-44a7-be89-6f87b18fd0d8';" | tr -d '\\r' ) && ${COMPOSE} exec -T api node -e "const {S3Client,GetObjectCommand}=require('@aws-sdk/client-s3'); const c=new S3Client({region:'us-east-1',endpoint:process.env.S3_ENDPOINT,credentials:{accessKeyId:process.env.S3_ACCESS_KEY,secretAccessKey:process.env.S3_SECRET_KEY},forcePathStyle:true}); c.send(new GetObjectCommand({Bucket:process.env.S3_BUCKET||'c2k-uploads',Key:'$KEY'})).then(r=>console.log('OK',r.ContentLength)).catch(e=>console.error('ERR',e.name,e.message));"`,
  ],
  [
    'media content status logged',
    `cd ${REMOTE} && ${COMPOSE} logs api --tail=500 2>&1 | grep 'media/assets.*content' | tail -20`,
  ],
  [
    'users avatar urls',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT username, left(avatar_url,70) FROM users WHERE avatar_url IS NOT NULL AND avatar_url <> '' ORDER BY updated_at DESC LIMIT 8;"`,
  ],
  [
    'public-seed routes',
    'curl -sI "https://kink.social/api/public-seed/ecke/dungeons/black-rose-dc.svg" | head -3; curl -sI "https://kink.social/seed/ecke/dungeons/black-rose-dc.svg" | head -3',
  ],
  [
    'api seed dir exists',
    `cd ${REMOTE} && ${COMPOSE} exec -T api sh -c 'ls -la /app/packages/web/public/seed/ecke/dungeons 2>&1 | head -5 || echo missing'`,
  ],
  [
    'profile avatar urls',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT username, left(avatar_url,80) FROM profiles WHERE avatar_url IS NOT NULL AND avatar_url <> '' ORDER BY updated_at DESC LIMIT 10;"`,
  ],
  [
    'c2k-uploads urls in db',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT 'profiles' AS src, count(*) FROM profiles WHERE avatar_url LIKE '%c2k-uploads%' UNION ALL SELECT 'profile_photos', count(*) FROM profile_photos WHERE url LIKE '%c2k-uploads%' UNION ALL SELECT 'groups', count(*) FROM groups WHERE banner_url LIKE '%c2k-uploads%' OR logo_url LIKE '%c2k-uploads%';"`,
  ],
  [
    'public-seed urls in db',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT left(avatar_url,70) FROM profiles WHERE avatar_url LIKE '%public-seed%' LIMIT 5;"`,
  ],
  [
    'sample c2k-uploads avatar',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -A -c "SELECT avatar_url FROM profiles WHERE avatar_url LIKE '%c2k-uploads%' LIMIT 1;" | tr -d '\\r' | xargs -I{} curl -sI "{}" | head -5`,
  ],
  [
    'sample c2k-uploads photo',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT left(url,90), media_asset_id FROM profile_photos WHERE url LIKE '%c2k-uploads%' LIMIT 3;"`,
  ],
  [
    'proxy vs direct counts',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT CASE WHEN url LIKE '%c2k-uploads%' THEN 'direct' WHEN url LIKE '%/media/assets/%' THEN 'proxy' ELSE 'other' END AS kind, count(*) FROM profile_photos GROUP BY 1;"`,
  ],
  [
    'test direct photo urls',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -A -c "SELECT url FROM profile_photos WHERE url LIKE '%c2k-uploads%' LIMIT 3;" | tr -d '\\r' | while read u; do echo "URL $u"; curl -sI "$u" | head -2; done`,
  ],
  [
    'asset 1a4eb002 row',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT id, storage_key, public_storage_key, storage_state, visibility, upload_status, removed_at IS NOT NULL AS removed FROM media_assets WHERE id='1a4eb002-674f-43c7-bff4-199e94aa4d1a';"`,
  ],
  [
    'profiles api tarkiz',
    'curl -s "https://kink.social/api/v1/profiles/tarkiz" | node -e "let d=\\"\\";process.stdin.on(\\"data\\",c=>d+=c);process.stdin.on(\\"end\\",()=>{try{const j=JSON.parse(d);console.log(JSON.stringify({photoUrl:j.profile?.photoUrl,avatar:j.profile?.avatarUrl},null,2))}catch(e){console.log(d.slice(0,300))}})"',
  ],
  [
    'post-backfill stale counts',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -c "SELECT (SELECT count(*) FROM profile_photos WHERE url LIKE '%c2k-uploads%') AS stale_photos, (SELECT count(*) FROM profiles WHERE avatar_url LIKE '%c2k-uploads%') AS stale_avatars;"`,
  ],
  [
    'sample avatar after fix',
    `cd ${REMOTE} && ${COMPOSE} exec -T postgres psql -U c2k -d c2k -t -A -c "SELECT avatar_url FROM profiles WHERE avatar_url LIKE '/api/v1/media/assets/%' LIMIT 1;" | tr -d '\\r'`,
  ],
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
      stream.on('close', () => resolve(out.trim()))
    })
  })
}

async function main() {
  const conn = await connect()
  for (const [label, cmd] of cmds) {
    console.log(`\n=== ${label} ===`)
    console.log(await exec(conn, cmd))
  }
  conn.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
