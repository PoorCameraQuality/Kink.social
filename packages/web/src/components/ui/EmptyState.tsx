import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'

export type EmptyStateProps = {
  title?: string
  message: string
  icon?: ReactNode
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  secondaryOnAction?: () => void
  actionLabel?: string
  onAction?: () => void
  nextSteps?: string[]
  className?: string
  inline?: boolean
  /** Tighter mobile layout — less vertical padding, smaller icon ring */
  compact?: boolean
  reassurance?: string
}

export default function EmptyState({
  title,
  message,
  icon,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  secondaryOnAction,
  actionLabel,
  onAction,
  nextSteps,
  className = '',
  inline = false,
  compact = false,
  reassurance,
}: EmptyStateProps) {
  const alignStart = /\btext-left\b/.test(className)
  const body = (
    <div className={`relative ${inline ? '' : 'c2k-empty-glow'} ${compact ? 'c2k-empty-state-compact' : ''}`}>
      {icon ?
        <div className={`c2k-empty-icon-ring ${alignStart ? '' : 'mx-auto'} ${compact ? 'mb-3' : 'mb-4'}`} aria-hidden>
          {icon}
        </div>
      : null}
      {title ?
        <p
          className={
            compact ?
              'text-sm font-medium text-dc-text-muted'
            : 'font-semibold font-display text-lg text-dc-text'
          }
        >
          {title}
        </p>
      : null}
      <p className={`text-sm leading-relaxed text-dc-text-muted ${title || icon ? (compact ? 'mt-1' : 'mt-2') : ''}`}>{message}</p>
      {nextSteps?.length ? (
        <ul className="mt-3 space-y-1 text-left text-sm text-dc-text-muted">
          {nextSteps.map((step) => (
            <li key={step} className="list-disc ml-5">
              {step}
            </li>
          ))}
        </ul>
      ) : null}
      <div
        className={`relative flex flex-wrap items-center gap-2 sm:gap-3 ${
          alignStart ? 'justify-start max-sm:flex-col max-sm:items-stretch' : 'justify-center'
        } ${compact ? 'mt-3' : 'mt-5'}`}
      >
        {actionLabel && onAction ?
          <button
            type="button"
            onClick={onAction}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-dc-accent px-4 text-sm font-medium text-dc-accent-foreground hover:bg-dc-accent-hover active:scale-[0.98] transition-transform"
          >
            {actionLabel}
          </button>
        : null}
        {ctaLabel && ctaHref ?
          <Link
            to={ctaHref}
            className={
              actionLabel ?
                'inline-flex min-h-11 items-center rounded-xl border border-dc-border px-4 text-sm text-dc-text-muted hover:text-dc-text active:scale-[0.98] transition-transform'
              : 'inline-flex min-h-11 items-center justify-center rounded-xl bg-dc-accent px-4 text-sm font-medium text-dc-accent-foreground hover:bg-dc-accent-hover active:scale-[0.98] transition-transform'
            }
          >
            {ctaLabel}
          </Link>
        : null}
        {secondaryCtaLabel && secondaryOnAction ?
          <button
            type="button"
            onClick={secondaryOnAction}
            className="inline-flex min-h-11 items-center rounded-xl border border-dc-border px-4 text-sm text-dc-text-muted hover:text-dc-text active:scale-[0.98] transition-transform"
          >
            {secondaryCtaLabel}
          </button>
        : null}
        {secondaryCtaLabel && secondaryCtaHref && !secondaryOnAction ?
          <Link
            to={secondaryCtaHref}
            className="inline-flex min-h-11 items-center rounded-xl border border-dc-border px-4 text-sm text-dc-text-muted hover:text-dc-text active:scale-[0.98] transition-transform"
          >
            {secondaryCtaLabel}
          </Link>
        : null}
      </div>
      {reassurance ?
        <p className="mt-3 text-[11px] leading-snug text-dc-muted">{reassurance}</p>
      : null}
    </div>
  )

  if (inline) {
    return (
      <div
        className={`overflow-hidden ${alignStart ? 'text-left' : 'text-center'} ${compact ? 'px-0 py-3' : 'px-4 py-6 sm:px-6 sm:py-8'} ${className}`.trim()}
        role="status"
      >
        {body}
      </div>
    )
  }

  return (
    <div role="status">
      <Card className={`dc-card-polish text-center ${compact ? 'p-5 sm:p-8' : 'p-8 sm:p-12'} ${className}`.trim()}>{body}</Card>
    </div>
  )
}
