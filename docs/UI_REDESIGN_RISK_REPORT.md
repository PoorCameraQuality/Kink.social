# UI Redesign Risk Report — kink.social

Generated: 2026-06-12 via `npm run audit:ui-architecture`

Synthesis of the UI architecture audit packet. **Do not redesign pages individually** — migrate templates and primitives first.

## Audit packet index

| Document | Purpose |
|----------|---------|
| [`UI_ROUTE_INVENTORY.md`](UI_ROUTE_INVENTORY.md) | All routes, layouts, access, onboarding gates |
| [`UI_COMPONENT_INVENTORY.md`](UI_COMPONENT_INVENTORY.md) | Shared components, duplicates, contract gaps |
| [`UI_MOBILE_AUDIT.md`](UI_MOBILE_AUDIT.md) | Screenshots + automated mobile issues |
| [`UI_DESIGN_SYSTEM_AUDIT.md`](UI_DESIGN_SYSTEM_AUDIT.md) | Tokens, hardcodes, stale config |
| **This file** | Migration risks and recommended execution order |

## Executive summary

- **Preflight (Postgres + auth):** passed
- **Router entries documented:** 131
- **Routes blocked by onboarding gate:** 67
- **AuthGate / registry mismatches:** 12
- **Orphan page files:** 14
- **High-severity component duplications:** 4
- **Proposed contract primitives missing:** 1; partial/duplicate: 28
- **Automated mobile issues (P1/P2):** 1/54
- **Screenshots captured:** 165 (135 authenticated; 0 skipped; 0 login-wall)

## Top migration risks

| Risk | Evidence | Why page-by-page redesign fails |
|------|----------|----------------------------------|
| **Dual/triple design stacks** | `--dc-*` + `--c2k-*` + `--pub-*` + dancecard organizer primitives | Visual polish on one page leaves adjacent pages on a different token stack |
| **No unified AppShell** | RootLayout + 8 LeftRails + 3 organizer shells + focused personal shells | Each page reimplements chrome, causing duplicate nav and safe-area bugs |
| **Onboarding global gate** | OnboardingGate redirects 67 member routes | Users cannot experience product while onboarding incomplete — blocks contextual onboarding |
| **AuthGate vs public IA** | 12 registry/marketing paths require login | Public preview and member IA diverge; landing funnels mislead |
| **116 routes / 5 nav slots** | bottomNav = Home·Explore·Create·Messages·Profile | Features compete for top-level nav without More sheet / role-aware disclosure |
| **Parallel primitives** | 4 high-severity duplicate groups (Button, Confirm, Panel) | Template migration creates third copies unless primitives consolidate first |
| **Mobile dashboard leakage** | 54 P2 issues incl. 3-col grids on narrow viewports | Discover pages behave like desktop dashboards on phones |
| **FEATURE_REGISTRY drift** | `/onboarding` is MemberOnboardingWizard; many routes marked public incorrectly | Implementation prompts based on registry alone will ship wrong gates |

## Mobile nav migration

**Target primary bottom nav:** Home · Explore · Events · Messages · Me

| Slot | Current (`site.config.ts`) | Target |
|------|---------------------------|--------|
| 1 | Home | Home |
| 2 | Explore | Explore |
| 3 | **Create** (center) | **Events** |
| 4 | Messages | Messages |
| 5 | Profile | **Me** (profile + More sheet) |

**Create moves off nav:**

- FAB on feed and relevant surfaces
- Reuse `CreateMenuDropdown` as contextual sheet
- Page-level CTAs on Events, Groups, Orgs, Posts

**Me drawer / More sheet:** Groups, Orgs, Education, Vendors, Settings, Safety, Saved, Notifications, organizer entry (role-gated).

Implementation note: rename Profile → Me is **label/copy only** in this pass; no nav rewire yet.

## Recommended execution order

1. **Audit packet** (this pass) — baseline metrics and screenshots
2. **Design system normalization** — `--dc-*` only; retire `--c2k-*` additions; unify Button/Panel/Confirm
3. **Mobile AppShell** — single shell: bottom nav, safe-area, sticky headers, loading states
4. **Role-aware bottom nav** — Home · Explore · Events · Messages · Me + More sheet
5. **Shared page templates** — feed, directory, detail, wizard, dashboard, settings, policy, media
6. **Onboarding repair** — contextual guidance; never mask normal routes indefinitely
7. **Public landing/login/register** — `--pub-*` alignment or bridge to `--dc-*`
8. **Core member surfaces** — Home, Explore, Events, Groups, Profile, Messages
9. **Organizer surfaces** — single OrganizerAppShell path
10. **Moderation and safety** — report/block first-class on mobile cards
11. **PWA polish** — install prompt, offline skeletons, Core Web Vitals
12. **Visual regression** — Playwright screenshot diff on Tier A routes

## Acceptance criteria by phase

### Phase 3 — AppShell
- All Tier A routes render without duplicate fixed nav on 360px
- Main content clears bottom nav (`c2k-main-mobile-pb` or successor token)
- Single loading/skeleton pattern per template

### Phase 5 — Templates
- ≥80% of member routes map to one of 8 templates
- Directories use FilterSheet on mobile, not desktop sidebar
- Wizards have sticky bottom primary action

### Phase 6 — Onboarding
- New member reaches `/home` without permanent gate
- `/onboarding` skippable where legally safe
- Task prompts replace global redirect for profile photo, privacy, events

## Issue hotspots (from mobile audit)

- `/profile`: 18 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; Backend/internal language visible (\bMODERATOR\+?\b)
- `/`: 5 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; 5 touch targets under 44px
- `/terms`: 59 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; 59 touch targets under 44px
- `/policies`: 34 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; 34 touch targets under 44px
- `/people`: 30 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; 30 touch targets under 44px
- `/events`: 25 touch targets under 44px; Backend/internal language visible (\bECKE\b); 25 touch targets under 44px
- `/settings/privacy`: 36 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; 36 touch targets under 44px
- `/orgs/demo-east-collective`: 17 touch targets under 44px; Backend/internal language visible (\bMODERATOR\+?\b); 17 touch targets under 44px
- `/organizer`: 7 touch targets under 44px; Backend/internal language visible (\bMODERATOR\+?\b); 7 touch targets under 44px
- `/moderation/dashboard`: 10 touch targets under 44px; 3-column dashboard grid visible on narrow viewport; 10 touch targets under 44px
- `/vendors`: Page load failed: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:5173/vendors", waiting until "domcontentloaded"
; 21 touch targets under 44px; 3-column dashboard grid visible on narrow viewport
- `/home`: 19 touch targets under 44px; 19 touch targets under 44px
- `/explore`: 39 touch targets under 44px; 39 touch targets under 44px
- `/groups`: 23 touch targets under 44px; 23 touch targets under 44px
- `/messaging`: 10 touch targets under 44px; 10 touch targets under 44px

## Component consolidation priority

1. Button (ui vs dancecard)
2. ConfirmDialog + useConfirm
3. Card / Panel / OrganizerPanel
4. TabButton / PillTab / section tabs
5. LeftRail → shared DirectorySidebar or FilterSheet
6. Skeleton / Toast

## Generated artifacts

- `docs/audits/ui/generated/routes-enriched.json`
- `docs/audits/ui/generated/components-inventory.json`
- `docs/audits/ui/generated/design-system-audit.json`
- `docs/audits/ui/generated/mobile-issues.json`
- `docs/audits/ui/generated/preflight-report.json`
- `docs/audits/ui/generated/screenshot-manifest.json`
- `docs/audits/ui/screenshots/ui-architecture-audit/*.png`

## Next step

Paste the five `docs/UI_*.md` files into your implementation prompt. Cursor should migrate **templates and primitives**, not individual pages.
