import { eq, inArray } from 'drizzle-orm'
import { db, schema } from '../db/index.js'

export type HubPushChannel = 'announcements' | 'chat'

/** Pinned convention user ids who opted in for this hub push channel (default on when no prefs row). */
export async function filterPinnedUsersForHubPush(
  userIds: string[],
  channel: HubPushChannel,
): Promise<string[]> {
  if (userIds.length === 0) return []
  const unique = [...new Set(userIds)]
  const prefs = await db
    .select({
      userId: schema.userNotificationPreferences.userId,
      announcements: schema.userNotificationPreferences.pushHubAnnouncements,
      chat: schema.userNotificationPreferences.pushHubChat,
    })
    .from(schema.userNotificationPreferences)
    .where(inArray(schema.userNotificationPreferences.userId, unique))

  const prefByUser = new Map(prefs.map((p) => [p.userId, p]))
  return unique.filter((id) => {
    const row = prefByUser.get(id)
    if (!row) return true
    return channel === 'announcements' ? row.announcements : row.chat
  })
}
