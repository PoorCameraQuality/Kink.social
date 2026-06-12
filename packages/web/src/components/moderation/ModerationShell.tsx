import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import EmptyState from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useApiPlatformStaff } from '@/hooks/useApiPlatformStaff'
import { usePlatformModeratorGate } from '@/hooks/usePlatformModeratorGate'
import type { ModerationOutletContext } from '@/lib/moderation/moderation-outlet-context'

type Summary = { openReports: number; openProfileFlags: number }

async function fetchModerationSummary(): Promise<Summary | null> {
  try {
    const r = await fetch('/api/v1/moderation/summary', { credentials: 'include' })
    if (!r.ok) return null
    return (await r.json()) as Summary
  } catch {
    return null
  }
}

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap',
    isActive ? 'bg-dc-accent/15 text-dc-accent' : 'text-dc-muted hover:text-dc-text hover:bg-dc-elevated-muted',
  ].join(' ')
}

type ModNavLinkProps = {
  to: string
  end?: boolean
  children: ReactNode
  onNavigate?: () => void
  className?: string
}

function ModNavLink({ to, end, children, onNavigate, className = '' }: ModNavLinkProps) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `${navClass({ isActive })} ${className}`.trim()} onClick={onNavigate}>
      {children}
    </NavLink>
  )
}

export default function ModerationShell() {
  const { isAuthenticated, status: authStatus } = useAuth()
  const { gate, siteAdmin } = usePlatformModeratorGate()
  const { staff } = useApiPlatformStaff(gate === 'ok')
  const location = useLocation()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [moderationRefreshKey, setModerationRefreshKey] = useState(0)
  const [moreAdminOpen, setMoreAdminOpen] = useState(false)

  const refreshModeration = useCallback(() => {
    setModerationRefreshKey((n) => n + 1)
  }, [])

  const showLegal = staff?.siteAdmin || staff?.legalAdmin
  const showDmca = staff?.siteAdmin || staff?.trustSafetyAdmin || staff?.legalAdmin

  useEffect(() => {
    if (gate !== 'ok') return
    let cancelled = false
    void (async () => {
      const next = await fetchModerationSummary()
      if (!cancelled) setSummary(next)
    })()
    return () => {
      cancelled = true
    }
  }, [gate, location.pathname, moderationRefreshKey])

  if (authStatus !== 'ready') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-dc-muted">
        Checking session…
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState message="Sign in to access moderation tools." ctaLabel="Home" ctaHref="/home" />
      </div>
    )
  }

  if (gate === 'loading' || gate === 'idle') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-dc-muted">
        Checking moderator access…
      </div>
    )
  }

  if (gate === 'no') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          message="Your account is not platform staff (platform_staff table or C2K_PLATFORM_MODERATOR_USER_IDS)."
          ctaLabel="Back to settings"
          ctaHref="/settings"
        />
      </div>
    )
  }

  if (gate === 'err') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState message="Could not verify moderator status." ctaLabel="Settings" ctaHref="/settings" />
      </div>
    )
  }

  const closeMoreAdmin = () => setMoreAdminOpen(false)

  const secondaryNav = (dropdown?: boolean) => (
    <>
      <ModNavLink to="/moderation/actions" onNavigate={dropdown ? closeMoreAdmin : undefined} className={dropdown ? 'block w-full rounded-none px-3 py-2.5' : ''}>
        Actions
      </ModNavLink>
      <ModNavLink
        to="/moderation/profile-flags"
        onNavigate={dropdown ? closeMoreAdmin : undefined}
        className={dropdown ? 'block w-full rounded-none px-3 py-2.5' : ''}
      >
        Profile flags
        {summary && summary.openProfileFlags > 0 ?
          <span className="ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-amber-500/20 px-1.5 text-xs font-semibold text-amber-200">
            {summary.openProfileFlags}
          </span>
        : null}
      </ModNavLink>
      <ModNavLink to="/moderation/audit" onNavigate={dropdown ? closeMoreAdmin : undefined} className={dropdown ? 'block w-full rounded-none px-3 py-2.5' : ''}>
        Audit
      </ModNavLink>
      {showDmca ?
        <ModNavLink to="/moderation/dmca" onNavigate={dropdown ? closeMoreAdmin : undefined} className={dropdown ? 'block w-full rounded-none px-3 py-2.5' : ''}>
          DMCA
        </ModNavLink>
      : null}
      {showLegal ?
        <ModNavLink to="/moderation/legal" onNavigate={dropdown ? closeMoreAdmin : undefined} className={dropdown ? 'block w-full rounded-none px-3 py-2.5' : ''}>
          Legal
        </ModNavLink>
      : null}
      {showDmca ?
        <ModNavLink to="/moderation/contact" onNavigate={dropdown ? closeMoreAdmin : undefined} className={dropdown ? 'block w-full rounded-none px-3 py-2.5' : ''}>
          Contact inbox
        </ModNavLink>
      : null}
      {siteAdmin ?
        <ModNavLink to="/moderation/admin" onNavigate={dropdown ? closeMoreAdmin : undefined} className={dropdown ? 'block w-full rounded-none px-3 py-2.5' : ''}>
          Admin
        </ModNavLink>
      : null}
    </>
  )

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4 sm:mb-6">
        <div>
          <h1 className="text-xl font-bold text-dc-text sm:text-2xl">Moderation dashboard</h1>
          <p className="text-sm text-dc-muted mt-1 max-w-2xl">
            Review member reports and trust flags. Decisions are human-only · AI triage is not enabled on this queue.
          </p>
        </div>
        <Link to="/settings" className="text-sm text-dc-accent hover:underline shrink-0">
          Settings
        </Link>
      </header>

      <nav className="mb-4 sm:mb-6 border-b border-dc-border pb-3" aria-label="Moderation sections">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:gap-2 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          <ModNavLink to="/moderation/dashboard">Dashboard</ModNavLink>
          <ModNavLink to="/moderation/queues">Queues</ModNavLink>
          <ModNavLink to="/moderation/cases">Cases</ModNavLink>
          <ModNavLink to="/moderation/reports" end>
            Reports
            {summary && summary.openReports > 0 ?
              <span className="ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full bg-dc-accent/20 px-1.5 text-xs font-semibold text-dc-accent">
                {summary.openReports}
              </span>
            : null}
          </ModNavLink>
          <div className="hidden md:contents">{secondaryNav()}</div>
          <div className="relative shrink-0 md:hidden">
            <button
              type="button"
              onClick={() => setMoreAdminOpen((o) => !o)}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                moreAdminOpen ? 'bg-dc-accent/15 text-dc-accent' : 'text-dc-muted hover:bg-dc-elevated-muted hover:text-dc-text'
              }`}
              aria-expanded={moreAdminOpen}
            >
              More admin
            </button>
            {moreAdminOpen ?
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-dc-border bg-dc-elevated-solid py-1 shadow-[var(--dc-shadow-panel)]">
                {secondaryNav(true)}
              </div>
            : null}
          </div>
        </div>
      </nav>

      <Outlet
        context={
          { refreshModeration, moderationRefreshKey } satisfies ModerationOutletContext
        }
      />
    </div>
  )
}
