# UI Desktop Redesign Risk Report — kink.social

Generated: 2026-06-12 via `npm run audit:ui-desktop`

Synthesis of the desktop UI architecture audit. **Do not redesign pages individually** — consolidate primitives and templates first.

## Audit packet index

| Document | Purpose |
|----------|---------|
| [`UI_DESKTOP_ROUTE_INVENTORY.md`](UI_DESKTOP_ROUTE_INVENTORY.md) | Routes, layouts, access, onboarding |
| [`UI_DESKTOP_COMPONENT_INVENTORY.md`](UI_DESKTOP_COMPONENT_INVENTORY.md) | Shells, cards, duplicates |
| [`UI_DESKTOP_DESIGN_SYSTEM_AUDIT.md`](UI_DESKTOP_DESIGN_SYSTEM_AUDIT.md) | Tokens, hardcodes, organizer drift |
| [`UI_DESKTOP_SCREENSHOT_AUDIT.md`](UI_DESKTOP_SCREENSHOT_AUDIT.md) | Viewport captures by persona |
| [`UI_DESKTOP_REDESIGN_RISK_REPORT.md`](UI_DESKTOP_REDESIGN_RISK_REPORT.md) | **This file** |
| [`UI_DESKTOP_IMPLEMENTATION_PLAN.md`](UI_DESKTOP_IMPLEMENTATION_PLAN.md) | Phased execution order |

## Executive summary

- **Preflight:** passed
- **Router entries:** 131
- **Onboarding-gated routes:** 67
- **High-severity duplicate groups:** 4
- **Desktop runtime issues (P1/P2):** 0/120
- **Desktop screenshots:** 186

## Top migration risks (desktop)

| Risk | Evidence | Impact |
|------|----------|--------|
| **Triple token stack** | `--dc-*` + `--c2k-*` + `--pub-*` + `--organizer-*` | Page polish on member routes leaves organizer on different visual language |
| **20+ parallel left/right rails** | Per-domain `*LeftRail` / `*RightRail` | Directory redesign requires N files per section |
| **No unified desktop AppShell** | RootLayout + DirectoryTemplate + 4 organizer shells | Duplicate header/nav patterns |
| **AuthGate vs public IA** | 12+ registry paths require login | Desktop landing funnels break for anonymous visitors |
| **Onboarding global gate** | Most member routes redirect | Desktop users cannot browse while profile incomplete |
| **11+ empty state copies** | Domain `*EmptyPanel` components | Inconsistent CTAs and illustration patterns |
| **Organizer density fork** | 13px `.organizer-shell`, inline grid px | Convention tools feel like separate product |
| **Whitespace at 1920** | `max-w-[1600px]` without proportional rails | Ultra-wide monitors show floating islands |

## Safe redesign boundaries

**Mobile is protected.** The recent mobile overhaul must not be disturbed. Desktop Sprint 1 uses breakpoint isolation (`lg+` default; careful `md` only for 768–1023 handoff). See [`UI_DESKTOP_SPRINT_1.md`](UI_DESKTOP_SPRINT_1.md).

**In scope for visual/template work:**
- Layout templates, card primitives, nav disclosure, skeleton/empty states
- Token normalization (`dc-*` only for new work)
- Desktop-specific hiding of mobile bottom nav

**Out of scope (do not change in redesign pass):**
- Routes, auth gates, API calls, schema, permissions, moderation logic
- Onboarding rules, payment logic, upload pipelines

## Component consolidation priority

1. `EmptyState` + presets (retire domain empty panels)
2. `DirectoryTemplate` parameterized rails (retire 20 rail copies)
3. `Card` / `SectionCard` (retire `Panel`, `DashboardCard` forks)
4. `TabShell` scope tabs (retire 12 domain tab wrappers)
5. `ConfirmDialog` (retire dancecard/organizer confirm stacks)
6. `Button` (retire `dancecard/ui/Button`)

## Generated artifacts

- `docs/audits/ui/generated/routes-enriched.json`
- `docs/audits/ui/generated/components-inventory.json`
- `docs/audits/ui/generated/design-system-audit.json`
- `docs/audits/ui/generated/desktop-screenshot-manifest.json`
- `docs/audits/ui/generated/desktop-issues.json`
- `docs/audits/ui/screenshots/ui-desktop-audit/*.png`


---

# UI Desktop Issue Report — kink.social

Generated: 2026-06-12 via `npm run audit:ui-desktop`

Per-route desktop UX flags from Playwright heuristics at 1280, 1440, and 1920 widths. **Audit only — no fixes applied.**

## Issue flag legend

| Flag | Meaning |
|------|---------|
| `cluttered-above-fold` | Too many headings/controls in top 65vh |
| `too-many-ctas` | >4 primary-style CTAs competing |
| `duplicate-nav` | Multiple fixed/sticky nav regions |
| `empty-media` | Aspect-ratio regions with no image/content |
| `broken-media` | Images failed to load |
| `internal-dashboard` | Console density appropriate for staff only |
| `backend-language` | Dev/API/seed/demo terminology visible |
| `missing-skeleton` | Empty main without loading skeleton |
| `missing-labels` | Form fields without label/aria |
| `multiple-h1` | More than one H1 |
| `nested-buttons` | Invalid nested interactive elements |
| `dense-table` | Wide table — candidate for master-detail |
| `mobile-chrome-on-desktop` | Bottom nav visible at desktop width |
| `small-targets` | Click targets under 32px |

## Summary by severity

| Severity | Count |
|----------|------:|
| P1 | 0 |
| P2 | 120 |
| P3 | 111 |
| P4 | 4 |

## Per-route issue matrix

| Route | Flags (union across viewports) | Top issues | Screenshot |
|-------|-------------------------------|------------|------------|
| `/` | — | — | [view](audits/ui/screenshots/ui-desktop-audit/root-guest-1920.png) |
| `/connections` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/connections-member-1920.png) |
| `/conventions` | missing-labels, cluttered-above-fold, mobile-chrome-on-desktop | 4 form fields without label/aria; Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/conventions-member-1920.png) |
| `/conventions/preview-c2k-weekend` | cluttered-above-fold, mobile-chrome-on-desktop, small-targets, backend-language | Cluttered above-the-fold layout (many headings/controls in top 65vh); Backend/developer language visible (seeded) | [view](audits/ui/screenshots/ui-desktop-audit/conventions-preview-c2k-weekend-member-1920.png) |
| `/education` | cluttered-above-fold, empty-media, mobile-chrome-on-desktop, small-targets, backend-language | Cluttered above-the-fold layout (many headings/controls in top 65vh); 7 empty media/aspect-ratio regions | [view](audits/ui/screenshots/ui-desktop-audit/education-member-1920.png) |
| `/events` | cluttered-above-fold, empty-media, mobile-chrome-on-desktop, small-targets, backend-language | Cluttered above-the-fold layout (many headings/controls in top 65vh); 14 empty media/aspect-ratio regions | [view](audits/ui/screenshots/ui-desktop-audit/events-member-1920.png) |
| `/explore` | cluttered-above-fold, empty-media, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); 8 empty media/aspect-ratio regions | [view](audits/ui/screenshots/ui-desktop-audit/explore-member-1920.png) |
| `/groups` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | — |
| `/home` | cluttered-above-fold, empty-media, broken-media, mobile-chrome-on-desktop, small-targets | Cluttered above-the-fold layout (many headings/controls in top 65vh); 6 empty media/aspect-ratio regions | [view](audits/ui/screenshots/ui-desktop-audit/home-member-1920.png) |
| `/media` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/media-member-1920.png) |
| `/messaging` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/messaging-member-1920.png) |
| `/moderation/dashboard` | cluttered-above-fold, mobile-chrome-on-desktop, internal-dashboard | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/moderation-dashboard-mod-admin-1920.png) |
| `/notifications` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/notifications-member-1920.png) |
| `/onboarding` | cluttered-above-fold | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/onboarding-new-member-1920.png) |
| `/organizer` | cluttered-above-fold, mobile-chrome-on-desktop, internal-dashboard, backend-language | Cluttered above-the-fold layout (many headings/controls in top 65vh); Backend/developer language visible (\bMODERATOR\+?\b) | [view](audits/ui/screenshots/ui-desktop-audit/organizer-organizer-1920.png) |
| `/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend` | cluttered-above-fold, mobile-chrome-on-desktop, small-targets, internal-dashboard, backend-language | Cluttered above-the-fold layout (many headings/controls in top 65vh); Backend/developer language visible (Command Bridge) | [view](audits/ui/screenshots/ui-desktop-audit/organizer-orgs-demo-east-collective-conventions-preview-c2k-weekend-organizer-1920.png) |
| `/orgs/demo-east-collective` | cluttered-above-fold, empty-media, mobile-chrome-on-desktop, small-targets, backend-language | Cluttered above-the-fold layout (many headings/controls in top 65vh); 7 empty media/aspect-ratio regions | [view](audits/ui/screenshots/ui-desktop-audit/orgs-demo-east-collective-member-1440.png) |
| `/people` | missing-labels, cluttered-above-fold, mobile-chrome-on-desktop, small-targets | 7 form fields without label/aria; Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/people-member-1920.png) |
| `/policies` | small-targets | — | [view](audits/ui/screenshots/ui-desktop-audit/policies-guest-1920.png) |
| `/presenters` | cluttered-above-fold, mobile-chrome-on-desktop, small-targets | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/presenters-member-1920.png) |
| `/presenters/onboarding` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/presenters-onboarding-member-1440.png) |
| `/profile` | multiple-h1, cluttered-above-fold, empty-media, mobile-chrome-on-desktop, backend-language | 2 H1 elements on page; Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/profile-member-1280.png) |
| `/profile/edit` | cluttered-above-fold, small-targets | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/profile-edit-member-1920.png) |
| `/saved` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/saved-member-1920.png) |
| `/settings/account` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/settings-account-member-1920.png) |
| `/terms` | cluttered-above-fold, small-targets | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/terms-guest-1920.png) |
| `/vendors` | cluttered-above-fold, empty-media, mobile-chrome-on-desktop, small-targets | Cluttered above-the-fold layout (many headings/controls in top 65vh); 11 empty media/aspect-ratio regions | [view](audits/ui/screenshots/ui-desktop-audit/vendors-member-1920.png) |
| `/vendors/onboarding` | cluttered-above-fold, mobile-chrome-on-desktop | Cluttered above-the-fold layout (many headings/controls in top 65vh); Cluttered above-the-fold layout (many headings/controls in top 65vh) | [view](audits/ui/screenshots/ui-desktop-audit/vendors-onboarding-member-1920.png) |

## Routes not runtime-audited (static flags only)

Remaining ~100 routes inherit classification from route inventory. Key static risks:

- `/orgs/new` — backend language: ecke
- `/conventions/:slug` — backend language: command-bridge, ecke
- `/education/write` — backend language: ecke
- `/education/write/:id` — backend language: ecke
- `/moderation/cases/:caseId` — backend language: internal-notes
- `/moderation/actions` — backend language: rule-of-two
- `/moderation/admin` — backend language: command-bridge
- `/organizer/orgs/:slug/conventions/:convSlug/print/schedule` — backend language: command-bridge
- `/organizer/orgs/:slug/conventions/:convSlug/print/venue-signs` — backend language: command-bridge

## Cross-cutting desktop issues

1. **AuthGate blocks marketing paths** — `/about`, `/explore`, directories require login; public preview impossible
2. **Discover 3-col layout** — strong on 1440+; whitespace-heavy on 1920 without content max-width
3. **Organizer console density** — 13px type, separate panel tokens; reads internal vs member surfaces
4. **Duplicate navigation** — Header + CommunityNavBar + section tabs + left rail on some pages
5. **Empty state fragmentation** — 11+ custom empty panels vs `EmptyState` presets
6. **Filter pattern drift** — Each directory implements its own filter sidebar
7. **DEV MockDataBanner** — Visible on most routes in development builds
8. **ECKE/command-bridge copy** — Organizer and settings surfaces expose integration jargon

Full results: [`docs/audits/ui/generated/desktop-issues.json`](audits/ui/generated/desktop-issues.json)
