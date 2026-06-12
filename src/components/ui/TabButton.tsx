'use client'

interface TabButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
  size?: 'default' | 'small'
  className?: string
  /**
   * `tab` — use inside a `role="tablist"` (sets `role="tab"` + `aria-selected`).
   * `toggle` — standalone filter chips (`aria-pressed`).
   */
  ariaStyle?: 'tab' | 'toggle'
}

export default function TabButton({
  label,
  isActive,
  onClick,
  size = 'default',
  className = '',
  ariaStyle = 'tab',
}: TabButtonProps) {
  const sizeClasses =
    size === 'small' ? 'px-3 py-2 text-xs min-h-11' : 'px-4 py-2 text-sm min-h-11'

  const aria =
    ariaStyle === 'tab'
      ? { role: 'tab' as const, 'aria-selected': isActive }
      : { 'aria-pressed': isActive as boolean }

  return (
    <button
      type="button"
      onClick={onClick}
      {...aria}
      className={`flex-shrink-0 rounded-lg font-medium transition-colors ${sizeClasses} ${
        isActive ? 'text-c2k-accent-primary bg-c2k-accent-primary/10' : 'text-c2k-text-secondary hover:text-white hover:bg-white/5'
      } ${className}`}
    >
      {label}
    </button>
  )
}
