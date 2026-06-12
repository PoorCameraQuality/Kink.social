import { cookies } from 'next/headers'
import { decodeSession, SESSION_COOKIE_NAME, type SessionPayload } from './session-token'

export { SESSION_COOKIE_NAME, encodeSession, decodeSession, type SessionPayload } from './session-token'

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return decodeSession(token)
}
