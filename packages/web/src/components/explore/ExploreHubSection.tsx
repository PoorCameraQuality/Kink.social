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
    <section className={className}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-dc-text">{title}</h2>
          {description ?
            <p className="mt-1 text-sm text-dc-text-muted">{description}</p>
          : null}
        </div>
        {href && linkLabel ?
          <Link to={href} className="shrink-0 text-sm font-semibold text-dc-accent hover:underline">
            {linkLabel}
          </Link>
        : null}
      </div>
      {children}
    </section>
  )
}
