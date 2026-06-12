import { Link } from 'react-router-dom'

type Action = {
  label: string
  href: string
  primary?: boolean
}

type Props = {
  title: string
  message: string
  actions?: Action[]
  className?: string
}

export default function NotificationsEmptyPanel({ title, message, actions, className = '' }: Props) {
  return (
    <div
      className={`rounded-2xl border border-dc-border bg-dc-elevated-solid px-6 py-10 text-center shadow-[var(--dc-shadow-soft)] ${className}`}
    >
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-dc-border bg-dc-surface-muted/60"
        aria-hidden
      >
        <svg className="h-8 w-8 text-dc-accent/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </div>
      <h2 className="mt-5 text-lg font-semibold text-dc-text">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dc-text-muted">{message}</p>
      {actions && actions.length > 0 ?
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold sm:w-auto ${
                action.primary ?
                  'bg-dc-accent text-dc-accent-foreground hover:bg-dc-accent-hover'
                : 'border border-dc-border text-dc-text-muted hover:border-dc-accent-border hover:text-dc-text'
              }`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      : null}
    </div>
  )
}
