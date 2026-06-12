import type { SessionPayload } from '@c2k/shared/session-token'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Returns PostgreSQL user id when session is a real DB user (not mock fallback). */
export function getViewerUserId(payload: SessionPayload | null | undefined): string | null {
  if (!payload?.sub) return null
  return UUID_RE.test(payload.sub) ? payload.sub : null
}
