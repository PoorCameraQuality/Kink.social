import { and, eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import { derivePublishStatus } from './ecke-publish-payload.js'
import type { EckePublishResult } from './ecke-publish-client.js'

export type EckeTargetScope =
  | { scopeType: 'group'; groupId: string }
  | { scopeType: 'organization'; organizationId: string }
  | { scopeType: 'convention'; conventionId: string }
  | { scopeType: 'event'; eventId: string }

export type EckeTargetKind = 'ecke_listing' | 'dancecard_event' | 'ecke_event' | 'ecke_dungeon'

export type EckeTargetStatus = 'never' | 'draft' | 'published' | 'error' | 'stale' | 'unpublished'

export function deriveTargetDisplayStatus(
  contentHash: string,
  row: (typeof schema.eckePublishTargets.$inferSelect) | undefined,
): EckeTargetStatus {
  if (!row) return 'never'
  if (row.status === 'unpublished') return 'unpublished'
  if (row.status === 'error') return 'error'
  if (!row.lastPublishedAt || !row.publishedContentHash) {
    return row.lastPreviewAt ? 'draft' : 'never'
  }
  return derivePublishStatus(contentHash, row.publishedContentHash, row.lastPublishedAt)
}

function scopeWhere(scope: EckeTargetScope, targetKind: EckeTargetKind) {
  if (scope.scopeType === 'group') {
    return and(eq(schema.eckePublishTargets.groupId, scope.groupId), eq(schema.eckePublishTargets.targetKind, targetKind))
  }
  if (scope.scopeType === 'organization') {
    return and(
      eq(schema.eckePublishTargets.organizationId, scope.organizationId),
      eq(schema.eckePublishTargets.targetKind, targetKind),
    )
  }
  if (scope.scopeType === 'convention') {
    return and(
      eq(schema.eckePublishTargets.conventionId, scope.conventionId),
      eq(schema.eckePublishTargets.targetKind, targetKind),
    )
  }
  return and(eq(schema.eckePublishTargets.eventId, scope.eventId), eq(schema.eckePublishTargets.targetKind, targetKind))
}

export async function loadEckePublishTarget(scope: EckeTargetScope, targetKind: EckeTargetKind) {
  const [row] = await db.select().from(schema.eckePublishTargets).where(scopeWhere(scope, targetKind)).limit(1)
  return row
}

export async function touchEckePublishPreview(input: {
  scope: EckeTargetScope
  targetKind: EckeTargetKind
  externalSlug: string
  contentHash: string
  userId: string
}): Promise<EckeTargetStatus> {
  const now = new Date()
  const prev = await loadEckePublishTarget(input.scope, input.targetKind)
  const status = deriveTargetDisplayStatus(input.contentHash, prev)

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
    return status
  }

  await db.insert(schema.eckePublishTargets).values({
    scopeType: input.scope.scopeType,
    organizationId: input.scope.scopeType === 'organization' ? input.scope.organizationId : null,
    conventionId: input.scope.scopeType === 'convention' ? input.scope.conventionId : null,
    groupId: input.scope.scopeType === 'group' ? input.scope.groupId : null,
    eventId: input.scope.scopeType === 'event' ? input.scope.eventId : null,
    targetKind: input.targetKind,
    externalSlug: input.externalSlug,
    contentHash: input.contentHash,
    status,
    lastPreviewAt: now,
  })

  return status
}

export async function markEckePublishSuccess(input: {
  scope: EckeTargetScope
  targetKind: EckeTargetKind
  externalSlug: string
  contentHash: string
  userId: string
  result: EckePublishResult
}): Promise<EckeTargetStatus> {
  const now = new Date()
  const where = scopeWhere(input.scope, input.targetKind)

  if (input.result.ok) {
    await db
      .update(schema.eckePublishTargets)
      .set({
        status: 'published',
        externalSlug: input.externalSlug,
        contentHash: input.contentHash,
        publishedContentHash: input.contentHash,
        lastPublishedAt: now,
        lastAttemptAt: now,
        lastError: null,
        unpublishedAt: null,
        eckePublicUrl: input.result.eckePublicUrl ?? null,
        eckeRecordId: input.result.eckeRecordId ?? null,
        publishedByUserId: input.userId,
        updatedAt: now,
      })
      .where(where)
    return 'published'
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

  return 'error'
}

export async function markEckeUnpublishSuccess(input: {
  scope: EckeTargetScope
  targetKind: EckeTargetKind
  userId: string
  remoteOk: boolean
  remoteError?: string | null
}): Promise<EckeTargetStatus> {
  const now = new Date()
  const prev = await loadEckePublishTarget(input.scope, input.targetKind)
  if (!prev) {
    return 'unpublished'
  }

  await db
    .update(schema.eckePublishTargets)
    .set({
      status: 'unpublished',
      unpublishedAt: now,
      lastAttemptAt: now,
      lastError: input.remoteOk ? null : input.remoteError ?? null,
      publishedContentHash: null,
      updatedAt: now,
    })
    .where(eq(schema.eckePublishTargets.id, prev.id))

  return 'unpublished'
}

/** Ensure a target row exists before publish attempt. */
export async function ensureEckePublishTargetRow(input: {
  scope: EckeTargetScope
  targetKind: EckeTargetKind
  externalSlug: string
  contentHash: string
}) {
  const prev = await loadEckePublishTarget(input.scope, input.targetKind)
  if (prev) return prev
  await db.insert(schema.eckePublishTargets).values({
    scopeType: input.scope.scopeType,
    organizationId: input.scope.scopeType === 'organization' ? input.scope.organizationId : null,
    conventionId: input.scope.scopeType === 'convention' ? input.scope.conventionId : null,
    groupId: input.scope.scopeType === 'group' ? input.scope.groupId : null,
    eventId: input.scope.scopeType === 'event' ? input.scope.eventId : null,
    targetKind: input.targetKind,
    externalSlug: input.externalSlug,
    contentHash: input.contentHash,
    status: 'never',
  })
  return loadEckePublishTarget(input.scope, input.targetKind)
}
