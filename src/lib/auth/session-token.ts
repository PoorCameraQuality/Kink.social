import { createHmac, timingSafeEqual } from 'crypto'

/** HttpOnly cookie name for signed session payload. */
export const SESSION_COOKIE_NAME = 'c2k_session'

export type SessionPayload = {
  /** Display / mock viewer username */
  username: string
  /** Stable id (mock: same as username until real auth) */
  sub: string
}

function getSecret(): string {
  return process.env.AUTH_SECRET ?? 'dev-insecure-auth-secret-change-me-in-env'
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

/** Encodes session for Set-Cookie (base64url). */
export function encodeSession(payload: SessionPayload): string {
  const json = JSON.stringify(payload)
  const sig = sign(json)
  return Buffer.from(JSON.stringify({ json, sig })).toString('base64url')
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    const raw = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as { json: string; sig: string }
    const expected = sign(raw.json)
    const a = Buffer.from(raw.sig, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    return JSON.parse(raw.json) as SessionPayload
  } catch {
    return null
  }
}
