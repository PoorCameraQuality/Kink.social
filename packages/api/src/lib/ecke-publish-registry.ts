import {
  getEducationOmittedFields,
  getEventOmittedFields,
  getGroupOmittedFields,
  getVendorOmittedFields,
  getVenueOmittedFields,
} from './ecke-redaction.js'

export type EckeSourceKind =
  | 'education_article'
  | 'vendor_profile'
  | 'organization_listing'
  | 'group_listing'
  | 'event_listing'
  | 'convention_listing'
  | 'dancecard_event'
  | 'dancecard_location'
  | 'dancecard_program_slot'
  | 'dancecard_staff_shift'
  | 'presenter_profile'
  | 'dungeon_profile'
  | 'venue_profile'

export type EckePublishSupportState =
  | 'active_existing'
  | 'preview_only'
  | 'planned'
  | 'unsupported'

export type EckePublishTransport = 'ingest_api' | 'supabase_rest' | 'listing_webhook' | 'none'

export type EckeOwnerKind = 'user' | 'group' | 'organization' | 'convention' | 'event'

export type EckeRegistryEntry = {
  sourceKind: EckeSourceKind
  label: string
  description: string
  ownerKind: EckeOwnerKind
  visibleInGroupDashboard: boolean
  visibleInOrgDashboard: boolean
  visibleInConventionDashboard: boolean
  visibleInUserDashboard: boolean
  supportState: EckePublishSupportState
  eckeTargetKind: string
  currentTransport: EckePublishTransport
  requiresPermission: string
  privacySummary: string
  omittedFields: readonly string[]
  eckeSurfacesAffected: readonly string[]
}

export const PASS2_DISABLED_ACTIONS = {
  preview: true,
  publish: false,
  sync: false,
  unpublish: false,
} as const

export const PASS2_ACTION_LABELS = {
  publish: 'Coming in Pass 3',
  sync: 'Coming in Pass 3',
  unpublish: 'Coming in Pass 3',
} as const

const GROUP_LISTING_SURFACES = [
  'ECKE directory/listing pages',
  'ECKE sitemap after publish',
  'ECKE state/location pages if location data exists',
] as const

const EVENT_SURFACES = [
  'ECKE events index',
  'ECKE event detail page',
  'ECKE calendar',
  'ECKE state pages',
  'ECKE sitemap after publish',
] as const

export const ECKE_PUBLISH_REGISTRY: readonly EckeRegistryEntry[] = [
  {
    sourceKind: 'education_article',
    label: 'Education article',
    description: 'Public education articles published via ECKE ingest API.',
    ownerKind: 'user',
    visibleInGroupDashboard: true,
    visibleInOrgDashboard: true,
    visibleInConventionDashboard: false,
    visibleInUserDashboard: true,
    supportState: 'active_existing',
    eckeTargetKind: 'ecke_article',
    currentTransport: 'ingest_api',
    requiresPermission: 'article.author',
    privacySummary: 'Only published public articles with ECKE opt-in.',
    omittedFields: getEducationOmittedFields().map((f) => f.label),
    eckeSurfacesAffected: [
      'Education article page',
      'Education index',
      'Sitemap',
      'Related education surfaces (when ECKE supports them)',
    ],
  },
  {
    sourceKind: 'vendor_profile',
    label: 'Vendor profile',
    description: 'Public vendor shop listings on ECKE.',
    ownerKind: 'user',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: false,
    visibleInConventionDashboard: false,
    visibleInUserDashboard: true,
    supportState: 'active_existing',
    eckeTargetKind: 'ecke_vendor',
    currentTransport: 'supabase_rest',
    requiresPermission: 'vendor.owner',
    privacySummary: 'Only public vendor profiles.',
    omittedFields: getVendorOmittedFields().map((f) => f.label),
    eckeSurfacesAffected: ['ECKE vendors index', 'ECKE vendor detail page'],
  },
  {
    sourceKind: 'organization_listing',
    label: 'Organization listing',
    description: 'Public organization directory listing on ECKE.',
    ownerKind: 'organization',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: true,
    visibleInConventionDashboard: false,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'ecke_listing',
    currentTransport: 'listing_webhook',
    requiresPermission: 'org.moderator',
    privacySummary: 'Only public organizations.',
    omittedFields: ['Internal org notes', 'Member roster', 'Moderation notes'],
    eckeSurfacesAffected: ['ECKE directory/listing pages'],
  },
  {
    sourceKind: 'group_listing',
    label: 'Group listing',
    description: 'Public group directory listing on East Coast Kink Events.',
    ownerKind: 'group',
    visibleInGroupDashboard: true,
    visibleInOrgDashboard: false,
    visibleInConventionDashboard: false,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'ecke_listing',
    currentTransport: 'listing_webhook',
    requiresPermission: 'group.moderator',
    privacySummary: 'Only public groups. Member lists never publish.',
    omittedFields: getGroupOmittedFields().map((f) => f.label),
    eckeSurfacesAffected: GROUP_LISTING_SURFACES,
  },
  {
    sourceKind: 'event_listing',
    label: 'Public event',
    description: 'Standalone public events on ECKE events directory.',
    ownerKind: 'event',
    visibleInGroupDashboard: true,
    visibleInOrgDashboard: true,
    visibleInConventionDashboard: false,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'ecke_event',
    currentTransport: 'supabase_rest',
    requiresPermission: 'event.host_or_org_mod',
    privacySummary: 'Only public events. Location visibility rules apply.',
    omittedFields: getEventOmittedFields('rsvp').map((f) => f.label),
    eckeSurfacesAffected: EVENT_SURFACES,
  },
  {
    sourceKind: 'convention_listing',
    label: 'Convention listing',
    description: 'Convention public ECKE listing and event row.',
    ownerKind: 'convention',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: false,
    visibleInConventionDashboard: true,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'ecke_listing',
    currentTransport: 'listing_webhook',
    requiresPermission: 'convention.full_admin',
    privacySummary: 'Convention full admin only.',
    omittedFields: ['Attendee roster', 'Staff notes', 'Private operational notes'],
    eckeSurfacesAffected: ['ECKE events index', 'ECKE event detail', 'ECKE sitemap'],
  },
  {
    sourceKind: 'dancecard_event',
    label: 'Dancecard event',
    description: 'Dancecard attendee app program shell.',
    ownerKind: 'convention',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: false,
    visibleInConventionDashboard: true,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'dancecard_event',
    currentTransport: 'supabase_rest',
    requiresPermission: 'convention.full_admin',
    privacySummary: 'Program data filtered for anonymous public view.',
    omittedFields: ['Staff user IDs', 'Private operational notes'],
    eckeSurfacesAffected: ['ECKE Dancecard app', 'Dancecard embed'],
  },
  {
    sourceKind: 'dancecard_location',
    label: 'Dancecard locations',
    description: 'Convention venue rooms synced to Dancecard.',
    ownerKind: 'convention',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: false,
    visibleInConventionDashboard: true,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'dancecard_event',
    currentTransport: 'supabase_rest',
    requiresPermission: 'convention.full_admin',
    privacySummary: 'Public program locations only.',
    omittedFields: ['Private address details'],
    eckeSurfacesAffected: ['ECKE Dancecard map'],
  },
  {
    sourceKind: 'dancecard_program_slot',
    label: 'Dancecard program slots',
    description: 'Published schedule slots on Dancecard.',
    ownerKind: 'convention',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: false,
    visibleInConventionDashboard: true,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'dancecard_event',
    currentTransport: 'supabase_rest',
    requiresPermission: 'convention.full_admin',
    privacySummary: 'Anonymous public program filter applied.',
    omittedFields: ['Staff notes', 'Private slot notes'],
    eckeSurfacesAffected: ['ECKE Dancecard schedule'],
  },
  {
    sourceKind: 'dancecard_staff_shift',
    label: 'Dancecard staff shifts',
    description: 'Volunteer shift display names on Dancecard.',
    ownerKind: 'convention',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: false,
    visibleInConventionDashboard: true,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'dancecard_event',
    currentTransport: 'supabase_rest',
    requiresPermission: 'convention.full_admin',
    privacySummary: 'Display names only; no user IDs.',
    omittedFields: ['User IDs', 'Private contact info'],
    eckeSurfacesAffected: ['ECKE Dancecard staff view'],
  },
  {
    sourceKind: 'presenter_profile',
    label: 'Presenter profile',
    description: 'Public presenter directory pages on ECKE.',
    ownerKind: 'user',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: false,
    visibleInConventionDashboard: false,
    visibleInUserDashboard: true,
    supportState: 'planned',
    eckeTargetKind: 'presenter_profile',
    currentTransport: 'none',
    requiresPermission: 'presenter.owner',
    privacySummary: 'Not yet implemented.',
    omittedFields: ['Private profile fields', 'Moderation notes'],
    eckeSurfacesAffected: [],
  },
  {
    sourceKind: 'dungeon_profile',
    label: 'Dungeon listing',
    description: 'Org-flagged dungeon/venue on ECKE dungeons directory.',
    ownerKind: 'organization',
    visibleInGroupDashboard: false,
    visibleInOrgDashboard: true,
    visibleInConventionDashboard: false,
    visibleInUserDashboard: false,
    supportState: 'active_existing',
    eckeTargetKind: 'ecke_dungeon',
    currentTransport: 'supabase_rest',
    requiresPermission: 'org.moderator',
    privacySummary: 'Public-safe venue info only.',
    omittedFields: getVenueOmittedFields().map((f) => f.label),
    eckeSurfacesAffected: ['ECKE dungeons index', 'ECKE dungeon detail'],
  },
  {
    sourceKind: 'venue_profile',
    label: 'Venue / place',
    description: 'Standalone venue or place listing on ECKE.',
    ownerKind: 'organization',
    visibleInGroupDashboard: true,
    visibleInOrgDashboard: true,
    visibleInConventionDashboard: false,
    visibleInUserDashboard: false,
    supportState: 'planned',
    eckeTargetKind: 'ecke_dungeon',
    currentTransport: 'none',
    requiresPermission: 'org.moderator',
    privacySummary: 'Group-owned venue publishing not wired yet.',
    omittedFields: getVenueOmittedFields().map((f) => f.label),
    eckeSurfacesAffected: ['ECKE dungeons index'],
  },
] as const

export function getRegistryEntry(sourceKind: EckeSourceKind): EckeRegistryEntry | undefined {
  return ECKE_PUBLISH_REGISTRY.find((e) => e.sourceKind === sourceKind)
}

export function listRegistryForGroupDashboard(): EckeRegistryEntry[] {
  return ECKE_PUBLISH_REGISTRY.filter((e) => e.visibleInGroupDashboard)
}

export function listRegistryForOrgDashboard(): EckeRegistryEntry[] {
  return ECKE_PUBLISH_REGISTRY.filter((e) => e.visibleInOrgDashboard)
}

export function listAllRegistryEntries(): EckeRegistryEntry[] {
  return [...ECKE_PUBLISH_REGISTRY]
}

export function isValidEckeSourceKind(value: string): value is EckeSourceKind {
  return ECKE_PUBLISH_REGISTRY.some((e) => e.sourceKind === value)
}
