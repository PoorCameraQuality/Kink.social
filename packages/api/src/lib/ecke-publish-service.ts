import { APP_URL } from '@c2k/shared'
import { and, asc, eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import {
  loadEckeIngestApiConfig,
  loadEckePublishClientConfig,
  publishListingToEcke,
  resolveEckePublicEducationUrl,
  resolveEckePublicEventUrl,
  unpublishEventRowToEcke,
  unpublishListingToEcke,
} from './ecke-publish-client.js'
import {
  executeEckePublishArticle,
  executeEckePublishStandaloneEvent,
  executeEckeUnpublishEducationArticleWithTargetUpdate,
} from './ecke-publish-executor.js'
import {
  buildGroupListingPayload,
  buildStandaloneEventListingPayload,
  hashEckePayload,
  isStandaloneEventEckeEligible,
  type EckeListingPayload,
} from './ecke-publish-payload.js'
import {
  getEducationDeferredFields,
  getEventDeferredFields,
  getEventOmittedFields,
  getEducationOmittedFields,
  getGroupOmittedFields,
  isGroupListingEntityEligible,
  resolvePublicLocationForEcke,
  type EckeOmittedField,
} from './ecke-redaction.js'
import {
  buildEckePublicEnvelope,
  buildEducationArticleCanonicalUrl,
  getEducationArticleIneligibilityReason,
  type EducationArticleAuthorContext,
  type EducationArticlePublishRow,
} from './ecke-public-publish.js'
import {
  loadEducationArticleAuthorContextForPublish,
  loadEducationArticleForPublish,
} from './ecke-public-publish-executor.js'
import {
  deriveTargetDisplayStatus,
  ensureEckePublishTargetRow,
  loadEckePublishTarget,
  markEckePublishSuccess,
  markEckeUnpublishSuccess,
  touchEckePublishPreview,
  type EckeTargetStatus,
} from './ecke-publish-target-store.js'
import {
  getRegistryEntry,
  isValidEckeSourceKind,
  listAllRegistryEntries,
  listRegistryForGroupDashboard,
  PASS2_DISABLED_ACTIONS,
  type EckeRegistryEntry,
  type EckeSourceKind,
} from './ecke-publish-registry.js'

export const PASS3_UNSUPPORTED_ERROR = {
  errorCode: 'unsupported_in_pass_3',
  message: 'Only group listings can be published from the unified ECKE control plane in this pass.',
} as const

export const PASS4_UNSUPPORTED_ERROR = {
  errorCode: 'unsupported_in_pass_4',
  message:
    'Only group listings and public event listings can be published from the unified ECKE control plane in this pass.',
} as const

export const PASS5_UNSUPPORTED_ERROR = {
  errorCode: 'unsupported_in_pass_5',
  message:
    'Only group listings, public event listings, and education articles can be published from the unified ECKE control plane in this pass.',
} as const

const PASS5_SUPPORTED_WRITE_KINDS = new Set<EckeSourceKind>([
  'group_listing',
  'event_listing',
  'education_article',
])

export type EckePublishViewer = {
  userId: string
}

export type EckePublishActions = {
  preview: boolean
  publish: boolean
  sync: boolean
  unpublish: boolean
}

export type EckePublishPlainField = {
  label: string
  value: string | null
}

export type EckePublishStatusResult = {
  sourceKind: EckeSourceKind
  sourceId: string
  supportState: EckeRegistryEntry['supportState']
  eligible: boolean
  reason?: string
  status: EckeTargetStatus
  contentHash: string | null
  publishedContentHash: string | null
  lastPublishedAt: string | null
  lastPreviewAt: string | null
  lastError: string | null
  externalSlug: string | null
  eckePublicUrl?: string | null
  eckePublicUrlKnown?: boolean
  currentTransport: EckeRegistryEntry['currentTransport']
  eckeSurfacesAffected: readonly string[]
  actions: EckePublishActions
  readOnlyPass?: boolean
  staleNotice?: string | null
}

export type EckePublishPreviewResult = EckePublishStatusResult & {
  wouldPublish: EckePublishPlainField[]
  wouldPublishDeferred?: EckeOmittedField[]
  wouldNotPublish: EckeOmittedField[]
  payload: unknown
  canonicalKinkSocialUrl: string | null
  locationVisibility?: string
  locationHiddenWarning?: string | null
}

export type EckeGroupOverviewCard = {
  section: 'overview' | 'group_listing' | 'events' | 'education' | 'venues' | 'vendors' | 'dancecard' | 'history'
  sourceKind?: EckeSourceKind
  sourceId?: string
  title: string
  supportState: EckeRegistryEntry['supportState'] | 'info'
  eligible?: boolean
  reason?: string
  status?: EckePublishStatusResult['status']
  summary?: string
  preview?: EckePublishPreviewResult
  plannedMessage?: string
}

export type EckeGroupOverviewResult = {
  groupId: string
  groupSlug: string
  groupName: string
  bridgeConnected: boolean
  readOnlyPass?: boolean
  passNotice: string
  cards: EckeGroupOverviewCard[]
  history: Array<{
    targetKind: string
    externalSlug: string
    status: string
    lastPublishedAt: string | null
    lastError: string | null
    lastPreviewAt: string | null
  }>
}

const ORG_ROLE_RANK: Record<string, number> = {
  MEMBER: 1,
  STAFF: 2,
  MODERATOR: 3,
  ADMIN: 4,
  OWNER: 5,
}

export function isEckeBridgeConfigured(): boolean {
  return loadEckePublishClientConfig() !== null || loadEckeIngestApiConfig() !== null
}

function pass2Actions(): EckePublishActions {
  return { ...PASS2_DISABLED_ACTIONS }
}

export function computeGroupListingActions(input: {
  eligible: boolean
  status: EckeTargetStatus
  bridgeConfigured: boolean
}): EckePublishActions {
  if (!input.eligible || !input.bridgeConfigured) {
    return { preview: true, publish: false, sync: false, unpublish: false }
  }
  const { status } = input
  return {
    preview: true,
    publish: status === 'never' || status === 'draft' || status === 'unpublished',
    sync: status === 'stale' || status === 'error' || status === 'published',
    unpublish: status === 'published' || status === 'stale' || status === 'error',
  }
}

export const computeEventListingActions = computeGroupListingActions

export const computeEducationArticleActions = computeGroupListingActions

export type ArticlePublishAccess = {
  article: EducationArticlePublishRow
  author: EducationArticleAuthorContext
  canManage: boolean
}

export type EducationArticlePublishContext = {
  access: ArticlePublishAccess
  payload: ReturnType<typeof buildEckePublicEnvelope>['payload']
  contentHash: string
  eligibility: { eligible: boolean; reason?: string }
  canonicalKinkSocialUrl: string
  externalSlug: string
}

/** Pure permission check — author-only per existing education ECKE routes. */
export function canViewerManageEducationArticleEckePublish(
  article: EducationArticlePublishRow,
  userId: string,
): boolean {
  return article.authorUserId === userId
}

export async function resolveArticlePublishAccess(
  articleId: string,
  userId: string,
): Promise<ArticlePublishAccess | null> {
  const article = await loadEducationArticleForPublish(articleId)
  if (!article) return null

  const author = await loadEducationArticleAuthorContextForPublish(article)
  return {
    article,
    author,
    canManage: canViewerManageEducationArticleEckePublish(article, userId),
  }
}

/** Server-side education article payload — never trusts client input. */
export function buildEducationArticlePublishContext(access: ArticlePublishAccess): EducationArticlePublishContext {
  const ineligibility = getEducationArticleIneligibilityReason(access.article)
  const envelope = buildEckePublicEnvelope('education_article', access.article, access.author)
  const contentHash = hashEckePayload(envelope.payload)
  return {
    access,
    payload: envelope.payload,
    contentHash,
    eligibility:
      ineligibility ?
        { eligible: false, reason: ineligibility }
      : { eligible: true },
    canonicalKinkSocialUrl: buildEducationArticleCanonicalUrl(access.article.slug),
    externalSlug: envelope.preferredSlug || access.article.slug,
  }
}

export function buildEducationArticlePlainFields(
  ctx: EducationArticlePublishContext,
  entry: EckeRegistryEntry,
): EckePublishPlainField[] {
  const { payload, canonicalKinkSocialUrl } = ctx
  const bodyPreview =
    payload.bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240) ||
    payload.excerpt?.slice(0, 240) ||
    null

  return [
    { label: 'Title', value: payload.title },
    { label: 'Slug', value: payload.slug },
    { label: 'Excerpt', value: payload.excerpt ?? null },
    { label: 'Public body (sanitized preview)', value: bodyPreview },
    { label: 'Author display name', value: payload.authorDisplayName ?? null },
    { label: 'Author profile URL', value: payload.authorProfileUrl ?? null },
    { label: 'Presenter profile URL', value: payload.presenterProfileUrl ?? null },
    { label: 'Categories', value: payload.categories?.join(', ') ?? null },
    { label: 'Content warnings', value: payload.contentWarnings?.join(', ') ?? null },
    { label: 'Difficulty', value: payload.difficulty ?? null },
    { label: 'Hero image', value: payload.heroImageUrl ?? null },
    { label: 'Updated', value: payload.updatedAt ?? null },
    { label: 'Source attribution', value: `${entry.label} via kink.social` },
    { label: 'Canonical kink.social URL', value: canonicalKinkSocialUrl },
  ]
}

export function payloadExcludesPrivateEducationFields(payload: Record<string, unknown>): boolean {
  if ('email' in payload || 'privateEmail' in payload || 'internalNotes' in payload) {
    return false
  }
  const serialized = JSON.stringify(payload).toLowerCase()
  const forbidden = ['moderationnotes', 'internalnotes', 'privatecontact', 'memberonlybody', 'draftbody']
  return !forbidden.some((token) => serialized.includes(token))
}

async function loadEducationArticleTarget(articleId: string) {
  const [row] = await db
    .select()
    .from(schema.eckePublishTargets)
    .where(
      and(
        eq(schema.eckePublishTargets.educationArticleId, articleId),
        eq(schema.eckePublishTargets.targetKind, 'ecke_article'),
      ),
    )
    .limit(1)
  return row
}

export type GroupListingPublishContext = {
  access: GroupPublishAccess
  listingPayload: EckeListingPayload
  contentHash: string
  eligibility: { eligible: boolean; reason?: string }
  canonicalKinkSocialUrl: string
}

export type GroupPublishAccess = {
  group: {
    id: string
    slug: string
    name: string
    description: string | null
    visibility: string
    organizationId: string | null
    disbandedAt: Date | null
  }
  org: { slug: string; displayName: string } | null
  canManage: boolean
  groupRole: string | null
}

/** Server-side group listing payload — never trusts client input. */
export function buildGroupListingPublishContext(access: GroupPublishAccess): GroupListingPublishContext {
  const listingPayload = buildGroupListingPayload({
    slug: access.group.slug,
    name: access.group.name,
    description: access.group.description,
    visibility: access.group.visibility,
    orgSlug: access.org?.slug ?? null,
    orgDisplayName: access.org?.displayName ?? null,
  })
  const eligibility = isGroupListingEntityEligible({
    visibility: access.group.visibility,
    disbandedAt: access.group.disbandedAt,
  })
  return {
    access,
    listingPayload,
    contentHash: hashEckePayload(listingPayload),
    eligibility,
    canonicalKinkSocialUrl: `${APP_URL}/groups/${encodeURIComponent(access.group.id)}`,
  }
}

export function payloadExcludesPrivateGroupFields(payload: EckeListingPayload): boolean {
  const serialized = JSON.stringify(payload).toLowerCase()
  const forbidden = ['memberlist', 'rsvplist', 'privateaddress', 'moderationnotes', 'staffnotes']
  return !forbidden.some((token) => serialized.includes(token))
}

async function loadTargetRowForEvent(eventId: string) {
  return loadEckePublishTarget({ scopeType: 'event', eventId }, 'ecke_event')
}

const GROUP_ECKE_PUBLISH_ROLES = new Set(['owner', 'admin', 'moderator', 'event_host'])

/** Pure permission check for tests and UI hints. */
export function canViewerManageGroupEckePublish(groupRole: string | null, orgMod: boolean): boolean {
  if (orgMod) return true
  const normalized = groupRole?.toLowerCase() ?? ''
  return GROUP_ECKE_PUBLISH_ROLES.has(normalized)
}

export async function resolveGroupPublishAccess(
  groupId: string,
  userId: string,
): Promise<GroupPublishAccess | null> {
  const [g] = await db
    .select({
      id: schema.groups.id,
      slug: schema.groups.slug,
      name: schema.groups.name,
      description: schema.groups.description,
      visibility: schema.groups.visibility,
      organizationId: schema.groups.organizationId,
      disbandedAt: schema.groups.disbandedAt,
    })
    .from(schema.groups)
    .where(eq(schema.groups.id, groupId))
    .limit(1)

  if (!g || g.visibility === 'owner_absent') return null

  const [membership] = await db
    .select({ role: schema.groupMembers.role })
    .from(schema.groupMembers)
    .where(and(eq(schema.groupMembers.groupId, groupId), eq(schema.groupMembers.userId, userId)))
    .limit(1)

  const groupRole = membership?.role?.toLowerCase() ?? null
  const groupMod = groupRole !== null && ['owner', 'admin', 'moderator', 'event_host'].includes(groupRole)

  let orgMod = false
  let org: { slug: string; displayName: string } | null = null
  if (g.organizationId) {
    const [orgRow] = await db
      .select({
        slug: schema.organizations.slug,
        displayName: schema.organizations.displayName,
        role: schema.organizationMembers.role,
      })
      .from(schema.organizations)
      .innerJoin(
        schema.organizationMembers,
        eq(schema.organizationMembers.organizationId, schema.organizations.id),
      )
      .where(and(eq(schema.organizations.id, g.organizationId), eq(schema.organizationMembers.userId, userId)))
      .limit(1)
    if (orgRow && (ORG_ROLE_RANK[orgRow.role] ?? 0) >= ORG_ROLE_RANK.MODERATOR) {
      orgMod = true
      org = { slug: orgRow.slug, displayName: orgRow.displayName }
    } else {
      const [po] = await db
        .select({ slug: schema.organizations.slug, displayName: schema.organizations.displayName })
        .from(schema.organizations)
        .where(eq(schema.organizations.id, g.organizationId))
        .limit(1)
      org = po ?? null
    }
  }

  return {
    group: g,
    org,
    canManage: groupMod || orgMod,
    groupRole,
  }
}

export function buildGroupListingPlainFields(
  payload: EckeListingPayload,
  groupId: string,
  registry: EckeRegistryEntry,
): EckePublishPlainField[] {
  return [
    { label: 'Title', value: payload.title },
    { label: 'Slug', value: payload.slug },
    { label: 'Description', value: payload.description ?? null },
    { label: 'Public location', value: payload.location ?? null },
    {
      label: 'Organizer/group attribution',
      value: payload.orgDisplayName ?? payload.title,
    },
    { label: 'CTA back to kink.social', value: `${APP_URL}/groups/${encodeURIComponent(groupId)}` },
    { label: 'Affected ECKE surfaces', value: registry.eckeSurfacesAffected.join('; ') },
    { label: 'Visibility', value: payload.visibility },
  ]
}

export function buildEventListingPlainFields(
  payload: EckeListingPayload,
  eventId: string,
  registry: EckeRegistryEntry,
): EckePublishPlainField[] {
  return [
    { label: 'Title', value: payload.title },
    { label: 'Slug', value: payload.slug },
    { label: 'Description', value: payload.description ?? null },
    { label: 'Date/time', value: payload.startsAt ? `${payload.startsAt}${payload.endsAt ? ` – ${payload.endsAt}` : ''}` : null },
    { label: 'Public location', value: payload.location ?? null },
    {
      label: 'Organizer/group attribution',
      value: payload.orgDisplayName ?? null,
    },
    { label: 'CTA back to kink.social', value: `${APP_URL}/events/${encodeURIComponent(eventId)}` },
    { label: 'Affected ECKE surfaces', value: registry.eckeSurfacesAffected.join('; ') },
  ]
}

export function getEckePublishRegistryForViewer(
  _viewer: EckePublishViewer,
  scope?: { kind: 'group'; groupId: string },
): EckeRegistryEntry[] {
  if (scope?.kind === 'group') return listRegistryForGroupDashboard()
  return listAllRegistryEntries()
}

export async function getEckePublishStatus(
  viewer: EckePublishViewer,
  sourceKind: EckeSourceKind,
  sourceId: string,
): Promise<{ ok: true; result: EckePublishStatusResult } | { ok: false; status: number; error: string }> {
  const preview = await getEckePublishPreview(viewer, sourceKind, sourceId)
  if (!preview.ok) return preview
  const { wouldPublish: _wp, wouldNotPublish: _wn, payload: _p, canonicalKinkSocialUrl: _u, ...status } = preview.result
  return { ok: true, result: status }
}

export async function getEckePublishPreview(
  viewer: EckePublishViewer,
  sourceKind: EckeSourceKind,
  sourceId: string,
): Promise<{ ok: true; result: EckePublishPreviewResult } | { ok: false; status: number; error: string }> {
  const entry = getRegistryEntry(sourceKind)
  if (!entry) {
    return { ok: false, status: 400, error: 'Unknown source kind' }
  }

  if (sourceKind === 'group_listing') {
    return buildGroupListingPreview(viewer, sourceId, entry)
  }
  if (sourceKind === 'event_listing') {
    return buildEventListingPreview(viewer, sourceId, entry)
  }
  if (sourceKind === 'education_article') {
    return buildEducationArticlePreview(viewer, sourceId, entry)
  }

  return {
    ok: false,
    status: 501,
    error: `${sourceKind} preview is not available in Pass 2 read-only mode`,
  }
}

async function buildGroupListingPreview(
  viewer: EckePublishViewer,
  groupId: string,
  entry: EckeRegistryEntry,
): Promise<{ ok: true; result: EckePublishPreviewResult } | { ok: false; status: number; error: string }> {
  const access = await resolveGroupPublishAccess(groupId, viewer.userId)
  if (!access) {
    return { ok: false, status: 404, error: 'Group not found' }
  }
  if (!access.canManage) {
    return { ok: false, status: 403, error: 'Group moderator access required to preview ECKE publish' }
  }

  const ctx = buildGroupListingPublishContext(access)
  const row = await loadEckePublishTarget({ scopeType: 'group', groupId }, 'ecke_listing')
  const status = deriveTargetDisplayStatus(ctx.contentHash, row)
  const bridgeConfigured = loadEckePublishClientConfig() !== null

  return {
    ok: true,
    result: {
      sourceKind: 'group_listing',
      sourceId: groupId,
      supportState: entry.supportState,
      eligible: ctx.eligibility.eligible,
      reason: ctx.eligibility.reason,
      status,
      contentHash: ctx.contentHash,
      publishedContentHash: row?.publishedContentHash ?? null,
      lastPublishedAt: row?.lastPublishedAt?.toISOString() ?? null,
      lastPreviewAt: row?.lastPreviewAt?.toISOString() ?? null,
      lastError: row?.lastError ?? null,
      externalSlug: ctx.listingPayload.slug,
      eckePublicUrl: row?.eckePublicUrl ?? null,
      eckePublicUrlKnown: Boolean(row?.eckePublicUrl),
      currentTransport: entry.currentTransport,
      eckeSurfacesAffected: entry.eckeSurfacesAffected,
      actions: computeGroupListingActions({ eligible: ctx.eligibility.eligible, status, bridgeConfigured }),
      staleNotice:
        status === 'stale' ?
          'This group has changed since it was last published to ECKE. Sync to update the public listing.'
        : null,
      wouldPublish: buildGroupListingPlainFields(ctx.listingPayload, groupId, entry),
      wouldNotPublish: getGroupOmittedFields(),
      payload: ctx.listingPayload,
      canonicalKinkSocialUrl: ctx.canonicalKinkSocialUrl,
    },
  }
}

async function buildEventListingPreview(
  viewer: EckePublishViewer,
  eventId: string,
  entry: EckeRegistryEntry,
): Promise<{ ok: true; result: EckePublishPreviewResult } | { ok: false; status: number; error: string }> {
  const [ev] = await db
    .select({
      id: schema.events.id,
      groupId: schema.events.groupId,
      hostId: schema.events.hostId,
      title: schema.events.title,
      description: schema.events.description,
      startsAt: schema.events.startsAt,
      endsAt: schema.events.endsAt,
      location: schema.events.location,
      publicLocationSummary: schema.events.publicLocationSummary,
      locationVisibility: schema.events.locationVisibility,
      imageUrl: schema.events.imageUrl,
      visibility: schema.events.visibility,
      organizationId: schema.events.organizationId,
    })
    .from(schema.events)
    .where(eq(schema.events.id, eventId))
    .limit(1)

  if (!ev) return { ok: false, status: 404, error: 'Event not found' }

  if (!ev.groupId) {
    return { ok: false, status: 403, error: 'Event is not group-owned' }
  }

  const access = await resolveGroupPublishAccess(ev.groupId, viewer.userId)
  if (!access?.canManage) {
    return { ok: false, status: 403, error: 'Group moderator access required to preview ECKE publish' }
  }

  const [anchorConv] = await db
    .select({ id: schema.conventions.id })
    .from(schema.conventions)
    .where(eq(schema.conventions.anchorEventId, ev.id))
    .limit(1)

  let org: { slug: string; displayName: string } | null = access.org
  if (ev.organizationId && !org) {
    const [o] = await db
      .select({ slug: schema.organizations.slug, displayName: schema.organizations.displayName })
      .from(schema.organizations)
      .where(eq(schema.organizations.id, ev.organizationId))
      .limit(1)
    org = o ?? null
  }

  const [hostProfile] = await db
    .select({ displayName: schema.profiles.displayName })
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, ev.hostId))
    .limit(1)

  const priorTarget = await loadTargetRowForEvent(ev.id)

  const listingPayload = buildStandaloneEventListingPayload({
    eventId: ev.id,
    title: ev.title,
    description: ev.description,
    startsAt: ev.startsAt,
    endsAt: ev.endsAt,
    location: ev.location,
    publicLocationSummary: ev.publicLocationSummary,
    locationVisibility: ev.locationVisibility,
    imageUrl: ev.imageUrl,
    orgSlug: org?.slug ?? null,
    orgDisplayName: org?.displayName ?? null,
    hostDisplayName: hostProfile?.displayName ?? null,
    visibility: ev.visibility,
    eckeSlug: priorTarget?.externalSlug ?? null,
  })

  const eventEligibility = isStandaloneEventEckeEligible({
    visibility: ev.visibility,
    isConventionAnchor: Boolean(anchorConv),
  })

  const locationInfo = resolvePublicLocationForEcke({
    location: ev.location,
    publicLocationSummary: ev.publicLocationSummary,
    locationVisibility: ev.locationVisibility,
  })

  const contentHash = hashEckePayload(listingPayload)
  const row = priorTarget
  const status = deriveTargetDisplayStatus(contentHash, row)
  const bridgeConfigured = isEckeBridgeConfigured()

  const omitted = getEventOmittedFields(ev.locationVisibility)
  if (locationInfo.omittedExactLocation && ev.location?.trim()) {
    omitted.unshift({
      label: 'Exact private location',
      reason: `Full address "${ev.location.trim()}" is omitted because location visibility is ${ev.locationVisibility}.`,
    })
  }

  const locationHiddenWarning =
    ev.locationVisibility !== 'public' ?
      'Exact address is hidden from ECKE. Only the public location summary (or region) will appear.'
    : null

  const eckePublicUrl = row?.eckePublicUrl ?? resolveEckePublicEventUrl(listingPayload.slug)

  return {
    ok: true,
    result: {
      sourceKind: 'event_listing',
      sourceId: eventId,
      supportState: entry.supportState,
      eligible: eventEligibility.eligible,
      reason: eventEligibility.reason,
      status,
      contentHash,
      publishedContentHash: row?.publishedContentHash ?? null,
      lastPublishedAt: row?.lastPublishedAt?.toISOString() ?? null,
      lastPreviewAt: row?.lastPreviewAt?.toISOString() ?? null,
      lastError: row?.lastError ?? null,
      externalSlug: listingPayload.slug,
      eckePublicUrl,
      eckePublicUrlKnown: Boolean(row?.eckePublicUrl),
      currentTransport: entry.currentTransport,
      eckeSurfacesAffected: entry.eckeSurfacesAffected,
      actions: computeEventListingActions({ eligible: eventEligibility.eligible, status, bridgeConfigured }),
      staleNotice:
        status === 'stale' ?
          'This event has changed since it was last published to ECKE. Sync to update the public listing.'
        : null,
      wouldPublish: buildEventListingPlainFields(listingPayload, ev.id, entry),
      wouldPublishDeferred: getEventDeferredFields(),
      wouldNotPublish: omitted,
      payload: listingPayload,
      canonicalKinkSocialUrl: `${APP_URL}/events/${encodeURIComponent(ev.id)}`,
      locationVisibility: ev.locationVisibility,
      locationHiddenWarning,
    },
  }
}

async function buildEducationArticlePreview(
  viewer: EckePublishViewer,
  articleId: string,
  entry: EckeRegistryEntry,
): Promise<{ ok: true; result: EckePublishPreviewResult } | { ok: false; status: number; error: string }> {
  const access = await resolveArticlePublishAccess(articleId, viewer.userId)
  if (!access) {
    return { ok: false, status: 404, error: 'Article not found' }
  }
  if (!access.canManage) {
    return { ok: false, status: 403, error: 'Author access required to preview ECKE publish' }
  }

  if (access.article.publicationStatus === 'ARCHIVED') {
    return { ok: false, status: 400, error: 'Archived articles cannot be previewed for ECKE publish' }
  }

  let ctx: EducationArticlePublishContext
  try {
    ctx = buildEducationArticlePublishContext(access)
  } catch (err) {
    return {
      ok: false,
      status: 400,
      error: err instanceof Error ? err.message : 'Could not build ECKE publish preview',
    }
  }

  const row = await loadEducationArticleTarget(articleId)
  const status = deriveTargetDisplayStatus(ctx.contentHash, row)
  const bridgeConfigured = loadEckeIngestApiConfig() !== null
  const eckePublicUrl =
    row?.eckePublicUrl ?? resolveEckePublicEducationUrl(row?.externalSlug ?? ctx.externalSlug)

  return {
    ok: true,
    result: {
      sourceKind: 'education_article',
      sourceId: articleId,
      supportState: entry.supportState,
      eligible: ctx.eligibility.eligible,
      reason: ctx.eligibility.reason,
      status,
      contentHash: ctx.contentHash,
      publishedContentHash: row?.publishedContentHash ?? null,
      lastPublishedAt: row?.lastPublishedAt?.toISOString() ?? null,
      lastPreviewAt: row?.lastPreviewAt?.toISOString() ?? null,
      lastError: row?.lastError ?? null,
      externalSlug: row?.externalSlug ?? ctx.externalSlug,
      eckePublicUrl,
      eckePublicUrlKnown: Boolean(row?.eckePublicUrl),
      currentTransport: entry.currentTransport,
      eckeSurfacesAffected: entry.eckeSurfacesAffected,
      actions: computeEducationArticleActions({
        eligible: ctx.eligibility.eligible,
        status,
        bridgeConfigured,
      }),
      staleNotice:
        status === 'stale' ?
          'This article has changed since it was last published to ECKE. Sync to update the public article.'
        : null,
      wouldPublish: buildEducationArticlePlainFields(ctx, entry),
      wouldPublishDeferred: getEducationDeferredFields(),
      wouldNotPublish: getEducationOmittedFields(),
      payload: ctx.payload,
      canonicalKinkSocialUrl: ctx.canonicalKinkSocialUrl,
    },
  }
}

export async function getGroupEckePublishOverview(
  viewer: EckePublishViewer,
  groupId: string,
): Promise<{ ok: true; result: EckeGroupOverviewResult } | { ok: false; status: number; error: string }> {
  const access = await resolveGroupPublishAccess(groupId, viewer.userId)
  if (!access) {
    return { ok: false, status: 404, error: 'Group not found' }
  }
  if (!access.canManage) {
    return { ok: false, status: 403, error: 'Group moderator access required' }
  }

  const cards: EckeGroupOverviewCard[] = []

  cards.push({
    section: 'overview',
    title: 'ECKE Publish overview',
    supportState: 'info',
    summary: isEckeBridgeConfigured()
      ? 'ECKE publish bridge is configured. Group listing and public group event publish, sync, and unpublish are available below.'
      : 'ECKE publish bridge is not configured on this server. Configure ECKE env vars to publish listings and events.',
  })

  const groupPreview = await buildGroupListingPreview(viewer, groupId, getRegistryEntry('group_listing')!)
  if (groupPreview.ok) {
    cards.push({
      section: 'group_listing',
      sourceKind: 'group_listing',
      sourceId: groupId,
      title: 'Group listing',
      supportState: 'active_existing',
      eligible: groupPreview.result.eligible,
      reason: groupPreview.result.reason,
      status: groupPreview.result.status,
      preview: groupPreview.result,
    })
  }

  const events = await db
    .select({
      id: schema.events.id,
      title: schema.events.title,
      visibility: schema.events.visibility,
    })
    .from(schema.events)
    .where(eq(schema.events.groupId, groupId))
    .orderBy(asc(schema.events.startsAt))
    .limit(20)

  if (events.length === 0) {
    cards.push({
      section: 'events',
      title: 'Events',
      supportState: 'preview_only',
      plannedMessage: 'No group-hosted events yet. Create a public event to preview ECKE event listing.',
    })
  } else {
    for (const ev of events) {
      const evPreview = await buildEventListingPreview(viewer, ev.id, getRegistryEntry('event_listing')!)
      if (evPreview.ok) {
        cards.push({
          section: 'events',
          sourceKind: 'event_listing',
          sourceId: ev.id,
          title: ev.title,
          supportState: 'active_existing',
          eligible: evPreview.result.eligible,
          reason: evPreview.result.reason,
          status: evPreview.result.status,
          preview: evPreview.result,
        })
      }
    }
  }

  cards.push({
    section: 'education',
    title: 'Education',
    supportState: 'planned',
    plannedMessage: 'Group-owned education ECKE publish is planned. Author-owned articles use the education writer today.',
  })

  cards.push({
    section: 'venues',
    title: 'Venues / Dungeons / Places',
    supportState: 'planned',
    plannedMessage: 'Group-owned venue publishing requires ECKE table mapping confirmation (Pass 6).',
  })

  cards.push({
    section: 'vendors',
    title: 'Vendors / Sponsors',
    supportState: 'planned',
    plannedMessage: 'Group-owned vendor publishing is planned (Pass 5). User-owned vendors publish from vendor shop settings.',
  })

  cards.push({
    section: 'dancecard',
    title: 'Dancecard',
    supportState: 'planned',
    plannedMessage: 'Dancecard publish is managed from the convention organizer dashboard when your org runs a convention.',
  })

  const historyRows = await db
    .select({
      targetKind: schema.eckePublishTargets.targetKind,
      externalSlug: schema.eckePublishTargets.externalSlug,
      status: schema.eckePublishTargets.status,
      lastPublishedAt: schema.eckePublishTargets.lastPublishedAt,
      lastError: schema.eckePublishTargets.lastError,
      lastPreviewAt: schema.eckePublishTargets.lastPreviewAt,
    })
    .from(schema.eckePublishTargets)
    .where(eq(schema.eckePublishTargets.groupId, groupId))

  return {
    ok: true,
    result: {
      groupId,
      groupSlug: access.group.slug,
      groupName: access.group.name,
      bridgeConnected: isEckeBridgeConfigured(),
      passNotice:
        'Only public group listings and public group events can be published to East Coast Kink Events. Member lists, RSVP data, and private locations are never sent.',
      cards,
      history: historyRows.map((r) => ({
        targetKind: r.targetKind,
        externalSlug: r.externalSlug,
        status: r.status,
        lastPublishedAt: r.lastPublishedAt?.toISOString() ?? null,
        lastError: r.lastError ?? null,
        lastPreviewAt: r.lastPreviewAt?.toISOString() ?? null,
      })),
    },
  }
}

export type EckePublishActionResult = {
  ok: boolean
  sourceKind: EckeSourceKind
  sourceId: string
  status?: EckeTargetStatus
  errorCode?: string
  message?: string
  error?: string
  preview?: EckePublishPreviewResult
}

async function executeGroupListingPublish(
  viewer: EckePublishViewer,
  groupId: string,
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  const access = await resolveGroupPublishAccess(groupId, viewer.userId)
  if (!access) return { ok: false, status: 404, error: 'Group not found' }
  if (!access.canManage) {
    return { ok: false, status: 403, error: 'Group moderator access required to publish ECKE listing' }
  }

  const ctx = buildGroupListingPublishContext(access)
  if (!ctx.eligibility.eligible) {
    return { ok: false, status: 400, error: ctx.eligibility.reason ?? 'Group is not eligible for ECKE publish' }
  }
  if (!payloadExcludesPrivateGroupFields(ctx.listingPayload)) {
    return { ok: false, status: 400, error: 'Payload contains restricted private fields' }
  }

  const cfg = loadEckePublishClientConfig()
  if (!cfg) {
    return { ok: false, status: 503, error: 'ECKE publish bridge is not configured' }
  }

  const scope = { scopeType: 'group' as const, groupId }
  await ensureEckePublishTargetRow({
    scope,
    targetKind: 'ecke_listing',
    externalSlug: ctx.listingPayload.slug,
    contentHash: ctx.contentHash,
  })
  await touchEckePublishPreview({
    scope,
    targetKind: 'ecke_listing',
    externalSlug: ctx.listingPayload.slug,
    contentHash: ctx.contentHash,
    userId: viewer.userId,
  })

  const listingResult = await publishListingToEcke(cfg, ctx.listingPayload, {
    sourceSystem: 'kink.social',
    sourceId: groupId,
    canonicalKinkSocialUrl: ctx.canonicalKinkSocialUrl,
    entityType: 'group',
  })

  const status = await markEckePublishSuccess({
    scope,
    targetKind: 'ecke_listing',
    externalSlug: ctx.listingPayload.slug,
    contentHash: ctx.contentHash,
    userId: viewer.userId,
    result: listingResult,
  })

  const preview = await buildGroupListingPreview(viewer, groupId, getRegistryEntry('group_listing')!)

  if (!listingResult.ok) {
    return {
      ok: false,
      status: 502,
      error: listingResult.error,
      errorCode: 'ecke_publish_failed',
    }
  }

  return {
    ok: true,
    result: {
      ok: true,
      sourceKind: 'group_listing',
      sourceId: groupId,
      status,
      message: 'Group listing published to ECKE',
      preview: preview.ok ? preview.result : undefined,
    },
  }
}

async function executeGroupListingUnpublish(
  viewer: EckePublishViewer,
  groupId: string,
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  const access = await resolveGroupPublishAccess(groupId, viewer.userId)
  if (!access) return { ok: false, status: 404, error: 'Group not found' }
  if (!access.canManage) {
    return { ok: false, status: 403, error: 'Group moderator access required to unpublish ECKE listing' }
  }

  const scope = { scopeType: 'group' as const, groupId }
  const row = await loadEckePublishTarget(scope, 'ecke_listing')
  if (!row || row.status === 'unpublished') {
    const preview = await buildGroupListingPreview(viewer, groupId, getRegistryEntry('group_listing')!)
    return {
      ok: true,
      result: {
        ok: true,
        sourceKind: 'group_listing',
        sourceId: groupId,
        status: 'unpublished',
        message: 'Group listing is already unpublished on ECKE',
        preview: preview.ok ? preview.result : undefined,
      },
    }
  }

  const cfg = loadEckePublishClientConfig()
  let remoteOk = true
  let remoteError: string | null = null
  if (cfg) {
    const remoteResult = await unpublishListingToEcke(cfg, {
      slug: row.externalSlug,
      sourceId: groupId,
      entityType: 'group',
    })
    remoteOk = remoteResult.ok
    remoteError = remoteResult.ok ? null : remoteResult.error
  }

  const status = await markEckeUnpublishSuccess({
    scope,
    targetKind: 'ecke_listing',
    userId: viewer.userId,
    remoteOk,
    remoteError,
  })

  const preview = await buildGroupListingPreview(viewer, groupId, getRegistryEntry('group_listing')!)

  return {
    ok: true,
    result: {
      ok: true,
      sourceKind: 'group_listing',
      sourceId: groupId,
      status,
      message: remoteOk ?
        'Group listing unpublished from ECKE'
      : 'Local unpublish recorded; remote webhook reported an error',
      error: remoteOk ? undefined : remoteError ?? undefined,
      preview: preview.ok ? preview.result : undefined,
    },
  }
}

async function requireGroupOwnedEvent(
  eventId: string,
  viewer: EckePublishViewer,
  expectedGroupId?: string,
): Promise<
  | { ok: true; groupId: string }
  | { ok: false; status: number; error: string }
> {
  const [ev] = await db
    .select({
      id: schema.events.id,
      groupId: schema.events.groupId,
      visibility: schema.events.visibility,
    })
    .from(schema.events)
    .where(eq(schema.events.id, eventId))
    .limit(1)

  if (!ev) return { ok: false, status: 404, error: 'Event not found' }
  if (!ev.groupId) {
    return { ok: false, status: 403, error: 'Event is not group-owned; use organizer event ECKE routes for host-owned events' }
  }
  if (expectedGroupId && ev.groupId !== expectedGroupId) {
    return { ok: false, status: 403, error: 'Event does not belong to this group' }
  }

  const access = await resolveGroupPublishAccess(ev.groupId, viewer.userId)
  if (!access) return { ok: false, status: 404, error: 'Group not found' }
  if (!access.canManage) {
    return { ok: false, status: 403, error: 'Group moderator access required to publish ECKE event listing' }
  }

  return { ok: true, groupId: ev.groupId }
}

async function executeEventListingPublish(
  viewer: EckePublishViewer,
  eventId: string,
  expectedGroupId?: string,
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  const gate = await requireGroupOwnedEvent(eventId, viewer, expectedGroupId)
  if (!gate.ok) return gate

  const previewResult = await buildEventListingPreview(viewer, eventId, getRegistryEntry('event_listing')!)
  if (!previewResult.ok) return previewResult
  if (!previewResult.result.eligible) {
    return { ok: false, status: 400, error: previewResult.result.reason ?? 'Event is not eligible for ECKE publish' }
  }

  if (!loadEckePublishClientConfig()) {
    return { ok: false, status: 503, error: 'ECKE publish bridge is not configured' }
  }

  const scope = { scopeType: 'event' as const, eventId }
  await ensureEckePublishTargetRow({
    scope,
    targetKind: 'ecke_event',
    externalSlug: previewResult.result.externalSlug ?? eventId,
    contentHash: previewResult.result.contentHash ?? '',
  })

  const publishResult = await executeEckePublishStandaloneEvent(eventId, viewer.userId)
  const row = await loadEckePublishTarget(scope, 'ecke_event')
  const status = deriveTargetDisplayStatus(previewResult.result.contentHash ?? '', row)

  if (publishResult.ok && row && !row.eckePublicUrl) {
    await db
      .update(schema.eckePublishTargets)
      .set({
        eckePublicUrl: resolveEckePublicEventUrl(previewResult.result.externalSlug ?? row.externalSlug),
        updatedAt: new Date(),
      })
      .where(eq(schema.eckePublishTargets.id, row.id))
  }

  const preview = await buildEventListingPreview(viewer, eventId, getRegistryEntry('event_listing')!)

  if (!publishResult.ok) {
    return {
      ok: false,
      status: 502,
      error: publishResult.error,
      errorCode: 'ecke_publish_failed',
    }
  }

  return {
    ok: true,
    result: {
      ok: true,
      sourceKind: 'event_listing',
      sourceId: eventId,
      status,
      message: 'Event listing published to ECKE',
      preview: preview.ok ? preview.result : undefined,
    },
  }
}

async function executeEventListingUnpublish(
  viewer: EckePublishViewer,
  eventId: string,
  expectedGroupId?: string,
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  const gate = await requireGroupOwnedEvent(eventId, viewer, expectedGroupId)
  if (!gate.ok) return gate

  const scope = { scopeType: 'event' as const, eventId }
  const row = await loadEckePublishTarget(scope, 'ecke_event')
  if (!row || row.status === 'unpublished') {
    const preview = await buildEventListingPreview(viewer, eventId, getRegistryEntry('event_listing')!)
    return {
      ok: true,
      result: {
        ok: true,
        sourceKind: 'event_listing',
        sourceId: eventId,
        status: 'unpublished',
        message: 'Event listing is already unpublished on ECKE',
        preview: preview.ok ? preview.result : undefined,
      },
    }
  }

  const cfg = loadEckePublishClientConfig()
  let remoteOk = true
  let remoteError: string | null = null
  if (cfg) {
    const remoteResult = await unpublishEventRowToEcke(cfg, row.externalSlug)
    remoteOk = remoteResult.ok
    remoteError = remoteResult.ok ? null : remoteResult.error
  }

  const status = await markEckeUnpublishSuccess({
    scope,
    targetKind: 'ecke_event',
    userId: viewer.userId,
    remoteOk,
    remoteError,
  })

  const preview = await buildEventListingPreview(viewer, eventId, getRegistryEntry('event_listing')!)

  return {
    ok: true,
    result: {
      ok: true,
      sourceKind: 'event_listing',
      sourceId: eventId,
      status,
      message: remoteOk ? 'Event listing unpublished from ECKE' : 'Local unpublish recorded; remote Supabase reported an error',
      error: remoteOk ? undefined : remoteError ?? undefined,
      preview: preview.ok ? preview.result : undefined,
    },
  }
}

function isPass5WriteKind(sourceKind: EckeSourceKind): boolean {
  return PASS5_SUPPORTED_WRITE_KINDS.has(sourceKind)
}

async function executeEducationArticlePublish(
  viewer: EckePublishViewer,
  articleId: string,
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  const access = await resolveArticlePublishAccess(articleId, viewer.userId)
  if (!access) return { ok: false, status: 404, error: 'Article not found' }
  if (!access.canManage) {
    return { ok: false, status: 403, error: 'Author access required to publish ECKE article' }
  }

  const previewResult = await buildEducationArticlePreview(
    viewer,
    articleId,
    getRegistryEntry('education_article')!,
  )
  if (!previewResult.ok) return previewResult
  if (!previewResult.result.eligible) {
    return {
      ok: false,
      status: 400,
      error: previewResult.result.reason ?? 'Article is not eligible for ECKE publish',
    }
  }
  if (!payloadExcludesPrivateEducationFields(previewResult.result.payload as Record<string, unknown>)) {
    return { ok: false, status: 400, error: 'Payload contains restricted private fields' }
  }
  if (!loadEckeIngestApiConfig()) {
    return { ok: false, status: 503, error: 'ECKE ingest API is not configured' }
  }

  const publishResult = await executeEckePublishArticle(articleId, viewer.userId)
  const preview = await buildEducationArticlePreview(viewer, articleId, getRegistryEntry('education_article')!)

  if (!publishResult.ok) {
    return {
      ok: false,
      status: 502,
      error: publishResult.error,
      errorCode: 'ecke_publish_failed',
    }
  }

  return {
    ok: true,
    result: {
      ok: true,
      sourceKind: 'education_article',
      sourceId: articleId,
      status: preview.ok ? preview.result.status : 'published',
      message: 'Education article published to ECKE',
      preview: preview.ok ? preview.result : undefined,
    },
  }
}

async function executeEducationArticleUnpublish(
  viewer: EckePublishViewer,
  articleId: string,
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  const access = await resolveArticlePublishAccess(articleId, viewer.userId)
  if (!access) return { ok: false, status: 404, error: 'Article not found' }
  if (!access.canManage) {
    return { ok: false, status: 403, error: 'Author access required to unpublish ECKE article' }
  }

  const row = await loadEducationArticleTarget(articleId)
  if (!row || row.status === 'unpublished') {
    const preview = await buildEducationArticlePreview(viewer, articleId, getRegistryEntry('education_article')!)
    return {
      ok: true,
      result: {
        ok: true,
        sourceKind: 'education_article',
        sourceId: articleId,
        status: 'unpublished',
        message: 'Education article is already unpublished on ECKE',
        preview: preview.ok ? preview.result : undefined,
      },
    }
  }

  const unpublishResult = await executeEckeUnpublishEducationArticleWithTargetUpdate(
    articleId,
    'opt_out',
    viewer.userId,
  )
  const preview = await buildEducationArticlePreview(viewer, articleId, getRegistryEntry('education_article')!)

  if (!unpublishResult.ok) {
    return {
      ok: false,
      status: 502,
      error: unpublishResult.error,
      errorCode: 'ecke_unpublish_failed',
    }
  }

  return {
    ok: true,
    result: {
      ok: true,
      sourceKind: 'education_article',
      sourceId: articleId,
      status: preview.ok ? preview.result.status : 'unpublished',
      message: 'Education article unpublished from ECKE',
      preview: preview.ok ? preview.result : undefined,
    },
  }
}

export async function publishEckeSource(
  viewer: EckePublishViewer,
  input: { sourceKind: EckeSourceKind; sourceId: string; expectedGroupId?: string },
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  if (!isPass5WriteKind(input.sourceKind)) {
    return {
      ok: false,
      status: 501,
      error: PASS5_UNSUPPORTED_ERROR.message,
      errorCode: PASS5_UNSUPPORTED_ERROR.errorCode,
    }
  }
  if (input.sourceKind === 'group_listing') {
    return executeGroupListingPublish(viewer, input.sourceId)
  }
  if (input.sourceKind === 'education_article') {
    return executeEducationArticlePublish(viewer, input.sourceId)
  }
  return executeEventListingPublish(viewer, input.sourceId, input.expectedGroupId)
}

export async function syncEckeSource(
  viewer: EckePublishViewer,
  input: { sourceKind: EckeSourceKind; sourceId: string; expectedGroupId?: string },
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  if (!isPass5WriteKind(input.sourceKind)) {
    return {
      ok: false,
      status: 501,
      error: PASS5_UNSUPPORTED_ERROR.message,
      errorCode: PASS5_UNSUPPORTED_ERROR.errorCode,
    }
  }
  if (input.sourceKind === 'group_listing') {
    return executeGroupListingPublish(viewer, input.sourceId)
  }
  if (input.sourceKind === 'education_article') {
    return executeEducationArticlePublish(viewer, input.sourceId)
  }
  return executeEventListingPublish(viewer, input.sourceId, input.expectedGroupId)
}

export async function unpublishEckeSource(
  viewer: EckePublishViewer,
  input: { sourceKind: EckeSourceKind; sourceId: string; expectedGroupId?: string },
): Promise<
  | { ok: true; result: EckePublishActionResult }
  | { ok: false; status: number; error: string; errorCode?: string }
> {
  if (!isPass5WriteKind(input.sourceKind)) {
    return {
      ok: false,
      status: 501,
      error: PASS5_UNSUPPORTED_ERROR.message,
      errorCode: PASS5_UNSUPPORTED_ERROR.errorCode,
    }
  }
  if (input.sourceKind === 'group_listing') {
    return executeGroupListingUnpublish(viewer, input.sourceId)
  }
  if (input.sourceKind === 'education_article') {
    return executeEducationArticleUnpublish(viewer, input.sourceId)
  }
  return executeEventListingUnpublish(viewer, input.sourceId, input.expectedGroupId)
}

export { isValidEckeSourceKind }
