import { APP_NAME, isEckePublishEligible } from '@c2k/shared'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import {
  buildEckeArticleRow,
  buildEckeEventRowFromListing,
  buildEckeVendorRow,
} from './ecke-directory-sync.js'
import {
  loadEckePublishClientConfig,
  publishArticleRowToEcke,
  publishEventRowToEcke,
  publishVendorRowToEcke,
  type EckePublishResult,
} from './ecke-publish-client.js'
import { buildConventionListingPayload, hashEckePayload } from './ecke-publish-payload.js'

export type EckePublishJobName = 'publish-article' | 'publish-vendor' | 'publish-convention-event'

export async function executeEckePublishArticle(articleId: string, userId?: string): Promise<EckePublishResult> {
  const cfg = loadEckePublishClientConfig()
  if (!cfg) {
    return { ok: false, targetKind: 'ecke_article', error: 'Publish bridge not configured' }
  }

  const [article] = await db
    .select({
      id: schema.educationArticles.id,
      slug: schema.educationArticles.slug,
      title: schema.educationArticles.title,
      excerpt: schema.educationArticles.excerpt,
      bodyHtml: schema.educationArticles.bodyHtml,
      categories: schema.educationArticles.categories,
      heroImageUrl: schema.educationArticles.heroImageUrl,
      readingMinutes: schema.educationArticles.readingMinutes,
      publishedAt: schema.educationArticles.publishedAt,
      publicationStatus: schema.educationArticles.publicationStatus,
      eckePublish: schema.educationArticles.eckePublish,
      authorUserId: schema.educationArticles.authorUserId,
    })
    .from(schema.educationArticles)
    .where(eq(schema.educationArticles.id, articleId))
    .limit(1)

  if (!article) {
    return { ok: false, targetKind: 'ecke_article', error: 'Article not found' }
  }
  if (
    !isEckePublishEligible({
      publishToEcke: article.eckePublish,
      visibility: 'PUBLIC',
      publicationStatus: article.publicationStatus,
    })
  ) {
    return { ok: false, targetKind: 'ecke_article', error: 'Article not eligible for ECKE publish' }
  }

  const [author] = await db
    .select({ displayName: schema.profiles.displayName, username: schema.users.username })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .where(eq(schema.users.id, article.authorUserId))
    .limit(1)

  const row = buildEckeArticleRow({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    bodyHtml: article.bodyHtml,
    authorDisplayName: author?.displayName || author?.username || `${APP_NAME} Educator`,
    categories: article.categories,
    heroImageUrl: article.heroImageUrl,
    readingMinutes: article.readingMinutes,
    publishedAt: article.publishedAt,
    publicationStatus: article.publicationStatus,
  })

  const contentHash = hashEckePayload(row)
  await upsertEntityTarget({
    scopeType: 'education_article',
    educationArticleId: article.id,
    targetKind: 'ecke_article',
    externalSlug: row.slug,
    contentHash,
    userId,
  })

  const result = await publishArticleRowToEcke(cfg, row)
  await markEntityOutcome({
    educationArticleId: article.id,
    targetKind: 'ecke_article',
    contentHash,
    userId,
    result,
  })
  return result
}

export async function executeEckePublishVendor(vendorProfileId: string, userId?: string): Promise<EckePublishResult> {
  const cfg = loadEckePublishClientConfig()
  if (!cfg) {
    return { ok: false, targetKind: 'ecke_vendor', error: 'Publish bridge not configured' }
  }

  const [vendor] = await db
    .select()
    .from(schema.vendorProfiles)
    .where(eq(schema.vendorProfiles.id, vendorProfileId))
    .limit(1)

  if (!vendor) {
    return { ok: false, targetKind: 'ecke_vendor', error: 'Vendor profile not found' }
  }
  if (
    !isEckePublishEligible({
      publishToEcke: vendor.eckePublish,
      visibility: vendor.visibility,
    })
  ) {
    return { ok: false, targetKind: 'ecke_vendor', error: 'Vendor not eligible for ECKE publish' }
  }

  const row = buildEckeVendorRow(vendor)
  const contentHash = hashEckePayload(row)
  await upsertEntityTarget({
    scopeType: 'vendor_profile',
    vendorProfileId: vendor.id,
    targetKind: 'ecke_vendor',
    externalSlug: row.slug,
    contentHash,
    userId,
  })

  const result = await publishVendorRowToEcke(cfg, row)
  await markEntityOutcome({
    vendorProfileId: vendor.id,
    targetKind: 'ecke_vendor',
    contentHash,
    userId,
    result,
  })
  return result
}

export async function executeEckePublishConventionEvent(
  conventionId: string,
  userId?: string,
): Promise<EckePublishResult> {
  const cfg = loadEckePublishClientConfig()
  if (!cfg) {
    return { ok: false, targetKind: 'ecke_event', error: 'Publish bridge not configured' }
  }

  const [conv] = await db
    .select({
      id: schema.conventions.id,
      slug: schema.conventions.slug,
      name: schema.conventions.name,
      description: schema.conventions.description,
      startsAt: schema.conventions.startsAt,
      endsAt: schema.conventions.endsAt,
      settings: schema.conventions.settings,
      organizationId: schema.conventions.organizationId,
      anchorEventId: schema.conventions.anchorEventId,
    })
    .from(schema.conventions)
    .where(eq(schema.conventions.id, conventionId))
    .limit(1)

  if (!conv) {
    return { ok: false, targetKind: 'ecke_event', error: 'Convention not found' }
  }

  let org: { slug: string; displayName: string } | null = null
  if (conv.organizationId) {
    const [o] = await db
      .select({ slug: schema.organizations.slug, displayName: schema.organizations.displayName })
      .from(schema.organizations)
      .where(eq(schema.organizations.id, conv.organizationId))
      .limit(1)
    org = o ?? null
  }

  let anchor: Parameters<typeof buildConventionListingPayload>[0]['anchor'] = null
  if (conv.anchorEventId) {
    const [ev] = await db
      .select({
        title: schema.events.title,
        description: schema.events.description,
        startsAt: schema.events.startsAt,
        endsAt: schema.events.endsAt,
        location: schema.events.location,
        publicLocationSummary: schema.events.publicLocationSummary,
        imageUrl: schema.events.imageUrl,
        visibility: schema.events.visibility,
      })
      .from(schema.events)
      .where(eq(schema.events.id, conv.anchorEventId))
      .limit(1)
    if (ev) {
      anchor = {
        title: ev.title,
        description: ev.description,
        startsAt: ev.startsAt,
        endsAt: ev.endsAt,
        location: ev.location,
        publicLocationSummary: ev.publicLocationSummary,
        imageUrl: ev.imageUrl,
        visibility: ev.visibility,
      }
    }
  }

  const listing = buildConventionListingPayload({
    conventionSlug: conv.slug,
    conventionName: conv.name,
    conventionDescription: conv.description,
    startsAt: conv.startsAt,
    endsAt: conv.endsAt,
    settings: conv.settings,
    orgSlug: org?.slug ?? null,
    orgDisplayName: org?.displayName ?? null,
    anchor,
  })

  if (listing.visibility === 'hidden') {
    return { ok: false, targetKind: 'ecke_event', error: 'Convention listing is not public' }
  }

  const row = buildEckeEventRowFromListing(listing, conv.id, 'convention')
  const contentHash = hashEckePayload(row)
  await upsertEntityTarget({
    scopeType: 'convention',
    conventionId: conv.id,
    targetKind: 'ecke_event',
    externalSlug: row.slug,
    contentHash,
    userId,
  })

  const result = await publishEventRowToEcke(cfg, row)
  await markEntityOutcome({
    conventionId: conv.id,
    targetKind: 'ecke_event',
    contentHash,
    userId,
    result,
  })
  return result
}

async function upsertEntityTarget(input: {
  scopeType: 'education_article' | 'vendor_profile' | 'convention'
  educationArticleId?: string
  vendorProfileId?: string
  conventionId?: string
  targetKind: 'ecke_article' | 'ecke_vendor' | 'ecke_event'
  externalSlug: string
  contentHash: string
  userId?: string
}) {
  const now = new Date()
  const where =
    input.scopeType === 'education_article' ?
      and(
        eq(schema.eckePublishTargets.educationArticleId, input.educationArticleId!),
        eq(schema.eckePublishTargets.targetKind, input.targetKind),
      )
    : input.scopeType === 'vendor_profile' ?
      and(
        eq(schema.eckePublishTargets.vendorProfileId, input.vendorProfileId!),
        eq(schema.eckePublishTargets.targetKind, input.targetKind),
      )
    : and(
        eq(schema.eckePublishTargets.conventionId, input.conventionId!),
        eq(schema.eckePublishTargets.targetKind, input.targetKind),
      )

  const [prev] = await db
    .select({ id: schema.eckePublishTargets.id, publishedContentHash: schema.eckePublishTargets.publishedContentHash, lastPublishedAt: schema.eckePublishTargets.lastPublishedAt })
    .from(schema.eckePublishTargets)
    .where(where)
    .limit(1)

  const status =
    prev?.publishedContentHash === input.contentHash && prev.lastPublishedAt ?
      ('published' as const)
    : prev?.lastPublishedAt ?
      ('stale' as const)
    : ('draft' as const)

  if (prev) {
    await db
      .update(schema.eckePublishTargets)
      .set({
        externalSlug: input.externalSlug,
        contentHash: input.contentHash,
        status,
        lastPreviewAt: now,
        updatedAt: now,
      })
      .where(eq(schema.eckePublishTargets.id, prev.id))
    return
  }

  await db.insert(schema.eckePublishTargets).values({
    scopeType: input.scopeType,
    educationArticleId: input.educationArticleId ?? null,
    vendorProfileId: input.vendorProfileId ?? null,
    conventionId: input.conventionId ?? null,
    targetKind: input.targetKind,
    externalSlug: input.externalSlug,
    contentHash: input.contentHash,
    status,
    lastPreviewAt: now,
  })
}

async function markEntityOutcome(input: {
  educationArticleId?: string
  vendorProfileId?: string
  conventionId?: string
  targetKind: 'ecke_article' | 'ecke_vendor' | 'ecke_event'
  contentHash: string
  userId?: string
  result: EckePublishResult
}) {
  const now = new Date()
  const where =
    input.educationArticleId ?
      and(
        eq(schema.eckePublishTargets.educationArticleId, input.educationArticleId),
        eq(schema.eckePublishTargets.targetKind, input.targetKind),
      )
    : input.vendorProfileId ?
      and(
        eq(schema.eckePublishTargets.vendorProfileId, input.vendorProfileId),
        eq(schema.eckePublishTargets.targetKind, input.targetKind),
      )
    : and(
        eq(schema.eckePublishTargets.conventionId, input.conventionId!),
        eq(schema.eckePublishTargets.targetKind, input.targetKind),
      )

  if (input.result.ok) {
    await db
      .update(schema.eckePublishTargets)
      .set({
        status: 'published',
        contentHash: input.contentHash,
        publishedContentHash: input.contentHash,
        lastPublishedAt: now,
        lastAttemptAt: now,
        lastError: null,
        publishedByUserId: input.userId ?? null,
        updatedAt: now,
      })
      .where(where)
    return
  }

  await db
    .update(schema.eckePublishTargets)
    .set({
      status: 'error',
      lastAttemptAt: now,
      lastError: input.result.error,
      updatedAt: now,
    })
    .where(where)
}
