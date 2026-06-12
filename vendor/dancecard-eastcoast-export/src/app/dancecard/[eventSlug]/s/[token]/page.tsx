import type { Metadata } from 'next'
import { ShareDancecardClient } from '@/components/dancecard/ShareDancecardClient'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Shared dancecard — East Coast Kink Events',
}

export default function DancecardSharePage({ params }: { params: { eventSlug: string; token: string } }) {
  return <ShareDancecardClient eventSlug={params.eventSlug} token={params.token} />
}
