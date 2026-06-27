import { and, count, eq, inArray, isNull, or } from 'drizzle-orm'
import { db, schema } from '../db/index.js'

export type DiscoveryProfileStats = {
  photoCount: number
  videoCount: number
  writingCount: number
  groupsLedCount: number
}

const EMPTY_STATS: DiscoveryProfileStats = {
  photoCount: 0,
  videoCount: 0,
  writingCount: 0,
  groupsLedCount: 0,
}

function rowsToCountMap(rows: { userId: string; n: number }[]): Map<string, number> {
  return new Map(rows.map((r) => [r.userId, Number(r.n)]))
}

/** Public-ish activity counts for people directory cards (batch). */
export async function loadDiscoveryProfileStats(userIds: string[]): Promise<Map<string, DiscoveryProfileStats>> {
  if (userIds.length === 0) return new Map()

  const [photoRows, videoRows, feedRows, articleRows, groupLeadRows] = await Promise.all([
    db
      .select({
        userId: schema.mediaItems.ownerUserId,
        n: count(schema.mediaItems.id).as('n'),
      })
      .from(schema.mediaItems)
      .where(
        and(
          inArray(schema.mediaItems.ownerUserId, userIds),
          eq(schema.mediaItems.mediaKind, 'image'),
          isNull(schema.mediaItems.deletedAt),
        ),
      )
      .groupBy(schema.mediaItems.ownerUserId),
    db
      .select({
        userId: schema.mediaItems.ownerUserId,
        n: count(schema.mediaItems.id).as('n'),
      })
      .from(schema.mediaItems)
      .where(
        and(
          inArray(schema.mediaItems.ownerUserId, userIds),
          eq(schema.mediaItems.mediaKind, 'video'),
          isNull(schema.mediaItems.deletedAt),
        ),
      )
      .groupBy(schema.mediaItems.ownerUserId),
    db
      .select({
        userId: schema.feedPosts.authorId,
        n: count(schema.feedPosts.id).as('n'),
      })
      .from(schema.feedPosts)
      .where(inArray(schema.feedPosts.authorId, userIds))
      .groupBy(schema.feedPosts.authorId),
    db
      .select({
        userId: schema.educationArticles.authorUserId,
        n: count(schema.educationArticles.id).as('n'),
      })
      .from(schema.educationArticles)
      .where(
        and(
          inArray(schema.educationArticles.authorUserId, userIds),
          eq(schema.educationArticles.publicationStatus, 'PUBLISHED'),
        ),
      )
      .groupBy(schema.educationArticles.authorUserId),
    db
      .select({
        userId: schema.groupMembers.userId,
        n: count(schema.groupMembers.id).as('n'),
      })
      .from(schema.groupMembers)
      .where(
        and(
          inArray(schema.groupMembers.userId, userIds),
          or(
            eq(schema.groupMembers.role, 'owner'),
            eq(schema.groupMembers.role, 'admin'),
            eq(schema.groupMembers.role, 'moderator'),
          ),
        ),
      )
      .groupBy(schema.groupMembers.userId),
  ])

  const photos = rowsToCountMap(photoRows.map((r) => ({ userId: r.userId, n: Number(r.n) })))
  const videos = rowsToCountMap(videoRows.map((r) => ({ userId: r.userId, n: Number(r.n) })))
  const feeds = rowsToCountMap(feedRows.map((r) => ({ userId: r.userId, n: Number(r.n) })))
  const articles = rowsToCountMap(articleRows.map((r) => ({ userId: r.userId, n: Number(r.n) })))
  const groupsLed = rowsToCountMap(groupLeadRows.map((r) => ({ userId: r.userId, n: Number(r.n) })))

  const out = new Map<string, DiscoveryProfileStats>()
  for (const userId of userIds) {
    out.set(userId, {
      photoCount: photos.get(userId) ?? 0,
      videoCount: videos.get(userId) ?? 0,
      writingCount: (feeds.get(userId) ?? 0) + (articles.get(userId) ?? 0),
      groupsLedCount: groupsLed.get(userId) ?? 0,
    })
  }
  return out
}

export function mergeDiscoveryProfileStats(
  card: { userId: string },
  statsMap: Map<string, DiscoveryProfileStats>,
): DiscoveryProfileStats {
  return statsMap.get(card.userId) ?? EMPTY_STATS
}
