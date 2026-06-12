import { Link } from 'react-router-dom'
import { LANDING_SHORTCUTS } from '@/components/landing/landing-content'

export default function LandingFeatureShortcuts({ className = '' }: { className?: string }) {
  return (
    <nav className={className} aria-label="Explore Kink Social">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-dc-muted">Explore</p>
      <div className="grid grid-cols-2 gap-2">
        {LANDING_SHORTCUTS.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-dc-border bg-dc-elevated-solid px-3 text-sm font-medium text-dc-text transition-colors hover:border-dc-accent-border/50 hover:bg-dc-elevated-hover"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
