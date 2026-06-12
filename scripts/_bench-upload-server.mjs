import sharp from 'sharp'
import { sanitizeImageBuffer } from '../packages/api/src/lib/media-sanitize.ts'

const buf = await sharp({
  create: { width: 3000, height: 2000, channels: 3, background: { r: 120, g: 80, b: 60 } },
})
  .jpeg({ quality: 90 })
  .toBuffer()

console.log('input_bytes', buf.length)
const t0 = Date.now()
const out = await sanitizeImageBuffer(buf, 'image/jpeg')
console.log('sanitize_ms', Date.now() - t0, 'dims', out.width, out.height, 'out_bytes', out.buffer.length)
