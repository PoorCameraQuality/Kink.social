# Prelaunch audit: deployment & server readiness

**Audit ID:** 01-deployment-server-readiness  
**Date:** 2026-06-04  
**Scope:** Package scripts, Docker/K8s, env templates, API/web env usage, CORS/cookies, reverse proxy/WebSocket, S3/mail/Redis/DB, migrations, static assets, health checks.  
**Method:** Read-only codebase and operator-doc review. **No fixes applied.**

**Primary references:** [`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md), [`docs/FEATURE_REGISTRY.md`](../../FEATURE_REGISTRY.md) §7, [`docs/SERVER_MOUNT_RUNBOOK.md`](../../SERVER_MOUNT_RUNBOOK.md), [`docs/DEPLOY_SMOKE.md`](../../DEPLOY_SMOKE.md), [`docker-compose.dev.yml`](../../../docker-compose.dev.yml), [`docker-compose.prod.yml`](../../../docker-compose.prod.yml).

---

## 1. Executive summary

The monorepo is **engineering-ready for cutover** (runbooks, `docker-compose.prod.yml`, `k8s/base/`, `.env.production.example`, health endpoints, Caddy same-origin routing). **Production execution remains blocked** on hosting/DNS/TLS and operator sign-off per [`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md).

**Strengths**

- Clear split: **API** (`packages/api`: `start` / `start:worker`), **web** (Vite → nginx SPA), **worker** (BullMQ on Redis).
- **Same-origin** production pattern: Caddy routes `/api/*` → API, everything else → static web; web code predominantly uses relative `/api/...` with `credentials: 'include'`.
- **Readiness probe** at `GET /api/health/ready` with DB ping when `USE_DATABASE=true`.
- Documented migration path: `db:migrate-incremental`, optional `db:migrate-hub-ext`, organizer parity script.

**Gaps that will bite on first real deploy**

- `.env.production.example` omits **`USE_DATABASE`**, **`CORS_ORIGIN`**, full **S3** block, and **`AUTH_ALLOW_FALLBACK`** — easy to ship a “green” health check with a non-functional app.
- **`docker-compose.prod.yml`** has no object storage service; uploads require external S3/R2 + env not fully templated.
- **GitHub Deploy workflow** pulls and rebuilds only — **no migration step**, no smoke gate.
- **K8s `k8s/base/`** ships API + worker only (no web/ingress manifests); default **2 API replicas** need **`C2K_REALTIME_REDIS_BRIDGE=true`** or WebSocket subscribers miss events.
- Root **`.env.example`** is Phase C / Next.js–oriented and does not document the Fastify monorepo stack.

---

## 2. Blockers

| # | Blocker | Evidence |
|---|---------|----------|
| B1 | **No production host** (purchase, DNS, TLS) | [`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md) — deploy, prod SMTP A–E, live smokes blocked |
| B2 | **`USE_DATABASE=true` not in production template** | `.env.production.example` lacks it; without it, `/api/v1/*` returns **503** and readiness returns `database: "skipped"` (false “ready”) — [`packages/api/src/routes/health.ts`](../../../packages/api/src/routes/health.ts) |
| B3 | **Object storage not in prod compose** | `docker-compose.dev.yml` has MinIO; `docker-compose.prod.yml` does not — `getS3Client()` returns null without `S3_*` — [`packages/api/src/lib/s3-upload.ts`](../../../packages/api/src/lib/s3-upload.ts) |
| B4 | **Automated deploy does not run migrations** | [`.github/workflows/deploy.yml`](../../../.github/workflows/deploy.yml) — only `git pull` + `docker compose up -d --build` |
| B5 | **Prod mail off by default** | `C2K_MAIL_TRANSPORT` defaults to `disabled` in [`packages/api/src/lib/mailer.ts`](../../../packages/api/src/lib/mailer.ts); pilot needs SMTP/Resend + checklist A–E |
| B6 | **K8s path incomplete for full stack** | No web deployment or Ingress in `k8s/base/` — [`k8s/README.md`](../../../k8s/README.md) |

---

## 3. High-risk issues

| # | Issue | Detail |
|---|-------|--------|
| H1 | **Auth session fallback enabled by default in API** | `allowAuthFallback()` is true unless `AUTH_ALLOW_FALLBACK` or `VITE_AUTH_ALLOW_FALLBACK` is `'false'` — [`packages/api/src/auth/resolve-viewer.ts`](../../../packages/api/src/auth/resolve-viewer.ts). Unauthenticated `GET /api/auth/session` can return mock viewer `RopeDreamer`. Not documented in `.env.production.example`. |
| H2 | **`AUTH_SECRET` dev fallback in shared token lib** | `getSecret()` falls back to insecure string if unset — [`packages/shared/src/session-token.ts`](../../../packages/shared/src/session-token.ts). Login routes check `AUTH_SECRET` in production ([`packages/api/src/routes/auth.ts`](../../../packages/api/src/routes/auth.ts)), but any code path that encodes sessions without that guard is risky if misconfigured. |
| H3 | **Multi-replica WebSocket without Redis bridge** | `k8s/base/api-deployment.yaml` sets `replicas: 2`. Without `C2K_REALTIME_REDIS_BRIDGE=true`, schedule/org WS events only reach clients on the publishing pod — [`docs/REALTIME_SCALING.md`](../../REALTIME_SCALING.md), [`packages/api/src/lib/realtime-redis-bridge.ts`](../../../packages/api/src/lib/realtime-redis-bridge.ts). |
| H4 | **Split API subdomain breaks cookies** | Session cookie `c2k_session` is set on API host (`path: /`, `sameSite: 'lax'`, `secure` in production). Web uses relative `/api` (same site). If `VITE_API_URL` points to `https://api.domain.com` while the SPA is on `https://domain.com`, OAuth (Shopify) may work but **session cookie will not** attach to cross-origin fetches unless redesigned. |
| H5 | **`CORS_ORIGIN` missing from prod template** | Defaults to localhost origins only — [`packages/api/src/server.ts`](../../../packages/api/src/server.ts). Required if web and API are on different origins. |
| H6 | **`EXTERNAL_STORE_SECRET` optional with dev key derivation** | Warns and uses hashed dev key when unset — [`packages/api/src/lib/encrypt-external-secrets.ts`](../../../packages/api/src/lib/encrypt-external-secrets.ts). Production vendor integrations need a real secret (listed in `.env.production.example`). |
| H7 | **Readiness does not check Redis or worker** | `GET /api/health/ready` only pings Postgres. Redis down → WS bridge and BullMQ fail silently; worker not probed in compose/K8s. |
| H8 | **Deploy workflow has no health/smoke gate** | Failed migration or broken API can still “succeed” the Actions job if containers start. |
| H9 | **`C2K_PEOPLE_SYNC_QUEUE` documented but unused** | [`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md) references it; code uses `C2K_PEOPLE_SYNC_INLINE` only — [`packages/api/src/lib/convention-people-sync-queue.ts`](../../../packages/api/src/lib/convention-people-sync-queue.ts). Misleading ops doc. |

---

## 4. Medium-risk issues

| # | Issue | Detail |
|---|-------|--------|
| M1 | **No Fastify `trustProxy`** | No `trustProxy` / `X-Forwarded-*` handling in API. Behind Caddy this is often OK for cookies; **client IP** for rate limits and `C2K_ONE_PROFILE_PER_IP_STRICT` may be wrong (proxy IP only). |
| M2 | **`load-dev-env.ts` always imported** | [`packages/api/src/server.ts`](../../../packages/api/src/server.ts) imports `./load-dev-env.js`, which loads repo-root `.env.development` / `.env.local` **if present**. Docker `.dockerignore` excludes `.env.production` but not `.env.development`; if ever copied into images, could override prod `env_file`. |
| M3 | **Prod Postgres/Redis lack healthchecks** | `docker-compose.dev.yml` postgres has `healthcheck`; `docker-compose.prod.yml` does not — `depends_on` does not wait for DB ready. |
| M4 | **Web build-time env not enforced in compose** | `docker-compose.prod.yml` passes `VITE_API_URL` build arg (often empty). **`VITE_HOME_DEMO_FALLBACK`**, **`VITE_LEGAL_PUBLISHED`**, **`VITE_SITE_URL`** must be set at **image build**, not only in API `.env.production`. |
| M5 | **`DEPLOY_SMOKE.md` mentions Stripe keys** | §2 references “Stripe keys if used” — product guidance **rejects Stripe** in registration; doc is stale/misleading. |
| M6 | **Dual public URL env names** | API uses `C2K_PUBLIC_WEB_URL`, `C2K_WEB_PUBLIC_URL`, and fallbacks to `VITE_SITE_URL` in different routes — inconsistency increases misconfiguration risk. |
| M7 | **Platform staff UUIDs env-only** | `C2K_SITE_ADMIN_USER_IDS` / `C2K_PLATFORM_MODERATOR_USER_IDS` in `.env.development` only; not in `secret.example.yaml` — new prod DB needs seed or manual `platform_staff` rows for mod/admin. |
| M8 | **Service worker in production** | [`packages/web/src/main.tsx`](../../../packages/web/src/main.tsx) registers `/sw-offline.js` in PROD — verify cache busting and that Caddy/nginx serves it; dev explicitly blocks SW scripts in Vite. |
| M9 | **ECKE env not in production templates** | ECKE bridge vars documented in cutover log (`.env.local`); absent from `.env.production.example` / `k8s/base/secret.example.yaml` except indirectly — outbound publish disabled unless added. |
| M10 | **CI does not build Docker images or run compose** | [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) — typecheck + unit tests only; no prod compose config validation in CI. |

---

## 5. Low-risk issues

| # | Issue | Detail |
|---|-------|--------|
| L1 | **Root `package.json` has no `start` script** | Production starts per-package: `npm run start -w @c2k/api`, worker via `start:worker`. |
| L2 | **Node engines `>=18.x` vs Docker Node 20** | Root `engines` vs `docker/*.Dockerfile` use Node 20 — align docs for operators. |
| L3 | **`db:push` vs incremental migrate** | Runbook prefers `db:migrate-incremental`; `db:push` still exists with `--force` — operator confusion. |
| L4 | **Public seed assets route** | `GET /api/public-seed/paf/:filename` reads from dev seed image dir — low traffic; ensure not relied on in prod. |
| L5 | **`.env.example` vs monorepo** | Documents `NEXT_PUBLIC_*`, not `VITE_*` / `C2K_*` for main app. |
| L6 | **Worker single replica in K8s** | Appropriate for BullMQ; no HA story documented for worker pod death beyond restart. |

---

## 6. Dead/misleading UI found (deployment context)

| Item | Location | Note |
|------|----------|------|
| Legal “draft” banners | `/privacy`, `/terms`, `/guidelines` — `VITE_LEGAL_PUBLISHED` | Production builds without `VITE_LEGAL_PUBLISHED=true` show draft banner ([`packages/web/src/components/ui/LegalDraftPage.tsx`](../../../packages/web/src/components/ui/LegalDraftPage.tsx)). |
| Demo login affordance | [`packages/web/src/components/LoginCard.tsx`](../../../packages/web/src/components/LoginCard.tsx) | `VITE_SHOW_DEMO_LOGIN=true` or `import.meta.env.DEV` exposes demo login — should stay off in prod builds. |
| Shopify OAuth error copy | [`packages/web/src/components/VendorExternalStorePanel.tsx`](../../../packages/web/src/components/VendorExternalStorePanel.tsx) | “Set VITE_API_URL…” — same-origin prod may use empty `VITE_API_URL`; panel uses absolute API base for OAuth redirect. |
| `WelcomeBanner` “Search for members” | [`packages/web/src/components/WelcomeBanner.tsx`](../../../packages/web/src/components/WelcomeBanner.tsx) | Links to `/people` (verify route exists vs `/discovery`). |
| Stale doc: WelcomeBanner → `/chat` | [`docs/FEATURE_REGISTRY.md`](../../FEATURE_REGISTRY.md) §3 | Code links to `/messaging`; registry still says `/chat`. |
| `DEPLOY_SMOKE.md` Stripe mention | [`docs/DEPLOY_SMOKE.md`](../../DEPLOY_SMOKE.md) §2 | Implies payment stack; not part of C2K pilot deploy. |

---

## 7. Permission issues found

Deployment/runtime permission and access gaps (not RBAC code audit):

| Area | Finding |
|------|---------|
| **S3 uploads** | Without `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, upload routes fail (null client) — no graceful “storage disabled” product mode in prod template. |
| **Platform moderation** | `GET /api/v1/moderation/me` depends on `C2K_PLATFORM_MODERATOR_USER_IDS` and/or DB `platform_staff` — prod secret template does not include moderator UUIDs. |
| **Site admin** | `C2K_SITE_ADMIN_USER_IDS` required for tier-0 actions; same gap in K8s secret example. |
| **Email capture export** | `GET /api/v1/platform/email-captures` gated by `C2K_PLATFORM_ADMIN_EMAILS` matching session email — must set on API. |
| **Mail test send** | Operator smokes assume platform admin session — depends on staff seeding. |
| **WebSocket subscribe** | `authorizeWebSocketSubscribe` enforces scope permissions — misconfigured ingress (no WS upgrade) looks like “realtime broken”, not 403. |
| **LiveKit voice** | Missing `LIVEKIT_*` → token route **503** — optional but org voice appears broken without env. |

---

## 8. Missing env/config

### Documented in code/runbooks but missing or incomplete in `.env.production.example`

| Variable | Needed for |
|----------|------------|
| `USE_DATABASE` | All DB-backed routes + meaningful readiness |
| `CORS_ORIGIN` | Cross-origin SPA (comma-separated) |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`, `S3_PUBLIC_BASE_URL` | Uploads, branding, program assets |
| `AUTH_ALLOW_FALLBACK` or `VITE_AUTH_ALLOW_FALLBACK` | Must be `false` in prod |
| `C2K_REALTIME_REDIS_BRIDGE` | K8s / multi-replica API |
| `C2K_SITE_ADMIN_USER_IDS`, `C2K_PLATFORM_MODERATOR_USER_IDS` | Staff/mod gates |
| `RESEND_API_KEY` | If using Resend transport |
| `DATABASE_SSL` | Managed Postgres often needs `true` — see [`packages/api/src/db/index.ts`](../../../packages/api/src/db/index.ts) |
| `ECKE_PUBLISH_ENABLED`, `ECKE_SUPABASE_URL`, `ECKE_SUPABASE_SERVICE_ROLE_KEY` | ECKE outbound (optional) |
| `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` | Sheets integration (optional) |

### Web build-time (`VITE_*` — set when running `docker build` / `vite build`)

| Variable | Production expectation |
|----------|------------------------|
| `VITE_API_URL` | Empty or same origin; required if API on another host |
| `VITE_SITE_URL` | `https://yourdomain.com` — SEO/share links ([`packages/web/src/config/site.config.ts`](../../../packages/web/src/config/site.config.ts)) |
| `VITE_HOME_DEMO_FALLBACK` | **`false`** (explicit unset is OK — code checks `=== 'true'`) |
| `VITE_LEGAL_PUBLISHED` | `true` when counsel approves |
| `VITE_SHOW_DEMO_LOGIN` | unset / not `true` |
| `VITE_SHOW_HOME_DEBUG` | unset in prod |

### Misleading / dead config names

| Name | Issue |
|------|--------|
| `C2K_PEOPLE_SYNC_QUEUE` | Listed in cutover log; **not read** by code (use `C2K_PEOPLE_SYNC_INLINE` for dev inline sync) |
| `NEXT_PUBLIC_AUTH_ALLOW_FALLBACK` | In root `.env.example` only; API reads `AUTH_ALLOW_FALLBACK` / `VITE_AUTH_ALLOW_FALLBACK` |

---

## 9. Recommended fixes

1. Add **`USE_DATABASE=true`**, **`CORS_ORIGIN`**, **S3 block**, **`AUTH_ALLOW_FALLBACK=false`**, and **`C2K_REALTIME_REDIS_BRIDGE`** guidance to `.env.production.example`, `k8s/base/secret.example.yaml`, and SERVER_CUTOVER env table.
2. Extend **`docker-compose.prod.yml`** with optional MinIO profile **or** document required R2/S3 variables in mount runbook.
3. Add **migration + readiness smoke** to deploy pipeline (or documented manual gate before traffic).
4. K8s: add **web Deployment + Ingress** sample, or state “VPS compose only for static web”.
5. Set **`replicas: 1`** for API until Redis bridge verified, or default `C2K_REALTIME_REDIS_BRIDGE=true` in configmap when `replicas > 1`.
6. Extend **`/api/health/ready`** with optional Redis ping when `USE_DATABASE=true` and bridge enabled.
7. Align **`.env.example`** with monorepo (`VITE_*`, `C2K_*`, pointer to `.env.development`).
8. Remove **Stripe** reference from `DEPLOY_SMOKE.md`; fix **`C2K_PEOPLE_SYNC_QUEUE`** in cutover log.
9. Document **`trustProxy`** requirement if rate limits or IP strictness matter behind reverse proxy.
10. CI: add `docker compose -f docker-compose.prod.yml config` validation job.

---

## 10. Files likely affected

| Area | Paths |
|------|--------|
| Env templates | `.env.production.example`, `.env.example`, `.env.development`, `k8s/base/secret.example.yaml`, `k8s/base/configmap.yaml` |
| Compose / proxy | `docker-compose.prod.yml`, `docker-compose.dev.yml`, `Caddyfile`, `docker/api.Dockerfile`, `docker/web.Dockerfile`, `docker/nginx-spa.conf` |
| API runtime | `packages/api/src/server.ts`, `packages/api/src/load-dev-env.ts`, `packages/api/src/routes/health.ts`, `packages/api/src/routes/auth.ts`, `packages/api/src/db/index.ts` |
| Worker / queues | `packages/api/src/worker.ts`, `packages/api/src/lib/*-queue.ts`, `packages/api/src/lib/realtime-redis-bridge.ts` |
| Web build | `packages/web/vite.config.ts`, `packages/web/package.json`, `packages/web/src/main.tsx` |
| Deploy CI | `.github/workflows/deploy.yml`, `.github/workflows/ci.yml` |
| Docs | `docs/SERVER_CUTOVER_LOG.md`, `docs/SERVER_MOUNT_RUNBOOK.md`, `docs/DEPLOY_SMOKE.md`, `docs/FEATURE_REGISTRY.md` §7 |
| K8s | `k8s/base/api-deployment.yaml`, `k8s/base/worker-deployment.yaml` |

---

## 11. Suggested tests

| Test | Command / action |
|------|------------------|
| Compose config parse | `docker compose -f docker-compose.prod.yml config` |
| Liveness | `curl -s https://<host>/api/health` → `{ "ok": true }` |
| Readiness (DB) | `curl -s https://<host>/api/health/ready` → `database: "ok"` with `USE_DATABASE=true` |
| CORS preflight | `OPTIONS` from production web origin to `/api/auth/session` with credentials |
| Session cookie | Login over HTTPS; verify `c2k_session` `Secure`, `HttpOnly`, `SameSite=Lax` |
| WS | Open convention or org hub; confirm `wss://<host>/api/ws` subscribe + schedule event |
| Multi-replica WS | Two API pods + `C2K_REALTIME_REDIS_BRIDGE=true`; publish on pod A, client on pod B receives event |
| Upload | `POST` upload route with auth; object reachable at `S3_PUBLIC_BASE_URL` |
| Worker mail | Worker logs + `node scripts/smoke-transactional-mail.mjs` against prod base |
| Pilot smokes | `SMOKE_BASE` / `API_BASE` — [`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md) § On mount |
| Alpha gate (local) | `npm run verify:alpha` before tagging release |
| Build flags | Inspect built JS for `VITE_HOME_DEMO_FALLBACK` and legal banners |

---

## 12. Confidence level

**High (≈85%)** for architecture, env names, and compose/K8s shape — directly verified in source and committed templates.

**Medium** for operator-specific production values (exact S3 provider, ingress controller, TLS termination) — not exercised in this audit environment.

**Lower** for Caddy WebSocket edge behavior and Windows-specific Postgres SSL — documented patterns only; validate on first staging host.

---

## Required production env var list

### Core (API + worker — `.env.production` / K8s secret)

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | Yes | `production` (set in compose/K8s) |
| `HOST` | Yes | `0.0.0.0` in containers |
| `PORT` | Yes | `3001` |
| `USE_DATABASE` | **Yes** | `true` |
| `DATABASE_URL` | Yes | Postgres connection string |
| `DATABASE_SSL` | If managed PG | `true` when provider requires TLS |
| `REDIS_URL` | Yes | BullMQ + optional WS bridge |
| `AUTH_SECRET` | Yes | Strong random; login fails without in prod |
| `COOKIE_SECRET` | Yes | Fastify cookie plugin |
| `CORS_ORIGIN` | If split origin | Comma-separated web URL(s) |
| `AUTH_ALLOW_FALLBACK` | Yes | **`false`** for pilot/prod |

### Public URLs

| Variable | Required | Notes |
|----------|----------|-------|
| `C2K_PUBLIC_WEB_URL` | Yes (mail/digests) | No trailing slash |
| `API_PUBLIC_URL` | If Shopify OAuth | Public API base for redirect_uri |
| `C2K_WEB_PUBLIC_URL` | Optional | ICS/links; falls back to `VITE_SITE_URL` |

### Mail (pilot)

| Variable | Required | Notes |
|----------|----------|-------|
| `C2K_MAIL_TRANSPORT` | Yes | `smtp` or `resend` |
| `C2K_MAIL_FROM` | Yes | Verified domain |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | If SMTP | |
| `RESEND_API_KEY` | If Resend | |
| `C2K_ORG_JOIN_EMAIL` | Recommended | `true` |
| `C2K_EVENT_RSVP_EMAIL` | Recommended | `true` |
| `C2K_SCOPE_EMAIL_DOUBLE_OPTIN` | Product choice | |
| `C2K_PLATFORM_MAIL_BCC` | Recommended | |
| `C2K_PLATFORM_ADMIN_EMAILS` | Recommended | Capture export |

### Storage & integrations

| Variable | Required | Notes |
|----------|----------|-------|
| `S3_ENDPOINT` | Yes (uploads) | R2/MinIO/S3 |
| `S3_BUCKET` | Yes | |
| `S3_ACCESS_KEY` | Yes | |
| `S3_SECRET_KEY` | Yes | |
| `S3_PUBLIC_BASE_URL` | Recommended | CDN/public URL for images |
| `EXTERNAL_STORE_SECRET` | If vendors | Encrypt Shopify/Woo tokens |

### Hardening & scale

| Variable | Required | Notes |
|----------|----------|-------|
| `C2K_RATE_LIMIT_DISABLE` | Must be unset/false | |
| `C2K_REALTIME_REDIS_BRIDGE` | If API replicas > 1 | `true` |
| `C2K_SITE_ADMIN_USER_IDS` | Pilot ops | Comma UUIDs |
| `C2K_PLATFORM_MODERATOR_USER_IDS` | Pilot ops | Comma UUIDs |

### Web push (optional)

| Variable | Notes |
|----------|-------|
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | |
| `C2K_PUSH_ANNOUNCEMENTS`, `C2K_PUSH_CHAT` | Default on when VAPID set |

### Web **build** args (Docker `web` service)

| Variable | Notes |
|----------|-------|
| `VITE_API_URL` | Same-origin: empty; split: full API URL |
| `VITE_SITE_URL` | Canonical site URL |
| `VITE_HOME_DEMO_FALLBACK` | Do not set `true` |
| `VITE_LEGAL_PUBLISHED` | `true` when live |

---

## Missing env vars (summary)

Compared to **code requirements** vs **`.env.production.example` + `k8s/base/secret.example.yaml`**:

- `USE_DATABASE`, `CORS_ORIGIN`, entire `S3_*` set, `AUTH_ALLOW_FALLBACK`, `DATABASE_SSL`, `RESEND_API_KEY`, `C2K_REALTIME_REDIS_BRIDGE`, staff UUID envs, ECKE vars, optional `LIVEKIT_*`, Google OAuth, all `VITE_*` build vars (only commented in example).

---

## Server startup sequence

### Local development

1. `docker compose -f docker-compose.dev.yml up -d` (postgres, redis, mailpit, minio).
2. `npm run db:prepare` (wait postgres → push → incremental migrate → seed).
3. `npm run dev` (Vite `:5173` proxies `/api` → API `:3001`).
4. Optional: `npm run start:worker -w @c2k/api` (separate terminal) for BullMQ digests/sync.

### VPS production (`docker-compose.prod.yml`)

1. Operator creates `.env.production` from example (secrets, `USE_DATABASE=true`, mail, S3, staff IDs).
2. DNS → VPS; set `DOMAIN` for Caddy.
3. **Migrations** (manual/CI — not in deploy workflow):
   - `npm run db:migrate-incremental -w @c2k/api`
   - Optional: `npm run db:migrate-hub-ext -w @c2k/api`
   - Optional: `npx tsx packages/api/scripts/migrate-organizer-parity.ts`
4. `docker compose -f docker-compose.prod.yml up -d --build` (caddy, web, api, worker, postgres, redis).
5. API: `node dist/server.js` → listen → `initRealtimeRedisBridge`.
6. Worker: `node dist/worker.js` → BullMQ workers + repeatable sweeps.
7. Verify `GET /api/health/ready` via public URL.
8. Run prod smokes from laptop ([`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md)).

### Kubernetes (partial template)

1. `kubectl apply` namespace, configmap, secret.
2. Migrations from bastion/Job (same npm scripts).
3. Apply API (2 replicas) + worker (1 replica).
4. Configure Ingress/TLS and **separate web static** (not in repo base).
5. Rollout status + readiness probe on `/api/health/ready`.

---

## Deployment risks

| Risk | Impact |
|------|--------|
| Deploy without migrations | Schema drift, 500s on new columns |
| `USE_DATABASE` false | App appears “up”, features 503 |
| Missing S3 | Broken uploads/branding |
| Mail `disabled` | No RSVP/org mail; digests no-op |
| 2× API without Redis bridge | Intermittent realtime |
| Auth fallback left on | Mock viewer leaks into API responses |
| Weak/default secrets | Session forgery / cookie tampering |
| No worker process | Queued email, sync, moderation jobs stall |
| Split-domain API without cookie plan | Auth appears broken |
| Stale `VITE_HOME_DEMO_FALLBACK=true` in image | Signed-in users see demo data |
| Git push deploy on broken build | Downtime until manual rollback |

---

## Recommended deployment checklist

### Pre-flight (repo + operator)

- [ ] Read [`docs/SERVER_MOUNT_RUNBOOK.md`](../../SERVER_MOUNT_RUNBOOK.md) and [`docs/PROD_SMTP_K8S_CHECKLIST.md`](../../PROD_SMTP_K8S_CHECKLIST.md)
- [ ] Choose VPS compose **or** K8s (+ ingress + static web plan)
- [ ] Generate `AUTH_SECRET`, `COOKIE_SECRET`, `EXTERNAL_STORE_SECRET`
- [ ] Provision Postgres, Redis, S3/R2
- [ ] DNS A/AAAA, TLS (Caddy or LB)
- [ ] Build web with `VITE_HOME_DEMO_FALLBACK` not true, `VITE_LEGAL_PUBLISHED` per counsel

### Deploy day

- [ ] `.env.production` includes `USE_DATABASE=true`, mail block, S3 block, `AUTH_ALLOW_FALLBACK=false`
- [ ] `CORS_ORIGIN` set if needed
- [ ] Run incremental (+ optional) migrations against prod DB
- [ ] `docker compose -f docker-compose.prod.yml up -d --build` **or** K8s rollout
- [ ] Confirm **worker** container running with same env as API
- [ ] `curl` `/api/health` and `/api/health/ready` (`database: "ok"`)
- [ ] Login test (HTTPS cookie)
- [ ] WS test on convention/org page
- [ ] Upload test
- [ ] `C2K_REALTIME_REDIS_BRIDGE=true` if API replicas > 1
- [ ] Prod smokes: `pilot-readiness-smoke.mjs`, registration, reports, command-bridge audit
- [ ] [`docs/PILOT_READINESS.md`](../../PILOT_READINESS.md) Tier 1 rows A + F

### Post-deploy

- [ ] Update [`docs/SERVER_CUTOVER_LOG.md`](../../SERVER_CUTOVER_LOG.md) sign-off tables
- [ ] Monitor API/worker logs for Redis/mail/S3 errors
- [ ] Confirm rate limits active (`C2K_RATE_LIMIT_DISABLE` unset)

---

## Phase 3 Wave 2 fixes (2026-06-04)

**Scope:** Deployment safety only — no UI or product behavior changes.

| Audit finding | Wave 2 resolution |
|---------------|-------------------|
| B2 `USE_DATABASE` missing from template | Added to `.env.production.example` and `k8s/base/secret.example.yaml` |
| B3 No object storage in prod compose | Documented external S3 requirement; env placeholders added; `docker-compose.prod.yml` comments |
| B4 Deploy skips migrations | `.github/workflows/deploy.yml` runs `npm run db:migrate-prod` before compose |
| H1 Auth fallback default on | `production-guard.ts` — prod always off; fatal startup if explicitly `true` |
| H5 `CORS_ORIGIN` missing | Added to prod template and k8s secret example |
| M4 Web build env | Documented in `.env.production.example` and `DEPLOYMENT_RUNBOOK.md` §2 |
| M9 ECKE env missing | ECKE block added to prod template and k8s secret example |

**New artifacts:** [`docs/DEPLOYMENT_RUNBOOK.md`](../../DEPLOYMENT_RUNBOOK.md), `scripts/guard-not-production.mjs`, `scripts/verify-migrate-env.mjs`, root `db:migrate-prod`.

**Remaining from this audit:** B1 no production host, B5 prod mail off by default (operator config), B6 K8s incomplete stack, H3–H9 operational gaps (Redis readiness, smoke gate in deploy, trustProxy).

---

*End of audit 01 — deployment & server readiness.*
