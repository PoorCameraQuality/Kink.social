import {
  ADULT_CONTENT_PREFERENCES,
} from '@c2k/shared'
import { getAdultContentPreference } from './adult-content-preference.js'
import { getMediaAssetById, mediaAssetToPhotoDto } from './media-asset-service.js'
import {
  mediaContentProxyPath,
  resolveMediaPublicUrl,
  resolveMediaServingKey,
} from './media-pipeline.js'
import { canViewerSeeMedia, isMediaPublished, shouldBlurMediaForViewer } from './media-visibility.js'
import { assetHasMalwareBlock } from './media-mod-actions.js'
import { getObjectBuffer, getS3Client } from './s3-upload.js'

export async function getMediaAssetForViewer(
  mediaAssetId: string,
  viewer: { userId: string | null; adultContentPref?: 'SHOW' | 'BLUR' | 'HIDE'; isStaff?: boolean }
) {
  const asset = await getMediaAssetById(mediaAssetId)
  if (!asset) return null

  const dto = mediaAssetToPhotoDto(asset)
  const isOwner = viewer.userId === asset.uploaderUserId
  if (!isOwner && asset.removedAt) return null

  const adultContentPref =
    viewer.adultContentPref ??
    (viewer.userId ? await loadViewerAdultContentPref(viewer.userId) : ADULT_CONTENT_PREFERENCES.blur)

  if (!dto.contentRating || !dto.visibility || !dto.uploadStatus) {
    if (!isOwner) return null
    return {
      id: asset.id,
      ...dto,
      storageKey: null,
      blurred: true,
    }
  }

  const visibilityMedia = {
    contentRating: dto.contentRating,
    visibility: dto.visibility,
    uploadStatus: dto.uploadStatus,
    isBlurredByDefault: dto.isBlurredByDefault,
  }

  const visibilityViewer = {
    authenticated: Boolean(viewer.userId),
    adultContentPref,
    isStaff: viewer.isStaff,
  }

  if (!isOwner && !canViewerSeeMedia(visibilityViewer, visibilityMedia)) {
    return null
  }

  let blur = shouldBlurMediaForViewer(visibilityViewer, visibilityMedia)
  if (isOwner && isMediaPublished(dto.uploadStatus)) {
    blur = false
  }

  const publicUrl = resolveMediaPublicUrl(asset)
  let resolvedUrl: string | null = null
  if (!blur) {
    if (publicUrl) {
      resolvedUrl = publicUrl
    } else if (isOwner) {
      resolvedUrl = mediaContentProxyPath(asset.id)
    }
  }

  return {
    id: asset.id,
    ...dto,
    url: resolvedUrl,
    canView: true,
    storageKey: blur ? null : resolveMediaServingKey(asset),
    blurred: blur,
    storageState: asset.storageState,
    scanStatus: asset.scanStatus,
  }
}

export async function streamMediaAssetContent(
  mediaAssetId: string,
  viewerUserId: string | null,
  opts?: { isStaff?: boolean },
): Promise<{ body: Buffer; contentType: string } | null> {
  const asset = await getMediaAssetById(mediaAssetId)
  if (!asset) return null

  const isOwner = viewerUserId === asset.uploaderUserId
  const dto = mediaAssetToPhotoDto(asset)
  const adultPref = viewerUserId ? await loadViewerAdultContentPref(viewerUserId) : ADULT_CONTENT_PREFERENCES.blur

  const canView =
    isOwner ||
    opts?.isStaff ||
    (dto.contentRating &&
      dto.visibility &&
      dto.uploadStatus &&
      canViewerSeeMedia(
        { authenticated: Boolean(viewerUserId), adultContentPref: adultPref, isStaff: opts?.isStaff },
        {
          contentRating: dto.contentRating,
          visibility: dto.visibility,
          uploadStatus: dto.uploadStatus,
          isBlurredByDefault: dto.isBlurredByDefault,
        },
      ))

  if (!canView) return null

  const key = resolveMediaServingKey(asset)
  if (!key || key.startsWith('http')) return null

  const client = getS3Client()
  if (!client) return null

  const obj = await getObjectBuffer(client, key, asset.storageBucket ?? undefined)
  if (!obj) return null
  return { body: obj.body, contentType: obj.contentType ?? asset.mimeType }
}

/** Platform moderator stream - bypasses member visibility; blocked when malware flagged. */
export async function streamMediaAssetForModerator(
  mediaAssetId: string
): Promise<{ body: Buffer; contentType: string } | null> {
  if (await assetHasMalwareBlock(mediaAssetId)) return null

  const asset = await getMediaAssetById(mediaAssetId)
  if (!asset) return null

  const key = resolveMediaServingKey(asset)
  if (!key || key.startsWith('http')) return null

  const client = getS3Client()
  if (!client) return null

  const obj = await getObjectBuffer(client, key, asset.storageBucket ?? undefined)
  if (!obj) return null
  return { body: obj.body, contentType: obj.contentType ?? asset.mimeType }
}

export async function loadViewerAdultContentPref(userId: string | null): Promise<'SHOW' | 'BLUR' | 'HIDE'> {
  if (!userId) return ADULT_CONTENT_PREFERENCES.blur
  return getAdultContentPreference(userId)
}
