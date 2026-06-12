/**
 * Discovery and ranking utilities for mock data.
 * Pure functions - easy to replace with API calls later.
 */

import type { MockGroup, MockEvent, MockPerson, MockVendor } from '@/data/mock-data'

export const MOCK_USER_LOCATION = 'Chambersburg, PA'

/** Max distance (mi) when no filter applied; beyond this we don't filter by location */
export const MAX_DISTANCE_MI = 200

/** Distance per "step" when filtering (mi) */
export const DISTANCE_STEP_MI = 25

/** Group size buckets for diversity ranking */
export const GROUP_SIZE_SMALL = 50
export const GROUP_SIZE_MEDIUM = 120

/** Event RSVP buckets for diversity ranking */
export const EVENT_RSVP_SMALL = 50
export const EVENT_RSVP_MEDIUM = 150

/** Trust score threshold for "event active" filter */
export const EVENT_ACTIVE_TRUST_MIN = 40

/** Vendor rating buckets for diversity ranking */
export const RATING_LOW = 4.2
export const RATING_MID = 4.6

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
}

const LOCATIONS = [
  'Chambersburg, PA', 'Frederick, MD', 'Philadelphia, PA', 'Baltimore, MD', 'Harrisburg, PA',
  'York, PA', 'Pittsburgh, PA', 'Washington, DC', 'New York, NY', 'Boston, MA',
  'Chicago, IL', 'Atlanta, GA', 'Austin, TX', 'Denver, CO', 'Seattle, WA',
  'San Francisco, CA', 'Los Angeles, CA', 'Miami, FL', 'Portland, OR', 'Minneapolis, MN',
]

function getLocationIndex(location: string | undefined): number {
  if (!location) return LOCATIONS.length
  const idx = LOCATIONS.findIndex((loc) => loc.toLowerCase().includes(location.toLowerCase().split(',')[0]))
  return idx >= 0 ? idx : LOCATIONS.length
}

function getDistanceFromUser(location: string | undefined): number {
  const userIdx = getLocationIndex(MOCK_USER_LOCATION)
  const itemIdx = getLocationIndex(location)
  return Math.abs(itemIdx - userIdx)
}

/** Generic text search - filter items where any field contains query (case-insensitive) */
export function applyTextSearch<T>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  const queryLower = query.trim().toLowerCase()
  if (!queryLower) return items
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field]
      if (value == null) return false
      const str = Array.isArray(value) ? value.join(' ') : String(value)
      return str.toLowerCase().includes(queryLower)
    })
  )
}

/**
 * Reorder items so no more than maxConsecutive share the same bucket.
 * Used for "diverse" sort to avoid long runs of similar-sized groups/events.
 */
export function injectDiversity<T>(
  items: T[],
  keyFn: (item: T) => string,
  maxConsecutive = 2
): T[] {
  const buckets = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(item)
  }
  const result: T[] = []
  const keys = Array.from(buckets.keys())
  let round = 0
  while (result.length < items.length) {
    let added = 0
    for (let i = 0; i < maxConsecutive; i++) {
      for (const key of keys) {
        const arr = buckets.get(key)!
        const idx = round * maxConsecutive + i
        if (idx < arr.length) {
          result.push(arr[idx])
          added++
        }
      }
    }
    round++
    if (added === 0) break
  }
  return result
}

export type RankGroupsOptions = {
  searchQuery?: string
  distanceMi?: number
  sortBy?: 'relevance' | 'new' | 'nearby' | 'diverse'
  visibility?: 'public' | 'private' | 'invite-only'
}

export function rankGroups(items: MockGroup[], options: RankGroupsOptions = {}): MockGroup[] {
  let result = [...items]
  const { searchQuery, distanceMi = MAX_DISTANCE_MI, sortBy = 'diverse', visibility } = options

  if (searchQuery) {
    result = applyTextSearch(result, searchQuery, ['name', 'description', 'location'])
  }
  if (visibility) {
    result = result.filter((g) => g.visibility === visibility)
  }
  if (distanceMi < MAX_DISTANCE_MI) {
    const maxDist = Math.ceil(distanceMi / DISTANCE_STEP_MI)
    result = result.filter((g) => getDistanceFromUser(g.location) <= maxDist)
  }

  switch (sortBy) {
    case 'relevance':
      result.sort((a, b) => (b.members ?? 0) - (a.members ?? 0))
      break
    case 'new':
      result.sort((a, b) => {
        const aDate = (a as MockGroup & { createdAt?: string }).createdAt ?? ''
        const bDate = (b as MockGroup & { createdAt?: string }).createdAt ?? ''
        return (bDate || 'zzz').localeCompare(aDate || 'zzz')
      })
      break
    case 'nearby':
      result.sort((a, b) => getDistanceFromUser(a.location) - getDistanceFromUser(b.location))
      break
    case 'diverse':
    default:
      result = injectDiversity(result, (g) => {
        const m = g.members ?? 0
        return m < GROUP_SIZE_SMALL ? 'small' : m < GROUP_SIZE_MEDIUM ? 'medium' : 'large'
      })
  }
  return result
}

/** Parses "Wed, Feb 18 at 6:00 PM" format. Uses 2026 as default year. */
function parseShortDate(dateStr: string): Date | null {
  const match = dateStr.match(/(\w{3}), (\w{3}) (\d{1,2}) at (\d{1,2}):(\d{2}) (AM|PM)/)
  if (!match) return null
  const [, , month, day] = match
  return new Date(2026, MONTH_MAP[month] ?? 0, parseInt(day, 10))
}

/** Parses "Sep 4–7, 2026" range format. Returns start date. */
function parseLongDate(dateStr: string): Date | null {
  const match = dateStr.match(/(\w{3}) (\d{1,2})–(\d{1,2}), (\d{4})/)
  if (!match) return null
  const [, month, startDay, , year] = match
  return new Date(parseInt(year, 10), MONTH_MAP[month] ?? 0, parseInt(startDay, 10))
}

/** Parses mock event date strings. Tries short format first, then range format. */
function parseEventDate(dateStr: string): Date | null {
  return parseShortDate(dateStr) ?? parseLongDate(dateStr)
}

export type RankEventsOptions = {
  searchQuery?: string
  dateRange?: { start: string; end: string }
  category?: string
  verifiedOnly?: boolean
  /** When set, only in-person or only virtual events. */
  eventFormat?: 'in-person' | 'virtual'
  distanceMi?: number
  sortBy?: 'soon' | 'relevance' | 'diverse' | 'new'
}

export function rankEvents(items: MockEvent[], options: RankEventsOptions = {}): MockEvent[] {
  let result = [...items]
  const {
    searchQuery,
    dateRange,
    category,
    verifiedOnly,
    eventFormat,
    distanceMi = MAX_DISTANCE_MI,
    sortBy = 'soon',
  } = options

  if (searchQuery) {
    result = applyTextSearch(result, searchQuery, ['title', 'location', 'description'] as (keyof MockEvent)[])
  }
  if (category) {
    result = result.filter((e) => e.category === category)
  }
  if (verifiedOnly) {
    result = result.filter((e) => e.hostVerified)
  }
  if (eventFormat) {
    result = result.filter((e) => (e.eventFormat ?? 'in-person') === eventFormat)
  }
  if (distanceMi < MAX_DISTANCE_MI) {
    const maxDist = Math.ceil(distanceMi / DISTANCE_STEP_MI)
    result = result.filter((e) => {
      if (e.eventFormat === 'virtual') return true
      return getDistanceFromUser(e.location) <= maxDist
    })
  }
  if (dateRange?.start || dateRange?.end) {
    const startDate = dateRange.start ? new Date(dateRange.start) : null
    const endDate = dateRange.end ? new Date(dateRange.end) : null
    const hasValidRange = (startDate && !isNaN(startDate.getTime())) || (endDate && !isNaN(endDate.getTime()))
    if (hasValidRange) {
      result = result.filter((e) => {
        const d = parseEventDate(e.date)
        if (!d) return true
        if (startDate && !isNaN(startDate.getTime()) && d < startDate) return false
        if (endDate && !isNaN(endDate.getTime()) && d > endDate) return false
        return true
      })
    }
  }

  switch (sortBy) {
    case 'relevance':
      result.sort((a, b) => (b.rsvpCount ?? 0) - (a.rsvpCount ?? 0))
      break
    case 'diverse':
      result = injectDiversity(result, (e) => {
        const r = e.rsvpCount ?? 0
        return r < EVENT_RSVP_SMALL ? 'small' : r < EVENT_RSVP_MEDIUM ? 'medium' : 'large'
      })
      break
    case 'new':
      result.sort((a, b) => a.id - b.id)
      break
    case 'soon':
    default:
      result.sort((a, b) => {
        const da = parseEventDate(a.date)?.getTime() ?? Infinity
        const db = parseEventDate(b.date)?.getTime() ?? Infinity
        return da - db
      })
  }
  return result
}

export type RankPeopleOptions = {
  searchQuery?: string
  roles?: string[]
  verifiedOnly?: boolean
  reputationMin?: number
  eventActiveOnly?: boolean
  distanceMi?: number
  sortBy?: 'relevance' | 'trust' | 'diverse' | 'nearby' | 'new'
}

export function rankPeople(items: MockPerson[], options: RankPeopleOptions = {}): MockPerson[] {
  let result = [...items]
  const { searchQuery, roles, verifiedOnly, reputationMin = 0, eventActiveOnly, distanceMi = MAX_DISTANCE_MI, sortBy = 'diverse' } = options

  if (searchQuery) {
    result = applyTextSearch(result, searchQuery, ['username', 'roles', 'location'] as (keyof MockPerson)[])
  }
  if (roles?.length) {
    result = result.filter((p) => roles.some((r) => p.roles?.includes(r)))
  }
  if (verifiedOnly) {
    result = result.filter((p) => p.verified)
  }
  if (reputationMin > 0) {
    result = result.filter((p) => (p.trustScore ?? 0) >= reputationMin)
  }
  if (eventActiveOnly) {
    result = result.filter((p) => (p.trustScore ?? 0) > EVENT_ACTIVE_TRUST_MIN)
  }
  if (distanceMi < MAX_DISTANCE_MI) {
    const maxDist = Math.ceil(distanceMi / DISTANCE_STEP_MI)
    result = result.filter((p) => getDistanceFromUser(p.location) <= maxDist)
  }

  switch (sortBy) {
    case 'relevance':
      result.sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0))
      break
    case 'trust':
      result.sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0))
      break
    case 'nearby':
      result.sort((a, b) => getDistanceFromUser(a.location) - getDistanceFromUser(b.location))
      break
    case 'new':
      result.sort((a, b) => (a.trustScore ?? 0) - (b.trustScore ?? 0))
      break
    case 'diverse':
    default:
      result = injectDiversity(result, (p) => p.trustTier ?? 'bronze')
  }
  return result
}

export type RankVendorsOptions = {
  searchQuery?: string
  sortBy?: 'relevance' | 'rating' | 'diverse' | 'new' | 'nearby'
}

export function rankVendors(items: MockVendor[], options: RankVendorsOptions = {}): MockVendor[] {
  let result = [...items]
  const { searchQuery, sortBy = 'diverse' } = options

  if (searchQuery) {
    result = applyTextSearch(result, searchQuery, ['name', 'categories', 'description'] as (keyof MockVendor)[])
  }

  switch (sortBy) {
    case 'relevance':
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
    case 'rating':
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      break
    case 'new':
      result.sort((a, b) => a.id - b.id)
      break
    case 'nearby':
      result = injectDiversity(result, (v) => {
        const r = v.rating ?? 0
        return r < RATING_LOW ? 'low' : r < RATING_MID ? 'mid' : 'high'
      })
      break
    case 'diverse':
    default:
      result = injectDiversity(result, (v) => {
        const r = v.rating ?? 0
        return r < RATING_LOW ? 'low' : r < RATING_MID ? 'mid' : 'high'
      })
  }
  return result
}
