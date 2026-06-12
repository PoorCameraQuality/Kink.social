import { z } from 'zod'

/** Purpose-based vendor discovery categories. Stored in `vendor_profiles.category`. */
export const VENDOR_CATEGORIES = {
  ropeRigging: 'Rope & rigging',
  impactSensation: 'Impact & sensation',
  leatherWear: 'Leather & wear',
  gearAccessories: 'Gear & accessories',
  artLifestyle: 'Art & lifestyle',
  services: 'Services',
  aftercareWellness: 'Aftercare & wellness',
} as const

export type VendorCategory = (typeof VENDOR_CATEGORIES)[keyof typeof VENDOR_CATEGORIES]

export const VENDOR_CATEGORY_VALUES: readonly VendorCategory[] = Object.values(VENDOR_CATEGORIES)

/** Short helper copy for onboarding, settings, and filter tooltips. */
export const VENDOR_CATEGORY_DESCRIPTIONS: Record<VendorCategory, string> = {
  [VENDOR_CATEGORIES.ropeRigging]: 'Rope, rigging, suspension, and shibari supplies',
  [VENDOR_CATEGORIES.impactSensation]: 'Floggers, paddles, sensation tools, and impact toys',
  [VENDOR_CATEGORIES.leatherWear]: 'Leather apparel, harnesses, collars, and fetish wear',
  [VENDOR_CATEGORIES.gearAccessories]: 'General BDSM gear, jewelry, pup play, and accessories',
  [VENDOR_CATEGORIES.artLifestyle]: 'Art prints, decor, lifestyle goods, and mixed media',
  [VENDOR_CATEGORIES.services]: 'Photography, commissions, and professional services',
  [VENDOR_CATEGORIES.aftercareWellness]: 'Safety gear, aftercare, wellness, and care products',
}

const CANONICAL_BY_LOWER = new Map<string, VendorCategory>(
  VENDOR_CATEGORY_VALUES.map((c) => [c.toLowerCase(), c])
)

/** Legacy free-form labels and old filter chips → canonical purpose category. */
const LEGACY_VENDOR_CATEGORY_ALIASES: Record<string, VendorCategory> = {
  rope: VENDOR_CATEGORIES.ropeRigging,
  rigging: VENDOR_CATEGORIES.ropeRigging,
  shibari: VENDOR_CATEGORIES.ropeRigging,
  jute: VENDOR_CATEGORIES.ropeRigging,
  impact: VENDOR_CATEGORIES.impactSensation,
  sensation: VENDOR_CATEGORIES.impactSensation,
  flogger: VENDOR_CATEGORIES.impactSensation,
  floggers: VENDOR_CATEGORIES.impactSensation,
  handmade: VENDOR_CATEGORIES.impactSensation,
  leather: VENDOR_CATEGORIES.leatherWear,
  restraints: VENDOR_CATEGORIES.leatherWear,
  harness: VENDOR_CATEGORIES.leatherWear,
  harnesses: VENDOR_CATEGORIES.leatherWear,
  apparel: VENDOR_CATEGORIES.leatherWear,
  fetish: VENDOR_CATEGORIES.leatherWear,
  'pup play': VENDOR_CATEGORIES.gearAccessories,
  pup: VENDOR_CATEGORIES.gearAccessories,
  gear: VENDOR_CATEGORIES.gearAccessories,
  toys: VENDOR_CATEGORIES.gearAccessories,
  accessories: VENDOR_CATEGORIES.gearAccessories,
  jewelry: VENDOR_CATEGORIES.gearAccessories,
  collars: VENDOR_CATEGORIES.gearAccessories,
  clothing: VENDOR_CATEGORIES.leatherWear,
  art: VENDOR_CATEGORIES.artLifestyle,
  lifestyle: VENDOR_CATEGORIES.artLifestyle,
  decor: VENDOR_CATEGORIES.artLifestyle,
  photography: VENDOR_CATEGORIES.services,
  services: VENDOR_CATEGORIES.services,
  safety: VENDOR_CATEGORIES.aftercareWellness,
  aftercare: VENDOR_CATEGORIES.aftercareWellness,
  wellness: VENDOR_CATEGORIES.aftercareWellness,
}

/** Map legacy or alias input to a canonical category, or null when unrecognized. */
export function normalizeVendorCategory(raw: string): VendorCategory | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()
  const canonical = CANONICAL_BY_LOWER.get(lower)
  if (canonical) return canonical
  return LEGACY_VENDOR_CATEGORY_ALIASES[lower] ?? null
}

/** Infer primary category from a legacy categories array (first mappable entry). */
export function inferVendorCategoryFromLegacy(categories: readonly string[]): VendorCategory | null {
  for (const c of categories) {
    const normalized = normalizeVendorCategory(c)
    if (normalized) return normalized
  }
  return null
}

export const vendorCategorySchema = z.enum([
  VENDOR_CATEGORIES.ropeRigging,
  VENDOR_CATEGORIES.impactSensation,
  VENDOR_CATEGORIES.leatherWear,
  VENDOR_CATEGORIES.gearAccessories,
  VENDOR_CATEGORIES.artLifestyle,
  VENDOR_CATEGORIES.services,
  VENDOR_CATEGORIES.aftercareWellness,
])

/** Normalize and validate tags: lowercase, trimmed, deduped, max 20. */
export function normalizeVendorTags(raw: readonly string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of raw) {
    const normalized = t.trim().toLowerCase().replace(/\s+/g, '-')
    if (!normalized || normalized.length > 64 || seen.has(normalized)) continue
    seen.add(normalized)
    out.push(normalized)
    if (out.length >= 20) break
  }
  return out
}

/** Build legacy categories[] from category + tags for backward compat. */
export function vendorCategoriesCompat(category: string | null | undefined, tags: readonly string[]): string[] {
  const out: string[] = []
  if (category?.trim()) out.push(category.trim())
  for (const t of tags) {
    const label = t.trim()
    if (!label) continue
    if (!out.some((c) => c.toLowerCase() === label.toLowerCase())) out.push(label)
  }
  return out
}
