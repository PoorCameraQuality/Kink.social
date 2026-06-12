export class DancecardApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(body || `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

/** Short message for UI (handles JSON `{ error }` bodies from API routes). */
export function formatDancecardApiMessage(e: unknown): string {
  if (!(e instanceof DancecardApiError)) return 'Something went wrong. Please try again.'
  const raw = e.body?.trim() ?? ''
  if (!raw) return e.message || 'Request failed'
  try {
    const j = JSON.parse(raw) as { error?: string; message?: string }
    if (typeof j.error === 'string' && j.error) return j.error
    if (typeof j.message === 'string' && j.message) return j.message
  } catch {
    if (raw.length < 400 && !raw.startsWith('<')) return raw
  }
  return 'Request failed. Please try again.'
}

function apiBase(slug: string): string {
  return `/api/dancecard/${encodeURIComponent(slug)}`
}

export async function dancecardFetch<T>(
  slug: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  }
  const res = await fetch(`${apiBase(slug)}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })
  const text = await res.text()
  if (!res.ok) {
    const t = text.trimStart()
    if (t.startsWith('<!') || t.startsWith('<html')) {
      throw new DancecardApiError(
        res.status,
        `Expected JSON from ${apiBase(slug)}${path} but got an HTML page (HTTP ${res.status}). ` +
          `If this is the public site, the latest deploy may be missing dancecard API routes — ` +
          `redeploy from GitHub master and confirm Vercel build output lists /api/dancecard/[eventSlug]/schedule.`,
      )
    }
    throw new DancecardApiError(res.status, text)
  }
  if (text) {
    const t = text.trimStart()
    if (t.startsWith('<!') || t.startsWith('<html')) {
      throw new DancecardApiError(
        res.status,
        `Expected JSON from ${apiBase(slug)}${path} but received HTML. Check deployment and URL.`,
      )
    }
    return JSON.parse(text) as T
  }
  return undefined as T
}
