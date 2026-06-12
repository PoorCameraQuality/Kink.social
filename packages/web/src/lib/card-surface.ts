/**
 * Shared card surface classes (Desktop UI Sprint 1, CP6).
 * Pair with `.dc-card-polish` (mobile-polish.css) for hover/active — hover only at `(hover: hover)`.
 */

export const cardSurfaceSolidClass =
  'rounded-2xl border border-dc-border bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)]' as const

export const cardSurfacePanelClass =
  'rounded-2xl border border-dc-border bg-dc-elevated/95 shadow-[var(--dc-shadow-soft)] backdrop-blur-sm' as const

/** Feed column inset border (home Following layout). */
export const cardSurfaceFeedClass =
  'rounded-2xl border border-white/[0.07] bg-dc-elevated/95 shadow-[var(--dc-shadow-soft)]' as const

/** Apply on interactive directory/discover cards — do not duplicate hover:border utilities. */
export const cardSurfaceInteractiveClass = 'dc-card-polish min-w-0' as const
