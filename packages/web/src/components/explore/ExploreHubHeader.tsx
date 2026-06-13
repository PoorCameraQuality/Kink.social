import { useId } from 'react'
import ExploreActiveFilterPills from '@/components/explore/ExploreActiveFilterPills'
import ExploreChipRow from '@/components/explore/ExploreChipRow'
import {
  EXPLORE_DISCOVERY_CHIPS,
  EXPLORE_TOPIC_CHIPS,
  buildExploreActiveFilterPills,
  isDiscoveryChipActive,
  type ExploreActiveFilterPill,
  type ExploreDiscoveryChipId,
  type ExploreFilters,
} from '@/lib/explore-hub'

type Props = {
  searchQuery: string
  onSearchChange: (value: string) => void
  filters: ExploreFilters
  onDiscoveryChipToggle: (chipId: ExploreDiscoveryChipId) => void
  onTopicChipToggle: (topic: string) => void
  onRemoveFilterPill: (pill: ExploreActiveFilterPill) => void
  onOpenFilters: () => void
  activeFilterCount?: number
}

export default function ExploreHubHeader({
  searchQuery,
  onSearchChange,
  filters,
  onDiscoveryChipToggle,
  onTopicChipToggle,
  onRemoveFilterPill,
  onOpenFilters,
  activeFilterCount = 0,
}: Props) {
  const searchId = useId()
  const activePills = buildExploreActiveFilterPills(filters)

  const discoveryChips = EXPLORE_DISCOVERY_CHIPS.map((chip) => ({
    id: chip.id,
    label: chip.label,
    active: isDiscoveryChipActive(filters, chip.id),
  }))

  const topicChips = EXPLORE_TOPIC_CHIPS.map((topic) => ({
    id: topic,
    label: topic,
    active: filters.topics.some((t) => t.toLowerCase() === topic.toLowerCase()),
  }))

  return (
    <header className="space-y-5 lg:space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-dc-accent">Discovery hub</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">Explore the community</h1>
        <p className="mt-2 max-w-2xl text-sm text-dc-text-muted sm:text-base">
          Your map of kink.social — search for something specific, open filters for trust and location, or browse chips
          and sections to jump into events, groups, people, orgs, vendors, and learning.
        </p>
        <p className="mt-2 hidden text-xs font-medium text-dc-muted lg:block">
          Search · filter · browse — all three paths lead to the same directories.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-dc-border/80 bg-dc-elevated-solid/60 p-3 sm:p-4 lg:bg-dc-elevated-solid/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor={searchId} className="sr-only">
              Search the community
            </label>
            <input
              id={searchId}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events, groups, people, orgs, vendors, education…"
              className="min-h-11 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-4 text-sm text-dc-text placeholder:text-dc-muted focus:border-dc-accent focus:outline-none focus:ring-2 focus:ring-dc-accent/30"
              autoComplete="off"
            />
            <p className="text-xs text-dc-muted">
              Matches titles and descriptions across every content type on this page.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-dc-border bg-dc-elevated-solid px-5 text-sm font-semibold text-dc-text hover:border-dc-accent-border/50 hover:bg-dc-elevated-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent sm:self-center"
          >
            <svg className="h-4 w-4 text-dc-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M3 4h18M7 8h10m-7 4h4m-7 4h10"
              />
            </svg>
            <span>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </span>
          </button>
        </div>

        <ExploreActiveFilterPills pills={activePills} onRemove={onRemoveFilterPill} />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Quick filters</p>
          <p className="text-xs text-dc-text-muted">Refine results on this page — opens the same filters as the button above.</p>
        </div>
        <ExploreChipRow
          chips={discoveryChips}
          onToggle={(id) => onDiscoveryChipToggle(id as ExploreDiscoveryChipId)}
          ariaLabel="Discovery filters"
        />
      </div>

      <div className="space-y-2 border-t border-dc-border/50 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Topics</p>
        <p className="text-xs text-dc-text-muted">Interest tags — combine with quick filters or search.</p>
        <ExploreChipRow
          chips={topicChips}
          onToggle={onTopicChipToggle}
          ariaLabel="Topic filters"
          variant="topic"
        />
      </div>
    </header>
  )
}
