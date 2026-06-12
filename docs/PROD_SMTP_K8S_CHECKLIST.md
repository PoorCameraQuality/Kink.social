# Production SMTP & Kubernetes mail — operator checklist

**Last updated:** 2026-06-06 (local Mailpit parity done; prod DNS pending server)

**Mounting a server?** Start with [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) (K8s or VPS order, then return here for mail sign-off).

**Use with:** [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md) (reference)  
**Applies to:** `api` + `worker` deployments (`k8s/base/`) or Docker Compose prod (`api` + `worker` services)

Mark each box when verified in your environment. This is the executable runbook; do not commit real secrets.

---

## A. Prerequisites

- [ ] DNS SPF/DKIM/DMARC configured for the **From** domain (`C2K_MAIL_FROM`)
- [ ] Outbound **587** (SMTP) or **443** (Resend) allowed from cluster egress
- [ ] Postgres and Redis reachable from api/worker pods
- [ ] `C2K_PUBLIC_WEB_URL` matches the live web origin (confirm links, unsubscribe, double opt-in)

---

## B. Secret material (`c2k-mail-secret`)

Copy `k8s/base/secret.example.yaml` → `secret.yaml` (gitignored). Required keys:

| Key | Verified |
|-----|----------|
| `C2K_MAIL_TRANSPORT` = `smtp` or `resend` | [ ] |
| `C2K_MAIL_FROM` | [ ] |
| `C2K_PUBLIC_WEB_URL` | [ ] |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` (if smtp) | [ ] |
| `RESEND_API_KEY` (if resend) | [ ] |
| `C2K_PLATFORM_MAIL_BCC` | [ ] |
| `C2K_PLATFORM_ADMIN_EMAILS` | [ ] |
| `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `COOKIE_SECRET` | [ ] |

Optional product flags (same secret or configmap):

| Key | Purpose | Verified |
|-----|---------|----------|
| `C2K_ORG_JOIN_EMAIL=true` | Welcome mail on org join | [ ] |
| `C2K_EVENT_RSVP_EMAIL=true` | RSVP confirmation mail | [ ] |
| `C2K_SCOPE_EMAIL_DOUBLE_OPTIN=true` | Pending + confirm for public list signup | [ ] |

Push (C215, separate from SMTP but same deploy pass):

| Key | Verified |
|-----|----------|
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | [ ] |

---

## C. Deploy manifests

```bash
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/configmap.yaml
kubectl apply -f k8s/base/secret.yaml
kubectl apply -f k8s/base/api-deployment.yaml
kubectl apply -f k8s/base/worker-deployment.yaml
```

- [ ] Both deployments reference `c2k-mail-secret` via `envFrom`
- [ ] Worker image tag matches API (digest worker reads same mail env)
- [ ] `kubectl rollout status deployment/c2k-api -n c2k`
- [ ] `kubectl rollout status deployment/c2k-worker -n c2k`

---

## D. Smoke verification (production)

Run against live API with a **platform admin** session.

### D.1 Transport health

- [ ] `GET /api/health/ready` → 200 from api Service
- [ ] API logs show no `mailer disabled` on startup when transport is smtp/resend

### D.2 Transactional send

- [ ] Organizer **message template test send** delivers to inbox (and BCC if set)
- [ ] Org join (or test user join) triggers welcome email when `C2K_ORG_JOIN_EMAIL=true`
- [ ] Event RSVP triggers mail when `C2K_EVENT_RSVP_EMAIL=true`

### D.3 Marketing / list compliance

- [ ] `POST …/organizations/:slug/email-subscribe` with `consent: true` creates row in `platform_email_captures`
- [ ] With double opt-in: subscriber stays `pending` until `GET /api/v1/email-list/confirm?token=…`
- [ ] Unsubscribe link works: `/email/unsubscribe?scope=…`

### D.4 Platform export

- [ ] `GET /api/v1/platform/email-captures?format=csv&limit=100` as admin email → CSV download

### D.5 Worker digests

- [ ] Worker cron/loop runs `pinned-digest-sweep` / org digest without SMTP errors
- [ ] User with `pinned_digest_email_weekly=false` does not receive pinned digest

---

## E. Rollback

- [ ] Set `C2K_MAIL_TRANSPORT=disabled` in secret and rollout (stops send; DB capture may still write)
- [ ] Document incident in ops log

---

## F. Local parity (dev)

```bash
docker compose -f docker-compose.dev.yml up -d mailpit
npm run db:migrate-incremental -w @c2k/api
# .env.development: C2K_MAIL_TRANSPORT=smtp → 127.0.0.1:1025
npm run dev
```

- [ ] Mailpit UI http://127.0.0.1:8025 shows test messages

---

**Sign-off**

| Role | Name | Date |
|------|------|------|
| Operator | | |
| Product | | |
