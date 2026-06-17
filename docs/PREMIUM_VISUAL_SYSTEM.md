# Premium Visual System

Practical shared surface rules for kink.social. **Improve polish through primitives and tokens — not page-by-page restyling.**

Ownership boundaries:

| Owner | Scope |
|-------|--------|
| **Route/feature passes** (e.g. Events Mobile UX) | Page hierarchy, filter layout, information order, carousel behavior |
| **Premium Surface System** | Tokens, cards, buttons, badges/chips, forms, sheets, motion, empty/loading states |

When in doubt: extend a shared class or token; do not fork one-off page CSS.

---

## Surface levels

| Level | Token / class | Use |
|-------|----------------|-----|
| **App canvas** | `--dc-surface`, `--dc-surface-muted` | Page background, inset wells |
| **Elevated solid** | `--dc-elevated-solid`, `cardSurfaceSolidClass` | Cards, list rows, panels |
| **Elevated glass** | `cardSurfacePanelClass` | Modals, translucent overlays |
| **Feed / rail** | `cardSurfaceFeedClass`, `railSurfaceCardClass` | Home feed, directory side rails |
| **Interactive card** | `dc-card-polish` + `cardSurfaceInteractiveClass` | Tappable directory cards |
| **Sheet / dialog** | `dc-premium-sheet`, `--dc-backdrop-scrim` | Filters, create menu, modals |

Do not stack more than two elevation jumps in one viewport (e.g. card inside card inside sheet).

---

## Card rules

- **Radius:** `rounded-2xl` (1rem+) for cards; `rounded-xl` for nested controls.
- **Border:** `border-dc-border/75` default; `/85` on hover (via `dc-card-polish`).
- **Shadow:** `--dc-shadow-soft` at rest; `--dc-shadow-hover` or `--dc-shadow-panel` on desktop hover only.
- **Background:** prefer `--dc-elevated-solid`; avoid full transparency on readable content.
- **Interactive:** always pair surface class + `dc-card-polish`; never duplicate hover utilities on the same node.
- **Desktop lift:** `dc-surface-lift` applies at `lg+` only (see `desktop-surfaces.css`).
- **Mobile press:** `scale(0.996)` on `:active`; disabled when `prefers-reduced-motion`.

**Do not:** glow halos on every card, glass blur on dense lists, or page-specific shadow strings.

---

## Button rules

Use `@/components/ui/Button` or `dc-premium-btn` utilities.

| Variant | Role |
|---------|------|
| **primary** | One main CTA per viewport section |
| **secondary** | Alternate confirm, bordered |
| **ghost** | Tertiary, inline toolbars |
| **danger** | Destructive confirm only |

- Min height: `min-h-touch` (44px target).
- Radius: `rounded-xl`.
- Focus: 2px accent ring + surface offset.
- Active: subtle scale (0.98); no bounce.
- Disabled: 45% opacity, no pointer events.

---

## Badge and chip rules

| Type | Component | Notes |
|------|-----------|--------|
| **Status badge** | `Badge` | Calm borders; uppercase only when status-critical |
| **Filter chip** | `dc-chip` / `dc-chip--active` | Pill shape; do not change filter semantics |
| **Metadata chip** | `Badge variant="neutral"` | Muted; max 2 near titles |
| **Privacy / role** | Existing trust components | Readable contrast; never neon |

Chips scroll horizontally on mobile (`c2k-no-scrollbar`); wrap on desktop when appropriate.

---

## Form and input rules

- Labels: `text-sm font-medium text-dc-text`
- Hints: `text-dc-micro text-dc-text-muted`
- Errors: `text-dc-micro text-dc-danger` + `role="alert"`
- Inputs: `dc-premium-input` — solid `--dc-input` bg, soft border, accent focus ring
- Spacing: `space-y-1.5` per field; `space-y-4` between groups
- Do not change validation or registration policy in visual passes.

---

## Sheet, dropdown, and dialog rules

- **Backdrop:** `--dc-backdrop-scrim` + optional 2px blur; click-outside closes.
- **Sheet surface:** `dc-premium-sheet` — top radius, panel shadow, safe-area padding.
- **Enter motion:** `dc-sheet-enter` (opacity + 8px translate); off when reduced motion.
- **Header:** title + close control (`min-h-touch`); footer actions right-aligned.
- **Scroll:** body `overflow-y-auto overscroll-contain`; footer sticky with safe area.
- Filter sheets use `FilterSheet` → `Dialog`; do not change apply/clear semantics.

---

## Motion rules

| Allowed | Forbidden |
|---------|-----------|
| Card hover/tap (transform, shadow, border) | Bounce, parallax, decorative loops |
| Button press scale | Motion required to read content |
| Sheet/dialog enter (180ms) | Layout-shifting animations |
| Focus ring transition | Slow (>300ms) decorative fades |
| Skeleton shimmer (restrained) | Stagger on critical path UI |

Always gate with `@media (prefers-reduced-motion: reduce)`.

Tokens: `--dc-premium-duration` (180ms), `--dc-premium-ease` (ease-out curve).

---

## Loading and skeleton rules

- Use `dc-skeleton-bone` + `dc-skeleton-stagger` from shared motion CSS.
- Match real content shape (avatar circle, title bar, action row).
- Pulse/shimmer is subtle; static fill when reduced motion.
- Never skeleton fake identities or event titles that look real.

---

## Empty state rules

- Variants: `card` (default), `surface`, `inline`
- Icon ring: `c2k-empty-icon-ring`; optional `c2k-empty-glow` on card variant only
- One primary CTA via `Button`; secondary ghost
- Reassurance copy: `text-dc-micro text-dc-muted` below actions

---

## Density

| Breakpoint | Guidance |
|------------|----------|
| **Mobile (<1024px)** | Prefer list rows; avoid extra padding layers; chips scroll don't stack |
| **Desktop (lg+)** | Multi-column OK; hover lift; rails use `dc-rail-card` gradient |

Visual passes must not add mobile padding that competes with shell contract (`--c2k-bottom-nav-*`, FAB clearance).

---

## Accessibility guardrails

- Contrast: keep `--dc-text` on `--dc-elevated-solid` at WCAG AA for body copy.
- Focus visible on all interactive primitives.
- Semantic headings unchanged by polish passes.
- Tap targets ≥44px where practical.
- `aria-pressed` on toggle chips; dialog `aria-modal` + labelled titles.

---

## What not to do

- New brand palette or neon accent overload
- Glassmorphism on every surface
- Per-page shadow/border one-offs
- Undo Events Mobile UX hierarchy or filter layout
- Backend, privacy default, or RSVP behavior changes
- Fake seed content in empty states

---

## Route priority for future visual passes

1. **Shared primitives** (this doc) — tokens, Card, Button, Badge, FormField, Dialog, FilterSheet
2. **Directory templates** — DirectoryTemplate, DetailTemplate, FeedTemplate
3. **Home + feed** — composers, activation, post cards
4. **People + Groups** — directory cards
5. **Messaging + notifications** — list rows, safety panels
6. **Settings** — panels, privacy sections
7. **Landing** — public auth surfaces (light touch only)
8. **Organizer / dancecard** — scoped to `dc-gold-chrome` islands; do not leak into member shell

Feature-specific layout passes (Events, Messaging threads, etc.) run **after** primitives are stable.
