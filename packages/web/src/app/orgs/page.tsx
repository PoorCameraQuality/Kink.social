import { useId, useMemo, useState } from 'react'
import OrgDirectoryCard from '@/components/orgs/OrgDirectoryCard'
import OrganizationsHero from '@/components/orgs/OrganizationsHero'
import OrganizationsRightRail from '@/components/orgs/OrganizationsRightRail'
import EmptyState from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/skeleton'
import TextInput from '@/components/ui/TextInput'
import { useApiOrganizations, type OrgListSort } from '@/hooks/useApiOrganizations'
import { useOrganizerOrgScopes, viewerCanManageOrg } from '@/hooks/useOrganizerOrgScopes'
import {
  filterOrgsByChip,
  sortOrgDirectory,
  toOrgDirectoryModel,
  type OrgDirectorySort,
  type OrgFilterChip,
} from '@/lib/org-directory-utils'

const FILTER_CHIPS: { id: OrgFilterChip; label: string }[] = [
  { id: 'all', label: 'Top rated' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'recentlyActive', label: 'Recently active' },
  { id: 'hostingSoon', label: 'Hosting soon' },
  { id: 'new', label: 'New' },
]

const SORT_OPTIONS: { value: OrgDirectorySort; label: string }[] = [
  { value: 'popular', label: 'Top rated' },
  { value: 'name', label: 'A to Z' },
]

function apiSortFromDirectorySort(sort: OrgDirectorySort): OrgListSort {
  if (sort === 'name') return 'name'
  return 'popular'
}

export default function OrgsListPage() {
  const searchId = useId()
  const [q, setQ] = useState('')
  const [filterChip, setFilterChip] = useState<OrgFilterChip>('all')
  const [sort, setSort] = useState<OrgDirectorySort>('popular')
  const { bySlug, hasAnyScope, loading: scopesLoading } = useOrganizerOrgScopes()
  const { status, items, reload } = useApiOrganizations(true, {
    q,
    sort: apiSortFromDirectorySort(sort),
  })

  const directoryItems = useMemo(() => {
    const models = items.map(toOrgDirectoryModel)
    const filtered = filterOrgsByChip(models, filterChip)
    if (filterChip === 'new' || filterChip === 'recentlyActive') return filtered
    return sortOrgDirectory(filtered, sort)
  }, [items, filterChip, sort])

  const listLoading = status === 'loading'
  const listError = status === 'error'
  const directoryEmpty = !listLoading && !listError && directoryItems.length === 0
  const globalEmpty = !listLoading && !listError && items.length === 0 && !q.trim() && filterChip === 'all'

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      <OrganizationsHero hasOrganizerAccess={hasAnyScope} scopesLoading={scopesLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,280px)]">
        <div className="min-w-0">
          <section aria-labelledby="browse-orgs-heading">
            <h2 id="browse-orgs-heading" className="text-lg font-semibold text-dc-text">
              Browse organizations
            </h2>

            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <label htmlFor={searchId} className="sr-only">
                    Search organizations
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
                  <TextInput
                    id={searchId}
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name or slug…"
                    className="min-h-11 w-full rounded-xl pl-10"
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:min-w-[11rem]">
                  <label htmlFor="org-directory-sort" className="sr-only">
                    Sort organizations
                  </label>
                  <span className="hidden text-xs text-dc-muted sm:inline" id="org-sort-label">
                    Sort by:
                  </span>
                  <select
                    id="org-directory-sort"
                    aria-labelledby="org-sort-label"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as OrgDirectorySort)}
                    className="min-h-11 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-3 text-sm text-dc-text sm:w-auto"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
                role="group"
                aria-label="Filter organizations"
              >
                {FILTER_CHIPS.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setFilterChip(chip.id)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors min-h-9 ${
                      filterChip === chip.id ?
                        'border-dc-accent bg-dc-accent text-dc-accent-foreground'
                      : 'border-dc-border bg-dc-elevated-solid text-dc-text-muted hover:text-dc-text'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-dc-muted">
                Filters use best-match heuristics from listed organizations. Sort applies to the current results.
              </p>
            </div>

            {directoryItems.length > 0 && !listLoading && !listError ?
              <p className="mt-4 text-sm text-dc-muted" role="status">
                {directoryItems.length} organization{directoryItems.length === 1 ? '' : 's'}
              </p>
            : null}

            <div className="mt-4">
              {listLoading ?
                <CardSkeleton count={4} />
              : listError ?
                <EmptyState
                  title="Could not load organizations"
                  message="The organization directory did not load. Check your connection and try again."
                  actionLabel="Retry"
                  onAction={reload}
                  secondaryCtaLabel="Explore events"
                  secondaryCtaHref="/events"
                />
              : directoryEmpty ?
                globalEmpty ?
                  <EmptyState
                    title="No organizations listed yet"
                    message="Organizations are how Kink Social communities create events, run groups, coordinate staff, and build trust."
                    ctaLabel="Create organization"
                    ctaHref="/orgs/new"
                    secondaryCtaLabel="Explore events"
                    secondaryCtaHref="/events"
                  />
                : <EmptyState
                    message={
                      q.trim() ?
                        'No organizations match your search.'
                      : 'No organizations match these filters.'
                    }
                    ctaLabel="Create organization"
                    ctaHref="/orgs/new"
                    secondaryCtaLabel="Explore events"
                    secondaryCtaHref="/events"
                  />
              : <ul className="grid gap-4 sm:grid-cols-2 min-[1500px]:grid-cols-3 min-[1800px]:grid-cols-4">
                  {directoryItems.map((org) => (
                    <li key={org.id}>
                      <OrgDirectoryCard org={org} canManage={viewerCanManageOrg(bySlug, org.slug)} />
                    </li>
                  ))}
                </ul>
              }
            </div>
          </section>
        </div>

        <div className="hidden lg:block">
          <OrganizationsRightRail />
        </div>
      </div>
    </div>
  )
}
