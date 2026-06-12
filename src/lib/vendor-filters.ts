import type { MockVendor } from '@/data/types'

export const VENDOR_CATEGORY_FILTERS = ['Gear', 'Toys', 'Clothing', 'Art', 'Services'] as const

export type ShipsToFilter = '' | 'US' | 'Canada' | 'International'

/**
 * Filters mock vendors by search text, category chip, ships-to, and minimum rating.
 * Search matches name, description, and category labels (case-insensitive).
 */
export function filterMockVendors(
  vendors: MockVendor[],
  opts: {
    searchQuery: string
    selectedCategory: string | null
    shipsTo: ShipsToFilter
    minRating: number
  }
): MockVendor[] {
  const q = opts.searchQuery.trim().toLowerCase()

  return vendors.filter((v) => {
    if (q) {
      const haystack = [v.name, v.description ?? '', ...(v.categories ?? [])].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }

    if (opts.selectedCategory && !v.categories?.includes(opts.selectedCategory)) {
      return false
    }

    if (opts.shipsTo) {
      const s = v.shipsTo.toLowerCase()
      if (opts.shipsTo === 'US' && !s.includes('us')) return false
      if (opts.shipsTo === 'Canada' && !s.includes('canada')) return false
      if (opts.shipsTo === 'International') {
        const multiRegion = s.includes(',') || s.includes('international')
        if (!multiRegion) return false
      }
    }

    if (opts.minRating > 0 && v.rating < opts.minRating) return false

    return true
  })
}
