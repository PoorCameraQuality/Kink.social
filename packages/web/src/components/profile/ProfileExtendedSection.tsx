import type { ReactNode } from 'react'

import ProfileTabBar from '@/components/profile/ProfileTabBar'
import type { PublicProfileTab, PublicProfileTabCounts } from '@/lib/public-profile-tabs'
import { cn } from '@/lib/cn'

type Props = {
  viewerIsOwner: boolean
  visibleTabs: readonly PublicProfileTab[]
  activeTab: PublicProfileTab
  onSelect: (tab: PublicProfileTab) => void
  tabCounts?: PublicProfileTabCounts
  /** Legacy inline sidebar — hidden on desktop when network rail is external */
  sidebar?: ReactNode
  children: ReactNode
}

export default function ProfileExtendedSection({
  viewerIsOwner,
  visibleTabs,
  activeTab,
  onSelect,
  tabCounts,
  sidebar,
  children,
}: Props) {
  if (visibleTabs.length === 0 && !sidebar) return null

  const showLegacySidebar = Boolean(sidebar)
  const singleTab = visibleTabs.length === 1

  return (
    <section className="mt-6 border-t border-dc-border/60 pt-5 sm:mt-8 sm:border-white/[0.06] sm:pt-6 lg:mt-0 lg:border-t-0 lg:pt-0">
      <div className="mb-4 hidden lg:block">
        <h2 className="text-lg font-semibold tracking-tight text-dc-text">
          {viewerIsOwner ? 'Profile' : 'Member profile'}
        </h2>
        <p className="mt-1 text-sm text-dc-text-muted">
          {viewerIsOwner ?
            'Writing, photos, connections, and history.'
          : 'Writing, photos, and community details.'}
        </p>
      </div>

      {!singleTab ?
        <div className="mb-2 lg:hidden sm:mb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dc-muted/75">
            {viewerIsOwner ? 'Profile tools' : 'Extended profile'}
          </h2>
          <p className="mt-1 hidden max-w-2xl text-xs leading-relaxed text-dc-text-muted sm:block sm:text-sm">
            {viewerIsOwner ?
              'Writing, event history, references, connections, and photos — grouped below your public story.'
            : 'Additional details beyond the profile summary above.'}
          </p>
        </div>
      : null}

      <div
        className={cn(
          visibleTabs.length > 0 &&
            'lg:grid lg:grid-cols-[minmax(168px,200px)_minmax(0,1fr)] lg:items-start lg:gap-8',
        )}
      >
        {visibleTabs.length > 0 ?
          <div className={cn('lg:sticky lg:top-24 lg:self-start', singleTab && 'hidden lg:block')}>
            <ProfileTabBar
              tabs={visibleTabs}
              activeTab={activeTab}
              onSelect={onSelect}
              tabCounts={tabCounts}
              layout="responsive"
            />
          </div>
        : null}

        <div
          className={cn(
            showLegacySidebar ?
              'mt-4 flex flex-col gap-6 sm:mt-5 lg:mt-0 lg:grid lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)] lg:items-start lg:gap-8'
            : cn('min-w-0 space-y-6 pb-2 lg:mt-0', singleTab ? 'mt-0' : 'mt-4 sm:mt-5'),
          )}
        >
          {showLegacySidebar ?
            <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:self-start">{sidebar}</aside>
          : null}
          <div className="min-w-0 space-y-6 pb-[calc(var(--c2k-fab-size)+var(--c2k-fab-gap)+1.5rem)] sm:pb-2 lg:pb-2">{children}</div>
        </div>
      </div>
    </section>
  )
}
