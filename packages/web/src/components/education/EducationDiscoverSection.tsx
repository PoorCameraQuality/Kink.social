import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  viewAllHref?: string
  viewAllLabel?: string
  children: ReactNode
  className?: string
}

export default function EducationDiscoverSection({
  title,
  viewAllHref = '/education',
  viewAllLabel = 'View all',
  children,
  className = '',
}: Props) {
  return (
    <section className={`mb-10 ${className}`.trim()} aria-labelledby={`edu-section-${title.replace(/\s+/g, '-')}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id={`edu-section-${title.replace(/\s+/g, '-')}`}
          className="text-sm font-semibold uppercase tracking-wide text-dc-text"
        >
          {title}
        </h2>
        <Link
          to={viewAllHref}
          className="shrink-0 text-xs font-semibold text-dc-accent hover:underline"
        >
          {viewAllLabel}
        </Link>
      </div>
      {children}
    </section>
  )
}
