import { NextResponse } from 'next/server'
import { DANCECARD_SESSION_COOKIE, DANCECARD_COOKIE_PATH } from '@/lib/dancecard/session'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(DANCECARD_SESSION_COOKIE, '', {
    httpOnly: true,
    path: DANCECARD_COOKIE_PATH,
    maxAge: 0,
  })
  return res
}
