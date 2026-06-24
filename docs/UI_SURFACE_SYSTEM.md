# UI Surface System

The authenticated `packages/web` app uses **one** dark surface system built on the
`dc` design tokens (Midnight Velvet / Event appearance). This document is the
canonical reference for surfaces, layering, menus, text, and accent usage.

> This is a **consolidation**, not a second design system. Do not introduce a new
> theme, a parallel token set, or per-page surface forks. Extend the helpers below.

## Where the system lives

| Concern | File |
|---|---|
| Surface helper classes | `packages/web/src/lib/card-surface.ts` |
| Tokens (`--dc-*`) — fallbacks | `packages/web/src/styles/dancecard-tokens.css` |
| Live appearance presets | `packages/web/src/lib/dancecard/appearancePresets.ts` (via `AppProviders` → `DancecardAppearanceProvider`) |
| Tailwind `dc` colors + z-index | `packages/web/tailwind.config.js` |
| Cross-breakpoint surface CSS | `packages/web/src/styles/shared-surfaces.css` |
| Desktop (lg+) depth polish | `packages/web/src/styles/desktop-surfaces.css` |
| Buttons / chips / inputs / sheets | `packages/web/src/styles/premium-surfaces.css` |
| App atmosphere (page background) | `packages/web/src/styles/site-atmosphere.css` |
| Shell width / overflow contracts | `packages/web/src/lib/shell-contract.ts` |

## Surface ladder

Reach for these in order. Cards must always stay **visibly distinct** from the page.

| Rung | Use for | Helper (`card-surface.ts`) | Backing |
|---|---|---|---|
| **page** | App background + atmosphere only. No important text on glow. | `site-atmosphere` markup | `--dc-surface` |
| **base** | Normal content cards, most page sections. | `cardSurfaceBaseClass` | opaque `bg-dc-elevated-solid` + readable border |
| **elevated** | Profile hero, feed composer, key dashboards, dialogs, rails. | `cardSurfaceElevatedClass` | `bg-dc-elevated-solid` + heavier border + panel shadow |
| **nested** | Photo tiles, settings rows, media previews, compact inner panels. | `surfaceNestedClass` | recessed `bg-dc-surface-muted` |
| **interactive** | Hover/focus directory + feed cards. | `cardSurfaceInteractiveClass` (`dc-card-polish`) | adds hover/focus border + lift |
| **rail** | Right-rail section cards / left-rail nav shells. | `railSurfaceCardClass`, `railNavShellClass`, `railAsideClass` (+ `RailCard`) | opaque rail gradient |
| **feed** | Home feed post / activity cards. | `cardSurfaceFeedClass`, `cardSurfaceFeedActivityClass` | opaque, rail-matched |

### Rules

- **Do not** use near-invisible one-offs on important cards:
  `bg-dc-elevated/20`–`/60`, `bg-dc-elevated/[0.x]`, `bg-dc-surface-muted/20`,
  `border-dc-border/20`, or `border-white/[0.06]`-as-card-border. These produce the
  washed-out "cards blend into the background" look. Use a ladder helper instead.
- `border-white/[0.05–0.07]` is fine **only** as a subtle inset `ring`/divider on top
  of an already-opaque surface — never as the sole card fill+border.
- Keep the dark, elegant style: charcoal/navy surfaces, velvet-rose accent, calm — not neon.
- **Accent is sparse**: primary CTAs, active states, links, small role pills. Never as a
  card background for body content.

## Canonical components

| Need | Component |
|---|---|
| Generic card / panel | `components/ui/Card.tsx` |
| Hub/detail section shell | `components/ui/ContentSection.tsx` (`cardSurfaceBaseClass`) |
| Right-rail section | `components/ui/RailCard.tsx` |
| Button (primary / secondary / ghost / danger) | `components/ui/Button.tsx` |
| Modal / bottom sheet | `components/ui/Dialog.tsx` (portals to `document.body`) |
| Empty state | `components/ui/EmptyState.tsx` |
| Form input | `premiumInputClass` / `FormField` (`dc-premium-input`) |
| Chips / filter pills | `.dc-chip` (premium-surfaces.css) |
| Tabs | `c2k-community-tab*` / `TabShell` |
| Three-dot / copy-link menu | `components/ui/CopyLinkOverflowMenu.tsx` (portaled) |

## Text hierarchy

| Token class | Use |
|---|---|
| `text-dc-text` | Primary text, headings, card titles |
| `text-dc-text-muted` | Body copy, secondary lines |
| `text-dc-muted` | Meta, timestamps, captions, eyebrows |
| `text-dc-accent` | Links, active nav, small emphasis |

Headings use the display face (Sora) automatically; body uses Manrope. Do not hardcode
hex colors — always use `dc` text tokens so they track the active appearance.

## Layering / z-index contract

Use the **named** Tailwind z tokens. **Never** use `z-[9999]` or ad-hoc raw z-index.
Base content is `0` (no token needed).

| Layer | Token | Value |
|---|---|---|
| Sticky rails / in-column sticky | `z-dc-sticky` | 30 |
| Header / top chrome | `z-dc-chrome` | 40 |
| Secondary nav / route-pending bar | `z-dc-subnav` | 45 |
| Dropdowns, popovers, menus, three-dot menus | `z-dc-dropdown` | 100 |
| Tooltips | `z-dc-tooltip` | 120 |
| Modal / dialog / sheet scrim | `z-dc-modal-backdrop` | 200 |
| Modal / dialog / bottom sheet panel | `z-dc-modal` | 210 |
| Confirm dialog over a modal | `z-dc-confirm` | 220 |
| Toasts / transient status | `z-dc-toast` | 300 |
| Command palette / critical overlay | `z-dc-critical` | 400 |

Because the header is `z-dc-chrome` (40), every modal (`z-dc-modal` = 210) correctly
renders **above** the header. Menus (`z-dc-dropdown`) sit above page content and sticky
rails, but below modals.

## Dropdown / portal rules

- Menus must never appear behind cards, feed posts, heroes, rails, sticky nav, or shells.
- Any popover/menu that lives **inside** a card (which may be `overflow-hidden`) must be
  rendered with `createPortal(…, document.body)` and positioned to its trigger
  (see `CopyLinkOverflowMenu`). Do not rely on `absolute` inside a clipped parent.
- Header dropdowns are `absolute` inside the header, which is intentionally
  `overflow-visible` via `shellHeaderClass` — **do not** swap the header to
  `shellWideClass`/`overflow-x-hidden`, which would clip them.
- Watch for `transform`, `filter`, `backdrop-filter`, `opacity`, `isolation`, and
  `overflow-hidden` creating stacking contexts around a menu trigger.

## Mobile safety rules

- Preserve mobile layout: profile/feed stack into a single column and stay touch-friendly
  (≥ 44px / `min-h-touch` targets).
- Mobile menus render as portaled bottom sheets at `z-dc-modal`.
- Verify changes at 390px width; mobile-only utilities live in `mobile-polish.css` and any
  edit there requires a mobile screenshot check.

## Files that must NOT be edited for new UI work

- **`/src` at the repo top level** — pre-Vite historical code. The canonical frontend is
  `packages/web`.
- **`/tailwind.config.js` at the repo root** — stale. The active config is
  `packages/web/tailwind.config.js`.
- The legacy `c2k.*` Tailwind palette (teal) — prefer `dc.*` tokens for all new UI.
