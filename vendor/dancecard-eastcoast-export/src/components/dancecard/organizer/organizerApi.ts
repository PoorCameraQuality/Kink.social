export class OrganizerApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(body || `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

function base(slug: string) {
  return `/api/organizer/dancecard/${encodeURIComponent(slug)}`
}

export async function organizerDancecardFetch<T>(slug: string, path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  }
  const res = await fetch(`${base(slug)}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })
  const text = await res.text()
  if (!res.ok) {
    throw new OrganizerApiError(res.status, text)
  }
  if (text) {
    return JSON.parse(text) as T
  }
  return undefined as T
}
