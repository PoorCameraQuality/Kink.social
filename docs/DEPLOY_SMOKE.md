# Deploy smoke checklist (VPS + GitHub Actions)

**Last updated:** 2026-06-06 (`db:migrate-prod` in deploy workflow vs root `package.json`)

**Kubernetes instead of VPS?** Use [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) + [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md).

Use this before relying on automated deploys. The workflow is [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

## 1. GitHub repository secrets

Create these in **Settings → Secrets and variables → Actions**:

| Secret | Purpose |
|--------|---------|
| `VPS_HOST` | VPS hostname or IP |
| `VPS_USER` | SSH user (e.g. `deploy`) |
| `VPS_SSH_KEY` | Private key (PEM) for that user; public key in `~/.ssh/authorized_keys` on the VPS |
| `VPS_DEPLOY_PATH` | Absolute path to the repo on the server (e.g. `/home/deploy/coast-to-coast-kink`) |

The workflow runs in `VPS_DEPLOY_PATH`: `git pull origin main` → source `.env.production` → `npm ci` → **`npm run db:migrate-prod`** (fails deploy on error) → `docker compose -f docker-compose.prod.yml up -d --build`. It never runs `db:seed` or `db:prepare`.

## 2. One-time VPS prep

- Install Docker and Docker Compose plugin, plus **Node 20+** and npm on the host (migrations run on the VPS before compose — see [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)).
- Clone the repo to `VPS_DEPLOY_PATH` and ensure `main` tracks your GitHub remote.
- Copy [`.env.production.example`](../.env.production.example) to `.env.production` on the server; fill secrets (`POSTGRES_PASSWORD`, `DATABASE_URL`, `AUTH_SECRET`, `COOKIE_SECRET`, mail, S3/R2, `DOMAIN`, etc.).
- Point DNS A/AAAA records at the VPS for `DOMAIN` (Caddy in [`docker-compose.prod.yml`](../docker-compose.prod.yml) terminates TLS via `Caddyfile`).
- First deploy: run `npm ci && npm run db:migrate-prod` with `.env.production` sourced **before** `docker compose -f docker-compose.prod.yml up -d --build` — see [`DEPLOYMENT_RUNBOOK.md`](./DEPLOYMENT_RUNBOOK.md) §3–4.

## 3. Smoke procedure

1. Push a trivial commit to `main` and confirm the **Deploy** workflow succeeds in the Actions tab.
2. On the VPS: `docker compose -f docker-compose.prod.yml ps` — web, api, worker, postgres, redis (and caddy if included) should be healthy.
3. Hit public URLs: site loads, **`GET /api/health`** returns `{ ok: true }` (liveness). For orchestrators / load balancers, also check **`GET /api/health/ready`**: with `USE_DATABASE=true` it must return **200** and `database: "ok"` when Postgres is reachable; **503** with `code: "db_ping_failed"` when the DB ping fails or times out (~2.5s).
4. Optional: register/login against production with a test account; verify cookies and HTTPS.
5. Optional: after migrations, spot-check **unified calendar** — a public `/conventions/:slug` program page and an org **Calendar** tab if you use org events (see `docs/FEATURE_REGISTRY.md` § Unified event calendar). Do **not** run `db:seed` on production.

## 4. If deploy fails

- SSH to the VPS (from a network that allows SSH) and run the compose command manually to read container logs.
- Confirm `VPS_DEPLOY_PATH` is correct and the deploy user owns the directory.
- Confirm the SSH key secret has no extra whitespace and matches the server’s `authorized_keys`.

## 5. Repo verification (no VPS required)

From the monorepo root, confirm production compose parses:

```bash
docker compose -f docker-compose.prod.yml config
```

Confirm `.github/workflows/deploy.yml` exists and matches: source `.env.production`, `npm run db:migrate-prod`, then `docker compose -f docker-compose.prod.yml up -d --build`. Operator still completes sections 1–3 to go live on a real VPS.
