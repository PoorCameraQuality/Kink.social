/**
 * Shared card container - ECKE elevated panel (matches dancecard Panel).
 */
export default function Card({
  children,
  className = '',
  padding = 'none',
}: {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}) {
  const baseClasses =
    'rounded-2xl border border-dc-border bg-dc-elevated/95 shadow-[var(--dc-shadow-soft)] backdrop-blur-sm'
  const paddingClass = padding === 'sm' ? 'p-3' : padding === 'md' ? 'p-4' : padding === 'lg' ? 'p-6' : ''
  return <div className={`${baseClasses} ${paddingClass} ${className}`.trim()}>{children}</div>
}
