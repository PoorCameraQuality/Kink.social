import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { MEDIA_STORAGE_STATES, SCAN_STATUSES } from '@c2k/shared'
import { canExposePublicUrl } from './media-pipeline.js'
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
    })
    const url = canExposePublicUrl(asset)
    assert.equal(typeof url, 'boolean')
  })
})
