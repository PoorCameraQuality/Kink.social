/**
 * Shared card surface classes (Desktop UI Sprint 1 CP6; Sprint 3 CP2 depth polish).
 * Pair with `.dc-card-polish` (mobile-polish.css) for touch `:active`; lg+ hover/focus in desktop-surfaces.css.
 */

export const cardSurfaceSolidClass =
  'dc-surface-lift rounded-2xl border border-dc-border/90 bg-dc-elevated-solid shadow-[var(--dc-shadow-soft)]' as const

export const cardSurfacePanelClass =
  'dc-surface-lift rounded-2xl border border-dc-border/85 bg-dc-elevated/[0.97] shadow-[var(--dc-shadow-soft)] backdrop-blur-md' as const

/** Feed column inset border (home Following layout). */
export const cardSurfaceFeedClass =
  'dc-surface-lift rounded-2xl border border-white/[0.08] bg-dc-elevated/[0.97] shadow-[var(--dc-shadow-soft)]' as const

/** Apply on interactive directory/discover cards — do not duplicate hover:border utilities. */
export const cardSurfaceInteractiveClass = 'dc-card-polish min-w-0' as const

/** Right-rail section cards — pair with shared RailCard component. */
export const railSurfaceCardClass =
  'dc-rail-card rounded-2xl border border-dc-border/80 bg-dc-elevated-solid p-4 shadow-[var(--dc-shadow-soft)]' as const

/** Left-rail nav / filter shells (home dashboard, directory sidebars). */
export const railNavShellClass =
  'dc-rail-nav-shell rounded-2xl border border-dc-border/80 bg-dc-elevated-solid p-3 shadow-[var(--dc-shadow-soft)]' as const

/** Sticky aside wrapper for directory and utility rails. */
export const railAsideClass = 'dc-rail-aside space-y-4 lg:sticky lg:top-24 lg:self-start' as const
