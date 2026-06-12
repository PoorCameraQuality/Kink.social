/** Convention organizer navigation - parity with EastCoast Dancecard Organizer. */

export type ConventionOrganizerTab =
  | 'dashboard'
  | 'program'
  | 'venues'
  | 'import'
  | 'people'
  | 'messaging'
  | 'settings'
  | 'exports'
  | 'integrations'

export type ConventionPeopleSubTab = 'staff' | 'roster' | 'volunteer' | 'coverage'

export type ConventionSettingsPanel =
  | 'basics'
  | 'logistics'
  | 'documents'
  | 'program'
  | 'advanced'

export const CONVENTION_PEOPLE_SUB_TABS: ConventionPeopleSubTab[] = ['staff', 'roster', 'volunteer', 'coverage']

export const CONVENTION_SETTINGS_PANELS: ConventionSettingsPanel[] = [
  'basics',
  'logistics',
  'program',
  'documents',
  'advanced',
]

export type ConventionNavItem = {
  key: ConventionOrganizerTab
  label: string
  description: string
}

export type ConventionSidebarSection = {
  id: string
  label: string
  items: ConventionNavItem[]
}

export const CONVENTION_SIDEBAR_SECTIONS: ConventionSidebarSection[] = [
  {
    id: 'home',
    label: 'Home',
    items: [
      {
        key: 'dashboard',
        label: 'Overview',
        description: 'Readiness checks, setup tasks, and shortcuts for this convention.',
      },
    ],
  },
  {
    id: 'schedule',
    label: 'Schedule',
    items: [
      {
        key: 'program',
        label: 'Program',
        description: 'Build the schedule attendees see. Place classes on the grid, assign presenters, then publish.',
      },
      {
        key: 'venues',
        label: 'Room availability',
        description: 'See which rooms are in use across the event window.',
      },
      {
        key: 'import',
        label: 'Import',
        description: 'Bring in a schedule from CSV or export for editing offline.',
      },
    ],
  },
  {
    id: 'people',
    label: 'People',
    items: [
      {
        key: 'people',
        label: 'People',
        description: 'Staff shifts, volunteer ops, roster, and crew coverage.',
      },
    ],
  },
  {
    id: 'communications',
    label: 'Communications',
    items: [
      {
        key: 'messaging',
        label: 'Messaging',
        description: 'Announcements and attendee communications for this convention.',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      {
        key: 'settings',
        label: 'Settings',
        description: 'Dates, branding, logistics, documents, and Dancecard configuration.',
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    items: [
      {
        key: 'exports',
        label: 'Exports',
        description: 'Download schedules, ICS feeds, and operational reports.',
      },
      {
        key: 'integrations',
        label: 'Integrations',
        description: 'ECKE Dancecard publish, clone, and external links.',
      },
    ],
  },
]

export const ALL_CONVENTION_TABS: ConventionOrganizerTab[] = CONVENTION_SIDEBAR_SECTIONS.flatMap((s) =>
  s.items.map((i) => i.key),
)

export function isConventionOrganizerTab(value: string | null): value is ConventionOrganizerTab {
  return value !== null && (ALL_CONVENTION_TABS as string[]).includes(value)
}

export function parseConventionOrganizerTab(raw: string | null): ConventionOrganizerTab {
  if (isConventionOrganizerTab(raw)) return raw
  return 'dashboard'
}

export function labelForConventionTab(tab: ConventionOrganizerTab): string {
  for (const section of CONVENTION_SIDEBAR_SECTIONS) {
    const hit = section.items.find((i) => i.key === tab)
    if (hit) return hit.label
  }
  return tab
}

export function descriptionForConventionTab(tab: ConventionOrganizerTab): string {
  for (const section of CONVENTION_SIDEBAR_SECTIONS) {
    const hit = section.items.find((i) => i.key === tab)
    if (hit) return hit.description
  }
  return ''
}

export function parsePeopleSubTab(raw: string | null): ConventionPeopleSubTab {
  if (raw && (CONVENTION_PEOPLE_SUB_TABS as string[]).includes(raw)) return raw as ConventionPeopleSubTab
  return 'staff'
}

export function parseSettingsPanel(raw: string | null): ConventionSettingsPanel {
  if (raw && (CONVENTION_SETTINGS_PANELS as string[]).includes(raw)) return raw as ConventionSettingsPanel
  return 'basics'
}
