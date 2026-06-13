# C2K Design Tokens

**Purpose:** Semantic token reference for color, spacing, typography, elevation, z-index, and motion.

**Canon:** Theme contract and hard rejections → [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md). This doc adds tables, Tailwind mapping, and migration notes.

**When to use:** Building or refactoring components, defining Tailwind/CSS variables, or reviewing contrast.

---

## Token families (read first)

| Family | Status | Use in new UI |
|--------|--------|----------------|
| **`--dc-*`** | **Primary** | Member/community surfaces under `DancecardAppearanceProvider` (`dc-gold-chrome`) |
| **`--ecke-*`** | Bridge | Links and focus rings inside `--dc-*` themes |
| **`--c2k-*`** | Legacy migration | Unmigrated routes and `:root` fallbacks only — do not add new usage |
| **Primitives** (gray/teal table below) | Reference | Describes legacy `:root` teal theme; map into `--dc-*` for new work |

**Member Settings themes** (12): midnight-brass (default), midnight-teal, obsidian-purple, emerald-night, crimson-classic, steel-blue, copper-dungeon, sapphire-night, dark-rose, gunmetal-orange, parchment, lifted-ink.

**Organizer / specialty** (not all in member picker): coastal-slate (organizer embed default), high-noon (bright outdoor).

**Source files**

| File | Role |
|------|------|
| `packages/web/src/lib/dancecard/appearancePresets.ts` | Preset definitions + member/organizer defaults |
| `packages/web/src/lib/dancecard/appearanceThemeBuilder.ts` | Builds full `--dc-*` set from compact dark palettes |
| `packages/web/src/components/dancecard/DancecardAppearanceContext.tsx` | `DancecardAppearanceProvider` — applies inline vars on `dc-gold-chrome` |
| `packages/web/src/styles/dancecard-tokens.css` | CSS fallback (coastal-slate) for `[data-dc-theme='event']` |
| `packages/web/src/styles/dancecard-motion.css` | Tab/panel/skeleton motion |
| `packages/web/src/app/globals.css` | Legacy `:root` `--c2k-*`, organizer vars, scrollbar/focus base rules |
| `packages/web/tailwind.config.js` | **Active** Tailwind config — `dc.*` and `c2k.*` color/spacing utilities; `maxWidth.shell-wide` (1920px), `shell-feed` (1440px) |
| `tailwind.config.js` (repo root) | **Deprecated** — stale Next.js-era config; not used by Vite build |
| `packages/web/src/components/landing/public-auth.css` | `--pub-*` tokens scoped to `.public-page` (landing / public auth) |

---

## Principles

1. **Semantic over literal** — Prefer `text-dc-text-muted` over raw gray hex in components.
2. **Three tiers** — Primitives → semantic aliases (`--dc-*`) → component-scoped tokens.
3. **Theme by remap** — Presets swap `--dc-*` values; component class names stay stable.
4. **4px rhythm** — Spacing derives from a 4px base (`--c2k-space-*` on legacy paths).

---

## 1. Color primitives (reference)

Approximate **OKLCH** targets for future-proofing. Hex values match legacy `:root` in `globals.css` (teal/cyan dark theme).

| Token | Hex | OKLCH (approx) | Notes |
|-------|-----|----------------|-------|
| `gray-950` | `#0f0f0f` | `oklch(14% 0 0)` | App background (`--c2k-bg`) |
| `gray-900` | `#1a1a1a` | `oklch(18% 0 0)` | Cards (`--c2k-bg-card`) |
| `gray-850` | `#252525` | `oklch(22% 0 0)` | Elevated (`--c2k-bg-elevated`) |
| `gray-800` | `#2d2d2d` | `oklch(26% 0 0)` | Charcoal (`--c2k-bg-charcoal`) |
| `teal-500` | `#14b8a6` | `oklch(65% 0.12 180)` | Legacy primary accent |
| `teal-600` | `#0d9488` | `oklch(55% 0.12 180)` | Legacy primary hover |
| `cyan-400` | `#22d3ee` | `oklch(78% 0.12 220)` | Legacy secondary accent |
| `cyan-500` | `#06b6d4` | `oklch(68% 0.12 220)` | Legacy secondary hover |
| `white` | `#ffffff` | `oklch(100% 0 0)` | Primary text |
| `gray-400` | `#a3a3a3` | `oklch(72% 0 0)` | Secondary text |
| `gray-500` | `#737373` | `oklch(58% 0 0)` | Muted text |

### Semantic intent colors

| Intent | Hex (`globals.css`) | Tailwind `c2k.*` |
|--------|---------------------|------------------|
| Success | `#10b981` | `c2k-success` / `dc-success` (preset-specific) |
| Warning | `#f59e0b` | `c2k-warning` / `dc-warning` |
| Error | `#ef4444` | `c2k-danger` / `dc-danger` |

Dark community presets use lighter semantic hues from `appearanceThemeBuilder.ts` (e.g. `#f87171` danger).

---

## 2. Semantic tokens

### Primary — `--dc-*` (member UI)

Set per preset on `.dc-gold-chrome[data-dc-appearance='…']` via inline `style` from `DancecardAppearanceProvider`. Full contract: [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md).

| Group | CSS variables |
|-------|---------------|
| Surfaces | `--dc-surface`, `--dc-surface-muted`, `--dc-surface-card`, `--dc-elevated`, `--dc-elevated-solid`, `--dc-elevated-muted`, `--dc-elevated-hover`, `--dc-input` |
| Text | `--dc-text`, `--dc-text-muted`, `--dc-text-subtle`, `--dc-muted` |
| Accent | `--dc-accent`, `--dc-accent-hover`, `--dc-accent-muted`, `--dc-accent-border`, `--dc-accent-foreground` |
| Borders | `--dc-border-subtle`, `--dc-border-strong` |
| Feedback | `--dc-danger`, `--dc-danger-muted`, `--dc-danger-border`, `--dc-success`, `--dc-success-muted`, `--dc-warning`, `--dc-warning-muted` |
| Shadows & tabs | `--dc-shadow-soft`, `--dc-shadow-panel`, `--dc-glass-shadow`, `--dc-glass-inset`, `--dc-tab-shell-shadow`, `--dc-tab-inactive-bg`, `--dc-tab-inactive-hover-bg`, `--dc-tab-active-shadow`, `--dc-chip-bg`, `--dc-chip-hover-bg` |
| ECKE bridge | `--ecke-link`, `--ecke-link-visited`, `--ecke-focus`, `--ecke-focus-ring` |

**Default midnight-brass** (Black Gold): background `#121212`, card `#1e1e1e`, accent `#d4af37` — built by `buildDarkCommunityVars()`.

### Legacy — `--c2k-*` (migration)

`:root` in [`packages/web/src/app/globals.css`](../../packages/web/src/app/globals.css):

| CSS variable | Role |
|--------------|------|
| `--c2k-bg` | Page background |
| `--c2k-bg-card` | Card / panel background |
| `--c2k-bg-elevated` | Modals, popovers, raised surfaces |
| `--c2k-bg-charcoal` | Nested chrome, input areas |
| `--c2k-accent-primary` | Links, primary buttons, focus ring |
| `--c2k-accent-primary-hover` | Primary hover |
| `--c2k-accent-secondary` | Secondary CTAs, highlights |
| `--c2k-accent-secondary-hover` | Secondary hover |
| `--c2k-text-primary` | Headings, body on dark |
| `--c2k-text-secondary` | Supporting text |
| `--c2k-text-muted` | Meta, placeholders |
| `--c2k-border` | Default border |
| `--c2k-border-strong` | Emphasized border |
| `--c2k-overlay-scrim` | Modal scrim |
| `--c2k-focus-ring` | Focus (aliases accent primary) |
| `--c2k-danger`, `--c2k-success`, `--c2k-warning` | Semantic feedback |
| `--c2k-space-1` … `--c2k-space-6` | 4px rhythm spacing |
| `--c2k-card-radius` | Default card corner radius (1rem) |
| `--c2k-shadow-soft` | Card elevation shadow |
| `--c2k-scrollbar-track`, `--c2k-scrollbar-thumb`, `--c2k-scrollbar-thumb-hover` | Scrollbar colors |
| `--c2k-header-h`, `--c2k-community-nav-h` | Stacked sticky chrome heights |
| `--c2k-sticky-below-header`, `--c2k-sticky-below-community-nav` | `calc()` sticky offsets |

### Organizer shell (scoped)

| CSS variable | Role | CP2 bridge |
|--------------|------|------------|
| `--organizer-sidebar-width` | Sidebar width (15rem) | **Deferred** — layout |
| `--organizer-panel-bg` | Panel background | `var(--dc-elevated-solid, #1e1e1e)` |
| `--organizer-panel-padding-y`, `--organizer-panel-padding-x` | Panel padding | **Deferred** — layout |
| `--organizer-status-draft` | Draft status label | `var(--dc-warning, #f59e0b)` |
| `--organizer-status-published` | Published status label | `var(--dc-success, #10b981)` |
| `--organizer-status-stale` | Stale status label | `var(--dc-danger, #ef4444)` |
| `--organizer-status-never` | Never-run status label | `var(--dc-text-muted, #9ca3af)` |

`.organizer-shell` overrides `--c2k-text-secondary` → `#c4c4c4`, `--c2k-text-muted` → `#9ca3af` — **deferred** (density / program grids).

**Deferred organizer risks:** program grids, schedule canvases, door mode, Discord-style embeds, and sidebar width still use organizer-specific values or hardcoded hex. Broad `--organizer-*` → `--dc-*` conversion is a later sprint item.

### Public landing / auth — `--pub-*` (isolated)

Scoped under `.public-page` in `public-auth.css` (imported from `app/page.tsx` only). **Do not** use `--pub-*` or `public-auth.css` classes in authenticated app chrome.

| CSS variable | Role |
|--------------|------|
| `--pub-bg`, `--pub-bg-soft`, `--pub-panel` | Landing background layers |
| `--pub-border`, `--pub-border-strong` | Card and panel borders |
| `--pub-text`, `--pub-text-muted`, `--pub-text-soft` | Landing copy hierarchy |
| `--pub-gold`, `--pub-gold-bright` | Brand gold on public pages |
| `--pub-red`, `--pub-purple`, `--pub-blue` | Accent gradients on landing |
| `--font-ui`, `--font-display` | Manrope / Sora on `.public-page` only |

`LoginCard` uses `--pub-*` when `landing={true}`; authenticated login surfaces use `dc-*` utilities instead.

---

## 3. Tailwind mapping

From [`packages/web/tailwind.config.js`](../../packages/web/tailwind.config.js). **New UI:** prefer `dc-*` utilities (resolve to `var(--dc-*)`).

### `dc.*` (primary)

| Semantic concept | Tailwind class |
|------------------|----------------|
| Page background | `bg-dc-surface` |
| Inset / muted surface | `bg-dc-surface-muted` |
| Card surface (dark community presets) | `--dc-surface-card` — `ring-[var(--dc-surface-card)]` / `ring-offset-[var(--dc-surface-card)]` (CSS var only; not in `tailwind.config.js` yet) |
| Card / panel | `bg-dc-elevated`, `bg-dc-elevated-solid`, `bg-dc-elevated-muted`, `hover:bg-dc-elevated-hover` |
| Input field | `bg-dc-input` or `bg-[var(--dc-input)]` |
| Text | `text-dc-text`, `text-dc-text-muted`, `text-dc-text-subtle`, `text-dc-muted` |
| Accent | `text-dc-accent`, `bg-dc-accent`, `border-dc-accent`, `text-dc-accent-foreground`, `bg-dc-accent-muted`, `border-dc-accent-border`, `hover:*` with `dc-accent-hover` |
| Borders | `border-dc-border`, `border-dc-border-subtle`, `border-dc-border-strong` |
| Feedback | `text-dc-danger`, `bg-dc-danger-muted`, `border-dc-danger-border`, `text-dc-success`, `bg-dc-success-muted`, `text-dc-warning`, `bg-dc-warning-muted` |
| Focus (base layer) | `outline-dc-accent` on interactive elements |
| Focus (components) | `ring-[var(--ecke-focus-ring)]` |
| Z-index | `z-dc-chrome` (40), `z-dc-toast` (80), `z-dc-modal` (90), `z-dc-confirm` (95) |
| Typography | `text-dc-micro` |
| Touch targets | `min-h-touch`, `min-w-touch` (2.75rem) |

Shadows and tab chrome are typically referenced as arbitrary values: `shadow-[var(--dc-shadow-soft)]`, `shadow-[var(--dc-tab-active-shadow)]`.

### `c2k.*` (legacy migration)

| Semantic concept | Tailwind class |
|------------------|----------------|
| Page background | `bg-c2k-bg` |
| Card | `bg-c2k-bg-card` |
| Elevated | `bg-c2k-bg-elevated` |
| Charcoal | `bg-c2k-bg-charcoal` |
| Primary accent | `text-c2k-accent-primary`, `bg-c2k-accent-primary`, `border-c2k-accent-primary` |
| Primary hover | `hover:*` with `c2k-accent-primary-hover` |
| Secondary accent | `c2k-accent-secondary`, `c2k-accent-secondary-hover` |
| Text | `text-c2k-text-primary`, `text-c2k-text-secondary`, `text-c2k-text-muted` |
| Borders | `border-c2k-border`, `border-c2k-border-strong` |
| Overlay / focus / feedback | `bg-c2k-overlay`, `ring-c2k-focus-ring`, `text-c2k-danger`, `text-c2k-success`, `text-c2k-warning` |
| Spacing | `p-c2k-1` … `p-c2k-6`, `gap-c2k-*`, etc. |
| Card radius | `rounded-c2k-card` |
| Soft shadow | `shadow-c2k-soft` |
| Display type | `text-c2k-display`, `text-c2k-body`, `text-c2k-meta` |

**Rule:** New member UI uses `dc-*` utilities and `--dc-*` variables — avoid raw hex in JSX except in token definition files.

---

## 4. Spacing scale (4px base)

| Token | Value | Tailwind (legacy) | Typical use |
|-------|-------|-------------------|-------------|
| `space-0` | 0 | — | Reset |
| `space-0.5` | 2px | — | Hairline |
| `space-1` / `--c2k-space-1` | 4px | `p-c2k-1` / `p-1` | Tight inline |
| `space-2` / `--c2k-space-2` | 8px | `p-c2k-2` / `p-2` | Icon gaps |
| `space-3` / `--c2k-space-3` | 12px | `p-c2k-3` / `p-3` | Compact cards |
| `space-4` / `--c2k-space-4` | 16px | `p-c2k-4` / `p-4` | **Default** card padding |
| `space-5` / `--c2k-space-5` | 20px | `p-c2k-5` / `p-5` | Comfortable padding |
| `space-6` / `--c2k-space-6` | 24px | `p-c2k-6` / `p-6` | Section gaps |
| `space-8` | 32px | `p-8` | Large gaps |
| `space-10` | 40px | `p-10` | Page sections |
| `space-12` | 48px | `p-12` | Major dividers |
| `space-16` | 64px | `p-16` | Hero / landing |

**Page gutters:** `px-4` mobile → `px-6` tablet → `px-8` desktop unless a layout doc specifies otherwise.

---

## 5. Typography scale

**Runtime fonts:** **Manrope** (UI / body) and **Sora** (display). Loaded via Google Fonts in `packages/web/index.html`; CSS variables on `:root` in `packages/web/src/app/globals.css` (`--c2k-font-ui`, `--c2k-font-display`, `--font-body`, `--font-display`). Tailwind `font-sans` → Manrope; `font-display` and legacy `font-serif` (organizer/dancecard) → Sora.

| Tailwind class | Stack | Use |
|----------------|-------|-----|
| `font-sans` | Manrope | Feeds, forms, nav, messages, settings |
| `font-display` | Sora | Heroes, section headers, card titles, brand lockups |

See `packages/web/src/lib/fonts.ts` for the canonical token export.

**Stale references:** Repo root `tailwind.config.js` and unused `packages/web/src/globals.css` still list Inter — neither is the active build path.

| Token | Size | Line height | Weight | Use |
|-------|------|-------------|--------|-----|
| `text-xs` / `text-dc-micro` | 12px / 11px | 1.5 / 1rem | 400 | Captions, badges |
| `text-sm` / `text-c2k-body` | 14px | 1.5 / 1.25rem | 400 | Meta, secondary |
| `text-base` | 16px | 1.5 | 400 | **Body minimum** |
| `text-lg` | 18px | 1.5 | 500 | Emphasis |
| `text-xl` / `text-c2k-display` | 20px / 24px | 1.4 / 2rem | 600 | Section titles |
| `text-2xl` | 24px | 1.3 | 600 | Page titles |
| `text-3xl` | 30px | 1.2 | 700 | Hero |
| `text-4xl` | 36px | 1.2 | 700 | Marketing |

Dancecard session titles use `.dc-session-title` (serif stack) from `dancecard-parity.css`.

---

## 6. Border radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 0.25rem (4px) | Chips, small controls |
| `radius-md` | 0.5rem (8px) | Inputs, buttons (`rounded-lg`) |
| `radius-lg` | 0.75rem (12px) | Nested cards |
| `rounded-c2k-card` / `--c2k-card-radius` | 1rem (16px) | **Default cards** (`rounded-2xl` also common on `dc-*` routes) |

---

## 7. Elevation (shadows)

| Token | Value |
|-------|--------|
| `--c2k-shadow-soft` / `shadow-c2k-soft` | `0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `--dc-shadow-soft` | Preset-specific (e.g. `0 12px 32px rgba(0,0,0,0.35)` on dark community themes) |
| `--dc-shadow-panel` | Deeper panel / lifted embed shadow |

**Dark UI note:** Prefer **surface lightness steps** (`bg-dc-elevated` vs `bg-dc-surface-muted`) over heavy shadows.

---

## 8. Z-index scale

Named layers in Tailwind (`dc-*`) and layout docs:

| Layer | Z-index | Examples |
|-------|---------|----------|
| Base | 0 | Default stacking |
| Sticky | 10 | Sticky subheaders |
| `dc-chrome` | 40 | Community tab shells |
| Dropdown | 100 | Menus, popovers |
| Header | 200 | App header |
| Modal backdrop | 300 | Scrim |
| `dc-toast` | 80 | Toasts (Tailwind token) |
| `dc-modal` | 90 | Dialog |
| `dc-confirm` | 95 | Confirm dialogs |
| Toast (legacy doc) | 500 | Prefer `z-dc-toast` in new code |

---

## 9. Motion

| Token / class | Value | Use |
|---------------|-------|-----|
| `duration-instant` | 100ms | Press feedback |
| `duration-fast` | 150ms | Menus, toggles |
| `duration-normal` | 200ms | Default transition; `dc-tab-content-enter` |
| `duration-slow` | 300ms | Modals, large panels |
| `.dc-panel-enter` | 280ms ease-out | Panel enter |
| `.dc-skeleton-bone` | 1.25s shimmer | Loading placeholders |
| `c2k-route-pending` | view-transition bar | Route pending indicator (`globals.css`) |
| `c2k-view-transition-in/out` | 200ms | View transitions when motion allowed |
| `animate-fade-in` | 0.5s ease-out | Landing emphasis |

**Always respect** `prefers-reduced-motion` (`dancecard-motion.css` and `globals.css` disable animations when reduced).

---

## Do / Don't

| Do | Don't |
|----|--------|
| Use `dc-*` / `--dc-*` on member routes under `DancecardAppearanceProvider` | Add new `--c2k-*` or `c2k.*` usage on migrated pages |
| Use `ring-[var(--ecke-focus-ring)]` or `outline-dc-accent` for focus | Sprinkle one-off hex colors in components |
| Keep body text ≥ 16px | Use 12px for long reading text |
| Pair color with icon/text for state (error/success) | Rely on color alone |

---

## C2K-specific

- **New UI:** `--dc-*` + Tailwind `dc.*` — see [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md).
- **Legacy routes:** `--c2k-*` / `c2k.*` until migrated; teal/cyan primitives describe the old `:root` theme only.
- **Organizer surfaces:** Denser layout; coastal-slate preset for embedded grids; same `dc-*` families with tighter spacing per [03-COMPONENT_LIBRARY.md](./03-COMPONENT_LIBRARY.md).

---

## References

- [C2K-DESIGN-SYSTEM.md](../C2K-DESIGN-SYSTEM.md) — binding theme contract
- [DESIGN_SYSTEM_RESEARCH.md](../DESIGN_SYSTEM_RESEARCH.md) — Token architecture (industry evidence)
- [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) — Color, type, motion context
- [../DESIGN_BIBLE.md](../DESIGN_BIBLE.md) — Index
