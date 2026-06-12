/**
 * Verify the live (or preview) site actually serves the Dancecard schedule API.
 * Catches: wrong Vercel Root Directory, stale deploy, HTML 404, empty DB.
 *
 * Usage:
 *   node scripts/dancecard-verify-production.mjs https://www.eastcoastkinkevents.com
 *   node scripts/dancecard-verify-production.mjs https://your-preview.vercel.app
 *
 * Env: DANCECARD_VERIFY_ORIGIN (default https://www.eastcoastkinkevents.com)
 *      DANCECARD_VERIFY_SLUG (default paf26)
 */
const origin = (process.argv[2] || process.env.DANCECARD_VERIFY_ORIGIN || 'https://www.eastcoastkinkevents.com')
  .replace(/\/$/, '')
const slug = (process.env.DANCECARD_VERIFY_SLUG || 'paf26').toLowerCase()
const path = `/api/dancecard/${encodeURIComponent(slug)}/schedule`
const url = `${origin}${path}`

async function main() {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    redirect: 'follow',
  })
  const text = await res.text()
  const head = text.slice(0, 120).trimStart()

  console.log('GET', url)
  console.log('HTTP', res.status, res.headers.get('content-type') || '')

  if (!res.ok) {
    console.error('\nFAIL: non-OK response. Common causes:')
    console.error('  • Vercel Root Directory is set to projectfilesmigration/ (must be repo root ".")')
    console.error('  • Production deploy failed or is stale — open latest deployment logs')
    console.error('  • Wrong host (apex vs www); use the same origin users load in the browser\n')
    console.error(head)
    process.exit(1)
  }

  if (head.startsWith('<!') || head.startsWith('<html')) {
    console.error('\nFAIL: received HTML instead of JSON. The App Router schedule route is NOT on this deployment.')
    console.error('Fix: Vercel → Project → Settings → General → Root Directory = empty (repository root).')
    console.error('Then: Redeploy production from GitHub master (or vercel --prod).\n')
    console.error(head)
    process.exit(1)
  }

  let json
  try {
    json = JSON.parse(text)
  } catch {
    console.error('\nFAIL: response is not JSON\n', head)
    process.exit(1)
  }

  const n = Array.isArray(json.slots) ? json.slots.length : -1
  if (n <= 0) {
    console.error('\nFAIL: JSON ok but slots array is empty.')
    console.error('The running app is talking to a Supabase project with no program rows for this event,')
    console.error('or the event row is not status=published (API hides non-published events).')
    console.error('Fix: run npm run dancecard:import with Production URL + SUPABASE_SERVICE_ROLE_KEY.\n')
    process.exit(1)
  }

  console.log('\nOK:', json.meta?.eventTitle || slug, '—', n, 'program slots')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
