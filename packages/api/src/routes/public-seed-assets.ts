import { createReadStream, existsSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import type { FastifyInstance } from 'fastify'
import { getWebPublicSeedPafDir } from '../db/local-seed-images.js'

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

export async function registerPublicSeedAssetRoutes(app: FastifyInstance) {
  app.get('/api/public-seed/paf/:filename', async (req, reply) => {
    const raw = (req.params as { filename?: string }).filename ?? ''
    const name = basename(raw)
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      return reply.status(400).send({ error: 'Invalid filename' })
    }
    const root = getWebPublicSeedPafDir()
    const abs = join(root, name)
    if (!existsSync(abs) || !statSync(abs).isFile()) {
      return reply.status(404).send({ error: 'Not found' })
    }
    const ext = extname(name).toLowerCase()
    const mime = MIME[ext] ?? 'application/octet-stream'
    reply.header('Cache-Control', 'public, max-age=3600')
    return reply.type(mime).send(createReadStream(abs))
  })
}
