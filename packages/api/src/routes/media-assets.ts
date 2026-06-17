import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  depictedPeopleSchema,
  mediaContentRatingSchema,
  mediaVisibilitySchema,
} from '@c2k/shared'
import { resolveViewerFromRequest } from '../auth/resolve-viewer.js'
import { getViewerUserId } from '../auth/viewer-user-id.js'
import {
  createMediaAssetForProfilePhoto,
  getMediaAssetById,
  mediaAssetToPhotoDto,
  submitMediaAttestation,
  MediaAssetAccessError,
  MediaAssetNotFoundError,
  MediaAttestationValidationError,
} from '../lib/media-asset-service.js'
import { getMediaAssetForViewer, loadViewerAdultContentPref, streamMediaAssetContent } from '../lib/media-asset-viewer.js'
import {
  assertMediaContentRatingAllowed,
  MediaPolicyBlockedError,
} from '../lib/media-policy.js'

function useDatabase(): boolean {
  return process.env.USE_DATABASE === 'true'
}

const createBodySchema = z
  .object({
    url: z.string().min(1).max(2048).optional(),
    storageKey: z.string().min(1).max(2048).optional(),
    mimeType: z.string().max(128).optional(),
    sizeBytes: z.number().int().min(0).optional(),
    originalFilename: z.string().max(512).optional(),
    ownerType: z.string().min(1).max(32),
    ownerId: z.string().uuid(),
    sourceSurface: z.string().min(1).max(64),
  })
  .refine((data) => Boolean(data.url?.trim() || data.storageKey?.trim()), {
    message: 'url or storageKey is required',
  })

const attestationBodySchema = z.object({
  contentRating: mediaContentRatingSchema,
  depictedPeople: depictedPeopleSchema,
  visibility: mediaVisibilitySchema,
  uploaderConfirmed18: z.boolean(),
  uploaderConfirmedDepictedAdults18: z.boolean(),
  uploaderConfirmedConsent: z.boolean(),
  uploaderConfirmedRightToUpload: z.boolean(),
  uploaderConfirmedNoNcii: z.boolean(),
  uploaderConfirmedNoMinors: z.boolean(),
  uploaderConfirmedNoHiddenCamera: z.boolean(),
  uploaderConfirmedNoAiDeepfakeWithoutConsent: z.boolean(),
})

export async function registerMediaAssetRoutes(app: FastifyInstance) {
  app.post('/api/v1/media/assets', async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Media assets API requires USE_DATABASE=true' })
    }
    const viewer = resolveViewerFromRequest(req)
    const userId = getViewerUserId(viewer.payload)
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const parsed = createBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body' })
    }
    if (parsed.data.ownerType !== 'profile') {
      return reply.status(400).send({ error: 'Unsupported owner or surface for this endpoint' })
    }
    const allowedSurfaces = new Set(['profile_gallery', 'profile_photo', 'profile_media', 'feed_upload'])
    const sourceSurface =
      parsed.data.sourceSurface === 'profile_photo' ? 'profile_gallery' : parsed.data.sourceSurface
    if (!allowedSurfaces.has(sourceSurface)) {
      return reply.status(400).send({ error: 'Unsupported owner or surface for this endpoint' })
    }
    const quarantineKey = parsed.data.storageKey ?? parsed.data.url
    const mediaAssetId = await createMediaAssetForProfilePhoto({
      userId,
      profileId: parsed.data.ownerId,
      quarantineKey: quarantineKey?.startsWith('http') ? undefined : quarantineKey,
      url: quarantineKey?.startsWith('http') ? quarantineKey : undefined,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      originalFilename: parsed.data.originalFilename,
    })
    const asset = await getMediaAssetById(mediaAssetId)
    const dto = asset ? mediaAssetToPhotoDto(asset) : null
    return reply.status(201).send({
      mediaAsset: asset ? { id: asset.id, ...dto, pendingAttestation: dto?.uploadStatus === 'PENDING_ATTESTATION' } : { id: mediaAssetId },
      asset: asset ? { id: asset.id, ...dto, pendingAttestation: dto?.uploadStatus === 'PENDING_ATTESTATION' } : { id: mediaAssetId },
    })
  })

  app.patch('/api/v1/media/assets/:mediaAssetId/attestation', async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Media assets API requires USE_DATABASE=true' })
    }
    const viewer = resolveViewerFromRequest(req)
    const userId = getViewerUserId(viewer.payload)
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }
    const { mediaAssetId } = req.params as { mediaAssetId: string }
    const parsed = attestationBodySchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid body' })
    }
    const allConfirmed = [
      parsed.data.uploaderConfirmed18,
      parsed.data.uploaderConfirmedDepictedAdults18,
      parsed.data.uploaderConfirmedConsent,
      parsed.data.uploaderConfirmedRightToUpload,
      parsed.data.uploaderConfirmedNoNcii,
      parsed.data.uploaderConfirmedNoMinors,
      parsed.data.uploaderConfirmedNoHiddenCamera,
      parsed.data.uploaderConfirmedNoAiDeepfakeWithoutConsent,
    ].every(Boolean)
    if (!allConfirmed) {
      return reply.status(400).send({ error: 'All attestation checkboxes are required' })
    }
    try {
      assertMediaContentRatingAllowed(parsed.data.contentRating)
      const result = await submitMediaAttestation({
        mediaAssetId,
        userId,
        ...parsed.data,
      })
      const asset = await getMediaAssetById(mediaAssetId)
      const viewed = asset
        ? await getMediaAssetForViewer(mediaAssetId, { userId, adultContentPref: 'SHOW' })
        : null
      return reply.send({
        lane: result.lane,
        uploadStatus: result.uploadStatus,
        moderationCaseId: result.moderationCaseId,
        promoted: result.promoted,
        storageState: result.storageState,
        contentUrl: result.contentUrl,
        mediaAsset: viewed,
        asset: viewed,
      })
    } catch (err) {
      if (err instanceof MediaPolicyBlockedError) {
        return reply.status(403).send({ error: err.message, code: err.code })
      }
      if (err instanceof MediaAttestationValidationError) {
        return reply.status(400).send({ error: err.message })
      }
      if (err instanceof MediaAssetAccessError) {
        return reply.status(403).send({ error: 'Forbidden' })
      }
      if (err instanceof MediaAssetNotFoundError) {
        return reply.status(404).send({ error: 'Media asset not found' })
      }
      throw err
    }
  })

  app.get('/api/v1/media/assets/:mediaAssetId', async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Media assets API requires USE_DATABASE=true' })
    }
    const viewer = resolveViewerFromRequest(req)
    const userId = getViewerUserId(viewer.payload)
    const { mediaAssetId } = req.params as { mediaAssetId: string }
    const adultContentPref = userId ? await loadViewerAdultContentPref(userId) : undefined
    const asset = await getMediaAssetForViewer(mediaAssetId, { userId, adultContentPref })
    if (!asset) {
      return reply.status(404).send({ error: 'Not found' })
    }
    return reply.send({ mediaAsset: asset, asset })
  })

  app.get('/api/v1/media/assets/:mediaAssetId/content', async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Media assets API requires USE_DATABASE=true' })
    }
    const viewer = resolveViewerFromRequest(req)
    const userId = getViewerUserId(viewer.payload)
    const { mediaAssetId } = req.params as { mediaAssetId: string }
    const streamed = await streamMediaAssetContent(mediaAssetId, userId)
    if (!streamed) {
      return reply.status(404).send({ error: 'Not found' })
    }
    return reply.type(streamed.contentType).send(streamed.body)
  })
}
