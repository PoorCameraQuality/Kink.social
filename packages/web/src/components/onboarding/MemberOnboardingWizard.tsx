import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ageFromBirthDate,
  formatProfileBirthDateForInput,
  ONBOARDING_INTENT_OPTIONS,
  ONBOARDING_STEP_COUNT,
  parseDmRetentionSelectValue,
  parsePronounTags,
  PROFILE_GENDER_MAX,
  PROFILE_GENDER_VALUES,
  PROFILE_PRONOUN_MAX,
  PROFILE_PHOTO_GUIDELINES,
  profileBirthDateInputBounds,
  safeInternalPath,
  type PrivacySettings,
} from '@c2k/shared'
import { useAuth } from '@/contexts/AuthContext'
import { useAppToast } from '@/components/ui/AppToast'
import { useOnboardingState } from '@/hooks/useOnboardingState'
import { fetchAlphaMode, isAlphaInviteMode } from '@/lib/alpha-mode'
import { buildLoginHref } from '@/lib/auth-links'
import { orderOnboardingFirstSteps } from '@/lib/onboarding-first-steps'
import ZipLocationCandidatePicker from '@/components/profile/ZipLocationCandidatePicker'
import type { ZipPlaceCandidate } from '@/lib/profile-edit-location'
import Button from '@/components/ui/Button'
import TagMultiSelect from '@/components/ui/TagMultiSelect'
import MobileActionBar from '@/components/shell/MobileActionBar'
import OnboardingThemePicker from '@/components/onboarding/OnboardingThemePicker'
import { onboardingStepIcon } from '@/components/onboarding/onboarding-step-icons'
import {
  AlphaNotice,
  EncryptionNoticeCard,
  FadeIn,
  FeatureCard,
  FormStatusMessage,
  LoadingButton,
  OnboardingProgress,
  OnboardingSafetyReminderCard,
  OnboardingStepCard,
  PageShell,
} from '@/components/ui/primitives'
import { SettingsPageSkeleton } from '@/components/ui/skeleton'
import { ALPHA_UPLOAD_DISABLED_COPY } from '@/lib/alpha-mode'
import { attachUploadedProfilePhoto, uploadProfilePhotoFile } from '@/lib/profile-photo-upload'

const STEP_LABELS = ['Welcome', 'Look & feel', 'Safety', 'Profile', 'Privacy', 'Interests', 'First steps'] as const

const PRONOUN_PRESETS = ['He/Him', 'She/Her', 'They/Them', 'Ze/Zir', 'Any pronouns', 'Ask me']

const ONBOARDING_WHO_CAN_MESSAGE_OPTIONS: {
  value: PrivacySettings['whoCanMessage']
  label: string
  description: string
}[] = [
  {
    value: 'connections_only',
    label: 'Connections only',
    description: 'Recommended. Only people you connect with can message you.',
  },
  {
    value: 'groups_only',
    label: 'People in my groups',
    description: 'Members of groups you belong to can message you.',
  },
  {
    value: 'open',
    label: 'Anyone on kink.social',
    description: 'Any member can message you.',
  },
  {
    value: 'nobody',
    label: 'No one',
    description: 'You can still message people first.',
  },
]

const ONBOARDING_DM_RETENTION_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: '180', label: '6 months', description: 'More private.' },
  { value: '365', label: '12 months', description: 'Recommended default.' },
  { value: '730', label: '24 months', description: 'Keeps conversations longer.' },
  { value: '', label: 'Keep until I delete them', description: 'You control cleanup manually.' },
]

function dmRetentionSelectValue(days: number | null | undefined): string {
  if (days === null) return ''
  if (days === undefined) return '365'
  return String(days)
}

function onboardingWhoCanMessageValue(value: PrivacySettings['whoCanMessage']): PrivacySettings['whoCanMessage'] {
  if (ONBOARDING_WHO_CAN_MESSAGE_OPTIONS.some((opt) => opt.value === value)) return value
  return 'connections_only'
}

export default function MemberOnboardingWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeInternalPath(searchParams.get('redirect') ?? undefined) ?? '/home'
  const { isAuthenticated, isFallback, viewerUsername, viewerDisplayName } = useAuth()
  const { loading, error, feed, privacy, setPrivacy, saving, save } = useOnboardingState(
    isAuthenticated && !isFallback
  )
  const toast = useAppToast()

  const [step, setStep] = useState(1)
  const [alphaMode, setAlphaMode] = useState(false)
  const [safetyChecked, setSafetyChecked] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [homeZip, setHomeZip] = useState('')
  const [zipError, setZipError] = useState<string | null>(null)
  const [locationDisplay, setLocationDisplay] = useState('')
  const [zipCandidates, setZipCandidates] = useState<ZipPlaceCandidate[]>([])
  const [zipLocality, setZipLocality] = useState<string | null>(null)
  const [placeId, setPlaceId] = useState<string | null>(null)
  const [stateId, setStateId] = useState<string | null>(null)
  const [birthDate, setBirthDate] = useState('')
  const [pronounTags, setPronounTags] = useState<string[]>([])
  const [genders, setGenders] = useState<string[]>([])
  const [localError, setLocalError] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoMessage, setPhotoMessage] = useState<string | null>(null)

  useEffect(() => {
    void fetchAlphaMode().then((m) => setAlphaMode(isAlphaInviteMode(m)))
  }, [])

  useEffect(() => {
    if (feed.onboardingStep) setStep(feed.onboardingStep)
    if (feed.onboardingSafetyAckAt) setSafetyChecked(true)
  }, [feed.onboardingStep, feed.onboardingSafetyAckAt])

  useEffect(() => {
    if (!viewerUsername) return
    let cancelled = false
    void (async () => {
      try {
        const r = await fetch('/api/profile/me', { credentials: 'include' })
        if (!r.ok || cancelled) return
        const data = (await r.json()) as {
          profile?: {
            displayName?: string | null
            bio?: string | null
            homeZip?: string | null
            location?: string | null
            birthDate?: string | null
            pronounTags?: string[]
            pronouns?: string | null
            genders?: string[]
          }
        }
        const p = data.profile
        if (!p || cancelled) return
        setDisplayName(p.displayName ?? viewerDisplayName ?? '')
        setBio(p.bio ?? '')
        if (p.homeZip) setHomeZip(p.homeZip)
        if (p.location) setLocationDisplay(p.location)
        setBirthDate(formatProfileBirthDateForInput(p.birthDate))
        setPronounTags(parsePronounTags(p.pronounTags ?? p.pronouns))
        if (p.genders?.length) setGenders(p.genders)
      } catch {
        /* optional preload */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [viewerUsername, viewerDisplayName])

  const birthDateBounds = useMemo(() => profileBirthDateInputBounds(), [])

  const intents = useMemo(() => new Set(feed.onboardingIntents ?? []), [feed.onboardingIntents])
  const orderedFirstSteps = useMemo(() => orderOnboardingFirstSteps(intents), [intents])

  const whoCanMessageValue = useMemo(
    () => onboardingWhoCanMessageValue(privacy.whoCanMessage),
    [privacy.whoCanMessage],
  )

  const whoCanMessageDescription = useMemo(
    () =>
      ONBOARDING_WHO_CAN_MESSAGE_OPTIONS.find((opt) => opt.value === whoCanMessageValue)?.description ??
      ONBOARDING_WHO_CAN_MESSAGE_OPTIONS[0].description,
    [whoCanMessageValue],
  )

  const dmRetentionDescription = useMemo(() => {
    const value = dmRetentionSelectValue(privacy.dmRetentionDays)
    return (
      ONBOARDING_DM_RETENTION_OPTIONS.find((opt) => opt.value === value)?.description ??
      ONBOARDING_DM_RETENTION_OPTIONS[1].description
    )
  }, [privacy.dmRetentionDays])

  if (!isAuthenticated || isFallback) {
    return <Navigate to={buildLoginHref('/onboarding')} replace />
  }

  if (loading) {
    return (
      <PageShell title="Getting started">
        <SettingsPageSkeleton />
      </PageShell>
    )
  }

  if (feed.onboardingCompletedAt) {
    return <Navigate to={redirect} replace />
  }

  async function goTo(nextStep: number, patch: Parameters<typeof save>[0] = {}) {
    setLocalError(null)
    const ok = await save({ feed: { ...patch.feed, onboardingStep: nextStep }, privacy: patch.privacy })
    if (ok) setStep(nextStep)
  }

  async function finishOnboarding(destination?: string) {
    const now = new Date().toISOString()
    const ok = await save({
      feed: {
        onboardingCompletedAt: now,
        onboardingStep: ONBOARDING_STEP_COUNT,
        startHereDismissedAt: null,
      },
    })
    if (ok) {
      toast.push('Welcome to kink.social.')
      navigate(destination ?? redirect, { replace: true })
    }
  }

  async function finishAndGo(href: string) {
    await finishOnboarding(href)
  }

  function selectZipCandidate(candidatePlaceId: string) {
    const hit = zipCandidates.find((c) => c.placeId === candidatePlaceId)
    if (!hit) return
    setPlaceId(candidatePlaceId)
    setLocationDisplay(hit.display)
  }

  async function lookupZip() {
    const zip = homeZip.replace(/\D/g, '').slice(0, 5)
    if (zip.length < 5) {
      setZipError('Enter a 5-digit ZIP.')
      return
    }
    setZipError(null)
    setZipCandidates([])
    setZipLocality(null)
    setPlaceId(null)
    setLocationDisplay('')
    try {
      const r = await fetch(`/api/locations/by-zip?zip=${encodeURIComponent(zip)}`, { credentials: 'include' })
      const data = (await r.json().catch(() => ({}))) as {
        error?: string
        stateId?: string
        zipLocality?: string
        candidates?: ZipPlaceCandidate[]
      }
      if (!r.ok) {
        setZipError(data.error ?? 'ZIP not found.')
        return
      }
      setZipCandidates(data.candidates ?? [])
      setZipLocality(data.zipLocality ?? null)
      setStateId(data.stateId ?? null)
      setHomeZip(zip)
    } catch {
      setZipError('Could not look up ZIP. Try again.')
    }
  }

  async function saveProfileBasics() {
    setLocalError(null)
    if (birthDate.trim()) {
      const age = ageFromBirthDate(birthDate)
      if (age == null || age < 18) {
        setLocalError('Birth date must indicate you are at least 18.')
        return false
      }
    }
    try {
      const body: Record<string, unknown> = {
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
      }
      const zip = homeZip.replace(/\D/g, '').slice(0, 5)
      if (zip.length >= 5) body.homeZip = zip
      if (birthDate.trim()) body.birthDate = birthDate.trim()
      if (pronounTags.length > 0) body.pronounTags = pronounTags
      if (genders.length > 0) body.genders = genders
      if (placeId) body.placeId = placeId
      if (stateId) body.stateId = stateId

      const r = await fetch('/api/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!r.ok) {
        const data = (await r.json()) as { error?: string }
        setLocalError(typeof data.error === 'string' ? data.error : 'Could not save profile.')
        return false
      }
      return true
    } catch {
      setLocalError('Network error while saving profile.')
      return false
    }
  }

  async function handleProfilePhoto(file: File | null) {
    if (!file) return
    setPhotoUploading(true)
    setPhotoMessage(null)
    try {
      const uploaded = await uploadProfilePhotoFile(file)
      if (!uploaded.url && !uploaded.quarantineKey) {
        if (uploaded.code === 'alpha_upload_disabled') {
          setPhotoMessage(ALPHA_UPLOAD_DISABLED_COPY)
        } else {
          setPhotoMessage(uploaded.error ?? 'Upload failed.')
        }
        return
      }
      const attached = await attachUploadedProfilePhoto(uploaded)
      if (!attached.ok) {
        if (attached.code === 'alpha_upload_disabled') {
          setPhotoMessage(ALPHA_UPLOAD_DISABLED_COPY)
        } else {
          setPhotoMessage(attached.error)
        }
        return
      }
      setPhotoMessage(
        attached.outcome === 'pending_review' ?
          (attached.message ?? 'Profile photo saved — under review.')
        : (attached.message ?? 'Profile photo saved.'),
      )
    } catch {
      setPhotoMessage('Upload failed. Try again.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function continueFromProfileStep() {
    const ok = await saveProfileBasics()
    if (ok) await goTo(5)
  }

  async function skipProfileStep() {
    if (birthDate.trim()) {
      const age = ageFromBirthDate(birthDate)
      if (age == null || age < 18) {
        setLocalError('Birth date must indicate you are at least 18.')
        return
      }
    }
    setLocalError(null)
    await saveProfileBasics()
    await goTo(5)
  }

  return (
    <PageShell maxWidth="lg" title="Welcome to kink.social" description="A short setup to help you get started." className={step === 7 ? 'pb-28 md:pb-6' : ''}>
      <div className="mb-8">
        <OnboardingProgress step={step} total={ONBOARDING_STEP_COUNT} label={STEP_LABELS[step - 1]} />
      </div>

      {error || localError ?
        <FormStatusMessage tone="error">{error ?? localError}</FormStatusMessage>
      : null}

      <FadeIn>
        {step === 1 ?
          <OnboardingStepCard title="Build community. Organize events. Make friends.">
            <p className="text-sm text-dc-text-muted">
              kink.social is a consent-forward community platform for events, groups, and real connections.
            </p>
            {alphaMode ?
              <AlphaNotice className="mt-4" />
            : null}
            <div className="mt-6 flex justify-end">
              <LoadingButton loading={saving} onClick={() => void goTo(2)}>
                Continue
              </LoadingButton>
            </div>
          </OnboardingStepCard>
        : null}

        {step === 2 ?
          <OnboardingStepCard title="Choose your colors">
            <p className="max-w-prose text-sm leading-relaxed text-dc-text-muted">
              Pick a look that feels right. The site updates live as you tap a theme. You can change this anytime in
              Settings.
            </p>
            <div className="mt-5">
              <OnboardingThemePicker />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <LoadingButton loading={saving} onClick={() => void goTo(3)}>
                Continue
              </LoadingButton>
            </div>
          </OnboardingStepCard>
        : null}

        {step === 3 ?
          <OnboardingStepCard title="Consent, privacy, and community safety">
            <div className="space-y-6">
              <div className="max-w-prose space-y-2">
                <p className="text-sm leading-relaxed text-dc-text-muted">
                  Before you continue, please review the basics that keep kink.social safer for everyone.
                </p>
                <p className="text-sm leading-relaxed text-dc-text-muted">
                  These rules are here to protect consent, privacy, and community trust.
                </p>
              </div>

              <section className="space-y-3" aria-labelledby="community-expectations-heading">
                <h3 id="community-expectations-heading" className="text-sm font-semibold text-dc-text">
                  Community expectations
                </h3>
                <p className="max-w-prose text-sm font-medium text-dc-text">kink.social is for adults only.</p>
                <ul className="max-w-prose list-disc space-y-2 pl-5 text-sm leading-relaxed text-dc-text-muted">
                  <li>You are 18 or older.</li>
                  <li>Consent comes first, always.</li>
                  <li>Harassment, threats, abuse, coercion, and outing are not allowed.</li>
                  <li>You will respect people&apos;s privacy, boundaries, identities, and relationships.</li>
                  <li>
                    You will report safety concerns, suspicious behavior, or rule violations when you see them.
                  </li>
                </ul>
              </section>

              <section className="space-y-3" aria-labelledby="privacy-notice-heading">
                <h3 id="privacy-notice-heading" className="text-sm font-semibold text-dc-text">
                  Privacy notice
                </h3>
                <EncryptionNoticeCard />
              </section>

              <div className="space-y-4 border-t border-dc-border pt-6">
                <label htmlFor="safety-ack-checkbox" className="flex items-start gap-3 text-sm text-dc-text">
                  <input
                    id="safety-ack-checkbox"
                    type="checkbox"
                    checked={safetyChecked}
                    onChange={(e) => setSafetyChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-dc-border"
                  />
                  <span>I am 18 or older and agree to follow these community expectations.</span>
                </label>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link to="/guidelines" className="text-dc-accent hover:underline">
                    Community guidelines
                  </Link>
                  <Link to="/privacy" className="text-dc-accent hover:underline">
                    Privacy policy
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <LoadingButton
                    loading={saving}
                    disabled={!safetyChecked}
                    onClick={() =>
                      void goTo(4, { feed: { onboardingSafetyAckAt: new Date().toISOString() } })
                    }
                  >
                    Agree and continue
                  </LoadingButton>
                </div>
              </div>
            </div>
          </OnboardingStepCard>
        : null}

        {step === 4 ?
          <OnboardingStepCard title="Profile basics">
            <p className="text-sm leading-relaxed text-dc-text-muted">
              Share what you are comfortable with now. Sensitive fields stay private until you choose otherwise on the
              next step.
            </p>
            <div className="mt-5 space-y-5">
              <label className="block text-sm">
                <span className="font-medium text-dc-text">Display name</span>
                <p className="mt-1 text-xs text-dc-text-muted">How you appear on your profile and in the community.</p>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text"
                />
              </label>

              <div>
                <p className="text-sm font-medium text-dc-text">Location (optional)</p>
                <p className="mt-1 text-xs text-dc-text-muted">
                  Your ZIP helps with nearby events and groups. You control who sees it.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="ZIP code"
                    value={homeZip}
                    onChange={(e) => {
                      setHomeZip(e.target.value)
                      setZipCandidates([])
                      setZipLocality(null)
                      setPlaceId(null)
                      setLocationDisplay('')
                      setZipError(null)
                    }}
                    onBlur={() => {
                      if (homeZip.replace(/\D/g, '').length >= 5) void lookupZip()
                    }}
                    className="w-32 rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text"
                  />
                  <Button type="button" variant="secondary" onClick={() => void lookupZip()}>
                    Look up
                  </Button>
                </div>
                {zipError ?
                  <FormStatusMessage tone="error">{zipError}</FormStatusMessage>
                : null}
                {zipCandidates.length > 0 ?
                  <ZipLocationCandidatePicker
                    candidates={zipCandidates}
                    selectedPlaceId={placeId}
                    onSelect={selectZipCandidate}
                    zipLocality={zipLocality}
                  />
                : locationDisplay ?
                  <p className="mt-2 text-sm text-dc-text-muted rounded-lg border border-dc-border px-3 py-2">
                    {locationDisplay}
                  </p>
                : null}
              </div>

              <div>
                <label htmlFor="onboarding-birth-date" className="block text-sm font-medium text-dc-text">
                  Date of birth (optional)
                </label>
                <p className="mt-1 text-xs text-dc-text-muted">
                  Stored privately for eligibility checks. Never shown on your public profile.
                </p>
                <input
                  id="onboarding-birth-date"
                  type="date"
                  value={birthDate}
                  min={birthDateBounds.min}
                  max={birthDateBounds.max}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mt-2 w-full max-w-xs rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text [color-scheme:dark]"
                />
              </div>

              <TagMultiSelect
                label="Gender (optional)"
                values={genders}
                onChange={setGenders}
                suggestions={[...PROFILE_GENDER_VALUES]}
                maxCount={PROFILE_GENDER_MAX}
              />

              <TagMultiSelect
                label="Pronouns (optional)"
                values={pronounTags}
                onChange={setPronounTags}
                suggestions={PRONOUN_PRESETS}
                maxCount={PROFILE_PRONOUN_MAX}
              />

              <label className="block text-sm">
                <span className="font-medium text-dc-text">Short bio (optional)</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="How you show up in the community. Events, roles, what you care about."
                  className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text"
                />
              </label>

              <div>
                <p className="text-sm font-medium text-dc-text">Profile photo (optional)</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-dc-text-muted">
                  {PROFILE_PHOTO_GUIDELINES.map((g, i) => (
                    <li key={i}>
                      {g.bold ? <strong className="text-dc-text">{g.bold}</strong> : null}
                      {g.bold ? ' ' : null}
                      {g.text}
                    </li>
                  ))}
                </ul>
                <input
                  type="file"
                  accept="image/*"
                  disabled={photoUploading}
                  onChange={(e) => void handleProfilePhoto(e.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm text-dc-text-muted"
                />
                {photoMessage ?
                  <FormStatusMessage tone="info">{photoMessage}</FormStatusMessage>
                : null}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Back
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" onClick={() => void skipProfileStep()}>
                  Skip for now
                </Button>
                <LoadingButton loading={saving} onClick={() => void continueFromProfileStep()}>
                  Continue
                </LoadingButton>
              </div>
            </div>
          </OnboardingStepCard>
        : null}

        {step === 5 ?
          <OnboardingStepCard title="Set your privacy defaults">
            <div className="space-y-6">
              <p className="max-w-prose text-sm leading-relaxed text-dc-text-muted">
                Choose how people can contact you and how long your messages are kept. You can change these later in
                settings.
              </p>

              <section className="space-y-5" aria-labelledby="onboarding-messages-heading">
                <h3 id="onboarding-messages-heading" className="text-sm font-semibold text-dc-text">
                  Messages
                </h3>

                <div className="space-y-2">
                  <label htmlFor="onboarding-who-can-message" className="block text-sm font-medium text-dc-text">
                    Who can message you?
                  </label>
                  <p id="onboarding-who-can-message-helper" className="max-w-prose text-sm text-dc-text-muted">
                    Choose who is allowed to start a new DM with you.
                  </p>
                  <select
                    id="onboarding-who-can-message"
                    value={whoCanMessageValue}
                    onChange={(e) =>
                      setPrivacy({ ...privacy, whoCanMessage: e.target.value as PrivacySettings['whoCanMessage'] })
                    }
                    aria-describedby="onboarding-who-can-message-helper onboarding-who-can-message-desc"
                    className="mt-1 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text"
                  >
                    {ONBOARDING_WHO_CAN_MESSAGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p id="onboarding-who-can-message-desc" className="text-sm leading-relaxed text-dc-text-muted">
                    {whoCanMessageDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="onboarding-message-retention" className="block text-sm font-medium text-dc-text">
                    Message retention
                  </label>
                  <p id="onboarding-message-retention-helper" className="max-w-prose text-sm text-dc-text-muted">
                    Choose how long DMs are kept before they are eligible for automatic deletion.
                  </p>
                  <select
                    id="onboarding-message-retention"
                    value={dmRetentionSelectValue(privacy.dmRetentionDays)}
                    onChange={(e) =>
                      setPrivacy({ ...privacy, dmRetentionDays: parseDmRetentionSelectValue(e.target.value) })
                    }
                    aria-describedby="onboarding-message-retention-helper onboarding-message-retention-desc onboarding-message-retention-note"
                    className="mt-1 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text"
                  >
                    {ONBOARDING_DM_RETENTION_OPTIONS.map((opt) => (
                      <option key={opt.value || 'keep'} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p id="onboarding-message-retention-desc" className="text-sm leading-relaxed text-dc-text-muted">
                    {dmRetentionDescription}
                  </p>
                  <p id="onboarding-message-retention-note" className="max-w-prose text-xs leading-relaxed text-dc-text-muted">
                    Reported content, safety cases, legal holds, and moderation records may be preserved when required.
                  </p>
                </div>
              </section>

              <div className="max-w-prose rounded-xl border border-dc-border bg-dc-elevated-muted px-4 py-4">
                <h3 className="text-sm font-semibold text-dc-text">Profile visibility</h3>
                <p className="mt-2 text-sm leading-relaxed text-dc-text-muted">
                  Age, gender, location, and interests stay private by default. After setup you can choose what appears
                  on your profile and in search.
                </p>
              </div>

              <section className="space-y-4 rounded-xl border border-dc-border px-4 py-4" aria-labelledby="onboarding-feed-activity-heading">
                <div>
                  <h3 id="onboarding-feed-activity-heading" className="text-sm font-semibold text-dc-text">
                    How public should your activity be?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-dc-text-muted">
                    Recommended for alpha: show posts according to post privacy, ask before showing group joins, keep
                    group memberships private by default, show reactions only to connections, and hide your connection
                    list unless you change it.
                  </p>
                </div>

                <label className="block text-sm">
                  <span className="font-medium text-dc-text">Reactions and loves in feeds</span>
                  <select
                    value={privacy.feedActivityPrivacy.showReactions}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        feedActivityPrivacy: {
                          ...privacy.feedActivityPrivacy,
                          showReactions: e.target.value as typeof privacy.feedActivityPrivacy.showReactions,
                        },
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text"
                  >
                    <option value="connections_only">Connections only (recommended)</option>
                    <option value="on">On</option>
                    <option value="off">Off</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-dc-text">Group joins in feeds</span>
                  <select
                    value={privacy.feedActivityPrivacy.showGroupJoins}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        feedActivityPrivacy: {
                          ...privacy.feedActivityPrivacy,
                          showGroupJoins: e.target.value as typeof privacy.feedActivityPrivacy.showGroupJoins,
                        },
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text"
                  >
                    <option value="ask">Ask every time (recommended)</option>
                    <option value="on">On</option>
                    <option value="off">Off</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="font-medium text-dc-text">Default group member list visibility</span>
                  <select
                    value={privacy.feedActivityPrivacy.defaultGroupMemberListVisibility}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        feedActivityPrivacy: {
                          ...privacy.feedActivityPrivacy,
                          defaultGroupMemberListVisibility: e.target
                            .value as typeof privacy.feedActivityPrivacy.defaultGroupMemberListVisibility,
                        },
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-dc-text"
                  >
                    <option value="ask">Ask when joining (recommended)</option>
                    <option value="hidden">Keep me hidden by default</option>
                    <option value="visible">Show me in member lists by default</option>
                  </select>
                </label>

                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={privacy.connectionsListVisibility !== 'hidden'}
                    onChange={(e) =>
                      setPrivacy({
                        ...privacy,
                        connectionsListVisibility: e.target.checked ? 'connections_only' : 'hidden',
                      })
                    }
                    className="mt-1"
                  />
                  <span className="text-sm text-dc-text-muted">
                    Show my connection list on my profile (off by default for privacy)
                  </span>
                </label>
              </section>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dc-border pt-6">
                <Button variant="ghost" onClick={() => setStep(4)}>
                  Back
                </Button>
                <LoadingButton loading={saving} onClick={() => void goTo(6, { privacy })}>
                  Save and continue
                </LoadingButton>
              </div>
            </div>
          </OnboardingStepCard>
        : null}

        {step === 6 ?
          <OnboardingStepCard title="What brings you here?">
            <p className="text-sm text-dc-text-muted">Pick one or more. This helps us suggest a starting point.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ONBOARDING_INTENT_OPTIONS.map((opt) => {
                const checked = intents.has(opt.id)
                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm ${
                      checked ? 'border-dc-accent-border bg-dc-accent-muted' : 'border-dc-border'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = new Set(intents)
                        if (checked) next.delete(opt.id)
                        else next.add(opt.id)
                        void save({ feed: { onboardingIntents: [...next] } })
                      }}
                    />
                    {opt.label}
                  </label>
                )
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" onClick={() => setStep(5)}>
                Back
              </Button>
              <LoadingButton loading={saving} onClick={() => void goTo(7)}>
                Continue
              </LoadingButton>
            </div>
          </OnboardingStepCard>
        : null}

        {step === 7 ?
          <>
            <OnboardingStepCard title="">
              <div className="space-y-5 pb-4 md:pb-0">
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/25"
                    aria-hidden
                  >
                    <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-dc-text sm:text-2xl">You&apos;re ready to explore kink.social</h2>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-dc-text-muted">
                    Your account is set up. Jump in now or pick a first step below.
                  </p>
                </div>

                <OnboardingSafetyReminderCard compact />

                <section aria-labelledby="recommended-first-steps-heading">
                  <h3 id="recommended-first-steps-heading" className="text-sm font-semibold text-dc-text">
                    Recommended first steps
                  </h3>
                  {intents.size > 0 ?
                    <p className="mt-1 text-xs text-dc-text-muted">
                      Based on what you picked, we surfaced a few good places to begin.
                    </p>
                  : null}
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Recommended first steps">
                    {orderedFirstSteps.map((action) => (
                      <li key={action.id}>
                        <FeatureCard
                          title={action.title}
                          description={action.description}
                          icon={onboardingStepIcon(action.id)}
                          onClick={() => void finishAndGo(action.href)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="hidden flex-wrap items-center justify-between gap-3 border-t border-dc-border pt-6 md:flex">
                  <Button variant="ghost" onClick={() => setStep(6)}>
                    Back
                  </Button>
                  <LoadingButton loading={saving} onClick={() => void finishOnboarding()} className="min-w-[12rem]">
                    Enter kink.social
                  </LoadingButton>
                </div>
              </div>
            </OnboardingStepCard>
            <MobileActionBar
              primary={{
                label: 'Enter kink.social',
                onClick: () => void finishOnboarding(),
                loading: saving,
              }}
              secondary={{
                label: 'Back',
                onClick: () => setStep(6),
                variant: 'secondary',
              }}
            />
          </>
        : null}
      </FadeIn>
    </PageShell>
  )
}
