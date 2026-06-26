import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  MEDIA_CONTENT_RATINGS,
  MEDIA_STORAGE_STATES,
  MEDIA_VISIBILITIES,
  SCAN_STATUSES,
} from '@c2k/shared'
import { canExposePublicUrl, assertQuarantineStorageKeyOwnedByUser, mediaContentProxyPath, MediaUploadValidationError, resolveMediaClientUrl } from './media-pipeline.js'
import type { MediaAsset } from '../db/schema.js'

function fakeAsset(overrides: Partial<MediaAsset> = {}): MediaAsset {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    uploaderUserId: '00000000-0000-4000-8000-000000000002',
    ownerType: 'profile',
    ownerId: '00000000-0000-4000-8000-000000000003',
    sourceSurface: 'profile_gallery',
    storageKey: 'quarantine/u/test.jpg',
    originalStorageKey: null,
    quarantineStorageKey: 'quarantine/u/test.jpg',
    publicStorageKey: null,
    storageState: MEDIA_STORAGE_STATES.quarantinedPrivate,
    storageProvider: 's3',
    storageBucket: 'c2k-uploads',
    originalFilename: null,
    mimeType: 'image/jpeg',
    sizeBytes: 100,
    imageWidth: null,
    imageHeight: null,
    sha256Hash: 'abc',
    perceptualHash: null,
    perceptualHashAlgorithm: null,
    uploadStatus: 'PENDING_ATTESTATION',
    contentRating: null,
    visibility: null,
    depictedPeople: null,
    scanStatus: SCAN_STATUSES.notRequired,
    moderationCaseId: null,
    reportable: true,
    isBlurredByDefault: false,
    uploaderConfirmed18: false,
    uploaderConfirmedDepictedAdults18: false,
    uploaderConfirmedConsent: false,
    uploaderConfirmedRightToUpload: false,
    uploaderConfirmedNoNcii: false,
    uploaderConfirmedNoMinors: false,
    uploaderConfirmedNoHiddenCamera: false,
    uploaderConfirmedNoAiDeepfakeWithoutConsent: false,
    attestedAt: null,
    attestationVersion: null,
    promotedAt: null,
    promotedByUserId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    removedAt: null,
    removedByUserId: null,
    deletionRequestedAt: null,
    deletedAt: null,
    ...overrides,
  } as MediaAsset
}

describe('media-pipeline visibility helpers', () => {
  test('quarantined asset does not expose public URL', () => {
    assert.equal(canExposePublicUrl(fakeAsset()), false)
  })

  test('approved public asset with public key can expose URL when env configured', () => {
    const asset = fakeAsset({
      storageState: MEDIA_STORAGE_STATES.approvedPublic,
      publicStorageKey: 'media/u/photo.jpg',
      uploadStatus: 'AUTO_APPROVED',
      storageKey: 'media/u/photo.jpg',
      contentRating: MEDIA_CONTENT_RATINGS.safePublic,
      visibility: MEDIA_VISIBILITIES.publicPreview,
    })
    assert.equal(canExposePublicUrl(asset), true)
  })

  test('LOGGED_IN visibility does not expose direct public URL even when promoted', () => {
    const asset = fakeAsset({
      storageState: MEDIA_STORAGE_STATES.approvedPublic,
      publicStorageKey: 'media/u/photo.jpg',
      uploadStatus: 'AUTO_APPROVED',
      storageKey: 'media/u/photo.jpg',
      contentRating: MEDIA_CONTENT_RATINGS.safePublic,
      visibility: MEDIA_VISIBILITIES.loggedIn,
    })
    assert.equal(canExposePublicUrl(asset), false)
    assert.equal(resolveMediaClientUrl(asset), mediaContentProxyPath(asset.id))
  })

  test('PUBLIC_PREVIEW visibility may expose direct public URL when promoted', () => {
    const prev = process.env.S3_PUBLIC_BASE_URL
    process.env.S3_PUBLIC_BASE_URL = 'https://example.test/c2k-uploads'
    try {
      const asset = fakeAsset({
        storageState: MEDIA_STORAGE_STATES.approvedPublic,
        publicStorageKey: 'media/u/photo.jpg',
        uploadStatus: 'AUTO_APPROVED',
        storageKey: 'media/u/photo.jpg',
        contentRating: MEDIA_CONTENT_RATINGS.safePublic,
        visibility: MEDIA_VISIBILITIES.publicPreview,
      })
      assert.equal(canExposePublicUrl(asset), true)
      assert.match(resolveMediaClientUrl(asset), /^https:\/\/example\.test\/c2k-uploads\//)
    } finally {
      if (prev === undefined) delete process.env.S3_PUBLIC_BASE_URL
      else process.env.S3_PUBLIC_BASE_URL = prev
    }
  })

  test('explicit on LOGGED_IN does not expose direct public URL', () => {
    const asset = fakeAsset({
      storageState: MEDIA_STORAGE_STATES.approvedPublic,
      publicStorageKey: 'media/u/photo.jpg',
      uploadStatus: 'AUTO_APPROVED',
      storageKey: 'media/u/photo.jpg',
      contentRating: MEDIA_CONTENT_RATINGS.explicitAdult,
      visibility: MEDIA_VISIBILITIES.loggedIn,
    })
    assert.equal(canExposePublicUrl(asset), false)
    assert.equal(resolveMediaClientUrl(asset), mediaContentProxyPath(asset.id))
  })
})

describe('assertQuarantineStorageKeyOwnedByUser', () => {
  const userId = '00000000-0000-4000-8000-0000000000aa'

  test('accepts key under uploader quarantine prefix', () => {
    assert.doesNotThrow(() =>
      assertQuarantineStorageKeyOwnedByUser(userId, `quarantine/${userId}/photo.jpg`),
    )
  })

  test('rejects another users quarantine prefix', () => {
    assert.throws(
      () =>
        assertQuarantineStorageKeyOwnedByUser(
          userId,
          'quarantine/00000000-0000-4000-8000-0000000000bb/photo.jpg',
        ),
      MediaUploadValidationError,
    )
  })

  test('rejects legacy uploads prefix', () => {
    assert.throws(
      () => assertQuarantineStorageKeyOwnedByUser(userId, `uploads/${userId}/photo.jpg`),
      MediaUploadValidationError,
    )
  })
})
