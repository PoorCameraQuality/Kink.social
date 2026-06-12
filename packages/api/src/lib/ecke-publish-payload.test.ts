import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildConventionListingPayload,
  buildDancecardEventPayload,
  buildGroupListingPayload,
  buildOrgListingPayload,
  derivePublishStatus,
  hashEckePayload,
  isDancecardPublishEnabled,
  resolveDancecardSlug,
  resolveEckeListingSlug,
} from './ecke-publish-payload.js'

describe('resolveEckeListingSlug', () => {
  it('uses convention slug by default', () => {
    assert.equal(resolveEckeListingSlug('My-Con'), 'my-con')
  })

  it('prefers settings override', () => {
    assert.equal(resolveEckeListingSlug('my-con', { eckeListingSlug: 'Custom-Slug' }), 'custom-slug')
  })
})

describe('isDancecardPublishEnabled', () => {
  it('defaults to enabled', () => {
    assert.equal(isDancecardPublishEnabled(undefined), true)
    assert.equal(isDancecardPublishEnabled({}), true)
  })

  it('respects explicit false', () => {
    assert.equal(isDancecardPublishEnabled({ dancecardEnabled: false }), false)
  })
})

describe('buildOrgListingPayload', () => {
  it('marks non-public orgs hidden', () => {
    const p = buildOrgListingPayload({
      slug: 'Demo-Org',
      displayName: 'Demo Org',
      bio: 'Hello',
      visibility: 'MEMBERS',
    })
    assert.equal(p.visibility, 'hidden')
    assert.equal(p.slug, 'demo-org')
  })
})

describe('buildGroupListingPayload', () => {
  it('maps group to listing with parent org', () => {
    const p = buildGroupListingPayload({
      slug: 'Rope-Social',
      name: 'Rope Social',
      description: 'Weekly munch',
      visibility: 'public',
      orgSlug: 'demo-org',
      orgDisplayName: 'Demo Org',
    })
    assert.equal(p.slug, 'rope-social')
    assert.equal(p.title, 'Rope Social')
    assert.equal(p.orgSlug, 'demo-org')
    assert.equal(p.visibility, 'public')
  })
})

describe('buildConventionListingPayload', () => {
  it('prefers anchor event title and dates', () => {
    const starts = new Date('2026-06-01T12:00:00.000Z')
    const ends = new Date('2026-06-03T12:00:00.000Z')
    const p = buildConventionListingPayload({
      conventionSlug: 'fest',
      conventionName: 'Fest Name',
      startsAt: new Date('2026-05-01T00:00:00.000Z'),
      endsAt: new Date('2026-05-02T00:00:00.000Z'),
      anchor: {
        title: 'Anchor Title',
        description: 'Anchor desc',
        startsAt: starts,
        endsAt: ends,
        location: 'Hotel',
        publicLocationSummary: 'Public hotel',
        imageUrl: 'https://example.com/img.jpg',
        visibility: 'public',
      },
    })
    assert.equal(p.title, 'Anchor Title')
    assert.equal(p.startsAt, starts.toISOString())
    assert.equal(p.location, 'Public hotel')
  })

  it('includes memberActionUrl for ECKE registration CTA', () => {
    const p = buildConventionListingPayload({
      conventionSlug: 'my-con',
      conventionName: 'My Con',
      startsAt: new Date('2026-06-01T00:00:00.000Z'),
      endsAt: new Date('2026-06-03T00:00:00.000Z'),
    })
    assert.match(p.memberActionUrl ?? '', /\/conventions\/my-con\/register$/)
  })
})

describe('buildDancecardEventPayload', () => {
  it('maps slots to dancecard shape', () => {
    const p = buildDancecardEventPayload({
      conventionSlug: 'paf26',
      conventionName: 'PAF',
      timezone: 'America/New_York',
      startsAt: new Date('2026-05-01T00:00:00.000Z'),
      endsAt: new Date('2026-05-04T00:00:00.000Z'),
      orgDisplayName: 'Demo Org',
      orgSlug: 'demo-org',
      slots: [
        {
          id: 'slot-uuid-1',
          startsAt: new Date('2026-05-01T14:00:00.000Z'),
          endsAt: new Date('2026-05-01T15:00:00.000Z'),
          title: 'Rope 101',
          trackLabel: 'Classes',
          roomLabel: 'Ballroom A',
          sortOrder: 0,
        },
      ],
    })
    assert.equal(p.slug, 'paf26')
    assert.equal(p.slots.length, 1)
    assert.equal(p.slots[0].externalKey, 'slot-uuid-1')
    assert.equal(p.slots[0].room, 'Ballroom A')
    assert.equal(p.staffShifts.length, 0)
    assert.equal(p.locations.length, 0)
  })

  it('maps locations and locationId on slots', () => {
    const p = buildDancecardEventPayload({
      conventionSlug: 'paf26',
      conventionName: 'PAF',
      timezone: 'America/New_York',
      startsAt: new Date('2026-05-01T00:00:00.000Z'),
      endsAt: new Date('2026-05-04T00:00:00.000Z'),
      locations: [
        {
          id: 'loc-1',
          name: 'Ballroom A',
          shortName: 'A',
          capacity: 100,
          sortOrder: 0,
          parentId: null,
        },
      ],
      slots: [
        {
          id: 'slot-uuid-1',
          startsAt: new Date('2026-05-01T14:00:00.000Z'),
          endsAt: new Date('2026-05-01T15:00:00.000Z'),
          title: 'Rope 101',
          trackLabel: 'Classes',
          locationId: 'loc-1',
          locationName: 'Ballroom A',
          sortOrder: 0,
        },
      ],
    })
    assert.equal(p.locations.length, 1)
    assert.equal(p.locations[0].externalKey, 'loc-1')
    assert.equal(p.slots[0].locationId, 'loc-1')
    assert.equal(p.slots[0].room, 'Ballroom A')
  })

  it('maps volunteer shifts to dancecard staff shape', () => {
    const p = buildDancecardEventPayload({
      conventionSlug: 'paf26',
      conventionName: 'PAF',
      timezone: 'America/New_York',
      startsAt: new Date('2026-05-01T00:00:00.000Z'),
      endsAt: new Date('2026-05-04T00:00:00.000Z'),
      slots: [],
      volunteerShifts: [
        {
          id: 'shift-uuid-1',
          title: 'Jordan | Registration',
          startsAt: new Date('2026-05-01T08:00:00.000Z'),
          endsAt: new Date('2026-05-01T12:00:00.000Z'),
          sortOrder: 1,
        },
      ],
    })
    assert.equal(p.staffShifts.length, 1)
    assert.equal(p.staffShifts[0].externalKey, 'shift-uuid-1')
    assert.equal(p.staffShifts[0].personName, 'Jordan')
    assert.equal(p.staffShifts[0].role, 'Registration')
  })
})

describe('derivePublishStatus', () => {
  it('returns draft when never published', () => {
    assert.equal(derivePublishStatus('abc', null, null), 'draft')
  })

  it('returns stale when hash differs', () => {
    assert.equal(derivePublishStatus('new', 'old', new Date()), 'stale')
  })

  it('returns published when hash matches', () => {
    assert.equal(derivePublishStatus('same', 'same', new Date()), 'published')
  })
})

describe('hashEckePayload', () => {
  it('is stable for same object', () => {
    const a = buildOrgListingPayload({ slug: 'x', displayName: 'X', visibility: 'PUBLIC' })
    assert.equal(hashEckePayload(a), hashEckePayload(a))
  })
})

describe('resolveDancecardSlug', () => {
  it('uses settings dancecardSlug when set', () => {
    assert.equal(resolveDancecardSlug('fest', { dancecardSlug: 'custom-dc' }), 'custom-dc')
  })
})
