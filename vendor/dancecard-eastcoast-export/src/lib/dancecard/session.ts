import { createHash, randomBytes } from 'node:crypto'

export const DANCECARD_SESSION_COOKIE = 'eck_dancecard_session'
/** Must include `/api/dancecard/*` so session is sent to route handlers (same-site). */
export const DANCECARD_COOKIE_PATH = '/'
export const SESSION_DAYS = 30

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function newSessionToken(): string {
  return randomBytes(32).toString('hex')
}
