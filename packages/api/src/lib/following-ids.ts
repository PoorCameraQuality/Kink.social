import { loadAcceptedFriendUserIds } from './accepted-friends.js'
import { loadFollowingUserIds } from './follows.js'

export const MAX_FOLLOWING_IDS = 2000

/** Self, one-way follows, and accepted connections - capped for pull-feed queries. */
export async function followingIds(viewerId: string): Promise<string[]> {
  const [friends, follows] = await Promise.all([
    loadAcceptedFriendUserIds(viewerId),
    loadFollowingUserIds(viewerId),
  ])
  const merged = new Set<string>([viewerId, ...friends, ...follows])
  const ids = [...merged]
  if (ids.length > MAX_FOLLOWING_IDS) {
    console.warn(`[following] truncating ${ids.length} ids to ${MAX_FOLLOWING_IDS}`)
    return ids.slice(0, MAX_FOLLOWING_IDS)
  }
  return ids
}
