/** Public community trust levels - positive/factual only. */
export const COMMUNITY_TRUST_LEVELS = {
  newMember: 'NEW_MEMBER',
  buildingTrust: 'BUILDING_TRUST',
  establishedMember: 'ESTABLISHED_MEMBER',
  communityKnown: 'COMMUNITY_KNOWN',
  verifiedContributor: 'VERIFIED_CONTRIBUTOR',
} as const

export type CommunityTrustLevel = (typeof COMMUNITY_TRUST_LEVELS)[keyof typeof COMMUNITY_TRUST_LEVELS]

export const COMMUNITY_TRUST_LEVEL_VALUES: readonly CommunityTrustLevel[] = Object.values(
  COMMUNITY_TRUST_LEVELS
)

export const SCOPED_STANDINGS = {
  goodStanding: 'GOOD_STANDING',
  needsAttention: 'NEEDS_ATTENTION',
  limited: 'LIMITED',
  timedOut: 'TIMED_OUT',
  banned: 'BANNED',
  escalatedToPlatform: 'ESCALATED_TO_PLATFORM',
} as const

export type ScopedStanding = (typeof SCOPED_STANDINGS)[keyof typeof SCOPED_STANDINGS]

export const TRUST_SCOPE_TYPES = {
  organization: 'organization',
  group: 'group',
  event: 'event',
  convention: 'convention',
} as const

export type TrustScopeType = (typeof TRUST_SCOPE_TYPES)[keyof typeof TRUST_SCOPE_TYPES]

export const MESSAGING_HEALTH_STATES = {
  healthy: 'HEALTHY',
  newLimitedHistory: 'NEW_LIMITED_HISTORY',
  highOutreachVolume: 'HIGH_OUTREACH_VOLUME',
  needsCooldown: 'NEEDS_COOLDOWN',
  modReviewRecommended: 'MOD_REVIEW_RECOMMENDED',
  restricted: 'RESTRICTED',
} as const

export type MessagingHealthState = (typeof MESSAGING_HEALTH_STATES)[keyof typeof MESSAGING_HEALTH_STATES]

/** Policy reasons that must always route to platform T&S (not local-only dismissal). */
export const PLATFORM_CRITICAL_POLICY_REASONS = [
  'MINOR_SAFETY',
  'CSAM_SUSPECTED',
  'NCII',
  'AI_DEEPFAKE_NCII',
  'HIDDEN_CAMERA_LEAKED',
  'CONSENT_SAFETY',
  'DOXXING_OUTING',
  'HARASSMENT_THREATS',
  'TRAFFICKING_COERCION',
  'COMMERCIAL_SEX_SOLICITATION',
  'ILLEGAL_GOODS_SERVICES',
] as const

export type PlatformCriticalPolicyReason = (typeof PLATFORM_CRITICAL_POLICY_REASONS)[number]

export function isPlatformCriticalPolicyReason(reason: string): boolean {
  return (PLATFORM_CRITICAL_POLICY_REASONS as readonly string[]).includes(reason)
}
