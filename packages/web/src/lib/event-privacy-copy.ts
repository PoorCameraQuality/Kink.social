/** Public copy when venue/details are gated until RSVP or registration. */
export const EVENT_LOCATION_AFTER_RSVP = 'Location shared after RSVP'
export const EVENT_DETAILS_AFTER_RSVP = 'Details unlock after RSVP'

export function formatGatedEventLocation(
  location?: string | null,
  options?: { locationRedacted?: boolean; joinLinkRedacted?: boolean },
): string {
  const trimmed = location?.trim()
  if (trimmed) return trimmed
  if (options?.locationRedacted || options?.joinLinkRedacted) return EVENT_LOCATION_AFTER_RSVP
  return 'TBA'
}
