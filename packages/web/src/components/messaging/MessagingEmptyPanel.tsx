import { Link } from 'react-router-dom'

type Action = {
  label: string
  href?: string
  onClick?: () => void
  primary?: boolean
}

type Props = {
  icon?: 'inbox' | 'requests' | 'iso' | 'select'
  title: string
  message: string
  actions?: Action[]
  footer?: React.ReactNode
  className?: string
  compact?: boolean
}

function EmptyIcon({ kind }: { kind: NonNullable<Props['icon']> }) {
  const common = 'h-6 w-6 text-dc-accent'
  if (kind === 'select') {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    )
  }
  if (kind === 'requests') {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    )
  }
  if (kind === 'iso') {
    return (
      <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    )
  }
  return (
    <svg className={common} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  )
}

export default function MessagingEmptyPanel({ icon = 'inbox', title, message, actions, footer, className = '', compact = false }: Props) {
  return (
    <div
      className={`c2k-empty-glow flex flex-col items-center justify-center text-center dc-card-polish ${
        compact ?
          'c2k-empty-state-compact rounded-xl border border-dc-border/60 bg-dc-elevated-solid/70 px-4 py-6'
        : 'rounded-2xl border border-white/[0.07] bg-dc-elevated-solid/80 px-6 py-10 shadow-[var(--dc-shadow-soft)]'
      } ${className}`}
    >
      <div className={`c2k-empty-icon-ring ${compact ? '' : ''}`} aria-hidden>
        <EmptyIcon kind={icon} />
      </div>
      <h2 className={`font-semibold font-display text-dc-text ${compact ? 'mt-3 text-base' : 'mt-4 text-lg'}`}>{title}</h2>
      <p className={`max-w-md leading-relaxed text-dc-text-muted ${compact ? 'mt-1.5 text-sm' : 'mt-2 text-sm'}`}>{message}</p>
      {actions && actions.length > 0 ?
        <div className={`flex flex-wrap items-center justify-center gap-2 ${compact ? 'mt-4' : 'mt-6'}`}>
          {actions.map((action) =>
            action.href ?
              <Link
                key={action.label}
                to={action.href}
                className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold ${
                  action.primary ?
                    'bg-dc-accent text-dc-accent-foreground hover:bg-dc-accent-hover'
                  : 'border border-dc-border text-dc-text-muted hover:border-dc-accent-border hover:text-dc-text'
                }`}
              >
                {action.label}
              </Link>
            : <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold ${
                  action.primary ?
                    'bg-dc-accent text-dc-accent-foreground hover:bg-dc-accent-hover'
                  : 'border border-dc-border text-dc-text-muted hover:border-dc-accent-border hover:text-dc-text'
                }`}
              >
                {action.label}
              </button>,
          )}
        </div>
      : null}
      {footer ? <div className="mt-6 text-xs text-dc-muted">{footer}</div> : null}
    </div>
  )
}
