# C2K platform status audit

**Audit date:** 2026-06-12 (pass 10 — prod VPS + code/doc reconciliation)  
**Doc sync:** 2026-06-12 — [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) **pass 26**; prod mounted per [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md); prior pass 9: 2026-06-06 (T&S alpha).  
**Method:** Parallel codebase audits + implementation verification (typecheck, unit tests, E2E, command-bridge audit).  
**Use with:** [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) for priorities; [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) for per-route truth.

---

## Executive summary

| Layer | Maturity | Notes |
|-------|----------|-------|
| **API (`@c2k/api`)** | **~90%** feature surface | **74** route registrars in `server.ts` (+ `GET /api/ws`); `ecosystem-stubs.ts` is DB-backed (name is legacy). ~147 convention organizer routes. |
| **Web (`@c2k/web`)** | **~68%** member UX | 70+ routes in `router.tsx`; 14 ComingSoon; hybrid API/mock by UUID vs legacy id; profile social rail on prod. |
| **Docs** | **Refreshed 2026-06-12** | Pass 26 prod sync; handoff bundle for 2026-06-11 deploys. |
| **Prod ops** | **VPS alpha live** | **https://kink.social** — health/ready + mail green; `_smoke-prod-quick.mjs` **9/9** (2026-06-12). |
| **Tests / ops** | **~74%** | **`npm test`** (~**87** test files — re-run for count); Playwright **161 passed / 8 skipped**; command-bridge green; Mailpit in dev compose. |
| **Overall product** | **~83–86%**¹ | Prod invite alpha; profile social + upload fixes on VPS; Following **F1–F5**; T&S-5 moderation alpha. |

¹ *Maturity % last calibrated **2026-06-12** — product/engineering judgments, not LOC-derived or contractual SLAs.*

---

## 1. Monorepo map

| Package | Role | Key paths |
|---------|------|-----------|
| `packages/web` | Vite 6, React 18, React Router 7 | `src/router.tsx`, `src/app/`, `src/components/` |
| `packages/api` | Fastify 5, Drizzle | `src/routes/`, `src/db/schema.ts`, `src/worker.ts` |
| `packages/shared` | Types, session helpers, `resolveShareImageUrl` | `src/scope-branding.ts` |
| `e2e/` | Playwright smoke | `smoke.spec.ts` |
| `legacy/` | Next.js reference | Read-only |

---

## 2. API audit

### 2.1 Route modules (all registered in `server.ts`)

**Implemented (not product stubs):** `auth`, `profile`, `settings`, `kink-tags`, `locations`, `upload`, `ecosystem-stubs` (core `/api/v1` social), `organizations`, `group-forums`, `group-reputation-routes`, `group-leadership-routes`, `conventions-routes`, `convention-organizer-routes` + `convention-organizer/*`, `convention-public-routes`, `convention-hub-ext-routes`, `convention-dancecard-routes`, `convention-iso-routes`, `iso-routes`, `presenter-profiles`, `matchmaker-routes`, `feed-routes`, `trending-routes`, `organizer-routes`, `share-routes` (`/share/*` OG HTML), `email-routes`, **`scope-email-routes`** (org/group mailing lists), `livekit-voice-routes`, vendor integrations, `moderation-profile-flags`, `ecke-publish-routes`, WebSocket `GET /api/ws`.

**Explicit thin/stub behavior:**

- `POST …/message-templates/test-send` → `{ simulated: true }` (no real send)
- `USE_DATABASE=false` → most `/api/v1/*` return **503**

### 2.2 Schema highlights (2026-05-24)

| Table / area | Shipped columns / behavior |
|--------------|----------------------------|
| **groups** | `logo_url`, `banner_url`, `share_image_url`, `email_signup_enabled`; optional `organization_id`; dormancy / leadership fields |
| **scope_email_subscribers** | Org/group mailing-list opt-ins (`scope_type`, `scope_id`, `email`, status) |
| **platform_email_captures** | Site-owner marketing archive (subscribe + broadcast events) |
| **events** | `group_id`, `organization_id`; IRL privacy (ADR 003); virtual + ticketing fields; RSVP approval |
| **organizations** | `community` jsonb; branding trio; composite `rating` |
| **conventions** | `settings` jsonb incl. `shareImageUrl`, `publicProgramListing`, `programStaffAttendeeRoles` |
| **Hub ext** | `convention_gallery_images` (+ `moderation_status`), `convention_pins`, `convention_channel_reads` — **`db:migrate-incremental`** + **`db:migrate-hub-ext`** |

### 2.3 Group events auth (G307–G312)

- `packages/api/src/lib/group-access.ts` — visibility + organizer roles (`owner|admin|moderator|event_host`)
- `GET/POST/PATCH /api/v1/events` with `groupId` filtering and `viewerCanManage` on GET

### 2.4 Branding & OG

- PATCH groups/orgs/convention settings for image URLs
- `GET /share/groups|orgs|conventions/:key` — crawler HTML (`share-routes.ts`)
- Web: `ScopeBrandingPanel`, `ScopePageMeta`, `/support/branding`

### 2.5 Tests (2026-06-06)

| Type | Count | Notes |
|------|-------|-------|
| **`npm test`** (default CI unit gate) | **251/251** | 55 files — `@c2k/shared` content-policy + `src/lib/*.test.ts` + `moderation-case-context` + **`http-smoke.test.ts` (16)** |
| **`npm run test:db -w @c2k/api`** | **57** | 10 files — notifications DB, wave7 CI smokes, moderation intake/admin, trust summary, media mod/assets/pipeline/scanner |
| Playwright (`npm run test:e2e`) | **85** unique | 21 spec files; full run **161 passed / 8 skipped** (desktop + mobile projects; seeded DB + Mailpit) |
| Command bridge | **52/53** | `node scripts/audit-command-bridge.mjs` — lookup token probe expected skip |

### 2.6 Group location (2026-05-24 automation)

| Item | Status |
|------|--------|
| `groups.place_id`, `service_radius_mi` | Schema + `db:migrate-incremental` |
| `PATCH/GET /api/v1/groups/:id` | `placeId`, `placeLabel`, `serviceRadiusMi` |
| `GET /api/v1/groups/nearby` | Haversine + profile geo fallback |
| Web | `PlaceRegionPicker`, `/groups` Near you tab, public hub “Serving {city}” |

### 2.7 Ops blockers

| Issue | Workaround |
|-------|------------|
| **`drizzle-kit push`** fails on `lower(name)` expression indexes | **`npm run db:migrate-incremental -w @c2k/api`** — see `technical-reference.md` |
| Hub tables | `npm run db:migrate-hub-ext -w @c2k/api` |
| Duplicate `GET …/maps` | Fixed — do not re-register from hub-ext |
| Worker | `npm run start:worker -w @c2k/api` for BullMQ |
| LiveKit / mail | Env-gated (`LIVEKIT_*`, `C2K_MAIL_*`, `C2K_PLATFORM_MAIL_BCC`) |
| K8s deploy | `k8s/base/` templates — see [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md) |

### 2.8 Mail & org/group email lists (2026-05-24 pass 4)

| Item | Status |
|------|--------|
| Dev SMTP (Mailpit) | `docker-compose.dev.yml` → `:1025` / UI `:8025`; `.env.development` defaults |
| `mailer.ts` platform BCC | `C2K_PLATFORM_MAIL_BCC` on all outbound sends |
| Org list | `community.emailListEnabled` + public signup + organizer broadcast |
| Group list | `groups.email_signup_enabled` + same API pattern |
| Platform export | `GET /api/v1/platform/email-captures?format=csv` for `C2K_PLATFORM_ADMIN_EMAILS` |
| K8s | `k8s/base/{namespace,configmap,secret.example,api-deployment,worker-deployment}.yaml` |
| Unsubscribe | `/email/unsubscribe` + `POST …/email-unsubscribe` |

**Gaps:** No double opt-in; convention `message-templates/test-send` still simulated; CAN-SPAM/legal copy is organizer responsibility.

---

## 3. Web audit

### 3.1 Route counts

- **70** child routes under `/` in `router.tsx`
- **14** `ComingSoonLayout` marketing/community shells
- **Hybrid** home, events, vendors, groups, discovery, messaging, notifications (API when auth + ready)

### 3.2 Organizer console

| Scope | Tabs | Status |
|-------|------|--------|
| **Org** | home, schedule, people, communications, settings, tools | ✅ Core; payments placeholder |
| **Group** | same six tabs | ⚠️ Home checklist hard-coded incomplete; photo/channel admin stubs |
| **Convention** | dashboard, program, venues, import, people, messaging, settings, exports, integrations | ✅ Dancecard parity; `assignments` via deep link only |

**Event manager:** `/organizer/orgs/:slug/events/:eventId` and `/organizer/groups/:id/events/:eventId` — `EventOrganizerPanel` ✅ (UUID only).

### 3.3 Groups public hub (dual mode)

| Mode | URL id | Tabs |
|------|--------|------|
| API | UUID | Forums, Feedback, Events, Members |
| Mock | slug / `g1`… | Channels, Events, Members, Resources, Photos |

### 3.4 Create flow

- Global `?create=event` / `?create=convention` from any route
- Munch + `prefillGroupId` supported
- Gaps: Rules textarea not sent; verification/vendor checkboxes non-functional

### 3.5 Env / mock matrix

| Signal | Effect |
|--------|--------|
| `VITE_HOME_DEMO_FALLBACK=true` | Mock catalogs on home/events/vendors when API empty |
| `isFallback` (demo session) | Blocks organizer, API notifications, some RSVP paths |
| UUID in URL | API path for events/groups/organizer |

---

## 4. Backlog queue (2026-05-24)

**Last drained:** 2026-05-24 pass 4

### Pending / partial (8)

| ID | Title |
|----|-------|
| C212 | Convention chat sub-channels (separate table) |
| C213 | **Partial** — attendee URL submit + moderation; S3 upload still organizer-only |
| C214 | Read receipts + threading UI |
| C215 | Push notifications for pinned convention activity |
| O75 | **Partial** — SMTP/Mailpit/K8s, org/group lists, BCC, RSVP; invite template + simulated test-send remain |
| O76 | Inline join org from HostedByCard |
| O77 | Pinned-conventions digest email (worker + transport ready) |

### Done in queue (G301–G312)

Groups/events scope + post-audit (filter, organizer panel, munch, mock tab hide, auth, E2E).

### Plans (`docs/plans/`)

| Plan | Todos | Status |
|------|-------|--------|
| `dancecard-organizer-full-parity.plan.md` | 13/13 | **Complete** |
| `groups-events-scope-parallel.plan.md` | 10/10 | **Complete** (set `status: completed` in frontmatter) |
| `group-location-discovery.plan.md` | 8/8 | **Complete** — `disc-2` home nearby groups rail shipped pass 3 |

---

## 5. Documentation health

| Document | Status after 2026-06-06 sync |
|----------|--------------------------------|
| `MASTER_NEXT_STEPS.md` | Single priority hub — T&S alpha + discover refresh |
| `PLATFORM_STATUS_AUDIT.md` | This file — pass 9 test-count refresh |
| `FEATURE_REGISTRY.md` | Pass 25 — moderation alpha, discover UI shells |
| `EXECUTIVE_PLATFORM_READINESS.md` | % rollup + test counts refreshed |
| `HANDOFF.md` | Session resume, env caveats |
| `PROJECT_ROADMAP.md` | Tracks A–D (alpha → home → social → UX debt) |
| `PILOT_READINESS.md` | Alpha verification checklist |

**Historical snapshots (do not use for routing):** [`archive/`](./archive/README.md) — legacy `PROJECT_AUDIT`, `FUNCTIONALITY_AND_STATUS`, routing/UX walkthrough audits.

---

## 6. Readiness by domain (%)

| Domain | Est. % | Δ vs Apr 2026 audit |
|--------|--------|---------------------|
| Identity & profiles | 84% | — |
| Discovery & home | **62%** | +4 (home nearby groups rail, Near you on discovery) |
| Events & calendar | 78% | — |
| Conventions & program | **85%** | +3 (public hub v2, registration) |
| Organizations hub | **78%** | +2 (public email list + broadcast) |
| Groups | **76%** | +4 (place_id, nearby API, Near you UI) |
| Presenters | 76% | — |
| Vendors & commerce | 70% | — |
| Messaging & notifications | 57% | — |
| Trust & safety | 72% | — |
| Education / long-tail | 38% | — |
| Engineering / QA | **74%** | +16 (`npm test` **251/251**, Playwright **85** unique, T&S verify scripts, K8s mail docs) |

**Weighted overall:** **~82–85%** (see executive doc). ¹

---

## 7. Verification snapshot (pass 9 — 2026-06-06)

| Check | Result |
|-------|--------|
| `npm run typecheck` | ✅ |
| `npm test` | ✅ **251/251** |
| `npm run test:db -w @c2k/api` | **57** cases defined (10 files; requires Postgres — skipped when DB off) |
| `npm run test:e2e` | ✅ **161 passed / 8 skipped** (~85 unique cases; seeded DB + Mailpit) |
| `node scripts/audit-command-bridge.mjs` | ✅ **52/53** (lookup token probe expected) |
| `npm run verify:alpha:auto:local` | ✅ **11/11** |
| `npm run verify:trust-safety` | ✅ green |

---

## 8. Line-by-line audit scope note

A literal line-by-line pass of every source file is not maintained in git (would be ~100k+ lines). This audit is **exhaustive at the subsystem level**: every route module, every `router.tsx` path, schema tables for product entities, backlog queue rows, and plan frontmatter todos. For file-level drill-down, use:

```bash
# Route registration
rg "reg\\(|app\\.(get|post|patch|delete)" packages/api/src/routes --glob "*.ts" -c
# Web routes
rg "path:|ComingSoonLayout" packages/web/src/router.tsx
# TODOs in product code
rg "TODO|FIXME" packages/web/src packages/api/src
```

---

*Next update: after LEGAL-ALPHA-1 owner smoke or discover UI consolidation (UI-DISC-1–3).*

¹ *Maturity percentages last calibrated **2026-06-06** alongside `npm test` **251/251** and Playwright **85** unique cases. Judgment-based planning estimates — not contractual SLAs.*
