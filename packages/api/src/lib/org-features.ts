export type OrgFeatureFlags = {
  calendarEnabled: boolean
  forumsEnabled: boolean
  subgroupsEnabled: boolean
  chatEnabled: boolean
  externalEmbedEnabled: boolean
}

export const DEFAULT_ORG_FEATURE_FLAGS: OrgFeatureFlags = {
  calendarEnabled: true,
  forumsEnabled: true,
  subgroupsEnabled: false,
  chatEnabled: true,
  externalEmbedEnabled: false,
}

export function parseOrgFeatureFlags(raw: unknown): OrgFeatureFlags {
  const base = { ...DEFAULT_ORG_FEATURE_FLAGS }
  if (!raw || typeof raw !== 'object') return base
  for (const key of Object.keys(base) as (keyof OrgFeatureFlags)[]) {
    const v = (raw as Record<string, unknown>)[key]
    if (typeof v === 'boolean') base[key] = v
  }
  return base
}

export function serializeOrgFeatureFlags(f: Partial<OrgFeatureFlags>): OrgFeatureFlags {
  return { ...DEFAULT_ORG_FEATURE_FLAGS, ...f }
}
