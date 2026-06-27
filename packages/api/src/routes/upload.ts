import multipart, { type MultipartFile } from '@fastify/multipart'
import type { FastifyInstance } from 'fastify'
import { MAX_IMAGE_UPLOAD_BYTES } from '@c2k/shared'
import { resolveViewerFromRequest } from '../auth/resolve-viewer.js'
import {
  alphaUploadDisabledResponse,
  isAlphaUploadDisabled,
  parseUploadPurpose,
  type AlphaUploadCategory,
} from '../lib/alpha-upload-policy.js'
import { readMultipartFileWithLimit } from '../lib/multipart-read-limit.js'
import { rateLimitRoute } from '../lib/rate-limit-config.js'
import {
  MediaUploadValidationError,
  processIncomingImageUpload,
  processIncomingVideoUpload,
} from '../lib/media-pipeline.js'

const MAX_VIDEO_UPLOAD_BYTES = 100 * 1024 * 1024

function useDatabase(): boolean {
  return process.env.USE_DATABASE === 'true'
}

function isVideoUpload(
  purpose: AlphaUploadCategory | null,
  declaredMime: string | undefined,
  filename: string,
): boolean {
  return (
    (declaredMime ?? '').startsWith('video/') ||
    purpose === 'feed_video' ||
    /\.(mp4|webm)$/i.test(filename)
  )
}

export async function registerUploadRoutes(app: FastifyInstance) {
  await app.register(multipart, { limits: { fileSize: MAX_VIDEO_UPLOAD_BYTES } })

  app.post('/api/upload', { ...rateLimitRoute('upload') }, async (req, reply) => {
    if (!useDatabase()) {
      return reply.status(503).send({ error: 'Upload requires USE_DATABASE=true' })
    }
    const viewer = resolveViewerFromRequest(req)
    if (!viewer.authenticated || !viewer.payload?.sub) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    let purposeRaw: unknown
    let buffer: Buffer | null = null
    let filename = 'upload.jpg'
    let declaredMime: string | undefined
    let filePart: MultipartFile | null = null
    let readBeforePurpose = false

    for await (const part of req.parts()) {
      if (part.type === 'field' && part.fieldname === 'purpose') {
        purposeRaw = part.value
      } else if (part.type === 'file' && part.fieldname === 'file') {
        filename = part.filename || filename
        declaredMime = part.mimetype
        if (parseUploadPurpose(purposeRaw)) {
          filePart = part
        } else {
          // Purpose field may arrive after file — read with video cap so the iterator can continue.
          buffer = await readMultipartFileWithLimit(part, MAX_VIDEO_UPLOAD_BYTES)
          readBeforePurpose = true
        }
      }
    }

    const purpose = parseUploadPurpose(purposeRaw)
    if (!purpose) {
      return reply.status(400).send({
        error: 'Upload purpose is required',
        code: 'upload_purpose_required',
      })
    }
    if (isAlphaUploadDisabled(purpose)) {
      return alphaUploadDisabledResponse(reply, purpose)
    }

    const isVideo = isVideoUpload(purpose, declaredMime, filename)

    if (!buffer && filePart) {
      const maxBytes = isVideo ? MAX_VIDEO_UPLOAD_BYTES : MAX_IMAGE_UPLOAD_BYTES
      buffer = await readMultipartFileWithLimit(filePart, maxBytes)
    } else if (buffer && readBeforePurpose && !isVideo && buffer.length > MAX_IMAGE_UPLOAD_BYTES) {
      return reply.status(400).send({
        error: `File exceeds maximum size (${MAX_IMAGE_UPLOAD_BYTES} bytes)`,
      })
    }

    if (!buffer) {
      return reply.status(400).send({ error: 'No file' })
    }

    try {
      const processed = isVideo
        ? await processIncomingVideoUpload({
            userId: viewer.payload.sub,
            buffer,
            filename,
            declaredMime,
          })
        : await processIncomingImageUpload({
            userId: viewer.payload.sub,
            buffer,
            filename,
            declaredMime,
          })

      return reply.send({
        key: processed.quarantineKey,
        quarantineKey: processed.quarantineKey,
        sha256: processed.sha256Hash,
        mimeType: processed.mimeType,
        sizeBytes: processed.sizeBytes,
        width: processed.width,
        height: processed.height,
        exifStripped: processed.exifStripped,
        status: 'staged',
        url: null,
        contentUrl: null,
      })
    } catch (err) {
      if (err instanceof MediaUploadValidationError) {
        return reply.status(400).send({ error: err.message })
      }
      const e = err as { name?: string; message?: string }
      req.log?.error({ err }, '/api/upload failed')
      return reply.status(502).send({
        error: `Upload failed (${e.name ?? 'Unknown'}): ${e.message ?? 'storage error'}`,
      })
    }
  })
}
