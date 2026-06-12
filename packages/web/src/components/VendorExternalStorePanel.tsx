import { useEffect, useState } from 'react'
import {
  shopifyInstallPath,
  vendorEtsyPath,
  vendorExternalStorePath,
  vendorExternalSyncPath,
} from '@/lib/vendor-api-paths'

const TAB_DESCRIPTIONS = {
  etsy: {
    body: 'Paste your Etsy shop URL or shop name. We will resolve the shop and sync active listings through the Etsy API.',
    setup: 'Etsy sync requires ETSY_KEYSTRING on the API server.',
  },
  shopify: {
    body: 'Connect your Shopify store with OAuth. After approval, active products can sync into your kink.social vendor page.',
    setup: 'Shopify sync requires SHOPIFY_API_KEY and SHOPIFY_API_SECRET on the API server.',
  },
  woocommerce: {
    body: 'Enter your WooCommerce site URL and read-only REST API credentials. Products sync through the WooCommerce REST API.',
    setup:
      'WooCommerce credentials should be stored securely. Use encrypted storage when EXTERNAL_STORE_SECRET is set.',
  },
  link: {
    body: 'Add a store URL without syncing product listings. Your vendor page will show a visit store link.',
    setup: null,
  },
} as const

type Props = {
  externalStoreType: string
  etsyShopUrl: string
  wooSiteUrl?: string
  syncedAt: string | null
  syncError: string | null
  onUpdated: () => void
  variant?: 'default' | 'onboarding'
  /** When set, API calls target this shop (for runners managing a shop they do not own). */
  vendorProfileId?: string | null
}

export default function VendorExternalStorePanel({
  externalStoreType,
  etsyShopUrl,
  wooSiteUrl,
  syncedAt,
  syncError,
  onUpdated,
  variant = 'default',
  vendorProfileId = null,
}: Props) {
  const [tab, setTab] = useState<'etsy' | 'shopify' | 'woocommerce' | 'link'>('etsy')
  const [etsyUrl, setEtsyUrl] = useState(etsyShopUrl)
  const [linkUrl, setLinkUrl] = useState('')
  const [wooSite, setWooSite] = useState(wooSiteUrl ?? '')
  const [wooKey, setWooKey] = useState('')
  const [wooSecret, setWooSecret] = useState('')
  const [shopifyShop, setShopifyShop] = useState('')
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setEtsyUrl(etsyShopUrl)
  }, [etsyShopUrl])

  useEffect(() => {
    if (wooSiteUrl) setWooSite(wooSiteUrl)
  }, [wooSiteUrl])

  useEffect(() => {
    if (externalStoreType === 'shopify') setTab('shopify')
    else if (externalStoreType === 'woocommerce') setTab('woocommerce')
    else if (externalStoreType === 'link_only') setTab('link')
    else setTab('etsy')
  }, [externalStoreType])

  async function syncNow() {
    setErr(null)
    setMsg(null)
    setSyncing(true)
    try {
      const r = await fetch(vendorExternalSyncPath(vendorProfileId), {
        method: 'POST',
        credentials: 'include',
      })
      const j = (await r.json().catch(() => ({}))) as { error?: string; retryAfterSec?: number }
      if (r.status === 429) {
        setErr(j.error ?? `Wait ${j.retryAfterSec ?? 60}s before syncing again.`)
        return
      }
      if (!r.ok) {
        setErr(j.error ?? `Sync failed (${r.status})`)
        return
      }
      setMsg('Listings synced.')
      onUpdated()
    } catch {
      setErr('Network error')
    } finally {
      setSyncing(false)
    }
  }

  async function saveEtsy(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    const trimmed = etsyUrl.trim()
    if (!trimmed) {
      setErr('Enter Etsy shop URL or name, or switch tab to disconnect elsewhere.')
      return
    }
    setSaving(true)
    try {
      const r = await fetch(vendorEtsyPath(vendorProfileId), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopUrl: trimmed }),
      })
      const j = (await r.json().catch(() => ({}))) as { error?: string }
      if (!r.ok) {
        setErr(j.error ?? `Could not connect (${r.status})`)
        return
      }
      setMsg('Etsy linked. Sync will run shortly.')
      onUpdated()
    } catch {
      setErr('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function disconnectAll() {
    setErr(null)
    setMsg(null)
    setSaving(true)
    try {
      const r = await fetch(vendorExternalStorePath(vendorProfileId), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'none' }),
      })
      const j = (await r.json().catch(() => ({}))) as { error?: string }
      if (!r.ok) {
        setErr(j.error ?? 'Could not disconnect')
        return
      }
      setMsg('External store disconnected.')
      setEtsyUrl('')
      setLinkUrl('')
      setWooKey('')
      setWooSecret('')
      onUpdated()
    } catch {
      setErr('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function saveLinkOnly(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    const u = linkUrl.trim()
    if (!u) {
      setErr('Enter a store URL.')
      return
    }
    setSaving(true)
    try {
      const r = await fetch(vendorExternalStorePath(vendorProfileId), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'link_only', storeUrl: u }),
      })
      const j = (await r.json().catch(() => ({}))) as { error?: string }
      if (!r.ok) {
        setErr(j.error ?? `Failed (${r.status})`)
        return
      }
      setMsg('Store link saved (no product sync).')
      onUpdated()
    } catch {
      setErr('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function saveWoo(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    if (!wooSite.trim() || !wooKey.trim() || !wooSecret.trim()) {
      setErr('Site URL, consumer key, and consumer secret are required.')
      return
    }
    setSaving(true)
    try {
      const r = await fetch(vendorExternalStorePath(vendorProfileId), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'woocommerce',
          siteUrl: wooSite.trim(),
          consumerKey: wooKey.trim(),
          consumerSecret: wooSecret.trim(),
        }),
      })
      const j = (await r.json().catch(() => ({}))) as { error?: string }
      if (!r.ok) {
        setErr(j.error ?? `Failed (${r.status})`)
        return
      }
      setMsg('WooCommerce connected. Sync will run shortly.')
      setWooKey('')
      setWooSecret('')
      onUpdated()
    } catch {
      setErr('Network error')
    } finally {
      setSaving(false)
    }
  }

  function startShopifyOAuth(e: React.FormEvent) {
    e.preventDefault()
    const shop = shopifyShop.trim().toLowerCase()
    if (!shop.endsWith('.myshopify.com')) {
      setErr('Enter your Shopify domain, e.g. your-store.myshopify.com')
      return
    }
    const installUrl = shopifyInstallPath(shop, vendorProfileId)
    if (!installUrl.startsWith('http')) {
      setErr('Set VITE_API_URL so we can redirect to the API for Shopify OAuth.')
      return
    }
    window.location.href = installUrl
  }

  const showSync =
    externalStoreType === 'etsy' ||
    externalStoreType === 'shopify' ||
    externalStoreType === 'woocommerce'

  return (
    <div className="bg-dc-elevated/95 rounded-2xl border border-dc-border p-6 shadow-[var(--dc-shadow-soft)] mb-6">
      {variant === 'default' ?
        <>
          <h3 className="text-sm font-semibold text-dc-muted uppercase mb-1">External storefront</h3>
          <p className="text-sm text-dc-text-muted mb-4">
            Connect Etsy, Shopify, or WooCommerce to show cached products here; checkout stays on the vendor&apos;s store.
            Or use <strong className="text-dc-text">Link only</strong> with no API sync.
          </p>
        </>
      : null}

      <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Inventory connector type">
        {(['etsy', 'shopify', 'woocommerce', 'link'] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              tab === t ? 'bg-dc-accent text-dc-text' : 'bg-dc-elevated-solid text-dc-text-muted hover:text-dc-text'
            }`}
          >
            {t === 'link' ? 'Link only' : t === 'woocommerce' ? 'WooCommerce' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {import.meta.env.DEV ?
        <div
          className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-3 text-xs leading-relaxed text-amber-100/90"
          role="note"
        >
          <p className="font-medium text-amber-100">Local development</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Shopify OAuth requires VITE_API_URL so the browser can reach the API install URL.</li>
            <li>Etsy sync requires ETSY_KEYSTRING.</li>
            <li>Shopify sync requires SHOPIFY_API_KEY and SHOPIFY_API_SECRET.</li>
            <li>Automatic refresh requires the c2k-external-sync worker to be running.</li>
            <li>Periodic sync runs about every 45 minutes by default.</li>
          </ul>
        </div>
      : null}

      {syncError ? (
        <p className="text-sm text-amber-200/90 bg-amber-500/10 border border-amber-500/25 rounded-lg px-3 py-2 mb-3">
          Last sync error: {syncError}
        </p>
      ) : null}
      {msg ? <p className="text-sm text-emerald-300/90 mb-3">{msg}</p> : null}
      {err ?
        <div
          className="mb-3 rounded-xl border border-red-500/30 bg-red-950/25 px-3 py-2 text-sm text-red-200"
          role="alert"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1">{err}</p>
            <button
              type="button"
              onClick={() => setErr(null)}
              className="min-h-10 shrink-0 rounded-xl border border-dc-border px-3 text-sm text-dc-text hover:bg-dc-elevated-muted"
            >
              Dismiss
            </button>
          </div>
        </div>
      : null}

      {tab === 'etsy' && (
        <form onSubmit={(e) => void saveEtsy(e)} className="space-y-3">
          <p className="text-sm text-dc-text-muted">{TAB_DESCRIPTIONS.etsy.body}</p>
          <p className="text-xs text-dc-muted">{TAB_DESCRIPTIONS.etsy.setup}</p>
          <input
            type="text"
            value={etsyUrl}
            onChange={(e) => setEtsyUrl(e.target.value)}
            placeholder="https://www.etsy.com/shop/… or shop name"
            className="w-full bg-dc-elevated-solid border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-10 px-4 rounded-xl bg-dc-accent hover:bg-dc-accent-hover text-dc-text text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving…' : externalStoreType === 'etsy' ? 'Update Etsy' : 'Connect Etsy'}
            </button>
          </div>
        </form>
      )}

      {tab === 'shopify' && (
        <form onSubmit={startShopifyOAuth} className="space-y-3">
          <p className="text-sm text-dc-text-muted">{TAB_DESCRIPTIONS.shopify.body}</p>
          <p className="text-xs text-dc-muted">{TAB_DESCRIPTIONS.shopify.setup}</p>
          <input
            type="text"
            value={shopifyShop}
            onChange={(e) => setShopifyShop(e.target.value)}
            placeholder="your-store.myshopify.com"
            className="w-full bg-dc-elevated-solid border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
          />
          <button
            type="submit"
            className="min-h-10 px-4 rounded-xl bg-dc-accent hover:bg-dc-accent-hover text-dc-text text-sm font-medium"
          >
            Connect with Shopify
          </button>
        </form>
      )}

      {tab === 'woocommerce' && (
        <form onSubmit={(e) => void saveWoo(e)} className="space-y-3">
          <p className="text-sm text-dc-text-muted">{TAB_DESCRIPTIONS.woocommerce.body}</p>
          <p className="text-xs text-dc-muted">{TAB_DESCRIPTIONS.woocommerce.setup}</p>
          <input
            type="url"
            value={wooSite}
            onChange={(e) => setWooSite(e.target.value)}
            placeholder="https://your-wordpress-site.com"
            className="w-full bg-dc-elevated-solid border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
          />
          <input
            type="text"
            value={wooKey}
            onChange={(e) => setWooKey(e.target.value)}
            placeholder="Consumer key"
            autoComplete="off"
            className="w-full bg-dc-elevated-solid border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
          />
          <input
            type="password"
            value={wooSecret}
            onChange={(e) => setWooSecret(e.target.value)}
            placeholder="Consumer secret"
            autoComplete="off"
            className="w-full bg-dc-elevated-solid border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="min-h-10 px-4 rounded-xl bg-dc-accent hover:bg-dc-accent-hover text-dc-text text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Connect WooCommerce'}
          </button>
        </form>
      )}

      {tab === 'link' && (
        <form onSubmit={(e) => void saveLinkOnly(e)} className="space-y-3">
          <p className="text-sm text-dc-text-muted">{TAB_DESCRIPTIONS.link.body}</p>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://your-store.com"
            className="w-full bg-dc-elevated-solid border border-dc-border rounded-xl px-3 py-2 text-dc-text text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="min-h-10 px-4 rounded-xl bg-dc-accent hover:bg-dc-accent-hover text-dc-text text-sm font-medium disabled:opacity-50"
          >
            Save store link
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dc-border">
        {showSync ? (
          <div className="w-full space-y-2">
            <button
              type="button"
              disabled={syncing}
              onClick={() => void syncNow()}
              className="min-h-10 px-4 rounded-xl border border-dc-border bg-dc-elevated-solid text-sm text-dc-text hover:bg-dc-elevated-muted disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : 'Sync listings now'}
            </button>
            <p className="text-xs text-dc-muted">
              Sync pulls active listings from your connected store into kink.social&apos;s cached vendor listing table.
            </p>
          </div>
        ) : null}
        <button
          type="button"
          disabled={saving}
          onClick={() => void disconnectAll()}
          className="min-h-10 px-4 rounded-xl border border-dc-border text-sm text-dc-text-muted hover:text-dc-text"
        >
          Disconnect external store
        </button>
      </div>

      {syncedAt ? (
        <p className="text-xs text-dc-muted mt-3">Last listing sync: {new Date(syncedAt).toLocaleString()}</p>
      ) : null}
    </div>
  )
}
