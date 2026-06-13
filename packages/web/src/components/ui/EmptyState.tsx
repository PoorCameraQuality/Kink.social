import type { ElementType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/components/ui/Card'
import { cardSurfaceSolidClass } from '@/lib/card-surface'

export type EmptyStateAction = {
  label: string
  href?: string
  onClick?: () => void
  primary?: boolean
}

export type EmptyStateVariant = 'card' | 'inline' | 'surface'

export type EmptyStateProps = {
  title?: string
  /** Primary body copy (alias: description) */
  message: string
  icon?: ReactNode
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  secondaryOnAction?: () => void
  actionLabel?: string
  onAction?: () => void
  /** Multi-action row (messaging, notifications, connections) */
  actions?: EmptyStateAction[]
  nextSteps?: string[]
  className?: string
  /** @deprecated Prefer `variant="inline"` */
  inline?: boolean
  variant?: EmptyStateVariant
  align?: 'center' | 'start'
  /** Heading element — default `p` for inline/compact, `h2` otherwise */
  titleAs?: 'h2' | 'p'
  /** Tighter mobile layout — less vertical padding, smaller icon ring */
  compact?: boolean
  reassurance?: string
  footer?: ReactNode
}

function resolveVariant(inline: boolean, variant?: EmptyStateVariant): EmptyStateVariant {
  if (variant) return variant
  return inline ? 'inline' : 'card'
}

function actionButtonClass(primary?: boolean) {
  return primary ?
      'inline-flex min-h-11 items-center justify-center rounded-xl bg-dc-accent px-4 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover active:scale-[0.98] transition-transform'
    : 'inline-flex min-h-11 items-center justify-center rounded-xl border border-dc-border px-4 text-sm font-semibold text-dc-text-muted hover:border-dc-accent-border hover:text-dc-text active:scale-[0.98] transition-transform'
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
  actions,
  nextSteps,
  className = '',
  inline = false,
  variant,
  align,
  titleAs,
  compact = false,
  reassurance,
  footer,
}: EmptyStateProps) {
  const resolvedVariant = resolveVariant(inline, variant)
  const alignStart = align === 'start' || /\btext-left\b/.test(className)
  const TitleTag: ElementType = titleAs ?? (resolvedVariant === 'inline' || compact ? 'p' : 'h2')
  const titleClass =
    compact ?
      'text-sm font-medium text-dc-text-muted'
    : resolvedVariant === 'inline' ?
      'font-semibold font-display text-lg text-dc-text'
    : 'font-semibold font-display text-lg text-dc-text'

  const actionRow = actions && actions.length > 0

  const body = (
    <div
      className={`relative ${resolvedVariant !== 'inline' ? 'c2k-empty-glow' : ''} ${compact ? 'c2k-empty-state-compact' : ''}`}
    >
      {icon ?
        <div className={`c2k-empty-icon-ring ${alignStart ? '' : 'mx-auto'} ${compact ? 'mb-3' : 'mb-4'}`} aria-hidden>
          {icon}
        </div>
      : null}
      {title ?
        <TitleTag className={titleClass}>{title}</TitleTag>
      : null}
      <p className={`text-sm leading-relaxed text-dc-text-muted ${title || icon ? (compact ? 'mt-1' : 'mt-2') : ''}`}>
        {message}
      </p>
      {nextSteps?.length ?
        <ul className="mt-3 space-y-1 text-left text-sm text-dc-text-muted">
          {nextSteps.map((step) => (
            <li key={step} className="ml-5 list-disc">
              {step}
            </li>
          ))}
        </ul>
      : null}
      <div
        className={`relative flex flex-wrap items-center gap-2 sm:gap-3 ${
          alignStart ? 'max-sm:flex-col max-sm:items-stretch justify-start' : 'justify-center'
        } ${compact ? 'mt-3' : 'mt-5'}`}
      >
        {actionRow ?
          actions.map((action) =>
            action.href ?
              <Link key={action.label} to={action.href} className={actionButtonClass(action.primary)}>
                {action.label}
              </Link>
            : <button key={action.label} type="button" onClick={action.onClick} className={actionButtonClass(action.primary)}>
                {action.label}
              </button>,
          )
        : null}
        {!actionRow && actionLabel && onAction ?
          <button type="button" onClick={onAction} className={actionButtonClass(true)}>
            {actionLabel}
          </button>
        : null}
        {!actionRow && ctaLabel && ctaHref ?
          <Link
            to={ctaHref}
            className={
              actionLabel ?
                actionButtonClass(false)
              : actionButtonClass(true)
            }
          >
            {ctaLabel}
          </Link>
        : null}
        {!actionRow && secondaryCtaLabel && secondaryOnAction ?
          <button type="button" onClick={secondaryOnAction} className={actionButtonClass(false)}>
            {secondaryCtaLabel}
          </button>
        : null}
        {!actionRow && secondaryCtaLabel && secondaryCtaHref && !secondaryOnAction ?
          <Link to={secondaryCtaHref} className={actionButtonClass(false)}>
            {secondaryCtaLabel}
          </Link>
        : null}
      </div>
      {footer ?
        <div className={`text-xs text-dc-muted ${compact ? 'mt-4' : 'mt-6'}`}>{footer}</div>
      : null}
      {reassurance ?
        <p className="mt-3 text-[11px] leading-snug text-dc-muted">{reassurance}</p>
      : null}
    </div>
  )

  const alignClass = alignStart ? 'text-left' : 'text-center'

  if (resolvedVariant === 'inline') {
    return (
      <div
        className={`overflow-hidden ${alignClass} ${compact ? 'px-0 py-3' : 'px-4 py-6 sm:px-6 sm:py-8'} ${className}`.trim()}
        role="status"
      >
        {body}
      </div>
    )
  }

  if (resolvedVariant === 'surface') {
    return (
      <div
        role="status"
        className={`flex flex-col items-center justify-center ${alignClass} dc-card-polish ${
          compact ?
            'c2k-empty-state-compact dc-surface-lift rounded-xl border border-dc-border/70 bg-dc-elevated-solid/85 px-4 py-6 shadow-[var(--dc-shadow-soft)]'
          : `${cardSurfaceSolidClass} px-6 py-10`
        } ${className}`.trim()}
      >
        {body}
      </div>
    )
  }

  return (
    <div role="status">
      <Card className={`dc-card-polish ${alignClass} ${compact ? 'p-5 sm:p-8' : 'p-8 sm:p-12'} ${className}`.trim()}>
        {body}
      </Card>
    </div>
  )
}
