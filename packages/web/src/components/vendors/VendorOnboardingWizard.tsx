import { VENDOR_CATEGORY_DESCRIPTIONS, normalizeVendorTags, type VendorCategory } from '@c2k/shared'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import VendorExternalStorePanel from '@/components/VendorExternalStorePanel'
import VendorIntegrationGuide from '@/components/vendors/VendorIntegrationGuide'
import VendorShopAppearancePanel from '@/components/vendors/VendorShopAppearancePanel'
import { useAuth } from '@/contexts/AuthContext'
import { buildLoginHref } from '@/lib/auth-links'
import { useApiVendorMe } from '@/hooks/useApiVendorMe'
import type { ApiVendorRow } from '@/lib/api-vendor-mapper'
import {
  initialOnboardingStep,
  stepIndex,
  VENDOR_BASICS_CONTINUE_LABEL,
  VENDOR_BASICS_HEADING,
  VENDOR_BASICS_INTRO,
  VENDOR_CATEGORY_VALUES,
  VENDOR_CONNECTOR_PREVIEW,
  VENDOR_INVENTORY_HEADING,
  VENDOR_INVENTORY_INTRO,
  VENDOR_ONBOARDING_STEP_LABELS,
  VENDOR_ONBOARDING_STEPS,
  type VendorOnboardingStep,
  vendorHasStoreConnector,
  vendorIsPublished,
} from '@/lib/vendor-onboarding'

function StepProgress({ step }: { step: VendorOnboardingStep }) {
  const idx = stepIndex(step)
  const label = VENDOR_ONBOARDING_STEP_LABELS[step]
  return (
    <div className="mb-8 space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-dc-text-muted">
        Step {idx + 1} of {VENDOR_ONBOARDING_STEPS.length} · {label}
      </p>
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuenow={idx + 1}
        aria-valuemin={1}
        aria-valuemax={VENDOR_ONBOARDING_STEPS.length}
        aria-label={`Vendor onboarding step ${idx + 1} of ${VENDOR_ONBOARDING_STEPS.length}: ${label}`}
      >
        {VENDOR_ONBOARDING_STEPS.map((s, i) => (
          <div
            key={s}
            title={VENDOR_ONBOARDING_STEP_LABELS[s]}
            className={`flex-1 h-1 rounded-full ${i <= idx ? 'bg-dc-accent' : 'bg-dc-elevated-solid'}`}
          />
        ))}
      </div>
    </div>
  )
}

type NavProps = {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  secondaryAction?: React.ReactNode
}

function StepNav({ onBack, onNext, nextLabel = 'Continue', nextDisabled, secondaryAction }: NavProps) {
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
          disabled={nextDisabled}
          onClick={onNext}
          className="w-full sm:flex-1 min-h-11 py-3 bg-dc-accent hover:bg-dc-accent-hover text-dc-accent-foreground font-medium rounded-xl disabled:opacity-50"
        >
          {nextLabel}
        </button>
      : null}
    </div>
  )
}

export default function VendorOnboardingWizard() {
  const { isAuthenticated } = useAuth()
  const { status, vendor, reload } = useApiVendorMe(isAuthenticated)
  const [step, setStep] = useState<VendorOnboardingStep>('welcome')
  const [resumeApplied, setResumeApplied] = useState(false)
  const [inventorySkipped, setInventorySkipped] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [slug, setSlug] = useState('')
  const [bio, setBio] = useState('')
  const [makerStory, setMakerStory] = useState('')
  const [website, setWebsite] = useState('')
  const [shipsTo, setShipsTo] = useState<'US' | 'Canada' | 'International'>('US')
  const [category, setCategory] = useState<VendorCategory | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [basicsErr, setBasicsErr] = useState<string | null>(null)
  const [basicsBusy, setBasicsBusy] = useState(false)

  const [publishBusy, setPublishBusy] = useState(false)
  const [publishErr, setPublishErr] = useState<string | null>(null)
  const [publishMsg, setPublishMsg] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'ready' || resumeApplied || !vendor) return
    setDisplayName(vendor.displayName ?? '')
    setSlug(vendor.slug ?? '')
    setBio(vendor.bio ?? '')
    setMakerStory(vendor.makerStory ?? '')
    setWebsite(vendor.website ?? '')
    setShipsTo((vendor.shipsTo as typeof shipsTo) ?? 'US')
    setCategory((vendor.category as VendorCategory | null) ?? null)
    setTags(vendor.tags ?? [])
    setTagInput('')
    setStep(initialOnboardingStep(vendor))
    setResumeApplied(true)
  }, [status, vendor, resumeApplied])

  const activeVendor = vendor
  const connectorReady = vendorHasStoreConnector(activeVendor) || inventorySkipped

  const externalStoreType = activeVendor?.externalStoreType ?? (activeVendor?.usesEtsy ? 'etsy' : 'none')
  const etsyShopUrl = activeVendor?.etsyShopUrl ?? ''
  const wooPub = activeVendor?.externalStorePublic as { wooSiteUrl?: string } | undefined
  const syncedAt =
    activeVendor?.externalListingsSyncedAt ?? activeVendor?.etsyListingsSyncedAt ?? null
  const syncError = activeVendor?.externalSyncError ?? activeVendor?.etsySyncError ?? null

  const addTagsFromInput = () => {
    const parts = tagInput.split(/[,]+/).map((s) => s.trim()).filter(Boolean)
    if (parts.length === 0) return
    setTags((prev) => normalizeVendorTags([...prev, ...parts]))
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const createShop = useCallback(async () => {
    setBasicsErr(null)
    setBasicsBusy(true)
    try {
      const body: Record<string, unknown> = {
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        makerStory: makerStory.trim() || undefined,
        shipsTo,
        category: category ?? undefined,
        tags: tags.length ? tags : undefined,
      }
      const s = slug.trim()
      if (s) body.slug = s
      const w = website.trim()
      if (w) body.website = w
      const r = await fetch('/api/v1/vendors', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = (await r.json().catch(() => ({}))) as {
        vendor?: ApiVendorRow
        error?: string
      }
      if (r.status === 409 && j.vendor?.slug) {
        reload()
        setStep('inventory')
        return
      }
      if (!r.ok) {
        setBasicsErr(j.error ?? 'Could not create vendor shop')
        return
      }
      reload()
      setStep('inventory')
    } catch {
      setBasicsErr('Network error')
    } finally {
      setBasicsBusy(false)
    }
  }, [bio, category, displayName, makerStory, reload, shipsTo, slug, tags, website])

  async function onBasicsSubmit(e: FormEvent) {
    e.preventDefault()
    if (activeVendor) {
      setBasicsBusy(true)
      setBasicsErr(null)
      try {
        const r = await fetch('/api/v1/me/vendor-profile', {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: displayName.trim(),
            bio: bio.trim() || null,
            makerStory: makerStory.trim() || null,
            website: website.trim() || null,
            shipsTo,
            category,
            tags,
          }),
        })
        const j = (await r.json().catch(() => ({}))) as { error?: string }
        if (!r.ok) {
          setBasicsErr(j.error ?? 'Could not save shop details')
          return
        }
        reload()
        setStep('inventory')
      } catch {
        setBasicsErr('Network error')
      } finally {
        setBasicsBusy(false)
      }
      return
    }
    await createShop()
  }

  async function publishShop() {
    if (!activeVendor) return
    setPublishBusy(true)
    setPublishErr(null)
    setPublishMsg(null)
    try {
      const r = await fetch('/api/v1/me/vendor-profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: activeVendor.displayName,
          visibility: 'PUBLIC',
        }),
      })
      const j = (await r.json().catch(() => ({}))) as { error?: string }
      if (!r.ok) {
        setPublishErr(j.error ?? 'Could not publish shop')
        return
      }
      setPublishMsg('Your shop is live in the vendor directory.')
      reload()
    } catch {
      setPublishErr('Network error')
    } finally {
      setPublishBusy(false)
    }
  }

  const published = vendorIsPublished(activeVendor)
  const finishHref = activeVendor?.slug ? `/vendors/${encodeURIComponent(activeVendor.slug)}` : '/vendors'

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="text-xl font-bold text-dc-text mb-2">Sign in to set up your shop</h1>
        <p className="text-sm text-dc-text-muted mb-6">Vendor shops are tied to your Kink Social profile. One shop per account.</p>
        <Link
          to={buildLoginHref('/vendors/onboarding')}
          className="inline-flex min-h-11 items-center rounded-xl bg-dc-accent px-5 text-sm font-medium text-dc-text hover:bg-dc-accent-hover"
        >
          Sign in
        </Link>
      </div>
    )
  }

  if (status === 'loading' || status === 'idle') {
    return <div className="mx-auto max-w-lg px-4 py-12 h-48 animate-pulse rounded-2xl bg-dc-elevated-muted" />
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/vendors" className="text-sm text-dc-accent hover:underline mb-4 inline-block">
        ← Vendors & Shops
      </Link>
      <StepProgress step={step} />

      {step === 'welcome' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-dc-text">Set up your vendor shop</h1>
          <p className="text-sm text-dc-text-muted">
            Showcase your catalog on Kink Social. Import from Etsy, Shopify, WooCommerce, or link your existing
            storefront. Checkout always happens on your store; we never take payments here.
          </p>
          <ul className="text-sm text-dc-text-muted space-y-2 list-disc pl-5">
            <li>One shop per account, linked to your profile</li>
            <li>Sync listings for home and discovery rails</li>
            <li>Get listed on events and conventions when organizers add you</li>
          </ul>
          <StepNav
            onNext={() => setStep(activeVendor ? initialOnboardingStep(activeVendor) : 'basics')}
            nextLabel={activeVendor ? 'Continue setup' : 'Get started'}
          />
        </div>
      )}

      {step === 'basics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-dc-text">{VENDOR_BASICS_HEADING}</h2>
            <p className="mt-2 text-sm leading-relaxed text-dc-text-muted">{VENDOR_BASICS_INTRO}</p>
          </div>

          <div
            className="rounded-xl border border-dc-border bg-dc-elevated-muted/60 p-4"
            role="note"
            aria-label="Next step preview"
          >
            <h3 className="text-sm font-semibold text-dc-text">Next step: connect your inventory</h3>
            <p className="mt-2 text-sm leading-relaxed text-dc-text-muted">
              After your vendor page is created, you can sync active listings from Etsy, Shopify, or WooCommerce. Buyers
              can browse your listings on kink.social, then purchase through your external shop.
            </p>
            <p className="mt-3 text-xs text-dc-text-muted">Checkout stays off kink.social.</p>
            <ul
              className="mt-4 flex flex-wrap gap-2"
              aria-label="Inventory connectors available on the next step"
            >
              {VENDOR_CONNECTOR_PREVIEW.map((name) => (
                <li
                  key={name}
                  className="rounded-full border border-dc-border bg-dc-surface/50 px-3 py-1 text-xs text-dc-text-muted"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={onBasicsSubmit} className="space-y-4">
            <div>
              <label htmlFor="von-name" className="block text-sm text-dc-text-muted mb-1">
                Shop / display name
              </label>
              <p className="text-xs text-dc-muted mb-2">The public name buyers will see.</p>
              <input
                id="von-name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-dc-elevated/95 border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
              />
            </div>
            {!activeVendor ?
              <div>
                <label htmlFor="von-slug" className="block text-sm text-dc-text-muted mb-1">
                  Slug (optional)
                </label>
                <p className="text-xs text-dc-muted mb-2">
                  Used in your kink.social shop URL. Leave blank to generate one from your shop name.
                </p>
                <input
                  id="von-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-leather-studio"
                  className="w-full bg-dc-elevated/95 border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
                />
              </div>
            : null}
            <div>
              <label htmlFor="von-bio" className="block text-sm text-dc-text-muted mb-1">
                Bio
              </label>
              <p className="text-xs text-dc-muted mb-2">A short summary of what you make, sell, or offer.</p>
              <textarea
                id="von-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-dc-elevated/95 border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
              />
            </div>
            <div>
              <label htmlFor="von-maker" className="block text-sm text-dc-text-muted mb-1">
                Maker story
              </label>
              <p className="text-xs text-dc-muted mb-2">
                One or two sentences about who you make for, what you specialize in, and what makes your work different.
              </p>
              <textarea
                id="von-maker"
                value={makerStory}
                onChange={(e) => setMakerStory(e.target.value)}
                rows={2}
                placeholder="One sentence: who you make for (rope, leather, art prints...)"
                className="w-full bg-dc-elevated/95 border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
              />
            </div>
            <div>
              <label htmlFor="von-web" className="block text-sm text-dc-text-muted mb-1">
                Main shop or website (optional)
              </label>
              <p className="text-xs text-dc-muted mb-2">
                Add your main storefront, portfolio, or business website. You can connect inventory on the next step.
              </p>
              <input
                id="von-web"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                className="w-full bg-dc-elevated/95 border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
              />
            </div>
            <div>
              <p className="block text-sm text-dc-text-muted mb-1">Shop category</p>
              <p className="text-xs text-dc-muted mb-2">Choose the category that best describes your shop.</p>
              <div className="flex flex-wrap gap-2">
                {VENDOR_CATEGORY_VALUES.map((cat) => {
                  const pressed = category === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      title={VENDOR_CATEGORY_DESCRIPTIONS[cat]}
                      onClick={() => setCategory(pressed ? null : cat)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        pressed ?
                          'border-dc-accent bg-dc-accent/15 text-dc-accent'
                        : 'border-dc-border text-dc-text-muted hover:text-dc-text'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label htmlFor="von-tags" className="block text-sm text-dc-text-muted mb-1">
                Specialty tags (optional)
              </label>
              <p className="text-xs text-dc-muted mb-2">
                Add searchable tags like rope, leather, commissions, pup gear, impact toys, aftercare, custom sizing.
              </p>
              <div className="flex gap-2">
                <input
                  id="von-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTagsFromInput()
                    }
                  }}
                  placeholder="rope, commissions, pup-play"
                  className="flex-1 bg-dc-elevated/95 border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
                />
                <button
                  type="button"
                  onClick={addTagsFromInput}
                  className="min-h-11 px-3 rounded-xl border border-dc-border text-sm text-dc-text-muted hover:text-dc-text"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 ?
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="rounded-full border border-dc-border px-2 py-1 text-xs text-dc-text-muted hover:text-dc-text"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              : null}
            </div>
            <div>
              <label htmlFor="von-ships" className="block text-sm text-dc-text-muted mb-1">
                Ships to
              </label>
              <p className="text-xs text-dc-muted mb-2">Choose where you ship or provide services.</p>
              <select
                id="von-ships"
                value={shipsTo}
                onChange={(e) => setShipsTo(e.target.value as typeof shipsTo)}
                className="w-full bg-dc-elevated/95 border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
              >
                <option value="US">US</option>
                <option value="Canada">Canada</option>
                <option value="International">International</option>
              </select>
            </div>
            {basicsErr ?
              <p className="text-sm text-red-200" role="alert">
                {basicsErr}
              </p>
            : null}
            <StepNav
              onBack={() => setStep('welcome')}
              secondaryAction={
                <button
                  type="submit"
                  disabled={basicsBusy}
                  className="w-full sm:flex-1 min-h-11 py-3 bg-dc-accent hover:bg-dc-accent-hover text-dc-accent-foreground font-medium rounded-xl disabled:opacity-50"
                >
                  {basicsBusy ? 'Saving…' : VENDOR_BASICS_CONTINUE_LABEL}
                </button>
              }
            />
          </form>
        </div>
      )}

      {step === 'inventory' && activeVendor && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-dc-text">{VENDOR_INVENTORY_HEADING}</h2>
            <p className="mt-2 text-sm leading-relaxed text-dc-text-muted">{VENDOR_INVENTORY_INTRO}</p>
          </div>

          <div className="rounded-xl border border-dc-accent-border/40 bg-dc-accent-muted/20 px-4 py-4" role="note">
            <p className="text-sm font-semibold text-dc-text">No checkout on kink.social</p>
            <p className="mt-2 text-sm leading-relaxed text-dc-text-muted">
              kink.social does not process payment, manage shipping, handle taxes, or issue refunds. Your external shop
              remains the source of truth for purchases and fulfillment.
            </p>
          </div>

          {!vendorHasStoreConnector(activeVendor) && !inventorySkipped ?
            <p className="text-sm text-dc-text-muted">
              Connect Etsy, Shopify, WooCommerce, or add a store link to continue. You can also skip for now and publish
              a vendor page without synced products.
            </p>
          : null}

          <VendorExternalStorePanel
            externalStoreType={externalStoreType}
            etsyShopUrl={etsyShopUrl}
            wooSiteUrl={wooPub?.wooSiteUrl}
            syncedAt={syncedAt}
            syncError={syncError}
            onUpdated={() => reload()}
            variant="onboarding"
          />
          <StepNav
            onBack={() => setStep('basics')}
            onNext={() => setStep('appearance')}
            nextLabel="Continue"
            nextDisabled={!connectorReady}
            secondaryAction={
              !vendorHasStoreConnector(activeVendor) ?
                <button
                  type="button"
                  onClick={() => {
                    setInventorySkipped(true)
                    setStep('appearance')
                  }}
                  className="w-full sm:flex-1 min-h-11 py-3 rounded-xl border border-dc-border text-dc-text-muted hover:text-dc-text text-sm"
                >
                  <span className="block font-medium">Skip for now</span>
                  <span className="block text-xs mt-0.5 opacity-90">You can connect inventory later from vendor settings.</span>
                </button>
              : null
            }
          />
        </div>
      )}

      {step === 'inventory' && !activeVendor && (
        <div className="space-y-4">
          <p className="text-sm text-dc-text-muted">Create shop basics first.</p>
          <StepNav onNext={() => setStep('basics')} nextLabel="Shop basics" />
        </div>
      )}

      {step === 'appearance' && activeVendor && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-dc-text">Shop appearance</h2>
          <p className="text-sm text-dc-text-muted">Optional banner and logo for your public shop page.</p>
          <VendorShopAppearancePanel
            vendorSlug={activeVendor.slug}
            initialBannerUrl={activeVendor.bannerUrl ?? null}
            initialLogoUrl={activeVendor.logoUrl ?? null}
            initialLayout={activeVendor.shopHeaderLayout === 'BELOW' ? 'BELOW' : 'OVERLAY'}
            onSaved={() => reload()}
          />
          <StepNav
            onBack={() => setStep('inventory')}
            onNext={() => setStep('publish')}
            secondaryAction={
              <button
                type="button"
                onClick={() => setStep('publish')}
                className="w-full sm:flex-1 min-h-11 py-3 rounded-xl border border-dc-border text-dc-text-muted hover:text-dc-text text-sm"
              >
                Skip
              </button>
            }
          />
        </div>
      )}

      {step === 'publish' && activeVendor && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-dc-text">{published ? "You're all set" : 'Publish your shop'}</h2>
          {!published ?
            <>
              <p className="text-sm text-dc-text-muted">
                Publishing adds your shop to the vendor directory and discovery surfaces. You can stay unlisted until your
                listings are synced.
              </p>
              {publishErr ?
                <p className="text-sm text-red-200" role="alert">
                  {publishErr}
                </p>
              : null}
              {publishMsg ?
                <p className="text-sm text-emerald-300" role="status">
                  {publishMsg}
                </p>
              : null}
              <button
                type="button"
                disabled={publishBusy}
                onClick={() => void publishShop()}
                className="min-h-11 w-full rounded-xl bg-dc-accent hover:bg-dc-accent-hover text-dc-text text-sm font-medium disabled:opacity-50"
              >
                {publishBusy ? 'Publishing…' : 'Publish to directory'}
              </button>
            </>
          : <p className="text-sm text-emerald-300">Your shop is public in the vendor directory.</p>}
          <p className="text-sm text-dc-text-muted rounded-xl border border-dc-border bg-dc-surface-muted/40 px-4 py-3">
            Want help managing this shop? You can add shop runners from vendor settings after setup.
          </p>
          <VendorIntegrationGuide shopSlug={activeVendor.slug} />
          <StepNav
            onBack={() => setStep('appearance')}
            secondaryAction={
              <Link
                to={finishHref}
                className="w-full sm:flex-1 min-h-11 inline-flex items-center justify-center py-3 bg-dc-accent hover:bg-dc-accent-hover text-dc-accent-foreground font-medium rounded-xl text-center"
              >
                View shop
              </Link>
            }
          />
        </div>
      )}

      {step === 'publish' && !activeVendor && (
        <div className="space-y-4">
          <p className="text-sm text-dc-text-muted">Complete shop setup first.</p>
          <StepNav onNext={() => setStep('basics')} nextLabel="Shop basics" />
        </div>
      )}
    </div>
  )
}
