import { useId, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useSearchParams } from 'react-router-dom'
import EventCard from '@/components/cards/EventCard'
import EventsCategoryChips from '@/components/events/EventsCategoryChips'
import EventsFeaturedStrip from '@/components/events/EventsFeaturedStrip'
import EventsDiscoverLeftRail from '@/components/events/EventsDiscoverLeftRail'
import EventFiltersPanel, { type EventFilterState } from '@/components/events/EventFiltersPanel'
import EventsListRow from '@/components/events/EventsListRow'
import EventsRightRail from '@/components/events/EventsRightRail'
import EventsScopeTabs from '@/components/events/EventsScopeTabs'
import EmptyState from '@/components/ui/EmptyState'
import { EventSkeleton } from '@/components/ui/skeleton'
import DirectoryTemplate, { DirectoryFilterButton } from '@/components/templates/DirectoryTemplate'
import FilterSheet from '@/components/templates/FilterSheet'
import { mockEvents } from '@/data/mock-data'
import { useAuth } from '@/contexts/AuthContext'
import { useApiEvents, type ApiEventsFilters } from '@/hooks/useApiEvents'
import { usePersistedGeoText } from '@/hooks/usePersistedGeoText'
import { useApiMyRsvps } from '@/hooks/useApiMyRsvps'
import { MAX_DISTANCE_MI, rankEvents } from '@/lib/discovery-utils'
import {
  countEventsByCategory,
  eventStartDate,
  filterEventsByScope,
  paginateEvents,
  type EventsScopeTab,
} from '@/lib/events-page-utils'
type ViewMode = 'list' | 'grid'
type SortMode = 'upcoming' | 'relevance' | 'new'

type EventFilterDraft = {
  eventFormatFilter: 'all' | 'in-person' | 'virtual'
  selectedCategories: string[]
  dateRange: { start: string; end: string }
  distance: number
  country: string
  city: string
}

function countEventActiveFilters(d: EventFilterDraft): number {
  let count = 0
  if (d.eventFormatFilter !== 'all') count++
  if (d.dateRange.start || d.dateRange.end) count++
  if (d.distance < MAX_DISTANCE_MI) count++
  if (d.country.trim()) count++
  if (d.city.trim()) count++
  if (d.selectedCategories.length > 0) count++
  return count
}

function emptyEventFilterDraft(): EventFilterDraft {
  return {
    eventFormatFilter: 'all',
    selectedCategories: [],
    dateRange: { start: '', end: '' },
    distance: MAX_DISTANCE_MI,
    country: '',
    city: '',
  }
}

export default function EventsDiscoverPage() {
  const searchId = useId()
  const [searchParams] = useSearchParams()
  const pastView = searchParams.get('view') === 'past'

  const { isAuthenticated, isFallback } = useAuth()
  const homeDemoFallbackEnv = import.meta.env.VITE_HOME_DEMO_FALLBACK === 'true'
  const useDemoFallback = homeDemoFallbackEnv && !isAuthenticated

  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [filterDraft, setFilterDraft] = useState<EventFilterDraft>(emptyEventFilterDraft)
  const [eventFormatFilter, setEventFormatFilter] = useState<'all' | 'in-person' | 'virtual'>('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [distance, setDistance] = useState(MAX_DISTANCE_MI)
  const { country, setCountry, city, setCity } = usePersistedGeoText()
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeTab, setScopeTab] = useState<EventsScopeTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortMode, setSortMode] = useState<SortMode>('upcoming')
  const [page, setPage] = useState(1)

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
    setPage(1)
  }

  const apiListFilters = useMemo((): ApiEventsFilters | undefined => {
    if (useDemoFallback) return undefined
    return {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      format: eventFormatFilter,
      city: city.trim() || undefined,
      country: country.trim() || undefined,
    }
  }, [useDemoFallback, selectedCategories, eventFormatFilter, city, country])

  const apiEvents = useApiEvents(apiListFilters)
  const apiBackedEvents = !useDemoFallback && apiEvents.status === 'ready'
  const showApiAgenda = apiBackedEvents && isAuthenticated && !isFallback
  const organizingEvents = useApiEvents({ hostId: 'me', enabled: showApiAgenda })
  const myRsvps = useApiMyRsvps(showApiAgenda)

  const eventSource = useMemo(() => {
    if (useDemoFallback) return mockEvents
    if (apiEvents.status === 'ready') return apiEvents.items
    return []
  }, [apiEvents, useDemoFallback])

  const categoryCounts = useMemo(() => countEventsByCategory(eventSource), [eventSource])

  const filteredEvents = useMemo(() => {
    const ranked = rankEvents(eventSource, {
      searchQuery,
      dateRange: dateRange.start || dateRange.end ? dateRange : undefined,
      categories: useDemoFallback && selectedCategories.length > 0 ? selectedCategories : undefined,
      eventFormat: useDemoFallback && eventFormatFilter !== 'all' ? eventFormatFilter : undefined,
      distanceMi: distance,
      cityFilter: useDemoFallback ? city : undefined,
      countryFilter: useDemoFallback ? country : undefined,
      sortBy: sortMode === 'relevance' ? 'relevance' : sortMode === 'new' ? 'new' : 'soon',
    })

    const now = Date.now()
    const timeFiltered =
      pastView ?
        ranked.filter((e) => {
          const d = eventStartDate(e)
          return d ? d.getTime() < now : false
        })
      : ranked.filter((e) => {
          const d = eventStartDate(e)
          return d ? d.getTime() >= now : true
        })

    return filterEventsByScope(timeFiltered, scopeTab)
  }, [
    eventSource,
    searchQuery,
    dateRange,
    selectedCategories,
    eventFormatFilter,
    distance,
    city,
    country,
    useDemoFallback,
    sortMode,
    scopeTab,
    pastView,
  ])

  const { slice: pageEvents, totalPages } = useMemo(
    () => paginateEvents(filteredEvents, page),
    [filteredEvents, page],
  )

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategories.length > 0 ||
    Boolean(dateRange.start || dateRange.end) ||
    distance < MAX_DISTANCE_MI ||
    Boolean(country.trim()) ||
    Boolean(city.trim()) ||
    eventFormatFilter !== 'all'

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setDateRange({ start: '', end: '' })
    setDistance(MAX_DISTANCE_MI)
    setCountry('')
    setCity('')
    setEventFormatFilter('all')
    setPage(1)
  }

  const openFilterSheet = () => {
    setFilterDraft({
      eventFormatFilter,
      selectedCategories: [...selectedCategories],
      dateRange: { ...dateRange },
      distance,
      country,
      city,
    })
    setFilterSheetOpen(true)
  }

  const applyFilterDraft = () => {
    setEventFormatFilter(filterDraft.eventFormatFilter)
    setSelectedCategories([...filterDraft.selectedCategories])
    setDateRange({ ...filterDraft.dateRange })
    setDistance(filterDraft.distance)
    setCountry(filterDraft.country)
    setCity(filterDraft.city)
    setPage(1)
  }

  const appliedFilterCount = countEventActiveFilters({
    eventFormatFilter,
    selectedCategories,
    dateRange,
    distance,
    country,
    city,
  })

  const filterDraftState = useMemo((): EventFilterState => {
    const setDateRangeDraft: Dispatch<SetStateAction<{ start: string; end: string }>> = (fn) => {
      setFilterDraft((d) => ({
        ...d,
        dateRange: typeof fn === 'function' ? fn(d.dateRange) : fn,
      }))
    }
    return {
      eventFormatFilter: filterDraft.eventFormatFilter,
      setEventFormatFilter: (v) => setFilterDraft((d) => ({ ...d, eventFormatFilter: v })),
      selectedCategories: filterDraft.selectedCategories,
      toggleCategory: (cat) =>
        setFilterDraft((d) => ({
          ...d,
          selectedCategories:
            d.selectedCategories.includes(cat) ?
              d.selectedCategories.filter((c) => c !== cat)
            : [...d.selectedCategories, cat],
        })),
      dateRange: filterDraft.dateRange,
      setDateRange: setDateRangeDraft,
      distance: filterDraft.distance,
      setDistance: (n) => setFilterDraft((d) => ({ ...d, distance: n })),
      country: filterDraft.country,
      setCountry: (v) => setFilterDraft((d) => ({ ...d, country: v })),
      city: filterDraft.city,
      setCity: (v) => setFilterDraft((d) => ({ ...d, city: v })),
      hasActiveFilters: countEventActiveFilters(filterDraft) > 0,
      clearFilters: () => setFilterDraft(emptyEventFilterDraft()),
    }
  }, [filterDraft])

  const filterState = {
    eventFormatFilter,
    setEventFormatFilter: (v: 'all' | 'in-person' | 'virtual') => {
      setEventFormatFilter(v)
      setPage(1)
    },
    selectedCategories,
    toggleCategory,
    dateRange,
    setDateRange,
    distance,
    setDistance: (n: number) => {
      setDistance(n)
      setPage(1)
    },
    country,
    setCountry,
    city,
    setCity,
    hasActiveFilters,
    clearFilters,
  }

  type AgendaRow = {
    eventId: string
    title: string
    startsAt: string
    status: string
    organizing: boolean
  }

  const upcomingAgenda = useMemo(() => {
    const now = Date.now()
    const byId = new Map<string, AgendaRow>()
    for (const r of myRsvps.items) {
      byId.set(r.eventId, {
        eventId: r.eventId,
        title: r.title,
        startsAt: r.startsAt,
        status: r.status,
        organizing: false,
      })
    }
    if (organizingEvents.status === 'ready') {
      for (const ev of organizingEvents.items) {
        const id = String(ev.id)
        const startsAt = ev.startsAt ?? ''
        const existing = byId.get(id)
        if (existing) byId.set(id, { ...existing, organizing: true })
        else {
          byId.set(id, {
            eventId: id,
            title: ev.title,
            startsAt,
            status: 'organizing',
            organizing: true,
          })
        }
      }
    }
    return [...byId.values()]
      .filter((row) => {
        const t = new Date(row.startsAt).getTime()
        return !Number.isNaN(t) && t >= now
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  }, [myRsvps.items, organizingEvents.items, organizingEvents.status])

  const pastRsvpCount = useMemo(() => {
    const now = Date.now()
    return myRsvps.items.filter((r) => {
      const t = new Date(r.startsAt).getTime()
      return !Number.isNaN(t) && t < now
    }).length
  }, [myRsvps.items])

  const agendaLoading =
    showApiAgenda &&
    (myRsvps.status === 'loading' || (showApiAgenda && organizingEvents.status === 'loading'))
  const agendaError = myRsvps.status === 'error' || organizingEvents.status === 'error'

  const pageTitle = pastView ? 'Past Public Events' : 'Events'
  const pageSubtitle =
    pastView ?
      'Browse events that have already happened.'
    : 'Find classes, munches, conventions, and community gatherings.'

  return (
    <DirectoryTemplate
      title={pageTitle}
      description={pageSubtitle}
      className="py-4 sm:py-6"
      desktopSidebar={
        <EventsDiscoverLeftRail
          filterState={filterState}
          categoryCounts={categoryCounts}
          agendaLoading={agendaLoading}
          agendaError={agendaError}
          onAgendaRetry={() => {
            myRsvps.reload()
            organizingEvents.reload()
          }}
          upcomingAgenda={upcomingAgenda}
          pastRsvpCount={pastRsvpCount}
          showAgenda={isAuthenticated && !isFallback && !useDemoFallback}
          showMockAgenda={useDemoFallback}
        />
      }
      desktopAside={<EventsRightRail allEvents={eventSource} suggested={filteredEvents} />}
      toolbar={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <label htmlFor={searchId} className="sr-only">
              Search events
            </label>
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dc-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id={searchId}
              type="search"
              placeholder="Search events…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full min-h-10 rounded-xl border border-dc-border bg-[var(--dc-input)] py-2 pl-10 pr-4 text-sm text-dc-text placeholder-dc-muted focus:border-dc-accent focus:outline-none focus:ring-1 focus:ring-dc-accent sm:min-h-11 sm:py-2.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <DirectoryFilterButton activeFilterCount={appliedFilterCount} onClick={openFilterSheet} />
            <div className="inline-flex rounded-xl border border-dc-border bg-dc-elevated-solid p-1 hidden md:inline-flex" role="group" aria-label="View mode">
              <button
                type="button"
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={`min-h-11 rounded-lg px-3 text-xs font-medium ${viewMode === 'grid' ? 'bg-dc-accent-muted text-dc-accent' : 'text-dc-muted'}`}
              >
                Grid
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={`min-h-11 rounded-lg px-3 text-xs font-medium ${viewMode === 'list' ? 'bg-dc-accent-muted text-dc-accent' : 'text-dc-muted'}`}
              >
                List
              </button>
            </div>
            <label className="sr-only" htmlFor="events-sort">
              Sort events
            </label>
            <select
              id="events-sort"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="min-h-10 max-w-[9.5rem] rounded-xl border border-dc-border bg-dc-elevated-solid px-2 text-xs text-dc-text sm:min-h-11 sm:max-w-none sm:px-3 sm:text-sm"
            >
              <option value="upcoming">Sort by: Upcoming</option>
              <option value="relevance">Sort by: Popular</option>
              <option value="new">Sort by: Newest</option>
            </select>
          </div>
        </div>
      }
      resultSummary={null}
    >
      <EventsCategoryChips
        selectedCategories={selectedCategories}
        categoryCounts={categoryCounts}
        totalCount={eventSource.length}
        onToggleCategory={toggleCategory}
        onClearCategories={() => {
          setSelectedCategories([])
          setPage(1)
        }}
      />

      <EventsScopeTabs
        active={scopeTab}
        onChange={(t) => {
          setScopeTab(t)
          setPage(1)
        }}
        totalCount={filteredEvents.length}
      />

      {!pastView && filteredEvents.length > 1 ? <EventsFeaturedStrip events={filteredEvents} /> : null}

      {apiEvents.status === 'loading' ?
        <EventSkeleton count={4} />
      : apiEvents.status === 'error' ?
        <EmptyState
          inline
          title="Could not load events"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={apiEvents.reload}
        />
      : filteredEvents.length === 0 ?
        <EmptyState
          inline
          className="rounded-2xl border border-dc-border bg-dc-elevated-solid"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="No events match"
          message={hasActiveFilters ? 'Try resetting filters or widening your search.' : 'Nothing listed yet. Check back soon or browse all events.'}
          actionLabel={hasActiveFilters ? 'Reset filters' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
          ctaLabel={hasActiveFilters ? undefined : 'Browse all events'}
          ctaHref={hasActiveFilters ? undefined : '/events'}
        />
      : viewMode === 'list' ?
        <div className="space-y-3">
          {pageEvents.map((event) => (
            <EventsListRow key={String(event.id)} event={event} />
          ))}
        </div>
      : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageEvents.map((event) => (
            <EventCard key={String(event.id)} event={event} />
          ))}
        </div>
      }

      {filteredEvents.length > 0 && totalPages > 1 ?
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="min-h-11 rounded-lg border border-dc-border px-3 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`min-h-11 min-w-11 rounded-lg border text-sm ${
                page === n ?
                  'border-dc-accent bg-dc-accent-muted text-dc-accent'
                : 'border-dc-border text-dc-text-muted hover:text-dc-text'
              }`}
            >
              {n}
            </button>
          ))}
          {totalPages > 7 ? <span className="px-1 text-dc-muted">…</span> : null}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="min-h-11 rounded-lg border border-dc-border px-3 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </nav>
      : null}

      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        activeFilterCount={countEventActiveFilters(filterDraft)}
        onApply={applyFilterDraft}
        onClear={() => {
          const empty = emptyEventFilterDraft()
          setFilterDraft(empty)
          setEventFormatFilter(empty.eventFormatFilter)
          setSelectedCategories(empty.selectedCategories)
          setDateRange(empty.dateRange)
          setDistance(empty.distance)
          setCountry(empty.country)
          setCity(empty.city)
          setPage(1)
        }}
      >
        <EventFiltersPanel
          idPrefix="evt-sheet"
          f={filterDraftState}
          categoryCounts={categoryCounts}
          hideFooter
        />
      </FilterSheet>
    </DirectoryTemplate>
  )
}
