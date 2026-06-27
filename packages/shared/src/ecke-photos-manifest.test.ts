import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, test } from 'node:test'
import {
  emptyEckePhotosManifest,
  hashMediaManifest,
  resolveEckePayloadHeroUrl,
  type EckePhotosManifest,
} from './ecke-photos-manifest.js'

const fixturePath = join(fileURLToPath(new URL('.', import.meta.url)), '../fixtures/ecke-photos-manifest-v1.sample.json')

describe('ecke-photos-manifest', () => {
  test('hashMediaManifest is stable for gallery order', () => {
    const a = {
      manifestVersion: 1 as const,
      hero: {
        sourceMediaAssetId: '11111111-1111-4111-8111-111111111111',
        role: 'hero' as const,
        ordinal: 0,
        publicUrl: 'https://cdn.example/a.jpg',
        width: 100,
        height: 50,
        sha256Hash: 'abc',
        altText: null,
      },
      gallery: [
        {
          sourceMediaAssetId: '22222222-2222-4222-8222-222222222222',
          role: 'gallery' as const,
          ordinal: 1,
          publicUrl: 'https://cdn.example/b.jpg',
          width: null,
          height: null,
          sha256Hash: null,
          altText: null,
        },
      ],
    }
    const b = { ...a, gallery: [...a.gallery] }
    assert.equal(hashMediaManifest(a), hashMediaManifest(b))
  })

  test('resolveEckePayloadHeroUrl prefers manifest', () => {
    assert.equal(
      resolveEckePayloadHeroUrl({
        photos: {
          manifestVersion: 1,
          hero: {
            sourceMediaAssetId: '11111111-1111-4111-8111-111111111111',
            role: 'hero',
            ordinal: 0,
            publicUrl: 'https://cdn.example/manifest.jpg',
            width: null,
            height: null,
            sha256Hash: null,
            altText: null,
          },
          gallery: [],
        },
        legacyHeroUrl: 'https://cdn.example/legacy.jpg',
      }),
      'https://cdn.example/manifest.jpg',
    )
  })

  test('empty manifest hashes consistently', () => {
    assert.ok(hashMediaManifest(emptyEckePhotosManifest()))
  })

  test('v1 sample fixture is a valid cross-repo contract', () => {
    const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as EckePhotosManifest
    assert.equal(fixture.manifestVersion, 1)
    assert.ok(fixture.hero?.publicUrl)
    assert.equal(fixture.gallery.length, 1)
    assert.ok(hashMediaManifest(fixture))
    assert.equal(
      resolveEckePayloadHeroUrl({ photos: fixture, legacyHeroUrl: 'https://legacy.example/x.jpg' }),
      fixture.hero?.publicUrl,
    )
  })
})
