import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import {
  allowAuthFallback,
  isAuthFallbackExplicitlyEnabled,
  isProductionRuntime,
} from './production-guard.js'

const ENV_KEYS = ['NODE_ENV', 'C2K_ENV', 'AUTH_ALLOW_FALLBACK', 'VITE_AUTH_ALLOW_FALLBACK'] as const

function saveEnv(): Record<string, string | undefined> {
  const saved: Record<string, string | undefined> = {}
  for (const key of ENV_KEYS) saved[key] = process.env[key]
  return saved
}

function restoreEnv(saved: Record<string, string | undefined>): void {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key]
    else process.env[key] = saved[key]
  }
}

describe('production-guard', () => {
  let saved: Record<string, string | undefined>

  afterEach(() => {
    restoreEnv(saved)
  })

  it('isProductionRuntime is true when NODE_ENV or C2K_ENV is production', () => {
    saved = saveEnv()
    delete process.env.C2K_ENV
    process.env.NODE_ENV = 'production'
    assert.equal(isProductionRuntime(), true)

    process.env.NODE_ENV = 'development'
    process.env.C2K_ENV = 'production'
    assert.equal(isProductionRuntime(), true)
  })

  it('allowAuthFallback is always false in production', () => {
    saved = saveEnv()
    process.env.NODE_ENV = 'production'
    delete process.env.AUTH_ALLOW_FALLBACK
    delete process.env.VITE_AUTH_ALLOW_FALLBACK
    assert.equal(allowAuthFallback(), false)

    process.env.AUTH_ALLOW_FALLBACK = 'true'
    assert.equal(allowAuthFallback(), false)
  })

  it('allowAuthFallback defaults on in non-production unless explicitly false', () => {
    saved = saveEnv()
    process.env.NODE_ENV = 'development'
    delete process.env.AUTH_ALLOW_FALLBACK
    delete process.env.VITE_AUTH_ALLOW_FALLBACK
    assert.equal(allowAuthFallback(), true)

    process.env.AUTH_ALLOW_FALLBACK = 'false'
    assert.equal(allowAuthFallback(), false)
  })

  it('isAuthFallbackExplicitlyEnabled only when env is literally true', () => {
    saved = saveEnv()
    process.env.NODE_ENV = 'development'
    delete process.env.AUTH_ALLOW_FALLBACK
    assert.equal(isAuthFallbackExplicitlyEnabled(), false)

    process.env.AUTH_ALLOW_FALLBACK = 'true'
    assert.equal(isAuthFallbackExplicitlyEnabled(), true)

    process.env.AUTH_ALLOW_FALLBACK = 'false'
    assert.equal(isAuthFallbackExplicitlyEnabled(), false)
  })
})
