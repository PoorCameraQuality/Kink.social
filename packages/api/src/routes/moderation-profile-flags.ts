import { desc, eq } from 'drizzle-orm'

import type { FastifyInstance } from 'fastify'

import { z } from 'zod'

import { db, schema } from '../db/index.js'

import { getPlatformStaffRole, isPlatformModeratorUser } from '../lib/platform-staff.js'

import {

  requireDb,

  requirePlatformModerator,

  requireUser,

} from '../lib/moderation-route-auth.js'



export async function registerModerationProfileFlagsRoutes(app: FastifyInstance) {

  app.get('/api/v1/moderation/me', async (req, reply) => {

    if (!requireDb(reply)) return

    const user = requireUser(req, reply)

    if (!user) return

    const role = await getPlatformStaffRole(user.userId)

    return reply.send({
      moderator: role !== null,
      siteOwner: role === 'OWNER_ADMIN',
      siteAdmin: role === 'SITE_ADMIN',
      trustSafetyAdmin: role === 'TRUST_SAFETY_ADMIN' || role === 'SITE_ADMIN',
      legalAdmin: role === 'LEGAL_ADMIN' || role === 'SITE_ADMIN',
      role,
    })

  })



  app.get('/api/v1/moderation/profile-review-flags', async (req, reply) => {

    if (!requireDb(reply)) return

    const user = requireUser(req, reply)

    if (!user) return

    if (!(await requirePlatformModerator(user.userId, reply))) return

    const q = req.query as { status?: string }

    const status = q.status === 'CLOSED' ? 'CLOSED' : 'OPEN'

    const rows = await db

      .select({

        id: schema.profileReviewFlags.id,

        targetUserId: schema.profileReviewFlags.targetUserId,

        targetUsername: schema.users.username,

        kind: schema.profileReviewFlags.kind,

        status: schema.profileReviewFlags.status,

        meta: schema.profileReviewFlags.meta,

        createdAt: schema.profileReviewFlags.createdAt,

      })

      .from(schema.profileReviewFlags)

      .innerJoin(schema.users, eq(schema.profileReviewFlags.targetUserId, schema.users.id))

      .where(eq(schema.profileReviewFlags.status, status))

      .orderBy(desc(schema.profileReviewFlags.createdAt))

      .limit(100)

    return reply.send({ items: rows })

  })



  const patchBody = z.object({

    status: z.enum(['OPEN', 'CLOSED']),

    note: z.string().max(2000).optional(),

  })



  app.patch('/api/v1/moderation/profile-review-flags/:flagId', async (req, reply) => {

    if (!requireDb(reply)) return

    const user = requireUser(req, reply)

    if (!user) return

    if (!(await requirePlatformModerator(user.userId, reply))) return

    const { flagId } = req.params as { flagId: string }

    const parsed = patchBody.safeParse(req.body)

    if (!parsed.success) return reply.status(400).send({ error: 'Invalid body' })

    const [existing] = await db

      .select()

      .from(schema.profileReviewFlags)

      .where(eq(schema.profileReviewFlags.id, flagId))

      .limit(1)

    if (!existing) return reply.status(404).send({ error: 'Not found' })

    const prevMeta =

      existing.meta && typeof existing.meta === 'object' && !Array.isArray(existing.meta)

        ? (existing.meta as Record<string, unknown>)

        : {}

    const nextMeta = {

      ...prevMeta,

      ...(parsed.data.note !== undefined ? { moderatorNote: parsed.data.note } : {}),

      lastActionBy: user.userId,

      lastActionAt: new Date().toISOString(),

    }

    const [updated] = await db

      .update(schema.profileReviewFlags)

      .set({

        status: parsed.data.status,

        meta: nextMeta,

      })

      .where(eq(schema.profileReviewFlags.id, flagId))

      .returning()

    return reply.send({ flag: updated })

  })

}


