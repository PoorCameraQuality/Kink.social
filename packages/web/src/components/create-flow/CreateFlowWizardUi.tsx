import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import Button from '@/components/ui/Button'

export const CREATE_FLOW_STEPS = ['Basics', 'Details', 'Host', 'Publish'] as const

export const fieldSelectClass = cn(
  'w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2.5 text-sm text-dc-text',
  'focus:border-dc-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecke-focus-ring)]',
)

export const fieldTextareaClass = cn(
  'w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2.5 text-sm text-dc-text placeholder:text-dc-muted',
  'focus:border-dc-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecke-focus-ring)]',
)

export const fieldDatetimeClass = cn(
  'w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2.5 text-sm text-dc-text',
  '[color-scheme:dark] focus:border-dc-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecke-focus-ring)]',
)

export function CreateFlowStepper({ currentStep }: { currentStep: number }) {
  return (
    <nav className="mb-5" aria-label="Create event steps">
      <ol className="flex gap-1 sm:gap-2">
        {CREATE_FLOW_STEPS.map((label, i) => {
          const stepNum = i + 1
          const active = currentStep === stepNum
          const done = currentStep > stepNum
          return (
            <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  'h-1 w-full rounded-full transition-colors',
                  done || active ? 'bg-dc-accent' : 'bg-dc-border',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'truncate text-center text-[10px] font-medium uppercase tracking-wide sm:text-xs',
                  active ? 'text-dc-accent' : done ? 'text-dc-text-muted' : 'text-dc-muted',
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function SectionCard({
  title,
  badge,
  children,
  variant = 'default',
}: {
  title: string
  badge?: string
  children: ReactNode
  variant?: 'default' | 'highlight'
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border p-4 sm:p-5',
        variant === 'highlight' ?
          'border-dc-accent-border/40 bg-dc-surface'
        : 'border-dc-border bg-dc-elevated-solid',
      )}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-dc-text">{title}</h3>
        {badge ?
          <span className="rounded-md border border-dc-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-dc-text-muted">
            {badge}
          </span>
        : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function FormatToggle({
  value,
  onChange,
}: {
  value: 'in-person' | 'virtual'
  onChange: (v: 'in-person' | 'virtual') => void
}) {
  return (
    <div
      className="flex rounded-xl border border-dc-border bg-dc-surface p-1"
      role="group"
      aria-label="Event format"
    >
      {(
        [
          { id: 'in-person' as const, label: 'In person' },
          { id: 'virtual' as const, label: 'Virtual' },
        ] as const
      ).map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'min-h-11 flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecke-focus-ring)]',
              active ?
                'bg-dc-accent/15 text-dc-accent shadow-[inset_0_0_0_1px_var(--dc-accent-border)]'
              : 'text-dc-text-muted hover:bg-dc-elevated-muted hover:text-dc-text',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function WizardCheckbox({
  id,
  label,
  checked,
  onChange,
  description,
  disabled,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-start gap-3 rounded-lg border border-transparent py-1',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-dc-border/50',
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border-dc-border-strong bg-dc-elevated-solid text-dc-accent focus:ring-[var(--ecke-focus-ring)]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-dc-text">{label}</span>
        {description ?
          <span className="mt-0.5 block text-dc-micro text-dc-text-muted">{description}</span>
        : null}
      </span>
    </label>
  )
}

export function StickyWizardFooter({
  leftLabel,
  onLeft,
  onPrimary,
  primaryLabel,
  primaryDisabled,
  primaryLoading,
  primaryTestId,
}: {
  leftLabel: string
  onLeft: () => void
  onPrimary: () => void
  primaryLabel: string
  primaryDisabled?: boolean
  primaryLoading?: boolean
  primaryTestId?: string
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3">
      <Button type="button" variant="ghost" size="md" onClick={onLeft} className="min-h-touch min-w-[5.5rem]">
        {leftLabel}
      </Button>
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={onPrimary}
        disabled={primaryDisabled || primaryLoading}
        data-testid={primaryTestId}
        className="min-h-touch min-w-[5.5rem]"
      >
        {primaryLoading ? 'Publishing…' : primaryLabel}
      </Button>
    </div>
  )
}

export const GROUP_CREATE_STEPS = ['Basics', 'Community', 'Review'] as const

export function GroupCreateStepper({ currentStep }: { currentStep: number }) {
  return (
    <nav className="mb-5" aria-label="Create group steps">
      <ol className="flex gap-1 sm:gap-2">
        {GROUP_CREATE_STEPS.map((label, i) => {
          const stepNum = i + 1
          const active = currentStep === stepNum
          const done = currentStep > stepNum
          return (
            <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  'h-1 w-full rounded-full transition-colors',
                  done || active ? 'bg-dc-accent' : 'bg-dc-border',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'truncate text-center text-[10px] font-medium uppercase tracking-wide sm:text-xs',
                  active ? 'text-dc-accent' : done ? 'text-dc-text-muted' : 'text-dc-muted',
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function PreviewRow({ label, value, missing }: { label: string; value: string; missing?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-dc-micro font-medium uppercase tracking-wide text-dc-text-muted sm:w-36">
        {label}
      </dt>
      <dd className={cn('text-sm', missing ? 'text-dc-danger' : 'text-dc-text')}>{value}</dd>
    </div>
  )
}

export function PreviewSummary({ children }: { children: ReactNode }) {
  return (
    <dl className="space-y-3 rounded-2xl border border-dc-border bg-dc-surface p-4">{children}</dl>
  )
}
