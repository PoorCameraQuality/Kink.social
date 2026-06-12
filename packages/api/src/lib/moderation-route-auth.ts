import type { FastifyReply, FastifyRequest } from 'fastify'
import { getViewerUserId } from '../auth/viewer-user-id.js'
import { resolveViewerFromRequest } from '../auth/resolve-viewer.js'
import { isPlatformModeratorUser, isSiteAdmin } from './platform-staff.js'
import { isUserIdentityBanned } from './peer-reputation.js'

export function requireDb(reply: FastifyReply): boolean {
  if (process.env.USE_DATABASE !== 'true') {
    reply.status(503).send({ error: 'Set USE_DATABASE=true' })
    return false
  }
  return true
}

export function requireUser(req: FastifyRequest, reply: FastifyReply): { userId: string } | null {
  const v = resolveViewerFromRequest(req)
  if (!v.authenticated || !v.payload?.sub) {
    reply.status(401).send({ error: 'Unauthorized' })
    return null
  }
  return { userId: getViewerUserId(v.payload) ?? v.payload.sub }
}

/** Reject banned users on mutating/authenticated routes (async follow-up to requireUser). */
export async function rejectIfUserIdentityBanned(
  userId: string,
  reply: FastifyReply,
): Promise<boolean> {
  if (process.env.USE_DATABASE !== 'true') return false
  if (await isUserIdentityBanned(userId)) {
    reply.status(403).send({ error: 'Access denied' })
    return true
  }
  return false
}

export async function requirePlatformModerator(userId: string, reply: FastifyReply): Promise<boolean> {
  if (!(await isPlatformModeratorUser(userId))) {
    reply.status(403).send({ error: 'Forbidden' })
    return false
  }
  return true
}

export async function requireSiteAdmin(userId: string, reply: FastifyReply): Promise<boolean> {
  if (!(await isSiteAdmin(userId))) {
    reply.status(403).send({ error: 'Forbidden' })
    return false
  }
  return true
}

export async function requireSiteOwner(userId: string, reply: FastifyReply): Promise<boolean> {
  const { isSiteOwner } = await import('./platform-staff.js')
  if (!(await isSiteOwner(userId))) {
    reply.status(403).send({ error: 'Forbidden. Owner access required' })
    return false
  }
  return true
}
