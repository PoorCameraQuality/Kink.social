import {
  decodeSession,
  SESSION_COOKIE_NAME,
  type SessionPayload,
} from '@c2k/shared/session-token'
import type { FastifyRequest } from 'fastify'
import { allowAuthFallback as allowAuthFallbackFromGuard } from '../lib/production-guard.js'

/** Must match `MOCK_VIEWER_USERNAME` in web `mock-seeds.ts`. */
const MOCK_VIEWER_USERNAME = 'RopeDreamer'

export function allowAuthFallback(): boolean {
  return allowAuthFallbackFromGuard()
}

export type ResolvedViewer = {
  authenticated: boolean
  fallback: boolean
  username: string | null
  payload: SessionPayload | null
}

export function resolveViewerFromRequest(req: FastifyRequest): ResolvedViewer {
  const raw = req.cookies[SESSION_COOKIE_NAME]
  const decoded = raw ? decodeSession(raw) : null
  if (decoded) {
    return { authenticated: true, fallback: false, username: decoded.username, payload: decoded }
  }

  if (allowAuthFallback()) {
    return {
      authenticated: false,
      fallback: true,
      username: MOCK_VIEWER_USERNAME,
      payload: { username: MOCK_VIEWER_USERNAME, sub: MOCK_VIEWER_USERNAME },
    }
  }

  return { authenticated: false, fallback: false, username: null, payload: null }
}
