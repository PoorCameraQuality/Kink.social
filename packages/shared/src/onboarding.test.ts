import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  clampOnboardingStep,
  isOnboardingComplete,
  onboardingStepNumber,
  ONBOARDING_STEP_COUNT,
  profileCompletionPercent,
} from './onboarding.js'
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

  it('clamps stale saved steps into the current range', () => {
    // Users mid-flow under the old 7-step model should not break after the merge to 6 steps.
    assert.equal(clampOnboardingStep(7), ONBOARDING_STEP_COUNT)
    assert.equal(clampOnboardingStep(99), ONBOARDING_STEP_COUNT)
    assert.equal(clampOnboardingStep(0), 1)
    assert.equal(clampOnboardingStep(null), 1)
    assert.equal(clampOnboardingStep(undefined), 1)
    assert.equal(onboardingStepNumber({ onboardingStep: 7 }), ONBOARDING_STEP_COUNT)
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
