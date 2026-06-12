import { and, eq, or } from 'drizzle-orm'
import { db, schema } from '../db/index.js'

/** True if either user has blocked the other. */
export async function isBlockedPair(userIdA: string, userIdB: string): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.blocks.id })
    .from(schema.blocks)
    .where(
      or(
        and(eq(schema.blocks.blockerId, userIdA), eq(schema.blocks.blockedId, userIdB)),
        and(eq(schema.blocks.blockerId, userIdB), eq(schema.blocks.blockedId, userIdA))
      )
    )
    .limit(1)
  return Boolean(row)
}

export async function loadBlockedUserIds(blockerId: string): Promise<Set<string>> {
  const rows = await db
    .select({ blockedId: schema.blocks.blockedId })
    .from(schema.blocks)
    .where(eq(schema.blocks.blockerId, blockerId))
  return new Set(rows.map((r) => r.blockedId))
}
