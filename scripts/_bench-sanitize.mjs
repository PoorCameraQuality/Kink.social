import sharp from 'sharp'

const buf = await sharp({
  create: { width: 3000, height: 2000, channels: 3, background: { r: 120, g: 80, b: 60 } },
})
  .jpeg({ quality: 90 })
  .toBuffer()

console.log('bytes', buf.length)
const t0 = Date.now()
const { sanitizeImageBuffer } = await import('../packages/api/dist/lib/media-sanitize.js')
const out = await sanitizeImageBuffer(buf, 'image/jpeg')
console.log('sanitize_ms', Date.now() - t0, 'out', out.width, out.height, out.buffer.length)
