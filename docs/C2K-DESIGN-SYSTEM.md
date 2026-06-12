# C2K Design System

**Last updated:** 2026-06-06 (`--dc-*` primary; `--c2k-*` legacy aliases in `globals.css`)

**Public brand:** Visual system applies to **Kink Social** (kink.social). Filename and `--c2k-*` token prefix remain internal codename artifacts — do not rename tokens in this pass.

Imported baseline from `C:\Users\shkin\Downloads\C2K-DESIGN-SYSTEM.md` for in-repo reference during the UI/UX refactor program.

## Purpose

Defines Kink Social visual language (internal doc/filename: C2K), theme contracts, token naming, component patterns, typography/spacing rules, and anti-patterns.

## Canonical theme contract

Use CSS variables only, never hardcoded hex inside components.

### Primary — `--dc-*` (member / community UI)

Applied by `DancecardAppearanceProvider` on the `dc-gold-chrome` root (`data-dc-theme="event"`, `data-dc-appearance={presetId}`). Preset values live in `packages/web/src/lib/dancecard/appearancePresets.ts`; dark community palettes are built by `appearanceThemeBuilder.ts`.

**Surfaces**

- `--dc-surface`, `--dc-surface-muted`, `--dc-surface-card` (dark community presets)
- `--dc-elevated`, `--dc-elevated-solid`, `--dc-elevated-muted`, `--dc-elevated-hover`
- `--dc-input`

**Text**

- `--dc-text`, `--dc-text-muted`, `--dc-text-subtle`, `--dc-muted`

**Accent**

- `--dc-accent`, `--dc-accent-hover`, `--dc-accent-muted`, `--dc-accent-border`, `--dc-accent-foreground`

**Borders**

- `--dc-border-subtle`, `--dc-border-strong`

**Semantic feedback**

- `--dc-danger`, `--dc-danger-muted`, `--dc-danger-border`
- `--dc-success`, `--dc-success-muted`
- `--dc-warning`, `--dc-warning-muted`

**Elevation & chrome**

- `--dc-shadow-soft`, `--dc-shadow-panel`
- `--dc-glass-shadow`, `--dc-glass-inset`
- `--dc-tab-shell-shadow`, `--dc-tab-inactive-bg`, `--dc-tab-inactive-hover-bg`, `--dc-tab-active-shadow`
- `--dc-chip-bg`, `--dc-chip-hover-bg`

**Dancecard / compare (domain)**

- `--dc-slot-published`, `--dc-slot-accent-mix`
- `--dc-compare-mutual`, `--dc-compare-busy`, `--dc-compare-busy-ring`, `--dc-compare-host-only`, `--dc-compare-host-only-ring`, `--dc-compare-outside`, `--dc-compare-selected`
- `--dc-avail-open-bg`, `--dc-avail-open-border`, `--dc-avail-open-text`, `--dc-avail-busy-bg`, `--dc-avail-busy-border`, `--dc-avail-busy-text`, `--dc-avail-claimed-bg`, `--dc-avail-claimed-border`, `--dc-avail-claimed-text`

**ECKE bridge (links & focus)**

- `--ecke-link`, `--ecke-link-visited`, `--ecke-focus`, `--ecke-focus-ring`

CSS fallbacks for embedded organizer islands: `packages/web/src/styles/dancecard-tokens.css` (coastal-slate). Motion utilities: `dancecard-motion.css`.

### Legacy — `--c2k-*` (migration only)

Defined in `:root` at `packages/web/src/app/globals.css`. Use only on routes not yet under `dc-gold-chrome` / `--dc-*`. Do not add new `--c2k-*` usage.

- `--c2k-bg`, `--c2k-bg-card`, `--c2k-bg-elevated`, `--c2k-bg-charcoal`
- `--c2k-accent-primary`, `--c2k-accent-primary-hover`, `--c2k-accent-secondary`, `--c2k-accent-secondary-hover`
- `--c2k-text-primary`, `--c2k-text-secondary`, `--c2k-text-muted`
- `--c2k-border`, `--c2k-border-strong`, `--c2k-overlay-scrim`, `--c2k-focus-ring`
- `--c2k-danger`, `--c2k-success`, `--c2k-warning`
- `--c2k-space-1` … `--c2k-space-6`, `--c2k-card-radius`, `--c2k-shadow-soft`
- `--c2k-scrollbar-track`, `--c2k-scrollbar-thumb`, `--c2k-scrollbar-thumb-hover`
- `--c2k-header-h`, `--c2k-community-nav-h`, `--c2k-sticky-below-header`, `--c2k-sticky-below-community-nav`

**Organizer shell** (scoped, not `--c2k-*` prefixed): `--organizer-sidebar-width`, `--organizer-panel-bg`, `--organizer-panel-padding-y`, `--organizer-panel-padding-x`, `--organizer-status-draft`, `--organizer-status-published`, `--organizer-status-stale`, `--organizer-status-never`. `.organizer-shell` remaps `--c2k-text-secondary` and `--c2k-text-muted` for denser console contrast.

## Theme application

| Context | Provider | Default preset | Notes |
|---------|----------|----------------|-------|
| Member site | `AppProviders` → `DancecardAppearanceProvider` | **midnight-brass** (Black Gold) | `MEMBER_DANCECARD_APPEARANCE_PRESETS` — 12 themes in Settings |
| Organizer embed | Nested provider, often `wrapChrome={false}` | **coastal-slate** | `ORGANIZER_DANCECARD_APPEARANCE` |
| CSS fallback | `.dc-gold-chrome[data-dc-theme='event']` | coastal-slate values | Before hydration / embedded islands |

**Member Settings themes** (`MEMBER_SITE_APPEARANCE_IDS`): midnight-brass, midnight-teal, obsidian-purple, emerald-night, crimson-classic, steel-blue, copper-dungeon, sapphire-night, dark-rose, gunmetal-orange, parchment, lifted-ink.

**Organizer / specialty** (full preset list, not all in member picker): coastal-slate, high-noon.

When `.dc-gold-chrome` is present, `body` and focus rings use `--dc-*` (see `globals.css` `@layer base`).

## Core style rules

- Cards and panels: `rounded-xl` or `rounded-2xl`, subtle border, subtle shadow (`shadow-[var(--dc-shadow-soft)]`).
- Buttons: `rounded-lg`, primary/secondary/ghost variants, visible focus ring (`--ecke-focus-ring` or `outline-dc-accent`).
- Tabs: shell + active/inactive pattern (`--dc-tab-*` tokens), consistent hover/focus states.
- Section labels: compact uppercase tracked labels; avoid heavy heading blocks where not needed.
- Inputs: `border-dc-border`, `bg-dc-elevated-solid` or `bg-[var(--dc-input)]`; no browser-default visual mismatch.
- Empty states: explicit copy + optional CTA, never blank gaps.

## Layout rules

- Community-facing pages: spacious, mostly single-column with constrained width.
- Organizer surfaces: denser, keyboard-friendly, multi-panel where needed.
- Mobile-first for all key workflows (especially organizer/door).

## Hard rejections

- No component-local hardcoded hex.
- No `bg-white`/`bg-black` for themed UI surfaces.
- No `font-bold`-heavy UI language.
- No arbitrary new themes outside `appearancePresets.ts`.
- No dramatic/drop-shadow-heavy styling.
- No new `--c2k-*` or Tailwind `c2k.*` on migrated member routes.

## Cross-reference map

- **Index:** [`docs/DESIGN_BIBLE.md`](./DESIGN_BIBLE.md)
- **As-built routes/UX debt:** [`docs/GPT_UI_DESIGN_CONTEXT.md`](./GPT_UI_DESIGN_CONTEXT.md)
- Token detail: [`docs/design/08-DESIGN_TOKENS.md`](./design/08-DESIGN_TOKENS.md)
- Component composition: [`docs/design/03-COMPONENT_LIBRARY.md`](./design/03-COMPONENT_LIBRARY.md)
- Privacy UI language: [`docs/design/06-PRIVACY_AND_TRUST.md`](./design/06-PRIVACY_AND_TRUST.md)

## Refactor usage

This file is the project-level anchor for the phased UI/UX refactor. Where this file and `docs/design/*` overlap, **this file wins on theme contract and hard rejections**; topic docs win on domain-specific layout and IA detail.
