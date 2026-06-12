# Technical reference — C2K monorepo

**Last updated:** 2026-06-06 (worker queue list, test inventory, design tokens vs `globals.css`)

| Item | Version / note |
|------|----------------|
| **Node** | >= 18.x (`package.json` engines) |
| **Frontend** | Vite 6 + React 18 + React Router 7 + Tailwind CSS 3 (`packages/web`) |
| **Backend** | Fastify 5 + TypeScript (`packages/api`) |
| **Shared** | `@c2k/shared` — browser-safe helpers + `session-token` subpath (Node, API-only) |
| **DB** | PostgreSQL 16 + PostGIS (`postgis/postgis:16-3.4` in Docker) |
| **ORM** | Drizzle ORM + `drizzle-kit push` (`drizzle.config.cjs` sets `extensionsFilters: ['postgis']` + excludes PostGIS catalog tables so push does not target `spatial_ref_sys`, etc.) |
| **Cache / jobs** | Redis 7 + BullMQ — worker in `packages/api/src/worker.ts` (9 queues; see [`architecture/11-background-workers.md`](./architecture/11-background-workers.md)) |
| **Object storage** | MinIO locally (S3-compatible); `@aws-sdk/client-s3` in API |
| **E2E** | Playwright — **21** spec files under `e2e/`; `npm run test:e2e` (see `test:e2e:smoke`, `test:e2e:alpha-gate` in root `package.json`) |
| **WebSocket (dev)** | `GET ws://…/api/ws` — minimal `ping` / `{type:"ping"}` → `{type:"pong"}`; multi-replica bridge: `C2K_REALTIME_REDIS_BRIDGE` → `realtime-redis-bridge.ts` |
| **Worker** | `npm run build -w @c2k/api && npm run start:worker -w @c2k/api` — queues: **`c2k-moderation`**, **`c2k-external-sync`**, **`c2k-lifecycle`**, **`c2k-convention-people-sync`**, **`c2k-convention-participation-offer`**, **`c2k-feed-activities`**, **`c2k-ecke-publish`**, **`c2k-media-rss`** |

**Brand & naming:** Public product is **Kink Social** at **kink.social**. **C2K** is the internal codename — repo path, `@c2k/*` packages, `C2K_*` env vars, and BullMQ queue prefixes are unchanged. **Dance Card by Kink Social** is the convention attendee product. **ECKE** is the legacy SEO bridge only.

> **Unity:** This repository is a web monorepo; no Unity editor version applies. If a Unity client is added later, pin `major.minor.patch` here and in project settings.

## Layout

- `packages/web` — SPA, `src/router.tsx`, Vite dev server `:5173`, proxies `/api` → `:3001`
- `packages/api` — REST + cookies; `src/server.ts` entry
- `packages/shared` — types/utilities; `exports["./session-token"]` for HMAC signed cookies
- `docker-compose.dev.yml` — **`postgres`**, **`redis`**, **`mailpit`**, **`minio`**; optional **`clamav`** (`--profile scanners`)
- `docker-compose.prod.yml` — Caddy + web (nginx) + api + worker + Postgres + Redis
- `k8s/base/` — example Kubernetes manifests (api + worker share mail Secret)
- [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md) — SMTP, org/group lists, platform BCC, K8s apply steps

## Environment

- **`.env.development`** (committed — local defaults; there is no separate `.env.development.example`) — loaded by Vite (`envDir` = repo root) and API/worker via `load-dev-env.ts`. Key values match `docker-compose.dev.yml`:

| Variable | Dev default | Maps to |
|----------|-------------|---------|
| `USE_DATABASE` | `true` | API + UI use Postgres (required for `db:prepare`) |
| `DATABASE_URL` | `postgresql://c2k:c2k_dev@127.0.0.1:6432/c2k_dev?sslmode=disable` | Compose service **`postgres`** (host **6432** → container 5432) |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Compose service **`redis`** |
| `S3_ENDPOINT` | `http://127.0.0.1:9000` | Compose service **`minio`** (console **9001**, creds `minioadmin` / `minioadmin`) |
| `C2K_MAIL_TRANSPORT` | `smtp` | Compose service **`mailpit`** — SMTP **1025**, UI http://127.0.0.1:**8025** |
| `VITE_API_URL` | `http://127.0.0.1:3001` | Fastify on host (**not** in Compose) |
| `VITE_SITE_URL` / `C2K_PUBLIC_WEB_URL` | `http://127.0.0.1:5173` | Vite on host (**not** in Compose) |

`DATABASE_URL` includes `sslmode=disable` so Node clients do not hang on TLS negotiation against the non-TLS Docker Postgres (especially on Windows).

- **`.env.local`** (gitignored) — ECKE bridge secrets (`ECKE_PUBLISH_*`, `ECKE_SUPABASE_*`); overrides `.env.development`. See [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md).
- **`.env.production`** — **not** committed; use `.env.production.example` on the VPS. For managed Postgres that requires TLS, set `DATABASE_SSL=true` and use a URL without `sslmode=disable` as your provider documents.

### ECKE outbound bridge (Phase C — 2026-05-27)

| Command | Purpose |
|---------|---------|
| `npm run smoke:ecke-bridge -w @c2k/api` | Pilot publish convention → ECKE Supabase `events` |
| `npm run verify:c2k-bridge` | ECKE repo — count rows with `c2k_source_id` |

Requires `.env.local` with `ECKE_PUBLISH_ENABLED=true` and ECKE service role. **`C2K_ECKE_PUBLISH_INLINE=true`** skips Redis for entity jobs in dev. Full runbook: [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md).

### Web demo vs API-backed UI (Vite)

| Variable | Default | Effect |
|----------|---------|--------|
| `VITE_HOME_DEMO_FALLBACK` | unset / `false` | When signed in, **`/home`** and **`/events`** use API data only — empty sections stay empty on empty 2xx (no mock backfill). |
| `VITE_HOME_DEMO_FALLBACK=true` | demo mode | Signed-in home/events may show mock catalogs and sidebar demo RSVPs for local demos without seed data. |

Set in repo-root `.env.development` or `.env.local` (Vite `envDir` = monorepo root). Do **not** enable in production unless you intentionally want demo content for logged-in users.

### If `npm run db:prepare` hangs or never prints

1. Confirm containers: `docker compose -f docker-compose.dev.yml ps` — Postgres should be **healthy** (healthcheck added in compose).
2. `npm run db:prepare` runs `scripts/wait-for-postgres.mjs` first (port **6432** on `127.0.0.1`). If it exits with an error, Postgres is not reachable from the host (Docker not running, wrong port, or firewall).
3. Ensure nothing else is bound to `127.0.0.1:6432`.
4. Production / SSL: the API `pg` pool uses `ssl: false` unless `DATABASE_SSL=true`.

### If `db:push` fails with module resolution errors

`drizzle-kit` reads `packages/api/src/db/schema.ts` directly. If tooling cannot resolve workspace packages, build shared first:

```bash
npm run build -w @c2k/shared
npm run db:push -w @c2k/api
```

### If `db:push` fails with drizzle-kit Zod / expression index errors

Some convention organizer tables define **SQL expression indexes** (e.g. `lower(name)` on `convention_locations`, `convention_tracks`, `convention_tags`). Current `drizzle-kit` can throw a Zod parse error on `index.expression` during `push` even when Postgres is healthy.

**Do not** block local dev on a full push. Use this playbook:

| Step | Command / action |
|------|------------------|
| 1 | Start Postgres: `docker compose -f docker-compose.dev.yml up -d postgres` |
| 2 | Build shared (if needed): `npm run build -w @c2k/shared` |
| 3 | Try push once: `npm run db:push -w @c2k/api` — if it succeeds, run `npm run db:seed -w @c2k/api` and stop |
| 4 | **Hub v2 tables** (gallery, pins, channel reads): `npm run db:migrate-hub-ext -w @c2k/api` |
| 5 | **Incremental columns** (branding, group location, gallery moderation, **scope email lists**): `npm run db:migrate-incremental -w @c2k/api` — idempotent SQL in `packages/api/scripts/apply-incremental-migration.ts` (also run by `npm run db:prepare`) |
| 6 | Seed if fresh DB: `npm run db:seed -w @c2k/api` |
| 7 | Restart worker after new tables: `npm run build -w @c2k/api && npm run start:worker -w @c2k/api` |

**Manual SQL (when a new column is not yet in the incremental script):**

```sql
-- Example: group home region (see apply-incremental-migration.ts for current list)
ALTER TABLE groups ADD COLUMN IF NOT EXISTS place_id uuid REFERENCES places(id) ON DELETE SET NULL;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS service_radius_mi integer NOT NULL DEFAULT 50;
```

**Verify:** API boots without “column does not exist”; `GET /api/health/ready` returns 200 with DB ping.

**Production:** Backup first, then push **or** run the same idempotent migration scripts against the target `DATABASE_URL`.

### If the browser shows connection refused on `:5173`

Docker Compose runs **`postgres`**, **`redis`**, **`mailpit`**, and **`minio`** only. **Vite and Fastify run on the host** via `npm run dev` — start that from repo root before opening http://127.0.0.1:5173 (or http://localhost:5173).

## Semantic CSS tokens (`packages/web/src/app/globals.css`)

Primary design contract: **`--dc-*`** tokens (see [`C2K-DESIGN-SYSTEM.md`](./C2K-DESIGN-SYSTEM.md)). Legacy aliases:

| Variable | Purpose |
|----------|---------|
| `--c2k-danger` | Destructive actions, badges, errors |
| `--c2k-success` | Positive confirmation |
| `--c2k-warning` | Caution states |

## Auth (Phase C → Fastify)

- **Cookie:** `c2k_session` (HMAC via `@c2k/shared/session-token`)
- **Org reviews → global trust (optional):** set `ORG_REVIEW_PROPAGATES_GLOBAL_TRUST=true` only if you want the legacy behavior where org/event star reviews bump staff `profiles.trustScore`. Default in `.env.production.example` is `false` so org composite rating stays org-local unless you opt in.
- **Routes:** `GET/POST /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/register` (when `USE_DATABASE=true`)
- **Platform moderators:** optional `C2K_PLATFORM_MODERATOR_USER_IDS` (comma-separated user UUIDs) — profile review flag queue and group leadership election finalize; see `docs/FEATURE_REGISTRY.md` §7.
- **Viewer:** `resolveViewerFromRequest()` in `packages/api/src/auth/resolve-viewer.ts`
- **Client:** `AuthProvider` + `useAuth()` / `useViewerUsername()` in `packages/web`

## Commands

```bash
cd coast-to-coast-kink
docker compose -f docker-compose.dev.yml up -d   # postgres, redis, mailpit, minio
npm install
npm run db:prepare   # wait-for-postgres + db:push + db:migrate-incremental + db:seed + db:ensure-preview-attendee-parity
npm run dev          # concurrently: Vite :5173 + API :3001
```

Split dev processes (optional):

```bash
npm run dev:web      # Vite only (:5173)
npm run dev:api      # Fastify only (:3001)
```

Production-style schema apply (remote DB — see `scripts/verify-migrate-env.mjs`):

```bash
npm run db:migrate-prod   # build api + db:push + db:migrate-hub-ext + db:migrate-incremental + db:migrate-organizer-parity
```

BullMQ worker (requires `npm run build -w @c2k/api` first — runs `node dist/worker.js`):

```bash
npm run build -w @c2k/api
npm run start:worker -w @c2k/api
```

Optional ClamAV for media scanner dev:

```bash
docker compose -f docker-compose.dev.yml --profile scanners up -d clamav   # 127.0.0.1:3310
```

### Preview URLs (local progress)

| What | URL |
|------|-----|
| Web app | http://127.0.0.1:5173 |
| API health | http://127.0.0.1:3001/api/health |
| Mailpit (captured SMTP) | http://127.0.0.1:8025 |
| Org directory (needs DB) | http://127.0.0.1:5173/orgs |
| Org hub + Calendar tab (needs DB + seed) | http://127.0.0.1:5173/orgs/demo-east-collective → **Calendar** |
| Convention program (needs `db:prepare` seed) | http://127.0.0.1:5173/conventions/seed-demo-con-program |
| Gated program demo (public vs attendee — see doc) | http://127.0.0.1:5173/conventions/seed-demo-con-gated |
| **Anonymous vs logged-in demo links** | [`docs/LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md) |
| MinIO console | http://127.0.0.1:9001 (`minioadmin` / `minioadmin`) |

Compose provides **`postgres`**, **`redis`**, **`mailpit`**, and **`minio`**; **Vite and Fastify run on the host** via `npm run dev` for hot reload.

Optional — database steps outside `db:prepare` (`USE_DATABASE=true` is already set in `.env.development`):

```bash
npm run db:push -w @c2k/api
npm run db:migrate-hub-ext -w @c2k/api
npm run db:migrate-incremental -w @c2k/api
npm run db:seed -w @c2k/api
npm run db:seed:locations -w @c2k/api
```

Regenerate Census-derived place list (requires network): `npm run build:places-data -w @c2k/api`. See [locations.md](./locations.md) for thresholds (`10_000` default, `5` places minimum per state) and scope (US states + DC only).

## ISO (wishlist) data

When `USE_DATABASE=true`, Drizzle manages **`user_iso_posts`** (one row per user), **`user_iso_images`** (up to three URLs per user), **`convention_iso_listings`** (per-convention pin with optional staff removal), and **`conversations.dm_entry_point` / `iso_subject_user_id`** for ISO-sourced DMs. Convention **`settings.isoBoardEnabled`** gates the board (default on). After schema changes, run `npm run db:prepare` (push + migrate-incremental + seed + preview attendee parity) or individual `@c2k/api` db scripts. API unit tests: `npm run test -w @c2k/api` (`src/lib/iso-access.test.ts` covers visibility, board defaults, inbox folder rules, and ISO body validation).

## Tests

- **Unit / HTTP smoke (default gate):** `npm test` (repo root) — Node test runner over an explicit file list in `packages/api/package.json` plus `@c2k/shared` policy tests (~**55** files; last green count **251/251** — see [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md)).
- **DB integration:** `npm run test:db -w @c2k/api` (Postgres required).
- **Typecheck:** `npm run typecheck` — `@c2k/shared`, `web`, `@c2k/api`.
- **PR CI:** `.github/workflows/ci.yml` runs `npm ci`, `npm run typecheck`, and `npm run test -w @c2k/api` on pushes/PRs to `main`.
- **Playwright:** **21** spec files — `npm run test:e2e` (full matrix; config starts `npm run dev` unless `CI` is set). Focused gates from root `package.json`:
  - `npm run test:e2e:smoke` — route smoke (desktop + mobile) + auth
  - `npm run test:e2e:alpha-gate` — smoke + alpha routes/flows + door + moderation-ts (included in `verify:alpha:auto`)
  - `npm run test:e2e:trust-safety` — `moderation-ts.spec.ts`; `test:e2e:trust-safety:media` → `media-ts.spec.ts`
  - `npm run test:e2e:install` — `playwright install chromium`
- **T&S scripts (not in default alpha gate):** `npm run verify:trust-safety` and sub-commands in root `package.json` (`verify:trust-safety:unit`, `:legal-profile`, `:dmca`, etc.).

## Docs

- **ADR 002 (org WS subscribe auth, LiveKit voice token, digest mail):** `docs/adr/002-org-realtime-chat-and-digests.md` — env vars in `docs/FEATURE_REGISTRY.md` §7 (`C2K_MAIL_*`, `LIVEKIT_*`, `C2K_PUBLIC_WEB_URL`).
- **Local demo URLs (incognito vs `RopeDreamer`):** `docs/LOCALHOST_DEMO_LINKS.md`
- **Deploy smoke:** `docs/DEPLOY_SMOKE.md` — GitHub Actions secrets and VPS checklist.
- **Feature registry:** `docs/FEATURE_REGISTRY.md` — single source of truth for every feature and editable config. Use before releases or migrations.
- **Executive readiness:** `docs/EXECUTIVE_PLATFORM_READINESS.md` — leadership-facing % maturity rollup (complements the registry).
