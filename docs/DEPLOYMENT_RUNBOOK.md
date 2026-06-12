# C2K deployment runbook

**Last updated:** 2026-06-06 (migration sequence + worker queues vs `worker.ts`)

**Audience:** Operators performing first production or staging deploy on a VPS or Kubernetes cluster.

**Related docs:** [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) (mount checklist), [`DEPLOY_SMOKE.md`](./DEPLOY_SMOKE.md) (post-deploy smokes), [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) (mail sign-off), [`.env.production.example`](../.env.production.example).

---

## 1. Required services

| Service | Role | Prod compose | K8s |
|---------|------|--------------|-----|
| **Postgres** (PostGIS) | Primary data store | `postgres` service (`POSTGRES_*` in `.env.production`) | External or in-cluster |
| **Redis** | BullMQ queues, optional WS bridge | `redis` service | External or in-cluster |
| **API** | Fastify HTTP + WebSocket | `api` service | `c2k-api` deployment (`c2k-api-config` + `c2k-mail-secret`) |
| **Worker** | BullMQ jobs — moderation notify, vendor sync, lifecycle sweeps/digests, people-directory sync, participation-offer email, feed activities, ECKE publish, media RSS (`packages/api/src/worker.ts`) | `worker` service | `c2k-worker` deployment (same env sources as API) |
| **Web** | Static SPA (nginx) | `web` service | CDN or separate deployment |
| **Reverse proxy** | TLS, same-origin `/api` | Caddy (`caddy` service, `DOMAIN` env) | Ingress / LB |
| **S3-compatible storage** | Uploads, organizer assets | **External** (not in compose) | External bucket + keys |
| **SMTP or Resend** | Transactional mail | External | External |

---

## 2. Required environment variables

Copy [`.env.production.example`](../.env.production.example) → `.env.production` and fill all **required** keys.

**Minimum for a functional pilot:**

| Variable | Notes |
|----------|--------|
| `NODE_ENV=production` | Set by compose for api/worker |
| `USE_DATABASE=true` | Without this, API returns 503 for most routes |
| `DATABASE_URL` | Production Postgres connection string |
| `REDIS_URL` | Production Redis |
| `AUTH_SECRET`, `COOKIE_SECRET` | Strong random values; never reuse dev secrets |
| `AUTH_ALLOW_FALLBACK=false` | **Required** — API refuses startup if `true` in production |
| `CORS_ORIGIN` | Public web origin(s), comma-separated if multiple |
| `C2K_PUBLIC_WEB_URL` | Canonical site URL (no trailing slash) |
| `DOMAIN` | Hostname for Caddy TLS in [`docker-compose.prod.yml`](../docker-compose.prod.yml) |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Postgres container only (compose); align `DATABASE_URL` host `postgres` |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Required if uploads are enabled |
| `C2K_MAIL_TRANSPORT`, `C2K_MAIL_FROM`, SMTP_* or `RESEND_API_KEY` | Required for pilot mail |

**Web build-time ([`docker-compose.prod.yml`](../docker-compose.prod.yml) `web.build.args`):**

- `VITE_API_URL=` — leave empty for same-origin Caddy; set full API URL only for split-origin

[`docker/web.Dockerfile`](../docker/web.Dockerfile) currently wires only `VITE_API_URL`. Unset `VITE_HOME_DEMO_FALLBACK` is production-safe (no demo catalog). Set `VITE_SITE_URL` / `VITE_LEGAL_PUBLISHED` via Dockerfile `ARG` + compose `build.args` when counsel-approved legal copy or a non-default canonical URL is required.

---

## 3. First deploy sequence

### VPS + Docker Compose (recommended for alpha)

1. **Provision VPS** — Ubuntu 22.04+, Docker, Docker Compose, **Node 20+** and npm (for host migrations).
2. **DNS** — Point `A/AAAA` for `yourdomain.com` to VPS IP.
3. **Clone repo** to deploy path (e.g. `/opt/c2k`).
4. **Create secrets:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production — fill DATABASE_URL, AUTH_SECRET, S3_*, mail, etc.
   ```
5. **Configure external S3 bucket** — create bucket, IAM keys, CORS if browser uploads direct to CDN.
6. **Run migrations (no seed):**
   ```bash
   export NODE_ENV=production
   set -a && source .env.production && set +a
   npm ci
   npm run db:migrate-prod
   ```
7. **Build and start stack:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
8. **Verify health** — see §11–§12.
9. **Create first org via UI** — do **not** run `db:seed` on production.

### Kubernetes

Follow [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) §2. Manifests under [`k8s/base/`](../k8s/base/): `c2k-api-config` (ConfigMap), `c2k-mail-secret` (Secret — DB, auth, S3, mail), `c2k-api` (2 replicas default), `c2k-worker`. Run `npm run db:migrate-prod` from a bastion or CI job against production `DATABASE_URL` **before** rolling out API/worker.

### GitHub Actions deploy

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) on push to `main` (VPS must have **Node 20+** and npm on the host):

1. SSH to VPS → `cd $VPS_DEPLOY_PATH`
2. `git pull origin main`
3. Source `.env.production` (fatal if missing)
4. `export NODE_ENV=production` + `export USE_DATABASE=true`
5. `npm ci` + `npm run db:migrate-prod` (**fails deploy if migrations fail**)
6. `docker compose -f docker-compose.prod.yml up -d --build`

**Never** runs `db:seed` or `db:prepare`.

---

## 4. Migration sequence

Production schema updates use **`npm run db:migrate-prod`** only:

```bash
npm run db:migrate-prod
```

This runs (in order, **exits non-zero on failure**):

1. `scripts/verify-migrate-env.mjs` — requires `USE_DATABASE=true` and `DATABASE_URL`
2. `npm run build -w @c2k/api`
3. `npm run db:push -w @c2k/api` — Drizzle push (no `|| true`)
4. `npm run db:migrate-hub-ext -w @c2k/api`
5. `npm run db:migrate-incremental -w @c2k/api`
6. `npm run db:migrate-organizer-parity -w @c2k/api`

**Dev-only** (blocked when `NODE_ENV=production` or `C2K_ENV=production`):

```bash
npm run db:prepare   # push + incremental + seed — local Docker only (docker-compose.dev.yml)
```

---

## 5. API startup

- **Compose:** `api` service runs `node dist/server.js` with `env_file: .env.production`, `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT=3001`.
- **Startup guard:** refuses to start if `AUTH_ALLOW_FALLBACK=true` in production.
- **Health:** `GET /api/health/ready` — pings Postgres when `USE_DATABASE=true`.
- **Port:** 3001 (internal); Caddy proxies `/api/*`.

---

## 6. Web startup

- Built at image build time ([`docker/web.Dockerfile`](../docker/web.Dockerfile)); compose passes `VITE_API_URL` build arg.
- Served by nginx on port 80 inside container; Caddy terminates TLS and proxies `/` → web, `/api/*` → api.
- **Same-origin pattern:** leave `VITE_API_URL` empty; browser calls relative `/api/...` with cookies.

---

## 7. Worker startup

- **Compose:** `worker` service uses same API image, command `node dist/worker.js`.
- **Requires:** same `.env.production` as API (`DATABASE_URL`, `REDIS_URL`, mail vars, ECKE vars if enabled).
- **Startup guard:** same auth fallback check as API.
- **Queues:** moderation, external sync, lifecycle, people sync, ECKE publish, feed activities.

---

## 8. Object storage setup

**Production compose does not include MinIO.** Upload routes return errors without valid `S3_*` env.

1. Create an S3-compatible bucket (AWS S3, Cloudflare R2, DigitalOcean Spaces, etc.).
2. Set in `.env.production`:
   - `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION`
   - `S3_ACCESS_KEY`, `S3_SECRET_KEY`
   - Optional `S3_PUBLIC_BASE_URL` for CDN-facing URLs
3. Configure bucket CORS if browsers load assets directly from CDN.
4. **Do not** rely on local filesystem upload paths in production.

---

## 9. Email setup

1. Choose transport: `C2K_MAIL_TRANSPORT=smtp` or `resend`.
2. Set `C2K_MAIL_FROM` to an address on a domain with SPF/DKIM/DMARC.
3. Apply same mail env on **API and worker** pods/containers.
4. Complete [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) sections A–E before pilot mail.

---

## 10. WebSocket / reverse proxy notes

- WebSocket endpoint: `GET /api/ws` (upgrade).
- **Caddy** (included in prod compose) routes `/api/*` to API — ensure proxy passes `Upgrade` and `Connection` headers (default Caddy behavior).
- **Multi-replica API:** set `C2K_REALTIME_REDIS_BRIDGE=true` on all API pods — see [`REALTIME_SCALING.md`](./REALTIME_SCALING.md).
- **Split-origin:** session cookies use `sameSite: lax` on API host; cross-origin SPA + API subdomain breaks session unless redesigned — prefer same-origin Caddy.

---

## 11. Health checks

| Endpoint | Expected |
|----------|----------|
| `GET /api/health/live` | 200 |
| `GET /api/health/ready` | 200, `database: "ok"` when `USE_DATABASE=true` |
| Web `/` | 200 SPA shell |

Readiness does **not** check Redis or worker — monitor worker logs separately.

---

## 12. Smoke tests after deploy

Run against live domain (see [`DEPLOY_SMOKE.md`](./DEPLOY_SMOKE.md)):

- [ ] Login / session cookie set on same origin
- [ ] `GET /api/auth/session` returns real user or empty (not mock `RopeDreamer`)
- [ ] Org create flow
- [ ] Upload test (if S3 configured)
- [ ] Outbound test email (if SMTP configured)
- [ ] Convention hub WebSocket subscribe (schedule refresh)

Local gate before tag:

```bash
npm run verify:prelaunch
```

---

## 13. Rollback procedure

1. **Application:** `git checkout <previous-tag>` on VPS, re-run `docker compose -f docker-compose.prod.yml up -d --build`.
2. **Do not** run `db:wipe` or `db:seed` to “rollback” schema — restore Postgres from backup if migration was bad.
3. **Migrations:** forward-fix preferred; keep pre-migration DB snapshot before each deploy.
4. **ECKE:** set `ECKE_PUBLISH_ENABLED=false` and restart API + worker to stop outbound writes instantly.

---

## 14. Do-not-run warnings

| Command | Risk | Guard |
|---------|------|-------|
| `npm run db:seed` | Wipes all tables then seeds demo data | Blocked in production unless `C2K_ALLOW_DESTRUCTIVE_DB_RESET=true` |
| `npm run db:wipe` | Truncates all public tables | Same override required in production |
| `npm run db:prepare` | Dev push + seed | **Blocked** when `NODE_ENV=production` or `C2K_ENV=production` |
| Deploy with `AUTH_ALLOW_FALLBACK=true` | Mock viewer in prod | API/worker **refuse startup** |
| Deploy without migrations | Schema drift, runtime errors | Deploy workflow runs `db:migrate-prod`; fails on error |
| Deploy without S3 when uploads enabled | Broken uploads, 5xx on asset routes | Configure `S3_*` before pilot |
| `C2K_ECKE_PUBLISH_INLINE=true` in prod | Bypasses queue reliability | Dev only |

**Never commit** filled `.env.production`, `secret.yaml`, or real `S3_SECRET_KEY` / service role keys.

---

## Script reference

| Script | Environment | Purpose |
|--------|-------------|---------|
| `npm run db:migrate-prod` | Production/staging | Schema push + incremental migrations (no seed) |
| `npm run db:prepare` | Local dev only | Wait for Postgres, push, migrate, seed |
| `npm run verify:prelaunch` | CI / pre-tag | typecheck → test → build |
