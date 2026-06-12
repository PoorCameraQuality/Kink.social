import type { ReactNode } from 'react'



export const LANDING_SUPPORTING_COPY =
  'Find Events, Meet new people, Connect with friends, and organize conventions. Your one stop shop.'



export const SIGNUP_REASSURANCE = [

  '18+ community only',

  'Privacy-first profiles',

  'Free to join',

] as const



export const TRUST_PILLS = [

  {

    title: '18+ Community',

    subtitle: 'Adults only',

    icon: (

      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />

      </svg>

    ),

  },

  {

    title: 'Privacy-first',

    subtitle: 'You are in control',

    icon: (

      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />

      </svg>

    ),

  },

  {

    title: 'Consent-centered',

    subtitle: 'Respect is everything',

    icon: (

      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />

      </svg>

    ),

  },

  {

    title: 'Organizer tools',

    subtitle: 'Built for events',

    icon: (

      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

      </svg>

    ),

  },

] as const



export const FEATURE_PILLARS: {

  title: string

  description: string

  mobileDescription: string

  href: string

  linkLabel: string

  featureRgb: string

  accentColor: string

  icon: ReactNode

}[] = [

  {

    title: 'Events',

    description:

      'Munches, classes, play parties, conventions, and more. Find what is happening near you.',

    mobileDescription: 'Munches, classes, play parties, and more.',

    href: '/events',

    linkLabel: 'Browse events →',

    featureRgb: '143, 38, 38',

    accentColor: 'var(--pub-red)',

    icon: (

      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

      </svg>

    ),

  },

  {

    title: 'Groups',

    description: 'Join local communities and interest-based groups where people actually show up.',

    mobileDescription: 'Join local communities and groups.',

    href: '/groups',

    linkLabel: 'Find groups →',

    featureRgb: '91, 58, 142',

    accentColor: 'var(--pub-purple)',

    icon: (

      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />

      </svg>

    ),

  },

  {

    title: 'Education',

    description: 'Learn from trusted presenters, educators, and articles you can rely on.',

    mobileDescription: 'Learn from trusted presenters.',

    href: '/education',

    linkLabel: 'Explore education →',

    featureRgb: '216, 173, 54',

    accentColor: 'var(--pub-gold-bright)',

    icon: (

      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824 2.998 12.078 12.078 0 01.665-6.479L12 14z" />

      </svg>

    ),

  },

  {

    title: 'Reputation & Trust',

    description: 'References and participation history. Credibility earned in the real world.',

    mobileDescription: 'References and participation history.',

    href: '/people',

    linkLabel: 'Learn more →',

    featureRgb: '36, 92, 145',

    accentColor: 'var(--pub-blue)',

    icon: (

      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />

      </svg>

    ),

  },

]



export const LANDING_SHORTCUTS = [

  { href: '/events', label: 'Events' },

  { href: '/groups', label: 'Groups' },

  { href: '/education', label: 'Education' },

  { href: '/explore', label: 'Discover' },

] as const



export const ORGANIZER_FEATURES = [

  'Rosters & roles',

  'Check-in & attendance',

  'Program grids & schedules',

  'Team collaboration',

  'Reports & analytics',

  'Community growth',

] as const


