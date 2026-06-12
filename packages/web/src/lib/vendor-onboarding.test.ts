import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import {
  VENDOR_BASICS_CONTINUE_LABEL,
  VENDOR_BASICS_INTRO,
  VENDOR_CONNECTOR_PREVIEW,
  VENDOR_EXTERNAL_SYNC_PATH,
  VENDOR_INVENTORY_HEADING,
  VENDOR_ONBOARDING_STEPS,
  VENDOR_ONBOARDING_STEP_LABELS,
} from './vendor-onboarding.ts'

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const wizardSrc = readFileSync(join(webRoot, 'components/vendors/VendorOnboardingWizard.tsx'), 'utf8')
const panelSrc = readFileSync(join(webRoot, 'components/VendorExternalStorePanel.tsx'), 'utf8')

describe('vendor onboarding copy and flow', () => {
  it('exposes five labeled onboarding steps', () => {
    assert.equal(VENDOR_ONBOARDING_STEPS.length, 5)
    assert.deepEqual(VENDOR_ONBOARDING_STEPS, ['welcome', 'basics', 'inventory', 'appearance', 'publish'])
    assert.equal(VENDOR_ONBOARDING_STEP_LABELS.inventory, 'Inventory')
  })

  it('Step 2 primary button says Continue to inventory', () => {
    assert.equal(VENDOR_BASICS_CONTINUE_LABEL, 'Continue to inventory')
    assert.match(wizardSrc, /VENDOR_BASICS_CONTINUE_LABEL/)
  })

  it('Step 2 intro mentions Etsy, Shopify, WooCommerce, and store link', () => {
    assert.match(VENDOR_BASICS_INTRO, /Etsy/)
    assert.match(VENDOR_BASICS_INTRO, /Shopify/)
    assert.match(VENDOR_BASICS_INTRO, /WooCommerce/)
    assert.match(VENDOR_BASICS_INTRO, /store link/)
  })

  it('Step 2 connector preview lists all four options', () => {
    assert.deepEqual([...VENDOR_CONNECTOR_PREVIEW], ['Etsy', 'Shopify', 'WooCommerce', 'Link only'])
  })

  it('basics step routes to inventory after shop creation', () => {
    assert.equal(VENDOR_ONBOARDING_STEPS[1], 'basics')
    assert.equal(VENDOR_ONBOARDING_STEPS[2], 'inventory')
    assert.match(wizardSrc, /setStep\('inventory'\)/)
  })

  it('Step 3 heading is Connect your inventory', () => {
    assert.equal(VENDOR_INVENTORY_HEADING, 'Connect your inventory')
  })

  it('Step 3 renders VendorExternalStorePanel in onboarding mode', () => {
    assert.match(wizardSrc, /VendorExternalStorePanel/)
    assert.match(wizardSrc, /variant="onboarding"/)
  })

  it('external store panel exposes Etsy, Shopify, WooCommerce, and Link only tabs', () => {
    assert.match(panelSrc, /Etsy/)
    assert.match(panelSrc, /Shopify/)
    assert.match(panelSrc, /WooCommerce/)
    assert.match(panelSrc, /Link only/)
  })

  it('sync uses POST external-store sync path', () => {
    assert.equal(VENDOR_EXTERNAL_SYNC_PATH, '/api/v1/vendors/me/external-store/sync')
    assert.match(panelSrc, /vendorExternalSyncPath/)
    assert.match(panelSrc, /method: 'POST'/)
  })
})
