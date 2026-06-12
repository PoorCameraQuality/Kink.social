# End-to-end tests (Playwright)

**Last updated:** 2026-06-06 (21 spec files; alpha gate subset in `verify:alpha:auto`)

**Inventory:** **21** spec files under `e2e/` (route smokes, alpha flows, auth, door, moderation-ts, legal-alpha, etc.). Full suite with seeded DB + Mailpit: **~161 passed / 8 skipped** (desktop + mobile projects).

## Setup (once per machine)

```bash
cd coast-to-coast-kink
npm install
npm run test:e2e:install
```

`test:e2e:install` downloads the Chromium browser for Playwright.

## Run

```bash
npm run test:e2e
```

Playwright starts **`npm run dev`** from the repo root (Vite on **:5173** + Fastify on **:3001**).  
If something is already listening on `http://localhost:5173`, non-CI runs **reuse** it (`reuseExistingServer`).

- **UI mode:** `npm run test:e2e:ui`
- **Route smokes only:** `npm run test:e2e:smoke` — desktop + mobile route smokes + auth
- **Alpha route/flow slice:** `npm run test:e2e:alpha` — `alpha-routes` + `alpha-flows`
- **Alpha gate E2E slice:** `npm run test:e2e:alpha-gate` — smokes, alpha routes/flows, door, moderation-ts (used by `verify:alpha:auto`)
- **Workflow slice:** `npm run test:e2e:workflows` — auth, org hub, event create, convention dashboard, door, permissions, exports/integrations
- **Trust & safety:** `npm run test:e2e:trust-safety` · `npm run test:e2e:trust-safety:media`

**Alpha gate (broader than Playwright alone):** `npm run verify:alpha` — same orchestrator as `verify:alpha:auto:local` (Docker, `db:prepare`, dev servers, Mailpit, then automated gate). See [Alpha verification](#alpha-verification) and [`PILOT_READINESS.md`](./PILOT_READINESS.md).

## CI

Set `CI=true` so the config does **not** reuse an existing server (clean run on GitHub Actions).

```bash
set CI=true
npm run test:e2e
```

Ensure port **5173** is free when using `CI=true` locally.

For alpha CI jobs with the stack already up: set `PLAYWRIGHT_SKIP_WEBSERVER=1`, `PLAYWRIGHT_BASE_URL`, `API_BASE`, and `MAILPIT_API`, then run `npm run verify:alpha:auto`.

## Environment

| Variable | Purpose |
|----------|---------|
| `E2E_DEMO_PASSWORD` | Password for seeded user `RopeDreamer` (default `demo`). Must match `DEMO_LOGIN_PASSWORD` on the API if overridden. |
| `E2E_DEMO_USER` | Demo username (default `RopeDreamer`). |
| `E2E_ORG_SLUG` / `E2E_CONV_SLUG` / `E2E_CONV_PROGRAM_SLUG` | Override seeded slugs in `e2e/helpers/fixtures.ts`. |
| `E2E_SITE_ADMIN_PASSWORD` / `BRAX_ADMIN_PASSWORD` | Site admin (`Brax`) for legal/moderation specs (default `Airship!2`). |
| `CI_REQUIRE_DB` | When set to `true`, **`GET /api/health/ready`** smoke requires `database: "ok"`. Omit locally if the API runs with `USE_DATABASE` off. |
| `MAILPIT_API` | Base URL for Mailpit API (default `http://127.0.0.1:8025`) — used by scope-list confirm test in `mail.spec.ts`. |
| `SMOKE_ORG_SLUG` | Org slug for double opt-in mail test (default `demo-east-collective`). |
| `PLAYWRIGHT_SKIP_WEBSERVER` | Skip Playwright `webServer` when dev stack is already running (alpha gate). |
| `PLAYWRIGHT_BASE_URL` | Web origin (default `http://localhost:5173`). |

For a full run: start Docker (`docker compose -f docker-compose.dev.yml up -d`), then `npm run db:prepare` before `npm run test:e2e` or `npm run verify:alpha`.

**Seeded slugs** (from `db:seed`, overridable via env):

| Slug | Default | Used for |
|------|---------|----------|
| Org | `demo-east-collective` | Org hub, organizer console, calendar Program badge |
| Preview convention | `preview-c2k-weekend` | Door, registration, dancecard, organizer convention tabs |
| Program convention | `seed-demo-con-program` | Anchored schedule slots, unified calendar smokes |

Many tests **skip** when Postgres is off, demo login fails, or optional seeds/Mailpit are unavailable.

## Alpha verification

| Script | What it does |
|--------|----------------|
| `npm run verify:alpha` | Local one-command gate → `verify:alpha:auto:local` |
| `npm run verify:alpha:auto:local` | Docker up, `db:prepare`, start/wait for dev + Mailpit, run `verify:alpha:auto` |
| `npm run verify:alpha:auto` | `verify:prelaunch` + `test:e2e:alpha-gate` + alpha screenshots + pilot smokes (registration, reports, organizer tab walk, dancecard, command-bridge audit, scope-email double opt-in, transactional mail) |
| `npm run verify:alpha:manual` | Human-only pilot acceptance (not automated) |

Optional skips on `verify:alpha:auto`: `VERIFY_SKIP_E2E=1`, `VERIFY_SKIP_SCREENSHOTS=1`, `VERIFY_SKIP_PILOT_SMOKES=1`.

Full Playwright matrix (`npm run test:e2e`) is **not** part of the alpha gate — run it separately for workflow, permissions, mail, media-ts, legal-alpha, etc.

## Static route inventory

Run `npm run audit:ui-inventory` to refresh [`docs/audits/ui/generated/ROUTES_TABLE.md`](./audits/ui/generated/ROUTES_TABLE.md) from `packages/web/src/app/**/page.tsx`. E2E route smokes use a curated subset in `e2e/helpers/routes.ts` and `e2e/alpha-routes.spec.ts`.

## Spec inventory (21 files)

| File | ~Tests | Purpose |
|------|--------|---------|
| `e2e/route-smoke.desktop.spec.ts` | **37** | Major routes @ 1440×900 — public, authenticated, organizer tabs; console/500 guard |
| `e2e/route-smoke.mobile.spec.ts` | **19** | Critical paths @ 390×844; horizontal overflow check (also re-run on mobile project) |
| `e2e/smoke.spec.ts` | **32** | Health/ready/auth; home feed + following; notifications, messaging, orgs; convention schedule + dancecard; org calendar Program badge; events API/UI filters; groups nearby + Create Group; participation API; PWA manifest; settings privacy + appearance |
| `e2e/auth.spec.ts` | **5** | Landing/events public; login/logout; organizer door hidden when logged out; `/api/auth/me` |
| `e2e/alpha-routes.spec.ts` | **14** | Pilot-critical routes (home, settings, organizer hub, convention dashboard, door) |
| `e2e/alpha-flows.spec.ts` | **11** | Onboarding → profile edit; incomplete profile nudge; main nav; door auth; moderation panel; mobile overflow on critical paths |
| `e2e/door.spec.ts` | **1** | Mobile door mode search + check-in on `preview-c2k-weekend` |
| `e2e/registration.spec.ts` | **1** | Public convention register UI through category, form, policies |
| `e2e/mail.spec.ts` | **3** | `/email/confirm` missing/invalid token; Mailpit double opt-in happy path |
| `e2e/feed-following.spec.ts` | **1** | Following feed **Load more** cursor pagination |
| `e2e/organization.spec.ts` | **2** | Org hub calendar tab; organizer console for demo org |
| `e2e/event-create.spec.ts` | **2** | Create event modal via query param; validation on empty continue |
| `e2e/convention-dashboard.spec.ts` | **2** | Dashboard ↔ program tabs; door route loads |
| `e2e/exports-integrations.spec.ts` | **3** | Exports tab; integrations/ECKE UI; ECKE publish status API |
| `e2e/permissions.spec.ts` | **5** | API 401/403 contracts (participation, organizer bootstrap, calendar feed, org forum) |
| `e2e/messaging.spec.ts` | **2** | Global `/messaging` safety copy; convention messaging tab |
| `e2e/people-signups.spec.ts` | **1** | Convention people → signups sub-tab |
| `e2e/program.spec.ts` | **1** | Program tab + publish affordance when slots seeded |
| `e2e/moderation-ts.spec.ts` | **1** | Profile report intake + site admin case review (in alpha gate) |
| `e2e/legal-alpha-smoke.spec.ts` | **4** | Public policy routes; signup/footer links; legal/DMCA admin access; Brax admin + privacy settings |
| `e2e/media-ts.spec.ts` | **3** | Profile photo attestation, logged-out blur, profile photo report (trust-safety slice) |

**Total:** **~142** unique test cases across **21** spec files. The mobile Playwright project re-runs `route-smoke.mobile.spec.ts` and `door.spec.ts` at 390×844. Typical seeded Docker runs pass most tests; optional seeds, Mailpit org config, or T&S fixtures may skip the rest.

## Helpers

| Path | Role |
|------|------|
| `e2e/helpers/auth.ts` | Demo login, DB readiness, door-staff / Brax helpers |
| `e2e/helpers/fixtures.ts` | Seed slugs, organizer/door path builders |
| `e2e/helpers/routes.ts` | Route smoke catalog (public, authenticated, organizer) |
| `e2e/helpers/assertions.ts` | Console guard, overflow check, page settle |
| `e2e/helpers/viewports.ts` | Desktop/mobile dimensions |
| `e2e/helpers/seed-users.ts` | Named seed users for T&S specs |
