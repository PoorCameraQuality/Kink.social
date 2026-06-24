# UI testing contract (Pass 4)

Playwright E2E and axe-core accessibility checks for member-facing surfaces. This extends the existing setup in `playwright.config.ts` and `e2e/` — it does not replace route smokes or alpha gate tests.

## What is covered

| Area | Spec file(s) | Notes |
|------|----------------|-------|
| Home feed desktop | `e2e/ui-home-feed.spec.ts` | Composer, scope tabs, post card |
| Home feed mobile 390 | `e2e/ui-home-feed.mobile.spec.ts` | Bottom nav, overflow |
| Feed reaction picker | `e2e/ui-feed-reactions.spec.ts` | Desktop popover + mobile sheet |
| Menu / layering | `e2e/ui-menus-layering.spec.ts` | Post overflow, Create, account menus |
| Profile | `e2e/ui-profile.spec.ts` | Hero, mobile overflow |
| Directories | `e2e/ui-directories.spec.ts` | People, vendors, groups, events, orgs, explore |
| Event privacy API | `e2e/ui-privacy-api.spec.ts` | Pass 2A.1/2A.2 contracts |
| Accessibility | `e2e/accessibility.spec.ts` | axe serious/critical on key routes |
| Health / infra | `e2e/smoke.spec.ts` | Pass 1 observability (`test:e2e:pass4:full` adds smoke) |

Existing suites (`route-smoke.*`, `alpha-*`, `door`, workflows) remain unchanged.

## How to run locally

### Prerequisites

```bash
npm run test:e2e:install
docker compose -f docker-compose.dev.yml up -d   # Postgres, Redis, Mailpit, MinIO
npm run db:prepare
```

| Service | Port |
|---------|------|
| Web (Vite) | 5173 |
| API (Fastify) | 3001 (proxied as `/api`) |
| Postgres | 6432 |

### Commands

```bash
# Pass 4 bundle (UI regression + a11y + health smoke)
npm run test:e2e:pass4

# Accessibility only
npm run test:e2e:a11y

# Full Playwright matrix (all specs, desktop + mobile projects)
npm run test:e2e

# Stack already running
set PLAYWRIGHT_SKIP_WEBSERVER=1
set PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173
npm run test:e2e:pass4
```

**Health API tests** in `e2e/smoke.spec.ts` hit `/api/health/*` through the Vite proxy. They require the API on **3001** (via `npm run dev` or `npm run dev:api`).

## Fixture assumptions

| Fixture | Default | Override |
|---------|---------|----------|
| Demo member | `RopeDreamer` / `demo` | `E2E_DEMO_USER`, `E2E_DEMO_PASSWORD` |
| Demo org | `demo-east-collective` | `E2E_ORG_SLUG` |
| Demo convention | `preview-c2k-weekend` | `E2E_CONV_SLUG` |

### Pass 4 seed fixtures (`npm run db:prepare`)

Seeded by `ensurePass4TestFixtures` in `packages/api/src/db/seed-legacy.ts` (runs early and again after org seed so partial failures still leave core fixtures):

| Fixture | Slug / title | Used by |
|---------|----------------|---------|
| Public test group | `pass4-public-test-group` · **Pass4 Public Test Group** | `ui-directories.spec.ts` (groups cards) |
| Approval test group | `pass4-approval-test-group` · **Pass4 Approval Test Group** | Future group access tests |
| Public event | **Pass4 Public Event** | Global `/events` discovery |
| Private host event | **Pass4 Private Event** (host: RopeDreamer) | `ui-privacy-api.spec.ts` (UUID → 404) |
| Group private event | **Pass4 Group Private Event** | Group-scoped privacy (optional) |
| Org private event | **Pass4 Org Private Event** | Org-scoped privacy (optional) |

**`db:prepare` expectations:** Postgres on `127.0.0.1:6432`, then `db:push`, `db:migrate-incremental` (includes `convention_trusted_roles.apply_opens_at`), `db:seed`, `db:ensure-preview-attendee-parity`. Seed must complete without `apply_opens_at` errors.

**Troubleshooting skipped Pass 4 tests:**

| Skip message | Likely cause | Fix |
|--------------|--------------|-----|
| `no private host event in seed` | Seed failed before Pass4 fixtures or RopeDreamer not host | `npm run db:prepare`; confirm **Pass4 Private Event** via `GET /api/v1/events?hostId=me` as RopeDreamer |
| `No group cards in seed and POST /api/v1/groups failed` | Empty groups directory; seed incomplete | `npm run db:prepare`; confirm **Pass4 Public Test Group** on `/groups` |
| `DB not ready` | API/Postgres not up | `docker compose -f docker-compose.dev.yml up -d` + wait for health |

Tests use **API session login** (`POST /api/auth/session`), not UI forms, unless auth UI is under test.

Feed interaction tests **create a status post** via `POST /api/v1/feed/posts`, poll **`GET /api/v1/feed/following`**, then open **`/home?mode=following`** — they skip if DB/API unavailable.

Tests do **not** assume private production data or live kink.social content.

## Mobile viewport contract

| Viewport | Size | Project / file |
|----------|------|----------------|
| Desktop | 1440×900 | Default `chromium-desktop` |
| Mobile | 390×844 | `*.mobile.spec.ts` + `chromium-mobile` project |

Mobile specs assert **no horizontal overflow** on directory and profile pages.

## Menu / layering contract

Floating UI must:

1. Be **visible** after open (role=`menu`, role=`dialog`, or `.feed-reaction-picker__*`).
2. Stay **inside the viewport** (not clipped by card `overflow-hidden`).
3. Stack **above feed cards** (`z-dc-dropdown` / `z-dc-modal`).

Post overflow menus use a **portal** (`CopyLinkOverflowMenu`) specifically to escape card clipping. The menu **flips above** the trigger when there is insufficient space below the viewport edge.

Menu layering tests create a **`pass4-feed-check`** post, scroll that card into a stable viewport band, then open **More actions** — they do not use `.first()` on the feed (ECKE-rich seed can stack many cards above).

## axe-core policy

- Package: `@axe-core/playwright`
- Helper: `e2e/helpers/a11y.ts` → `expectNoSeriousAxeViolations()`
- **Blocks CI on:** `critical` and `serious` violations
- **Non-blocking (documented):** `color-contrast`, `color-contrast-enhanced` — logged as known debt; fix incrementally
- **Fixed during Pass 4 (regression guard):** vendor hero `link-name`, groups section nav `listitem`, profile writing subtab `aria-required-parent`, profile avatar/event hero links, feed post avatar link `aria-label` (`View @username's profile`)
- Routes scanned: `/home`, `/profile/{demo}`, `/people`, `/groups`, `/events`, `/vendors`, `/orgs`, `/explore`

Do not weaken privacy gates to satisfy accessibility tests.

## Avoiding flaky tests

1. **`test.skip` when DB/login unavailable** — prefer skip over fail for missing Docker seed.
2. **`attachConsoleGuard`** — fails on `console.error`; small allowlist in `e2e/helpers/assertions.ts`.
3. **`waitForPageSettled`** — 300ms + main landmark visible; increase timeout for slow CI.
4. **`skipUnlessDbReady` retries** — polls `/api/health/ready` for up to 15s when the API boots with Playwright's webServer.
5. **Serial feed mutations** — Pass 4 creates posts per test; parallel runs may interleave; CI uses `workers: 1`.
6. **Do not depend on reaction counts** — assert UI state (`Loved. Change reaction`), not network timing.
7. **Reuse existing server** — `reuseExistingServer: !CI`; restart dev if stale.

## Optional imgproxy smoke (Pass 3A)

Not required for Pass 4. When Docker is available:

```bash
docker compose -f docker-compose.dev.yml -f docker-compose.media.yml up -d imgproxy
# Set IMGPROXY_* env on API — see docs/MEDIA_IMAGE_PROXY.md
```

Verify a feed/profile/card image loads from signed imgproxy URL. **Skipped in this pass** if Docker/imgproxy not running.

## Known limitations

| Limitation | Reason |
|------------|--------|
| People card selector is broad | Mock + API card markup varies |
| Vendor price absence check is heuristic | External/etsy listings may differ |
| Explore module tiles depend on demo fallback | Empty pools skip card visibility |
| axe contrast rules disabled globally | Too noisy for alpha; track separately |
| Notification dropdown layering | Not fully asserted on mobile drawer |
| imgproxy visual check | Optional manual step |

## Future Cursor UI work

When changing UI in these areas, **update or add** a Playwright spec in the same PR:

- Feed actions / reactions → `ui-feed-reactions.spec.ts`
- Header / post menus → `ui-menus-layering.spec.ts`
- Directory cards → `ui-directories.spec.ts`
- New top-level route → `route-smoke.*` + optional `accessibility.spec.ts` entry

Run `npm run test:e2e:pass4` before marking UI tasks complete.

## Related docs

- [`docs/E2E.md`](E2E.md) — full E2E inventory
- [`docs/ALPHA_OBSERVABILITY.md`](ALPHA_OBSERVABILITY.md) — health endpoints (Pass 1)
- [`docs/MEDIA_IMAGE_PROXY.md`](MEDIA_IMAGE_PROXY.md) — imgproxy (Pass 3A)
- [`docs/DISCOVERY_SEARCH_SPIKE.md`](DISCOVERY_SEARCH_SPIKE.md) — event privacy (Pass 2A)
