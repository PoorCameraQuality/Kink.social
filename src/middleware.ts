import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/auth/session-token'
import { isPublicPath } from '@/lib/auth/public-paths'

/**
 * When `NEXT_PUBLIC_AUTH_ALLOW_FALLBACK` is `'false'`, unauthenticated users
 * without a valid `c2k_session` cookie are redirected to `/` (with `?redirect=`).
 * Default / omitted env keeps permissive prototype behavior (no redirect).
 */
export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_AUTH_ALLOW_FALLBACK !== 'false') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = token ? decodeSession(token) : null
  if (session?.username) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.searchParams.set('redirect', pathname)
  url.searchParams.set('login', '1')
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    /*
     * Skip API (routes handle auth), Next internals, and common static assets.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
