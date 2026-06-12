import {
  MEDIA_STORAGE_STATES,
  MEDIA_UPLOAD_STATUSES,
  SCANNER_NAMES,
  SCANNER_RESULT_STATUSES,
  SCAN_STATUSES,
  isMediaPublishedStatus,
  isPublicStorageState,
} from '@c2k/shared'
import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import { getMediaAssetById } from './media-asset-service.js'

export async function assetHasMalwareBlock(mediaAssetId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.mediaScannerResults.id })
    .from(schema.mediaScannerResults)
    .where(
      and(
        eq(schema.mediaScannerResults.mediaAssetId, mediaAssetId),
        eq(schema.mediaScannerResults.scannerName, SCANNER_NAMES.malwareClamav),
        eq(schema.mediaScannerResults.status, SCANNER_RESULT_STATUSES.blocked)
      )
    )
    .orderBy(desc(schema.mediaScannerResults.createdAt))
    .limit(1)
  return Boolean(row)
}

export async function resolveMediaAssetIdFromCase(
  targetContentType: string,
  targetContentId: string
): Promise<string | null> {
  if (targetContentType === 'media_asset') return targetContentId
  if (targetContentType === 'profile_photo') {
    const [row] = await db
      .select({ mediaAssetId: schema.profilePhotos.mediaAssetId })
      .from(schema.profilePhotos)
      .where(eq(schema.profilePhotos.id, targetContentId))
      .limit(1)
    return row?.mediaAssetId ?? null
  }
  return null
}

export async function removeMediaAssetByModerator(
  actorUserId: string,
  mediaAssetId: string,
  _reason: string
): Promise<void> {
  const now = new Date()
  await db
    .update(schema.mediaAssets)
    .set({
      uploadStatus: MEDIA_UPLOAD_STATUSES.removed,
      storageState: MEDIA_STORAGE_STATES.removedPrivate,
      removedAt: now,
      removedByUserId: actorUserId,
      updatedAt: now,
    })
    .where(eq(schema.mediaAssets.id, mediaAssetId))

  await db.delete(schema.profilePhotos).where(eq(schema.profilePhotos.mediaAssetId, mediaAssetId))
}

export async function keepMediaQuarantined(
  _actorUserId: string,
  mediaAssetId: string
): Promise<void> {
  const asset = await getMediaAssetById(mediaAssetId)
  if (!asset) throw new Error('Media asset not found')
  if (isPublicStorageState(asset.storageState)) return

  const updates: Partial<typeof schema.mediaAssets.$inferInsert> = {
    updatedAt: new Date(),
  }
  if (asset.uploadStatus !== MEDIA_UPLOAD_STATUSES.quarantined) {
    updates.uploadStatus = MEDIA_UPLOAD_STATUSES.quarantined
  }
  if (asset.storageState !== MEDIA_STORAGE_STATES.quarantinedPrivate) {
    updates.storageState = MEDIA_STORAGE_STATES.quarantinedPrivate
  }
  if (Object.keys(updates).length > 1) {
    await db.update(schema.mediaAssets).set(updates).where(eq(schema.mediaAssets.id, mediaAssetId))
  }
}

/** Clear a false-positive scanner flag and publish the asset when safe. */
export async function approveMediaAssetByModerator(
  actorUserId: string,
  mediaAssetId: string
): Promise<void> {
  if (await assetHasMalwareBlock(mediaAssetId)) {
    throw new Error('Cannot approve malware-blocked asset')
  }
  const asset = await getMediaAssetById(mediaAssetId)
  if (!asset) throw new Error('Media asset not found')
  if (isMediaPublishedStatus(asset.uploadStatus as Parameters<typeof isMediaPublishedStatus>[0])) {
    return
  }

  const { promoteMediaAssetToPublic } = await import('./media-pipeline.js')
  await promoteMediaAssetToPublic({ mediaAssetId, promotedByUserId: actorUserId })

  await db
    .update(schema.mediaAssets)
    .set({
      uploadStatus: MEDIA_UPLOAD_STATUSES.autoApproved,
      scanStatus: SCAN_STATUSES.passed,
      storageState: MEDIA_STORAGE_STATES.approvedPublic,
      updatedAt: new Date(),
    })
    .where(eq(schema.mediaAssets.id, mediaAssetId))
}

export async function restoreMediaAssetByModerator(
  _actorUserId: string,
  mediaAssetId: string,
  _reason: string
): Promise<void> {
  if (await assetHasMalwareBlock(mediaAssetId)) {
    throw new Error('Cannot restore malware-blocked asset')
  }
  const asset = await getMediaAssetById(mediaAssetId)
  if (!asset) throw new Error('Media asset not found')

  const updates: Partial<typeof schema.mediaAssets.$inferInsert> = {
    removedAt: null,
    removedByUserId: null,
    updatedAt: new Date(),
  }
  if (asset.uploadStatus === MEDIA_UPLOAD_STATUSES.removed) {
    updates.uploadStatus = MEDIA_UPLOAD_STATUSES.quarantined
    updates.storageState = MEDIA_STORAGE_STATES.quarantinedPrivate
  }

  await db.update(schema.mediaAssets).set(updates).where(eq(schema.mediaAssets.id, mediaAssetId))
}
