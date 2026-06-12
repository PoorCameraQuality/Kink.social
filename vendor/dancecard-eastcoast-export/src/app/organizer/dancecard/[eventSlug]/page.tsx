import { OrganizerDancecardClient } from './OrganizerDancecardClient'

export default function OrganizerDancecardPage({ params }: { params: { eventSlug: string } }) {
  return <OrganizerDancecardClient eventSlug={params.eventSlug} />
}
