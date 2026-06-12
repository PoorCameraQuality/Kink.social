# Unified prelaunch audit — C2K production readiness

**Date:** 2026-06-04  
**Method:** Ten parallel read-only audits (no code changes in audit phase)  
**Audience:** Operators, engineers, and pilot org owners preparing first real-server deploy

---

## Audit index

| # | Report | Focus |
|---|--------|-------|
| 01 | [01-deployment-server-readiness.md](./01-deployment-server-readiness.md) | Env, Docker/K8s, CORS, cookies, WS, S3, mail, Redis, health |
| 02 | [02-backend-db-api.md](./02-backend-db-api.md) | API routes, migrations, data integrity, seeds |
| 03 | [03-auth-permissions-privacy.md](./03-auth-permissions-privacy.md) | Auth, RBAC, access vs command grants, privacy |
| 04 | [04-frontend-ui-cleanup.md](./04-frontend-ui-cleanup.md) | Routes, dead UI, fake data, navigation |
| 05 | [05-organization-workflows.md](./05-organization-workflows.md) | Org create, hub, console, branding, moderation |
| 06 | [06-event-workflows.md](./06-event-workflows.md) | Create event modal, conventions, RSVP, public events |
| 07 | [07-convention-command-bridge.md](./07-convention-command-bridge.md) | Command Bridge end-to-end workflow |
| 08 | [08-registration-people-door.md](./08-registration-people-door.md) | Registration, people ops, door, identity |
| 09 | [09-program-import-publishing.md](./09-program-import-publishing.md) | Program grid, import, publish, ECKE |
| 10 | [10-qa-accessibility-performance.md](./10-qa-accessibility-performance.md) | Typecheck, lint, build, tests, a11y, perf |

---

## Phase 3 — Wave 1 status (2026-06-04)

**Scope:** Build, typecheck, and test green — no UI polish, env, migrations, or security work in this wave.

### Fixes completed

| ID | Fix | Resolution |
|----|-----|------------|
| W1-01 | Production web build (TLA in `index.html`) | Moved localhost SW/cache cleanup to `dev-sw-cleanup.ts`; bootstrap via async `bootstrap()` in `main.tsx`; plain module script in `index.html` |
| W1-02 | Web typecheck (~30 errors) | Fixed TS errors across explore, home, saved, organizer dashboard, participation settings, explore-hub, media utils, EmptyState props; unified `ApiEducationArticle` type; bumped `tsconfig.app.json` lib to ES2021 for `@c2k/shared` `replaceAll` |
| W1-03 | API rate-limit smoke (137/138) | `rate-limit-config.ts` now reads env at route registration time (presets were frozen at first module load); test wrapped in `try/finally` |
| W1-04 | CI / verify guardrails | Added `npm run build` to `.github/workflows/ci.yml`; new `npm run verify:prelaunch` (typecheck → test → build) |

### Files changed

| Area | Paths |
|------|--------|
| Web entry | `packages/web/index.html`, `packages/web/src/main.tsx`, `packages/web/src/dev-sw-cleanup.ts` |
| Web TS fixes | `ExploreDashboardPage.tsx`, `HomePageClient.tsx`, `SavedPageClient.tsx`, `explore-hub.ts`, `media-page-utils.ts`, `useApiEducationArticles.ts`, `ParticipationSettingsPanel.tsx`, `dashboardUtils.ts`, `DashboardQuickActions.tsx`, `OrganizerEventDashboard.tsx`, `OrganizerOrgToolsPanel.tsx`, `ProgramExportsSection.tsx`, `ProfileWritingTab.tsx`, `tools-ui.tsx`, `tsconfig.app.json` |
| API | `packages/api/src/lib/rate-limit-config.ts`, `packages/api/src/routes/http-smoke.test.ts` |
| Tooling | `package.json`, `scripts/verify-prelaunch.mjs`, `.github/workflows/ci.yml` |

### Commands run and results (2026-06-04)

| Command | Result |
|---------|--------|
| `npm run typecheck` | **PASS** (shared, web, api) |
| `npm run build` | **PASS** (shared, api, web — Vite build ~14s) |
| `npm test` | **PASS** (138/138 API tests) |

### Remaining P0 blockers (Wave 3+)

Wave 1–2 gates green. Wave 3 cleared draft leaks, profile email, org MEMBERS/calendar, participation-offer fallback, signed-in fake discovery. Remaining P0:

- ~~Draft sessions leak on public API / ICS / ECKE~~ — **Wave 3**
- ~~Profile email privacy leak~~ — **Wave 3**
- ~~Participation-offers permission-or (scheduler fallback)~~ — **Wave 3**
- Fake discover UI data — signed-in fixed; guest landing sample copy may remain
- Command Bridge dead buttons (exports, messaging feed, staff import, bulk door)
- Convention create ADMIN vs MODERATOR mismatch

### New risks discovered

- **Rate-limit presets** were cached at module load — any future env-driven middleware config should read env lazily or document load order.
- **Production bundle** is ~4.5 MB JS (pre-existing); Wave 1 did not address code splitting (P4).
- **ESLint** still has 46 errors — not in CI; does not block Wave 1 gate.

### Wave 1 gate command

```bash
npm run verify:prelaunch
```

E2E and script smokes: `npm run verify:alpha` (local Docker + dev stack).

---

## Phase 3 — Wave 2 status (2026-06-04)

**Scope:** Deployment safety — prod env templates, migration/deploy guards, seed/wipe guardrails, auth fallback fail-closed, deployment docs. No UI, privacy, draft leaks, fake data, or Command Bridge work.

### Fixes completed

| ID | Fix | Resolution |
|----|-----|------------|
| W2-01 | Incomplete `.env.production.example` | Full template: `USE_DATABASE`, `AUTH_ALLOW_FALLBACK=false`, CORS, S3, mail, ECKE, web build notes, do-not-run warnings |
| W2-02 | Auth fallback enabled by default in prod | `production-guard.ts`: prod always disables fallback; **refuses API/worker startup** if `AUTH_ALLOW_FALLBACK=true` |
| W2-03 | `db:prepare` swallowed push failures | Removed `\|\| true`; failures exit non-zero |
| W2-04 | `db:prepare` dangerous in production | `guard-not-production.mjs` blocks when `NODE_ENV`/`C2K_ENV=production` |
| W2-05 | Seed/wipe unsafe in production | `assertDestructiveDbAllowed` in seed/wipe; requires `C2K_ALLOW_DESTRUCTIVE_DB_RESET=true` in prod |
| W2-06 | Deploy skipped migrations | `deploy.yml` runs `npm run db:migrate-prod` before compose; fails on non-zero exit |
| W2-07 | No production migrate script | Root `db:migrate-prod` + `db:migrate-organizer-parity` in API package |
| W2-08 | Object storage unclear in prod | Documented external S3 requirement in env template, compose comments, runbook §8, k8s secret example |
| W2-09 | No deployment runbook | New [`docs/DEPLOYMENT_RUNBOOK.md`](../../DEPLOYMENT_RUNBOOK.md) |

### Files changed

| Area | Paths |
|------|--------|
| Guards | `packages/api/src/lib/production-guard.ts`, `production-guard.test.ts` |
| Startup | `packages/api/src/server.ts`, `packages/api/src/worker.ts`, `packages/api/src/auth/resolve-viewer.ts` |
| Destructive DB | `packages/api/src/db/seed.ts`, `packages/api/src/db/wipe-database.ts` |
| Scripts | `scripts/guard-not-production.mjs`, `scripts/verify-migrate-env.mjs`, root `package.json`, `packages/api/package.json` |
| Deploy | `.github/workflows/deploy.yml`, `docker-compose.prod.yml`, `.env.production.example`, `k8s/base/secret.example.yaml` |
| Docs | `docs/DEPLOYMENT_RUNBOOK.md`, audit reports 01–03 |

### Env vars documented / enforced

| Variable | Change |
|----------|--------|
| `USE_DATABASE=true` | Required in prod template; verified by `verify-migrate-env.mjs` |
| `AUTH_ALLOW_FALLBACK=false` | Required in template; startup fatal if `true` in production |
| `CORS_ORIGIN` | Documented in prod template |
| `S3_*` | Full block in template + k8s secret example |
| `C2K_ALLOW_DESTRUCTIVE_DB_RESET` | New override for prod seed/wipe only (not recommended) |
| `C2K_ENV=production` | Treated as production runtime for guards |

### Migration/deploy script changes

| Script | Before | After |
|--------|--------|-------|
| `db:prepare` | `db:push \|\| true` + seed | Guard + push (fail-fast) + migrate + seed; dev only |
| `db:migrate-prod` | (missing) | verify env → build → push → hub-ext → incremental → organizer-parity |
| GitHub deploy | pull + compose only | pull → source `.env.production` → `npm ci` → `db:migrate-prod` → compose |

### Commands run and results (Wave 2 verification)

| Command | Result |
|---------|--------|
| `npm run typecheck` | **PASS** (shared, web, api) |
| `npm run build` | **PASS** (~14s) |
| `npm test` | **PASS** (142/142 — +4 production-guard tests) |
| `npm run verify:prelaunch` | **PASS** (3/3) |
| `node scripts/guard-not-production.mjs` (NODE_ENV=production) | **PASS** — exits 1 with fatal message |
| `node scripts/verify-migrate-env.mjs` (USE_DATABASE + DATABASE_URL) | **PASS** — exits 0 |
| `npm run db:migrate-prod` | **Not run** — requires live Postgres; would mutate schema |

### Remaining deployment risks (post–Wave 2)

- **P0 still open:** draft session leaks, fake discover UI, Command Bridge dead buttons, profile email privacy
- **P1:** K8s base lacks web/ingress; readiness does not probe Redis/worker; split-origin cookie risk
- **P1:** Deploy workflow assumes Node + npm on VPS; first-time VPS setup not automated
- **P1:** No migration ledger table — incremental SQL idempotency relies on script design
- **P2:** `load-dev-env.ts` imported in production builds (low risk if `.env.development` absent on host)

### Recommended Wave 3

Security and data exposure (per unified plan Wave 3):

1. Draft session / ICS / ECKE publish leaks — filter unpublished sessions on public routes
2. Profile email privacy — gate `GET /api/profile/:username` on visibility
3. Fake discovery data removal — home, landing, education, groups mock fallbacks
4. Participation-offer permission-or fix (403 before scheduler fallback)

---

## Phase 3 — Wave 3 status (2026-06-04)

**Scope:** Security, privacy, public data exposure, fake discovery removal. No general UI polish, Command Bridge dead buttons, or destructive DB commands.

### Fixes completed

| ID | Fix | Resolution |
|----|-----|------------|
| W3-01 | Draft sessions on public API/ICS/ECKE | `filterSlotsForPublicProgram` in `convention-program-policy.ts`; applied to `GET /slots`, `program.ics`, ECKE publish load |
| W3-02 | Import publish defaults published | `publishProgramCandidates` inserts with `isPublished: false` |
| W3-03 | Profile email leak | `profile-access.ts`; email owner-only; PRIVATE → 404 for non-owner |
| W3-04 | MEMBERS org API read-open | `canViewOrgMemberContent` on forums/chat/members/gallery/etc.; org detail + events calendar stay join-shell |
| W3-05 | Org calendar private events | `canViewerSeeGroupEvent` filter on `GET .../events` |
| W3-06 | Participation-offer 403 before fallback | Single `requireOrganizer(..., ['registration','scheduler','staff_ops'])` |
| W3-07 | Fake discovery for signed-in users | `HomeFeedDiscoverRail` empty states; education/groups/people/explore mock gating |

### Files changed (representative)

| Area | Paths |
|------|--------|
| Program policy | `packages/api/src/lib/convention-program-policy.ts`, `.test.ts` |
| Public routes | `packages/api/src/routes/conventions-routes.ts`, `ecke-publish-routes.ts` |
| Import | `packages/api/src/lib/convention-organizer/scheduleImportPublish.ts` |
| Profile | `packages/api/src/lib/profile-access.ts`, `routes/profile.ts` |
| Orgs | `packages/api/src/lib/org-visibility.ts`, `routes/organizations.ts`, `convention-channel-access.ts` |
| Participation | `packages/api/src/routes/convention-organizer/participation-routes.ts` |
| Web discovery | `HomeFeedDiscoverRail.tsx`, `EducationDiscoverPage.tsx`, `GroupsDiscoverPage.tsx`, `FindPeopleDiscoverPage.tsx`, `useApiPeopleSearch.ts`, `explore-hub.ts`, `ExplorePopularCategories.tsx` |

### Tests added

| File | Coverage |
|------|----------|
| `convention-program-policy.test.ts` | Draft/staff/secret slot filtering |
| `profile-access.test.ts` | Email owner-only, PRIVATE/MEMBERS/PUBLIC |
| `org-visibility.test.ts` | `memberContentAllowedForOrgVisibility` |

### Commands run and results

| Command | Result |
|---------|--------|
| `npm run typecheck` | **PASS** |
| `npm test` | **PASS** (154/154) |
| `npm run verify:prelaunch` | **PASS** |

### Remaining security/privacy risks (post–Wave 3)

See **Wave 4** section below for updated posture.

---

## Phase 3 — Wave 4 status (2026-06-04)

**Scope:** Command Bridge honesty, dead button cleanup, unsupported action hiding, starter hub vs command-grant alignment, `whoCanMessage` enforcement.

### Fixes completed

| ID | Fix |
|----|-----|
| W4-01 | **Exports tab** — removed 404 downloads (presenter directory, volunteer call-sheet, no-photo list); CSV query params on sessions/conflict; event pack labeled JSON; calendar feed scope mapping (`location`/`person`); honest calendar subscribe disclaimer |
| W4-02 | **Messaging** — test-send UI payload aligned (`to`, `body`); announcements copy remains honest (campaign feed, not separate “Dancecard feed” product) |
| W4-03 | **Staff import** — removed live staff kind toggle; legacy staff drafts show warning; shifts remain on People → Staff shifts |
| W4-04 | **Door mode** — removed bulk check-in UI (no `bulk-check-in` route); `exitHref` passed from door page to signups tab |
| W4-05 | **Integrations** — webhook/embed revoke buttons removed (no DELETE routes); status shown as Active with tooltip |
| W4-06 | **Hub mutations** — slot CRUD/import/export/warnings, convention PATCH, documents, slot presenters/staff, duplicate convention now use `requireHubConventionMutation` (OWNER/ADMIN or matching command grant) |
| W4-07 | **`whoCanMessage`** — `assertCanInitiateDm` / `assertCanSendDmMessage` on `POST /api/v1/conversations` and `POST /api/v1/messages` |

### Files changed

| Area | Paths |
|------|--------|
| API permissions | `convention-command-access.ts`, `conventions-routes.ts`, `dm-privacy.ts`, `ecosystem-stubs.ts` |
| API organizer | `modules-routes.ts` (test-send aliases) |
| Web Command Bridge | `ExportsHubPanel.tsx`, `MessagingPanel.tsx`, `ScheduleImportPanel.tsx`, `IntegrationsPanel.tsx`, `DoorModePanel.tsx`, `door/page.tsx` |
| Tests | `dm-privacy.test.ts`, `organizer-export-paths.test.ts`, `door-mode-ui.test.ts`, `schedule-import-ui.test.ts`, `convention-command-permissions.test.ts` |
| Docs | `docs/UI_CLEANUP_REGISTRY.md`, prelaunch audits `00`, `03`, `04`, `07`, `08` |

### Buttons hidden / removed / disabled

- Export: presenter directory, volunteer call-sheet, no-photo list — **removed**
- Door: bulk check-in block — **removed**
- Import: staff kind selector — **removed** (program only)
- Integrations: webhook/embed Revoke — **removed** (informational Active)
- Calendar subscribe: scoped feed buttons remain; disclaimer when delivery not enabled on host

### Tests added

| File | Coverage |
|------|----------|
| `organizer-export-paths.test.ts` | Active vs removed export path lists |
| `door-mode-ui.test.ts` | No `bulk-check-in` in door panel source |
| `schedule-import-ui.test.ts` | No staff kind toggle in import panel |
| `convention-command-permissions.test.ts` | Grant vs requirement matrix |
| `dm-privacy.test.ts` | Default `whoCanMessage` |

### Commands run and results

| Command | Result |
|---------|--------|
| `npm run typecheck` | **PASS** |
| `npm test` | **PASS** (163/163) |
| `npm run build` | **PASS** |
| `npm run verify:prelaunch` | **PASS** |

### Remaining P0/P1 risks (post–Wave 4)

- Calendar feed **GET** `.ics` subscribe URL may still 404 on some hosts (tokens can be minted; delivery route not universal)
- Hub **read** paths and `getConventionWithAccess().canManage` still use org MODERATOR for visibility (write paths for slots/settings/documents aligned)
- Convention create ADMIN vs MODERATOR mismatch
- ECKE publish when bridge disconnected; door check-in window parity
- Org scope bans / locked threads on forum writes
- Landing guest sample activity copy

### Recommended Wave 5

See **Wave 5** section below (completed).

---

## Phase 3 — Wave 5 status (2026-06-04)

**Scope:** Calendar feed delivery, hub read-path permissions, convention create alignment, door policy parity, ECKE gating, org forum enforcement, guest landing copy.

### Fixes completed

| ID | Fix |
|----|-----|
| W5-01 | **Calendar feed GET** — `GET /api/v1/conventions/:key/calendar-feed/:token` with token hash lookup, revoked handling, `filterSlotsForPublicProgram` |
| W5-02 | **Hub read paths** — `getConventionWithAccess().canManage` = command bridge access; `userHasHubConventionRead` / `requireHubConventionRead`; full settings + presenter lookup gated |
| W5-03 | **Convention create** — Option 1: `canCreateConventionShell` on `me/event-publish`; UI disables shell for moderators; recovery navigate to event on failure |
| W5-04 | **Door check-in** — `resolveCheckInUpdate` shared with signups; door roster/lookup/check-in use `mapRegistrantFull` |
| W5-05 | **ECKE** — 503 on entity queue when bridge off; `maybeEnqueue*` no-op without bridge; queue button disabled in UI |
| W5-06 | **Org forums** — `isUserScopeBanned` on thread/post/reactions; locked thread 403 (mod override); UI hides reply when locked |
| W5-07 | **Guest landing** — sample activity labeled illustration |

### Files changed (representative)

| Area | Paths |
|------|--------|
| Calendar | `convention-calendar-feed-ics.ts`, `conventions-routes.ts`, `modules-routes.ts`, `ExportsHubPanel.tsx` |
| Permissions | `convention-command-access.ts`, `conventions-routes.ts` |
| Door | `registration.ts`, `door-routes.ts` |
| Create flow | `organizations.ts`, `CreateFlowModal.tsx` |
| ECKE | `ecke-publish-entity-routes.ts`, `EckeEntityPublishStatus.tsx` |
| Forums | `organizations.ts`, `OrgHubClient.tsx` |
| Landing | `LandingDiscoveryPreview.tsx` |
| Tests | `resolve-check-in-update.test.ts`, `calendar-feed-route.test.ts`, + permission tests |

### Commands run

| Command | Result |
|---------|--------|
| `npm run typecheck` | **PASS** |
| `npm test` | **PASS** (168/168) |
| `npm run build` | **PASS** |
| `npm run verify:prelaunch` | **PASS** |

### Remaining P0/P1 (post–Wave 5)

- Hub **mutation** paths still using `canManage` (access grants, volunteer shifts, custom pages, gallery, hub channels) — partial Wave 5 read alignment only
- K8s/ingress/host operator follow-up
- Convention create does not auto-delete orphan event on shell failure (recovery UX only)

### Recommended Wave 6

See **Wave 6** section below (completed).

---

## Phase 3 — Wave 6 status (2026-06-04)

**Scope:** Hub mutation command-grant alignment, org chat ban parity, group forum enforcement, ECKE ConventionPublishActions gating, signups PATCH parity, enforcement guard tests.

### Fixes completed

| ID | Fix |
|----|-----|
| W6-01 | Hub **mutations** — `requireHubConventionMutation` on staff-invite, slot materials, handoff, volunteer shifts, custom pages, presenter requests, gallery, hub channels, ISO board |
| W6-02 | Hub **reads** — staff-roster / crew-grid use `userHasHubConventionRead` (`staff_ops`) |
| W6-03 | **Org chat** — `isUserScopeBanned` on message/reply/reactions; `viewerScopeBanned` on org GET; UI composer gated |
| W6-04 | **Group forums** — scope ban + locked thread on reply; member/lock UI gates |
| W6-05 | **ConventionPublishActions** — bridge fetch; ECKE blocked when disconnected; ECKE before C2K when selected |
| W6-06 | **Signups PATCH** — `resolveCheckInUpdate` (parity with door POST) |
| W6-07 | **Guard tests** — `wave6-enforcement-guards.test.ts` (static source regression) |

### Commands run

| Command | Result |
|---------|--------|
| `npm run typecheck` | (see session) |
| `npm test` | (see session) |
| `npm run build` | (see session) |
| `npm run verify:prelaunch` | (see session) |

### Remaining P0/P1 (post–Wave 6, pre–staging sign-off)

- K8s/ingress host routing for `.ics` calendar feeds (operator-owned)
- Group forum thread **lock API** for mods (reply enforcement exists; mod lock route still optional)
- ECKE publish **ordering** when bridge is on (UI + client tests; CI smoke covers bridge-off 503 only)
- Manual staging rehearsal per Wave 7 checklist below

### UI & interaction QA system (2026-06-04)

Site-wide three-layer QA: [`docs/audits/ui/README.md`](../ui/README.md) — inventory script (`npm run audit:ui-inventory`), Playwright smokes/workflows (`npm run test:e2e:smoke`), manual [`MANUAL_QA_CHECKLIST.md`](../ui/MANUAL_QA_CHECKLIST.md).

## Phase 3 — Wave 7 status (2026-06-04)

**Scope:** CI DB integration smokes for alpha-gate risks + staging rehearsal materials (no broad UI redesign).

### CI DB smokes added (`packages/api/src/test/wave7-ci-db-smokes.test.ts`)

| Area | Smoke | Risk closed |
|------|-------|-------------|
| Calendar feed | Valid token → 200; invalid → 404; revoked → 410 on `GET /api/v1/conventions/:key/calendar-feed/:token` | Token leak / revoked feed still serving |
| Door check-in | Early → 409 `EARLY_CHECK_IN`; override → 200, `registrationStatus` `checked_in` | Door vs signups policy drift |
| Org scope-ban | Banned user → 403 on chat + forum thread/reply; allowed member succeeds | Org ban bypass on write paths |
| Group locked thread | Non-mod → 403 `Thread is locked`; mod bypass; unlocked thread OK | Locked thread bypass |
| ECKE publish | `POST .../ecke-publish/conventions/:slug/publish` → 503 when bridge not configured | ECKE publish without bridge |
| WS / LiveKit | Scope-banned user denied `authorizeWebSocketSubscribe` + voice token 403 | Realtime parity with REST chat bans |

**Harness:** `packages/api/src/test/ci-db-harness.ts` — gated on `CI_API_INTEGRATION_DB` or `CI_NOTIFICATIONS_DB` (`.github/workflows/ci.yml` `check-db` job).

**API fixes (Wave 7):** `isUserScopeBanned` on `ws-subscribe-auth.ts` (org channel + announcements) and `livekit-voice-routes.ts`.

**Still manual / operator-owned:**

- Staging deploy with real Redis, S3-compatible storage, Mailpit/staging SMTP, WS infra, LiveKit if enabled
- Ingress routing for `.ics` calendar URLs
- ECKE publish happy path when bridge is connected (requires staging ECKE creds)
- Pilot org walkthrough of alpha checklist

### Wave 7 staging rehearsal

**Required env (staging):**

```text
USE_DATABASE=true
AUTH_ALLOW_FALLBACK=false
AUTH_SECRET=<staging secret>
DATABASE_URL=<staging postgres>
REDIS_URL=<staging redis>
# S3-compatible uploads
C2K_MAIL_TRANSPORT=smtp
# Mailpit or staging SMTP host/port
```

**Required services:** Postgres (migrations applied), Redis, S3-compatible storage, Mailpit or staging SMTP, calendar feed HTTP routing, WebSocket infra, LiveKit (if voice enabled).

**Command gates before rehearsal:**

```bash
npm run typecheck
npm test
npm run build
npm run verify:prelaunch
npm run verify:alpha          # local: Docker + dev stack + e2e smokes
npm run test:e2e:smoke
npm run test:e2e:workflows    # when staging DB is prepared
```

**CI DB smokes (no browser):**

```bash
USE_DATABASE=true CI_API_INTEGRATION_DB=true npm run test:db -w @c2k/api
```

**Manual alpha gate:** [`docs/audits/ui/MANUAL_QA_CHECKLIST.md`](../ui/MANUAL_QA_CHECKLIST.md) — Alpha gate section.

**Deploy / runbooks (do not duplicate here):** [`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md), [`docs/audits/prelaunch/01-deployment-server-readiness.md`](./01-deployment-server-readiness.md), [`docs/PILOT_READINESS.md`](../../PILOT_READINESS.md).

### Alpha limitations (pilot org)

- Alpha builds may have rough UI edges; report bugs through the agreed pilot channel.
- Some organizer/admin setup may need platform assistance during the pilot.
- Calendar feeds, realtime (WS), voice (LiveKit), and media uploads are monitored closely — intermittent issues are possible.
- No guarantee of fully self-serve perfection yet; focus is on convention registration, door, and program workflows.

**Wave 7 complete when:** DB smokes green in CI + staging rehearsal passed + one pilot org completes the alpha checklist.

---

### **Deployable to staging only**

**Rationale:** Engineering artifacts for cutover exist (runbooks, `docker-compose.prod.yml`, K8s base, env templates, smoke scripts, Playwright suite). **Wave 1 (2026-06-04) cleared build, typecheck, and API test gates** — `npm run verify:prelaunch` passes. Security, env, draft-session leaks, fake UI data, and Command Bridge honesty issues remain before staging sign-off.

| Score | Meaning | C2K today |
|-------|---------|-----------|
| Not deployable | No path to run on a server | **Too strong** — compose/K8s and runbooks exist |
| **Deployable to staging only** | Internal/pilot on real infra with documented gaps | **Current posture** |
| Deployable to production with known limitations | Real orgs with alpha disclaimers | After P0–P1 fixes + manual sign-off |
| Production-ready | Broad public launch | Not yet |

**Staging gate:** Fix all **P0** items below, run migration sequence on staging DB, complete manual smoke checklist, then invite a single pilot org with written alpha limitations (exports, messaging feed, staff import board, MEMBERS org API semantics).

**Production gate:** P0 + P1 complete, `npm run verify:alpha` green on release tag, prod SMTP checklist A–E, prod smokes against live domain, Tier 1 rows A + F in [`PILOT_READINESS.md`](../../PILOT_READINESS.md).

---

## 2. Top 20 fixes before server deployment

Ranked by deploy safety, data integrity, and user trust. Each item maps to audit IDs for traceability.

| Rank | Fix | Priority | Primary audits |
|------|-----|----------|----------------|
| ~~1~~ | ~~Fix production web build~~ | ~~P0~~ | **Done Wave 1** |
| ~~2~~ | ~~Fix web TypeScript errors~~ | ~~P0~~ | **Done Wave 1** |
| 3 | **Document and require `USE_DATABASE=true`** in `.env.production.example`, K8s secret, cutover table | P0 | 01, 02 |
| 4 | **Disable auth fallback in prod** — `AUTH_ALLOW_FALLBACK=false`, `VITE_AUTH_ALLOW_FALLBACK=false` | P0 | 01, 03 |
| 5 | **Add migration step to deploy** — fail deploy if `db:push` / `db:migrate-incremental` / optional parity fails | P0 | 01, 02 |
| 6 | **Guard destructive DB scripts** — `db:seed` / `wipe-database` blocked in production; remove `\|\| true` from `db:prepare` for prod path | P0 | 02 |
| 7 | **Filter public program by `isPublished`** — `GET /conventions/:key/slots`, ICS, hub client, ECKE outbound | P0 | 09 |
| 8 | **Import publish defaults to draft** — set `isPublished: false` on import inserts; align schema default | P0 | 09 |
| 9 | **Redact profile email / enforce PRIVATE visibility** on `GET /api/profile/:username` | P0 | 03 |
| 10 | **Remove or gate fake discover data** — home rail, landing proof, education progress, groups friends-here | P0 | 04 |
| 11 | **Complete production env template** — S3 block, `CORS_ORIGIN`, `DATABASE_SSL`, staff UUIDs, `C2K_REALTIME_REDIS_BRIDGE` | P0 | 01 |
| 12 | **Fix door Exit link** — pass `exitHref` from door page into `DoorModePanel` | P0 | 04, 08 |
| 13 | **Hide or fix Command Bridge buttons that 404** — exports (presenter dir, call sheet, no-photo), calendar subscribe GET, webhook/embed revoke, bulk door check-in, messaging “Dancecard feed” | P0 | 07 |
| 14 | **Fix messaging test email payload** — UI `{ toEmail, bodyText }` vs API `{ to, body }` | P0 | 07 |
| 15 | **Align convention create permissions** — MODERATOR can create event but convention shell requires ADMIN; gate UI or lower API threshold with sign-off | P0 | 06, 02 |
| 16 | **Fix participation-offers permission-or** — scheduler-only users get 403 (broken fallback) | P0 | 03 |
| 17 | **Unify legacy hub mutations with command grants** — org MODERATOR must not bypass `convention_command_grants` on slot/settings mutations | P1 | 03, 02 |
| 18 | **Enforce org scope bans and locked threads** on forum/chat writes | P1 | 05 |
| 19 | **Gate ECKE publish UI** when `bridgeConnected === false`; honest copy on C2K vs ECKE listing | P1 | 04, 07, 09 |
| 20 | **Door check-in policy parity** — enforce category windows on door POST; fix `mapRegistrant` eligibility on door paths | P1 | 08 |

---

## 3. Fix priority groups

### P0 — Deployment blockers

Must complete before any traffic hits a real server.

| ID | Issue | Action | Audits |
|----|-------|--------|--------|
| P0-01 | Web production build fails (TLA in `index.html`) | Refactor SW cleanup to async IIFE or move to `main.tsx` | 10 |
| P0-02 | Web typecheck fails (~30 errors) | Fix TS errors; align web `lib` target for `replaceAll` | 10 |
| P0-03 | `USE_DATABASE` missing from prod template | Add to `.env.production.example`, K8s secret, runbook | 01 |
| P0-04 | Auth fallback enabled by default | Require `AUTH_ALLOW_FALLBACK=false` in prod | 01, 03 |
| P0-05 | Deploy workflow runs no migrations | Add migration job; fail on error | 01, 02 |
| P0-06 | `db:prepare` swallows push failures; default seed wipes | Split dev vs prod scripts; guard wipe/seed | 02 |
| P0-07 | S3 not in prod compose/template | Document R2/S3 required vars; optional MinIO profile | 01 |
| P0-08 | Draft sessions visible publicly | Filter `isPublished` on public slots, ICS, ECKE sync | 09 |
| P0-09 | Import publish creates published slots | Default `isPublished: false` on all import paths | 09 |
| P0-10 | Fake data shown as live (home, landing, education, groups) | Remove defaults or gate with honest banner | 04 |
| P0-11 | Command Bridge dead buttons (exports, feed, staff import, bulk door) | Hide/disable until routes exist | 07 |
| P0-12 | Messaging test email wrong field names | Align UI payload with API | 07 |
| P0-13 | Door Exit link wrong without workspace context | Pass `exitHref` prop | 04 |
| P0-14 | Convention shell 403 for org MODERATOR | Gate “full program” on ADMIN or align API | 06 |
| P0-15 | Participation-offers 403 for scheduler-only | Fix permission-or helper | 03 |
| P0-16 | Strong `AUTH_SECRET` required; document in template | Already enforced at login; add to checklist | 01 |

### P1 — Data loss / security / permission bugs

Fix before pilot org handles real member PII.

| ID | Issue | Action | Audits |
|----|-------|--------|--------|
| P1-01 | Profile email leak on PRIVATE profiles | Redact email; 404 when not allowed | 03 |
| P1-02 | Legacy hub API bypasses command grants (MODERATOR) | Route mutations through command permission layer | 03, 02 |
| P1-03 | Hub shows Command Bridge link without grant | Probe `command-access` before link | 03 |
| P1-04 | `whoCanMessage` not enforced on DM create | Check privacy settings server-side | 03 |
| P1-05 | Org scope bans not enforced on writes | Call `isUserScopeBanned` on post/reply | 05 |
| P1-06 | Locked forum threads accept new posts | Check `lockedAt` before insert | 05 |
| P1-07 | MEMBERS org API read-open vs UI gated | Align API `canViewOrg` or document alpha limitation | 05 |
| P1-08 | Org calendar ignores event visibility | Filter by `events.visibility` | 05 |
| P1-09 | Door check-in ignores category windows | Use `assertCheckInAllowed` on door POST | 08 |
| P1-10 | Door mapper hides eligibility | Return real eligibility on door paths | 08 |
| P1-11 | Event detail GET ignores group visibility | Apply `canViewerSeeGroupEvent` | 06 |
| P1-12 | Multi-replica WS without Redis bridge | Set `C2K_REALTIME_REDIS_BRIDGE=true` or replicas=1 | 01 |
| P1-13 | Split API subdomain breaks session cookies | Same-origin Caddy pattern or cookie redesign | 01 |
| P1-14 | Registration category CRUD requires admin but UI shows to registration-only | Gate UI or lower API for category list-only | 08 |
| P1-15 | Staff import publish name-only shifts (no personId) | Require user linkage or block publish | 07, 09 |
| P1-16 | ECKE orphan delete on mis-publish | Confirm dialog + document destructive sync | 02, 09 |

### P2 — Broken core workflows

Fix before pilot organizers rely on the feature daily.

| ID | Issue | Action | Audits |
|----|-------|--------|--------|
| P2-01 | Staff import DnD never persisted | Wire POST or hide board | 07 |
| P2-02 | Staff import publish-preview all invalid | Fix non-program batch preview | 07 |
| P2-03 | Calendar subscribe URL 404 | Register GET handler for `.ics` token route | 07 |
| P2-04 | Export scope enum mismatch (`room` vs `location`) | Align UI and API | 07 |
| P2-05 | Presenter promote status mismatch (OFFER_ACCEPTED vs APPROVED) | Align UI or API | 09 |
| P2-06 | Orphan event after failed convention shell | Link to event + optional rollback | 06 |
| P2-07 | Category “Required” not validated in create flow | Enforce in wizard step 1 | 06 |
| P2-08 | Group-scoped create Event omits prefillGroupId | Fix CTA on `/events?groupId=` | 06 |
| P2-09 | Subgroups flag has no settings toggle | Add toggle or hide hub tab | 05 |
| P2-10 | Import board uses browser TZ not convention TZ | Use convention timezone in dropOnBoard | 07, 09 |
| P2-11 | Sessions export returns JSON not CSV by default | Default `?format=csv` or fix labels | 07 |
| P2-12 | `?tab=Manage` redirect strands staff without command grant | Redirect only when command access exists | 07 |
| P2-13 | Participation settings shows “Saved” on 403 | Check `response.ok` | 07 |
| P2-14 | Pass `showDoorLinks` to org schedule panel | Wire prop chain | 04, 05 |
| P2-15 | People sync on every GET /people | Debounce or async refresh UX | 08 |

### P3 — Misleading / dead UI

Reduce trust damage; safe to batch after P0–P2.

| ID | Issue | Action | Audits |
|----|-------|--------|--------|
| P3-01 | Explore fake category counts | Remove until API aggregates | 04 |
| P3-02 | Education Follow/Save dead buttons | Hide or wire | 04 |
| P3-03 | Events Sync to calendar no-op | Disable + “Coming soon” | 04 |
| P3-04 | Invite member disabled primary | Hide button | 04, 05 |
| P3-05 | Vendor mock fallback on API miss | 404 in prod | 04 |
| P3-06 | People mock suggestions on empty API | Empty state only | 04 |
| P3-07 | trustScore ?? 0 mis-ranks unrated | Treat null as unrated | 04 |
| P3-08 | Home “Trust” mislabeled (profile completion) | Rename section | 04 |
| P3-09 | ProgramVisibilityCard false draft claim | Fix copy after B1 filter | 09 |
| P3-10 | Groups personal tabs empty without “Soon” | Badge or hide nav | 04 |
| P3-11 | Organizer Recent activity placeholder | Remove panel | 04, 05 |
| P3-12 | Raw JSON in vetting/import panels | Humanize or admin-only collapse | 04, 07 |
| P3-13 | Webhook/embed example URLs nonexistent | Remove examples or add routes | 07 |
| P3-14 | Door QR stub SVG | Label “dev QR” or implement | 07, 08 |
| P3-15 | `GET /api/v1/status` all “implemented” | Honest env-gated status or remove | 02 |

### P4 — Polish / accessibility / performance

Post-pilot or parallel when low risk.

| ID | Issue | Action | Audits |
|----|-------|--------|--------|
| P4-01 | ESLint 46 errors not in CI | Fix + add lint to CI | 10 |
| P4-02 | No route-level code splitting | Lazy-load heavy routes | 10 |
| P4-03 | 45s schedule polling | Reduce interval or WS-driven refresh | 10 |
| P4-04 | Modal focus trap missing | Add to Dialog component | 10 |
| P4-05 | API rate-limit smoke test flake | Fix test expectation | 10 |
| P4-06 | Add `npm run build` to CI | Catch build regressions | 10 |
| P4-07 | trustProxy for rate limits behind Caddy | Enable Fastify trustProxy | 01 |
| P4-08 | Readiness “Fix now” actions empty | Populate actions or remove buttons | 07 |
| P4-09 | Org branding crop copy vs no cropper | Clarify upload-only | 05 |
| P4-10 | Duplicate nav models (people/explore/discovery) | Consolidate labels/hrefs | 04 |

---

## 4. Suggested implementation order

Execute in **waves** to minimize risk. Do not run destructive seed on shared/staging DB.

### Wave 1 — Ship a build (1–2 days)

1. Fix `index.html` top-level await → `npm run build` green  
2. Fix web typecheck errors  
3. Fix API rate-limit smoke (1 test)  
4. Add `npm run build` to CI (optional but recommended)

**Exit criteria:** `npm run typecheck`, `npm run build`, `npm test` all pass.

### Wave 2 — Deploy safety (1 day)

5. Update `.env.production.example`, `k8s/base/secret.example.yaml`, SERVER_CUTOVER env table  
6. Document migration sequence in deploy workflow (manual gate acceptable first)  
7. Guard `db:seed` / wipe for production  
8. Set auth fallback false in templates and validate on staging

**Exit criteria:** Operator can follow runbook without guessing env vars; staging `/api/health/ready` shows `database: ok`.

### Wave 3 — Security & permissions (2–3 days)

9. Profile privacy / email redaction  
10. Participation-offers permission-or  
11. Public slot `isPublished` filter + import draft defaults  
12. Legacy hub mutation alignment (or documented temporary MODERATOR block on hub manage tab)

**Exit criteria:** Anonymous cannot see draft sessions; scheduler can access participation offers; profile PRIVATE hides email.

### Wave 4 — Trust UI cleanup (2–3 days)

13. Remove/gate fake discover rails (home, landing, education, groups)  
14. Door Exit link; org schedule door links  
15. Hide Command Bridge dead buttons (exports subset, messaging feed, staff import board, bulk door)  
16. ECKE publish gate when bridge off  
17. Convention create ADMIN gate for full program

**Exit criteria:** Manual walkthrough of focus routes in audit 04 shows no fabricated counts/progress; no clicked button returns 404 in Command Bridge Tools/Comms.

### Wave 5 — Org & door hardening (2 days)

18. Org ban + locked thread enforcement  
19. Door check-in window parity  
20. MEMBERS visibility decision (API tighten or copy change)

**Exit criteria:** Banned test user cannot post; door rejects early check-in when policy says so.

### Wave 6 — Polish & CI (ongoing)

21. Lint fixes, a11y focus trap, polling reduction  
22. E2E additions for import/branding/logout  
23. `verify:alpha` green end-to-end on staging URL

---

## 5. Risk notes

### Do not do on production

- `npm run db:prepare` (may wipe and seed)  
- `npm run db:seed` without `C2K_DB_WIPE=false`  
- `drizzle-kit push --force` without Postgres backup  
- ECKE publish to prod Supabase without dry-run on staging  
- Deploy with `AUTH_ALLOW_FALLBACK` unset  
- Deploy with `USE_DATABASE` false (false-green readiness)

### Architectural risks (document, do not duplicate stacks)

| Risk | Mitigation |
|------|------------|
| Dual permission models (hub MODERATOR vs command grants) | Wave 3 unification or hub “Manage” deprecation plan |
| `ecosystem-stubs.ts` monolith | Rename/track; no second events API |
| No migration ledger | Procedural runbook + backup; consider hash log later |
| Identity: registrant id vs user id vs convention person id | Follow audit 08 matrix; no new people table |
| ECKE destructive orphan delete | Operator training; preview diff before publish |

### Alpha limitations (acceptable on staging if disclosed)

- Exports hub partial (after hiding dead buttons)  
- Messaging email campaigns without real “feed”  
- Staff import board hidden  
- Webhook delivery pipeline not implemented  
- Org subgroups flag without UI toggle  
- No ownership transfer API  
- Groups personal library tabs  
- Payments / C2K+ promos  
- Legal pages draft banner until `VITE_LEGAL_PUBLISHED=true`

---

## 6. Manual smoke test checklist

Run against **staging URL** after Wave 2+. Use pilot org/convention slugs (not demo seed defaults).

### Infrastructure

- [ ] `GET /api/health` → `{ ok: true }`  
- [ ] `GET /api/health/ready` → `database: "ok"`  
- [ ] Login over HTTPS; cookie `Secure`, `HttpOnly`, `SameSite=Lax`  
- [ ] WebSocket subscribe on convention schedule (published slot change)  
- [ ] Upload org logo (S3 configured)  
- [ ] Worker container running; test mail received (SMTP checklist)

### Auth

- [ ] Register / login / logout  
- [ ] Unauthenticated session does not return mock RopeDreamer (`AUTH_ALLOW_FALLBACK=false`)  
- [ ] PRIVATE profile: anonymous GET does not include email

### Organization

- [ ] Create org at `/orgs/new` → lands organizer console  
- [ ] View public hub `/orgs/:slug`  
- [ ] PATCH branding (logo URL)  
- [ ] OWNER sees settings; MEMBER does not  
- [ ] Banned user cannot post in forum (after Wave 5)

### Events

- [ ] Create event via `?create=event` (logged in)  
- [ ] Redirect to `/events/:uuid`  
- [ ] Logged-out user sees public detail; RSVP prompts login  
- [ ] Create convention shell as org ADMIN (full program path)

### Convention Command Bridge

- [ ] Open `/organizer/orgs/:orgSlug/conventions/:convSlug?tab=program`  
- [ ] Add draft slot; confirm **not** on public hub schedule  
- [ ] Publish slot; confirm **visible** on public hub  
- [ ] Import program CSV via staging; publish as draft  
- [ ] Registration-only grant: signups yes, settings no  
- [ ] Door mode: single check-in; Exit returns to convention people tab  
- [ ] No click on visible export/messaging buttons returns 404 (after Wave 4)

### Registration & people

- [ ] Configure registration categories (admin)  
- [ ] Add signup with linked user  
- [ ] Import/export registrants CSV  
- [ ] Roster person drawer via `?person=`  
- [ ] Staff shift uses user UUID as personId

### Program & publish

- [ ] Grid dates match convention window  
- [ ] Re-import same CSV with stable importKey → no duplicate slots  
- [ ] ECKE publish disabled when bridge off — UI honest

### Discover (trust)

- [ ] Signed-in home with empty API: no fake LeatherMama / retreat names  
- [ ] Education: no static 67% progress  
- [ ] Explore: no fake 1.2K category counts

### Permissions matrix spot-check

- [ ] Org MODERATOR without command grant: Command Bridge 403; hub link hidden (after fix)  
- [ ] Registration-only: door yes, program publish no  
- [ ] Scheduler-only: program yes, vetting mutate no

---

## 7. Commands to run before deployment

### On release machine / CI (from repo root)

```bash
# Quality gates (must pass)
npm run typecheck
npm test
npm run build

# Optional but recommended before tag
npm run lint
npm run verify:alpha   # requires Docker + dev stack; or VERIFY_SKIP_E2E=1 for partial

# Compose sanity
docker compose -f docker-compose.prod.yml config
```

### Against target Postgres (once per deploy; backup first)

```bash
npm run build -w @c2k/api

# Stop on any non-zero exit — do NOT use root db:prepare on prod
USE_DATABASE=true DATABASE_URL="postgresql://..." npm run db:push -w @c2k/api
USE_DATABASE=true DATABASE_URL="postgresql://..." npm run db:migrate-hub-ext -w @c2k/api
USE_DATABASE=true DATABASE_URL="postgresql://..." npm run db:migrate-incremental -w @c2k/api
USE_DATABASE=true DATABASE_URL="postgresql://..." npx tsx packages/api/scripts/migrate-organizer-parity.ts
```

### After deploy (from operator laptop)

```bash
set SMOKE_BASE=https://staging.yourdomain.com
set API_BASE=https://staging.yourdomain.com
set SMOKE_CONV=<pilot-convention-slug>
set PILOT_ORG_SLUG=<pilot-org-slug>

node scripts/pilot-readiness-smoke.mjs
node scripts/smoke-greenfield-registration.mjs
node scripts/smoke-reports.mjs
node scripts/audit-command-bridge.mjs
```

### Web image build (same-origin example)

```bash
docker compose -f docker-compose.prod.yml build web \
  --build-arg VITE_SITE_URL=https://yourdomain.com \
  --build-arg VITE_HOME_DEMO_FALLBACK=false \
  --build-arg VITE_LEGAL_PUBLISHED=true
```

---

## 8. Deployment runbook draft

Consolidates audits 01, 02, and [`SERVER_MOUNT_RUNBOOK.md`](../../SERVER_MOUNT_RUNBOOK.md).

### Phase A — Prerequisites

1. Provision VPS or K8s cluster, Postgres, Redis, S3/R2 bucket.  
2. DNS A/AAAA → host; TLS via Caddy (compose) or Ingress (K8s).  
3. Generate secrets: `AUTH_SECRET`, `COOKIE_SECRET`, `EXTERNAL_STORE_SECRET`.  
4. Complete [`PROD_SMTP_K8S_CHECKLIST.md`](../../PROD_SMTP_K8S_CHECKLIST.md) sections A–E when ready for real mail.  
5. Choose **same-origin** routing (recommended): Caddy serves SPA + proxies `/api/*` to API.

### Phase B — Configuration

Create `.env.production` (minimum):

```env
NODE_ENV=production
USE_DATABASE=true
DATABASE_URL=postgresql://...
DATABASE_SSL=true
REDIS_URL=redis://...
AUTH_SECRET=<strong-random>
COOKIE_SECRET=<strong-random>
AUTH_ALLOW_FALLBACK=false
C2K_PUBLIC_WEB_URL=https://yourdomain.com
C2K_MAIL_TRANSPORT=smtp
C2K_MAIL_FROM=noreply@yourdomain.com
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
S3_ENDPOINT=...
S3_BUCKET=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_PUBLIC_BASE_URL=https://cdn.yourdomain.com/...
C2K_SITE_ADMIN_USER_IDS=<uuid>
C2K_PLATFORM_MODERATOR_USER_IDS=<uuid>
C2K_REALTIME_REDIS_BRIDGE=true   # if API replicas > 1
```

Build web with `VITE_HOME_DEMO_FALLBACK` not true, `VITE_SITE_URL` set, legal flag per counsel.

### Phase C — Database

1. **Backup** empty or existing DB.  
2. Run [§7 migration commands](#7-commands-to-run-before-deployment).  
3. **Do not** run `db:seed` on production.  
4. Create pilot org and convention via UI/API.  
5. Insert or env-configure platform staff.

### Phase D — Deploy application

**VPS compose:**

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Confirm containers: `caddy`, `web`, `api`, `worker`, `postgres`, `redis`.

**K8s:** Apply namespace, configmap, secret, API (start with 1 replica until WS bridge verified), worker. Deploy static web separately (not in `k8s/base/`).

### Phase E — Verification

1. `curl -s https://yourdomain.com/api/health/ready`  
2. Login test  
3. WS test on convention program tab  
4. Upload test  
5. Run prod smokes (§7)  
6. Complete [`PILOT_READINESS.md`](../../PILOT_READINESS.md) Tier 1 rows A + F  
7. Update [`SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md)

### Phase F — Rollback

- **App:** Redeploy previous image/tag; compose `up` previous build.  
- **DB:** Restore from backup — **no** automated down migration.  
- **Do not** run wipe/seed to “fix” a bad deploy.

---

## Cross-cutting themes

| Theme | Severity | Audits |
|-------|----------|--------|
| Build/typecheck red | Blocks all deploys | 10 |
| Env template incomplete | False-green health, broken uploads/auth | 01 |
| Migrations not in deploy | Schema drift 500s | 01, 02 |
| Auth fallback + profile privacy | Security/trust | 03 |
| Draft sessions public | Data/trust | 09 |
| Fake discover UI | Trust | 04 |
| Command Bridge over-promises | Trust (404 buttons) | 07 |
| Permission dual paths | Security/ops confusion | 03, 02 |
| Org moderation gaps | Safety | 05 |
| Door policy inconsistency | Ops at door | 08 |

---

## Next phase

**Wave 2 (awaiting approval):** Deploy safety — prod env template, migration deploy step, guard `db:seed`/wipe, disable auth fallback in templates.

**Wave 1 complete** — do not proceed to Wave 2 until approved.

---

*Unified report generated 2026-06-04. Phase 3 Wave 1 implemented 2026-06-04.*
