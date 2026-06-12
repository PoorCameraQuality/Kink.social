# UI Desktop Implementation Plan — kink.social

Generated: 2026-06-12 via `npm run audit:ui-desktop`

Phased plan for desktop UI normalization. **Audit packet only — no implementation in this pass.**

## Phase 0 — Baseline (complete)

- [x] Route inventory with layouts and access classes
- [x] Component inventory with duplicate clusters
- [x] Design token audit
- [x] Desktop screenshots at 1280–1920
- [x] Per-route issue matrix

## Phase 1 — Design system normalization (2–3 weeks)

**Goal:** Single token path for new desktop work.

| Task | Files | Acceptance |
|------|-------|------------|
| Freeze new `--c2k-*` usage | CI `check-no-legacy-c2k-classes.mjs` | No new legacy color classes |
| Document Manrope/Sora in `08-DESIGN_TOKENS.md` | docs | Doc matches runtime |
| Retire root `tailwind.config.js` or add deprecation comment | root config | One active config |
| Map `--organizer-*` → `--dc-*` equivalents | `globals.css`, organizer shell | Organizer panels use dc tokens |
| Bridge `--pub-*` landing to dc preset or isolate | `public-auth.css` | Landing does not leak into app chrome |

## Phase 2 — Desktop shell unification (2–3 weeks)

**Goal:** One desktop chrome pattern. **Mobile protection:** see [`UI_DESKTOP_SPRINT_1.md`](UI_DESKTOP_SPRINT_1.md) — desktop improvements are additive; prefer `lg:` gates; treat mobile as protected.

| Task | Acceptance |
|------|------------|
| BottomNav unmount or hidden at `md+` (not a visual bug chase at 1280) | No visible bottom nav at desktop; mobile `< md` unchanged |
| Fix 768–1023px nav handoff (browse links vs BottomNav) | Tablet usable; mobile design not crowded |
| Desktop feed scope at `lg+` on `/home` | Following / Near you / Trending without disturbing `CommunityNavBar` below `lg` |
| Consolidate Header disclosure at desktop only | No duplicate-nav on `/home`, `/explore` at `lg+` |
| Parameterize `DirectoryTemplate` left/right slots | Prove on `/events` + `/people`; mobile grid unchanged |
| `PersonalUtilityPageShell` for messaging/notifications/saved | Consistent left rail at `lg+` only |

## Phase 3 — Primitive consolidation (3–4 weeks)

| Primitive | Retire |
|-----------|--------|
| `EmptyState` + presets | 10 domain `*EmptyPanel` |
| `Card` / `SectionCard` | `Panel`, `DashboardCard`, `ProfileCard` variants |
| `TabShell` | 12 scope tab wrappers |
| `ConfirmDialog` | dancecard + organizer confirm stacks |
| `Button` | `dancecard/ui/Button` |

## Phase 4 — Template migration by tier (4–6 weeks)

### Tier A — Core member (week 1–2)

`/home`, `/explore`, `/people`, `/events`, `/messaging`, `/profile`, `/notifications`

### Tier B — Directories (week 2–3)

`/groups`, `/conventions`, `/orgs`, `/vendors`, `/presenters`, `/education`, `/media`, `/places`

### Tier C — Personal utilities (week 3)

`/connections`, `/saved`, `/activity`, `/my-posts`, `/settings/*`, `/profile/edit/*`

### Tier D — Role surfaces (week 4–5)

Organizer (`OrganizerAppShell`), moderation (`ModerationShell`), vendor/presenter onboarding wizards

### Tier E — Legal & marketing (week 5–6)

Policy pages, landing, support — resolve AuthGate mismatches separately (product decision)

## Phase 5 — Desktop polish (2 weeks)

- Max-width strategy for 1600–1920 viewports
- Skeleton loading on all Tier A routes
- Hover/focus/active states audit on cards and tables
- Master-detail for organizer registrants and moderation cases
- Visual regression: Playwright screenshot diff at 1280 + 1440

## Priority routes (P2 issues from runtime audit)

- `/home`
- `/explore`
- `/people`
- `/events`
- `/groups`
- `/messaging`
- `/notifications`
- `/profile`
- `/profile/edit`
- `/onboarding`
- `/settings/account`
- `/connections`
- `/saved`
- `/conventions`
- `/conventions/preview-c2k-weekend`
- `/orgs/demo-east-collective`
- `/education`
- `/presenters`
- `/media`
- `/vendors/onboarding`

## Verification checklist

### Desktop

- [ ] `npm run audit:ui-desktop` — screenshots + issues regenerate clean
- [ ] `npm run test:e2e:smoke` — route smokes pass at 1440×900
- [ ] No new `*-c2k-*` color classes
- [ ] Tier A routes: single H1, labeled forms, skeleton on load
- [ ] Organizer routes: dc tokens only (no teal `--c2k-accent` pills)

### Mobile protection (Sprint 1 mandatory)

- [ ] `npm run test:e2e:smoke` — `route-smoke.mobile.spec.ts` passes (390×844)
- [ ] Manual or captured screenshots at 375, 390, 430, 768, 820, 1024 widths on key routes
- [ ] No horizontal overflow at mobile/tablet
- [ ] [`UI_DESKTOP_SPRINT_1_MOBILE_SAFETY_REPORT.md`](UI_DESKTOP_SPRINT_1_MOBILE_SAFETY_REPORT.md) completed

## Dependencies & blockers

| Blocker | Owner | Notes |
|---------|-------|-------|
| AuthGate public IA | Product | Marketing paths require login — blocks true public desktop preview |
| OnboardingGate scope | Product | Global redirect vs contextual prompts |
| Discord org embed skin | Design | Intentional mimic — may stay separate |
| Program grid inline px | Engineering | Schedule canvas may keep imperative layout |
