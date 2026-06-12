import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_PUBLIC_PROFILE_TAB,
  resolvePublicProfileTab,
  type PublicProfileTab,
} from '@/lib/public-profile-tabs'

export function usePublicProfileTabFromUrl(
  defaultTab: PublicProfileTab = DEFAULT_PUBLIC_PROFILE_TAB,
): [PublicProfileTab, (tab: PublicProfileTab) => void] {
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<PublicProfileTab>(() =>
    resolvePublicProfileTab(tabParam, defaultTab),
  )

  useEffect(() => {
    setActiveTab(resolvePublicProfileTab(tabParam, defaultTab))
  }, [tabParam, defaultTab])

  return [activeTab, setActiveTab]
}
