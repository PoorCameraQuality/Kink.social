/** Parse control-plane ECKE overview responses for compact status widgets. */

export type EckeControlPlaneSummary = {
  bridgeConnected: boolean
  aggregateStatus: 'never' | 'draft' | 'published' | 'error' | 'stale' | null
  externalSlug: string | null
  lastPublishedAt: string | null
  lastPreviewAt: string | null
  lastError: string | null
}

type HistoryRow = {
  targetKind?: string
  externalSlug?: string
  status?: string
  lastPublishedAt?: string | null
  lastPreviewAt?: string | null
  lastError?: string | null
}

type OverviewCard = {
  status?: string
  preview?: { status?: string; lastPreviewAt?: string | null }
}

export function parseEckeControlPlaneSummary(payload: {
  bridgeConnected?: boolean
  history?: HistoryRow[]
  cards?: OverviewCard[]
}): EckeControlPlaneSummary {
  const bridgeConnected = Boolean(payload.bridgeConnected)
  const history = payload.history ?? []

  const errorRow = history.find((r) => r.status === 'error')
  const publishedRow = history.find((r) => r.status === 'published')
  const staleRow = history.find((r) => r.status === 'stale')
  const draftRow = history.find((r) => r.status === 'draft')
  const previewRow = history.find((r) => r.lastPreviewAt)

  const cardStatus = payload.cards?.find((c) => c.status)?.status
  const aggregateStatus =
    errorRow ? 'error'
    : staleRow ? 'stale'
    : publishedRow ? 'published'
    : draftRow ? 'draft'
    : previewRow ? 'draft'
    : cardStatus === 'published' ? 'published'
    : cardStatus === 'draft' ? 'draft'
    : cardStatus === 'error' ? 'error'
    : cardStatus === 'stale' ? 'stale'
    : history.length ? 'never'
    : null

  const best = errorRow ?? staleRow ?? publishedRow ?? draftRow ?? previewRow ?? history[0]

  return {
    bridgeConnected,
    aggregateStatus: aggregateStatus as EckeControlPlaneSummary['aggregateStatus'],
    externalSlug: best?.externalSlug ?? null,
    lastPublishedAt: best?.lastPublishedAt ?? null,
    lastPreviewAt: best?.lastPreviewAt ?? null,
    lastError: errorRow?.lastError ?? null,
  }
}
