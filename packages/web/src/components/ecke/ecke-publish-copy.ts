export type EckeWriteKind =
  | 'group_listing'
  | 'event_listing'
  | 'education_article'
  | 'vendor_profile'
  | 'organization_listing'
  | 'dungeon_profile'
  | 'venue_profile'
  | 'convention_listing'
  | 'convention_event_anchor'
  | 'dancecard_event'
  | 'presenter_profile'

const LABELS: Record<EckeWriteKind, string> = {
  group_listing: 'group listing',
  event_listing: 'event listing',
  education_article: 'education article',
  vendor_profile: 'vendor profile',
  organization_listing: 'organization listing',
  dungeon_profile: 'dungeon or venue listing',
  venue_profile: 'venue listing',
  convention_listing: 'convention listing',
  convention_event_anchor: 'event directory anchor row',
  dancecard_event: 'Dancecard bundle',
  presenter_profile: 'presenter profile',
}

const PRIVATE_DATA_NOTE =
  'Only the public-safe fields shown in the preview will be sent. Member lists, RSVP data, private addresses, staff notes, moderation data, and private messages are never sent.'

export function sourceKindLabel(writeKind: string): string {
  return LABELS[writeKind as EckeWriteKind] ?? 'listing'
}

export function publishWarningFor(writeKind: string): string {
  switch (writeKind as EckeWriteKind) {
    case 'event_listing':
      return `This will create or update a public event listing on East Coast Kink Events. ${PRIVATE_DATA_NOTE}`
    case 'convention_event_anchor':
      return `This will create or update the public ECKE event-directory row for this convention anchor. ${PRIVATE_DATA_NOTE}`
    case 'dancecard_event':
      return `This will publish or update the public-safe Dancecard bundle on East Coast Kink Events. Staff access codes, attendee data, and private operational notes are never sent.`
    case 'education_article':
      return `This will create or update a public education article on East Coast Kink Events. ${PRIVATE_DATA_NOTE}`
    case 'vendor_profile':
      return `This will create or update a public vendor profile on East Coast Kink Events. ${PRIVATE_DATA_NOTE}`
    case 'organization_listing':
      return `This will create or update a public organization listing on East Coast Kink Events. ${PRIVATE_DATA_NOTE}`
    case 'dungeon_profile':
    case 'venue_profile':
      return `This will create or update a public dungeon or venue listing on East Coast Kink Events. ${PRIVATE_DATA_NOTE}`
    case 'convention_listing':
      return `This will create or update a public convention listing on East Coast Kink Events. ${PRIVATE_DATA_NOTE}`
    case 'presenter_profile':
      return `This will create or update a public presenter profile on East Coast Kink Events. ${PRIVATE_DATA_NOTE}`
    case 'group_listing':
    default:
      return `This will create or update a public group listing on East Coast Kink Events. ${PRIVATE_DATA_NOTE}`
  }
}

export function unpublishWarningFor(writeKind: string): string {
  switch (writeKind as EckeWriteKind) {
    case 'event_listing':
      return 'This will remove or hide the public ECKE event listing. It will not delete the event on kink.social.'
    case 'convention_event_anchor':
      return 'This will remove or hide the public ECKE event-directory row for this convention anchor. It will not delete the convention or events on kink.social.'
    case 'dancecard_event':
      return 'This will unpublish the public Dancecard bundle from ECKE. It will not delete the convention or Dancecard data on kink.social.'
    case 'education_article':
      return 'This will remove or hide the public ECKE education article. It will not delete the article on kink.social.'
    case 'vendor_profile':
      return 'This will remove or hide the public ECKE vendor profile. It will not delete the vendor shop on kink.social.'
    case 'organization_listing':
      return 'This will remove or hide the public ECKE organization listing. It will not delete the organization on kink.social.'
    case 'dungeon_profile':
    case 'venue_profile':
      return 'This will remove or hide the public ECKE dungeon or venue listing. It will not delete the place or organization on kink.social.'
    case 'convention_listing':
      return 'This will remove or hide the public ECKE convention listing. It will not delete the convention on kink.social.'
    case 'presenter_profile':
      return 'This will remove or hide the public ECKE presenter profile. It will not delete the presenter profile on kink.social.'
    case 'group_listing':
    default:
      return 'This will remove or hide the public ECKE group listing. It will not delete the group on kink.social.'
  }
}

export const ECKE_PUBLISH_RESTRICTED_MESSAGES: Partial<Record<EckeWriteKind, string>> = {
  vendor_profile: 'Only the vendor owner or co-owner can publish this vendor profile to ECKE.',
  presenter_profile: 'Only the presenter owner can publish this presenter profile to ECKE.',
  venue_profile: 'Only the place submitter or linked organization moderator can publish this venue.',
  convention_listing: 'Convention ECKE controls require full convention admin access.',
  convention_event_anchor: 'Convention ECKE controls require full convention admin access.',
  dancecard_event: 'Convention ECKE controls require full convention admin access.',
}

export const ECKE_PANEL_ACCESS_MESSAGES: Partial<Record<EckeWriteKind, string>> = {
  vendor_profile:
    'You can preview this because you help manage the organization, but only the vendor owner or co-owner can publish it.',
  presenter_profile: 'Only the presenter owner can publish this presenter profile to ECKE.',
  venue_profile: 'Only the place submitter or linked organization moderator can publish this venue.',
  convention_listing: 'Convention ECKE controls require full convention admin access.',
  convention_event_anchor: 'Convention ECKE controls require full convention admin access.',
  dancecard_event: 'Convention ECKE controls require full convention admin access.',
}
