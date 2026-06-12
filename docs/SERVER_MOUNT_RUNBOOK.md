# Server mount runbook — first production deploy

**Last updated:** 2026-06-06 (`db:migrate-prod` sequence vs root `package.json`)

**Status:** **Not executing yet** — no paid server/hosting purchased. Day-to-day work stays on **local Docker** (see [`PILOT_READINESS.md`](./PILOT_READINESS.md) § Deployment posture).

**Engineering pre-flight:** complete (local Mailpit, pilot smokes, PILOT-1–3 fixes). **Repo is wired** for cutover: this runbook, `k8s/base/`, `docker-compose.prod.yml`, `.env.production.example`, mail checklist.

**Use this when you SSH into a VPS or have `kubectl` access** — i.e. after server space is bought — to go beyond local Mailpit.

**Related docs (do not skip):**

| Doc | When |
|-----|------|
| [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) | **Mail sign-off** — DNS, secrets, smokes, digests (sections A–E) |
| [`PILOT_READINESS.md`](./PILOT_READINESS.md) | **First pilot org** — end-to-end path + Tier 1 sign-off table |
| [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md) | Mail env reference + K8s secret keys |
| [`DEPLOY_SMOKE.md`](./DEPLOY_SMOKE.md) | **Docker Compose on a VPS** + GitHub Actions deploy |
| [`REALTIME_SCALING.md`](./REALTIME_SCALING.md) | If API runs **2+ replicas** → `C2K_REALTIME_REDIS_BRIDGE=true` |
| [`plans/TIER_1_PILOT_READINESS.md`](./plans/TIER_1_PILOT_READINESS.md) | What engineering already shipped for Tier 1 |

**Local dev is done when:** Mailpit smokes pass — see `PILOT_READINESS.md` → Mail sign-off log → **Local (Mailpit)**.

---

## 0. Choose deploy shape

| Path | Manifests / compose | Typical use |
|------|---------------------|-------------|
| **Kubernetes** | [`k8s/base/`](../k8s/base/) | Managed cluster, multiple API replicas, separate worker |
| **VPS + Docker Compose** | [`docker-compose.prod.yml`](../docker-compose.prod.yml), [`.env.production.example`](../.env.production.example) | Single server, simpler ops — [`DEPLOY_SMOKE.md`](./DEPLOY_SMOKE.md) |

Both paths need the **same mail env** on **API and worker** (digests run on the worker).

---

## 1. Before you SSH (gather once)

Check off outside the repo:

- [ ] **Domain** — production web URL decided (`C2K_PUBLIC_WEB_URL`)
- [ ] **Mail From domain** — matches SPF/DKIM/DMARC you will publish
- [ ] **SMTP or Resend** — host/port/credentials **or** `RESEND_API_KEY`
- [ ] **DNS** — plan A/AAAA (or ingress LB) for web + API; plan SPF/DKIM/DMARC for mail (registrar or Cloudflare, etc.)
- [ ] **Secrets** — `AUTH_SECRET`, `COOKIE_SECRET`, `DATABASE_URL`, `REDIS_URL` (strong random values)
- [ ] **Images** — container registry URLs if K8s (replace `ghcr.io/your-org/...` in deployments)
- [ ] **Pilot org** — which org/convention is first real event (name, owner contact)

Do **not** commit filled `secret.yaml` or `.env.production` with real passwords.

---

## 2. Kubernetes mount (ordered)

### 2.1 Cluster access

```bash
kubectl config current-context   # confirm correct cluster
kubectl get nodes
```

### 2.2 Namespace and config

```bash
cd coast-to-coast-kink
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/configmap.yaml
```

Edit [`k8s/base/configmap.yaml`](../k8s/base/configmap.yaml) if needed (`USE_DATABASE`, `CORS_ORIGIN`, feature flags).

### 2.3 Secrets (mail + core)

```bash
cp k8s/base/secret.example.yaml k8s/base/secret.yaml
# Edit secret.yaml locally — NEVER git add secret.yaml
kubectl apply -f k8s/base/secret.yaml
```

Required keys: see [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md) § Secret keys and [`k8s/base/secret.example.yaml`](../k8s/base/secret.example.yaml). Minimum for pilot:

- `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `COOKIE_SECRET`
- `C2K_MAIL_TRANSPORT`, `C2K_MAIL_FROM`, `C2K_PUBLIC_WEB_URL`, SMTP_* **or** `RESEND_API_KEY`
- `C2K_ORG_JOIN_EMAIL`, `C2K_EVENT_RSVP_EMAIL` (if you want transactional mail)
- `VAPID_*` + `C2K_PUSH_*` (optional hub push)

Production web build: **`VITE_HOME_DEMO_FALLBACK=false`** at image build time (not in this secret).

### 2.4 Deploy API + worker

```bash
# Update image: tags in api-deployment.yaml + worker-deployment.yaml first
kubectl apply -f k8s/base/api-deployment.yaml
kubectl apply -f k8s/base/worker-deployment.yaml
kubectl rollout status deployment/c2k-api -n c2k
kubectl rollout status deployment/c2k-worker -n c2k
```

**Multi-replica note:** [`k8s/base/api-deployment.yaml`](../k8s/base/api-deployment.yaml) defaults to **2 replicas**. Set `C2K_REALTIME_REDIS_BRIDGE=true` in the secret on **all** API pods so WebSocket schedule/org events fan out — [`REALTIME_SCALING.md`](./REALTIME_SCALING.md).

### 2.5 Ingress / TLS

This repo’s `k8s/base/` does not include Ingress — add your controller (nginx, traefik, cloud LB) and point:

- Public web → static/Vite build or CDN
- `/api` → `c2k-api` Service port 3001

Record the **public API base URL** for smokes (e.g. `https://api.yourdomain.com` or same-origin `https://yourdomain.com`).

### 2.6 DB migrations

Run once against production Postgres **before** API/worker rollout (bastion, CI job, or VPS host with Node 20+):

```bash
export NODE_ENV=production
set -a && source .env.production && set +a   # or export DATABASE_URL from the secret
npm ci
npm run db:migrate-prod
```

`db:migrate-prod` runs push + hub-ext + incremental + organizer-parity migrations (no seed). See [`DEPLOYMENT_RUNBOOK.md`](./DEPLOYMENT_RUNBOOK.md) §4.

Do **not** run `db:seed` or `db:prepare` on production — create the first org via UI.

---

## 3. VPS + Docker Compose mount (ordered)

Follow [`DEPLOY_SMOKE.md`](./DEPLOY_SMOKE.md) §2–3, then:

1. `.env.production` from [`.env.production.example`](../.env.production.example) — mail, `USE_DATABASE=true`, `POSTGRES_*`, `DOMAIN`, S3_* as needed
2. **Migrations on the VPS host** (Node 20+): `npm ci && npm run db:migrate-prod` with `.env.production` sourced — same sequence as [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
3. `docker compose -f docker-compose.prod.yml up -d --build` — services: `caddy`, `web`, `api`, `worker`, `postgres`, `redis`
4. `GET /api/health/ready` on the public URL (via Caddy same-origin or split API host)

Mail env must be loaded by **both** `api` and `worker` services in compose.

---

## 4. Production mail sign-off (operator)

Work through **[`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md)** sections **A → E** on **staging first**, then production.

Quick API smokes (replace base URL):

```bash
export SMOKE_BASE=https://yourdomain.com   # or API origin if split
export API_BASE=https://yourdomain.com     # direct API if needed

curl -s "$API_BASE/api/health/ready"
# Log in as platform admin in browser, then:
curl -s -b cookies.txt -X POST "$SMOKE_BASE/api/v1/me/email/test-send" \
  -H 'Content-Type: application/json' -d '{}'
```

Or from your laptop against prod (with session cookie):

```bash
node scripts/pilot-readiness-smoke.mjs
# SMOKE_BASE=https://yourdomain.com API_BASE=https://yourdomain.com node scripts/pilot-readiness-smoke.mjs
```

**Log results** in [`PILOT_READINESS.md`](./PILOT_READINESS.md) → **Mail sign-off log** (Staging / Production rows).

---

## 5. Permission audit on production (optional but recommended)

With prod URL and demo **disabled** for real organizers:

```bash
export SMOKE_BASE=https://yourdomain.com
export SMOKE_CONV=<your-pilot-convention-slug>
node scripts/audit-command-bridge.mjs
node scripts/smoke-command-bridge.mjs
cmd /c "set API_BASE=https://yourdomain.com&& npx tsx packages/api/scripts/smoke-organizer-parity.ts <slug>"
```

File failures in [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) (see existing `PILOT-1`–`PILOT-3` pattern).

---

## 6. First pilot org (product + operator)

Use [`PILOT_READINESS.md`](./PILOT_READINESS.md) § **Pilot event path**:

1. Create org + convention (or use agreed pilot org).
2. Public registration with real accounts (`user_id` on registrants).
3. People hub, hub chat/announcements, optional mail/push.
4. Mark **F. Pilot org dry run** in `PILOT_READINESS.md` when complete.
5. Close or add rows: `PILOT-ORG`, `PILOT-MAIL` in [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md).

---

## 7. Cursor agent session (SSH / kubectl)

When you open a chat **from the mounted server** or with cluster access, paste:

> Mount production using `docs/SERVER_MOUNT_RUNBOOK.md`. Complete `PROD_SMTP_K8S_CHECKLIST.md` on staging, run `pilot-readiness-smoke.mjs` against our public URL, update `PILOT_READINESS.md` sign-off tables. Deploy path: **K8s** or **VPS**. Do not commit secrets.

The agent can run kubectl/compose, port-forward, curl smokes, and update docs — **not** registrar DNS or obtaining SMTP accounts.

---

## 8. Production env checklist (copy-paste)

| Variable | Production |
|----------|------------|
| `USE_DATABASE` | `true` |
| `C2K_MAIL_TRANSPORT` | `smtp` or `resend` |
| `C2K_PUBLIC_WEB_URL` | `https://<your-domain>` |
| `VITE_HOME_DEMO_FALLBACK` | **`false`** (web build) |
| `C2K_RATE_LIMIT_DISABLE` | **unset** or `false` |
| `C2K_REALTIME_REDIS_BRIDGE` | `true` if API replicas > 1 |
| `C2K_SCOPE_EMAIL_DOUBLE_OPTIN` | `true` recommended for public lists |

---

## 9. Rollback

| Symptom | Action |
|---------|--------|
| Bad deploy | `kubectl rollout undo deployment/c2k-api -n c2k` (and worker) |
| Mail storm | `C2K_MAIL_TRANSPORT=disabled` in secret → rollout |
| Push issues | `C2K_PUSH_ANNOUNCEMENTS=false`, `C2K_PUSH_CHAT=false` |

See [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) § E.

---

*After server mount + mail sign-off + pilot org, proceed to Phase 2 only per [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) (`feed_activities` F1, not home UI first).*
