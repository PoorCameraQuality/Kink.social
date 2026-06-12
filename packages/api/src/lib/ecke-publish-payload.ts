import { APP_URL } from '@c2k/shared'
import { createHash } from 'node:crypto'
import type { ConventionPublicSettings } from '../db/schema.js'
import { parseVolunteerShiftTitle } from './ecke-dancecard-staff-sync.js'

export type EckeListingPayload = {
  slug: string
  title: string
  description?: string | null
  startsAt?: string | null
  endsAt?: string | null
  location?: string | null
  imageUrl?: string | null
  orgSlug?: string | null
  orgDisplayName?: string | null
  visibility: 'public' | 'hidden'
  /** C2K member action URL (registration, etc.) — surfaced as ECKE event `website` CTA. */
  memberActionUrl?: string | null
}

export type EckeDancecardSlotPayload = {
  externalKey: string
  startsAt: string
  endsAt: string
  title: string
  track?: string | null
  room?: string | null
  locationId?: string | null
  description?: string | null
  sortOrder: number
}

export type EckeDancecardStaffShiftPayload = {
  externalKey: string
  personName: string
  role: string
  startsAt: string
  endsAt: string
  locationId?: string | null
  sortOrder: number
}

export type EckeDancecardLocationPayload = {
  externalKey: string
  name: string
  shortName?: string | null
  capacity?: number | null
  sortOrder: number
  parentId?: string | null
}

export type EckeDancecardEventPayload = {
  slug: string
  productTitle: string
  eventTitle: string
  subtitle?: string | null
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  sharedByLabel: string
  sharedByDetail?: string | null
  logoUrl?: string | null
  status: 'draft' | 'published'
  staffAccessCode?: string | null
  registrationAccessCode?: string | null
  locations: EckeDancecardLocationPayload[]
  slots: EckeDancecardSlotPayload[]
  staffShifts: EckeDancecardStaffShiftPayload[]
}

export type EckePublishTargetPreview = {
  targetKind: 'ecke_listing' | 'dancecard_event' | 'ecke_event'
  externalSlug: string
  payload: EckeListingPayload | EckeDancecardEventPayload
  contentHash: string
  slotCount?: number
  staffShiftCount?: number
}

export function hashEckePayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

export function resolveEckeListingSlug(conventionSlug: string, settings?: ConventionPublicSettings | null): string {
  const custom = settings?.eckeListingSlug?.trim()
  return (custom || conventionSlug).toLowerCase()
}

export function resolveDancecardSlug(conventionSlug: string, settings?: ConventionPublicSettings | null): string {
  const custom = settings?.dancecardSlug?.trim()
  return (custom || conventionSlug).toLowerCase()
}

export function isDancecardPublishEnabled(settings?: ConventionPublicSettings | null): boolean {
  return settings?.dancecardEnabled !== false
}

export function buildOrgListingPayload(input: {
  slug: string
  displayName: string
  bio?: string | null
  logoUrl?: string | null
  visibility: string
}): EckeListingPayload {
  const hidden = input.visibility !== 'PUBLIC'
  return {
    slug: input.slug.toLowerCase(),
    title: input.displayName,
    description: input.bio ?? null,
    imageUrl: input.logoUrl ?? null,
    orgSlug: input.slug,
    orgDisplayName: input.displayName,
    visibility: hidden ? 'hidden' : 'public',
  }
}

export function buildGroupListingPayload(input: {
  slug: string
  name: string
  description?: string | null
  visibility: string
  orgSlug?: string | null
  orgDisplayName?: string | null
}): EckeListingPayload {
  const hidden = input.visibility !== 'public'
  return {
    slug: input.slug.toLowerCase(),
    title: input.name,
    description: input.description ?? null,
    orgSlug: input.orgSlug ?? null,
    orgDisplayName: input.orgDisplayName ?? null,
    visibility: hidden ? 'hidden' : 'public',
  }
}

export function buildConventionListingPayload(input: {
  conventionSlug: string
  conventionName: string
  conventionDescription?: string | null
  startsAt: Date
  endsAt: Date
  settings?: ConventionPublicSettings | null
  orgSlug?: string | null
  orgDisplayName?: string | null
  anchor?: {
    title?: string | null
    description?: string | null
    startsAt?: Date | null
    endsAt?: Date | null
    location?: string | null
    publicLocationSummary?: string | null
    imageUrl?: string | null
    visibility?: string | null
  } | null
}): EckeListingPayload {
  const slug = resolveEckeListingSlug(input.conventionSlug, input.settings)
  const anchorHidden = input.anchor?.visibility != null && input.anchor.visibility !== 'public'
  const title = input.anchor?.title?.trim() || input.conventionName
  const description = input.anchor?.description?.trim() || input.conventionDescription?.trim() || null
  const startsAt = input.anchor?.startsAt ?? input.startsAt
  const endsAt = input.anchor?.endsAt ?? input.endsAt
  const location = input.anchor?.publicLocationSummary?.trim() || input.anchor?.location?.trim() || null

  return {
    slug,
    title,
    description,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    location,
    imageUrl: input.anchor?.imageUrl ?? null,
    orgSlug: input.orgSlug ?? null,
    orgDisplayName: input.orgDisplayName ?? null,
    visibility: anchorHidden ? 'hidden' : 'public',
    memberActionUrl: `${APP_URL}/conventions/${encodeURIComponent(input.conventionSlug)}/register`,
  }
}

export function buildDancecardEventPayload(input: {
  conventionSlug: string
  conventionName: string
  conventionDescription?: string | null
  timezone: string
  startsAt: Date
  endsAt: Date
  settings?: ConventionPublicSettings | null
  orgDisplayName?: string | null
  orgSlug?: string | null
  logoUrl?: string | null
  slots: Array<{
    id: string
    startsAt: Date
    endsAt: Date
    title: string
    description?: string | null
    location?: string | null
    trackLabel?: string | null
    roomLabel?: string | null
    locationId?: string | null
    locationName?: string | null
    sortOrder: number
  }>
  locations?: Array<{
    id: string
    name: string
    shortName?: string | null
    capacity?: number | null
    sortOrder: number
    parentId?: string | null
  }>
  volunteerShifts?: Array<{
    id: string
    title: string
    startsAt: Date
    endsAt: Date
    locationId?: string | null
    sortOrder: number
  }>
  publishStatus?: 'draft' | 'published'
}): EckeDancecardEventPayload {
  const slug = resolveDancecardSlug(input.conventionSlug, input.settings)
  const sharedByDetail =
    input.orgSlug ? `https://www.eastcoastkinkevents.com/orgs/${encodeURIComponent(input.orgSlug)}` : null

  const settingsStatus = input.settings?.dancecardPublishStatus
  const status =
    input.publishStatus ?? (settingsStatus === 'published' || settingsStatus === 'draft' ? settingsStatus : 'draft')

  const payload: EckeDancecardEventPayload = {
    slug,
    productTitle: 'East Coast Kink Events · Dancecard',
    eventTitle: input.conventionName,
    subtitle: input.conventionDescription?.trim() || null,
    timezone: input.timezone,
    windowStartsAt: input.startsAt.toISOString(),
    windowEndsAt: input.endsAt.toISOString(),
    sharedByLabel: input.orgDisplayName?.trim() || 'East Coast Kink Events',
    sharedByDetail,
    logoUrl: input.logoUrl ?? null,
    status,
    staffAccessCode: input.settings?.staffAccessCode?.trim() || null,
    registrationAccessCode: input.settings?.registrationAccessCode?.trim() || null,
    locations: (input.locations ?? []).map((loc) => ({
      externalKey: loc.id,
      name: loc.name,
      shortName: loc.shortName ?? null,
      capacity: loc.capacity ?? null,
      sortOrder: loc.sortOrder,
      parentId: loc.parentId ?? null,
    })),
    slots: input.slots.map((s) => ({
      externalKey: s.id,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      title: s.title,
      track: s.trackLabel ?? null,
      room: s.roomLabel?.trim() || s.locationName?.trim() || s.location?.trim() || null,
      locationId: s.locationId ?? null,
      description: s.description ?? null,
      sortOrder: s.sortOrder,
    })),
    staffShifts: (input.volunteerShifts ?? []).map((row) => {
      const { personName, role } = parseVolunteerShiftTitle(row.title)
      return {
        externalKey: row.id,
        personName,
        role,
        startsAt: row.startsAt.toISOString(),
        endsAt: row.endsAt.toISOString(),
        locationId: row.locationId ?? null,
        sortOrder: row.sortOrder,
      }
    }),
  }

  return payload
}

export function derivePublishStatus(
  contentHash: string,
  publishedContentHash: string | null | undefined,
  lastPublishedAt: Date | null | undefined,
): 'never' | 'draft' | 'published' | 'stale' {
  if (!lastPublishedAt || !publishedContentHash) return 'draft'
  if (contentHash !== publishedContentHash) return 'stale'
  return 'published'
}
