# UI Design System Audit — kink.social

Generated: 2026-06-12 via `npm run audit:ui-architecture`

**Binding docs:** [`docs/C2K-DESIGN-SYSTEM.md`](C2K-DESIGN-SYSTEM.md), [`docs/design/08-DESIGN_TOKENS.md`](design/08-DESIGN_TOKENS.md).

## Token architecture

| Family | Purpose | Var count (sampled) | Primary files |
|--------|---------|---------------------|---------------|
| `--dc-*` | Member/community UI (primary) | 54 | appearancePresets.ts, globals.css |
| `--c2k-*` | Legacy teal theme fallbacks | 47 | globals.css :root |
| `--pub-*` | Landing/auth marketing palette | 13 | public-auth.css |
| `--organizer-*` | Organizer console chrome | 8 | globals.css |
| `--ecke-*` | ECKE link/focus bridge | 4 | dancecard-parity.css |

## Theme presets

Theming is **preset-based** (not Tailwind `darkMode`). `DancecardAppearanceProvider` sets inline `--dc-*` on `<html>`.

| Preset ID | Mode |
|-----------|------|
| parchment | light |
| midnight-brass | dark |
| lifted-ink | dark |
| coastal-slate | light |
| high-noon | light |

## Typography

| Layer | Fonts | Source |
|-------|-------|--------|
| **Live app** | Manrope (UI), Sora (display) | packages/web/index.html, lib/fonts.ts |
| **Stale references** | Inter | root tailwind.config.js, packages/web/src/globals.css, design doc §5 |

## Tailwind usage

- **`dc-*` utility usages (approx):** 14322
- **`c2k-*` utility usages (approx):** 1
- **Tailwind darkMode configured:** no
- **Stray `dark:` classes in TSX:** 2 files

### Unused Tailwind extensions (defined but zero TSX usage)

- `c2k-1`
- `c2k-2`
- `c2k-3`
- `c2k-4`
- `c2k-5`
- `c2k-6`
- `rounded-c2k-card`
- `shadow-c2k-soft`

## Hardcoded color hotspots (top files)

### Raw hex in components (excluding token definition files)

- `packages/web/src/components/dancecard/organizer/settings/EventSettingsBrandingForm.tsx`: 30 hits
- `packages/web/src/components/landing/public-auth.css`: 27 hits
- `packages/web/src/styles/dancecard-tokens.css`: 16 hits
- `packages/web/src/components/feed/feedPostBadge.ts`: 15 hits
- `packages/web/src/app/orgs/[slug]/OrgHubClient.tsx`: 14 hits
- `packages/web/src/styles/dancecard-parity.css`: 12 hits
- `packages/web/src/lib/dancecard/trackDisplayColors.ts`: 11 hits
- `packages/web/src/components/MockDataBanner.tsx`: 4 hits
- `packages/web/src/components/org/OrgDiscordEmbedPanel.tsx`: 3 hits
- `packages/web/src/components/conventions/ConventionHero.tsx`: 1 hits
- `packages/web/src/components/dancecard/organizer/BadgePrintCard.tsx`: 1 hits
- `packages/web/src/components/dancecard/organizer/IcalBusyPreviewPanel.tsx`: 1 hits
- `packages/web/src/components/dancecard/organizer/settings/EventSettingsAdvancedForm.tsx`: 1 hits
- `packages/web/src/components/dancecard/organizer/ui/OrganizerConfirmDialog.tsx`: 1 hits
- `packages/web/src/components/landing/LandingDanceCardMock.tsx`: 1 hits

### `white/` opacity overlays (glass idiom — off-token)

- `packages/web/src/app/calendar/erobay-community/ErobayMirrorTimeline.tsx`
- `packages/web/src/app/calendar/erobay-community/page.tsx`
- `packages/web/src/app/conventions/[slug]/dancecard/s/[token]/page.tsx`
- `packages/web/src/app/events/[id]/EventDetailClient.tsx`
- `packages/web/src/app/events/[id]/page.tsx`
- `packages/web/src/app/globals.css`
- `packages/web/src/app/home/page.tsx`
- `packages/web/src/app/orgs/[slug]/OrgHubClient.tsx`
- `packages/web/src/app/profile/page.tsx`
- `packages/web/src/components/cards/LocalPostCard.tsx`

### `bg-black/` scrims

- `packages/web/src/app/connections/ConnectionsPageClient.tsx`
- `packages/web/src/app/email/unsubscribe/page.tsx`
- `packages/web/src/app/events/[id]/EventDetailClient.tsx`
- `packages/web/src/app/orgs/[slug]/OrgHubClient.tsx`
- `packages/web/src/app/vendors/[id]/page.tsx`
- `packages/web/src/components/cards/VendorCard.tsx`
- `packages/web/src/components/conventions/ChannelComposer.tsx`
- `packages/web/src/components/conventions/ConventionGalleryGrid.tsx`
- `packages/web/src/components/conventions/DancecardOpsCard.tsx`
- `packages/web/src/components/conventions/DancecardScheduleEmbed.tsx`

## Spacing, radius, shadow

| Token | Value | Tailwind bridge | TSX usage |
|-------|-------|-----------------|-----------|
| `--c2k-space-1…6` | 4–24px | `c2k-1…c2k-6` | **unused** — components use default Tailwind scale |
| `--c2k-card-radius` | 1rem | `rounded-c2k-card` | **unused** — `rounded-xl` / `rounded-2xl` dominate |
| `--c2k-shadow-soft` | subtle | `shadow-c2k-soft` | **unused** |
| `--dc-shadow-*` | panel/tab shadows | arbitrary `shadow-[var(--dc-shadow-soft)]` | primary pattern |

## Layout chrome tokens

- `--c2k-header-h`, `--c2k-bottom-nav-h`, `--c2k-bottom-nav-total-h` — mobile safe-area helpers in globals.css
- Classes: `.safe-area-pb`, `.c2k-main-mobile-pb`, `.c2k-fixed-above-bottom-nav`

## Stale / duplicate files

| File | Issue |
|------|-------|
| `tailwind.config.js` | Root config references non-existent src/pages; not used by web package |
| `packages/web/src/globals.css` | Older duplicate; main.tsx imports app/globals.css instead |

## Normalization recommendations (audit-only, execution order)

1. **Stop adding `--c2k-*`** — new UI uses `--dc-*` only (per C2K-DESIGN-SYSTEM.md).
2. **Consolidate landing** — wire `--pub-*` marketing pages to appearance provider or document permanent split.
3. **Replace `white/` and `black/` scrims** with semantic overlay tokens.
4. **Remove or wire Tailwind `c2k-*` extensions** — currently dead config.
5. **Unify dancecard + ui primitives** before template migration (Button, Panel, Confirm).
6. **Update stale Inter references** in docs and delete unused globals.css duplicate.

## Key source files

- [`packages/web/src/app/globals.css`](packages/web/src/app/globals.css)
- [`packages/web/src/styles/dancecard-tokens.css`](packages/web/src/styles/dancecard-tokens.css)
- [`packages/web/src/styles/dancecard-parity.css`](packages/web/src/styles/dancecard-parity.css)
- [`packages/web/src/styles/dancecard-motion.css`](packages/web/src/styles/dancecard-motion.css)
- [`packages/web/src/styles/site-atmosphere.css`](packages/web/src/styles/site-atmosphere.css)
- [`packages/web/src/components/landing/public-auth.css`](packages/web/src/components/landing/public-auth.css)
- [`packages/web/src/lib/dancecard/appearancePresets.ts`](packages/web/src/lib/dancecard/appearancePresets.ts)
- [`packages/web/src/lib/dancecard/appearanceThemeBuilder.ts`](packages/web/src/lib/dancecard/appearanceThemeBuilder.ts)
- [`packages/web/tailwind.config.js`](packages/web/tailwind.config.js)
- [`packages/web/index.html`](packages/web/index.html)
