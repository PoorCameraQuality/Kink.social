import type { ExploreActiveFilterPill } from '@/lib/explore-hub'

type Props = {
  pills: ExploreActiveFilterPill[]
  onRemove: (pill: ExploreActiveFilterPill) => void
}

export default function ExploreActiveFilterPills({ pills, onRemove }: Props) {
  if (!pills.length) return null

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Active filters">
      {pills.map((pill) => (
        <span
          key={pill.id}
          role="listitem"
          className="inline-flex items-center gap-1 rounded-full border border-dc-accent-border/60 bg-dc-accent/10 px-3 py-1 text-xs font-medium text-dc-text"
        >
          {pill.label}
          <button
            type="button"
            onClick={() => onRemove(pill)}
            className="rounded-full p-0.5 text-dc-muted hover:text-dc-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent"
            aria-label={`Remove ${pill.label} filter`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  )
}
