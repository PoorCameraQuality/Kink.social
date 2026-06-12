#!/usr/bin/env node
const BASE = process.env.SMOKE_BASE ?? 'https://kink.social'
const checks = []

async function check(id, fn) {
  try {
    const ok = await fn()
    checks.push({ id, ok: !!ok })
    console.log(`${ok ? 'PASS' : 'FAIL'} ${id}`)
  } catch (e) {
    checks.push({ id, ok: false })
    console.log(`FAIL ${id} — ${e.message}`)
  }
}

async function main() {
  console.log(`Prod smoke — ${BASE}\n`)

  await check('home 200', async () => (await fetch(`${BASE}/`)).status === 200)

  await check('health 200', async () => (await fetch(`${BASE}/api/health`)).ok)

  await check('health/ready all deps', async () => {
    const r = await fetch(`${BASE}/api/health/ready`)
    const j = await r.json()
    return r.ok && j.ok && j.database === 'ok' && j.redis === 'ok' && j.s3 === 'ok'
  })

  await check('mobile CSS tokens in bundle', async () => {
    const html = await (await fetch(`${BASE}/`)).text()
    const cssMatch = html.match(/assets\/index-[^"]+\.css/)
    if (!cssMatch) throw new Error('no css asset in index.html')
    const css = await (await fetch(`${BASE}/${cssMatch[0]}`)).text()
    return css.includes('c2k-main-mobile-pb') && css.includes('--c2k-bottom-nav-total-h')
  })

  await check('js bundle loads', async () => {
    const html = await (await fetch(`${BASE}/`)).text()
    const jsMatch = html.match(/assets\/index-[^"]+\.js/)
    if (!jsMatch) throw new Error('no js asset')
    return (await fetch(`${BASE}/${jsMatch[0]}`)).ok
  })

  await check('login page 200', async () => (await fetch(`${BASE}/?login=1`)).status === 200)

  await check('auth session endpoint', async () => {
    const r = await fetch(`${BASE}/api/auth/session`)
    return r.status === 200 || r.status === 401
  })

  await check('messaging page shell', async () => (await fetch(`${BASE}/messaging`)).status === 200)

  await check('explore page shell', async () => (await fetch(`${BASE}/explore`)).status === 200)

  const failed = checks.filter((c) => !c.ok)
  console.log(`\nSummary: ${checks.length - failed.length}/${checks.length} passed`)
  if (failed.length) process.exit(1)
}

main()
