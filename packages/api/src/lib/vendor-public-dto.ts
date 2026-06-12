import {
  inferVendorCategoryFromLegacy,
  normalizeVendorCategory,
  normalizeVendorTags,
  vendorCategoriesCompat,
  type VendorCategory,
} from '@c2k/shared'

import type { vendorProfiles } from '../db/schema.js'

type VendorProfileRow = typeof vendorProfiles.$inferSelect
type VendorProfileInsert = typeof vendorProfiles.$inferInsert

export function resolveVendorCategoryTags(input: {
  category?: string | null
  tags?: readonly string[] | null
  categories?: readonly string[] | null
}): { category: VendorCategory | null; tags: string[]; categories: string[] } {
  let category: VendorCategory | null = null
  if (input.category?.trim()) {
    category = normalizeVendorCategory(input.category)
  }
  const legacy = input.categories ?? []
  if (!category && legacy.length > 0) {
    category = inferVendorCategoryFromLegacy(legacy)
  }

  const tagSources: string[] = []
  if (input.tags?.length) tagSources.push(...input.tags)
  for (const c of legacy) {
    const normalized = normalizeVendorCategory(c)
    if (normalized && normalized === category) continue
    tagSources.push(c)
  }
  const tags = normalizeVendorTags(tagSources)
  const categories = category ? vendorCategoriesCompat(category, tags) : legacy.length ? [...legacy] : []
  return { category, tags, categories }
}

export function vendorProfileWriteFields(input: {
  category?: string | null
  tags?: readonly string[] | null
  categories?: readonly string[] | null
}): Pick<VendorProfileInsert, 'category' | 'tags' | 'categories'> {
  const resolved = resolveVendorCategoryTags(input)
  return {
    category: resolved.category,
    tags: resolved.tags.length ? resolved.tags : null,
    categories: resolved.categories,
  }
}

export function storefrontUrlFromVendorRow(row: {
  externalStoreType?: string | null
  externalStorePublic?: unknown
  etsyShopUrl?: string | null
  website?: string | null
}): string | null {
  const t = row.externalStoreType ?? 'none'
  const pub = row.externalStorePublic as Record<string, string | undefined> | null | undefined
  if (t === 'link_only') {
    return pub?.storefrontUrl ?? row.website ?? null
  }
  if (t === 'shopify' && pub?.shopifyShop) {
    const host = pub.shopifyShop.replace(/^https?:\/\//, '').split('/')[0]
    return `https://${host}`
  }
  if (t === 'woocommerce' && pub?.wooSiteUrl) {
    const u = pub.wooSiteUrl.trim()
    return /^https?:\/\//i.test(u) ? u : `https://${u}`
  }
  return row.etsyShopUrl ?? row.website ?? null
}

export type PublicVendorListItem = {
  id: string
  slug: string
  displayName: string
  bio: string | null
  logoUrl: string | null
  bannerUrl: string | null
  category: string | null
  tags: string[]
  categories: string[]
  rating: number
  verifiedFeedbackCount?: number
  shipsTo: string
  verified: boolean
  commissionStatus: string
  visibility: string
  website: string | null
  storefrontUrl: string | null
  createdAt: string
}

export function toPublicVendorListItem(row: VendorProfileRow): PublicVendorListItem {
  const category = row.category ?? inferVendorCategoryFromLegacy(row.categories ?? []) ?? null
  const tags = row.tags?.length ? row.tags : normalizeVendorTags(row.categories ?? [])
  const categories =
    row.categories?.length ? row.categories : category ? vendorCategoriesCompat(category, tags) : []
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.displayName,
    bio: row.bio,
    logoUrl: row.logoUrl,
    bannerUrl: row.bannerUrl,
    category,
    tags,
    categories,
    rating: row.rating,
    shipsTo: row.shipsTo,
    verified: row.verified,
    commissionStatus: row.commissionStatus,
    visibility: row.visibility,
    website: row.website,
    storefrontUrl: storefrontUrlFromVendorRow(row),
    createdAt: row.createdAt.toISOString(),
  }
}

export type PublicVendorDetail = PublicVendorListItem & {
  makerStory: string | null
  shopPolicies: unknown
  shopHeaderLayout: string
  commissionNotes: string | null
  externalStoreType: string
  externalStorePublic: unknown
  externalListingsSyncedAt: string | null
  usesEtsy: boolean
  etsyShopUrl: string | null
  etsyShopName: string | null
  etsyListingsSyncedAt: string | null
  eckePublish: boolean
}

export function toPublicVendorDetail(row: VendorProfileRow): PublicVendorDetail {
  const base = toPublicVendorListItem(row)
  return {
    ...base,
    makerStory: row.makerStory,
    shopPolicies: row.shopPolicies,
    shopHeaderLayout: row.shopHeaderLayout,
    commissionNotes: row.commissionNotes,
    externalStoreType: row.externalStoreType,
    externalStorePublic: row.externalStorePublic,
    externalListingsSyncedAt: row.externalListingsSyncedAt?.toISOString() ?? null,
    usesEtsy: row.usesEtsy,
    etsyShopUrl: row.etsyShopUrl,
    etsyShopName: row.etsyShopName,
    etsyListingsSyncedAt: row.etsyListingsSyncedAt?.toISOString() ?? null,
    eckePublish: row.eckePublish,
  }
}

/** Idempotent backfill for rows missing category/tags after migration. */
export function backfillVendorCategoryTags(row: VendorProfileRow): Pick<VendorProfileInsert, 'category' | 'tags' | 'categories'> | null {
  if (row.category && row.tags?.length) return null
  const resolved = resolveVendorCategoryTags({
    category: row.category,
    tags: row.tags,
    categories: row.categories,
  })
  if (!resolved.category && resolved.tags.length === 0) return null
  return {
    category: resolved.category,
    tags: resolved.tags.length ? resolved.tags : null,
    categories: resolved.categories,
  }
}
