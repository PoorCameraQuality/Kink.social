import multipart from '@fastify/multipart'
import type { FastifyInstance } from 'fastify'
import { resolveViewerFromRequest } from '../auth/resolve-viewer.js'
import {
  alphaUploadDisabledResponse,
  isAlphaUploadDisabled,
  parseUploadPurpose,
} from '../lib/alpha-upload-policy.js'
import { rateLimitRoute } from '../lib/rate-limit-config.js'
import {
  MediaUploadValidationError,
  processIncomingImageUpload,
  processIncomingVideoUpload,
} from '../lib/media-pipeline.js'

function useDatabase(): boolean {
  return process.env.USE_DATABASE === 'true'
}

export async function registerUploadRoutes(app: FastifyInstance) {
  await app.register(multipart, { limits: { fileSize: 100 * 1024 * 1024 } })

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

    const parts = req.parts()
    for await (const part of parts) {
      if (part.type === 'field' && part.fieldname === 'purpose') {
        purposeRaw = part.value
      } else if (part.type === 'file' && part.fieldname === 'file') {
        buffer = await part.toBuffer()
        filename = part.filename || filename
        declaredMime = part.mimetype
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

    if (!buffer) {
      return reply.status(400).send({ error: 'No file' })
    }

    try {
      const isVideo =
        (declaredMime ?? '').startsWith('video/') ||
        purpose === 'feed_video' ||
        /\.(mp4|webm)$/i.test(filename)
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
        status: 'quarantined',
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
