import type { PresenterOnboardingTrack } from '@/lib/presenter-focus'
import type { ProfileFocus } from '@/lib/presenter-focus'
import { PRESENTER_OPTIONAL_STEPS, PRESENTER_STEP_LABELS, stepsForTrack } from '@/lib/presenter-onboarding'
import { WizardShell, type WizardStepMeta } from '@/components/ui/primitives'

type OnboardingShellProps = {
  track: PresenterOnboardingTrack | null
  step: string
  hybridFocuses?: ProfileFocus[]
  children: React.ReactNode
}

export function OnboardingShell({ track, step, hybridFocuses = [], children }: OnboardingShellProps) {
  const steps: WizardStepMeta[] = stepsForTrack(track, hybridFocuses).map((id) => ({
    id,
    label: PRESENTER_STEP_LABELS[id] ?? id,
    optional: PRESENTER_OPTIONAL_STEPS.has(id),
  }))

  return (
    <WizardShell
      brand="Professional profile"
      title="Set up your professional profile"
      description="Creator and educator profiles share one capability profile on your account — portable across organizations and events."
      steps={steps}
      currentStepId={step}
    >
      {children}
    </WizardShell>
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
