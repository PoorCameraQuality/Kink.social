/**
 * Minimal Etsy Open API v3 client (read-only).
 * Base URL and keystring auth: https://developers.etsy.com/documentation
 */
const DEFAULT_BASE = 'https://openapi.etsy.com'

export function getEtsyKeystring(): string | null {
  const k = process.env.ETSY_KEYSTRING?.trim()
  return k && k.length > 0 ? k : null
}

export function etsyConfigured(): boolean {
  return getEtsyKeystring() !== null
}

function baseUrl(): string {
  return (process.env.ETSY_API_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, '')
}

async function etsyFetch(path: string, searchParams?: Record<string, string | number | undefined>): Promise<Response> {
  const key = getEtsyKeystring()
  if (!key) {
    throw new Error('ETSY_KEYSTRING is not set')
  }
  const u = new URL(`${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`)
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== '') u.searchParams.set(k, String(v))
    }
  }
  return fetch(u.toString(), {
    headers: {
      Accept: 'application/json',
      'x-api-key': key,
    },
  })
}

export type EtsyShop = {
  shop_id: number
  shop_name?: string
  title?: string
  url?: string
  icon_url_fullxfull?: string
}

export type EtsyListing = {
  listing_id: number
  title?: string
  url?: string
  price?: { amount?: number; divisor?: number; currency_code?: string }
  /** Present on some listing payloads */
  image_id?: number
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

export function parseEtsyShopInput(raw: string): string {
  const t = raw.trim()
  const m = t.match(/etsy\.com\/shop\/([^/?#]+)/i)
  if (m) return decodeURIComponent(m[1].replace(/\/$/, ''))
  return t.replace(/^@/, '').trim()
}

/** Resolve shop: numeric id uses getShop; else findShops by name. */
export async function resolveEtsyShop(input: string): Promise<{ shop: EtsyShop } | { error: string }> {
  const parsed = parseEtsyShopInput(input)
  if (!parsed) return { error: 'Shop name or URL is required' }

  if (/^\d+$/.test(parsed)) {
    const r = await etsyFetch(`/v3/application/shops/${parsed}`)
    if (!r.ok) {
      const err = await r.text().catch(() => '')
      return { error: err || `Etsy getShop failed (${r.status})` }
    }
    const j = (await r.json()) as { shop?: unknown }
    const rec = asRecord(j.shop ?? j)
    if (!rec || typeof rec.shop_id !== 'number') return { error: 'Invalid shop response from Etsy' }
    return { shop: rec as unknown as EtsyShop }
  }

  const r = await etsyFetch('/v3/application/shops', {
    shop_name: parsed,
    limit: 10,
    offset: 0,
  })
  if (!r.ok) {
    const err = await r.text().catch(() => '')
    return { error: err || `Etsy findShops failed (${r.status})` }
  }
  const j = (await r.json()) as { results?: unknown[]; count?: number }
  const results = Array.isArray(j.results) ? j.results : []
  if (results.length === 0) return { error: `No Etsy shop found for “${parsed}”` }

  const lower = parsed.toLowerCase()
  let best = asRecord(results[0])
  for (const row of results) {
    const rec = asRecord(row)
    const name = String(rec?.shop_name ?? '').toLowerCase()
    if (name === lower) {
      best = rec
      break
    }
  }
  if (!best || typeof best.shop_id !== 'number') return { error: 'Invalid shop search response from Etsy' }
  return { shop: best as unknown as EtsyShop }
}

export function extractEtsyListingImageUrl(imageRow: unknown): string | null {
  const rec = asRecord(imageRow)
  if (!rec) return null
  for (const key of ['url_570xN', 'url_fullxfull', 'url_170x135', 'url_75x75'] as const) {
    const url = rec[key]
    if (typeof url === 'string' && url.length > 0) return url
  }
  return null
}

/** First listing image URL, or null if none / API error. */
export async function fetchListingPrimaryImageUrl(listingId: number): Promise<string | null> {
  const r = await etsyFetch(`/v3/application/listings/${listingId}/images`, { limit: 1, offset: 0 })
  if (!r.ok) return null
  const j = (await r.json()) as { results?: unknown[] }
  const results = Array.isArray(j.results) ? j.results : []
  if (results.length === 0) return null
  return extractEtsyListingImageUrl(results[0])
}

export async function fetchActiveListingsPage(
  shopId: string,
  offset: number,
  limit: number
): Promise<{ listings: EtsyListing[]; count: number }> {
  const r = await etsyFetch(`/v3/application/shops/${shopId}/listings/active`, {
    limit,
    offset,
  })
  if (!r.ok) {
    const err = await r.text().catch(() => '')
    throw new Error(err || `Etsy listings failed (${r.status})`)
  }
  const j = (await r.json()) as { results?: unknown[]; count?: number }
  const results = Array.isArray(j.results) ? j.results : []
  const listings: EtsyListing[] = []
  for (const row of results) {
    const rec = asRecord(row)
    if (rec && typeof rec.listing_id === 'number') {
      listings.push(rec as unknown as EtsyListing)
    }
  }
  return { listings, count: typeof j.count === 'number' ? j.count : listings.length }
}
