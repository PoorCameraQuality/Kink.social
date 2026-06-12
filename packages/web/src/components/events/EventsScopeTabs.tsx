import type { EventsScopeTab } from '@/lib/events-page-utils'

const TABS: { id: EventsScopeTab; label: string }[] = [
  { id: 'all', label: 'All Events' },
  { id: 'for-you', label: 'For You' },
  { id: 'weekend', label: 'This Weekend' },
  { id: 'next7', label: 'Next 7 Days' },
  { id: 'month', label: 'This Month' },
]

type Props = {
  active: EventsScopeTab
  onChange: (tab: EventsScopeTab) => void
  totalCount: number
}

export default function EventsScopeTabs({ active, onChange, totalCount }: Props) {
  return (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Event time scope">
      {TABS.map((tab) => {
        const selected = active === tab.id
        const label = tab.id === 'all' ? `${tab.label} (${totalCount})` : tab.label
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              selected ?
                'bg-dc-accent text-dc-accent-foreground shadow-[var(--dc-tab-active-shadow)]'
              : 'border border-dc-border bg-dc-elevated-solid text-dc-text-muted hover:border-dc-accent-border/50 hover:text-dc-text'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
