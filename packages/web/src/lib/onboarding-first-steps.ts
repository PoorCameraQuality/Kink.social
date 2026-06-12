export type OnboardingFirstStepAction = {
  id: string
  title: string
  description: string
  href: string
  /** Intent ids that rank this action higher when selected in step 5 */
  intentBoost?: readonly string[]
}

export const ONBOARDING_FIRST_STEP_ACTIONS: readonly OnboardingFirstStepAction[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add a photo, bio, interests, and boundaries so people know how to connect with you.',
    href: '/profile/edit',
    intentBoost: ['friends'],
  },
  {
    id: 'groups',
    title: 'Join a group',
    description: 'Find communities around interests, identities, locations, and event scenes.',
    href: '/groups',
    intentBoost: ['groups'],
  },
  {
    id: 'events',
    title: 'Find an event',
    description: 'Browse upcoming events and discover organizations near you.',
    href: '/events',
    intentBoost: ['events', 'organize'],
  },
  {
    id: 'orgs',
    title: 'Follow an organization',
    description: 'Keep up with organizers, venues, conventions, and community projects.',
    href: '/orgs',
    intentBoost: ['orgs', 'conventions'],
  },
  {
    id: 'privacy',
    title: 'Review privacy settings',
    description: 'Adjust who can see you, message you, and interact with your profile.',
    href: '/settings/privacy',
    intentBoost: [],
  },
] as const

export function orderOnboardingFirstSteps(intents: Iterable<string>): OnboardingFirstStepAction[] {
  const selected = new Set(intents)
  const baseIndex = new Map(ONBOARDING_FIRST_STEP_ACTIONS.map((action, index) => [action.id, index]))

  const score = (action: OnboardingFirstStepAction) => {
    let points = 0
    for (const id of action.intentBoost ?? []) {
      if (selected.has(id)) points += 1
    }
    return points
  }

  return [...ONBOARDING_FIRST_STEP_ACTIONS].sort((a, b) => {
    const diff = score(b) - score(a)
    if (diff !== 0) return diff
    return (baseIndex.get(a.id) ?? 0) - (baseIndex.get(b.id) ?? 0)
  })
}
