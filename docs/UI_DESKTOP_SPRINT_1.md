# Desktop UI Sprint 1 — Foundation and Shell Stabilization

**Status:** Checkpoint 6 complete — Checkpoint 7+ pending  
**Core principle:** **Desktop improvements must be additive, not a replacement of the mobile system.**

The mobile UI was recently overhauled and is **protected**. Sprint 1 targets shell, tokens, directory templates, rails, empty states, and max-width behavior on desktop. It is **not** a reason to disturb finished mobile patterns.

## Checkpoint progress

| CP | Scope | Status |
|----|-------|--------|
| 1 | Chrome and breakpoint alignment | **Complete** |
| 2 | Token, docs, stale config | **Complete** |
| 3 | Desktop shell contract (lg+, 1600/1920) | **Complete** |
| 4 | People → DirectoryTemplate | **Complete** |
| 5 | EmptyState primitive | **Complete** |
| 6 | Card/surface cleanup | **Complete** |
| 7 | Copy + empty media | Pending |
| 8 | Verification + mobile safety report | Pending |

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

## Token direction (Checkpoint 2)

Sprint 1 stabilizes documentation and guardrails — **not** a broad color migration.

| Family | Direction |
|--------|-----------|
| **`--dc-*`** | **Primary** for new desktop and member UI under `DancecardAppearanceProvider` |
| **`--c2k-*`** | Legacy — no **new** `*-c2k-*` Tailwind **color** utilities (`npm run check:dc-classes`) |
| **`--organizer-*`** | Organizer console only; low-risk surface/status vars may bridge to `--dc-*` with hex fallbacks |
| **`--pub-*`** | **Isolated** to `.public-page` / landing auth — must not leak into authenticated chrome |
| **`--ecke-*`** | Link/focus bridge inside `--dc-*` themes |

**Active Tailwind:** `packages/web/tailwind.config.js`. Repo root `tailwind.config.js` is **deprecated** (stale Inter / hardcoded hex).

## Desktop shell contract (Checkpoint 3)

Authenticated **lg+ (1024px+)** layout uses shared width tokens from `packages/web/src/lib/shell-contract.ts`:

| Token / class | Width at lg+ | Use |
|---------------|--------------|-----|
| `max-w-shell-wide` / `shellWideClass` | 1920px | Header (member), AppShell outer, `/people`, `/profile`, settings chrome |
| `max-w-shell-feed` / `shellFeedClass` | 1440px | Home feed 3-col, `PersonalUtilityPageShell` (notifications, saved, connections) |
| `shellDirectoryClass` | fills parent | `DirectoryTemplate`, messaging — no nested `max-w-[1600px]` island |

Below **lg**, shells keep `max-w-7xl` behavior; mobile gutters and spacing unchanged.

**Deferred:** Organizer shells, non-priority routes with hardcoded `max-w-[1600px]`, Groups/Orgs/Vendors directory migrations.

## Checkpoint 4 (People → DirectoryTemplate)

`/people` (`FindPeopleDiscoverPage`) now uses `DirectoryTemplate` with Events as reference. Custom `header` preserves mobile title/description behavior. `desktopAsideFrom="lg"` keeps the right rail visible at 1024px (Events remains `xl` default).

## Checkpoint 5 (EmptyState primitive)

Normalized `EmptyState` with `variant` (`card` | `inline` | `surface`), `actions[]`, `footer`, and `titleAs`. Presets in `empty-state-presets.tsx`. Tier A wrappers migrated: messaging, notifications, saved, connections (via NotificationsEmptyPanel), activity, my-posts. Media, education coming-soon, organizer, and onboarding panels untouched.

## Checkpoint 6 (card/surface normalization)

Shared surface tokens in `packages/web/src/lib/card-surface.ts`. `Card` gains optional `interactive` prop (delegates hover to `.dc-card-polish`). Normalized outer shells on `EventCard`, `PersonCard`, `FindPeopleProfileCard`, `LocalPostCard` (feed + default), `SectionCard`, home feed empty inline, and saved media episode link. No field, action, routing, or privacy changes.

**Verification (CP6):** `npm run typecheck -w web` and `npm run build -w web` pass. Focused desktop route smoke: `/home`, `/events`, `/people`, `/messaging`, `/notifications`, `/saved` (5 passed; organizer/db routes skipped). Responsive screenshot matrix deferred to **CP8** per sprint plan.

## Rollback safety (required before CP4+)

Local git on branch `main`. Tags mark safe rollback points:

| Tag | Commit | Scope |
|-----|--------|-------|
| `desktop-ui-sprint-1-cp3-baseline` | (see `git rev-parse`) | End of CP3 — shell contract |
| `desktop-ui-sprint-1-cp4-baseline` | `d87cc65` | End of CP4 — People DirectoryTemplate |
| `desktop-ui-sprint-1-cp5-baseline` | `0f7d360` | End of CP5 — EmptyState primitive |

```powershell
# Return to post-CP5 state (discard CP6+ work)
git reset --hard desktop-ui-sprint-1-cp5-baseline

# Return to post-CP4 state (discard CP5+ work)
git reset --hard desktop-ui-sprint-1-cp4-baseline

# Return to post-CP3 state (discard CP4+ work)
git reset --hard desktop-ui-sprint-1-cp3-baseline
```

```powershell
# Return to initial monorepo import
git reset --hard 17f0c71
```

If git is unavailable, copy the full tree to a timestamped folder before each checkpoint.

**Rule:** No further implementation checkpoints without rollback safety documented and tagged.

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
