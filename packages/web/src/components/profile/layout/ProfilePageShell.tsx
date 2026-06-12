import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Props = {
  className?: string
  /** Banners, load errors, self-view notice */
  alerts?: ReactNode
  /** Desktop cover + identity row (lg+) */
  cover?: ReactNode
  /** Full story stack for mobile */
  mobileStory?: ReactNode
  /** Sticky left rail: about, snapshot, community (lg+) */
  desktopSidebar?: ReactNode
  /** Tabs + tab panels */
  main: ReactNode
  /** Sticky network rail (lg+) */
  networkRail?: ReactNode
  footer?: ReactNode
  /** Owner hub etc. below main grid */
  afterGrid?: ReactNode
}

/**
 * Desktop profile layout: cover header, 3-column grid (story | tabs | network).
 * Mobile keeps a single stacked column.
 */
export default function ProfilePageShell({
  className,
  alerts,
  cover,
  mobileStory,
  desktopSidebar,
  main,
  networkRail,
  footer,
  afterGrid,
}: Props) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8', className)}>
      {alerts}
      {cover}
      <div
        className={cn(
          networkRail ?
            'lg:grid lg:grid-cols-[minmax(260px,280px)_minmax(0,1fr)_minmax(240px,260px)] lg:items-start lg:gap-8'
          : 'lg:grid lg:grid-cols-[minmax(260px,280px)_minmax(0,1fr)] lg:items-start lg:gap-8',
        )}
      >
        {desktopSidebar ?
          <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:space-y-4">
            {desktopSidebar}
          </aside>
        : null}
        <div className="min-w-0">
          {mobileStory ? <div className="mb-6 lg:hidden">{mobileStory}</div> : null}
          {main}
          {afterGrid ? <div className="mt-8">{afterGrid}</div> : null}
        </div>
        {networkRail ?
          <aside className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
            {networkRail}
          </aside>
        : null}
      </div>
      {footer ? <footer className="mt-8 border-t border-dc-border pt-6">{footer}</footer> : null}
    </div>
  )
}
