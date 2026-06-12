const html = await (await fetch('https://kink.social/')).text()
const jsMatch = html.match(/assets\/index-[^"]+\.js/)
if (!jsMatch) throw new Error('no js bundle')
const js = await (await fetch(`https://kink.social/${jsMatch[0]}`)).text()
const needle = 'Your one stop shop'
console.log(js.includes(needle) ? 'PASS hero copy in live bundle' : 'FAIL hero copy missing')
