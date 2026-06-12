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
    <header className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">Explore the community</h1>
        <p className="mt-2 max-w-2xl text-sm text-dc-text-muted sm:text-base">
          Find events, groups, people, organizations, vendors, and learning resources that match what you are looking
          for.
        </p>
      </div>

      <div className="space-y-2">
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
              placeholder="Search the community..."
              className="min-h-11 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-4 text-sm text-dc-text placeholder:text-dc-muted focus:border-dc-accent focus:outline-none focus:ring-2 focus:ring-dc-accent/30"
              autoComplete="off"
            />
            <p className="text-xs text-dc-muted">
              Search across events, groups, people, organizations, education, and vendors.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenFilters}
            className="inline-flex min-h-11 shrink-0 items-center justify-center self-start rounded-xl border border-dc-border bg-dc-elevated-solid px-5 text-sm font-semibold text-dc-text hover:border-dc-accent-border/50 hover:bg-dc-elevated-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent sm:self-center"
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>

        <ExploreActiveFilterPills pills={activePills} onRemove={onRemoveFilterPill} />
      </div>

      <ExploreChipRow
        chips={discoveryChips}
        onToggle={(id) => onDiscoveryChipToggle(id as ExploreDiscoveryChipId)}
        ariaLabel="Discovery filters"
      />

      <ExploreChipRow
        chips={topicChips}
        onToggle={onTopicChipToggle}
        ariaLabel="Topic filters"
        variant="topic"
      />
    </header>
  )
}
