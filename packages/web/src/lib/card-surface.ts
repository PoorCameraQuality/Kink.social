/**
 * Shared card surface classes (Desktop UI Sprint 1 CP6; Premium Surface Pass 1).
 * Pair with `.dc-card-polish` (shared-surfaces.css) for touch `:active`; lg+ hover/focus in desktop-surfaces.css.
 */

const cardBorder = 'border-[color-mix(in_srgb,var(--dc-border-subtle)_82%,transparent)]' as const

export const cardSurfaceSolidClass =
  `dc-surface-lift rounded-2xl border ${cardBorder} bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)]` as const

export const cardSurfacePanelClass =
  `dc-surface-lift rounded-2xl border ${cardBorder} bg-dc-elevated/[0.97] shadow-[var(--dc-shadow-soft)] backdrop-blur-md` as const

/** Feed column cards — match rail opacity; padding set per component. */
export const cardSurfaceFeedClass =
  `dc-rail-card rounded-2xl border ${cardBorder} bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)]` as const

/** Activity / following feed cards in the home shell — opaque like rails. */
export const cardSurfaceFeedActivityClass =
  `!border-[color-mix(in_srgb,var(--dc-border-subtle)_80%,transparent)] !bg-dc-elevated-solid backdrop-blur-none dc-rail-card` as const

/** Apply on interactive directory/discover cards — do not duplicate hover:border utilities. */
export const cardSurfaceInteractiveClass = 'dc-card-polish min-w-0' as const

/** Right-rail section cards — pair with shared RailCard component. */
export const railSurfaceCardClass =
  `dc-rail-card rounded-2xl border ${cardBorder} bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]` as const

/** Left-rail nav / filter shells (home dashboard, directory sidebars). */
export const railNavShellClass =
  `dc-rail-nav-shell rounded-2xl border ${cardBorder} bg-dc-elevated-solid p-3 shadow-[var(--dc-shadow-soft)]` as const

/** Sticky aside wrapper for directory and utility rails. */
export const railAsideClass = 'dc-rail-aside space-y-4 lg:sticky lg:top-24 lg:self-start' as const

/** Shared premium input class for forms (see FormField + premium-surfaces.css). */
export const premiumInputClass = 'dc-premium-input' as const
