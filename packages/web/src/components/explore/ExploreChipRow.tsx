type Chip = {
  id: string
  label: string
  active: boolean
}

type Props = {
  chips: Chip[]
  onToggle: (id: string) => void
  ariaLabel: string
  variant?: 'discovery' | 'topic'
}

const chipClass = (active: boolean, variant: 'discovery' | 'topic') =>
  `shrink-0 rounded-full border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent ${
    variant === 'topic' ? 'min-h-9 px-3 py-1.5 text-xs' : 'min-h-10 px-3.5 py-2 text-sm'
  } ${
    active ?
      'border-dc-accent bg-dc-accent text-dc-accent-foreground'
    : 'border-dc-border bg-dc-elevated-solid text-dc-text-muted hover:border-dc-border-strong hover:text-dc-text'
  }`

export default function ExploreChipRow({ chips, onToggle, ariaLabel, variant = 'discovery' }: Props) {
  return (
    <div className="relative">
      <div
        className={`flex gap-2 overflow-x-auto pb-1 c2k-no-scrollbar ${variant === 'topic' ? '' : ''}`}
        role="group"
        aria-label={ariaLabel}
      >
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            aria-pressed={chip.active}
            className={chipClass(chip.active, variant)}
            onClick={() => onToggle(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-dc-surface to-transparent lg:w-10"
        aria-hidden
      />
    </div>
  )
}
