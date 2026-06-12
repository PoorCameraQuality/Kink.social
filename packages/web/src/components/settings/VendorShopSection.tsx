import { VENDOR_CATEGORY_DESCRIPTIONS, normalizeVendorTags, type VendorCategory } from '@c2k/shared'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EckeEntityPublishStatus from '@/components/ecke/EckeEntityPublishStatus'
import VendorExternalStorePanel from '@/components/VendorExternalStorePanel'
import VendorIntegrationGuide from '@/components/vendors/VendorIntegrationGuide'
import { useAuth } from '@/contexts/AuthContext'
import { useApiVendorMe } from '@/hooks/useApiVendorMe'
import { VENDOR_CATEGORY_VALUES } from '@/lib/vendor-onboarding'

export default function VendorShopSection() {
  const { isAuthenticated } = useAuth()
  const { status, vendor, reload } = useApiVendorMe(isAuthenticated)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [makerStory, setMakerStory] = useState('')
  const [policyReturns, setPolicyReturns] = useState('')
  const [policyCustomOrders, setPolicyCustomOrders] = useState('')
  const [policyLeadTime, setPolicyLeadTime] = useState('')
  const [policyShipping, setPolicyShipping] = useState('')
  const [website, setWebsite] = useState('')
  const [shipsTo, setShipsTo] = useState<'US' | 'Canada' | 'International'>('US')
  const [category, setCategory] = useState<VendorCategory | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<'PUBLIC' | 'MEMBERS' | 'HIDDEN'>('HIDDEN')
  const [commissionStatus, setCommissionStatus] = useState<'OPEN' | 'LIMITED' | 'CLOSED'>('OPEN')
  const [commissionNotes, setCommissionNotes] = useState('')
  const [eckePublish, setEckePublish] = useState(false)
  const [coOwnerInput, setCoOwnerInput] = useState('')

  useEffect(() => {
    if (!vendor) return
    setDisplayName(vendor.displayName ?? '')
    setBio(vendor.bio ?? '')
    setMakerStory(vendor.makerStory ?? '')
    const p = vendor.shopPolicies
    setPolicyReturns(p?.returns ?? '')
    setPolicyCustomOrders(p?.customOrders ?? '')
    setPolicyLeadTime(p?.leadTime ?? '')
    setPolicyShipping(p?.shippingNotes ?? '')
    setWebsite(vendor.website ?? '')
    setShipsTo((vendor.shipsTo as typeof shipsTo) ?? 'US')
    setCategory((vendor.category as VendorCategory | null) ?? null)
    setTags(vendor.tags ?? [])
    setTagInput('')
    setVisibility(vendor.visibility ?? 'HIDDEN')
    setCommissionStatus(vendor.commissionStatus ?? 'OPEN')
    setCommissionNotes(vendor.commissionNotes ?? '')
    setEckePublish(Boolean(vendor.eckePublish))
    void (async () => {
      try {
        const r = await fetch('/api/v1/vendors/me/co-owners', { credentials: 'include' })
        if (!r.ok) return
        const d = (await r.json()) as { coOwners?: Array<{ username: string }> }
        setCoOwnerInput((d.coOwners ?? []).map((c) => c.username).join(', '))
      } catch {
        /* ignore */
      }
    })()
  }, [vendor])

  const addTagsFromInput = () => {
    const parts = tagInput.split(/[,]+/).map((s) => s.trim()).filter(Boolean)
    if (parts.length === 0) return
    setTags((prev) => normalizeVendorTags([...prev, ...parts]))
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const saveProfile = useCallback(async () => {
    if (!vendor) return
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      const r = await fetch('/api/v1/me/vendor-profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          makerStory: makerStory.trim() || null,
          shopPolicies: {
            returns: policyReturns.trim() || null,
            customOrders: policyCustomOrders.trim() || null,
            leadTime: policyLeadTime.trim() || null,
            shippingNotes: policyShipping.trim() || null,
          },
          website: website.trim() || null,
          shipsTo,
          category,
          tags,
          visibility,
          commissionStatus,
          commissionNotes: commissionNotes.trim() || null,
          eckePublish,
        }),
      })
      const j = (await r.json().catch(() => ({}))) as { error?: string }
      if (!r.ok) {
        setErr(j.error ?? 'Could not save')
        return
      }
      const coUsernames = coOwnerInput
        .split(/[,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      const cr = await fetch('/api/v1/vendors/me/co-owners', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: coUsernames }),
      })
      const cj = (await cr.json().catch(() => ({}))) as { error?: string }
      if (!cr.ok) {
        setErr(cj.error ?? 'Shop saved but shop runners could not be updated')
        reload()
        return
      }
      setMsg('Shop settings saved.')
      reload()
    } catch {
      setErr('Network error')
    } finally {
      setSaving(false)
    }
  }, [
    bio,
    category,
    tags,
    commissionNotes,
    commissionStatus,
    coOwnerInput,
    displayName,
    eckePublish,
    makerStory,
    policyCustomOrders,
    policyLeadTime,
    policyReturns,
    policyShipping,
    reload,
    shipsTo,
    vendor,
    visibility,
    website,
  ])

  if (!isAuthenticated) return null

  if (status === 'loading' || status === 'idle') {
    return (
      <section className="rounded-2xl border border-dc-border bg-dc-elevated/40 p-6">
        <div className="h-24 animate-pulse rounded-xl bg-dc-elevated-muted" />
      </section>
    )
  }

  if (status === 'none' || !vendor) {
    return (
      <section className="rounded-2xl border border-dc-border bg-dc-elevated/40 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-dc-text">Vendor shop</h2>
        <p className="text-sm text-dc-text-muted">
          Showcase your catalog on Kink Social and import listings from Etsy, Shopify, or WooCommerce. Checkout stays on your store.
        </p>
        <Link
          to="/vendors/onboarding"
          className="inline-flex min-h-10 items-center rounded-xl bg-dc-accent px-4 text-sm font-medium text-dc-text hover:bg-dc-accent-hover"
        >
          Set up your shop
        </Link>
      </section>
    )
  }

  const externalStoreType = vendor.externalStoreType ?? (vendor.usesEtsy ? 'etsy' : 'none')
  const wooPub = vendor.externalStorePublic as { wooSiteUrl?: string } | undefined
  const syncedAt = vendor.externalListingsSyncedAt ?? vendor.etsyListingsSyncedAt ?? null
  const syncError = vendor.externalSyncError ?? vendor.etsySyncError ?? null

  return (
    <section className="rounded-2xl border border-dc-border bg-dc-elevated/40 p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-dc-text">Vendor shop</h2>
          <p className="text-sm text-dc-text-muted mt-1">
            Manage your public shop, inventory sync, and how you appear on events and discovery.
          </p>
        </div>
        <Link
          to={`/vendors/${encodeURIComponent(vendor.slug)}`}
          className="text-sm text-dc-accent hover:underline shrink-0"
        >
          View public shop →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="vs-name" className="block text-xs text-dc-muted mb-1">
            Display name
          </label>
          <input
            id="vs-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          />
        </div>
        <div>
          <label htmlFor="vs-vis" className="block text-xs text-dc-muted mb-1">
            Directory visibility
          </label>
          <select
            id="vs-vis"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
            className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          >
            <option value="PUBLIC">Public. Listed in vendor directory</option>
            <option value="MEMBERS">Members only</option>
            <option value="HIDDEN">Hidden. Not in directory</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="vs-bio" className="block text-xs text-dc-muted mb-1">
          Bio
        </label>
        <textarea
          id="vs-bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
        />
      </div>

      <div>
        <label htmlFor="vs-maker" className="block text-xs text-dc-muted mb-1">
          Maker story
        </label>
        <textarea
          id="vs-maker"
          rows={2}
          value={makerStory}
          onChange={(e) => setMakerStory(e.target.value)}
          placeholder="One sentence: who you make for (rope, leather, art prints…)"
          className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
        />
      </div>

      <div className="rounded-xl border border-dc-border bg-dc-surface-muted/40 p-4 space-y-3">
        <p className="text-xs font-semibold text-dc-text">Shop policies</p>
        <p className="text-xs text-dc-muted">Your own wording. Shown on your public shop. Not platform-verified.</p>
        <div>
          <label htmlFor="vs-pol-returns" className="block text-xs text-dc-muted mb-1">
            Returns
          </label>
          <textarea
            id="vs-pol-returns"
            rows={2}
            value={policyReturns}
            onChange={(e) => setPolicyReturns(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          />
        </div>
        <div>
          <label htmlFor="vs-pol-custom" className="block text-xs text-dc-muted mb-1">
            Custom orders
          </label>
          <textarea
            id="vs-pol-custom"
            rows={2}
            value={policyCustomOrders}
            onChange={(e) => setPolicyCustomOrders(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="vs-pol-lead" className="block text-xs text-dc-muted mb-1">
              Lead time
            </label>
            <input
              id="vs-pol-lead"
              value={policyLeadTime}
              onChange={(e) => setPolicyLeadTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
            />
          </div>
          <div>
            <label htmlFor="vs-pol-ship" className="block text-xs text-dc-muted mb-1">
              Shipping notes
            </label>
            <input
              id="vs-pol-ship"
              value={policyShipping}
              onChange={(e) => setPolicyShipping(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="vs-web" className="block text-xs text-dc-muted mb-1">
            Website
          </label>
          <input
            id="vs-web"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          />
        </div>
        <div>
          <label htmlFor="vs-ships" className="block text-xs text-dc-muted mb-1">
            Ships to
          </label>
          <select
            id="vs-ships"
            value={shipsTo}
            onChange={(e) => setShipsTo(e.target.value as typeof shipsTo)}
            className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          >
            <option value="US">US</option>
            <option value="Canada">Canada</option>
            <option value="International">International</option>
          </select>
        </div>
      </div>

      <div>
        <p className="text-xs text-dc-muted mb-2">Shop category</p>
        <div className="flex flex-wrap gap-2">
          {VENDOR_CATEGORY_VALUES.map((cat) => (
            <button
              key={cat}
              type="button"
              title={VENDOR_CATEGORY_DESCRIPTIONS[cat]}
              onClick={() => setCategory(category === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                category === cat ?
                  'border-dc-accent bg-dc-accent/15 text-dc-accent'
                : 'border-dc-border text-dc-text-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="vs-tags" className="block text-xs text-dc-muted mb-1">
          Specialty tags
        </label>
        <div className="flex gap-2">
          <input
            id="vs-tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTagsFromInput()
              }
            }}
            placeholder="rope, commissions"
            className="flex-1 px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          />
          <button
            type="button"
            onClick={addTagsFromInput}
            className="px-3 rounded-lg border border-dc-border text-sm text-dc-text-muted"
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
                className="rounded-full border border-dc-border px-2 py-1 text-xs text-dc-text-muted"
              >
                {tag} ×
              </button>
            ))}
          </div>
        : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="vs-comm" className="block text-xs text-dc-muted mb-1">
            Custom orders
          </label>
          <select
            id="vs-comm"
            value={commissionStatus}
            onChange={(e) => setCommissionStatus(e.target.value as typeof commissionStatus)}
            className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          >
            <option value="OPEN">Open to commissions</option>
            <option value="LIMITED">Limited availability</option>
            <option value="CLOSED">Not taking custom work</option>
          </select>
        </div>
        <div>
          <label htmlFor="vs-comm-notes" className="block text-xs text-dc-muted mb-1">
            Commission notes
          </label>
          <input
            id="vs-comm-notes"
            value={commissionNotes}
            onChange={(e) => setCommissionNotes(e.target.value)}
            placeholder="Lead time, minimums, etc."
            className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-dc-text mb-2">Shop runners</p>
        <label htmlFor="vs-co-owners" className="block text-xs text-dc-muted mb-1">
          Runner usernames
        </label>
        <input
          id="vs-co-owners"
          value={coOwnerInput}
          onChange={(e) => setCoOwnerInput(e.target.value)}
          placeholder="username1, username2"
          className="w-full px-3 py-2 rounded-lg bg-dc-surface-muted border border-dc-border text-dc-text text-sm"
        />
        <p className="text-xs text-dc-muted mt-1">
          Shop runners are trusted people who can help operate this vendor page. They may help with inventory,
          appearance, and feedback. The primary owner remains responsible for the shop.
        </p>
        <p className="text-xs text-amber-200/90 mt-2">
          Only add people you trust. Runners may be able to change shop content and inventory settings.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-teal-500/20 bg-teal-950/20 px-4 py-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 rounded border-dc-border"
          checked={eckePublish}
          onChange={(e) => setEckePublish(e.target.checked)}
          disabled={visibility !== 'PUBLIC'}
        />
        <div>
          <span className="text-sm font-medium text-dc-text">List on East Coast Kink Events</span>
          <p className="text-xs text-dc-muted mt-1">
            Auto-sync your vendor profile to eastcoastkinkevents.com when your shop is public. Requires ECKE publish
            bridge on the server.
          </p>
        </div>
      </label>

      {eckePublish && visibility === 'PUBLIC' ?
        <EckeEntityPublishStatus
          entityLabel="Vendor shop"
          loadUrl="/api/v1/vendors/me/ecke-publish"
          queueUrl="/api/v1/vendors/me/ecke-publish"
        />
      : null}

      {err ?
        <p className="text-sm text-red-200" role="alert">
          {err}
        </p>
      : null}
      {msg ?
        <p className="text-sm text-emerald-300" role="status">
          {msg}
        </p>
      : null}

      <button
        type="button"
        disabled={saving}
        onClick={() => void saveProfile()}
        className="min-h-10 rounded-lg bg-dc-accent px-4 text-sm font-medium text-dc-text disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save shop profile'}
      </button>

      <div className="border-t border-dc-border pt-6">
        <h3 className="text-sm font-semibold text-dc-text mb-1">External inventory</h3>
        <p className="text-xs text-dc-muted mb-3">
          Sync pulls titles, prices, and images for discovery. Checkout always happens on your Etsy, Shopify, Woo, or
          link-only store.
        </p>
        <VendorExternalStorePanel
          externalStoreType={externalStoreType}
          etsyShopUrl={vendor.etsyShopUrl ?? ''}
          wooSiteUrl={wooPub?.wooSiteUrl}
          syncedAt={syncedAt}
          syncError={syncError}
          onUpdated={() => reload()}
        />
      </div>

      <div className="border-t border-dc-border pt-6">
        <h3 className="text-sm font-semibold text-dc-text mb-3">Where your shop appears</h3>
        <VendorIntegrationGuide shopSlug={vendor.slug} compact />
      </div>

      <Link to="/vendors/onboarding" className="text-sm text-dc-accent hover:underline">
        Re-run setup wizard
      </Link>
    </section>
  )
}
