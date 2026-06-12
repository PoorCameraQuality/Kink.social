const base = process.env.SMOKE_BASE || 'https://kink.social'

async function main() {
  console.log('=== Production smoke tests ===')
  const home = await fetch(base)
  console.log('Home:', home.status)
  const html = await home.text()
  if (!html.includes('family=Sora') && !html.includes('Sora:wght')) {
    throw new Error('Sora font not found in index.html')
  }
  console.log('Sora font: OK')
  if (/Space\+Grotesk|Space Grotesk/i.test(html)) {
    throw new Error('Space Grotesk still in index.html')
  }
  console.log('Space Grotesk removed: OK')

  const ready = await fetch(`${base}/api/health/ready`).then((r) => r.json())
  console.log('Health ready:', ready)
  if (!ready.ok || ready.database !== 'ok') throw new Error('Health ready failed')

  const live = await fetch(`${base}/api/health`).then((r) => r.json())
  console.log('Health live:', live.ok)

  const trending = await fetch(`${base}/api/v1/trending`)
  console.log('Trending:', trending.status)

  const policy = await fetch(`${base}/api/auth/password-reset/policy`).then((r) => r.json())
  console.log('Password reset policy:', policy.enabled)

  console.log('=== All production smokes passed ===')
}

main().catch((e) => {
  console.error('SMOKE FAILED:', e.message)
  process.exit(1)
})
