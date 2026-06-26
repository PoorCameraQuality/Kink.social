/**
 * kink.social → ECKE public SEO ingest envelope (contract draft, Pass 2).
 * Not wired to API runtime until Pass 3 implementation.
 * @see docs/ECKE_PUBLIC_PUBLISHING_CONTRACT.md
 */

export const KINK_SOCIAL_SOURCE_SYSTEM = 'kink.social' as const

/** Entity types eligible for public SEO ingest. `group` deferred pending privacy ADR. */
export type EckePublicEntityType =
  | 'education_article'
  | 'education_path'
  | 'event'
  | 'convention'
  | 'place'
  | 'organization'
  | 'presenter'
  | 'vendor'
  | 'class_sample'
  | 'media_reference'

export type KinkSocialIngestAction = 'upsert' | 'unpublish'

/** Maps envelope entityType to ECKE c2k_source_type column value. */
export const ECKE_SOURCE_TYPE_BY_ENTITY: Record<EckePublicEntityType, string> = {
  education_article: 'education_article',
  education_path: 'education_path',
  event: 'event',
  convention: 'convention',
  place: 'place',
  organization: 'organization',
  presenter: 'presenter_profile',
  vendor: 'vendor_profile',
  class_sample: 'class_sample',
  media_reference: 'media_reference',
}

export type KinkSocialPublicIngestEnvelope<TPayload = unknown> = {
  sourceSystem: typeof KINK_SOCIAL_SOURCE_SYSTEM
  entityType: EckePublicEntityType
  sourceId: string
  sourceUpdatedAt: string
  action: KinkSocialIngestAction
  /** Required true for upsert; validated by ECKE ingest API. */
  visibility: 'PUBLIC'
  /** Required true for upsert. */
  publishToEcke: true
  /** Sender asserts redaction complete; ECKE re-validates. */
  publicSafe: true
  idempotencyKey: string
  canonicalKinkSocialUrl?: string
  preferredSlug?: string
  allowSlugSuffix?: boolean
  payload: TPayload
}

export type KinkSocialUnpublishEnvelope = {
  sourceSystem: typeof KINK_SOCIAL_SOURCE_SYSTEM
  entityType: EckePublicEntityType
  sourceId: string
  action: 'unpublish'
  reason?: 'archived' | 'deleted' | 'opt_out' | 'ineligible' | 'visibility_change'
}

export type KinkSocialIngestResponse = {
  status: 'published' | 'unpublished' | 'rejected'
  eckeRecordId?: string
  eckeSlug?: string
  eckePublicUrl?: string
  errorCode?: string
  errorMessage?: string
}

/** education_article payload — see contract §4.2 */
export type EckeEducationArticlePayload = {
  title: string
  slug: string
  excerpt: string
  bodyHtml: string
  authorDisplayName: string
  authorUsername?: string | null
  authorProfileUrl?: string | null
  presenterProfileUrl?: string | null
  contentWarnings: string[]
  categories: string[]
  difficulty?: string | null
  readingMinutes?: number | null
  publishedAt: string
  updatedAt: string
  heroImageUrl?: string | null
  seoTitle?: string | null
  metaDescription?: string | null
}

/** event payload — see contract §4.4 */
export type EckeEventPayload = {
  title: string
  slug: string
  shortDescription: string
  longDescription?: string | null
  startDate: string
  endDate: string
  city?: string | null
  state?: string | null
  publicVenueName?: string | null
  publicAddress?: string | null
  organizerDisplayName?: string | null
  publicImageUrl?: string | null
  publicInfoUrl?: string | null
  tags?: string[]
  accessibilityNotes?: string | null
}

export function buildKinkSocialIdempotencyKey(entityType: EckePublicEntityType, sourceId: string): string {
  return `${KINK_SOCIAL_SOURCE_SYSTEM}:${entityType}:${sourceId}`
}
