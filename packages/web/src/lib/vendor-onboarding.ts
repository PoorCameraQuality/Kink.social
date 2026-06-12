import type { ApiVendorRow } from '@/lib/api-vendor-mapper'
import { VENDOR_CATEGORY_VALUES } from '@c2k/shared'

export const VENDOR_ONBOARDING_STEPS = [
  'welcome',
  'basics',
  'inventory',
  'appearance',
  'publish',
] as const

export type VendorOnboardingStep = (typeof VENDOR_ONBOARDING_STEPS)[number]

export const VENDOR_ONBOARDING_STEP_LABELS: Record<VendorOnboardingStep, string> = {
  welcome: 'Welcome',
  basics: 'Vendor page',
  inventory: 'Inventory',
  appearance: 'Appearance',
  publish: 'Publish',
}

export const VENDOR_BASICS_HEADING = 'Set up your vendor page'
export const VENDOR_BASICS_INTRO =
  'Start with the public details buyers will see on kink.social. Next, you can connect Etsy, Shopify, WooCommerce, or add a store link so your listings appear on your vendor page.'
export const VENDOR_BASICS_CONTINUE_LABEL = 'Continue to inventory'
export const VENDOR_INVENTORY_HEADING = 'Connect your inventory'
export const VENDOR_INVENTORY_INTRO =
  'Bring in active listings from your existing shop. kink.social stores cached listing rows for display, but buyers check out through your external storefront.'
export const VENDOR_CONNECTOR_PREVIEW = ['Etsy', 'Shopify', 'WooCommerce', 'Link only'] as const
export const VENDOR_EXTERNAL_SYNC_PATH = '/api/v1/vendors/me/external-store/sync'

export { VENDOR_CATEGORY_VALUES }

/** @deprecated Use VENDOR_CATEGORY_VALUES */
export const VENDOR_CATEGORY_FILTERS = VENDOR_CATEGORY_VALUES

export function vendorHasStoreConnector(vendor: ApiVendorRow | null | undefined): boolean {
  if (!vendor) return false
  const t = vendor.externalStoreType ?? 'none'
  if (t !== 'none' && t !== '') return true
  if (vendor.usesEtsy) return true
  if (vendor.etsyShopUrl) return true
  return false
}

export function vendorIsPublished(vendor: ApiVendorRow | null | undefined): boolean {
  return vendor?.visibility === 'PUBLIC'
}

/** First incomplete wizard step for resume. */
export function initialOnboardingStep(vendor: ApiVendorRow | null | undefined): VendorOnboardingStep {
  if (!vendor) return 'welcome'
  if (!vendorHasStoreConnector(vendor)) return 'inventory'
  if (!vendorIsPublished(vendor)) return 'publish'
  return 'publish'
}

export function stepIndex(step: VendorOnboardingStep): number {
  return VENDOR_ONBOARDING_STEPS.indexOf(step)
}
