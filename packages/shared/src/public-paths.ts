/**
 * Paths that do not require a session when
 * `VITE_AUTH_ALLOW_FALLBACK === 'false'` (strict mode).
 * Keep in sync with API auth middleware.
 */
const PUBLIC_EXACT = new Set([
  '/',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/guidelines',
  '/accessibility',
  '/support',
])

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
  return false
}
