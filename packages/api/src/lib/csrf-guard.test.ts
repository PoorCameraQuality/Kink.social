import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { SESSION_COOKIE_NAME } from '@c2k/shared/session-token'
import { enforceCookieCsrf } from './csrf-guard.js'

function mockReply() {
  let statusCode = 200
  let body: unknown
  return {
    reply: {
      status(code: number) {
        statusCode = code
        return this
      },
      send(payload: unknown) {
        body = payload
        return this
      },
    } as never,
    get status() {
      return statusCode
    },
    get body() {
      return body
    },
  }
}

describe('enforceCookieCsrf', () => {
  test('allows GET with session cookie', () => {
    const { reply } = mockReply()
    const ok = enforceCookieCsrf(
      {
        method: 'GET',
        url: '/api/profile/me',
        cookies: { [SESSION_COOKIE_NAME]: 'x' },
        headers: {},
      } as never,
      reply,
    )
    assert.equal(ok, true)
  })

  test('blocks POST with session cookie and no Origin', () => {
    const mock = mockReply()
    const ok = enforceCookieCsrf(
      {
        method: 'POST',
        url: '/api/feed/posts',
        cookies: { [SESSION_COOKIE_NAME]: 'x' },
        headers: {},
      } as never,
      mock.reply,
    )
    assert.equal(ok, false)
    assert.equal(mock.status, 403)
    assert.equal((mock.body as { code?: string }).code, 'csrf_missing_origin')
  })

  test('blocks cross-site POST with session cookie', () => {
    const mock = mockReply()
    const ok = enforceCookieCsrf(
      {
        method: 'POST',
        url: '/api/feed/posts',
        cookies: { [SESSION_COOKIE_NAME]: 'x' },
        headers: { 'sec-fetch-site': 'cross-site' },
      } as never,
      mock.reply,
    )
    assert.equal(ok, false)
    assert.equal(mock.status, 403)
    assert.equal((mock.body as { code?: string }).code, 'csrf_cross_site')
  })

  test('allows POST with matching Origin', () => {
    const prev = process.env.CORS_ORIGIN
    process.env.CORS_ORIGIN = 'https://kink.social'
    const { reply } = mockReply()
    const ok = enforceCookieCsrf(
      {
        method: 'POST',
        url: '/api/feed/posts',
        cookies: { [SESSION_COOKIE_NAME]: 'x' },
        headers: { origin: 'https://kink.social', 'sec-fetch-site': 'same-origin' },
      } as never,
      reply,
    )
    assert.equal(ok, true)
    if (prev !== undefined) process.env.CORS_ORIGIN = prev
    else delete process.env.CORS_ORIGIN
  })

  test('exempts auth routes', () => {
    const { reply } = mockReply()
    const ok = enforceCookieCsrf(
      {
        method: 'POST',
        url: '/api/auth/session',
        cookies: {},
        headers: {},
      } as never,
      reply,
    )
    assert.equal(ok, true)
  })
})
