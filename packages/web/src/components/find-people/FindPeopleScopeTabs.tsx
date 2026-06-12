import { PEOPLE_STREAM_TABS } from '@/lib/people-search-constants'

type Props = {
  active: string
  onChange: (tab: string) => void
  totalCount: number
}

export default function FindPeopleScopeTabs({ active, onChange, totalCount }: Props) {
  return (
    <div
      className="mb-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="People browse scope"
    >
      {PEOPLE_STREAM_TABS.map((tab) => {
        const selected = active === tab
        const label = tab === 'Recommended' ? `${tab} (${totalCount})` : tab
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab)}
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
