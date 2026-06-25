import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ECKE_PUBLISH_REGISTRY,
  getRegistryEntry,
  isValidEckeSourceKind,
  listRegistryForGroupDashboard,
  PASS2_DISABLED_ACTIONS,
} from './ecke-publish-registry.js'

const EXPECTED_SOURCE_KINDS = [
  'education_article',
  'vendor_profile',
  'organization_listing',
  'group_listing',
  'event_listing',
  'convention_listing',
  'dancecard_event',
  'dancecard_location',
  'dancecard_program_slot',
  'dancecard_staff_shift',
  'presenter_profile',
  'dungeon_profile',
  'venue_profile',
] as const

describe('ecke-publish-registry', () => {
  it('contains expected source kinds', () => {
    const kinds = ECKE_PUBLISH_REGISTRY.map((e) => e.sourceKind)
    for (const kind of EXPECTED_SOURCE_KINDS) {
      assert.ok(kinds.includes(kind), `missing ${kind}`)
    }
    assert.equal(kinds.length, EXPECTED_SOURCE_KINDS.length)
  })

  it('marks group_listing as active_existing on group dashboard', () => {
    const entry = getRegistryEntry('group_listing')
    assert.ok(entry)
    assert.equal(entry.supportState, 'active_existing')
    assert.equal(entry.visibleInGroupDashboard, true)
    assert.equal(entry.currentTransport, 'listing_webhook')
  })

  it('lists group dashboard entries including group_listing and event_listing', () => {
    const dashboard = listRegistryForGroupDashboard()
    const kinds = dashboard.map((e) => e.sourceKind)
    assert.ok(kinds.includes('group_listing'))
    assert.ok(kinds.includes('event_listing'))
  })

  it('validates source kind strings', () => {
    assert.equal(isValidEckeSourceKind('group_listing'), true)
    assert.equal(isValidEckeSourceKind('not_real'), false)
  })

  it('marks event_listing as active_existing on group dashboard', () => {
    const entry = getRegistryEntry('event_listing')
    assert.ok(entry)
    assert.equal(entry.supportState, 'active_existing')
    assert.equal(entry.currentTransport, 'supabase_rest')
  })

  it('Pass 2 disables write actions in registry constants', () => {
    assert.equal(PASS2_DISABLED_ACTIONS.preview, true)
    assert.equal(PASS2_DISABLED_ACTIONS.publish, false)
    assert.equal(PASS2_DISABLED_ACTIONS.sync, false)
    assert.equal(PASS2_DISABLED_ACTIONS.unpublish, false)
  })
})
