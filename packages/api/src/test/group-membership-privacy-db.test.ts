/**
 * DB smoke: hidden group join skips feed activity; member list filtering for strangers vs staff.
 * Gated on CI_API_INTEGRATION_DB or CI_NOTIFICATIONS_DB (see check-db workflow).
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { after, before, describe, test } from 'node:test'
import { and, eq } from 'drizzle-orm'
import { db, schema } from '../db/index.js'
import {
  buildCookieApp,
  cookieHeader,
  insertCiUser,
  runDbIntegration,
} from './ci-db-harness.js'

describe('group membership privacy (DB)', { skip: !runDbIntegration }, () => {
  const tag = randomUUID().slice(0, 8)
  const groupId = randomUUID()
  const userIds: string[] = []
  let ownerId = ''
  let joinerId = ''
  let strangerId = ''
  let ownerUsername = ''
  let joinerUsername = ''
  let prevInline: string | undefined

  before(() => {
    prevInline = process.env.C2K_FEED_ACTIVITIES_INLINE
    process.env.C2K_FEED_ACTIVITIES_INLINE = 'true'
    process.env.USE_DATABASE = 'true'
  })

  after(async () => {
    process.env.C2K_FEED_ACTIVITIES_INLINE = prevInline
    await db.delete(schema.feedActivities).where(eq(schema.feedActivities.objectId, groupId))
    await db.delete(schema.groupMembers).where(eq(schema.groupMembers.groupId, groupId))
    await db.delete(schema.groups).where(eq(schema.groups.id, groupId))
    for (const userId of userIds) {
      await db.delete(schema.feedActivities).where(eq(schema.feedActivities.actorId, userId))
      await db.delete(schema.profiles).where(eq(schema.profiles.userId, userId))
      await db.delete(schema.userSettings).where(eq(schema.userSettings.userId, userId))
      await db.delete(schema.users).where(eq(schema.users.id, userId))
    }
  })

  test('hidden join emits no feed activity; member list respects visibility', async () => {
    const owner = await insertCiUser(`${tag}_owner`)
    const joiner = await insertCiUser(`${tag}_joiner`)
    const stranger = await insertCiUser(`${tag}_stranger`)
    ownerId = owner.id
    joinerId = joiner.id
    strangerId = stranger.id
    ownerUsername = owner.username
    joinerUsername = joiner.username
    userIds.push(ownerId, joinerId, strangerId)

    const now = new Date()
    for (const userId of userIds) {
      await db.insert(schema.profiles).values({ userId, displayName: userId.slice(0, 8), updatedAt: now })
    }

    await db.insert(schema.groups).values({
      id: groupId,
      slug: `ci-grp-privacy-${tag}`,
      name: 'CI Privacy Group',
      ownerId,
      visibility: 'public',
    })
    await db.insert(schema.groupMembers).values({
      groupId,
      userId: ownerId,
      role: 'owner',
      memberListVisibility: 'visible',
    })

    const app = await buildCookieApp(async (a) => {
      const { registerEcosystemStubRoutes } = await import('../routes/ecosystem-stubs.js')
      await registerEcosystemStubRoutes(a)
    })

    try {
      const joinRes = await app.inject({
        method: 'POST',
        url: `/api/v1/groups/${groupId}/join`,
        headers: {
          ...cookieHeader(joinerId, joinerUsername),
          'content-type': 'application/json',
        },
        payload: {
          memberListVisibility: 'hidden',
          announceGroupJoinInFeed: false,
          showGroupOnProfile: false,
        },
      })
      assert.equal(joinRes.statusCode, 200)

      const activities = await db
        .select()
        .from(schema.feedActivities)
        .where(
          and(
            eq(schema.feedActivities.actorId, joinerId),
            eq(schema.feedActivities.verb, 'group_join'),
            eq(schema.feedActivities.objectId, groupId),
          ),
        )
      assert.equal(activities.length, 0)

      const strangerView = await app.inject({
        method: 'GET',
        url: `/api/v1/groups/${groupId}`,
        headers: cookieHeader(strangerId, stranger.username),
      })
      assert.equal(strangerView.statusCode, 200)
      const strangerMembers = strangerView.json().members as { userId: string; memberListHidden?: boolean }[]
      assert.ok(!strangerMembers.some((m) => m.userId === joinerId))

      const ownerView = await app.inject({
        method: 'GET',
        url: `/api/v1/groups/${groupId}`,
        headers: cookieHeader(ownerId, ownerUsername),
      })
      assert.equal(ownerView.statusCode, 200)
      const ownerMembers = ownerView.json().members as { userId: string; memberListHidden?: boolean }[]
      const joinerRow = ownerMembers.find((m) => m.userId === joinerId)
      assert.ok(joinerRow)
      assert.equal(joinerRow.memberListHidden, true)
    } finally {
      await app.close()
    }
  })
})
