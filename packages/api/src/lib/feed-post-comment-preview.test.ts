import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  pickLatestVisibleCommentPreviews,
  shapeCommentPreview,
  truncateCommentBodyPreview,
} from './feed-post-comment-preview.js'

describe('feed post comment preview helpers', () => {
  it('truncates long comment bodies for card preview', () => {
    const body = 'a'.repeat(200)
    const out = truncateCommentBodyPreview(body, 120)
    assert.equal(out.length, 120)
    assert.ok(out.endsWith('…'))
  })

  it('skips comments from blocked authors when picking preview', () => {
    const rows = [
      {
        id: 'c1',
        postId: 'p1',
        authorId: 'blocked-user',
        authorUsername: 'blocked',
        authorAvatarUrl: null,
        body: 'hidden reply',
        createdAt: '2026-06-17T12:00:00.000Z',
      },
      {
        id: 'c2',
        postId: 'p1',
        authorId: 'visible-user',
        authorUsername: 'visible',
        authorAvatarUrl: null,
        body: 'visible reply',
        createdAt: '2026-06-17T11:00:00.000Z',
      },
    ]
    const previews = pickLatestVisibleCommentPreviews(rows, new Set(['blocked-user']))
    assert.equal(previews.size, 1)
    const preview = previews.get('p1')
    assert.ok(preview)
    assert.equal(preview!.id, 'c2')
    assert.equal(preview!.authorUsername, 'visible')
    assert.equal(preview!.bodyPreview, 'visible reply')
  })

  it('returns no preview when only blocked authors commented', () => {
    const rows = [
      {
        id: 'c1',
        postId: 'p1',
        authorId: 'blocked-user',
        authorUsername: 'blocked',
        authorAvatarUrl: null,
        body: 'hidden reply',
        createdAt: '2026-06-17T12:00:00.000Z',
      },
    ]
    const previews = pickLatestVisibleCommentPreviews(rows, new Set(['blocked-user']))
    assert.equal(previews.size, 0)
  })

  it('shapes preview DTO with display name and trimmed body', () => {
    const preview = shapeCommentPreview({
      id: 'c1',
      postId: 'p1',
      authorId: 'u1',
      authorUsername: 'brax',
      authorAvatarUrl: null,
      body: '  hello   world  ',
      createdAt: '2026-06-17T12:00:00.000Z',
    })
    assert.equal(preview.authorDisplayName, 'brax')
    assert.equal(preview.bodyPreview, 'hello world')
  })
})
