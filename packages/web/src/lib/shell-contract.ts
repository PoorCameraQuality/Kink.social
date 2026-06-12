/**
 * Authenticated desktop shell contract (Desktop UI Sprint 1, CP3).
 *
 * Breakpoint policy:
 * - Below lg (<1024px): mobile/tablet layouts unchanged; outer max-width is inert on narrow viewports.
 * - lg+ (1024px+): unified shell-wide chrome; inner grids stay proportional inside the shell.
 *
 * Reference layout: 1440px (shell-feed). Ultra-wide cap: 1920px (shell-wide).
 */
export const SHELL_GUTTER = 'px-4 sm:px-6 lg:px-8' as const

/** Header, footer, AppShell, and full-width page shells — 1920 cap at lg+. */
export const shellWideClass = `mx-auto w-full min-w-0 max-w-7xl lg:max-w-shell-wide overflow-x-hidden ${SHELL_GUTTER}` as const

/** Feed and 2-col utility pages — 1440 reference at lg+; full width below lg. */
export const shellFeedClass = `mx-auto w-full min-w-0 max-w-7xl lg:max-w-shell-feed ${SHELL_GUTTER}` as const

/** Directory / 3-col discover — fills shell-wide parent; no nested 1600 island. */
export const shellDirectoryClass = `w-full min-w-0 overflow-x-hidden ${SHELL_GUTTER}` as const
