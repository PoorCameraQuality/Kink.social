import { useSearchParams } from 'react-router-dom'
import CommunityPlacesBrowse from '@/components/places/CommunityPlacesBrowse'
import DiscoveryBrowseLinks from '@/components/discovery/DiscoveryBrowseLinks'

export default function PlacesPage() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('category') ?? ''

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-dc-text">Places</h1>
        <p className="mt-2 text-sm text-dc-text-muted leading-relaxed">
          Community-submitted venues and resources. Dungeons, clubs, kink-friendly hotels, and web resources.
        </p>
      </div>
      <CommunityPlacesBrowse initialCategory={category} />
      <DiscoveryBrowseLinks className="mt-10" />
    </div>
  )
}
