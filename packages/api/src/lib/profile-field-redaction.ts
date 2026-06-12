import {
  effectiveFieldVisibility,
  parseProfileFieldVisibility,
  viewerMayMatchDiscoveryField,
  viewerMaySeeProfileField,
  type ProfileFieldVisibilityKey,
} from '@c2k/shared'

export type DiscoveryProfileDbRow = {
  userId: string
  username: string
  displayName: string | null
  bio: string | null
  roles: string[] | null
  verified: boolean | null
  location: string | null
  age: number | null
  avatarUrl: string | null
  lastActiveAt: Date | null
  gender: string | null
  sexuality: string | null
  pronouns: string | null
  discoverableInPeopleSearch: boolean
  fieldVisibility: unknown
}

export type DiscoveryProfileCard = {
  userId: string
  username: string
  displayName: string | null
  bio: string | null
  roles: string[] | null
  verified: boolean | null
  location: string | null
  age: number | null
  sexuality: string | null
  pronouns: string | null
  gender: string | null
  avatarUrl: string | null
  lastActiveAt: string | null
}

export function toDiscoveryProfileCard(
  row: DiscoveryProfileDbRow,
  viewerId: string | null,
  friendIds: Set<string>
): DiscoveryProfileCard {
  const targetUserId = row.userId
  const isSelf = viewerId !== null && viewerId === targetUserId
  const isFriend = viewerId !== null && friendIds.has(targetUserId)
  const map = parseProfileFieldVisibility(row.fieldVisibility)
  const seeCtx = { isOwner: isSelf, isFriend }

  const pick = (key: ProfileFieldVisibilityKey, value: string | number | null): string | number | null => {
    if (value === null || value === undefined) return null
    const level = effectiveFieldVisibility(key, map)
    return viewerMaySeeProfileField(level, seeCtx) ? value : null
  }

  return {
    userId: row.userId,
    username: row.username,
    displayName: row.displayName,
    bio: row.bio,
    roles: row.roles,
    verified: row.verified,
    location: pick('location', row.location) as string | null,
    age: pick('age', row.age) as number | null,
    sexuality: pick('sexuality', row.sexuality) as string | null,
    pronouns: pick('pronouns', row.pronouns) as string | null,
    gender: pick('gender', row.gender) as string | null,
    avatarUrl: row.avatarUrl,
    lastActiveAt: row.lastActiveAt ? row.lastActiveAt.toISOString() : null,
  }
}

export function passesGenderDiscoveryFilter(
  row: Pick<DiscoveryProfileDbRow, 'userId' | 'gender' | 'fieldVisibility'>,
  genderQuery: string,
  viewerId: string | null,
  friendIds: Set<string>
): boolean {
  const trimmed = genderQuery.trim().toLowerCase()
  if (!trimmed) return true
  const g = row.gender?.trim().toLowerCase() ?? ''
  if (!g.includes(trimmed)) return false
  const map = parseProfileFieldVisibility(row.fieldVisibility)
  const level = effectiveFieldVisibility('gender', map)
  const isSelf = viewerId !== null && viewerId === row.userId
  const isFriend = viewerId !== null && friendIds.has(row.userId)
  return viewerMayMatchDiscoveryField(level, { isSelf, isFriend })
}

/** Full profile row: owner sees everything; others see redacted sensitive fields and no `fieldVisibility` / `discoverableInPeopleSearch`. */
export function redactProfileForViewer<
  T extends {
    gender: string | null
    age: number | null
    sexuality: string | null
    pronouns: string | null
    genders?: string[] | null
    sexualOrientations?: string[] | null
    romanticOrientations?: string[] | null
    pronounTags?: string[] | null
    fieldVisibility: unknown
    discoverableInPeopleSearch: boolean
  },
>(prof: T, ctx: { viewerId: string | null; targetUserId: string; friendIds: Set<string> }): T | Omit<T, 'fieldVisibility' | 'discoverableInPeopleSearch'> {
  const isOwner = ctx.viewerId !== null && ctx.viewerId === ctx.targetUserId
  if (isOwner) return prof
  const isFriend = ctx.viewerId !== null && ctx.friendIds.has(ctx.targetUserId)
  const map = parseProfileFieldVisibility(prof.fieldVisibility)
  const seeCtx = { isOwner: false, isFriend }
  const pick = (key: ProfileFieldVisibilityKey, value: string | number | null): string | number | null => {
    if (value === null || value === undefined) return null
    const level = effectiveFieldVisibility(key, map)
    return viewerMaySeeProfileField(level, seeCtx) ? value : null
  }
  const pickArray = (key: ProfileFieldVisibilityKey, values: string[] | null | undefined): string[] => {
    if (!values?.length) return []
    const level = effectiveFieldVisibility(key, map)
    return viewerMaySeeProfileField(level, seeCtx) ? values : []
  }
  const { fieldVisibility: _fv, discoverableInPeopleSearch: _di, ...base } = prof
  const extended = base as T & {
    location?: string | null
    birthDate?: string | null
    homeZip?: string | null
    placeId?: string | null
    stateId?: string | null
    customLocation?: string | null
    lookingFor?: string[] | null
    notLookingFor?: string[] | null
  }
  const genderVisible = pick('gender', prof.gender) as string | null
  const sexualityVisible = pick('sexuality', prof.sexuality) as string | null
  const pronounsVisible = pick('pronouns', prof.pronouns) as string | null
  return {
    ...extended,
    location: pick('location', extended.location ?? null) as string | null,
    gender: genderVisible,
    age: pick('age', prof.age) as number | null,
    sexuality: sexualityVisible,
    pronouns: pronounsVisible,
    genders: pickArray('gender', prof.genders),
    sexualOrientations: pickArray('sexuality', prof.sexualOrientations),
    romanticOrientations: pickArray('sexuality', prof.romanticOrientations),
    pronounTags: pickArray('pronouns', prof.pronounTags),
    birthDate: null,
    homeZip: null,
    placeId: null,
    stateId: null,
    customLocation: null,
    notLookingFor: [],
  }
}
