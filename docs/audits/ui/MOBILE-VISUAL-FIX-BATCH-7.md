# Mobile Visual Fix Batch 7

**Scope:** Vendors & Shops directory, Terms / legal document pages — bottom-nav clearance, vendor card refinement, no-image fallbacks, legal document navigation.  
**Verification:** Run on 2026-06-12 with Brax approval — all commands passed.

| Command | Result |
|---------|--------|
| `npm run typecheck` | ✓ pass |
| `npm run build` | ✓ pass |
| `npm run audit:ui-preflight` | ✓ pass |
| `npm run audit:ui-architecture` | ✓ pass (exit 0; see `docs/UI_*.md`) |
| `npm test` | ✓ pass (408 tests) |

### Fixes applied for green verification

- `ExploreDashboardPage.tsx` — import `useSearchParams`, type `URLSearchParams` callbacks
- `RootLayout.tsx` — remove unused `showMobileBottomNav`
- `people-directory-utils.ts` — remove duplicate `isAuditDemoUsername`
- `presenter-reputation-p3.test.ts` — assert `CommunityTrustChip` instead of removed “Limited feedback” card copy
- `adult-content-preference.test.ts` — expect privacy `schemaVersion` 7

## Global: bottom nav clearance

| Change | File |
|--------|------|
| Increased `--c2k-mobile-breathing` from `2.5rem` to `3rem` (48px) on all `#main-content` nav clearance | `packages/web/src/app/globals.css` |

Main padding remains the single source of truth via `RootLayout` → `mobileMainPadClass()`.

## 1. Vendors mobile layout

| Change | File |
|--------|------|
| Tighter mobile header (title, description, safety note) | `vendors/page.tsx` |
| Hide header “List your shop” on mobile when 5+ listings visible (deep browse) | `vendors/page.tsx` |
| `FilterSheet` + `DirectoryFilterButton` with active filter count (replaces custom drawer) | `vendors/page.tsx` |
| Mobile Filters + Sort in one compact row | `vendors/page.tsx` |
| First 3 cards full weight; `compact` from index 3 onward | `vendors/page.tsx`, `VendorCard.tsx` |
| `countActiveVendorFilters()` | `vendor-filters.ts` |

## 2. VendorCard hierarchy & no-image treatment

| Change | File |
|--------|------|
| Always show media area; `VendorProductFallback` (initials + gradient + category tint) | `VendorCard.tsx`, `VendorProductFallback.tsx` |
| Hierarchy: image → product → vendor → price → chips → sold externally → Visit shop | `VendorCard.tsx` |
| Max 2 category/shipping chips + “+N more” | `VendorCard.tsx` |
| `compact` variant: shorter image, quieter outline CTA, less meta noise | `VendorCard.tsx` |
| Vendor cover fallback pattern CSS | `mobile-polish.css` (`.c2k-vendor-cover-fallback`) |

## 3. Legal document template

| Change | File |
|--------|------|
| New `LegalDocumentTemplate` — collapsible mobile “Sections” TOC, compact draft banner, section spacing | `LegalDocumentTemplate.tsx` |
| `LegalDraftPage` re-exports template (all policy pages inherit) | `LegalDraftPage.tsx` |
| Terms: `showPoliciesHub` for top/bottom Policy Hub links | `terms/page.tsx` |
| Mobile scroll pad on legal pages | `LegalDocumentTemplate.tsx` |
| Desktop sticky right TOC preserved | `LegalDocumentTemplate.tsx` |

Legal copy unchanged except compact draft banner wording (same meaning).

## Files changed (summary)

```
packages/web/src/app/globals.css
packages/web/src/styles/mobile-polish.css
packages/web/src/lib/vendor-filters.ts
packages/web/src/components/vendors/VendorProductFallback.tsx
packages/web/src/components/cards/VendorCard.tsx
packages/web/src/app/vendors/page.tsx
packages/web/src/components/ui/LegalDocumentTemplate.tsx
packages/web/src/components/ui/LegalDraftPage.tsx
packages/web/src/app/terms/page.tsx
docs/audits/ui/MOBILE-VISUAL-FIX-BATCH-7.md
```

## Pages affected

- `/vendors` — mobile directory polish, filters, card rhythm
- `/terms` — mobile legal navigation
- All routes using `LegalDraftPage` / `PolicyStandardPage` (privacy, guidelines, policy pages)

## Manual smoke (360 / 390 / 430)

- `/vendors` — first product visible without excessive header; safety note present; Filters shows count when active; no-image cards show initials gradient; cards 4+ are compact; bottom content clears nav
- `/terms` — “Sections” disclosure jumps to anchors; Policy Hub link top + bottom; draft banner compact; footer links not clipped
- `/privacy`, `/guidelines` — inherit legal template (spot-check one)

## Verification (completed 2026-06-12)

```bash
npm run typecheck      # ✓
npm run build          # ✓
npm run audit:ui-preflight   # ✓
npm run audit:ui-architecture  # ✓
npm test             # ✓ (408 pass)
```

## Hard rules preserved

- No backend / OnboardingGate changes
- Bottom nav: Home, Explore, Events, Messages, Me
- Create remains outside bottom nav
- Safety, legal, privacy, report, moderation controls retained
- Desktop Vendors layout (filters | grid | right rail) unchanged
