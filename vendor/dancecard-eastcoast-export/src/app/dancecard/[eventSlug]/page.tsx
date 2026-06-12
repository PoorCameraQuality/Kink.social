import { DancecardClient } from '@/components/dancecard/DancecardClient'

export default function DancecardEventPage({ params }: { params: { eventSlug: string } }) {
  const slug = params.eventSlug.toLowerCase()
  return <DancecardClient eventSlug={slug} />
}
