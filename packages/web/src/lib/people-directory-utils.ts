import type { BadgeId, MockPerson } from '@/data/types'

import type { CommunityRoleFilterId } from '@/lib/people-search-constants'
import type { FindPeopleFilterDraft } from '@/components/find-people/FindPeopleFiltersPanel'



const COMMUNITY_ROLE_MATCH: Record<

  CommunityRoleFilterId,

  { roles?: string[]; badges?: BadgeId[] }

> = {

  organizer: { roles: ['Organizer', 'Host'] },

  presenter: { roles: ['Educator', 'Mentor', 'Facilitator'] },

  vendor: { badges: ['vendor_verified'], roles: ['Vendor'] },

  volunteer: { roles: ['Volunteer'] },

  moderator: { roles: ['Moderator'] },

}



export type PersonCommunityBadge = {

  id: string

  label: string

  tone: 'gold' | 'green' | 'blue' | 'purple' | 'orange'

}



export function personMatchesCommunityRoleFilter(person: MockPerson, filterId: CommunityRoleFilterId): boolean {

  const spec = COMMUNITY_ROLE_MATCH[filterId]

  const roles = person.roles ?? []

  if (spec.roles?.some((r) => roles.some((pr) => pr.toLowerCase() === r.toLowerCase()))) return true

  if (spec.badges?.some((b) => person.badges?.includes(b))) return true

  return false

}



export function filterPeopleByCommunityRoles(people: MockPerson[], filterIds: CommunityRoleFilterId[]): MockPerson[] {

  if (!filterIds.length) return people

  return people.filter((p) => filterIds.every((id) => personMatchesCommunityRoleFilter(p, id)))

}



export function getPersonCommunityBadges(person: MockPerson): PersonCommunityBadge[] {

  const roles = person.roles ?? []

  const badges: PersonCommunityBadge[] = []

  if (person.badges?.includes('event_verified')) {

    badges.push({ id: 'event_verified', label: 'Event verified', tone: 'gold' })

  }

  if (roles.some((r) => /organizer|host/i.test(r))) {

    badges.push({ id: 'organizer', label: 'Organizer', tone: 'green' })

  }

  if (roles.some((r) => /educator|mentor|facilitator/i.test(r))) {

    badges.push({ id: 'presenter', label: 'Presenter', tone: 'blue' })

  }

  if (person.badges?.includes('vendor_verified') || roles.some((r) => /vendor/i.test(r))) {

    badges.push({ id: 'vendor', label: 'Vendor', tone: 'purple' })

  }

  return badges

}



export function getPersonHeadlineRole(person: MockPerson): string | null {

  const roles = person.roles ?? []

  const community = roles.find((r) =>

    /organizer|host|educator|mentor|facilitator|vendor/i.test(r),

  )

  return community ?? null

}



export function formatPersonContextLines(person: MockPerson): string[] {

  const lines: string[] = []

  const hosted = person.hostedEventsCount ?? 0

  const mutualGroups = person.mutualGroupsCount ?? 0

  const shared = person.sharedEventsCount ?? 0

  const mutual = person.mutualCount ?? 0



  if (hosted > 0) lines.push(`${hosted} hosted event${hosted === 1 ? '' : 's'}`)

  if (shared > 0) lines.push(`${shared} mutual event${shared === 1 ? '' : 's'}`)

  else if (mutual > 0) lines.push(`${mutual} mutual`)

  if (mutualGroups > 0) lines.push(`${mutualGroups} mutual group${mutualGroups === 1 ? '' : 's'}`)

  const articles = person.publishedArticlesCount ?? 0

  if (articles > 0) lines.push(`${articles} published article${articles === 1 ? '' : 's'}`)

  return lines

}



export function trustStepIndex(value: number): number {

  const steps = [0, 25, 50, 75]

  let idx = 0

  for (let i = 0; i < steps.length; i++) {

    if (value >= steps[i]) idx = i

  }

  return idx

}



export function trustValueFromStepIndex(index: number): number {

  const steps = [0, 25, 50, 75] as const

  return steps[Math.max(0, Math.min(index, steps.length - 1))] ?? 0

}

/** Preflight / automation accounts — hide from directory display only. */
export function isAuditDemoUsername(username: string): boolean {
  return /^audit[a-z0-9]+$/i.test(username.trim())
}

export function countPeopleActiveFilters(d: FindPeopleFilterDraft): number {
  let n = 0
  if (d.distance !== 50) n++
  if (d.country.trim()) n++
  if (d.city.trim()) n++
  if (d.peopleGender.trim()) n++
  n += d.communityRoles.length
  n += d.interestRoles.length
  if (d.experienceLevel !== 'any') n++
  if (d.verifiedOnly) n++
  if (d.eventActiveOnly) n++
  return n
}


