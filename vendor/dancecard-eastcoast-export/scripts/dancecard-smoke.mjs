/**
 * Smoke test: GET schedule for demo event (requires running `npm run dev` and seeded DB).
 * Usage: DANCECARD_SMOKE_URL=http://127.0.0.1:3000 node scripts/dancecard-smoke.mjs
 */
const base = (process.env.DANCECARD_SMOKE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')

async function main() {
  const url = `${base}/api/dancecard/paf26/schedule`
  const res = await fetch(url)
  const text = await res.text()
  if (!res.ok) {
    console.error('FAIL', res.status, text)
    process.exit(1)
  }
  const json = JSON.parse(text)
  if (!json.slots || !Array.isArray(json.slots)) {
    console.error('FAIL: expected slots array', json)
    process.exit(1)
  }
  if (json.slots.length === 0) {
    console.warn(
      'WARN: no program slots yet. Import: npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json',
    )
  }
  if (!json.meta || !json.meta.eventTitle) {
    console.error('FAIL: expected meta.eventTitle', json)
    process.exit(1)
  }
  console.log('OK dancecard smoke:', json.meta.eventTitle, 'slots=', json.slots.length)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
