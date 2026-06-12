# Mail, org/group lists, and Kubernetes

**Last updated:** 2026-06-06 (worker must share mail env; `db:migrate-prod` for prod schema)

**Production go-live:** [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) (deploy order) → [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) (mail sign-off + smoke tests).

## Overview

Outbound mail uses `packages/api/src/lib/mailer.ts` (`disabled` | `smtp` | `resend`). The same env must be set on **both** `api` and `worker` deployments (digests run on the worker).

| Feature | Env / API |
|---------|-----------|
| Transport | `C2K_MAIL_TRANSPORT`, `SMTP_*` or `RESEND_API_KEY` |
| From address | `C2K_MAIL_FROM` |
| Public links | `C2K_PUBLIC_WEB_URL` |
| Site-owner BCC on **every** send | `C2K_PLATFORM_MAIL_BCC` (comma-separated) |
| Marketing DB archive | `platform_email_captures` table + `GET /api/v1/platform/email-captures` |
| Platform export access | `C2K_PLATFORM_ADMIN_EMAILS` (comma-separated, must match signed-in user email) |
| Org public signup | `organizations.community.emailListEnabled` + `POST …/organizations/:slug/email-subscribe` |
| Group public signup | `groups.email_signup_enabled` + `POST …/groups/:id/email-subscribe` |
| Organizer broadcast | `POST …/email-broadcast` |
| Org welcome on join | `C2K_ORG_JOIN_EMAIL=true` → `sendOrgWelcomeEmail` on `POST …/organizations/:slug/join` |
| List double opt-in | `C2K_SCOPE_EMAIL_DOUBLE_OPTIN=true` → subscribe creates `pending` row + confirm email; `GET /api/v1/email-list/confirm?token=` |

## Local dev (Mailpit)

```bash
docker compose -f docker-compose.dev.yml up -d   # postgres, redis, mailpit, minio on loopback
npm run db:prepare   # dev only — push + migrate + seed; blocked in production
npm run dev
```

Mailpit only (if Postgres/Redis already running):

```bash
docker compose -f docker-compose.dev.yml up -d mailpit
```

- SMTP: `127.0.0.1:1025` (no TLS, no auth)
- Inbox UI: http://127.0.0.1:8025

`.env.development` ships with `C2K_MAIL_TRANSPORT=smtp` pointing at Mailpit. Production/staging schema updates use **`npm run db:migrate-prod`** only — see [`DEPLOYMENT_RUNBOOK.md`](./DEPLOYMENT_RUNBOOK.md) §4.

## Docker Compose production (VPS)

[`docker-compose.prod.yml`](../docker-compose.prod.yml) runs `caddy`, `web`, `api`, `worker`, `postgres`, and `redis`. Set mail variables in `.env.production` (see [`.env.production.example`](../.env.production.example)). Both `api` and `worker` services load that file via `env_file`.

Use your provider SMTP (SES SMTP, Postmark, SendGrid, etc.) — prod compose does **not** include Mailpit or an in-stack relay.

## Kubernetes

Example manifests live under [`k8s/base/`](../k8s/base/). They are templates — replace image tags (`ghcr.io/your-org/c2k-api:latest`), hostnames, and secret values. See [`k8s/README.md`](../k8s/README.md).

| Manifest | Purpose |
|----------|---------|
| `namespace.yaml` | `c2k` namespace |
| `configmap.yaml` | `c2k-api-config` — non-secret runtime config (`USE_DATABASE`, mail toggles) |
| `secret.example.yaml` | Copy → `secret.yaml` (gitignored) → `c2k-mail-secret` |
| `api-deployment.yaml` | `c2k-api` Deployment + Service (default **2** replicas, readiness on `/api/health/ready`) |
| `worker-deployment.yaml` | `c2k-worker` — same image, `node dist/worker.js` |

Both deployments mount **`c2k-api-config`** (ConfigMap) and **`c2k-mail-secret`** (Secret). The secret name is historical — it holds **all** runtime credentials, not mail alone.

### Secret keys (`c2k-mail-secret`)

Copy [`k8s/base/secret.example.yaml`](../k8s/base/secret.example.yaml) → `secret.yaml`. Minimum for pilot:

| Key | Notes |
|-----|--------|
| `DATABASE_URL`, `REDIS_URL` | Postgres + Redis (external or in-cluster) |
| `AUTH_SECRET`, `COOKIE_SECRET`, `AUTH_ALLOW_FALLBACK=false` | API refuses startup if fallback is `true` |
| `CORS_ORIGIN`, `C2K_PUBLIC_WEB_URL` | Public web origin |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | Required if uploads enabled (no MinIO in k8s base) |
| `C2K_MAIL_TRANSPORT`, `C2K_MAIL_FROM` | `smtp` or `resend` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | When using SMTP |
| `C2K_PLATFORM_MAIL_BCC`, `C2K_PLATFORM_ADMIN_EMAILS` | Platform copy + export allowlist |

Optional: `RESEND_API_KEY` (Resend transport); `C2K_ORG_JOIN_EMAIL`, `C2K_EVENT_RSVP_EMAIL`, `C2K_SCOPE_EMAIL_DOUBLE_OPTIN`; `VAPID_*` + `C2K_PUSH_*`; `C2K_REALTIME_REDIS_BRIDGE=true` when API replicas > 1.

Run **`npm run db:migrate-prod`** against production `DATABASE_URL` before rollout — see [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) §2.6.

### Apply

```bash
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/configmap.yaml
# Edit k8s/base/secret.example.yaml → secret.yaml (do not commit real secret.yaml)
kubectl apply -f k8s/base/secret.yaml
kubectl apply -f k8s/base/api-deployment.yaml
kubectl apply -f k8s/base/worker-deployment.yaml
kubectl rollout status deployment/c2k-api -n c2k
kubectl rollout status deployment/c2k-worker -n c2k
```

### In-cluster SMTP relay (optional)

For a dedicated relay pod (Postfix, stalwart, etc.), point `SMTP_HOST` at the Service DNS name (e.g. `c2k-smtp.c2k.svc.cluster.local`). Many teams prefer managed SMTP outside the cluster for deliverability.

### Egress

Allow outbound **587** (or **465** if `SMTP_SECURE=true`) from api/worker pods, or **443** to `api.resend.com` for Resend.

## Platform marketing copy

1. **BCC** — Set `C2K_PLATFORM_MAIL_BCC` to receive a copy of every broadcast, RSVP confirm, and digest when transport is enabled.
2. **Database** — Every list signup and broadcast delivery is stored in `platform_email_captures`.
3. **Export** — Sign in as a user whose email is listed in `C2K_PLATFORM_ADMIN_EMAILS`, then:

   `GET /api/v1/platform/email-captures?format=csv&limit=5000`

## Compliance notes

- Public signup requires explicit `consent: true` in the API body.
- Unsubscribe: `/email/unsubscribe?scope=organization|group&id=<slug-or-group-id>&email=…`
- Document list purpose in org/group signup blurbs; align with your privacy policy.
