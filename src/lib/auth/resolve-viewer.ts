import { cookies } from 'next/headers'
import { decodeSession, SESSION_COOKIE_NAME, type SessionPayload } from '@/lib/auth/session-token'
import { MOCK_VIEWER_USERNAME } from '@/data/mock-data'

/** When true (default), unauthenticated requests still map to the mock viewer for UX continuity. */
export function allowAuthFallback(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_ALLOW_FALLBACK !== 'false'
}

export type ResolvedViewer = {
  authenticated: boolean
  fallback: boolean
  username: string | null
  payload: SessionPayload | null
}

/**
 * Resolves the current viewer from the session cookie and fallback policy.
 * Use in Route Handlers and Server Components (server-only).
 */
export function resolveViewerFromCookies(): ResolvedViewer {
  const store = cookies()
  const raw = store.get(SESSION_COOKIE_NAME)?.value
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
