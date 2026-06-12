/** Comma-separated user UUIDs with platform moderation powers (trust flags queue, leadership finalize, etc.). */
export function getPlatformModeratorUserIds(): Set<string> {
  const raw = process.env.C2K_PLATFORM_MODERATOR_USER_IDS ?? ''
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  )
}

export function isPlatformModerator(userId: string): boolean {
  return getPlatformModeratorUserIds().has(userId)
}
