import TabButton from '@/components/ui/TabButton'

import type { PublicProfileTab, PublicProfileTabCounts } from '@/lib/public-profile-tabs'
import { getPublicProfileTabLabel } from '@/lib/public-profile-tabs'
import { cn } from '@/lib/cn'

type Props = {
  tabs: readonly PublicProfileTab[]
  activeTab: string
  onSelect: (tab: PublicProfileTab) => void
  tabCounts?: PublicProfileTabCounts
  /** Horizontal scroll on mobile; vertical rail on desktop */
  layout?: 'horizontal' | 'responsive'
}

export default function ProfileTabBar({ tabs, activeTab, onSelect, tabCounts, layout = 'horizontal' }: Props) {
  const verticalDesktop = layout === 'responsive'

  return (
    <div
      className={cn(
        verticalDesktop ?
          '-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 lg:mx-0 lg:block lg:overflow-visible lg:rounded-xl lg:border lg:border-dc-border lg:bg-dc-elevated/60 lg:p-1.5 lg:space-y-0.5'
        : '-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0',
      )}
      role="tablist"
      aria-label="Profile sections"
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab}
          label={getPublicProfileTabLabel(tab, tabCounts)}
          isActive={activeTab === tab}
          onClick={() => onSelect(tab)}
          size={verticalDesktop ? 'small' : 'default'}
          className={cn(
            verticalDesktop && 'lg:w-full lg:justify-start lg:rounded-lg lg:px-3 lg:text-left lg:min-h-11 lg:text-sm',
            verticalDesktop && activeTab === tab && 'lg:shadow-none',
          )}
        />
      ))}
    </div>
  )
}
