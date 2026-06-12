import { and, eq, isNotNull, notInArray, or } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import { fetchActiveListingsPage, fetchListingPrimaryImageUrl, etsyConfigured } from './etsy-client.js'
import { externalStoreSupportsSync, resolveExternalProvider } from './external-provider.js'

const PAGE_SIZE = 100
const ETSY_PROVIDER = 'etsy'

function moneyToCents(price: { amount?: number; divisor?: number } | undefined): number {
  if (!price || typeof price.amount !== 'number') return 0
  const div = typeof price.divisor === 'number' && price.divisor > 0 ? price.divisor : 100
  return Math.max(0, Math.round((price.amount / div) * 100))
}

/**
 * Full sync of active Etsy listings into vendor_external_listings.
 */
export async function syncVendorEtsyListings(vendorId: string): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  if (!etsyConfigured()) {
    return { ok: false, error: 'Etsy integration is not configured (set ETSY_KEYSTRING)' }
  }

  const [vendor] = await db
    .select()
    .from(schema.vendorProfiles)
    .where(eq(schema.vendorProfiles.id, vendorId))
    .limit(1)
  if (!vendor?.etsyShopId) {
    return { ok: false, error: 'Vendor has no Etsy shop connected' }
  }

  const shopId = vendor.etsyShopId
  const now = new Date()
  const seenIds: string[] = []
  let offset = 0

  try {
    for (;;) {
      const { listings, count } = await fetchActiveListingsPage(shopId, offset, PAGE_SIZE)
      const imageUrls = await Promise.all(
        listings.map((L) => fetchListingPrimaryImageUrl(L.listing_id).catch(() => null)),
      )
      for (let i = 0; i < listings.length; i++) {
        const L = listings[i]
        const idStr = String(L.listing_id)
        seenIds.push(idStr)
        const priceCents = moneyToCents(L.price)
        const currency = (L.price?.currency_code ?? 'USD').slice(0, 8) || 'USD'
        const title = (L.title ?? 'Listing').slice(0, 5000)
        const listingUrl = L.url ?? `https://www.etsy.com/listing/${L.listing_id}`
        const primaryImageUrl = imageUrls[i] ?? null

        await db
          .insert(schema.vendorExternalListings)
          .values({
            vendorId,
            provider: ETSY_PROVIDER,
            externalListingId: idStr,
            title,
            priceCents,
            currency,
            primaryImageUrl,
            listingUrl,
            syncedAt: now,
            raw: L as unknown as Record<string, unknown>,
          })
          .onConflictDoUpdate({
            target: [
              schema.vendorExternalListings.vendorId,
              schema.vendorExternalListings.provider,
              schema.vendorExternalListings.externalListingId,
            ],
            set: {
              title,
              priceCents,
              currency,
              primaryImageUrl,
              listingUrl,
              syncedAt: now,
              raw: L as unknown as Record<string, unknown>,
            },
          })
      }
      offset += listings.length
      if (listings.length === 0 || offset >= count) break
    }

    if (seenIds.length === 0) {
      await db
        .delete(schema.vendorExternalListings)
        .where(
          and(eq(schema.vendorExternalListings.vendorId, vendorId), eq(schema.vendorExternalListings.provider, ETSY_PROVIDER))
        )
    } else {
      await db
        .delete(schema.vendorExternalListings)
        .where(
          and(
            eq(schema.vendorExternalListings.vendorId, vendorId),
            eq(schema.vendorExternalListings.provider, ETSY_PROVIDER),
            notInArray(schema.vendorExternalListings.externalListingId, seenIds)
          )
        )
    }

    await db
      .update(schema.vendorProfiles)
      .set({
        externalListingsSyncedAt: now,
        externalSyncError: null,
        etsyListingsSyncedAt: now,
        etsySyncError: null,
      })
      .where(eq(schema.vendorProfiles.id, vendorId))

    return { ok: true, count: seenIds.length }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await db
      .update(schema.vendorProfiles)
      .set({
        externalSyncError: msg.slice(0, 2000),
        etsySyncError: msg.slice(0, 2000),
      })
      .where(eq(schema.vendorProfiles.id, vendorId))
    return { ok: false, error: msg }
  }
}

export async function syncAllEtsyVendors(): Promise<{ vendors: number; errors: string[] }> {
  if (!etsyConfigured()) {
    return { vendors: 0, errors: ['ETSY_KEYSTRING not set'] }
  }
  const rows = await db
    .select({ id: schema.vendorProfiles.id })
    .from(schema.vendorProfiles)
    .where(
      or(
        and(eq(schema.vendorProfiles.externalStoreType, 'etsy'), isNotNull(schema.vendorProfiles.etsyShopId)),
        and(eq(schema.vendorProfiles.usesEtsy, true), isNotNull(schema.vendorProfiles.etsyShopId))
      )
    )
  const uniq = [...new Map(rows.map((r) => [r.id, r])).values()]
  const errors: string[] = []
  let n = 0
  for (const r of uniq) {
    const res = await syncVendorEtsyListings(r.id)
    n++
    if (!res.ok) errors.push(`${r.id}: ${res.error}`)
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return { vendors: n, errors }
}
