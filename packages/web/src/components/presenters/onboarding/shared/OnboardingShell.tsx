import type { PresenterOnboardingTrack } from '@/lib/presenter-focus'
import { stepIndexForTrack } from '@/lib/presenter-onboarding'
import type { ProfileFocus } from '@/lib/presenter-focus'
import { stepsForTrack } from '@/lib/presenter-onboarding'

type OnboardingShellProps = {
  track: PresenterOnboardingTrack | null
  step: string
  hybridFocuses?: ProfileFocus[]
  children: React.ReactNode
}

export function OnboardingShell({ track, step, hybridFocuses = [], children }: OnboardingShellProps) {
  const steps = stepsForTrack(track, hybridFocuses)
  const idx = stepIndexForTrack(track, step, hybridFocuses)
  const total = steps.length

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:py-12">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-dc-text-muted">
          Professional profile setup · Step {idx + 1} of {total}
        </p>
        <div
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={idx + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Onboarding step ${idx + 1} of ${total}`}
        >
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full ${i <= idx ? 'bg-dc-accent' : 'bg-dc-elevated-solid'}`}
            />
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}

type StepNavProps = {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  secondaryAction?: React.ReactNode
  saving?: boolean
}

export function StepNav({
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled,
  secondaryAction,
  saving,
}: StepNavProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 pt-2">
      {onBack ?
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:flex-1 min-h-11 py-3 rounded-xl border border-dc-border text-dc-text-muted hover:text-dc-text font-medium"
        >
          Back
        </button>
      : null}
      {secondaryAction}
      {onNext ?
        <button
          type="button"
          disabled={nextDisabled || saving}
          onClick={onNext}
          className="w-full sm:flex-1 min-h-11 py-3 bg-dc-accent hover:bg-dc-accent-hover text-dc-accent-foreground font-medium rounded-xl disabled:opacity-50"
        >
          {saving ? 'Saving…' : nextLabel}
        </button>
      : null}
    </div>
  )
}

export function OnboardingError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="mb-4 rounded-lg border border-dc-danger/30 bg-dc-danger/10 px-3 py-2 text-sm text-dc-danger">
      {message}
    </p>
  )
}

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-3 text-sm text-dc-text'
const textareaClass =
  'mt-1 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-3 py-2 text-sm text-dc-text'
const labelClass = 'block text-sm font-medium text-dc-text'

export function FieldInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  helper,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  helper?: string
}) {
  const helperId = helper ? `${id}-helper` : undefined
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={helperId}
        className={inputClass}
      />
      {helper ?
        <p id={helperId} className="mt-1 text-xs text-dc-text-muted">
          {helper}
        </p>
      : null}
    </div>
  )
}

export function FieldTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  helper,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  helper?: string
}) {
  const helperId = helper ? `${id}-helper` : undefined
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-describedby={helperId}
        className={textareaClass}
      />
      {helper ?
        <p id={helperId} className="mt-1 text-xs text-dc-text-muted">
          {helper}
        </p>
      : null}
    </div>
  )
}
