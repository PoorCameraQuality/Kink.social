'use client'

/**
 * Shared card container. Base styles: bg, rounded corners, border, shadow.
 * Add padding via className (e.g. p-4, p-6).
 */
export default function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const baseClasses = 'bg-c2k-bg-card rounded-2xl border border-white/10 shadow-c2k-soft'
  return <div className={`${baseClasses} ${className}`.trim()}>{children}</div>
}
