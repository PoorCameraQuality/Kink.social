import type { GroupsScopeTab } from '@/lib/groups-page-utils'

const TABS: { id: GroupsScopeTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'near-you', label: 'Near you' },
  { id: 'new', label: 'New' },
  { id: 'popular', label: 'Popular' },
  { id: 'suggested', label: 'Suggested' },
]

type Props = {
  active: GroupsScopeTab
  onChange: (tab: GroupsScopeTab) => void
}

export default function GroupsScopeTabs({ active, onChange }: Props) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Group discovery scope">
      {TABS.map((tab) => {
        const selected = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selected ?
                'bg-dc-accent text-dc-accent-foreground shadow-[var(--dc-tab-active-shadow)]'
              : 'border border-dc-border bg-dc-elevated-solid text-dc-text-muted hover:border-dc-accent-border/50 hover:text-dc-text'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
