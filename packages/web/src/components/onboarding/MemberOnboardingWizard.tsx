import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ageFromBirthDate,
  clampOnboardingStep,
  formatProfileBirthDateForInput,
  ONBOARDING_STEP_COUNT,
  parsePronounTags,
  profileBirthDateInputBounds,
  safeInternalPath,
  type PrivacySettings,
} from '@c2k/shared'
import { useAuth } from '@/contexts/AuthContext'
import { useAppToast } from '@/components/ui/AppToast'
import { useOnboardingState } from '@/hooks/useOnboardingState'
import { buildLoginHref } from '@/lib/auth-links'
import { orderOnboardingFirstSteps } from '@/lib/onboarding-first-steps'
import type { ZipPlaceCandidate } from '@/lib/profile-edit-location'
import {
  FormStatusMessage,
  PageShell,
  WizardFooter,
  WizardShell,
  type WizardStepMeta,
} from '@/components/ui/primitives'
import { SettingsPageSkeleton } from '@/components/ui/skeleton'
import { ALPHA_UPLOAD_DISABLED_COPY } from '@/lib/alpha-mode'
import { attachUploadedProfilePhoto, uploadProfilePhotoFile } from '@/lib/profile-photo-upload'
import WelcomeStep from './steps/WelcomeStep'
import SafetyStep from './steps/SafetyStep'
import ProfileBasicsStep from './steps/ProfileBasicsStep'
import PrivacyStep from './steps/PrivacyStep'
import InterestsStep from './steps/InterestsStep'
import FirstStepsStep from './steps/FirstStepsStep'

const icon = (path: string) => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={path} />
  </svg>
)

const STEPS: WizardStepMeta[] = [
  { id: 'welcome', label: 'Welcome', icon: icon('M5 3v4M3 5h4m6-2l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3z') },
  { id: 'safety', label: 'Safety', icon: icon('M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z') },
  { id: 'profile', label: 'Profile', icon: icon('M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z') },
  { id: 'privacy', label: 'Privacy', icon: icon('M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z') },
  { id: 'interests', label: 'Interests', icon: icon('M15.5 8.5l-2 5-5 2 2-5 5-2z') },
  { id: 'firstSteps', label: 'First steps', icon: icon('M5 13l4 4L19 7') },
]

const STEP_IDS = STEPS.map((s) => s.id)

export default function MemberOnboardingWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeInternalPath(searchParams.get('redirect') ?? undefined) ?? '/home'
  const { isAuthenticated, isFallback, viewerUsername, viewerDisplayName } = useAuth()
  const { loading, error, feed, privacy, setPrivacy, saving, save } = useOnboardingState(isAuthenticated && !isFallback)
  const toast = useAppToast()

  const [step, setStep] = useState(1)
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
    if (feed.onboardingStep) setStep(clampOnboardingStep(feed.onboardingStep))
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
        setPhotoMessage(uploaded.code === 'alpha_upload_disabled' ? ALPHA_UPLOAD_DISABLED_COPY : (uploaded.error ?? 'Upload failed.'))
        return
      }
      const attached = await attachUploadedProfilePhoto(uploaded)
      if (!attached.ok) {
        setPhotoMessage(attached.code === 'alpha_upload_disabled' ? ALPHA_UPLOAD_DISABLED_COPY : attached.error)
        return
      }
      setPhotoMessage(
        attached.outcome === 'pending_review'
          ? (attached.message ?? 'Profile photo saved — under review.')
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
    if (ok) await goTo(4)
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
    await goTo(4)
  }

  function toggleIntent(id: string) {
    const next = new Set(intents)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    void save({ feed: { onboardingIntents: [...next] } })
  }

  const currentStepId = STEP_IDS[step - 1] ?? 'welcome'

  const footer = (() => {
    switch (step) {
      case 1:
        return <WizardFooter next={{ label: 'Continue', loading: saving, onClick: () => void goTo(2) }} />
      case 2:
        return (
          <WizardFooter
            back={{ label: 'Back', onClick: () => setStep(1) }}
            next={{
              label: 'Agree and continue',
              loading: saving,
              disabled: !safetyChecked,
              onClick: () => void goTo(3, { feed: { onboardingSafetyAckAt: new Date().toISOString() } }),
            }}
          />
        )
      case 3:
        return (
          <WizardFooter
            back={{ label: 'Back', onClick: () => setStep(2) }}
            skip={{ label: 'Skip for now', onClick: () => void skipProfileStep() }}
            next={{ label: 'Continue', loading: saving, onClick: () => void continueFromProfileStep() }}
          />
        )
      case 4:
        return (
          <WizardFooter
            back={{ label: 'Back', onClick: () => setStep(3) }}
            next={{ label: 'Save and continue', loading: saving, onClick: () => void goTo(5, { privacy }) }}
          />
        )
      case 5:
        return (
          <WizardFooter
            back={{ label: 'Back', onClick: () => setStep(4) }}
            next={{ label: 'Continue', loading: saving, onClick: () => void goTo(6) }}
          />
        )
      case 6:
        return (
          <WizardFooter
            back={{ label: 'Back', onClick: () => setStep(5) }}
            next={{ label: 'Enter kink.social', loading: saving, onClick: () => void finishOnboarding() }}
          />
        )
      default:
        return null
    }
  })()

  return (
    <WizardShell
      brand="kink.social"
      title="Let’s get you set up"
      description="A short, private setup. Skip anything optional and share more whenever you are ready."
      steps={STEPS}
      currentStepId={currentStepId}
      onStepSelect={(id) => setStep(STEP_IDS.indexOf(id) + 1)}
      footer={footer}
    >
      {error || localError ? (
        <div className="mb-5">
          <FormStatusMessage tone="error">{error ?? localError}</FormStatusMessage>
        </div>
      ) : null}

      {step === 1 ? <WelcomeStep /> : null}
      {step === 2 ? <SafetyStep checked={safetyChecked} onCheckedChange={setSafetyChecked} /> : null}
      {step === 3 ? (
        <ProfileBasicsStep
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          bio={bio}
          onBioChange={setBio}
          homeZip={homeZip}
          onHomeZipChange={(value) => {
            setHomeZip(value)
            setZipCandidates([])
            setZipLocality(null)
            setPlaceId(null)
            setLocationDisplay('')
            setZipError(null)
          }}
          onHomeZipBlur={() => {
            if (homeZip.replace(/\D/g, '').length >= 5) void lookupZip()
          }}
          onLookupZip={() => void lookupZip()}
          zipError={zipError}
          zipCandidates={zipCandidates}
          zipLocality={zipLocality}
          placeId={placeId}
          onSelectZipCandidate={selectZipCandidate}
          locationDisplay={locationDisplay}
          birthDate={birthDate}
          onBirthDateChange={setBirthDate}
          birthDateBounds={birthDateBounds}
          genders={genders}
          onGendersChange={setGenders}
          pronounTags={pronounTags}
          onPronounTagsChange={setPronounTags}
          photoUploading={photoUploading}
          photoMessage={photoMessage}
          onPhotoChange={(file) => void handleProfilePhoto(file)}
        />
      ) : null}
      {step === 4 ? (
        <PrivacyStep privacy={privacy} onChange={(next: PrivacySettings) => setPrivacy(next)} />
      ) : null}
      {step === 5 ? <InterestsStep intents={intents} onToggle={toggleIntent} /> : null}
      {step === 6 ? (
        <FirstStepsStep
          orderedFirstSteps={orderedFirstSteps}
          hasIntents={intents.size > 0}
          onPickAction={(href) => void finishOnboarding(href)}
        />
      ) : null}
    </WizardShell>
  )
}
