/** Build vendor management API paths (owner `/me` or scoped by shop id for runners). */
export function vendorExternalStorePath(vendorProfileId?: string | null): string {
  return vendorProfileId ?
      `/api/v1/vendors/${encodeURIComponent(vendorProfileId)}/external-store`
    : '/api/v1/vendors/me/external-store'
}

export function vendorExternalSyncPath(vendorProfileId?: string | null): string {
  return vendorProfileId ?
      `/api/v1/vendors/${encodeURIComponent(vendorProfileId)}/external-store/sync`
    : '/api/v1/vendors/me/external-store/sync'
}

export function vendorEtsyPath(vendorProfileId?: string | null): string {
  return vendorProfileId ?
      `/api/v1/vendors/${encodeURIComponent(vendorProfileId)}/etsy`
    : '/api/v1/vendors/me/etsy'
}

export function vendorAppearancePatchPath(vendorProfileId?: string | null): string {
  return vendorProfileId ?
      `/api/v1/vendors/${encodeURIComponent(vendorProfileId)}`
    : '/api/v1/vendors/me'
}

export function shopifyInstallPath(shop: string, vendorProfileId?: string | null): string {
  const base = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
  const q = new URLSearchParams({ shop })
  if (vendorProfileId) q.set('vendorId', vendorProfileId)
  return `${base}/api/v1/integrations/shopify/install?${q.toString()}`
}
