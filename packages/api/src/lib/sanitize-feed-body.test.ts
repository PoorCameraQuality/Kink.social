import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sanitizeFeedHtml } from './sanitize-feed-body.js'

test('sanitizeFeedHtml strips script tags', () => {
  const out = sanitizeFeedHtml('<p>Hi</p><script>alert(1)</script>')
  assert.equal(out, '<p>Hi</p>')
})

test('sanitizeFeedHtml strips javascript: href', () => {
  const out = sanitizeFeedHtml('<a href="javascript:alert(1)">x</a>')
  assert.equal(out, '<a rel="nofollow noopener noreferrer">x</a>')
})

test('sanitizeFeedHtml allows safe links with rel', () => {
  const out = sanitizeFeedHtml('<a href="https://example.com">link</a>')
  assert.match(out, /href="https:\/\/example\.com"/)
  assert.match(out, /rel="nofollow noopener noreferrer"/)
})

test('sanitizeFeedHtml strips event handlers', () => {
  const out = sanitizeFeedHtml('<p onclick="alert(1)">x</p>')
  assert.equal(out, '<p>x</p>')
})
