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

const chipClass = (active: boolean) =>
  `shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium min-h-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent ${
    active ?
      'border-dc-accent bg-dc-accent text-dc-accent-foreground'
    : 'border-dc-border bg-dc-elevated-solid text-dc-text-muted hover:border-dc-border-strong hover:text-dc-text'
  }`

export default function ExploreChipRow({ chips, onToggle, ariaLabel, variant = 'discovery' }: Props) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-1 c2k-no-scrollbar -mx-1 px-1 ${variant === 'topic' ? 'mt-2' : ''}`}
      role="group"
      aria-label={ariaLabel}
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          aria-pressed={chip.active}
          className={chipClass(chip.active)}
          onClick={() => onToggle(chip.id)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}
