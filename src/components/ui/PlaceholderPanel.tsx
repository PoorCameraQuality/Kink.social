import type { ReactNode } from 'react'

/**
 * Reusable empty / coming-soon panel (design audit P2 — consistent placeholder anatomy).
 */
export default function PlaceholderPanel({
  title,
  description,
  children,
  className = '',
}: {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-c2k-bg-card/80 px-6 py-12 text-center shadow-c2k-soft ${className}`}
      role="status"
    >
      <p className="text-lg font-semibold text-white">{title}</p>
      {description && <p className="mt-2 text-sm text-c2k-text-secondary">{description}</p>}
      {children}
    </div>
  )
}
