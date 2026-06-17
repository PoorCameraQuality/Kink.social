import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { notificationActorKey } from './notification-privacy.js'

describe('notificationActorKey', () => {
  it('resolves dm_request actor by user id', () => {
    const actor = notificationActorKey('dm_request', { fromUserId: 'u1' })
    assert.deepEqual(actor, { kind: 'userId', userId: 'u1' })
  })

  it('resolves connection request actor by username', () => {
    const actor = notificationActorKey('connection_request', { requesterUsername: 'alex' })
    assert.deepEqual(actor, { kind: 'username', username: 'alex' })
  })

  it('returns null for unrelated types', () => {
    assert.equal(notificationActorKey('event_rsvp_confirmed_virtual', { eventId: 'e1' }), null)
  })
})
