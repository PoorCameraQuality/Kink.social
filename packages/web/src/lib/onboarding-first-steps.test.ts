import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ONBOARDING_FIRST_STEP_ACTIONS, orderOnboardingFirstSteps } from './onboarding-first-steps.ts'

describe('onboarding first steps', () => {
  it('returns all five actions', () => {
    assert.equal(orderOnboardingFirstSteps([]).length, 5)
  })

  it('prioritizes actions matching selected intents', () => {
    const ordered = orderOnboardingFirstSteps(['events', 'groups'])
    const topTwo = ordered.slice(0, 2).map((action) => action.id)
    assert.ok(topTwo.includes('events'))
    assert.ok(topTwo.includes('groups'))
  })

  it('keeps stable order when no intents match', () => {
    const ordered = orderOnboardingFirstSteps(['learn'])
    assert.deepEqual(
      ordered.map((action) => action.id),
      ONBOARDING_FIRST_STEP_ACTIONS.map((action) => action.id),
    )
  })
})
