/**
 * Remove all alpha-ecke-demo seeded content in dependency-safe order.
 * Run: USE_DATABASE=true npm run db:clear:alpha:ecke -w @c2k/api
 */
import { and, eq, inArray } from 'drizzle-orm'
import './load-dev-env.js'
import { ALPHA_ECKE_BATCH_KEY, getAlphaSeedBatchId, listAlphaSeedTargetIds } from '../lib/alpha-seed-labels.js'
import { assertAlphaSeedAllowed } from '../lib/alpha-seed-guard.js'
import { db, schema } from './index.js'

async function clearAlphaSeedBatch(batchKey: string = ALPHA_ECKE_BATCH_KEY) {
  const batchId = await getAlphaSeedBatchId(batchKey)
  if (!batchId) {
    console.log(`No alpha seed batch "${batchKey}" found. Nothing to clear.`)
    return
  }

  const byType = async (targetType: string) => listAlphaSeedTargetIds(batchId, targetType)

  const forumPostIds = await byType('forum_post')
  const forumThreadIds = await byType('forum_thread')
  const hubMessageIds = await byType('convention_hub_message')
  const hubChannelIds = await byType('convention_hub_channel')
  const scheduleSlotIds = await byType('schedule_slot')
  const feedPostIds = await byType('feed_post')
  const productIds = await byType('product')
  const vendorProfileIds = await byType('vendor_profile')
  const communityPlaceIds = await byType('community_place')
  const eventIds = await byType('event')
  const conventionIds = await byType('convention')
  const organizationIds = await byType('organization')
  const educationSeriesIds = await byType('education_article_series')
  const educationArticleIds = await byType('education_article')
  const userIds = await byType('user')

  let removed = 0

  if (forumPostIds.length) {
    await db.delete(schema.forumPosts).where(inArray(schema.forumPosts.id, forumPostIds))
    removed += forumPostIds.length
    console.log(`Removed ${forumPostIds.length} forum posts`)
  }

  if (forumThreadIds.length) {
    await db.delete(schema.forumThreads).where(inArray(schema.forumThreads.id, forumThreadIds))
    removed += forumThreadIds.length
    console.log(`Removed ${forumThreadIds.length} forum threads`)
  }

  if (hubMessageIds.length) {
    await db.delete(schema.conventionHubChannelMessages).where(inArray(schema.conventionHubChannelMessages.id, hubMessageIds))
    removed += hubMessageIds.length
    console.log(`Removed ${hubMessageIds.length} hub messages`)
  }

  if (hubChannelIds.length) {
    await db.delete(schema.conventionHubChannels).where(inArray(schema.conventionHubChannels.id, hubChannelIds))
    removed += hubChannelIds.length
    console.log(`Removed ${hubChannelIds.length} hub channels`)
  }

  if (scheduleSlotIds.length) {
    await db.delete(schema.scheduleSlots).where(inArray(schema.scheduleSlots.id, scheduleSlotIds))
    removed += scheduleSlotIds.length
    console.log(`Removed ${scheduleSlotIds.length} schedule slots`)
  }

  if (feedPostIds.length) {
    await db.delete(schema.feedActivities).where(
      and(
        eq(schema.feedActivities.objectType, 'feed_post'),
        inArray(schema.feedActivities.objectId, feedPostIds),
      ),
    )
    await db.delete(schema.feedPosts).where(inArray(schema.feedPosts.id, feedPostIds))
    removed += feedPostIds.length
    console.log(`Removed ${feedPostIds.length} feed posts`)
  }

  if (eventIds.length) {
    await db.delete(schema.eventRsvps).where(inArray(schema.eventRsvps.eventId, eventIds))
    await db.delete(schema.events).where(inArray(schema.events.id, eventIds))
    removed += eventIds.length
    console.log(`Removed ${eventIds.length} events (and their RSVPs)`)
  }

  if (productIds.length) {
    await db.delete(schema.products).where(inArray(schema.products.id, productIds))
    removed += productIds.length
    console.log(`Removed ${productIds.length} products`)
  }

  if (vendorProfileIds.length) {
    await db.delete(schema.vendorProfiles).where(inArray(schema.vendorProfiles.id, vendorProfileIds))
    removed += vendorProfileIds.length
    console.log(`Removed ${vendorProfileIds.length} vendor profiles`)
  }

  if (communityPlaceIds.length) {
    await db.delete(schema.communityPlaces).where(inArray(schema.communityPlaces.id, communityPlaceIds))
    removed += communityPlaceIds.length
    console.log(`Removed ${communityPlaceIds.length} community places`)
  }

  if (conventionIds.length) {
    await db.delete(schema.conventions).where(inArray(schema.conventions.id, conventionIds))
    removed += conventionIds.length
    console.log(`Removed ${conventionIds.length} conventions`)
  }

  if (educationSeriesIds.length) {
    await db
      .delete(schema.educationArticleSeriesItems)
      .where(inArray(schema.educationArticleSeriesItems.seriesId, educationSeriesIds))
    await db.delete(schema.educationArticleSeries).where(inArray(schema.educationArticleSeries.id, educationSeriesIds))
    removed += educationSeriesIds.length
    console.log(`Removed ${educationSeriesIds.length} education series`)
  }

  if (educationArticleIds.length) {
    await db.delete(schema.educationArticles).where(inArray(schema.educationArticles.id, educationArticleIds))
    removed += educationArticleIds.length
    console.log(`Removed ${educationArticleIds.length} education articles`)
  }

  if (organizationIds.length) {
    await db.delete(schema.organizations).where(inArray(schema.organizations.id, organizationIds))
    removed += organizationIds.length
    console.log(`Removed ${organizationIds.length} organizations`)
  }

  if (userIds.length) {
    const seedUsers = await db
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(inArray(schema.users.id, userIds))
    const deletable = seedUsers
      .filter((u) => {
        const email = u.email ?? ''
        return email.endsWith('@ecke-seed.local') || email.endsWith('@ecke-vendor.local')
      })
      .map((u) => u.id)
    if (deletable.length) {
      await db.delete(schema.users).where(inArray(schema.users.id, deletable))
      removed += deletable.length
      console.log(`Removed ${deletable.length} demo persona/vendor users`)
    }
  }

  await db.delete(schema.alphaSeedItems).where(eq(schema.alphaSeedItems.batchId, batchId))
  await db.delete(schema.alphaSeedBatches).where(eq(schema.alphaSeedBatches.id, batchId))

  console.log(`Alpha seed batch "${batchKey}" cleared (${removed} primary entities + registry).`)
}

async function main() {
  if (process.env.USE_DATABASE !== 'true') {
    console.error('Set USE_DATABASE=true to clear alpha seed.')
    process.exit(1)
  }
  assertAlphaSeedAllowed()
  await clearAlphaSeedBatch(process.env.ALPHA_SEED_BATCH_KEY ?? ALPHA_ECKE_BATCH_KEY)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
