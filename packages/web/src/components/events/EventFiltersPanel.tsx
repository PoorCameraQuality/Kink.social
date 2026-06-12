import GeoFilterControl from '@/components/browse/GeoFilterControl'
import { EVENT_CATEGORY_VALUES } from '@c2k/shared'

export type EventFilterState = {
  eventFormatFilter: 'all' | 'in-person' | 'virtual'
  setEventFormatFilter: (v: 'all' | 'in-person' | 'virtual') => void
  selectedCategories: string[]
  toggleCategory: (cat: string) => void
  dateRange: { start: string; end: string }
  setDateRange: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>
  distance: number
  setDistance: (n: number) => void
  country: string
  setCountry: (v: string) => void
  city: string
  setCity: (v: string) => void
  hasActiveFilters: boolean
  clearFilters: () => void
}

type Props = {
  idPrefix: string
  f: EventFilterState
  categoryCounts?: Map<string, number>
  showHeading?: boolean
  /** Hide reset button when FilterSheet footer handles clear */
  hideFooter?: boolean
}

export default function EventFiltersPanel({ idPrefix, f, categoryCounts, showHeading = true, hideFooter = false }: Props) {
  const dateStartId = `${idPrefix}-date-start`
  const dateEndId = `${idPrefix}-date-end`

  return (
    <div className="space-y-4">
      {showHeading ?
        <h3 className="text-sm font-semibold text-dc-text">Filter events</h3>
      : null}
      <GeoFilterControl
        idPrefix={idPrefix}
        distance={f.distance}
        onDistanceChange={f.setDistance}
        country={f.country}
        onCountryChange={f.setCountry}
        city={f.city}
        onCityChange={f.setCity}
      />
      <div>
        <span className="mb-2 block text-sm font-medium text-dc-text-muted">Date range</span>
        <label htmlFor={dateStartId} className="sr-only">
          Start date
        </label>
        <input
          id={dateStartId}
          type="date"
          value={f.dateRange.start}
          onChange={(e) => f.setDateRange((p) => ({ ...p, start: e.target.value }))}
          className="mb-2 w-full min-h-11 rounded-xl border border-dc-border bg-[var(--dc-input)] px-3 py-2 text-sm text-dc-text"
        />
        <label htmlFor={dateEndId} className="sr-only">
          End date
        </label>
        <input
          id={dateEndId}
          type="date"
          value={f.dateRange.end}
          onChange={(e) => f.setDateRange((p) => ({ ...p, end: e.target.value }))}
          className="w-full min-h-11 rounded-xl border border-dc-border bg-[var(--dc-input)] px-3 py-2 text-sm text-dc-text"
        />
      </div>
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-dc-text-muted">Event format</legend>
        <div className="space-y-1.5" role="radiogroup" aria-label="Event format">
          {(
            [
              ['all', 'All'],
              ['in-person', 'In-person'],
              ['virtual', 'Virtual'],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex min-h-touch cursor-pointer items-center gap-3 py-1 text-sm text-dc-text-muted">
              <input
                type="radio"
                name={`${idPrefix}-format`}
                checked={f.eventFormatFilter === value}
                onChange={() => f.setEventFormatFilter(value)}
                className="h-5 w-5 shrink-0 border-dc-border text-dc-accent focus:ring-dc-accent"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-dc-text-muted">Category</legend>
        <ul className="max-h-48 space-y-1 overflow-y-auto pr-1">
          {EVENT_CATEGORY_VALUES.map((cat) => {
            const checked = f.selectedCategories.includes(cat)
            const count = categoryCounts?.get(cat) ?? 0
            return (
              <li key={cat}>
                <label className="flex min-h-touch cursor-pointer items-center gap-3 rounded-lg py-1.5 text-sm hover:bg-dc-elevated-hover">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => f.toggleCategory(cat)}
                    className="h-5 w-5 shrink-0 rounded border-dc-border text-dc-accent focus:ring-dc-accent"
                  />
                  <span className="flex-1 text-dc-text-muted">{cat}</span>
                  <span className="text-xs tabular-nums text-dc-muted">{count}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>
      {hideFooter ? null : (
      <button
        type="button"
        onClick={f.clearFilters}
        className="w-full min-h-11 rounded-xl border border-dc-border text-sm font-medium text-dc-text-muted hover:bg-dc-elevated-hover hover:text-dc-text"
      >
        Reset filters
      </button>
      )}
    </div>
  )
}
