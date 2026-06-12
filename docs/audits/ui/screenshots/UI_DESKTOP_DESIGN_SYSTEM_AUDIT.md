# UI Desktop Design System Audit — kink.social

Generated: 2026-06-12 via `npm run audit:ui-desktop`

**Scope:** Token usage, Tailwind config, global CSS, and organizer/convention divergence from member chrome.

## Token families

| Family | Source | Desktop usage |
|--------|--------|---------------|
| `--dc-*` | `DancecardAppearanceProvider`, `appearancePresets.ts` | Primary member + organizer surfaces |
| `--c2k-*` | `globals.css` `:root` | Legacy fallbacks; body still `@apply bg-c2k-bg` |
| `--pub-*` | `landing/public-auth.css` | Landing `/` only — separate gold palette |
| `--organizer-*` | `globals.css` | Panel bg `#1e1e1e`, status colors, sidebar width |
| `--ecke-*` | Preset builder | Focus rings, publish/sync UI |

## Configuration files

| File | Status |
|------|--------|
| `packages/web/tailwind.config.js` | **Active** — `dc.*`, `c2k.*`, Manrope/Sora fonts |
| `tailwind.config.js` (repo root) | **Stale** — references non-existent `src/` paths |
| `packages/web/src/app/globals.css` | Main CSS entry — tokens, organizer classes |
| `docs/design/08-DESIGN_TOKENS.md` | Doc reference (Inter listed; runtime uses Manrope/Sora) |

## Typography

- **Fonts:** Manrope (`font-sans`), Sora (`font-display`) via `index.html`
- **Scale:** `text-dc-micro` (11px), `text-c2k-body` (14px), `text-c2k-display` (24px)
- **Desktop deviation:** `.organizer-shell { text-[13px] }` — denser than member UI
- **Hardcoded:** Widespread `text-[10px]`, `text-[11px]` for badges/meta

## Border radius

- Token: `--c2k-card-radius` / `rounded-c2k-card` = 1rem
- De facto: `rounded-2xl` on cards, `rounded-xl` on inputs/buttons
- No centralized radius scale beyond card default

## Spacing

- Token rhythm: `--c2k-space-1` … `--c2k-space-6` (4px base)
- Components mostly use Tailwind defaults (`p-4`, `gap-6`) not `p-c2k-*`
- Layout: `max-w-[1600px]`, `max-w-[1280px]` arbitrary max widths

## Shadow / elevation

- `--dc-shadow-soft`, `--dc-shadow-panel` via `shadow-[var(--dc-shadow-*)]`
- One-off arbitrary shadows on profile hero, login card, home dashboard
- Guidance: prefer surface steps over heavy shadows on dark UI

## Color compliance

- **dc-* compliant files:** majority (member primitives)
- **Hardcoded hex in components:** 20+ files
- **Raw Tailwind palette bypass:** 130+ files (emerald/sky/amber/zinc)

### Notable hardcoded surfaces

| File | Issue |
|------|-------|
| `OrgHubClient.tsx` | Discord clone palette `#1e1f22`, `#313338`, `#5865F2` |
| `feedPostBadge.ts` | Badge hex colors outside tokens |
| `trackDisplayColors.ts` | Schedule lane colors |
| `MockDataBanner.tsx` | Dev preview colors |
| `site-atmosphere.css` | Fixed gradient hex orbs |

## Dark / light theme

- **Not OS-driven** — user appearance preset via `DancecardAppearanceProvider`
- `color-scheme: dark|light` set per preset
- Stray `dark:` Tailwind variants respond to OS, not user preset (inconsistent)
- `theme-color` meta hardcoded `#0f0f0f`

## Organizer / convention tools ignoring main design system

| Area | Divergence |
|------|------------|
| `dancecard-parity.css` | `.organizer-convention-pill--active` uses `--c2k-accent-primary` teal fallback |
| `globals.css` `.organizer-shell` | 13px type, `--organizer-panel-bg` #1e1e1e |
| `ConventionDancecardOrganizerClient` | Lifted embed island with nested theme root |
| `dancecard/ui/Button.tsx` | Duplicate button — `rounded-xl` vs ui `rounded-lg` |
| Program grids | Inline `style={{ width: 52, height: rowH }}` — outside token spacing |
| Discord embed | Intentional third-party mimic, not kink.social tokens |

## CI guard

`packages/web/scripts/check-no-legacy-c2k-classes.mjs` blocks new `*-c2k-*` color utilities.

Full scan: [`docs/audits/ui/generated/design-system-audit.json`](audits/ui/generated/design-system-audit.json)
