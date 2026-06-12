export type ModerationOutletContext = {
  /** Bump to refetch dashboard counts, nav badges, and list pages. */
  refreshModeration: () => void
  moderationRefreshKey: number
}

export const defaultModerationOutletContext: ModerationOutletContext = {
  refreshModeration: () => {},
  moderationRefreshKey: 0,
}
