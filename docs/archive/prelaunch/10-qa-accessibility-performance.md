# Prelaunch Audit 10 — QA, Accessibility & Performance

**Audit date:** 2026-06-04  
**Auditor:** Subagent 10 (production-readiness pass)  
**Scope:** TypeScript, lint, tests, imports, console/runtime errors, accessibility, keyboard nav, form labels, focus states, mobile/responsive, performance hotspots, polling, bundle size, loading/error states, 404/500 handling, production smoke coverage  
**Method:** Static codebase review + local command execution (`typecheck`, `lint`, `test`, `build`). E2E not run (requires Docker + dev stack; documented separately).

**Wave 1 update (2026-06-04):** Typecheck, production build, and API tests (138/138) now pass. CI runs `npm run build`. Gate script: `npm run verify:prelaunch`. Lint and E2E gaps unchanged.

**Related:** [`docs/PILOT_READINESS.md`](../../PILOT_READINESS.md) · [`docs/SMOKE_CHECKLIST.md`](../../SMOKE_CHECKLIST.md) · [`docs/E2E.md`](../../E2E.md) · [`docs/design/07-ACCESSIBILITY_AND_PERFORMANCE.md`](../../design/07-ACCESSIBILITY_AND_PERFORMANCE.md) · [`00-unified-prelaunch-audit.md`](./00-unified-prelaunch-audit.md) § Phase 3 Wave 1

---

## 1. Executive summary

| Area | Status (audit) | After Wave 1 |
|------|----------------|--------------|
| **TypeScript (`npm run typecheck`)** | FAIL | **PASS** |
| **Production build (`npm run build`)** | FAIL | **PASS** |
| **ESLint (`npm run lint`)** | FAIL | **FAIL** (unchanged; not in CI) |
| **API unit tests (`npm test`)** | FAIL (137/138) | **PASS** (138/138) |
| **Playwright E2E** | Not executed | Not executed |
| **Accessibility** | Partial | Partial |
| **Performance** | At risk | At risk (4.5 MB main chunk) |
| **Error handling** | Partial | Partial |

**Bottom line:** Wave 1 cleared the **release compile and unit-test gate**. Lint, E2E, a11y, and perf work remain before pilot UI sign-off.

---

## 2. Scope & methodology

### In scope

- Monorepo scripts: root `package.json` (`typecheck`, `lint`, `test`, `build`, `test:e2e`, `verify:alpha`)
- Web: `packages/web` (Vite 6, React 18, React Router 7)
- API tests: `packages/api` Node test runner (~30 lib + HTTP smoke files)
- E2E inventory: `e2e/*.spec.ts` + `scripts/smoke-*.mjs`
- A11y patterns: `Dialog`, `RootLayout`, `globals.css`, organizer/door/convention surfaces
- Performance: Vite config, polling intervals, bundle strategy, lazy loading

### Out of scope (this pass)

- Live browser axe/Lighthouse runs
- Production deployment smoke on K8s
- Manual keyboard walkthrough of every route
- Load/stress testing

### Commands executed (2026-06-04, Windows)

| Command | Result |
|---------|--------|
| `npm run typecheck` | Exit 2 — `@c2k/shared` OK; `@c2k/api` not reached; **web failed** (~30 TS errors) |
| `npm run lint` | Exit 1 — **113 problems** (46 errors, 67 warnings) |
| `npm test` | Exit 1 — **137 pass, 1 fail** (`http-smoke.test.ts` rate-limit assertion) |
| `npm run build` | Exit 1 — **web vite build failed** (top-level await vs es2020 target) |
| `npm run test:e2e` | **Not run** — needs Docker Postgres, seed, ~3 min stack boot |

---

## 3. Tooling & CI pipeline gaps

### Root scripts

```json
"typecheck": "shared + web + api",
"lint": "web only",
"test": "api only",
"build": "shared + api + web",
"test:e2e": "playwright (38 specs)"
```

### GitHub Actions (`.github/workflows/ci.yml`)

| Step | Runs in CI? |
|------|-------------|
| `npm run typecheck` | Yes |
| `npm run test -w @c2k/api` | Yes |
| `npm run test:db` (Postgres service) | Yes (`check-db` job) |
| `npm run lint` | **No** |
| `npm run build` | **No** |
| `npm run test:e2e` | **No** |
| `npm run verify:alpha` | **No** (local gate only) |

**Gap:** CI enforces typecheck but currently **would fail** on main. Lint errors and build failure are invisible to CI. E2E and alpha smokes are manual/developer-only.

### Web package has no unit tests

`packages/web/package.json` has no `test` script. All frontend regression coverage is Playwright + manual QA.

---

## 4. TypeScript & build health

### Typecheck failures (representative)

| File / area | Issue |
|-------------|-------|
| `packages/shared/src/convention-participation.ts` | `replaceAll` — web `tsconfig` lib target below ES2021 |
| `ExploreDashboardPage.tsx` | Duplicate `ApiEducationArticle` types; missing `EmptyState.message` |
| `HomePageClient.tsx` | Unused imports/vars |
| `SavedPageClient.tsx` | Invalid `const` assertions (5×) |
| `dashboardUtils.ts`, `OrganizerEventDashboard.tsx` | Strict null / prop type mismatches |
| `ParticipationSettingsPanel.tsx` | JSONB settings typed as `{}` — missing property access types |
| `explore-hub.ts`, `media-page-utils.ts` | Missing/wrong optional fields on mock DTOs |

**Impact:** `verify:alpha` step 1 fails; merge to `main` breaks CI.

### Production build failure

`packages/web/index.html` uses **top-level await** to unregister service workers before importing `main.tsx`:

```html
<script type="module">
  const regs = await navigator.serviceWorker.getRegistrations()
  ...
  await import('/src/main.tsx')
</script>
```

Vite default build target (`es2020` / Safari 14) does **not** support top-level await in the emitted bundle. **Production builds cannot complete.**

`@c2k/shared` and `@c2k/api` compile successfully via `tsc`.

---

## 5. Lint & static analysis

**Result:** 113 problems — **46 errors**, 67 warnings.

### Critical errors (prelaunch blockers)

| Category | Count | Example |
|----------|-------|---------|
| **`react-hooks/rules-of-hooks`** | 5 | `EventsPersonalLibraryPage.tsx` — `useMemo` after conditional `return null` |
| **`@next/next/no-img-element`** | 10+ | Rule referenced in eslint-disable comments but **plugin not installed** (Vite app, not Next) — causes hard lint failures |
| **`@typescript-eslint/no-unused-vars`** | 15+ | Dead code across home, explore, organizer stubs |
| **`prefer-const`** | 3 | Minor |

### Warning themes (67)

- `react-hooks/exhaustive-deps` — org hub, messaging, convention page (stale closure risk)
- `react-refresh/only-export-components` — context/helper co-location

**Lint is web-only and not in CI** — errors accumulate silently.

---

## 6. Test coverage & results

### API unit tests

```
# tests 138 | pass 137 | fail 1
```

**Failure:** `POST /api/auth/session returns 429 after rate limit exceeded`  
- Expected: `429` after exceeding login rate limit  
- Actual: `401` (invalid credentials path before limit triggers, or limit config not applied in test harness)

All other HTTP smoke tests (503 without DB, 401 without session) pass.

### Playwright E2E inventory (38 tests)

| File | Tests | Focus |
|------|-------|-------|
| `e2e/smoke.spec.ts` | 32 | Health, auth, home, events, conventions, groups, settings, PWA |
| `e2e/door.spec.ts` | 1 | Mobile door check-in (iPhone 13 viewport) |
| `e2e/registration.spec.ts` | 1 | Public convention registration wizard |
| `e2e/mail.spec.ts` | 3 | Mailpit / email flows |
| `e2e/feed-following.spec.ts` | 1 | Following feed filter |

Many smoke tests **skip** when DB unseeded or demo login fails — pass count depends on `npm run db:prepare`.

### Script smokes (`verify:alpha`)

Includes: `pilot-readiness-smoke.mjs`, `smoke-greenfield-registration.mjs`, `smoke-reports.mjs`, `smoke-organizer-tab-walk.mjs`, `smoke-attendee-dancecard.mjs`, command-bridge audit, scope-email, transactional mail.

**Not run in this audit** (require Docker + API on :3001).

---

## 7. Broken imports & runtime error handling

### Imports

No systemic broken import paths found in reviewed entry points (`main.tsx`, `router.tsx`). Typecheck catches cross-package type drift (`@c2k/shared` vs web duplicate types).

### Error surfaces

| Mechanism | Location | Notes |
|-----------|----------|-------|
| **Root error boundary** | `RootErrorBoundary.tsx` | Catches render errors; shows message + reload; logs to `console.error` |
| **404** | `router.tsx` `NotFoundPage` | Semantic heading, links to `/home` and `/people` |
| **500 / server error page** | — | **None** — API failures handled per-page |
| **Convention not found** | Convention page + smoke | Shows "No convention matches" or network error |
| **Org/event 404** | Various clients | Inline error strings, not unified error component |

### Console usage (web)

Limited intentional logging: `RootErrorBoundary`, organizer convention errors, profile/localStorage warnings. No widespread debug `console.log` in hot paths.

---

## 8. Accessibility audit

### Strengths (implemented since March 2025 UI audit)

| Item | Evidence |
|------|----------|
| Skip link | `RootLayout.tsx` — focus-revealed "Skip to main content" → `#main-content` |
| Focus visible | `globals.css` — `:focus-visible` outline on interactive elements |
| Reduced motion | `globals.css` — `@media (prefers-reduced-motion: reduce)` |
| Safe area | `BottomNav` uses `safe-area-pb`; main padding includes `env(safe-area-inset-bottom)` |
| Dialog semantics | `Dialog.tsx` — `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape to close |
| Tab lists | Convention/org hubs — `role="tablist"`, `aria-label`, some `aria-pressed` on filters |
| Loading | `aria-busy="true"` on skeleton regions (org hub, organizer panels) |
| Door E2E | Uses `getByPlaceholder` / `getByRole` — implies some accessible names |

### Accessibility blockers

| ID | Severity | Issue | Location / impact |
|----|----------|-------|-------------------|
| **A11Y-1** | **P0** | **No focus trap in modals** — Tab escapes to background; no focus return to trigger | `Dialog.tsx`, `CreateFlowModal`, org review modals |
| **A11Y-2** | **P0** | **Rules-of-hooks violation** — page may crash at runtime for certain modes | `EventsPersonalLibraryPage.tsx` |
| **A11Y-3** | **P1** | **Placeholder-only inputs** without `<label>` or `aria-label` | Door search ("Type to search…"), many organizer filters |
| **A11Y-4** | **P1** | **Tab panels missing `aria-selected` / `aria-controls`** on custom tab buttons | Legacy `TabButton` pattern; partial fix on newer hubs |
| **A11Y-5** | **P1** | **Form validation** — inconsistent `aria-invalid`, `aria-describedby`, `role="alert"` | Registration, settings, create flows |
| **A11Y-6** | **P2** | **No automated a11y in CI** — no axe-core, eslint-plugin-jsx-a11y, or Lighthouse CI | Pipeline gap |
| **A11Y-7** | **P2** | **Color contrast not verified** — brass/muted text on dark panels | Design tokens; needs axe/Lighthouse pass |
| **A11Y-8** | **P2** | **Horizontal scroll tab rows** — keyboard users may miss off-screen tabs | Convention hub, mobile filters |
| **A11Y-9** | **P3** | **Error boundary exposes raw `error.message`** to users | `RootErrorBoundary` — may leak internals |

### Keyboard navigation notes

- Global focus ring is present; sticky header may obscure focused elements (partial `scroll-margin` usage).
- Escape closes `Dialog` but not all custom overlays.
- Create flow FAB and bottom nav are reachable; organizer dense tables/grids need spot-check for roving tabindex on schedule grid.

### Form labels (sample)

| Flow | Status |
|------|--------|
| Registration wizard | Good — E2E uses `getByLabel('Badge name')`, role headings |
| Login | Uses `sr-only` labels (per prior audit) |
| Settings theme | `getByLabel('Site appearance theme')` in E2E |
| Emergency contact fields | E2E falls back to `getByText(...).locator('..')` — **fragile, likely missing explicit labels** |
| Organizer import/mapping | Mixed — some `sr-only` filter labels |

---

## 9. Performance audit

### Performance risks

| ID | Risk | Detail |
|----|------|--------|
| **PERF-1** | **P0 — Build failure** | Cannot ship optimized bundle until `index.html` TLA fixed |
| **PERF-2** | **P1 — No code splitting** | No `React.lazy` / dynamic `import()` on routes — entire app graph loads on first navigation |
| **PERF-3** | **P1 — Heavy dependencies in main bundle** | `@tiptap/*`, `xlsx`, `livekit-client`, `@zxing/browser`, `date-fns` — organizer/editor/door features pull weight for all users |
| **PERF-4** | **P1 — Polling** | Convention public schedule: **45s** interval polling `/slots` when `scheduleRevision` set (`conventions/[slug]/page.tsx`); LiveOps console **45s**; channel composer interval; org attendee card interval |
| **PERF-5** | **P2 — No list virtualization** | Long feeds, program grids, people tables render full DOM |
| **PERF-6** | **P2 — No bundle analysis in CI** | No `rollup-plugin-visualizer` or size budget |
| **PERF-7** | **P2 — WebSocket + polling overlap** | Real-time scopes exist but some surfaces still poll (redundant network) |
| **PERF-8** | **P3 — Images** | Raw `<img>` in convention/gallery components (lint disables reference Next rule); no unified lazy-loading / srcset strategy |

### Bundle size

Could not measure — **`vite build` fails**. Recommend post-fix: run `vite build` + analyze chunk sizes; target route splits for `/organizer/*`, `/conventions/*`, editor routes.

### Polling inventory

| Surface | Interval | Trigger |
|---------|----------|---------|
| Convention schedule (public) | 45s | `scheduleRevision` present |
| Live ops console | 45s | Panel mounted |
| Channel composer | interval | Active chat |
| Org anchor attendees card | interval | Card visible |

**Recommendation:** Prefer WS `scheduleRevision` push or visibility-aware polling (`document.visibilityState`); backoff when tab hidden.

---

## 10. Responsive & mobile UX

### Breakpoints

Tailwind defaults: `sm` 640, `md` 768, `lg` 1024 — used consistently (`max-w-7xl`, grid cols, `md:hidden` bottom nav).

### Mobile-specific

| Item | Status |
|------|--------|
| Bottom navigation | `md:hidden`, safe-area padding — **OK** |
| Door mode | Dedicated E2E on iPhone 13 — **OK** |
| Horizontal tab scroll | Convention/org hubs — works touch; keyboard/a11y gap |
| Organizer console on phone | Supported (pilot criterion LOC-DOOR-MOBILE); dense tables may need horizontal scroll |
| PWA | Manifest linked; E2E verifies; SW registration prod-only in `main.tsx` |

### Responsive gaps

- Filter drawers vs sidebars differ by page — no unified pattern audit.
- Some organizer panels assume desktop width (program grid, import mapping).

---

## 11. Loading, error & empty states

### Loading

Improved since 2025 audit: skeleton pulses with `aria-busy` on org hub, organizer people, convention program panel. Not universal — many hooks show blank until data arrives.

### Empty states

`EmptyState` component exists but **props drift** (`message` required — typecheck errors where omitted). Mix of inline empty text vs component.

### Error states

- API errors: mostly inline banners/text; inconsistent retry affordances.
- Network errors on convention slug: tested in E2E ("Network error").
- No global toast for failed mutations on all organizer saves.

---

## 12. Recommendations (prioritized)

| Priority | Action | Owner hint |
|----------|--------|------------|
| **P0** | Fix web typecheck errors (~30) | web + shared tsconfig alignment |
| **P0** | Fix `vite build` — wrap SW cleanup in async IIFE or raise `build.target` to es2022 | `index.html` / `vite.config.ts` |
| **P0** | Fix `EventsPersonalLibraryPage` hooks order | web |
| **P1** | Add `npm run lint` + `npm run build` to CI | infra |
| **P1** | Remove or replace `@next/next/no-img-element` eslint comments | web eslint config |
| **P1** | Fix HTTP smoke rate-limit test (401 vs 429) | api |
| **P1** | Add focus trap + focus restore to `Dialog` | web ui |
| **P1** | Route-level code splitting for organizer/convention/editor | web |
| **P2** | Add `@axe-core/playwright` smoke on 5 critical paths | e2e |
| **P2** | Reduce/replace 45s polling with WS or Page Visibility API | web + api |
| **P2** | Add `eslint-plugin-jsx-a11y` | web |
| **P3** | Bundle size budget + rollup visualizer in CI | web |

---

## QA checklist (manual prelaunch)

Use with seeded DB (`npm run db:prepare`) and demo user `RopeDreamer` / password `demo`.

### Build & gates

- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero errors (warnings triaged)
- [ ] `npm run build` — completes; inspect `dist/` size
- [ ] `npm test` — 138/138 pass
- [ ] `npm run test:e2e` — all non-skipped pass
- [ ] `npm run verify:alpha` — full sequential gate

### Auth

- [ ] Login with username/password → session cookie → `/api/auth/me` authenticated
- [ ] Logout clears session; protected routes redirect or 401
- [ ] Rate limit: repeated failed logins return 429 (not silent 401 loop)

### Organizer core

- [ ] Create org (or verify seed org `demo-east-collective`)
- [ ] Create event under org; appears on org calendar
- [ ] Create/link convention; public hub loads
- [ ] Publish public hub / program listing toggle
- [ ] Registration form: categories, policies, confirmation page
- [ ] Add manual signup (organizer people)
- [ ] Door check-in: search + check-in on phone viewport
- [ ] Program: add slot, publish, visible on public schedule
- [ ] Import schedule (CSV/Sheets path)
- [ ] Public attendee schedule + my schedule
- [ ] People hub nav (org/convention people tabs)
- [ ] Settings save (profile, privacy, appearance persist)
- [ ] File upload / branding (logo, banner, share image)
- [ ] Permissions: non-organizer blocked from organizer routes

### UX quality

- [ ] Tab URLs (`?tab=`) survive refresh
- [ ] 404 page for bad routes
- [ ] Force render error → error boundary (not blank screen)
- [ ] Keyboard-only pass: login → home → org hub → one modal
- [ ] Mobile: bottom nav notched device safe area
- [ ] No mock/demo banner in production build

---

## Production smoke test matrix

Mapping requested flows to **existing automation** and **gaps**.

| Flow | Automated today | Gap / manual step |
|------|-----------------|-------------------|
| **Auth login/logout** | E2E: session POST + `/connections`, settings | Explicit logout UI click not covered |
| **Create org** | Partial — group create E2E; org create via API/scripts | Full UI create-org wizard |
| **Create event** | API seed + event detail E2E | UI create-event form submit |
| **Create convention** | Seed + preview hub E2E | UI convention create wizard |
| **Publish/view public hub** | Convention schedule tab, org calendar badge | Explicit publish toggle + incognito view |
| **Registration form** | `registration.spec.ts` | Access-code category path |
| **Add signup** | `smoke-greenfield-registration.mjs` | Organizer manual add UI |
| **Door check-in** | `door.spec.ts` (mobile) | QR scan path (camera) |
| **Program add/publish slot** | Seed slots E2E; organizer parity script | UI add-slot + publish in one spec |
| **Import schedule** | — | **No E2E** — manual or new spec |
| **Public attendee schedule** | Seeded slot titles on convention page | Logged-out public view |
| **People hub nav** | Partial — organizer people panels | Cross-link people ↔ org ↔ convention |
| **Settings save** | E2E: privacy section + theme localStorage | API-backed settings persist |
| **File upload/branding** | — | **No E2E** — ScopeBrandingPanel |
| **Permissions** | API: `viewerCanManage`, 401 participation | UI denial for non-member |

---

## Suggested automated smoke tests

Proposed Playwright specs (additive; do not duplicate entire `smoke.spec.ts`).

### `e2e/auth-logout.spec.ts`

1. Login via UI (or session POST)
2. Navigate settings → logout control
3. Assert `/api/auth/me` unauthenticated
4. Assert protected route redirects

### `e2e/organizer-create-event.spec.ts`

1. Demo login
2. `/organizer/orgs/demo-east-collective` → create event flow
3. Fill title, date, save
4. Assert event appears in org calendar tab

### `e2e/organizer-program-publish.spec.ts`

1. Open organizer convention schedule
2. Create draft slot → publish
3. Incognito context: public convention schedule shows slot title

### `e2e/branding-upload.spec.ts`

1. Org settings branding panel
2. Upload small PNG (test fixture)
3. Assert PATCH success + image URL on hub hero

### `e2e/import-schedule.spec.ts`

1. Upload minimal CSV fixture
2. Map columns → import
3. Assert slot count increases via API

### `e2e/accessibility-smoke.spec.ts` (axe)

1. Inject `@axe-core/playwright`
2. Scan: `/`, `/home`, `/login`, `/conventions/preview-c2k-weekend`, `/organizer/.../door`
3. Fail on critical violations only

### `e2e/public-hub-incognito.spec.ts`

1. No session
2. Public convention URL → schedule tab shows published slots (no login gate when public)

### CI pipeline addition (recommended)

```yaml
- run: npm run lint
- run: npm run build
- run: npm run test:e2e  # with postgres service + db:prepare
```

---

## Appendix A — Typecheck error file list

- `packages/shared/src/convention-participation.ts`
- `packages/web/src/app/explore/ExploreDashboardPage.tsx`
- `packages/web/src/app/home/HomePageClient.tsx`
- `packages/web/src/app/saved/SavedPageClient.tsx`
- `packages/web/src/components/dancecard/organizer/home/dashboardUtils.ts`
- `packages/web/src/components/dancecard/organizer/OrganizerEventDashboard.tsx`
- `packages/web/src/components/dancecard/organizer/settings/ParticipationSettingsPanel.tsx`
- `packages/web/src/components/organizer/tools/OrganizerOrgToolsPanel.tsx`
- `packages/web/src/components/organizer/tools/ProgramExportsSection.tsx`
- `packages/web/src/components/profile/tabs/ProfileWritingTab.tsx`
- `packages/web/src/lib/explore-hub.ts`
- `packages/web/src/lib/media-page-utils.ts`

## Appendix B — Lint error categories

| Rule | Errors |
|------|--------|
| `@next/next/no-img-element` (missing plugin) | ~10 |
| `react-hooks/rules-of-hooks` | 5 |
| `@typescript-eslint/no-unused-vars` | ~15 |
| `@typescript-eslint/no-unused-expressions` | 1 |
| `prefer-const` | 3 |

---

*End of Audit 10. No code changes were made in this pass.*
