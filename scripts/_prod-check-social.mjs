const base = process.env.SMOKE_BASE || 'https://kink.social'

async function main() {
  const trending = await fetch(`${base}/api/v1/trending`).then((r) => r.json())
  const people = trending?.people ?? trending?.items ?? []
  const username = people[0]?.username ?? 'brax'
  console.log('Checking profile:', username)
  const r = await fetch(`${base}/api/profile/${encodeURIComponent(username)}`)
  const j = await r.json()
  if (j.error) {
    console.log('Profile error:', j.error)
    process.exit(1)
  }
  console.log('connectionsSummary:', JSON.stringify(j.connectionsSummary))
  console.log('followsSummary:', JSON.stringify(j.followsSummary))
  console.log('mutualConnections:', JSON.stringify(j.mutualConnections))
  if (!j.connectionsSummary || j.followsSummary == null) {
    throw new Error('Missing social summary fields on profile payload')
  }
  console.log('Profile social summary: OK')
}

main().catch((e) => {
  console.error('FAIL:', e.message)
  process.exit(1)
})
