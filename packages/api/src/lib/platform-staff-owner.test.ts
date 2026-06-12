import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { invalidatePlatformStaffCache, isSiteOwner, isSiteAdmin, isTrustSafetyAdmin } from './platform-staff.js'

describe('platform site owner', () => {
  const savedOwner = process.env.C2K_SITE_OWNER_USER_IDS
  const savedAdmin = process.env.C2K_SITE_ADMIN_USER_IDS

  beforeEach(() => {
    invalidatePlatformStaffCache()
  })

  afterEach(() => {
    if (savedOwner === undefined) delete process.env.C2K_SITE_OWNER_USER_IDS
    else process.env.C2K_SITE_OWNER_USER_IDS = savedOwner
    if (savedAdmin === undefined) delete process.env.C2K_SITE_ADMIN_USER_IDS
    else process.env.C2K_SITE_ADMIN_USER_IDS = savedAdmin
    invalidatePlatformStaffCache()
  })

  it('isSiteOwner true only for C2K_SITE_OWNER_USER_IDS', async () => {
    const ownerId = randomUUID()
    const adminId = randomUUID()
    process.env.C2K_SITE_OWNER_USER_IDS = ownerId
    process.env.C2K_SITE_ADMIN_USER_IDS = adminId
    invalidatePlatformStaffCache()

    assert.equal(await isSiteOwner(ownerId), true)
    assert.equal(await isSiteOwner(adminId), false)
  })

  it('SITE_ADMIN does not imply site owner', async () => {
    const adminId = randomUUID()
    process.env.C2K_SITE_ADMIN_USER_IDS = adminId
    delete process.env.C2K_SITE_OWNER_USER_IDS
    invalidatePlatformStaffCache()

    assert.equal(await isSiteAdmin(adminId), true)
    assert.equal(await isSiteOwner(adminId), false)
  })

  it('owner env is independent of trust safety staff env moderators', async () => {
    const ownerId = randomUUID()
    process.env.C2K_SITE_OWNER_USER_IDS = ownerId
    invalidatePlatformStaffCache()
    assert.equal(await isTrustSafetyAdmin(ownerId), false)
  })
})
