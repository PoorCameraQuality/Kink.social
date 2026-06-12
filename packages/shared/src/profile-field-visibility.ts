import { z } from 'zod'

/** Who can see a profile field on-card / in lists; also gates discovery facet matching. */
export const profileFieldVisibilityLevelSchema = z.enum(['public', 'friends', 'hidden'])
export type ProfileFieldVisibilityLevel = z.infer<typeof profileFieldVisibilityLevelSchema>

export const PROFILE_FIELD_VISIBILITY_KEYS = ['gender', 'age', 'sexuality', 'pronouns', 'location'] as const
export type ProfileFieldVisibilityKey = (typeof PROFILE_FIELD_VISIBILITY_KEYS)[number]

export const profileFieldVisibilityMapSchema = z
  .object({
    gender: profileFieldVisibilityLevelSchema.optional(),
    age: profileFieldVisibilityLevelSchema.optional(),
    sexuality: profileFieldVisibilityLevelSchema.optional(),
    pronouns: profileFieldVisibilityLevelSchema.optional(),
    location: profileFieldVisibilityLevelSchema.optional(),
  })
  .strict()
  .optional()

export type ProfileFieldVisibilityMap = Partial<Record<ProfileFieldVisibilityKey, ProfileFieldVisibilityLevel>>

export function parseProfileFieldVisibility(raw: unknown): ProfileFieldVisibilityMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const o = raw as Record<string, unknown>
  const out: ProfileFieldVisibilityMap = {}
  for (const k of PROFILE_FIELD_VISIBILITY_KEYS) {
    const v = o[k]
    if (v === 'public' || v === 'friends' || v === 'hidden') {
      out[k] = v
    }
  }
  return out
}

export function effectiveFieldVisibility(
  key: ProfileFieldVisibilityKey,
  map: ProfileFieldVisibilityMap
): ProfileFieldVisibilityLevel {
  return map[key] ?? 'public'
}

/** Profile view / card: may the viewer see this field’s value? */
export function viewerMaySeeProfileField(
  level: ProfileFieldVisibilityLevel,
  ctx: { isOwner: boolean; isFriend: boolean }
): boolean {
  if (ctx.isOwner) return true
  if (level === 'hidden') return false
  if (level === 'public') return true
  return ctx.isFriend
}

/** Discovery: may this field’s stored value be used to include the user in a facet filter for this viewer? */
export function viewerMayMatchDiscoveryField(
  level: ProfileFieldVisibilityLevel,
  ctx: { isSelf: boolean; isFriend: boolean }
): boolean {
  if (ctx.isSelf) return true
  if (level === 'hidden') return false
  if (level === 'public') return true
  return ctx.isFriend
}
