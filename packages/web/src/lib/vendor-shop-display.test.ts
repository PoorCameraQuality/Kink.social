import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'
import {
  buyCtaLabel,
  VENDOR_BROWSE_BUY_TAGLINE,
  VENDOR_EXTERNAL_PURCHASE_NOTE,
} from './vendor-shop-display.ts'

const vendorPageSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../app/vendors/[id]/page.tsx'),
  'utf8',
)

describe('vendor shop display copy', () => {
  it('uses browse on kink.social tagline on public vendor pages', () => {
    assert.equal(VENDOR_BROWSE_BUY_TAGLINE, 'Browse on kink.social. Buy from the seller.')
    assert.match(vendorPageSrc, /VENDOR_BROWSE_BUY_TAGLINE/)
  })

  it('product cards note purchases happen off kink.social', () => {
    assert.equal(VENDOR_EXTERNAL_PURCHASE_NOTE, 'Purchases happen off kink.social.')
    assert.match(vendorPageSrc, /VENDOR_EXTERNAL_PURCHASE_NOTE/)
  })

  it('external listing buttons say View on seller shop', () => {
    assert.equal(buyCtaLabel('etsy'), "View on seller's shop")
    assert.equal(buyCtaLabel('shopify'), "View on seller's shop")
    assert.equal(buyCtaLabel('woocommerce'), "View on seller's shop")
  })

  it('vendor page product grid uses responsive columns', () => {
    assert.match(vendorPageSrc, /grid-cols-1 sm:grid-cols-2/)
  })
})
