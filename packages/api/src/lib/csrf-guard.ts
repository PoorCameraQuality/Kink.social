import type { FastifyReply, FastifyRequest } from 'fastify'
import { SESSION_COOKIE_NAME } from '@c2k/shared/session-token'

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function allowedOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean)
  if (fromEnv?.length) return fromEnv
  return ['http://localhost:5173', 'http://127.0.0.1:5173']
}

function pathExempt(path: string): boolean {
  if (path.startsWith('/api/health')) return true
  if (path.startsWith('/api/auth/')) return true
  if (path.startsWith('/api/ws')) return true
  return false
}

function originAllowed(origin: string, allowed: string[]): boolean {
  return allowed.some((a) => a === origin)
}

/**
 * Cookie-session CSRF guard: mutating requests with a session cookie must come from an allowed Origin/Referer.
 * Bearer-only clients (no session cookie) are exempt.
 */
export function enforceCookieCsrf(req: FastifyRequest, reply: FastifyReply): boolean {
  if (!MUTATING.has(req.method)) return true
  const path = (req.url.split('?')[0] ?? '').replace(/\/+$/, '') || '/'
  if (pathExempt(path)) return true

  const hasSessionCookie = Boolean(req.cookies?.[SESSION_COOKIE_NAME])
  if (!hasSessionCookie) return true

  const authHeader = req.headers.authorization
  if (typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    return true
  }

  const secFetchSite = req.headers['sec-fetch-site']
  if (secFetchSite === 'cross-site') {
    void reply.status(403).send({ error: 'Forbidden', code: 'csrf_cross_site' })
    return false
  }

  const allowed = allowedOrigins()
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : ''
  if (origin) {
    if (!originAllowed(origin, allowed)) {
      void reply.status(403).send({ error: 'Forbidden', code: 'csrf_bad_origin' })
      return false
    }
    return true
  }

  const referer = typeof req.headers.referer === 'string' ? req.headers.referer : ''
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin
      if (!originAllowed(refOrigin, allowed)) {
        void reply.status(403).send({ error: 'Forbidden', code: 'csrf_bad_referer' })
        return false
      }
      return true
    } catch {
      void reply.status(403).send({ error: 'Forbidden', code: 'csrf_bad_referer' })
      return false
    }
  }

  void reply.status(403).send({ error: 'Forbidden', code: 'csrf_missing_origin' })
  return false
}
