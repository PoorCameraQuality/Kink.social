import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getViewerUserId } from '../auth/viewer-user-id.js'
import { resolveViewerFromRequest } from '../auth/resolve-viewer.js'
import {
  getEckePublishPreview,
  getEckePublishRegistryForViewer,
  getEckePublishStatus,
  getGroupEckePublishOverview,
  isValidEckeSourceKind,
  publishEckeSource,
  syncEckeSource,
  unpublishEckeSource,
  type EckePublishViewer,
} from '../lib/ecke-publish-service.js'
import { listAllRegistryEntries } from '../lib/ecke-publish-registry.js'

function useDatabase(): boolean {
  return process.env.USE_DATABASE === 'true'
}

function requireDb(reply: FastifyReply): boolean {
  if (!useDatabase()) {
    reply.status(503).send({ error: 'Set USE_DATABASE=true for this endpoint' })
    return false
  }
  return true
}

function requireViewer(req: FastifyRequest, reply: FastifyReply): EckePublishViewer | null {
  const v = resolveViewerFromRequest(req)
  if (!v.authenticated || !v.payload?.sub) {
    reply.status(401).send({ error: 'Unauthorized' })
    return null
  }
  const userId = getViewerUserId(v.payload)
  if (!userId) {
    reply.status(401).send({ error: 'Invalid session' })
    return null
  }
  return { userId }
}

export async function registerEckePublishControlRoutes(app: FastifyInstance) {
  app.get('/api/v1/ecke-publish/registry', async (req, reply) => {
    const viewer = requireViewer(req, reply)
    if (!viewer) return

    const groupId = (req.query as { groupId?: string }).groupId?.trim()
    const entries =
      groupId ?
        getEckePublishRegistryForViewer(viewer, { kind: 'group', groupId })
      : listAllRegistryEntries()

    return reply.send({
      readOnlyPass: true,
      entries,
    })
  })

  app.get('/api/v1/ecke-publish/status', async (req, reply) => {
    if (!requireDb(reply)) return
    const viewer = requireViewer(req, reply)
    if (!viewer) return

    const { sourceKind, sourceId } = req.query as { sourceKind?: string; sourceId?: string }
    if (!sourceKind?.trim() || !sourceId?.trim()) {
      return reply.status(400).send({ error: 'sourceKind and sourceId are required' })
    }
    if (!isValidEckeSourceKind(sourceKind)) {
      return reply.status(400).send({ error: 'Unknown sourceKind' })
    }

    const result = await getEckePublishStatus(viewer, sourceKind, sourceId.trim())
    if (!result.ok) {
      return reply.status(result.status).send({ error: result.error })
    }
    return reply.send(result.result)
  })

  app.get('/api/v1/ecke-publish/preview', async (req, reply) => {
    if (!requireDb(reply)) return
    const viewer = requireViewer(req, reply)
    if (!viewer) return

    const { sourceKind, sourceId } = req.query as { sourceKind?: string; sourceId?: string }
    if (!sourceKind?.trim() || !sourceId?.trim()) {
      return reply.status(400).send({ error: 'sourceKind and sourceId are required' })
    }
    if (!isValidEckeSourceKind(sourceKind)) {
      return reply.status(400).send({ error: 'Unknown sourceKind' })
    }

    const result = await getEckePublishPreview(viewer, sourceKind, sourceId.trim())
    if (!result.ok) {
      return reply.status(result.status).send({ error: result.error })
    }
    return reply.send(result.result)
  })

  app.get('/api/v1/groups/:groupId/ecke-publish', async (req, reply) => {
    if (!requireDb(reply)) return
    const viewer = requireViewer(req, reply)
    if (!viewer) return
    const { groupId } = req.params as { groupId: string }

    const result = await getGroupEckePublishOverview(viewer, groupId)
    if (!result.ok) {
      return reply.status(result.status).send({ error: result.error })
    }
    return reply.send(result.result)
  })

  app.get('/api/v1/groups/:groupId/ecke-publish/preview', async (req, reply) => {
    if (!requireDb(reply)) return
    const viewer = requireViewer(req, reply)
    if (!viewer) return
    const { groupId } = req.params as { groupId: string }
    const sourceKind = (req.query as { sourceKind?: string }).sourceKind?.trim() || 'group_listing'
    const sourceId = (req.query as { sourceId?: string }).sourceId?.trim() || groupId

    if (!isValidEckeSourceKind(sourceKind)) {
      return reply.status(400).send({ error: 'Unknown sourceKind' })
    }

    const result = await getEckePublishPreview(viewer, sourceKind, sourceId)
    if (!result.ok) {
      return reply.status(result.status).send({ error: result.error })
    }
    return reply.send(result.result)
  })

  async function handleWriteAction(
    req: FastifyRequest,
    reply: FastifyReply,
    action: 'publish' | 'sync' | 'unpublish',
    sourceKind: string,
    sourceId: string,
    expectedGroupId?: string,
  ) {
    if (!requireDb(reply)) return null
    const viewer = requireViewer(req, reply)
    if (!viewer) return null
    if (!isValidEckeSourceKind(sourceKind)) {
      reply.status(400).send({ error: 'Unknown sourceKind' })
      return null
    }
    const runner =
      action === 'publish' ? publishEckeSource
      : action === 'sync' ? syncEckeSource
      : unpublishEckeSource
    const result = await runner(viewer, {
      sourceKind: sourceKind as import('../lib/ecke-publish-registry.js').EckeSourceKind,
      sourceId: sourceId.trim(),
      expectedGroupId,
    })
    if (!result.ok) {
      reply.status(result.status).send({ error: result.error, errorCode: result.errorCode })
      return null
    }
    return result.result
  }

  function resolveGroupScopedWrite(
    groupId: string,
    body: { sourceKind?: string; sourceId?: string },
  ): { sourceKind: string; sourceId: string } | { error: string } {
    const sourceKind = body.sourceKind?.trim() || 'group_listing'
    if (sourceKind === 'group_listing') {
      return { sourceKind, sourceId: groupId }
    }
    if (sourceKind === 'event_listing') {
      const sourceId = body.sourceId?.trim()
      if (!sourceId) return { error: 'sourceId is required for event_listing' }
      return { sourceKind, sourceId }
    }
    return { error: 'Unsupported sourceKind for group-scoped ECKE publish' }
  }

  app.post('/api/v1/ecke-publish/publish', async (req, reply) => {
    const body = req.body as { sourceKind?: string; sourceId?: string }
    if (!body.sourceKind?.trim() || !body.sourceId?.trim()) {
      return reply.status(400).send({ error: 'sourceKind and sourceId are required' })
    }
    const result = await handleWriteAction(req, reply, 'publish', body.sourceKind, body.sourceId)
    if (result) return reply.send(result)
  })

  app.post('/api/v1/ecke-publish/sync', async (req, reply) => {
    const body = req.body as { sourceKind?: string; sourceId?: string }
    if (!body.sourceKind?.trim() || !body.sourceId?.trim()) {
      return reply.status(400).send({ error: 'sourceKind and sourceId are required' })
    }
    const result = await handleWriteAction(req, reply, 'sync', body.sourceKind, body.sourceId)
    if (result) return reply.send(result)
  })

  app.post('/api/v1/ecke-publish/unpublish', async (req, reply) => {
    const body = req.body as { sourceKind?: string; sourceId?: string }
    if (!body.sourceKind?.trim() || !body.sourceId?.trim()) {
      return reply.status(400).send({ error: 'sourceKind and sourceId are required' })
    }
    const result = await handleWriteAction(req, reply, 'unpublish', body.sourceKind, body.sourceId)
    if (result) return reply.send(result)
  })

  app.post('/api/v1/groups/:groupId/ecke-publish/publish', async (req, reply) => {
    const { groupId } = req.params as { groupId: string }
    const body = (req.body ?? {}) as { sourceKind?: string; sourceId?: string }
    const resolved = resolveGroupScopedWrite(groupId, body)
    if ('error' in resolved) return reply.status(400).send({ error: resolved.error })
    const result = await handleWriteAction(req, reply, 'publish', resolved.sourceKind, resolved.sourceId, groupId)
    if (result) return reply.send(result)
  })

  app.post('/api/v1/groups/:groupId/ecke-publish/sync', async (req, reply) => {
    const { groupId } = req.params as { groupId: string }
    const body = (req.body ?? {}) as { sourceKind?: string; sourceId?: string }
    const resolved = resolveGroupScopedWrite(groupId, body)
    if ('error' in resolved) return reply.status(400).send({ error: resolved.error })
    const result = await handleWriteAction(req, reply, 'sync', resolved.sourceKind, resolved.sourceId, groupId)
    if (result) return reply.send(result)
  })

  app.post('/api/v1/groups/:groupId/ecke-publish/unpublish', async (req, reply) => {
    const { groupId } = req.params as { groupId: string }
    const body = (req.body ?? {}) as { sourceKind?: string; sourceId?: string }
    const resolved = resolveGroupScopedWrite(groupId, body)
    if ('error' in resolved) return reply.status(400).send({ error: resolved.error })
    const result = await handleWriteAction(req, reply, 'unpublish', resolved.sourceKind, resolved.sourceId, groupId)
    if (result) return reply.send(result)
  })
}
