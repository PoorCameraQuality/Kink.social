# Desktop UI Sprint 1 — Foundation and Shell Stabilization

**Status:** Ready to execute  
**Prerequisite:** Desktop UI audit packet (`docs/UI_DESKTOP_*.md`)  
**Core principle:** **Desktop improvements must be additive, not a replacement of the mobile system.**

The mobile UI was recently overhauled and is **protected**. Sprint 1 targets shell, tokens, directory templates, rails, empty states, and max-width behavior on desktop. It is **not** a reason to disturb finished mobile patterns.

## Audit baseline

| Metric | Value |
|--------|------:|
| Router entries | 131 |
| Active pages | 103 |
| Desktop screenshots | 186 |
| P1 issues | 0 |
| P2 issues | 120 |

## Strategy

Stabilize **design system → shell → primitives**, then migrate pages by tier. Phase 1–3 of [`UI_DESKTOP_IMPLEMENTATION_PLAN.md`](UI_DESKTOP_IMPLEMENTATION_PLAN.md) before Tier A page migration.

**Do not** visually polish individual pages. **Do not** chase the `mobile-chrome-on-desktop` audit flag as a visual bug at 1280px unless BottomNav is actually visible (it is usually an audit heuristic false positive).

## Sprint 1 scope (desktop-first)

1. **Chrome and breakpoint alignment** — fix 768–1023px nav handoff; desktop feed scope at `lg+`; optional BottomNav unmount at `md+` (not a visual hide chase)
2. **Token, docs, stale config safety** — `--dc-*` primary; no new `--c2k-*`; fonts/docs; deprecate stale root Tailwind config
3. **Shared shell contract and 1600/1920 max-width** — Tier A pages; content islands, not edge-to-edge
4. **`DirectoryTemplate`** — prove on `/events` (reference) and `/people` (migrate); no large new API unless slots insufficient
5. **`EmptyState` primitive** — presets + low-risk Tier A migrations; mobile rendering must stay compatible
6. **Card/surface cleanup** — low-risk shared shells only; no mobile card reorder/resize
7. **Backend language cleanup** — listed P2 member routes only
8. **Empty media fallbacks** — gradient/icon/initials; no stock imagery
9. **Accessibility** — changed or listed routes only
10. **Verification** — desktop + **mobile regression** (see below)

## Hard guardrails (behavior)

- Do not change auth, routes, API contracts, schema, permissions, onboarding rules, payments, uploads, or moderation logic
- Preserve kink.social dark/gold brand; no new color theme
- No explicit imagery; no childish illustrations
- No em dashes in user-facing copy
- Do not remove reporting, blocking, privacy, safety, legal, or moderation controls

---

## Mobile protection (hard constraint)

### 1. Preserve mobile behavior by default

- Do **not** redesign mobile pages
- Do **not** remove or alter mobile bottom navigation behavior below `md`
- Do **not** change mobile feed layout, onboarding layout, or profile/edit flows
- Do **not** change mobile drawer, sheet, modal, or bottom nav behavior unless fixing a **confirmed** bug

### 2. Breakpoint isolation (desktop-safe strategy)

| Breakpoint | Use for Sprint 1 |
|------------|------------------|
| **`lg:` (1024px+)** | **Default** for desktop shell, rails, max-width, feed scope row, DirectoryTemplate desktop grid |
| **`md:` (768px+)** | Use **only** when fixing the 768–1023px nav handoff; verify tablet after every change |
| **`< md`** | Mobile — **do not change** spacing, padding, typography, or nav unless bug fix |

- Prefer desktop-only changes behind **`lg:`** or desktop shell logic (conditional render, desktop-only components)
- Be **careful with `md:`** — 768–1023px is the handoff zone and can affect tablet/mobile feel
- If touching `md:`, verify: **375, 390, 430, 768, 820, 912, 1024** widths
- Do **not** globally change spacing, card padding, typography, or nav in ways that alter mobile

### 3. Protected transition range (768–1023px)

The **real** chrome issue:

- BottomNav hides at `md` (768px)
- Header browse links historically appeared at `lg` (1024px)
- That gap left tablet without browse navigation

**Fix the handoff** without crowding the finished mobile design:

- Do not move full desktop chrome into mobile widths
- Preserve mobile simplicity; make tablet navigation usable
- CommunityNavBar feed tabs remain mobile/tablet (`lg:hidden`); desktop equivalent at `lg+` only

### 4. Protected mobile components

Before editing any of these, document **why** in the mobile safety report:

| Component | Protected behavior |
|-----------|-------------------|
| `BottomNav` | Fixed bottom tabs; `md:hidden` or unmount at `md+` only |
| Mobile menu (Header drawer) | `md:hidden` marketing/auth drawer |
| Mobile composer | `HomeMobileComposer`, feed composer |
| Mobile feed cards | `LocalPostCard`, compact feed rows |
| Mobile profile shell | Profile tabs, cover, mobile layout |
| Onboarding wizard mobile layout | `MemberOnboardingWizard` |
| Mobile settings layout | `SettingsLayout`, mobile action bar |
| Mobile event/directory cards | Grid/list at `< lg` |
| Modals, drawers, sheets, action menus | `FilterSheet`, `CreateSheet`, mobile FAB |

### 5. Visual migration is desktop-first

- Shell unification improves **desktop authenticated** pages
- `DirectoryTemplate` must not alter mobile list/card behavior unless shared markup is verified at `< lg`
- `EmptyState` may be shared; mobile `compact` / `inline` variants must remain
- Card primitive updates must not enlarge, compress, or reorder mobile cards

### 5b. Audit false positives

- **`mobile-chrome-on-desktop` at 1280px** — usually DOM presence of `md:hidden` BottomNav, not visible chrome. Fix: unmount at `md+` **or** audit heuristic (computed visibility). **Not** a reason to redesign mobile nav.

---

## Work order

1. Chrome and breakpoint alignment (`lg+` first; `md` only for handoff)
2. Token, docs, and stale config safety
3. Shared shell contract and 1600/1920 max-width behavior
4. People through `DirectoryTemplate` (Events = reference)
5. `EmptyState` primitive and low-risk Tier A migrations
6. Copy cleanup on listed P2 routes only
7. Empty media fallbacks (no stock imagery)
8. Accessibility fixes for changed or listed routes only

---

## Verification

### Desktop

```bash
npm run audit:ui-desktop
npm run test:e2e:smoke
npm test
npm run build
npm run verify:prelaunch   # if reasonable
```

### Mobile and tablet regression (required)

Capture or manually verify at:

| Width × height | Role |
|----------------|------|
| 375 × 812 | Mobile |
| 390 × 844 | Mobile |
| 430 × 932 | Mobile |
| 768 × 1024 | Tablet / handoff |
| 820 × 1180 | Tablet |
| 1024 × 768 | Tablet landscape |
| 1280 × 800 | Desktop |
| 1440 × 1000 | Desktop reference |
| 1920 × 1080 | Desktop wide |

**Key routes for screenshots:**

`/home`, `/explore`, `/people`, `/events`, `/groups`, `/messaging`, `/notifications`, `/profile`, `/profile/edit`, `/onboarding`, `/settings/account`, `/vendors`, `/education`, `/media`, `/organizer`

Use `npm run test:e2e:smoke` (includes `route-smoke.mobile.spec.ts` at 390×844) plus manual or extended capture for the widths above.

---

## Definition of done

### Desktop Sprint 1 goals

- [ ] Tier A desktop pages more coherent (shell, max-width, rails where scoped)
- [ ] No new token drift; no new legacy `c2k` color utilities
- [ ] `/people` on `DirectoryTemplate`; `/events` unchanged as reference
- [ ] Listed P2 routes cleaned of obvious member-facing backend language
- [ ] No new P1 issues; no broken routes

### Mobile protection (mandatory)

- [ ] Existing mobile overhaul remains intact
- [ ] No mobile navigation regression
- [ ] No mobile feed regression
- [ ] No mobile onboarding regression
- [ ] No mobile profile/edit regression
- [ ] No mobile modal, drawer, sheet, or action menu regression
- [ ] No unexpected horizontal overflow at mobile or tablet widths
- [ ] Mobile safety report completed: [`UI_DESKTOP_SPRINT_1_MOBILE_SAFETY_REPORT.md`](UI_DESKTOP_SPRINT_1_MOBILE_SAFETY_REPORT.md)

### Behavior unchanged

- [ ] No auth, API, database, permission, moderation, upload, payment, or onboarding behavior changes

---

## Deliverables at sprint end

1. Summary of files changed
2. Routes visually touched vs not touched
3. Audit flags **actually** fixed vs false positives confirmed
4. Desktop screenshots regenerated
5. Remaining P2 issues
6. Deferred risky areas
7. **Mobile safety report** (components touched, why, mobile screenshots, regressions found/fixed/deferred)

---

## Source of truth

- [`UI_DESKTOP_ROUTE_INVENTORY.md`](UI_DESKTOP_ROUTE_INVENTORY.md)
- [`UI_DESKTOP_COMPONENT_INVENTORY.md`](UI_DESKTOP_COMPONENT_INVENTORY.md)
- [`UI_DESKTOP_DESIGN_SYSTEM_AUDIT.md`](UI_DESKTOP_DESIGN_SYSTEM_AUDIT.md)
- [`UI_DESKTOP_SCREENSHOT_AUDIT.md`](UI_DESKTOP_SCREENSHOT_AUDIT.md)
- [`UI_DESKTOP_REDESIGN_RISK_REPORT.md`](UI_DESKTOP_REDESIGN_RISK_REPORT.md)
- [`UI_DESKTOP_IMPLEMENTATION_PLAN.md`](UI_DESKTOP_IMPLEMENTATION_PLAN.md)
