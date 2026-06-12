import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { isOnboardingComplete, onboardingStepNumber, profileCompletionPercent } from './onboarding.js'
import { normalizeFeedSettings } from './user-settings.js'

describe('onboarding helpers', () => {
  it('treats missing completion as incomplete for new defaults', () => {
    assert.equal(isOnboardingComplete({ onboardingCompletedAt: null }), false)
  })

  it('grandfathers existing feed settings without onboarding fields', () => {
    const feed = normalizeFeedSettings({ schemaVersion: 4, hideStoryTypes: [] })
    assert.equal(isOnboardingComplete(feed), true)
  })

  it('reads onboarding step with fallback', () => {
    assert.equal(onboardingStepNumber({ onboardingStep: 3 }), 3)
    assert.equal(onboardingStepNumber({}), 1)
  })

  it('computes profile completion percent', () => {
    assert.equal(
      profileCompletionPercent({
        displayName: 'Alex',
        bio: 'Hello',
        photoCount: 1,
        privacyConfigured: true,
        joinedOrFollowed: false,
      }),
      85
    )
  })
})
