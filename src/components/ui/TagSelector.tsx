'use client'

interface TagSelectorProps {
  tags: readonly string[]
  selectedTags: string[]
  onToggle: (tag: string) => void
  size?: 'default' | 'small'
  showHash?: boolean
  className?: string
  /** Accessible name for the group of tag toggles */
  ariaLabel?: string
}

export default function TagSelector({
  tags,
  selectedTags,
  onToggle,
  size = 'default',
  showHash = true,
  className = '',
  ariaLabel = 'Filter by tag',
}: TagSelectorProps) {
  const sizeClasses = size === 'small' ? 'px-2 py-2 text-xs min-h-11' : 'px-3 py-2 text-sm min-h-11'
  return (
    <div role="group" aria-label={ariaLabel} className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(tag)}
            className={`rounded-lg border transition-colors ${sizeClasses} ${
              selected
                ? 'bg-c2k-accent-primary/20 border-c2k-accent-primary text-c2k-accent-primary'
                : 'border-white/20 text-c2k-text-muted hover:border-white/40'
            }`}
          >
            {showHash ? `#${tag}` : tag}
          </button>
        )
      })}
    </div>
  )
}
