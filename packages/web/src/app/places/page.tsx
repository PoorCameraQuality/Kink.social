import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CommunityPlacesBrowse, {
  PlacesCategoryToolbar,
  PlacesLocationNotice,
  PlacesSuggestForm,
} from '@/components/places/CommunityPlacesBrowse'
import DiscoveryBrowseLinks from '@/components/discovery/DiscoveryBrowseLinks'
import DirectoryTemplate from '@/components/templates/DirectoryTemplate'
import { cn } from '@/lib/cn'
import { shellOuterClass } from '@/lib/shell-contract'

export default function PlacesPage() {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') ?? ''
  const [category, setCategory] = useState(initialCategory)

  useEffect(() => {
    setCategory(searchParams.get('category') ?? '')
  }, [searchParams])

  return (
    <div className={cn(shellOuterClass, 'c2k-mobile-scroll-pad')}>
      <DirectoryTemplate
        title="Places"
        description="Community-submitted venues and resources. Dungeons, clubs, kink-friendly hotels, and web resources."
        className="py-6 sm:py-8"
        toolbar={
          <div className="space-y-4">
            <PlacesCategoryToolbar category={category} onCategoryChange={setCategory} />
            <PlacesLocationNotice />
          </div>
        }
        footer={
          <div className="mt-10 space-y-10">
            <PlacesSuggestForm category={category} />
            <DiscoveryBrowseLinks />
          </div>
        }
      >
        <CommunityPlacesBrowse category={category} onCategoryChange={setCategory} omitToolbar omitSuggestForm />
      </DirectoryTemplate>
    </div>
  )
}
