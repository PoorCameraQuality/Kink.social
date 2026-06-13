import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  title: string
  description?: string
  href?: string
  linkLabel?: string
  children: ReactNode
  className?: string
}

export default function ExploreHubSection({ title, description, href, linkLabel, children, className = '' }: Props) {
  return (
    <section className={`border-b border-dc-border/40 pb-8 last:border-b-0 last:pb-0 lg:pb-10 ${className}`}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-dc-text lg:text-xl">{title}</h2>
          {description ?
            <p className="mt-1 text-sm leading-relaxed text-dc-text-muted">{description}</p>
          : null}
        </div>
        {href && linkLabel ?
          <Link
            to={href}
            className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold text-dc-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent rounded"
          >
            {linkLabel}
            <span aria-hidden>→</span>
          </Link>
        : null}
      </div>
      {children}
    </section>
  )
}
