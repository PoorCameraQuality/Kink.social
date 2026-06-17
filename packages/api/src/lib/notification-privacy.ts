import { inArray } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import { loadBlockedUserIds, loadUserIdsWhoBlockedUser } from './blocks.js'

type NotificationRow = {
  id: string
  type: string
  payload: unknown
}

/** Resolve actor user id from a social notification payload when possible. */
export function notificationActorKey(
  type: string,
  payload: Record<string, unknown>,
): { kind: 'userId'; userId: string } | { kind: 'username'; username: string } | null {
  if (type === 'dm_request' && typeof payload.fromUserId === 'string') {
    return { kind: 'userId', userId: payload.fromUserId }
  }
  if (type === 'connection_request' && typeof payload.requesterUsername === 'string') {
    return { kind: 'username', username: payload.requesterUsername }
  }
  if (type === 'connection_accepted' && typeof payload.accepterUsername === 'string') {
    return { kind: 'username', username: payload.accepterUsername }
  }
  if (type === 'new_message' && typeof payload.senderUsername === 'string') {
    return { kind: 'username', username: payload.senderUsername }
  }
  return null
}

export async function filterNotificationsForViewer<T extends NotificationRow>(
  viewerId: string,
  rows: T[],
): Promise<T[]> {
  const blocked = new Set([
    ...(await loadBlockedUserIds(viewerId)),
    ...(await loadUserIdsWhoBlockedUser(viewerId)),
  ])
  if (blocked.size === 0) return rows

  const usernames = new Set<string>()
  for (const row of rows) {
    const payload = (row.payload ?? {}) as Record<string, unknown>
    const actor = notificationActorKey(row.type, payload)
    if (actor?.kind === 'username') usernames.add(actor.username)
  }

  const usernameToId = new Map<string, string>()
  if (usernames.size > 0) {
    const users = await db
      .select({ id: schema.users.id, username: schema.users.username })
      .from(schema.users)
      .where(inArray(schema.users.username, [...usernames]))
    for (const user of users) usernameToId.set(user.username, user.id)
  }

  return rows.filter((row) => {
    const payload = (row.payload ?? {}) as Record<string, unknown>
    const actor = notificationActorKey(row.type, payload)
    if (!actor) return true
    const actorId =
      actor.kind === 'userId' ? actor.userId : (usernameToId.get(actor.username) ?? null)
    if (!actorId) return true
    return !blocked.has(actorId)
  })
}
