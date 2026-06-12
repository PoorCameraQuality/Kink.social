import { Queue } from 'bullmq'
import {
  executeEckePublishArticle,
  executeEckePublishConventionEvent,
  executeEckePublishVendor,
  type EckePublishJobName,
} from './ecke-publish-executor.js'

export const ECKE_PUBLISH_QUEUE_NAME = 'c2k-ecke-publish'

let eckePublishQueue: Queue | null = null

export function getEckePublishQueue(): Queue {
  if (!eckePublishQueue) {
    eckePublishQueue = new Queue(ECKE_PUBLISH_QUEUE_NAME, {
      connection: { url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379' },
    })
  }
  return eckePublishQueue
}

async function enqueueOrInline(
  jobName: EckePublishJobName,
  data: Record<string, string | undefined>,
  jobId: string,
): Promise<void> {
  if (process.env.C2K_ECKE_PUBLISH_INLINE === 'true') {
    await runEckePublishJob(jobName, data)
    return
  }
  try {
    await getEckePublishQueue().add(jobName, data, {
      jobId,
      removeOnComplete: 200,
      removeOnFail: 100,
    })
  } catch (err) {
    console.warn('[ecke-publish] queue enqueue failed. Inline fallback', err)
    await runEckePublishJob(jobName, data)
  }
}

export async function requestEckeArticlePublish(articleId: string, userId?: string): Promise<void> {
  await enqueueOrInline('publish-article', { articleId, userId }, `ecke-article:${articleId}`)
}

export async function requestEckeVendorPublish(vendorProfileId: string, userId?: string): Promise<void> {
  await enqueueOrInline('publish-vendor', { vendorProfileId, userId }, `ecke-vendor:${vendorProfileId}`)
}

export async function requestEckeConventionEventPublish(conventionId: string, userId?: string): Promise<void> {
  await enqueueOrInline(
    'publish-convention-event',
    { conventionId, userId },
    `ecke-convention-event:${conventionId}`,
  )
}

export async function runEckePublishJob(
  jobName: EckePublishJobName,
  data: Record<string, string | undefined>,
): Promise<void> {
  switch (jobName) {
    case 'publish-article':
      if (!data.articleId) throw new Error('publish-article missing articleId')
      await executeEckePublishArticle(data.articleId, data.userId)
      return
    case 'publish-vendor':
      if (!data.vendorProfileId) throw new Error('publish-vendor missing vendorProfileId')
      await executeEckePublishVendor(data.vendorProfileId, data.userId)
      return
    case 'publish-convention-event':
      if (!data.conventionId) throw new Error('publish-convention-event missing conventionId')
      await executeEckePublishConventionEvent(data.conventionId, data.userId)
      return
    default:
      console.warn('[ecke-publish] unknown job', jobName)
  }
}
