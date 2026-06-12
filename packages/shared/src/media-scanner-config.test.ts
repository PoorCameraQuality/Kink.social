import assert from 'node:assert/strict'
import { afterEach, describe, test } from 'node:test'
import {
  mediaScannerAllowNoopEnabled,
  mediaScannerStrictModeEnabled,
  readMediaScannerStartupConfig,
  resolveMalwareScannerMode,
  resolveMediaScannerRuntimeProfile,
} from './media-scanner-config.js'

const ENV_KEYS = [
  'NODE_ENV',
  'C2K_ENV',
  'MEDIA_SCANNER_STRICT_MODE',
  'MEDIA_SCANNER_ALLOW_NOOP',
  'MEDIA_SCANNER_MALWARE',
] as const

const saved: Record<string, string | undefined> = {}

describe('media-scanner-config', () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  })

  test('production defaults strict on and noop off', () => {
    for (const key of ENV_KEYS) saved[key] = process.env[key]
    process.env.NODE_ENV = 'production'
    delete process.env.MEDIA_SCANNER_STRICT_MODE
    delete process.env.MEDIA_SCANNER_ALLOW_NOOP
    assert.equal(resolveMediaScannerRuntimeProfile(), 'production')
    assert.equal(mediaScannerStrictModeEnabled(), true)
    assert.equal(mediaScannerAllowNoopEnabled(), false)
    assert.equal(resolveMalwareScannerMode(), 'clamav')
  })

  test('local defaults allow noop', () => {
    for (const key of ENV_KEYS) saved[key] = process.env[key]
    process.env.NODE_ENV = 'development'
    delete process.env.C2K_ENV
    delete process.env.MEDIA_SCANNER_ALLOW_NOOP
    assert.equal(mediaScannerAllowNoopEnabled(), true)
  })

  test('readMediaScannerStartupConfig surfaces flags', () => {
    const config = readMediaScannerStartupConfig()
    assert.ok('strictMode' in config)
    assert.ok('malwareMode' in config)
  })
})
