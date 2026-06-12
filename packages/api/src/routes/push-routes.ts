import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { getViewerUserId } from '../auth/viewer-user-id.js'
import { resolveViewerFromRequest } from '../auth/resolve-viewer.js'
import { db, schema } from '../db/index.js'
import { rateLimitRoute } from '../lib/rate-limit-config.js'
import { vapidPublicKey, webPushConfigured } from '../lib/web-push-send.js'

function requireDb(reply: FastifyReply): boolean {
  if (process.env.USE_DATABASE !== 'true') {
    reply.status(503).send({ error: 'Set USE_DATABASE=true for this endpoint' })
    return false
  }
  return true
}

function requireUser(req: FastifyRequest, reply: FastifyReply): { userId: string } | null {
  const v = resolveViewerFromRequest(req)
  if (!v.authenticated || !v.payload?.sub) {
    reply.status(401).send({ error: 'Unauthorized' })
    return null
  }
  const userId = getViewerUserId(v.payload)
  if (!userId) {
    reply.status(401).send({ error: 'Invalid session' })
    return null
  }
  return { userId }
}

/** C215 foundation - store Web Push subscriptions; send requires VAPID keys (future). */
export async function registerPushRoutes(app: FastifyInstance) {
  app.get('/api/v1/me/push/status', async (_req, reply) => {
    const configured = webPushConfigured()
    return reply.send({
      configured,
      vapidPublicKey: vapidPublicKey(),
      transport: configured ? 'web-push' : 'disabled',
    })
  })

  app.post('/api/v1/me/push/subscribe', { ...rateLimitRoute('pushSubscribe') }, async (req, reply) => {
    if (!requireDb(reply)) return
    const actor = requireUser(req, reply)
    if (!actor) return
    const parsed = z
      .object({
        endpoint: z.string().url(),
        keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
      })
      .safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid body' })
    await db
      .insert(schema.pushSubscriptions)
      .values({
        userId: actor.userId,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
      })
      .onConflictDoUpdate({
        target: [schema.pushSubscriptions.userId, schema.pushSubscriptions.endpoint],
        set: {
          p256dh: parsed.data.keys.p256dh,
          auth: parsed.data.keys.auth,
        },
      })
    return reply.send({ ok: true })
  })

  app.delete('/api/v1/me/push/subscribe', async (req, reply) => {
    if (!requireDb(reply)) return
    const actor = requireUser(req, reply)
    if (!actor) return
    const parsed = z.object({ endpoint: z.string().url() }).safeParse(req.body)
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid body' })
    await db
      .delete(schema.pushSubscriptions)
      .where(
        and(
          eq(schema.pushSubscriptions.userId, actor.userId),
          eq(schema.pushSubscriptions.endpoint, parsed.data.endpoint),
        ),
      )
    return reply.send({ ok: true })
  })
}
