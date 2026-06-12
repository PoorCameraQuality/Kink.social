import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod'

import { getViewerUserId } from '../auth/viewer-user-id.js'

import { resolveViewerFromRequest } from '../auth/resolve-viewer.js'



function requireDb(reply: FastifyReply): boolean {

  if (process.env.USE_DATABASE !== 'true') {

    reply.status(503).send({ error: 'Set USE_DATABASE=true' })

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

  return { userId: getViewerUserId(v.payload) ?? v.payload.sub }

}



const voteBody = z.object({

  targetUsername: z.string().min(1),

  delta: z.union([z.literal(1), z.literal(-1)]),

})



/** Phase 0: peer ±1 deprecated - use trust-context signals (moderator review) instead. */

export async function registerPeerReputationRoutes(app: FastifyInstance) {

  app.post('/api/v1/reputation/peers', async (req, reply) => {

    if (!requireDb(reply)) return

    const user = requireUser(req, reply)

    if (!user) return

    const parsed = voteBody.safeParse(req.body)

    if (!parsed.success) return reply.status(400).send({ error: 'Invalid body' })

    return reply.status(410).send({

      error: 'Peer reputation voting is deprecated. Trust signals are moving to a moderator-reviewed context model.',

      deprecated: true,

      code: 'peer_reputation_deprecated',

    })

  })

}

