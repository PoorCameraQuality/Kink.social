import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ConventionsFeaturedRow from '@/components/conventions/ConventionsFeaturedRow'
import ConventionsLeftRail from '@/components/conventions/ConventionsLeftRail'
import ConventionsListRow from '@/components/conventions/ConventionsListRow'
import ConventionsSubmitCta from '@/components/conventions/ConventionsSubmitCta'
import EmptyState from '@/components/ui/EmptyState'
import LoadErrorBanner from '@/components/ui/LoadErrorBanner'
import { useAuth } from '@/contexts/AuthContext'
import { mockHomeConventions } from '@/data/mock-data'
import type { HomeConventionRow } from '@/hooks/useHomeSurface'
import {
  countConventionsByEventType,
  filterConventions,
  listConventionsExcludingFeatured,
  pickFeaturedConventions,
  type ConventionEventType,
} from '@/lib/conventions-page-utils'

export default function ConventionsDiscoverPage() {
  const [searchParams] = useSearchParams()
  const pastView = searchParams.get('view') === 'past'
  const mineView = searchParams.get('mine') === '1'

  const { isAuthenticated, isFallback } = useAuth()
  const homeDemoFallbackEnv = import.meta.env.VITE_HOME_DEMO_FALLBACK === 'true'
  const useDemoFallback = homeDemoFallbackEnv && !isAuthenticated
  const apiBacked = isAuthenticated && !isFallback && !useDemoFallback

  const [items, setItems] = useState<HomeConventionRow[] | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [locationRegion, setLocationRegion] = useState('')
  const [selectedEventTypes, setSelectedEventTypes] = useState<ConventionEventType[]>([])

  const load = useCallback(async () => {
    if (!apiBacked) {
      setItems(mockHomeConventions)
      setStatus('ready')
      return
    }
    setStatus('loading')
    try {
      const r = await fetch('/api/v1/conventions', { credentials: 'include' })
      if (!r.ok) {
        setStatus('error')
        setItems(null)
        return
      }
      const d = (await r.json()) as { items?: HomeConventionRow[] }
      setItems(d.items ?? [])
      setStatus('ready')
    } catch {
      setStatus('error')
      setItems(null)
    }
  }, [apiBacked])

  useEffect(() => {
    void load()
  }, [load])

  const catalog = useMemo(() => items ?? [], [items])

  const eventTypeCounts = useMemo(() => countConventionsByEventType(catalog), [catalog])

  const filtered = useMemo(
    () =>
      filterConventions(catalog, {
        searchQuery,
        dateRange,
        locationRegion,
        selectedEventTypes,
        pastView,
      }),
    [catalog, searchQuery, dateRange, locationRegion, selectedEventTypes, pastView],
  )

  const featured = useMemo(
    () => (pastView || mineView ? [] : pickFeaturedConventions(filtered, 2)),
    [filtered, pastView, mineView],
  )

  const listRows = useMemo(
    () => listConventionsExcludingFeatured(filtered, featured),
    [filtered, featured],
  )

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedEventTypes.length > 0 ||
    Boolean(dateRange.start || dateRange.end) ||
    Boolean(locationRegion)

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedEventTypes([])
    setDateRange({ start: '', end: '' })
    setLocationRegion('')
  }

  const toggleEventType = (t: ConventionEventType) => {
    setSelectedEventTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  const filterState = {
    searchQuery,
    setSearchQuery,
    dateRange,
    setDateRange,
    locationRegion,
    setLocationRegion,
    selectedEventTypes,
    toggleEventType,
    hasActiveFilters,
    clearFilters,
  }

  const pageTitle = mineView ? 'My Conventions' : pastView ? 'Past Conventions' : 'Conventions'
  const pageSubtitle =
    mineView ?
      'Conventions you organize or attend.'
    : pastView ?
      'Multi-day gatherings that have already ended.'
    : 'Multi-day events, hotel takeovers, and festival weekends across the community.'

  const railProps = { filterState, eventTypeCounts }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 c2k-mobile-scroll-pad">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(240px,260px)_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <ConventionsLeftRail {...railProps} />
        </div>

        <main className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">{pageTitle}</h1>
              <p className="mt-1 text-sm text-dc-text-muted">{pageSubtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className="inline-flex min-h-11 items-center rounded-xl border border-dc-border bg-dc-elevated-solid px-4 text-sm font-medium text-dc-accent lg:hidden"
              >
                Filters
              </button>
              <ConventionsSubmitCta variant="button" />
            </div>
          </div>

          {filterDrawerOpen ?
            <div className="mb-6 rounded-2xl border border-dc-border bg-dc-elevated-solid p-4 lg:hidden">
              <ConventionsLeftRail {...railProps} />
            </div>
          : null}

          {status === 'error' ?
            <LoadErrorBanner message="Could not load conventions." onRetry={() => void load()} />
          : status === 'loading' ?
            <div className="space-y-3" aria-busy="true">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="aspect-[16/9] animate-pulse rounded-2xl bg-dc-elevated-muted" />
                ))}
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-dc-elevated-muted" />
              ))}
            </div>
          : filtered.length === 0 ?
            <EmptyState
              inline
              title="No conventions match"
              message={
                hasActiveFilters ?
                  'Try resetting filters or widening your search.'
                : 'Nothing listed yet. Check back when organizers publish.'
              }
              actionLabel={hasActiveFilters ? 'Reset filters' : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          : <>
              {!pastView && !mineView && featured.length > 0 ?
                <ConventionsFeaturedRow featured={featured} />
              : null}

              {mineView ?
                <p className="mb-4 text-sm text-dc-muted">
                  My Conventions uses your organizer memberships. Full list coming soon. Showing browse results for now.
                </p>
              : null}

              <div className="space-y-3">
                {listRows.map((c) => (
                  <ConventionsListRow key={c.id} convention={c} />
                ))}
              </div>

              <ConventionsSubmitCta />
            </>
          }
        </main>
      </div>
    </div>
  )
}
