/** Public profile extended sections (owner dashboard + /profile/:username). */

export const PUBLIC_PROFILE_TABS = [
  'Relationships',
  'Connections',
  'Event history',
  'Media',
  'Reviews',
  'ISO',
] as const

export type PublicProfileTab = (typeof PUBLIC_PROFILE_TABS)[number]

export const DEFAULT_PUBLIC_PROFILE_TAB: PublicProfileTab = 'Media'

const LEGACY_TAB_ALIASES: Record<string, PublicProfileTab> = {
  about: 'Relationships',
  activity: 'Media',
  events: 'Event history',
  'events attended': 'Event history',
  groups: 'Media',
  references: 'Reviews',
  reference: 'Reviews',
  connections: 'Connections',
  media: 'Media',
  photos: 'Media',
  writing: 'Media',
  journal: 'Media',
  articles: 'Media',
  'education contributions': 'Media',
  education: 'Media',
}

export function resolvePublicProfileTab(
  tabParam: string | null,
  defaultTab: PublicProfileTab = DEFAULT_PUBLIC_PROFILE_TAB,
): PublicProfileTab {
  if (!tabParam) return defaultTab
  let decoded = tabParam
  try {
    decoded = decodeURIComponent(tabParam)
  } catch {
    decoded = tabParam
  }
  if ((PUBLIC_PROFILE_TABS as readonly string[]).includes(decoded)) {
    return decoded as PublicProfileTab
  }
  const alias = LEGACY_TAB_ALIASES[decoded.toLowerCase()]
  if (alias) return alias
  const fuzzy = PUBLIC_PROFILE_TABS.find((t) => t.toLowerCase() === decoded.toLowerCase())
  return fuzzy ?? defaultTab
}

export type ProfileTabVisibilityInput = {
  viewerIsOwner: boolean
  isAuthenticated: boolean
  hasRelationships: boolean
  hasConnections: boolean
  hasEventHistory: boolean
  hasMedia: boolean
  hasReviews: boolean
  hasIso: boolean
}

export type PublicProfileTabCounts = Partial<Record<PublicProfileTab, number>>

export function getPublicProfileTabLabel(
  tab: PublicProfileTab,
  counts?: PublicProfileTabCounts,
): string {
  if (tab === 'Connections') {
    const n = counts?.Connections
    if (n != null && n > 0) return `Connections (${n})`
  }
  return tab
}

export function getVisiblePublicProfileTabs(input: ProfileTabVisibilityInput): PublicProfileTab[] {
  if (input.viewerIsOwner) {
    return PUBLIC_PROFILE_TABS.filter((tab) => {
      if (tab === 'ISO' && !input.isAuthenticated) return false
      return true
    })
  }

  const visible: PublicProfileTab[] = []
  if (input.hasRelationships) visible.push('Relationships')
  if (input.hasConnections) visible.push('Connections')
  if (input.hasEventHistory) visible.push('Event history')
  if (input.hasMedia) visible.push('Media')
  if (input.hasReviews) visible.push('Reviews')
  if (input.hasIso) visible.push('ISO')
  return visible
}
