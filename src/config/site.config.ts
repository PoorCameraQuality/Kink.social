/**
 * Coast to Coast Kink – site-wide configuration.
 * Change branding and labels here; never hardcode in components.
 */
export const siteConfig = {
  name: 'Coast to Coast Kink',
  tagline: 'Events • Dungeons • Community',
  logoAcronym: 'C2K',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://coasttocoastkink.com',

  /** Public (logged-out) nav – Fetish.com style */
  navPublic: [
    { href: '/community', label: 'BDSM Community' },
    { href: '/places', label: 'Kinky Map' },
    { href: '/chat', label: 'Chat' },
  ] as const,

  /** Primary nav (logged-in) – 2026 structure: Home, Explore, Events, Groups, etc. */
  navPrimary: [
    { href: '/home', label: 'Home' },
    { href: '/discovery', label: 'Explore' },
    { href: '/events', label: 'Events' },
    { href: '/groups', label: 'Groups' },
    { href: '/places', label: 'Places' },
    { href: '/vendors', label: 'Vendors' },
    { href: '/education', label: 'Education' },
    { href: '/messaging', label: 'Messaging' },
  ] as const,

  /** More dropdown (logged-in) */
  navMore: [
    { href: '/dungeons', label: 'Dungeons' },
    { href: '/vendors', label: 'Vendors' },
    { href: '/education', label: 'Education' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ] as const,

  /** Secondary quick links (logged-in). Optional count for activity badges (mock for now). */
  navSecondary: [
    { href: '/home', label: 'My Home' },
    { href: '/messaging', label: 'Mailbox', count: 1 },
    { href: '/notifications', label: 'Notifications' },
    { href: '/discovery?view=me', label: "Who's Viewing Me" },
    { href: '/connections', label: 'Connections', count: 254 },
    { href: '/events', label: 'My Events', count: 362 },
    { href: '/online', label: "Who's Online" },
  ] as const,

  footer: {
    directory: [
      { href: '/events', label: 'Events' },
      { href: '/dungeons', label: 'Dungeons' },
      { href: '/education', label: 'Education' },
      { href: '/vendors', label: 'Vendors' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/guidelines', label: 'Guidelines' },
    ],
  },
} as const

export type SiteConfig = typeof siteConfig
