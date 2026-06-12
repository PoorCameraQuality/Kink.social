import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import GroupCard from '@/components/cards/GroupCard'
import VendorCard from '@/components/cards/VendorCard'
import ExploreCompactEventRow from '@/components/explore/ExploreCompactEventRow'
import ExploreCompactTrendingRow from '@/components/explore/ExploreCompactTrendingRow'
import ExploreFeaturedTrendingCard from '@/components/explore/ExploreFeaturedTrendingCard'
import ExploreFiltersPanel from '@/components/explore/ExploreFiltersPanel'
import ExploreHubHeader from '@/components/explore/ExploreHubHeader'
import ExploreHubSection from '@/components/explore/ExploreHubSection'
import ExploreSuggestedRow from '@/components/explore/ExploreSuggestedRow'
import FindPeopleProfileCard from '@/components/find-people/FindPeopleProfileCard'
import OrgDirectoryCard from '@/components/orgs/OrgDirectoryCard'
import EmptyState from '@/components/ui/EmptyState'
import { mockPeople, mockVendors } from '@/data/mock-data'
import { useAuth } from '@/contexts/AuthContext'
import { useApiEducationArticles } from '@/hooks/useApiEducationArticles'
import { useApiOrganizations } from '@/hooks/useApiOrganizations'
import { useHomeSurface } from '@/hooks/useHomeSurface'
import { useOrganizerOrgScopes, viewerCanManageOrg } from '@/hooks/useOrganizerOrgScopes'
import { PEOPLE_DIRECTORY_PATH } from '@/lib/app-routes'
import {
  EMPTY_EXPLORE_FILTERS,
  applyExploreArticleFilters,
  applyExploreEventFilters,
  applyExploreGroupFilters,
  applyExploreOrgFilters,
  applyExplorePeopleFilters,
  applyExploreTrendingFilters,
  applyExploreVendorFilters,
  buildExplorePeoplePool,
  buildSuggestedItems,
  filterArticles,
  filterEvents,
  filterGroups,
  filterOrgs,
  filterPeople,
  filterTrending,
  filterVendors,
  parseExploreFilters,
  shouldShowExploreSection,
  toggleDiscoveryChip,
  toggleExploreTopic,
  writeExploreFiltersToParams,
  type ExploreActiveFilterPill,
  type ExploreDiscoveryChipId,
  type ExploreFilters,
} from '@/lib/explore-hub'
import { toOrgDirectoryModel } from '@/lib/org-directory-utils'
import { vendorsVendingSoon } from '@/lib/vendor-directory-utils'
import DirectoryTemplate from '@/components/templates/DirectoryTemplate'
import FilterSheet from '@/components/templates/FilterSheet'
import { buildExploreActiveFilterPills } from '@/lib/explore-hub'

export default function ExploreDashboardPage() {
  const { isAuthenticated, isFallback } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterDraft, setFilterDraft] = useState<ExploreFilters>(EMPTY_EXPLORE_FILTERS)

  const searchQuery = searchParams.get('q') ?? ''
  const filters = useMemo(() => parseExploreFilters(searchParams), [searchParams])

  useEffect(() => {
    if (!searchParams.get('tab')) return
    setSearchParams(
      (prev: URLSearchParams) => writeExploreFiltersToParams(prev, parseExploreFilters(prev)),
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  const setSearchQuery = useCallback(
    (q: string) => {
      setSearchParams(
        (prev: URLSearchParams) => {
          const next = new URLSearchParams(prev)
          if (q.trim()) next.set('q', q)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const applyFilters = useCallback(
    (next: ExploreFilters) => {
      setSearchParams((prev: URLSearchParams) => writeExploreFiltersToParams(prev, next), { replace: true })
    },
    [setSearchParams],
  )

  const openFilters = useCallback(() => {
    setFilterDraft(filters)
    setFiltersOpen(true)
  }, [filters])

  const handleDiscoveryChipToggle = useCallback(
    (chipId: ExploreDiscoveryChipId) => {
      applyFilters(toggleDiscoveryChip(filters, chipId))
    },
    [applyFilters, filters],
  )

  const handleTopicChipToggle = useCallback(
    (topic: string) => {
      applyFilters(toggleExploreTopic(filters, topic))
    },
    [applyFilters, filters],
  )

  const handleRemoveFilterPill = useCallback(
    (pill: ExploreActiveFilterPill) => {
      applyFilters(pill.remove(filters))
    },
    [applyFilters, filters],
  )

  const homeDemoFallbackEnv = import.meta.env.VITE_HOME_DEMO_FALLBACK === 'true'
  const useDemoFallback = homeDemoFallbackEnv && !isAuthenticated

  const surface = useHomeSurface({
    activeTab: 'Trending',
    postsRefreshKey: 0,
    conventionsTabActive: false,
  })

  const {
    rankedEvents,
    rankedGroups,
    rankedPeople,
    rankedVendorsHome,
    displayTrendingItems,
    displayCoSuggestions,
    nearbyPeople,
    homeEventsLoading,
    homeEventsApiError,
    apiEvents,
    homeGroupsLoading,
    homeGroupsApiError,
    apiGroups,
    homeTrendingLoading,
  } = surface

  const eduArticles = useApiEducationArticles({ limit: 8, enabled: true })
  const orgsApi = useApiOrganizations(true, { q: searchQuery, sort: 'popular' })
  const { bySlug } = useOrganizerOrgScopes()

  const peoplePool = useMemo(
    () => buildExplorePeoplePool(useDemoFallback, mockPeople, rankedPeople, displayCoSuggestions, nearbyPeople),
    [useDemoFallback, rankedPeople, displayCoSuggestions, nearbyPeople],
  )
  const vendorPool = useDemoFallback ? mockVendors : rankedVendorsHome
  const vendingSoon = vendorsVendingSoon(vendorPool, 6)

  const orgModels = useMemo(
    () => (orgsApi.status === 'ready' ? orgsApi.items.map(toOrgDirectoryModel) : []),
    [orgsApi.items, orgsApi.status],
  )

  const q = searchQuery.trim()

  const events = useMemo(() => {
    const searched = filterEvents(rankedEvents, q)
    return applyExploreEventFilters(searched, filters)
  }, [rankedEvents, q, filters])

  const groups = useMemo(() => {
    const searched = filterGroups(rankedGroups, q)
    return applyExploreGroupFilters(searched, filters)
  }, [rankedGroups, q, filters])

  const people = useMemo(() => {
    const searched = filterPeople(peoplePool, q)
    return applyExplorePeopleFilters(searched, filters)
  }, [peoplePool, q, filters])

  const vendors = useMemo(() => {
    const searched = filterVendors(vendingSoon, q)
    return applyExploreVendorFilters(searched, filters)
  }, [vendingSoon, q, filters])

  const trending = useMemo(() => {
    const searched = filterTrending(displayTrendingItems, q)
    return applyExploreTrendingFilters(searched, filters)
  }, [displayTrendingItems, q, filters])

  const articles = useMemo(() => {
    const searched = filterArticles(eduArticles.items, q)
    return applyExploreArticleFilters(searched, filters)
  }, [eduArticles.items, q, filters])

  const orgs = useMemo(() => {
    const searched = filterOrgs(orgModels, q)
    return applyExploreOrgFilters(searched, filters)
  }, [orgModels, q, filters])

  const suggested = useMemo(
    () =>
      buildSuggestedItems({
        people: peoplePool,
        groups: rankedGroups,
        events: rankedEvents,
        orgs: orgModels,
      }),
    [peoplePool, rankedGroups, rankedEvents, orgModels],
  )

  const showFeatured = shouldShowExploreSection('featured', filters)
  const showGroups = shouldShowExploreSection('Groups', filters)
  const showOrgs = shouldShowExploreSection('Organizations', filters)
  const showVendors = shouldShowExploreSection('Vendors', filters)
  const showEvents = shouldShowExploreSection('Events', filters)
  const showPeople = shouldShowExploreSection('People', filters)
  const showEducation = shouldShowExploreSection('Education', filters)

  const featuredGroups = groups.slice(0, 2)
  const featuredOrgs = orgs.slice(0, 1)
  const featuredTrendingHero = trending[0] ?? null
  const featuredTrendingRows = trending.slice(1, 4)
  const featuredTrendingExtra = trending.slice(4, 8)

  const featuredSection = showFeatured ? (
    <ExploreHubSection
      className="order-4 lg:order-none lg:col-span-7 lg:row-start-1"
      title="Featured this week"
      description="Curated highlights from across the community."
      href="/home?mode=discover&tab=Trending"
      linkLabel="View all"
    >
      {homeTrendingLoading ?
        <ul className="space-y-2" aria-busy="true">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="h-14 animate-pulse rounded-xl bg-dc-elevated-muted" />
          ))}
        </ul>
      : trending.length === 0 ?
        <p className="text-sm text-dc-muted">Nothing featured this week yet. Check back soon.</p>
      : <div className="space-y-1">
          {featuredTrendingHero ?
            <ExploreFeaturedTrendingCard item={featuredTrendingHero} />
          : null}
          {featuredTrendingRows.length > 0 ?
            <ul className="space-y-1 rounded-2xl border border-dc-border bg-dc-elevated-solid p-2">
              {featuredTrendingRows.map((item) => (
                <ExploreCompactTrendingRow key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </ul>
          : null}
          {featuredTrendingExtra.length > 0 ?
            <ul className="hidden space-y-1 rounded-2xl border border-dc-border bg-dc-elevated-solid p-2 lg:block">
              {featuredTrendingExtra.map((item) => (
                <ExploreCompactTrendingRow key={`${item.kind}-${item.id}`} item={item} />
              ))}
            </ul>
          : null}
        </div>
      }
    </ExploreHubSection>
  ) : null

  const upcomingSection = showEvents ? (
    <ExploreHubSection
      className="order-5 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-1"
      title="Upcoming events"
      href="/events"
      linkLabel="Browse events"
    >
      {homeEventsLoading ?
        <ul className="space-y-2" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <li key={i} className="h-20 animate-pulse rounded-xl bg-dc-elevated-muted" />
          ))}
        </ul>
      : homeEventsApiError ?
        <EmptyState
          inline
          title="Could not load events"
          message="We could not load upcoming events. Try again in a moment."
          actionLabel="Retry"
          onAction={apiEvents.reload}
        />
      : events.length === 0 ?
        <p className="text-sm text-dc-muted">No upcoming events match your search.</p>
      : <ul className="space-y-2">
          {events.slice(0, 3).map((event) => (
            <ExploreCompactEventRow key={String(event.id)} event={event} hideThumb />
          ))}
          {events.slice(3, 5).map((event) => (
            <ExploreCompactEventRow key={String(event.id)} event={event} hideThumb className="hidden lg:list-item" />
          ))}
        </ul>
      }
    </ExploreHubSection>
  ) : null

  const groupsSection = showGroups ? (
    <ExploreHubSection
      className="order-6 lg:order-none lg:col-span-7 lg:row-start-2"
      title="Popular groups"
      description="Persistent spaces for munches, education, and regional community."
      href="/groups"
      linkLabel="Browse groups"
    >
      {homeGroupsLoading ?
        <div className="grid gap-4 sm:grid-cols-2" aria-busy="true">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-dc-elevated-muted" />
          ))}
        </div>
      : homeGroupsApiError ?
        <EmptyState
          inline
          title="Could not load groups"
          message="We could not load featured groups. Try again in a moment."
          actionLabel="Retry"
          onAction={apiGroups.reload}
        />
      : featuredGroups.length === 0 ?
        <p className="text-sm text-dc-muted">No groups match your search.</p>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredGroups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
          {groups.slice(2, 4).map((g) => (
            <div key={g.id} className="hidden lg:block">
              <GroupCard group={g} />
            </div>
          ))}
        </div>
      }
    </ExploreHubSection>
  ) : null

  const peopleSection = showPeople ? (
    <ExploreHubSection
      className="order-7 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-2"
      title="People to discover"
      description="Members active in events, groups, and regional scenes."
      href={PEOPLE_DIRECTORY_PATH}
      linkLabel="Open people directory"
    >
      {people.length === 0 ?
        <p className="text-sm text-dc-muted">
          {q ?
            'No people match your search.'
          : 'No suggestions yet. Attend events or open the full People directory to browse members.'}
        </p>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {people.slice(0, 4).map((person) => (
            <FindPeopleProfileCard key={String(person.id)} person={person} />
          ))}
        </div>
      }
    </ExploreHubSection>
  ) : null

  const orgsSection = showOrgs ? (
    <ExploreHubSection
      className="order-8 lg:order-none lg:col-span-7 lg:row-start-3"
      title="Featured organization"
      description="Organizers powering events, conventions, and community infrastructure."
      href="/orgs"
      linkLabel="Browse organizations"
    >
      {orgsApi.status === 'loading' ?
        <div className="space-y-3" aria-busy="true">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-dc-elevated-muted" />
          ))}
        </div>
      : featuredOrgs.length === 0 ?
        <p className="text-sm text-dc-muted">No organizations match your search.</p>
      : <div className="space-y-4">
          {featuredOrgs.map((org) => (
            <OrgDirectoryCard key={org.id} org={org} canManage={viewerCanManageOrg(bySlug, org.slug)} />
          ))}
        </div>
      }
    </ExploreHubSection>
  ) : null

  const vendorsSection = showVendors ? (
    <ExploreHubSection
      className="order-9 lg:order-none lg:col-span-7 lg:row-start-4"
      title="Vendors"
      href="/vendors"
      linkLabel="Browse vendors"
    >
      {vendors.length === 0 ?
        <p className="text-sm text-dc-muted">No vendors match your search.</p>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {vendors.slice(0, 2).map((v) => (
            <VendorCard key={String(v.id)} vendor={v} />
          ))}
          {vendors.slice(2, 4).map((v) => (
            <div key={String(v.id)} className="hidden lg:block">
              <VendorCard vendor={v} />
            </div>
          ))}
        </div>
      }
    </ExploreHubSection>
  ) : null

  const suggestedSection = (
    <ExploreHubSection
      className="order-10 hidden lg:block lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-3"
      title="Suggested for you"
    >
      {suggested.length === 0 ?
          <p className="text-sm text-dc-muted">Suggestions appear as you participate in events and groups.</p>
      : <ul className="space-y-1 rounded-2xl border border-dc-border bg-dc-elevated-solid p-2">
          {suggested.map((item) => (
            <ExploreSuggestedRow key={item.id} item={item} />
          ))}
        </ul>
      }
    </ExploreHubSection>
  )

  const educationSection = showEducation && articles.length > 0 ? (
    <ExploreHubSection
      className="order-11 lg:order-none lg:col-span-7 lg:row-start-5"
      title="Education"
      href="/education"
      linkLabel="Open education"
    >
      <Link
        to="/education"
        className="flex flex-col gap-1 rounded-2xl border border-dc-border bg-gradient-to-br from-dc-elevated-solid to-dc-surface-muted p-4 transition-colors hover:border-dc-accent-border/40"
      >
        <p className="text-sm font-semibold text-dc-text">Learning library</p>
        <p className="text-sm text-dc-text-muted">
          {articles.length} {articles.length === 1 ? 'resource matches' : 'resources match'} your filters — articles,
          guides, and workshops from the community.
        </p>
        <span className="mt-1 text-sm font-medium text-dc-accent">Browse education →</span>
      </Link>
    </ExploreHubSection>
  ) : null

  const activeFilterCount = buildExploreActiveFilterPills(filters).length

  return (
    <DirectoryTemplate
      title=""
      header={
        <div className="space-y-8">
          <ExploreHubHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onDiscoveryChipToggle={handleDiscoveryChipToggle}
            onTopicChipToggle={handleTopicChipToggle}
            onRemoveFilterPill={handleRemoveFilterPill}
            onOpenFilters={openFilters}
            activeFilterCount={activeFilterCount}
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start lg:gap-x-8 lg:gap-y-10">
        {featuredSection}
        {upcomingSection}
        {groupsSection}
        {peopleSection}
        {orgsSection}
        {vendorsSection}
        {suggestedSection}
        {educationSection}
      </div>

      {!isAuthenticated || isFallback ?
        <p className="mt-8 text-center text-xs text-dc-muted">
          Sign in for personalized suggestions. Directories stay available from the top navigation.
        </p>
      : null}

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        activeFilterCount={buildExploreActiveFilterPills(filterDraft).length}
        onApply={() => applyFilters(filterDraft)}
        onClear={() => {
          setFilterDraft(EMPTY_EXPLORE_FILTERS)
          applyFilters(EMPTY_EXPLORE_FILTERS)
        }}
      >
        <ExploreFiltersPanel
          draft={filterDraft}
          onChange={setFilterDraft}
          hideFooter
          onApply={() => {
            applyFilters(filterDraft)
            setFiltersOpen(false)
          }}
          onClear={() => {
            setFilterDraft(EMPTY_EXPLORE_FILTERS)
            applyFilters(EMPTY_EXPLORE_FILTERS)
            setFiltersOpen(false)
          }}
        />
      </FilterSheet>
    </DirectoryTemplate>
  )
}
