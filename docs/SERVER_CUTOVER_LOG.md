# Server cutover log

**Last updated:** 2026-06-17 (VPS alpha execution pass 1 — remote smoke only)

**Execution journal:** [`VPS_ALPHA_EXECUTION_LOG.md`](./VPS_ALPHA_EXECUTION_LOG.md) · **Operator checklist:** [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md)

**Purpose:** Running journal of **prod-only delta** when leaving localhost. Not a blocker for local development (v3 §2).

**Operator runbooks (authoritative):**

| Step | Doc |
|------|-----|
| Deploy | [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) |
| Mail DNS + secrets | [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) |
| Pilot org sign-off | [`PILOT_READINESS.md`](./PILOT_READINESS.md) |

**Rule:** Any PR adding `C2K_*`, `VITE_*`, or `VAPID_*` must update `.env.development`, `.env.production.example`, `k8s/base/secret.example.yaml`, and one row below.

---

## Pre-flight (local — done 2026-05-26)

| Check | Status |
|-------|--------|
| Tier 1 code (rate limits, mock boundary, Redis WS flag) | Done |
| Mailpit smokes | Done — see [`PILOT_READINESS.md`](./PILOT_READINESS.md) Mail sign-off log |
| `node scripts/pilot-readiness-smoke.mjs` | 10/10 local |
| Command-bridge + organizer-parity smokes | Green |

---

## Phase 3 prep (2026-05-27 — no server)

**Goal:** Cutover checklist and pilot onboarding artifacts ready **before** hosting purchase. Prod mount remains blocked until a server exists.

**Local pre-launch sprint complete (2026-05-27):** Engineering alpha gate **`npm run verify:alpha`** green locally — typecheck, unit tests, Playwright (~34), pilot smokes, registration/reports/organizer walk, scope-email double opt-in. **Not prod cutover** — deploy, DNS/TLS, prod SMTP A–E, and live pilot org still blocked on server purchase (`PILOT-MAIL`, `PILOT-ORG`).

| Item | Status | Blocker |
|------|--------|---------|
| Tier 1 code (rate limits, mock boundary, Redis WS flag) | **Ready** | — |
| [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) + [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) | **Ready** | — |
| K8s manifests (`k8s/base/`) + `docker-compose.prod.yml` | **Ready** | — |
| Env delta table + `.env.production.example` / `secret.example.yaml` | **Ready** | — |
| Migrations runbook (incremental, hub-ext, organizer parity) | **Ready** | — |
| Local pilot smokes (`pilot-readiness-smoke`, registration, reports, organizer walk) | **Ready** | — |
| Local Mailpit mail parity (checklist §F dev) | **Ready** | — |
| Pilot org onboarding packet + owner training script | **Ready** | — |
| [`PILOT_READINESS.md`](./PILOT_READINESS.md) Tier 1 rows B–E | **Ready** | — |
| Deploy to staging / production | **Blocked** | Server purchase |
| DNS (A/AAAA), TLS cert, public `C2K_PUBLIC_WEB_URL` | **Blocked** | Server purchase |
| Prod SMTP checklist A–E (SPF/DKIM/DMARC, verified `C2K_MAIL_FROM`) | **Blocked** | Server + DNS |
| Prod smokes against live domain | **Blocked** | Server purchase |
| Prod VAPID keys + hub push on real device | **Blocked** | Server purchase |
| First real pilot org sign-off (Tier 1 row **F**) | **Blocked** | Public URL — **PILOT-ORG** |
| Staging/prod mail sign-off (Tier 1 row **A**) | **Blocked** | Server + DNS — **PILOT-MAIL** |
| `C2K_REALTIME_REDIS_BRIDGE=true` multi-replica validation | **Blocked** | 2+ API replicas on prod |
| Privacy / community policy pages published | **Blocked** | Copy + prod host |

**When hosting exists:** resume at § **On mount** below; do not reopen Tier 1 code unless prod smokes fail.

---

## Prod mounted (VPS alpha — 2026-06-11)

**Host:** `srv1747903` · `2.25.196.84` · stack `/opt/c2k` · **https://kink.social**

| Item | Status | Notes |
|------|--------|-------|
| DNS + TLS (Caddy) | **Done** | `DOMAIN=kink.social` |
| Docker Compose prod stack | **Done** | api, web, worker, postgres, redis, minio, caddy, clamav, mailserver |
| `GET /api/health/ready` | **Done** | database, redis, clamav, s3 — all `ok` (verified 2026-06-12) |
| `GET /api/health/mail` | **Done** | `transport=smtp`, password reset enabled |
| Deploy workflow | **Done** | `scripts/_deploy-eod-session.mjs` — api + web rebuild; see [`handoff/PROFILE-SOCIAL-DEPLOY-2026-06-11.md`](./handoff/PROFILE-SOCIAL-DEPLOY-2026-06-11.md) |
| Prod quick smoke | **Done** | `node scripts/_smoke-prod-quick.mjs` — **9/9** (2026-06-12 deploy) |
| Invite-only alpha | **Live** | `C2K_REGISTRATION_INVITE_CODE` — see [`ALPHA_DEPLOYMENT.md`](./ALPHA_DEPLOYMENT.md) |
| Account welcome email | **On** | `C2K_ACCOUNT_WELCOME_EMAIL=true` on prod |
| Full prod smoke matrix | **Partial** | `pilot-readiness-smoke.mjs` against live domain — operator to confirm |
| Prod SMTP checklist A–E sign-off | **Open** | Transport works; formal DNS/SPF/DKIM/DMARC row **A** still operator-owned |
| First real pilot org (row **F**) | **Open** | Engineering dry run done locally; **7** prod users (invite alpha), no external pilot org yet |
| Migrations on host | **Ad hoc** | Host `db:migrate-prod` can fail on hostname; incremental fixes applied in-container — see handoff § migrations |
| ECKE prod publish | **Open** | C2K prod `ECKE_PUBLISH_*` + ECKE Vercel URL — unchanged from § ECKE below |
| Alpha social seed on VPS | **Open** | Pass 1 (2026-06-17): not run — no SSH/backup; `alpha_social` login 401 — see [`VPS_ALPHA_EXECUTION_LOG.md`](./VPS_ALPHA_EXECUTION_LOG.md) |

**Shipped on prod (2026-06-11 sessions):** profile social rail + follower/following APIs; photo upload VPS fix (Sharp downscale, insert-then-delete primary); mobile UX + auth gate; landing hero; account welcome mail. Detail: [`HANDOFF.md`](./HANDOFF.md) § 2026-06-11.

---

## On mount (operator checklist)

1. Deploy per [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) (K8s or VPS compose).
2. Complete [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) sections A–E.
3. Set prod env (see delta table); `VITE_HOME_DEMO_FALLBACK=false` on web build.
4. Run prod smokes:

```bash
set SMOKE_BASE=https://yourdomain.com
set API_BASE=https://yourdomain.com
node scripts/pilot-readiness-smoke.mjs
node scripts/smoke-greenfield-registration.mjs
node scripts/smoke-reports.mjs
node scripts/audit-command-bridge.mjs
```

5. Complete [`PILOT_READINESS.md`](./PILOT_READINESS.md) § First real pilot org + Tier 1 rows **A** and **F**.
6. Publish privacy/community policy pages when copy is ready ([`docs/policies/`](./policies/) drafts).

---

## Env delta table

| Variable | Local (Mailpit / dev) | Production | Added |
|----------|----------------------|------------|-------|
| `C2K_MAIL_TRANSPORT` | `smtp` | `smtp` or `resend` | baseline |
| `SMTP_HOST` / `SMTP_PORT` | `127.0.0.1` / `1025` | Provider host | baseline |
| `C2K_MAIL_FROM` | `noreply@c2k.local` | Verified domain | baseline |
| `C2K_PUBLIC_WEB_URL` | `http://localhost:5173` | `https://yourdomain.com` | baseline |
| `VITE_HOME_DEMO_FALLBACK` | optional `true` guests | **`false`** | Tier 1 |
| `C2K_RATE_LIMIT_DISABLE` | optional `true` | **`false`** | Tier 1 |
| `C2K_REALTIME_REDIS_BRIDGE` | `false` | `true` if 2+ API replicas | Tier 1 |
| `VAPID_*` | dev keys — [`PUSH_VAPID_DEV.md`](./PUSH_VAPID_DEV.md) | prod keys in K8s secret | C215 |
| `C2K_PEOPLE_SYNC_QUEUE` | `true` (default) | `true` | LOC-WORKER-SYNC |
| `C2K_ACCOUNT_WELCOME_EMAIL` | optional `true` | `true` on kink.social | 2026-06-12 |
| `C2K_REGISTRATION_INVITE_CODE` | unset (open dev) | set on alpha VPS | [`ALPHA_DEPLOYMENT.md`](./ALPHA_DEPLOYMENT.md) |
| `C2K_SITE_OWNER_USER_IDS` | dev UUID | owner UUID on prod | admin privacy reveal |

---

## Migrations delta

| Script | When |
|--------|------|
| `npm run db:migrate-incremental -w @c2k/api` | Every deploy |
| `npm run db:migrate-hub-ext -w @c2k/api` | Hub tables if missing |
| `npx tsx packages/api/scripts/migrate-organizer-parity.ts` | Organizer schema parity if needed |

---

## Product sign-off (prod only)

| Item | Owner | Done | Date |
|------|-------|------|------|
| VPS deploy + health/mail green | Operator | ☑ | 2026-06-11 |
| Prod SMTP checklist A–E (formal) | Operator | ☐ | Transport OK; DNS/DMARC sign-off pending |
| First real pilot org | Product | ☐ | Invite alpha only (7 users 2026-06-12) |
| Alpha checklist §16 all server rows | Product | ☐ | LEGAL-ALPHA-1 owner walkthrough pending |

## ECKE unified push (2026-05-27)

**Master runbook:** [`ECKE_C2K_HOOKUP_MASTER.md`](./ECKE_C2K_HOOKUP_MASTER.md)

### Status — session end 2026-05-27

| Area | Status |
|------|--------|
| ECKE Phases B–D | ☑ SQL, §12 merge, verify tooling, baseline/audit docs |
| C2K Phase C (events) | ☑ Pilot `preview-c2k-weekend` → Supabase + `ecke_publish_targets` |
| Public verification (local ECKE) | ☑ `/events`, detail, legacy slug, `sitemap.xml` |
| Supabase C2K rows | events **1**; vendors/articles/dungeons **0** |
| Prod ECKE | ☐ Redeploy + Vercel `NEXT_PUBLIC_C2K_PUBLIC_URL` |

### Env reference

| Env (C2K local `.env.local` / prod secrets) | Purpose |
|-----------------------------------------------|---------|
| `ECKE_PUBLISH_ENABLED=true` | Enable outbound Supabase ingest |
| `ECKE_SUPABASE_URL` | ECKE Supabase project URL |
| `ECKE_SUPABASE_SERVICE_ROLE_KEY` | Service role for upserts |
| `C2K_ECKE_PUBLISH_INLINE=true` | **Dev only** — skip Redis for entity jobs |
| `load-dev-env.ts` | Loads `.env.development` + `.env.local` on API/worker |

| Env (ECKE) | Purpose |
|------------|---------|
| `UNIFIED_*_PREFER_DB` | **Unset** — §12 merge handles C2K slugs |
| `NEXT_PUBLIC_C2K_PUBLIC_URL` | Tease banner CTA (local set; Vercel prod pending) |

### Verification commands

```bash
# C2K
npm run smoke:ecke-bridge -w @c2k/api

# ECKE
npm run verify:c2k-bridge
```

**Operational:** Rows with `c2k_source_id` → C2K is source of truth. Legacy rows without it → ECKE admin/static edits unchanged.

---

*Local sprint plan: `.cursor/plans/local_docker_sprint_537f4b08.plan.md` · Active backlog: [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md)*
