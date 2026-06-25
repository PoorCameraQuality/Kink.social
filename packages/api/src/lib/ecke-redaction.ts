import { sanitizeEckePublicText } from '@c2k/shared'

/** Field names that must never appear in ECKE outbound payloads. */
export const ECKE_NEVER_PUBLISH_FIELDS = [
  'privateNotes',
  'internalNotes',
  'memberOnlyBody',
  'connectionOnlyBody',
  'draftBody',
  'hiddenAuthorData',
  'moderationNotes',
  'applicationMaterials',
  'references',
  'safetyReports',
  'attendeeNames',
  'rsvpList',
  'privateAddress',
  'privateContact',
  'staffOnlyNotes',
  'organizerOnlyMaterials',
  'applicationAnswers',
  'groupMemberList',
  'privateGroupDescription',
  'exactLocationWhenHidden',
  'messages',
  'email',
  'phone',
  'legalName',
  'governmentId',
  'backgroundCheckData',
] as const

export type EckeOmittedField = {
  label: string
  reason: string
}

export function sanitizePublicEckeText(value: string | null | undefined): string | null {
  return sanitizeEckePublicText(value)?.trim() || null
}

export function resolvePublicLocationForEcke(input: {
  location?: string | null
  publicLocationSummary?: string | null
  locationVisibility: 'public' | 'rsvp' | 'approved' | string
}): { publicLocation: string | null; omittedExactLocation: boolean } {
  const summary = input.publicLocationSummary?.trim() || null
  if (input.locationVisibility === 'public') {
    return {
      publicLocation: summary || input.location?.trim() || null,
      omittedExactLocation: false,
    }
  }
  return {
    publicLocation: summary,
    omittedExactLocation: Boolean(input.location?.trim()),
  }
}

export function getGroupOmittedFields(): EckeOmittedField[] {
  return [
    { label: 'Member list', reason: 'Group membership is never published to ECKE.' },
    { label: 'Hidden membership settings', reason: 'Membership privacy settings are not affected by ECKE.' },
    { label: 'Private group description', reason: 'Member-only or internal descriptions stay on kink.social.' },
    { label: 'RSVP list', reason: 'Event RSVP data is never published.' },
    { label: 'Private address', reason: 'Exact private addresses are omitted.' },
    { label: 'Staff notes', reason: 'Operational staff notes stay internal.' },
    { label: 'Moderation notes', reason: 'Moderation data is never published.' },
    { label: 'Application answers', reason: 'Join or vetting answers stay private.' },
    { label: 'Private messages', reason: 'Messages and DMs are never published.' },
  ]
}

export function getEventOmittedFields(locationVisibility: string): EckeOmittedField[] {
  const base: EckeOmittedField[] = [
    { label: 'Attendee names', reason: 'RSVP rosters are never published to ECKE.' },
    { label: 'RSVP list', reason: 'RSVP data stays on kink.social.' },
    { label: 'Staff notes', reason: 'Operational notes stay internal.' },
    { label: 'Internal notes', reason: 'Organizer-only notes stay on kink.social.' },
    { label: 'Moderation notes', reason: 'Moderation data is never published.' },
    { label: 'Messages', reason: 'Private messages are never published.' },
    { label: 'Screening question answers', reason: 'Application answers stay private.' },
    { label: 'Approved-attendee-only location', reason: 'Exact address for approved attendees only is never published.' },
  ]
  if (locationVisibility !== 'public') {
    base.unshift({
      label: 'Exact private location',
      reason: 'Full address is hidden when location visibility is not public.',
    })
  }
  return base
}

/** Public-safe event data ECKE does not display yet — shown in preview as deferred, not omitted. */
export function getEventDeferredFields(): EckeOmittedField[] {
  return [
    {
      label: 'Public schedule blocks',
      reason: 'Public-safe but ECKE event page does not display schedule blocks yet.',
    },
    {
      label: 'Public map pins',
      reason: 'Public-safe but ECKE event page does not display map pins yet.',
    },
    {
      label: 'Accessibility information',
      reason: 'Public-safe but ECKE event page does not display accessibility info yet.',
    },
    {
      label: 'Parking / transit information',
      reason: 'Public-safe but ECKE event page does not display parking or transit info yet.',
    },
    {
      label: 'Public policies / code of conduct',
      reason: 'Public-safe but ECKE event page does not display policies yet.',
    },
    {
      label: 'Public ticket / registration links',
      reason: 'Public-safe but ECKE event page may not display ticket links yet.',
    },
  ]
}

export function getEducationOmittedFields(): EckeOmittedField[] {
  return [
    { label: 'Draft body', reason: 'Draft content is never published.' },
    { label: 'Member-only body', reason: 'Member-only sections stay on kink.social.' },
    { label: 'Connection-only body', reason: 'Connection-only content is not public SEO.' },
    { label: 'Hidden author data', reason: 'Private profile fields are omitted.' },
    { label: 'Moderation notes', reason: 'Moderation data is never published.' },
  ]
}

export function getVendorOmittedFields(): EckeOmittedField[] {
  return [
    { label: 'Private owner contact', reason: 'Private contact fields stay on kink.social unless explicitly public.' },
    { label: 'Internal notes', reason: 'Shop operator notes are never published.' },
    { label: 'Moderation notes', reason: 'Moderation data is never published.' },
  ]
}

export function getVenueOmittedFields(): EckeOmittedField[] {
  return [
    { label: 'Private address', reason: 'Exact private addresses are omitted for non-public venues.' },
    { label: 'Staff notes', reason: 'Operational notes stay internal.' },
    { label: 'Internal owner notes', reason: 'Internal notes are never published.' },
  ]
}

export function isPublicGroupVisibility(visibility: string): boolean {
  return visibility.toLowerCase() === 'public'
}

export function isGroupListingEntityEligible(input: {
  visibility: string
  disbandedAt?: Date | null
}): { eligible: boolean; reason?: string } {
  if (input.disbandedAt) {
    return { eligible: false, reason: 'Disbanded groups cannot publish to East Coast Kink Events.' }
  }
  if (!isPublicGroupVisibility(input.visibility)) {
    return {
      eligible: false,
      reason: 'Only public groups can be listed on East Coast Kink Events. Private and invite-only groups are not eligible.',
    }
  }
  return { eligible: true }
}
