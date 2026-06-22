import {
  feedAttachmentSchema,
  MEDIA_CONTENT_RATINGS,
  MEDIA_UPLOAD_STATUSES,
  MEDIA_VISIBILITIES,
  isProfilePhotoPendingReviewStatus,
  normalizePrivacySettings,
  type FeedAttachment,
  type MediaFeedAttachment,
} from '@c2k/shared'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import { createMediaAssetForUpload, getMediaAssetById } from './media-asset-service.js'
import { emitActivity } from './feed-activities.js'
import {
  autoPublishProfileGalleryPhoto,
  rejectProfileGalleryMediaAsset,
} from './profile-photo-policy.js'
import {
  ensureDefaultAlbumsForUser,
  MediaSocialError,
  shapeMediaItemPreview,
} from './media-social-service.js'
import { ensureProfileForUserId } from './ensure-profile.js'
import { mediaContentProxyPath } from './media-pipeline.js'
import {
  assertPersonalPhotoQuotaRoom,
  PersonalPhotoQuotaError,
} from './personal-photo-quota.js'
import { ensureUserSettingsRow } from './user-settings-row.js'

/**
 * Feed composer photos behave like gallery photos (display + quota), but use a distinct
 * surface so the retention sweep can tell an abandoned draft (staged, never posted) apart
 * from a deliberate /create gallery upload. Once linked to a feed post the item gets an
 * `originalFeedPostId`, which protects it from cleanup.
 */
export const FEED_COMPOSER_MEDIA_SURFACE = 'feed_upload' as const

export class FeedComposerMediaError extends Error {
  constructor(
    message: string,
    readonly code = 'feed_composer_media_error',
  ) {
    super(message)
    this.name = 'FeedComposerMediaError'
  }
}

export type PrepareFeedComposerImageInput = {
  userId: string
  quarantineKey: string
  mimeType: string
  sizeBytes: number
  originalFilename?: string
  imageWidth?: number
  imageHeight?: number
}

export type PrepareFeedComposerImageResult = {
  attachment: MediaFeedAttachment
  mediaItemId: string
  mediaPostId: string
  pendingReview: boolean
  message?: string
}

function parseMediaAttachments(raw: unknown): Extract<FeedAttachment, { type: 'media' }>[] {
  if (!Array.isArray(raw)) return []
  const out: Extract<FeedAttachment, { type: 'media' }>[] = []
  for (const entry of raw) {
    const parsed = feedAttachmentSchema.safeParse(entry)
    if (parsed.success && parsed.data.type === 'media') out.push(parsed.data)
  }
  return out
}

/** Stage a quarantined image in the user's gallery and return a feed attachment draft. */
export async function prepareFeedComposerImageAttachment(
  input: PrepareFeedComposerImageInput,
): Promise<PrepareFeedComposerImageResult> {
  await assertPersonalPhotoQuotaRoom(input.userId, 1)

  const profile = await ensureProfileForUserId(input.userId)
  await ensureDefaultAlbumsForUser(input.userId)

  const mediaAssetId = await createMediaAssetForUpload({
    userId: input.userId,
    ownerType: 'profile',
    ownerId: profile.id,
    sourceSurface: FEED_COMPOSER_MEDIA_SURFACE,
    quarantineKey: input.quarantineKey,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    originalFilename: input.originalFilename,
    imageWidth: input.imageWidth,
    imageHeight: input.imageHeight,
  })

  const published = await autoPublishProfileGalleryPhoto({ mediaAssetId, userId: input.userId })
  if (published.outcome === 'rejected') {
    await rejectProfileGalleryMediaAsset(mediaAssetId)
    throw new FeedComposerMediaError(
      published.error ?? 'This image cannot be posted to the feed.',
      'feed_image_blocked',
    )
  }

  const asset = (await getMediaAssetById(mediaAssetId))!
  const now = new Date()
  const [itemRow] = await db
    .insert(schema.mediaItems)
    .values({
      ownerUserId: input.userId,
      mediaAssetId,
      mediaKind: 'image',
      visibility: MEDIA_VISIBILITIES.loggedIn,
      commentPolicy: 'connections',
      showInFeed: true,
      pinnedToProfile: false,
      useAsAvatar: false,
      contentRating: MEDIA_CONTENT_RATINGS.safePublic,
      sourceSurface: FEED_COMPOSER_MEDIA_SURFACE,
      updatedAt: now,
    })
    .returning()

  const [mediaPost] = await db
    .insert(schema.mediaPosts)
    .values({
      ownerUserId: input.userId,
      caption: null,
      visibility: MEDIA_VISIBILITIES.loggedIn,
      commentPolicy: 'connections',
      showInFeed: true,
      updatedAt: now,
    })
    .returning()

  await db.insert(schema.mediaPostItems).values({
    mediaPostId: mediaPost!.id,
    mediaItemId: itemRow!.id,
    sortOrder: 0,
  })

  const albums = await db
    .select()
    .from(schema.mediaAlbums)
    .where(and(eq(schema.mediaAlbums.ownerUserId, input.userId), isNull(schema.mediaAlbums.deletedAt)))

  const uploadedAlbum = albums.find((a) => a.albumKind === 'uploaded_pictures')
  const allAlbum = albums.find((a) => a.albumKind === 'default_all')
  for (const albumId of [uploadedAlbum?.id, allAlbum?.id].filter(Boolean)) {
    await db
      .insert(schema.mediaAlbumItems)
      .values({ albumId: albumId!, mediaItemId: itemRow!.id, sortOrder: 0 })
      .onConflictDoNothing()
  }

  const preview = await shapeMediaItemPreview(itemRow!, asset, input.userId)
  const pendingReview =
    published.outcome === 'pending_review' ||
    isProfilePhotoPendingReviewStatus(published.uploadStatus) ||
    published.uploadStatus === MEDIA_UPLOAD_STATUSES.pendingAttestation

  const attachment: MediaFeedAttachment = {
    type: 'media',
    mediaKind: 'image',
    mediaItemId: itemRow!.id,
    mediaAssetId,
    previewUrl: preview?.previewUrl ?? mediaContentProxyPath(mediaAssetId),
    blurredPreviewUrl: preview?.blurredPreviewUrl ?? null,
    width: asset.imageWidth ?? input.imageWidth ?? null,
    height: asset.imageHeight ?? input.imageHeight ?? null,
    isBlurredByDefault: preview?.isBlurredByDefault ?? false,
    contentRating: MEDIA_CONTENT_RATINGS.safePublic,
    visibility: MEDIA_VISIBILITIES.loggedIn,
  }

  return {
    attachment,
    mediaItemId: itemRow!.id,
    mediaPostId: mediaPost!.id,
    pendingReview,
    message: pendingReview ? 'Photo is pending review and may appear after moderation.' : undefined,
  }
}

/** After the feed status post is created, link staged gallery media to that post. */
export async function linkFeedPostToStagedMediaAttachments(params: {
  userId: string
  feedPostId: string
  attachments: unknown
  now?: Date
}): Promise<void> {
  const mediaAttachments = parseMediaAttachments(params.attachments)
  if (!mediaAttachments.length) return

  const mediaItemIds = mediaAttachments.map((attachment) => attachment.mediaItemId)
  const ownedItems = await db
    .select({ id: schema.mediaItems.id, mediaKind: schema.mediaItems.mediaKind })
    .from(schema.mediaItems)
    .where(
      and(
        inArray(schema.mediaItems.id, mediaItemIds),
        eq(schema.mediaItems.ownerUserId, params.userId),
        isNull(schema.mediaItems.deletedAt),
      ),
    )

  if (ownedItems.length !== mediaItemIds.length) {
    throw new FeedComposerMediaError('One or more media attachments are invalid.', 'feed_media_forbidden')
  }

  const now = params.now ?? new Date()
  await db
    .update(schema.mediaItems)
    .set({ originalFeedPostId: params.feedPostId, showInFeed: true, updatedAt: now })
    .where(
      and(
        inArray(schema.mediaItems.id, mediaItemIds),
        eq(schema.mediaItems.ownerUserId, params.userId),
      ),
    )

  const postItemRows = await db
    .select({ mediaPostId: schema.mediaPostItems.mediaPostId })
    .from(schema.mediaPostItems)
    .where(inArray(schema.mediaPostItems.mediaItemId, mediaItemIds))

  const mediaPostIds = [...new Set(postItemRows.map((row) => row.mediaPostId))]
  if (mediaPostIds.length) {
    await db
      .update(schema.mediaPosts)
      .set({ feedPostId: params.feedPostId, updatedAt: now })
      .where(
        and(
          inArray(schema.mediaPosts.id, mediaPostIds),
          eq(schema.mediaPosts.ownerUserId, params.userId),
        ),
      )
  }

  const privacyRow = await ensureUserSettingsRow(params.userId)
  const privacy = normalizePrivacySettings(privacyRow.privacySettings)
  if (!privacy.mediaSettings.includeMediaUploadsInActivityFeed) return

  for (const mediaPostId of mediaPostIds) {
    emitActivity({
      actorId: params.userId,
      verb: ownedItems.length === 1 ? 'uploaded_picture' : 'uploaded_media',
      objectType: 'media_post',
      objectId: mediaPostId,
      metadata: {
        feedPostId: params.feedPostId,
        mediaItemIds,
        mediaKind: 'image',
      },
    })
  }
}

export function mapFeedComposerMediaError(err: unknown): { status: number; body: Record<string, unknown> } {
  if (err instanceof PersonalPhotoQuotaError) {
    return { status: 403, body: { error: err.message, code: err.code, quota: err.quota } }
  }
  if (err instanceof FeedComposerMediaError) {
    const status = err.code === 'feed_media_forbidden' ? 403 : 400
    return { status, body: { error: err.message, code: err.code } }
  }
  if (err instanceof MediaSocialError) {
    return { status: 400, body: { error: err.message, code: err.code } }
  }
  throw err
}
