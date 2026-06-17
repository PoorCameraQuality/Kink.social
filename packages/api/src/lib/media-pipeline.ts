import { createHash, randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import {
  MEDIA_STORAGE_STATES,
  MEDIA_UPLOAD_STATUSES,
  SCAN_STATUSES,
  isMediaPublishedStatus,
  isPublicStorageState,
  type MediaPublishLane,
  type MediaUploadStatus,
  type ScanStatus,
  type ScannerResultRecord,
} from '@c2k/shared'
import { db, schema } from '../db/index.js'
import type { MediaAsset } from '../db/schema.js'
import { defaultMediaScanner, type MediaScannerAdapter } from './media-scanner.js'
import { sanitizeImageBuffer } from './media-sanitize.js'
import {
  defaultBucket,
  getS3Client,
  promoteQuarantineToPublic,
  publicMediaObjectKey,
  publicUrlForKey,
  isBrowserReachablePublicUrl,
  putObject,
  quarantineObjectKey,
} from './s3-upload.js'
import {
  validateImageUploadBuffer,
  validationErrorMessage,
  type AllowedImageMime,
} from './media-upload-validate.js'
import { explicitMediaAllowsPublicUrl } from './media-visibility.js'
import type { MediaContentRating, MediaVisibility } from '@c2k/shared'

export class MediaUploadValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MediaUploadValidationError'
  }
}

export type ProcessedUploadResult = {
  quarantineKey: string
  sha256Hash: string
  mimeType: string
  sizeBytes: number
  width: number
  height: number
  storageBucket: string
  exifStripped: boolean
}

function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

function extensionFromMime(mime: AllowedImageMime): string {
  if (mime === 'image/jpeg') return '.jpg'
  if (mime === 'image/png') return '.png'
  if (mime === 'image/webp') return '.webp'
  return '.gif'
}

/** Validate, sanitize, hash, and store upload in quarantine prefix - no public URL. */
export async function processIncomingImageUpload(params: {
  userId: string
  buffer: Buffer
  filename: string
  declaredMime?: string | null
}): Promise<ProcessedUploadResult> {
  const validation = await validateImageUploadBuffer(
    params.buffer,
    params.filename,
    params.declaredMime,
  )
  if (!validation.ok) {
    throw new MediaUploadValidationError(validationErrorMessage(validation))
  }

  let sanitized
  try {
    sanitized = await sanitizeImageBuffer(params.buffer, validation.detectedMime)
  } catch {
    throw new MediaUploadValidationError('Could not read image file')
  }

  const objectId = randomUUID()
  const ext = validation.extension
  const quarantineKey = quarantineObjectKey(params.userId, objectId, ext)
  const hash = sha256(sanitized.buffer)
  const bucket = defaultBucket()

  const client = getS3Client()
  if (!client && process.env.MEDIA_PIPELINE_ALLOW_NO_S3 !== '1') {
    throw new MediaUploadValidationError('Upload storage is not configured')
  }

  if (client) {
    await putObject(client, {
      Bucket: bucket,
      Key: quarantineKey,
      Body: sanitized.buffer,
      ContentType: sanitized.mimeType,
    })
  }

  return {
    quarantineKey,
    sha256Hash: hash,
    mimeType: sanitized.mimeType,
    sizeBytes: sanitized.buffer.length,
    width: sanitized.width,
    height: sanitized.height,
    storageBucket: bucket,
    exifStripped: sanitized.exifStripped,
  }
}

const ALLOWED_VIDEO_MIMES = new Set(['video/mp4', 'video/webm'])

/** Store video in quarantine without transcoding (alpha). */
export async function processIncomingVideoUpload(params: {
  userId: string
  buffer: Buffer
  filename: string
  declaredMime?: string | null
}): Promise<Omit<ProcessedUploadResult, 'exifStripped' | 'width' | 'height'> & { width: number; height: number; exifStripped: false }> {
  const mime = (params.declaredMime ?? '').toLowerCase()
  if (!ALLOWED_VIDEO_MIMES.has(mime)) {
    throw new MediaUploadValidationError('Video must be MP4 or WebM')
  }
  if (params.buffer.length > 100 * 1024 * 1024) {
    throw new MediaUploadValidationError('Video file is too large (max 100MB)')
  }

  const hash = sha256(params.buffer)
  const ext = mime === 'video/webm' ? '.webm' : '.mp4'
  const quarantineKey = quarantineObjectKey(params.userId, randomUUID(), ext)
  const bucket = defaultBucket()
  const client = getS3Client()

  if (!client && process.env.MEDIA_PIPELINE_ALLOW_NO_S3 !== '1') {
    throw new MediaUploadValidationError('Upload storage is not configured')
  }

  if (client) {
    await putObject(client, {
      Bucket: bucket,
      Key: quarantineKey,
      Body: params.buffer,
      ContentType: mime,
    })
  }

  return {
    quarantineKey,
    sha256Hash: hash,
    mimeType: mime,
    sizeBytes: params.buffer.length,
    width: 0,
    height: 0,
    storageBucket: bucket,
    exifStripped: false,
  }
}

export function resolveMediaServingKey(asset: MediaAsset): string | null {
  if (asset.publicStorageKey && isPublicStorageState(asset.storageState)) {
    return asset.publicStorageKey
  }
  if (asset.quarantineStorageKey && !isPublicStorageState(asset.storageState)) {
    return asset.quarantineStorageKey
  }
  if (asset.storageKey.startsWith('http://') || asset.storageKey.startsWith('https://')) {
    return isPublicStorageState(asset.storageState) || isMediaPublishedStatus(asset.uploadStatus as MediaUploadStatus)
      ? asset.storageKey
      : null
  }
  return asset.storageKey
}

export function resolveMediaPublicUrl(asset: MediaAsset): string | null {
  if (!isPublicStorageState(asset.storageState) && asset.storageState !== null) {
    if (asset.storageKey.startsWith('http') && isMediaPublishedStatus(asset.uploadStatus as MediaUploadStatus)) {
      return isBrowserReachablePublicUrl(asset.storageKey) ? asset.storageKey : null
    }
    if (!asset.publicStorageKey) return null
  }
  const key = asset.publicStorageKey ?? (asset.storageKey.startsWith('http') ? null : asset.storageKey)
  if (!key || key.startsWith('http')) {
    return key?.startsWith('http') && isBrowserReachablePublicUrl(key) ? key : null
  }
  const url = publicUrlForKey(key, asset.storageBucket ?? undefined)
  return url && isBrowserReachablePublicUrl(url) ? url : null
}

export function mediaContentProxyPath(mediaAssetId: string): string {
  return `/api/v1/media/assets/${mediaAssetId}/content`
}

/** Promote a quarantined scope-branding upload (group/org banner, logo, share) to a public URL. */
export async function promoteQuarantineToScopeBrandingUrl(params: {
  userId: string
  quarantineKey: string
  scopePath: string
  assetName: 'banner' | 'logo' | 'share'
}): Promise<string> {
  const expectedPrefix = `quarantine/${params.userId}/`
  if (!params.quarantineKey.startsWith(expectedPrefix)) {
    throw new MediaUploadValidationError('Invalid upload reference')
  }
  const extMatch = params.quarantineKey.match(/(\.[a-z0-9]+)$/i)
  const ext = extMatch?.[1] ?? '.jpg'
  const objectId = randomUUID()
  const publicKey = `${params.scopePath}/${params.assetName}-${objectId}${ext}`
  const bucket = defaultBucket()
  const client = getS3Client()
  if (!client && process.env.MEDIA_PIPELINE_ALLOW_NO_S3 !== '1') {
    throw new MediaUploadValidationError('Upload storage is not configured')
  }
  if (client) {
    await promoteQuarantineToPublic(client, params.quarantineKey, publicKey, bucket)
  }
  const publicUrl = publicUrlForKey(publicKey, bucket)
  if (!publicUrl) {
    throw new MediaUploadValidationError('Upload succeeded but no public URL is configured')
  }
  return publicUrl
}

export type MediaScanRunResult = {
  status: ScanStatus
  scannerResults: ScannerResultRecord[]
}

export async function runMediaScan(
  asset: MediaAsset,
  scanner: MediaScannerAdapter = defaultMediaScanner,
): Promise<MediaScanRunResult> {
  await db
    .update(schema.mediaAssets)
    .set({ scanStatus: SCAN_STATUSES.running, updatedAt: new Date() })
    .where(eq(schema.mediaAssets.id, asset.id))

  const result = await scanner.scan({
    mediaAssetId: asset.id,
    sha256Hash: asset.sha256Hash,
    mimeType: asset.mimeType,
    quarantineStorageKey: asset.quarantineStorageKey,
    contentRating: asset.contentRating,
    visibility: asset.visibility,
    originalFilename: asset.originalFilename,
  })

  await db
    .update(schema.mediaAssets)
    .set({ scanStatus: result.status, updatedAt: new Date() })
    .where(eq(schema.mediaAssets.id, asset.id))

  return {
    status: result.status,
    scannerResults: result.scannerSummary ?? [],
  }
}

export async function promoteMediaAssetToPublic(params: {
  mediaAssetId: string
  promotedByUserId: string
}): Promise<MediaAsset | null> {
  const [asset] = await db
    .select()
    .from(schema.mediaAssets)
    .where(eq(schema.mediaAssets.id, params.mediaAssetId))
    .limit(1)
  if (!asset) return null

  const quarantineKey = asset.quarantineStorageKey ?? asset.storageKey
  if (!quarantineKey || quarantineKey.startsWith('http')) {
    const now = new Date()
    const [updated] = await db
      .update(schema.mediaAssets)
      .set({
        storageState: MEDIA_STORAGE_STATES.approvedPublic,
        promotedAt: now,
        promotedByUserId: params.promotedByUserId,
        updatedAt: now,
      })
      .where(eq(schema.mediaAssets.id, params.mediaAssetId))
      .returning()
    return updated ?? null
  }

  const ext = extensionFromMime(asset.mimeType as AllowedImageMime)
  const publicKey = publicMediaObjectKey(asset.uploaderUserId, asset.id, ext)
  const bucket = asset.storageBucket ?? defaultBucket()
  const client = getS3Client()

  if (client) {
    await promoteQuarantineToPublic(client, quarantineKey, publicKey, bucket)
  }

  const publicUrl = publicUrlForKey(publicKey, bucket)
  const now = new Date()

  const [updated] = await db
    .update(schema.mediaAssets)
    .set({
      publicStorageKey: publicKey,
      storageKey: publicKey,
      storageState: MEDIA_STORAGE_STATES.approvedPublic,
      promotedAt: now,
      promotedByUserId: params.promotedByUserId,
      updatedAt: now,
    })
    .where(eq(schema.mediaAssets.id, params.mediaAssetId))
    .returning()

  if (updated && publicUrl) {
    const photoRows = await db
      .update(schema.profilePhotos)
      .set({ url: publicUrl })
      .where(eq(schema.profilePhotos.mediaAssetId, params.mediaAssetId))
      .returning({ profileId: schema.profilePhotos.profileId, sortOrder: schema.profilePhotos.sortOrder })
    const primary = photoRows.find((row) => row.sortOrder === 0) ?? photoRows[0]
    if (primary?.profileId) {
      await db
        .update(schema.profiles)
        .set({ avatarUrl: publicUrl, updatedAt: new Date() })
        .where(eq(schema.profiles.id, primary.profileId))
    }
  }

  return updated ?? null
}

export type FinalizeAfterAttestationResult = {
  uploadStatus: MediaUploadStatus
  scanStatus: ScanStatus
  storageState: string
  promoted: boolean
  scannerResults: ScannerResultRecord[]
}

/** Run scan + promotion after T&S-2 attestation lane decision. */
export async function finalizeMediaAfterAttestation(params: {
  mediaAssetId: string
  userId: string
  lane: MediaPublishLane
  uploadStatus: MediaUploadStatus
}): Promise<FinalizeAfterAttestationResult> {
  const [asset] = await db
    .select()
    .from(schema.mediaAssets)
    .where(eq(schema.mediaAssets.id, params.mediaAssetId))
    .limit(1)
  if (!asset) {
    throw new Error('Media asset not found')
  }

  let uploadStatus = params.uploadStatus
  let storageState = asset.storageState

  if (params.lane === 'RED') {
    await db
      .update(schema.mediaAssets)
      .set({
        storageState: MEDIA_STORAGE_STATES.rejectedPrivate,
        scanStatus: SCAN_STATUSES.failed,
        updatedAt: new Date(),
      })
      .where(eq(schema.mediaAssets.id, params.mediaAssetId))
    return {
      uploadStatus,
      scanStatus: SCAN_STATUSES.failed,
      storageState: MEDIA_STORAGE_STATES.rejectedPrivate,
      promoted: false,
      scannerResults: [],
    }
  }

  const scanRun = await runMediaScan(asset)
  const scanStatus = scanRun.status

  if (scanStatus === SCAN_STATUSES.error) {
    uploadStatus = MEDIA_UPLOAD_STATUSES.pendingScan
    await db
      .update(schema.mediaAssets)
      .set({
        uploadStatus,
        storageState: MEDIA_STORAGE_STATES.quarantinedPrivate,
        updatedAt: new Date(),
      })
      .where(eq(schema.mediaAssets.id, params.mediaAssetId))
    return {
      uploadStatus,
      scanStatus,
      storageState: MEDIA_STORAGE_STATES.quarantinedPrivate,
      promoted: false,
      scannerResults: scanRun.scannerResults,
    }
  }

  if (scanStatus === SCAN_STATUSES.flagged || scanStatus === SCAN_STATUSES.failed) {
    uploadStatus = MEDIA_UPLOAD_STATUSES.quarantined
    storageState = MEDIA_STORAGE_STATES.quarantinedPrivate
    await db
      .update(schema.mediaAssets)
      .set({
        uploadStatus,
        storageState,
        updatedAt: new Date(),
      })
      .where(eq(schema.mediaAssets.id, params.mediaAssetId))
    return { uploadStatus, scanStatus, storageState, promoted: false, scannerResults: scanRun.scannerResults }
  }

  if (
    params.lane === 'GREEN' &&
    uploadStatus === MEDIA_UPLOAD_STATUSES.autoApproved &&
    scanStatus === SCAN_STATUSES.passed
  ) {
    await promoteMediaAssetToPublic({
      mediaAssetId: params.mediaAssetId,
      promotedByUserId: params.userId,
    })
    await db
      .update(schema.mediaAssets)
      .set({
        uploadStatus,
        scanStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.mediaAssets.id, params.mediaAssetId))
    return {
      uploadStatus,
      scanStatus,
      storageState: MEDIA_STORAGE_STATES.approvedPublic,
      promoted: true,
      scannerResults: scanRun.scannerResults,
    }
  }

  storageState = MEDIA_STORAGE_STATES.quarantinedPrivate
  await db
    .update(schema.mediaAssets)
    .set({
      storageState,
      updatedAt: new Date(),
    })
    .where(eq(schema.mediaAssets.id, params.mediaAssetId))

  return { uploadStatus, scanStatus, storageState, promoted: false, scannerResults: scanRun.scannerResults }
}

export function canExposePublicUrl(asset: MediaAsset): boolean {
  if (!isPublicStorageState(asset.storageState) || !resolveMediaPublicUrl(asset)) return false
  const rating = asset.contentRating as MediaContentRating | null
  const visibility = asset.visibility as MediaVisibility | null
  if (rating && visibility && !explicitMediaAllowsPublicUrl(rating, visibility)) {
    return false
  }
  return true
}
