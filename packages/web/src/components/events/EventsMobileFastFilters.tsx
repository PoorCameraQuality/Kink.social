import { cn } from '@/lib/cn'
import type { EventsScopeTab } from '@/lib/events-page-utils'

type FormatFilter = 'all' | 'in-person' | 'virtual'

type Chip = {
  id: string
  label: string
  active: boolean
  onClick: () => void
}

type Props = {
  scopeTab: EventsScopeTab
  eventFormatFilter: FormatFilter
  isAuthenticated: boolean
  onScopeChange: (tab: EventsScopeTab) => void
  onFormatChange: (format: FormatFilter) => void
  onReset: () => void
  className?: string
}

export default function EventsMobileFastFilters({
  scopeTab,
  eventFormatFilter,
  isAuthenticated,
  onScopeChange,
  onFormatChange,
  onReset,
  className,
}: Props) {
  const chips: Chip[] = [
    {
      id: 'all',
      label: 'All upcoming',
      active: scopeTab === 'all' && eventFormatFilter === 'all',
      onClick: onReset,
    },
    {
      id: 'weekend',
      label: 'This weekend',
      active: scopeTab === 'weekend' && eventFormatFilter === 'all',
      onClick: () => {
        onScopeChange('weekend')
        onFormatChange('all')
      },
    },
    {
      id: 'online',
      label: 'Online',
      active: eventFormatFilter === 'virtual',
      onClick: () => {
        onScopeChange('all')
        onFormatChange('virtual')
      },
    },
    {
      id: 'local',
      label: 'In person',
      active: eventFormatFilter === 'in-person',
      onClick: () => {
        onScopeChange('all')
        onFormatChange('in-person')
      },
    },
  ]

  if (isAuthenticated) {
    chips.push({
      id: 'for-you',
      label: 'For you',
      active: scopeTab === 'for-you' && eventFormatFilter === 'all',
      onClick: () => {
        onScopeChange('for-you')
        onFormatChange('all')
      },
    })
  }

  return (
    <div
      className={cn(
        'mb-3 flex gap-2 overflow-x-auto pb-0.5 c2k-no-scrollbar lg:hidden',
        className,
      )}
      role="toolbar"
      aria-label="Quick event filters"
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          aria-pressed={chip.active}
          onClick={chip.onClick}
          className={cn('dc-chip focus-visible:outline-none', chip.active && 'dc-chip--active')}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
