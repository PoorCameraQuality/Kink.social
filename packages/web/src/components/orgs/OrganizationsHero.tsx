import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { siteConfig } from '@/config/site.config'

type Props = {
  hasOrganizerAccess: boolean
  scopesLoading: boolean
}

type OrgTool = {
  title: string
  href: string
  icon: ReactNode
}

const ORG_TOOLS: OrgTool[] = [
  {
    title: 'Events',
    href: '/events',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: 'Door tools',
    href: '/organizer',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    title: 'Groups',
    href: '/groups',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    title: 'Conventions',
    href: '/organizer',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    title: 'Staff',
    href: '/organizer',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: 'Education',
    href: '/education',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
]

function ToolChip({ tool }: { tool: OrgTool }) {
  return (
    <Link
      to={tool.href}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-dc-border/70 bg-dc-elevated-solid/80 px-2.5 py-1.5 text-xs font-medium text-dc-text-muted transition-colors hover:border-dc-accent-border/50 hover:text-dc-accent"
    >
      <span className="text-dc-accent">{tool.icon}</span>
      {tool.title}
    </Link>
  )
}

export default function OrganizationsHero({ hasOrganizerAccess, scopesLoading }: Props) {
  return (
    <header className="mb-6">
      <section
        className="relative overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated-solid/80 shadow-[var(--dc-shadow-soft)]"
        aria-label={`Organizations on ${siteConfig.name}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dc-accent/10 via-transparent to-transparent" aria-hidden />

        <div className="relative px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dc-accent">Organizer toolkit</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">Organizations</h1>
              <p className="mt-2 text-sm leading-relaxed text-dc-text-muted">
                Run events, groups, conventions, and staff workflows from one org profile on {siteConfig.name}.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                to="/orgs/new"
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-dc-accent px-4 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
              >
                Create organization
              </Link>
              {!scopesLoading && hasOrganizerAccess ?
                <Link
                  to="/organizer"
                  className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-dc-accent-border px-4 text-sm font-semibold text-dc-accent hover:bg-dc-accent-muted/25"
                >
                  Dashboard
                  <span aria-hidden>→</span>
                </Link>
              : null}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-dc-border/50 pt-4 sm:flex-row sm:items-center sm:gap-3">
            <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-dc-muted">Includes</p>
            <div className="flex flex-wrap gap-2">
              {ORG_TOOLS.map((tool) => (
                <ToolChip key={tool.title} tool={tool} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </header>
  )
}
