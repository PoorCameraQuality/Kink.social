import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import OrgCreateBenefitCards from '@/components/orgs/OrgCreateBenefitCards'
import WizardTemplate from '@/components/templates/WizardTemplate'
import FormField from '@/components/ui/FormField'
import TextInput from '@/components/ui/TextInput'
import { useAuth } from '@/contexts/AuthContext'
import { buildLoginHref } from '@/lib/auth-links'
import { cn } from '@/lib/cn'
import {
  normalizeOrgSlugInput,
  orgSlugPreview,
  validateOrgSlugInput,
} from '@/lib/org-slug-utils'

type Visibility = 'PUBLIC' | 'MEMBERS' | 'PRIVATE'

const VISIBILITY_OPTIONS: {
  value: Visibility
  label: string
  description: string
}[] = [
  {
    value: 'PUBLIC',
    label: 'Public',
    description: 'Anyone can find the public hub.',
  },
  {
    value: 'MEMBERS',
    label: 'Members only',
    description: 'Only members can see community details.',
  },
  {
    value: 'PRIVATE',
    label: 'Private',
    description: 'Hidden from the public directory; share the hub link directly.',
  },
]

function mapCreateOrgError(status: number, error?: string): string {
  if (status === 401) return 'Sign in to create an organization.'
  if (error === 'Invalid slug') {
    return 'That URL slug is too short. Use at least two letters or numbers, or leave it blank to generate one.'
  }
  if (error === 'Invalid body') {
    return 'Check the form. Organization name is required and must be under 255 characters.'
  }
  return error ?? 'Could not create organization. Try again.'
}

const inputClass =
  'w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2.5 text-sm text-dc-text placeholder:text-dc-muted focus:border-dc-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecke-focus-ring)]'

export default function OrgCreatePage() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const { status, isAuthenticated } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [slug, setSlug] = useState('')
  const [bio, setBio] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC')
  const [slugTouched, setSlugTouched] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const slugPreview = useMemo(() => orgSlugPreview(displayName, slug), [displayName, slug])
  const slugFieldError = slugTouched ? validateOrgSlugInput(slug) : null

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-dc-text-muted" aria-busy="true">
        Loading…
      </div>
    )
  }

  if (status === 'ready' && !isAuthenticated) {
    return <Navigate to={buildLoginHref('/orgs/new')} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErr(null)

    const name = displayName.trim()
    if (!name) {
      setErr('Organization name is required.')
      return
    }

    const slugErr = validateOrgSlugInput(slug)
    if (slugErr) {
      setSlugTouched(true)
      setErr(slugErr)
      return
    }

    setLoading(true)
    try {
      const body: Record<string, unknown> = {
        displayName: name,
        bio: bio.trim() || undefined,
        visibility,
      }
      const normalizedSlug = normalizeOrgSlugInput(slug)
      if (normalizedSlug.length >= 2) body.slug = normalizedSlug

      const r = await fetch('/api/v1/organizations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = (await r.json().catch(() => ({}))) as { organization?: { slug: string }; error?: string }
      if (!r.ok) {
        setErr(mapCreateOrgError(r.status, j.error))
        return
      }
      if (j.organization?.slug) {
        navigate(`/organizer/orgs/${encodeURIComponent(j.organization.slug)}`)
        return
      }
      setErr('Unexpected response from the server.')
    } catch {
      setErr('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl overflow-x-hidden px-4 py-8 sm:px-6 lg:py-10">
      <nav className="mb-6 text-sm">
        <Link to="/orgs" className="inline-flex min-h-touch items-center text-dc-accent hover:underline">
          ← Organizations
        </Link>
      </nav>

      <header className="mb-6 lg:hidden">
        <p className="text-xs font-semibold uppercase tracking-wider text-dc-accent">New organization</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-dc-text">Create an organization</h1>
        <p className="mt-2 text-sm text-dc-text-muted">Build a home for events, members, and public listings.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:gap-10 xl:gap-12">
        <div className="hidden min-w-0 space-y-6 lg:block">
          <header className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-dc-accent">New organization</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-dc-text sm:text-3xl">Create an organization</h1>
            <p className="mt-3 text-sm leading-relaxed text-dc-text-muted sm:text-base">
              Build a home for your events, members, communications, and public listings.
            </p>
          </header>
          <OrgCreateBenefitCards />
          <p className="max-w-xl text-xs leading-relaxed text-dc-muted">
            You can add branding, feature toggles, and publishing settings after creation in the Organization Console.
          </p>
        </div>

        <WizardTemplate
          title="Organization details"
          description="You become the owner and can add admins and staff from the organizer dashboard."
          stepLabel="Setup"
          errorSummary={
            err && err !== 'Organization name is required.' ?
              <div
                className="rounded-xl border border-red-500/30 bg-red-950/25 px-3 py-2.5 text-sm text-red-200"
                role="alert"
              >
                {err}
              </div>
            : undefined
          }
          primaryAction={{
            label: loading ? 'Creating organization…' : 'Create organization',
            onClick: () => formRef.current?.requestSubmit(),
            loading,
            disabled: loading,
          }}
          secondaryAction={{
            label: 'Cancel',
            href: '/orgs',
            variant: 'secondary',
          }}
          className="max-w-none px-0 py-0 lg:sticky lg:top-6"
        >
          <form ref={formRef} onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-dc-border-strong/60 bg-dc-elevated-solid p-5 shadow-[var(--dc-shadow-soft)] sm:p-6" noValidate>
            <FormField
              id="org-name"
              label="Organization name"
              hint="Use the name people already know you by."
              error={!displayName.trim() && err === 'Organization name is required.' ? err : undefined}
            >
              <TextInput
                id="org-name"
                name="displayName"
                required
                autoComplete="organization"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                aria-invalid={!displayName.trim() && err === 'Organization name is required.'}
              />
            </FormField>

            <FormField
              id="org-slug"
              label="Page address"
              hint="Leave blank to generate one automatically. If the URL is already in use, a number may be added for you."
              error={slugFieldError ?? undefined}
            >
              <TextInput
                id="org-slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={() => setSlugTouched(true)}
                disabled={loading}
                aria-invalid={Boolean(slugFieldError)}
                spellCheck={false}
                autoComplete="off"
              />
              <p className="mt-2 rounded-lg border border-dc-border bg-dc-surface/50 px-3 py-2 font-mono text-xs text-dc-text-muted">
                <span className="text-dc-muted">Your URL: </span>
                /orgs/{slugPreview}
              </p>
            </FormField>

            <FormField
              id="org-bio"
              label="Short description"
              hint="Describe who this organization is for and what you host."
            >
              <textarea
                id="org-bio"
                name="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
            </FormField>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-dc-text">Visibility</legend>
              <p className="text-dc-micro text-dc-text-muted">You can change this later in the organizer dashboard.</p>
              <div className="mt-2 space-y-2" role="radiogroup" aria-label="Organization visibility">
                {VISIBILITY_OPTIONS.map((opt) => {
                  const selected = visibility === opt.value
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        'flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition-colors',
                        selected ?
                          'border-dc-accent/50 bg-dc-accent/10 ring-1 ring-dc-accent/30'
                        : 'border-dc-border bg-dc-surface/40 hover:border-dc-border-strong',
                        loading && 'pointer-events-none opacity-60',
                      )}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={opt.value}
                        checked={selected}
                        onChange={() => setVisibility(opt.value)}
                        disabled={loading}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--dc-accent)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-dc-text">{opt.label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-dc-text-muted">{opt.description}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <p className="text-xs leading-relaxed text-dc-text-muted">
              After creation, you&apos;ll land in the <span className="text-dc-text">organizer dashboard</span> to finish
              setup.
            </p>
          </form>
        </WizardTemplate>
      </div>
    </div>
  )
}
