import { useEffect, useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CreateGroupModal from '@/components/group/CreateGroupModal'
import GroupDiscoverListCard from '@/components/groups/GroupDiscoverListCard'
import GroupsDiscoverLeftRail from '@/components/groups/GroupsDiscoverLeftRail'
import GroupsPurposeChips from '@/components/groups/GroupsPurposeChips'
import GroupsRightRail from '@/components/groups/GroupsRightRail'
import GroupsScopeTabs from '@/components/groups/GroupsScopeTabs'
import EmptyState from '@/components/ui/EmptyState'
import { GroupSkeleton } from '@/components/ui/skeleton'
import DirectoryTemplate, { DirectoryFilterButton } from '@/components/templates/DirectoryTemplate'
import FilterSheet from '@/components/templates/FilterSheet'
import type { MockGroup } from '@/data/mock-data'
import { mockGroups } from '@/data/mock-data'
import { useAuth } from '@/contexts/AuthContext'
import { useApiGroups, type ApiGroupListItem } from '@/hooks/useApiGroups'
import { usePersistedGeoText } from '@/hooks/usePersistedGeoText'
import { cn } from '@/lib/cn'
import { MAX_DISTANCE_MI, rankGroups } from '@/lib/discovery-utils'
import { shellOuterClass } from '@/lib/shell-contract'
import {
  countGroupsByPurpose,
  deriveGroupDiscoverBadge,
  filterGroupsByPurpose,
  mockFriendsHereCount,
  sortGroupsForDiscover,
  type GroupPurposeFilter,
  type GroupsScopeTab,
  type GroupsSortMode,
} from '@/lib/groups-page-utils'

function mapApiGroup(row: ApiGroupListItem): MockGroup {
  const vis =
    row.visibility === 'private' ? 'private' : row.visibility === 'invite-only' ? 'invite-only' : 'public'
  return {
    id: row.id,
    name: row.name,
    members: row.memberCount ?? 0,
    slug: row.slug,
    visibility: vis,
    category: row.category ?? null,
    tags: row.tags ?? undefined,
    descriptionSnippet: row.descriptionSnippet ?? null,
    memberAvatars: row.memberAvatars,
    coverImageUrl: row.coverImageUrl ?? null,
    placeLabel: row.placeLabel ?? null,
    location: row.placeLabel ?? undefined,
    distanceMi: row.distanceMi,
    createdAt: row.createdAt,
    joinMode: vis === 'public' ? 'open' : 'apply',
  }
}

function countGroupsActiveFilters(args: {
  searchQuery: string
  selectedPurposes: GroupPurposeFilter[]
  scopeTab: GroupsScopeTab
  distance: number
  country: string
  city: string
}): number {
  let count = 0
  if (args.searchQuery.trim()) count++
  count += args.selectedPurposes.length
  if (args.scopeTab !== 'all') count++
  if (args.distance < MAX_DISTANCE_MI) count++
  if (args.country.trim()) count++
  if (args.city.trim()) count++
  return count
}

export default function GroupsDiscoverPage() {
  const searchId = useId()
  const mainSearchId = useId()
  const [searchParams, setSearchParams] = useSearchParams()

  const { isAuthenticated } = useAuth()
  const homeDemoFallbackEnv = import.meta.env.VITE_HOME_DEMO_FALLBACK === 'true'
  const useDemoFallback = homeDemoFallbackEnv && !isAuthenticated

  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [morePurposeOpen, setMorePurposeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPurposes, setSelectedPurposes] = useState<GroupPurposeFilter[]>([])
  const [scopeTab, setScopeTab] = useState<GroupsScopeTab>('all')
  const [sortMode, setSortMode] = useState<GroupsSortMode>('popular')
  const [distance, setDistance] = useState(MAX_DISTANCE_MI)
  const { country, setCountry, city, setCity } = usePersistedGeoText()
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('create') === 'group') {
      setCreateOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('create')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const apiCategory = selectedPurposes.length === 1 && selectedPurposes[0] !== 'Support' ? selectedPurposes[0] : null
  const apiGroups = useApiGroups(!useDemoFallback, apiCategory)
  const [nearbyGroups, setNearbyGroups] = useState<MockGroup[] | null>(null)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState<string | null>(null)

  useEffect(() => {
    if (scopeTab !== 'near-you' || useDemoFallback || apiGroups.status !== 'ready') {
      setNearbyGroups(null)
      setNearbyError(null)
      return
    }
    let cancelled = false
    setNearbyLoading(true)
    setNearbyError(null)
    ;(async () => {
      try {
        const radius = distance >= MAX_DISTANCE_MI ? 200 : distance
        const r = await fetch(
          `/api/v1/groups/nearby?radius=${encodeURIComponent(String(radius))}&limit=48`,
          { credentials: 'include' },
        )
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string }
          if (!cancelled) {
            setNearbyError(j.error ?? 'Could not load nearby groups.')
            setNearbyGroups([])
          }
          return
        }
        const j = (await r.json()) as { items?: ApiGroupListItem[] }
        if (!cancelled) setNearbyGroups((j.items ?? []).map(mapApiGroup))
      } catch {
        if (!cancelled) {
          setNearbyError('Network error loading nearby groups.')
          setNearbyGroups([])
        }
      } finally {
        if (!cancelled) setNearbyLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [scopeTab, distance, apiGroups.status, useDemoFallback])

  const dbGroups = useMemo(() => {
    if (apiGroups.status !== 'ready') return null
    return apiGroups.items.map(mapApiGroup)
  }, [apiGroups])

  const apiBackedGroups = dbGroups !== null

  const groupSource = useMemo(() => {
    if (useDemoFallback) return mockGroups
    if (apiBackedGroups && scopeTab === 'near-you' && nearbyGroups !== null) return nearbyGroups
    if (apiBackedGroups) return dbGroups
    return []
  }, [useDemoFallback, apiBackedGroups, dbGroups, scopeTab, nearbyGroups])

  const purposeCounts = useMemo(() => countGroupsByPurpose(groupSource), [groupSource])

  const togglePurpose = (label: GroupPurposeFilter) => {
    setSelectedPurposes((prev) => (prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]))
  }

  const rankOptions = useMemo(
    () => ({
      searchQuery,
      distanceMi: distance,
      visibility: undefined,
      category: undefined,
      cityFilter: city,
      countryFilter: country,
      sortBy:
        scopeTab === 'near-you' ? ('nearby' as const)
        : scopeTab === 'new' ? ('new' as const)
        : scopeTab === 'popular' || scopeTab === 'suggested' ? ('relevance' as const)
        : ('diverse' as const),
    }),
    [searchQuery, distance, city, country, scopeTab],
  )

  const filteredGroups = useMemo(() => {
    let list = rankGroups(groupSource, rankOptions)
    if (selectedPurposes.length > 0) {
      list = filterGroupsByPurpose(list, selectedPurposes)
    }
    if (scopeTab === 'suggested') {
      list = [...list].sort((a, b) => (b.members ?? 0) - (a.members ?? 0)).slice(0, 24)
    }
    return sortGroupsForDiscover(list, sortMode)
  }, [groupSource, rankOptions, selectedPurposes, scopeTab, sortMode])

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedPurposes.length > 0 ||
    scopeTab !== 'all' ||
    distance < MAX_DISTANCE_MI ||
    Boolean(country.trim()) ||
    Boolean(city.trim())

  const activeFilterCount = countGroupsActiveFilters({
    searchQuery,
    selectedPurposes,
    scopeTab,
    distance,
    country,
    city,
  })

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedPurposes([])
    setScopeTab('all')
    setSortMode('popular')
    setDistance(MAX_DISTANCE_MI)
    setCountry('')
    setCity('')
    setFilterSheetOpen(false)
  }

  const filterState = {
    searchQuery,
    setSearchQuery,
    selectedPurposes,
    togglePurpose,
    distance,
    setDistance,
    country,
    setCountry,
    city,
    setCity,
    hasActiveFilters,
    clearFilters,
  }

  const loading =
    (!useDemoFallback && apiGroups.status === 'loading') || (scopeTab === 'near-you' && nearbyLoading)

  const sparse = filteredGroups.length > 0 && filteredGroups.length <= 3

  const rightRailProps = {
    allGroups: groupSource,
    suggested: filteredGroups.length > 0 ? filteredGroups : groupSource,
    onPurposeSelect: (p: string) => {
      togglePurpose(p as GroupPurposeFilter)
      setMorePurposeOpen(false)
    },
    onNearYou: () => setScopeTab('near-you'),
  }

  return (
    <div className={cn(shellOuterClass, 'c2k-mobile-scroll-pad')}>
      <DirectoryTemplate
        title="Discover Groups"
        className="py-4 sm:py-6"
        desktopAsideFrom="lg"
        header={
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">Discover Groups</h1>
            <p className="mt-1 text-sm text-dc-text-muted">Find your people, munches, classes, and local scenes.</p>
          </div>
        }
        toolbar={
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor={mainSearchId} className="sr-only">
                Search groups
              </label>
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dc-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                id={mainSearchId}
                type="search"
                placeholder="Search groups by name, description, or tags…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-11 rounded-xl border border-dc-border bg-[var(--dc-input)] py-2.5 pl-10 pr-4 text-sm text-dc-text placeholder-dc-muted focus:border-dc-accent focus:outline-none focus:ring-1 focus:ring-dc-accent"
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <DirectoryFilterButton activeFilterCount={activeFilterCount} onClick={() => setFilterSheetOpen(true)} />
              <label className="sr-only" htmlFor="groups-sort">
                Sort groups
              </label>
              <select
                id="groups-sort"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as GroupsSortMode)}
                className="min-h-11 rounded-xl border border-dc-border bg-dc-elevated-solid px-3 text-sm text-dc-text"
              >
                <option value="popular">Sort by: Popular</option>
                <option value="new">Sort by: Newest</option>
                <option value="active">Sort by: Recently active</option>
                <option value="members">Sort by: Most members</option>
                <option value="name">Sort by: Name</option>
              </select>
            </div>
          </div>
        }
        desktopSidebar={
          <GroupsDiscoverLeftRail
            filterState={filterState}
            purposeCounts={purposeCounts}
            searchId={searchId}
            filterIdPrefix="grp-rail"
          />
        }
        desktopAside={<GroupsRightRail {...rightRailProps} />}
      >
        <GroupsScopeTabs active={scopeTab} onChange={setScopeTab} />
        <GroupsPurposeChips
          selected={selectedPurposes}
          onToggle={togglePurpose}
          moreOpen={morePurposeOpen}
          onMoreToggle={() => setMorePurposeOpen((o) => !o)}
        />

        {nearbyError && scopeTab === 'near-you' ?
          <p
            className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/25 px-3 py-2 text-sm text-amber-200/90"
            role="status"
          >
            {nearbyError}{' '}
            <Link to="/profile/edit" className="text-dc-accent hover:underline">
              Set your location in profile settings
            </Link>{' '}
            to use Near you.
          </p>
        : null}

        {loading ?
          <GroupSkeleton count={4} />
        : !useDemoFallback && apiGroups.status === 'error' ?
          <EmptyState
            title="Could not load groups"
            message={apiGroups.errorMessage ?? 'The groups directory did not load.'}
            actionLabel="Retry"
            onAction={apiGroups.reload}
          />
        : filteredGroups.length === 0 ?
          hasActiveFilters ?
            <EmptyState
              title="No groups found"
              message="Try widening your location, removing a purpose filter, or starting a new community."
              actionLabel="Reset filters"
              onAction={clearFilters}
              secondaryCtaLabel="Organizations"
              secondaryCtaHref="/orgs"
            />
          : <EmptyState
              title="No groups found"
              message="Try widening your location or start a new community."
              actionLabel="Create a group"
              onAction={() => setCreateOpen(true)}
              secondaryCtaLabel="Organizations"
              secondaryCtaHref="/orgs"
            />
        : <>
            <p className="mb-4 text-sm text-dc-muted" role="status">
              {filteredGroups.length} group{filteredGroups.length === 1 ? '' : 's'}
              {useDemoFallback ? ' · demo data' : null}
            </p>
            <ul className="space-y-4">
              {filteredGroups.map((g, index) => (
                <li key={g.id}>
                  <GroupDiscoverListCard
                    group={g}
                    badge={deriveGroupDiscoverBadge(g, index, scopeTab)}
                    friendsHere={useDemoFallback ? mockFriendsHereCount(g.id) : undefined}
                  />
                </li>
              ))}
            </ul>
            {sparse ?
              <div className="mt-8 lg:hidden">
                <GroupsRightRail
                  allGroups={groupSource}
                  suggested={filteredGroups}
                  onPurposeSelect={(p) => {
                    togglePurpose(p as GroupPurposeFilter)
                    setMorePurposeOpen(false)
                  }}
                  onNearYou={() => setScopeTab('near-you')}
                />
              </div>
            : null}
          </>
        }

        <FilterSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          title="Group filters"
          activeFilterCount={activeFilterCount}
          onClear={clearFilters}
          liveApply
        >
          <GroupsDiscoverLeftRail
            filterState={filterState}
            purposeCounts={purposeCounts}
            searchId={searchId}
            filterIdPrefix="grp-mobile"
          />
        </FilterSheet>
      </DirectoryTemplate>

      {createOpen ?
        <CreateGroupModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false)
            clearFilters()
            apiGroups.reload()
          }}
        />
      : null}
    </div>
  )
}
