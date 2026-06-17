# VPS alpha readiness (operator checklist)

**Last updated:** 2026-06-17  
**Audience:** Operator preparing kink.social for invite-only alpha testers on VPS/staging  
**Related:** [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) · [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md) · [`PILOT_READINESS.md`](./PILOT_READINESS.md) · [`ALPHA_DEPLOYMENT.md`](./ALPHA_DEPLOYMENT.md) · [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md)

---

## 1. Purpose

This checklist prepares a **VPS or staging alpha** environment for **human testers**. It is the operator companion to the tester walkthrough in [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md).

### What this is

- Invite-only alpha readiness on a controlled server
- Non-destructive verification steps where possible
- Smoke and privacy checks before sending invites

### What this is not

- A **public launch** checklist
- A **production hardening certification** (see [`VPS_SECURITY_HARDENING.md`](./VPS_SECURITY_HARDENING.md) separately)
- Permission to run **database wipes**, full `db:seed`, or unplanned password resets on live alpha accounts

### Database policy

Do **not** run destructive database commands during alpha prep unless you have a **separate written backup and reset plan**. Prefer append-only seeds (`alpha-social-seed`, `alpha-ecke-demo`) over wipes.

---

## 2. Environment classification

| Environment | Typical host | Safe operations | Avoid |
|-------------|--------------|-----------------|-------|
| **Local dev** | `localhost`, Docker Compose dev | `npm run dev`, Mailpit, `db:migrate-incremental`, alpha seeds with guards | Pointing local tools at production `DATABASE_URL` |
| **Staging / VPS alpha** | kink.social or staging domain | Deploy, migrate, health checks, guarded seeds, invite-only registration | `db:wipe`, volume deletes, password resets on seeded/owner accounts |
| **Production / public launch** | Live user traffic | This doc is **not** the launch gate | Treating alpha shortcuts as launch-ready |

**Command safety (summary):**

| Command / action | Local dev | VPS alpha | Production |
|------------------|-----------|-----------|------------|
| `db:migrate-incremental` | Yes | Yes | Yes (with backup) |
| `seed:alpha-social` with `ALLOW_ALPHA_SOCIAL_SEED=true` | Yes | Yes (backup first) | Only with explicit operator approval |
| `db:seed:alpha:ecke` | Yes | Yes (append-only) | Only with explicit operator approval |
| `db:seed` / `db:wipe` | Dev only | **No** | **No** |
| Password reset email/token test | Mailpit local | **No during this pass** | Separate mail QA pass |
| Change owner/admin passwords | Avoid | **No** | Change control only |

---

## 3. Required env vars checklist

Verify on the server `.env.production` (or equivalent). Template: [`.env.production.example`](../.env.production.example).

### Core

| Variable | Purpose | Required for alpha? | How to verify | Notes |
|----------|---------|---------------------|---------------|-------|
| `NODE_ENV` | Runtime mode | Yes | `production` in compose/env | Triggers production guards |
| `USE_DATABASE` | API uses Postgres | Yes | Must be `true` | Off returns 503 on API routes |
| `DATABASE_URL` | Postgres connection | Yes | `GET /api/health/ready` shows `database: ok` | Use internal Docker hostname on VPS |
| `REDIS_URL` | Queues, rate limits | Yes | Ready health / worker logs | `redis://redis:6379` in compose |
| `AUTH_SECRET` | Session HMAC | Yes | API starts without auth fallback error | Long random, not committed |
| `COOKIE_SECRET` | Cookie signing | Yes | Login works | Separate from `AUTH_SECRET` |
| `AUTH_ALLOW_FALLBACK` | Dev auth bypass | Yes (must be false) | Unset or `false` | API refuses `true` in production |
| `C2K_PUBLIC_WEB_URL` | Canonical web URL | Yes | Links in emails/ICS use this host | No trailing slash |
| `DOMAIN` | Caddy TLS host | Yes | HTTPS loads | Matches DNS |

### Encryption / privacy

| Variable | Purpose | Required for alpha? | How to verify | Notes |
|----------|---------|---------------------|---------------|-------|
| `C2K_FIELD_ENCRYPTION_KEY` | Email ciphertext | Yes (prod) | API starts; emails stored encrypted | Rotate with version flag |
| `EMAIL_LOOKUP_PEPPER` | Email lookup HMAC | Yes (prod) | Login/register by email works | Separate from encryption key |

### Registration

| Variable | Purpose | Required for alpha? | How to verify | Notes |
|----------|---------|---------------------|---------------|-------|
| `C2K_REGISTRATION_INVITE_CODE` | Invite gate | Recommended | Register fails without code | Distribute securely to testers |
| `C2K_REGISTRATION_OPEN` | Open signup | Optional | `false` for invite-only | Default closed when invite set |

### Mail / password reset (config only)

| Variable | Purpose | Required for alpha? | How to verify | Notes |
|----------|---------|---------------------|---------------|-------|
| `C2K_MAIL_TRANSPORT` | Mail backend | If reset enabled | `GET /api/health/mail` | `smtp`, `resend`, or `disabled` |
| `SMTP_HOST` | SMTP server | If SMTP | Mail health endpoint | Docker: may be `mailserver` |
| `SMTP_PORT` | SMTP port | If SMTP | Mail health | Often `587` |
| `SMTP_USER` / `SMTP_PASS` | SMTP auth | If SMTP | Mail health | Never commit |
| `C2K_MAIL_FROM` | From header | If mail on | Mail health / UI copy | Match SPF/DKIM domain |
| `C2K_PASSWORD_RESET_ENABLED` | Forgot-password feature | Optional | Login page shows link when true | **Do not test reset on alpha during this pass** |

### Uploads

| Variable | Purpose | Required for alpha? | How to verify | Notes |
|----------|---------|---------------------|---------------|-------|
| `S3_ENDPOINT` | Object storage | If uploads on | Ready health `s3: ok` | No MinIO in prod compose |
| `S3_BUCKET` | Bucket name | If uploads on | Upload smoke | |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | S3 credentials | If uploads on | Upload smoke | |
| `S3_PUBLIC_BASE_URL` | CDN base | Optional | Public URL on promoted assets | |
| `C2K_ALPHA_DISABLE_*` | Per-lane upload off | Recommended | API `403 alpha_upload_disabled` | See `.env.production.example` |

### Staff / admin

| Variable | Purpose | Required for alpha? | How to verify | Notes |
|----------|---------|---------------------|---------------|-------|
| `C2K_SITE_OWNER_USER_IDS` | Owner-only reveal | Yes (one UUID) | Owner routes gated | Comma-separated UUIDs |
| `C2K_SITE_ADMIN_USER_IDS` | Site admin | Yes | `/moderation` access | |
| `C2K_PLATFORM_MODERATOR_USER_IDS` | Platform mod | Recommended | Mod queue loads | |

### Legal / public docs

| Variable | Purpose | Required for alpha? | How to verify | Notes |
|----------|---------|---------------------|---------------|-------|
| `VITE_LEGAL_PUBLISHED` | Hide draft banners | Recommended | Build arg; `/privacy` no draft banner | Set at **web build** time |
| Terms / privacy / guidelines | Policy pages | Yes | `/terms`, `/privacy`, `/guidelines` load | |

### Optional

| Variable | Purpose | Required for alpha? | How to verify | Notes |
|----------|---------|---------------------|---------------|-------|
| `VAPID_*` | Web push | No | Push subscription | Deferred for alpha social QA |
| `LIVEKIT_*` | Voice rooms | No | N/A | |
| `ECKE_PUBLISH_*` | Outbound ECKE sync | No | `smoke:ecke-bridge` local only | Keep disabled until intended |
| ClamAV / scanner env | Media scan | If uploads on | Ready health `clamav: ok` | See photo handoff docs |

---

## 4. Pre-deploy checklist

- [ ] Latest code pushed; **branch or tag recorded** in cutover log
- [ ] **Database backup** taken (encrypted off-server per [`VPS_SECURITY_HARDENING.md`](./VPS_SECURITY_HARDENING.md))
- [ ] **Env file backup** stored outside the repo
- [ ] **No destructive seed or wipe** planned for this session
- [ ] `docker-compose.prod.yml` (or your compose file) reviewed
- [ ] Caddy / reverse proxy config reviewed (`DOMAIN`, API proxy, no public `:3001`)
- [ ] **DNS** points to VPS
- [ ] **TLS** certificate path or auto-TLS confirmed
- [ ] **Disk space** sufficient for images and DB growth
- [ ] **Memory** sufficient for API + worker + Postgres + Redis
- [ ] **Firewall**: 80/443 open; DB/Redis not public
- [ ] **Log location** known (`docker compose logs`, host paths)
- [ ] **Rollback plan** documented (previous image tag, backup id)

---

## 5. Build and migration checklist

Adapt paths to your server layout. **No destructive commands below.**

Example sequence (operator adapts):

```bash
# On VPS (example only)
git fetch && git checkout <tag-or-branch>
cp .env.production .env.production.bak.$(date +%Y%m%d)

npm ci
export NODE_ENV=production
set -a && source .env.production && set +a

npm run db:migrate-prod          # non-destructive migrations
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

- [ ] Dependencies installed (`npm ci` or image build)
- [ ] **Migrations applied** (`db:migrate-prod` or `db:migrate-incremental` per runbook)
- [ ] API container running
- [ ] Worker container running
- [ ] Web container running
- [ ] Postgres accepting connections
- [ ] Redis accepting connections
- [ ] Worker logs show no crash loop
- [ ] `GET /api/health` returns ok
- [ ] `GET /api/health/ready` returns database ok

See [`DEPLOYMENT_RUNBOOK.md`](./DEPLOYMENT_RUNBOOK.md) and [`ALPHA_DEPLOYMENT.md`](./ALPHA_DEPLOYMENT.md) for project-specific deploy notes.

---

## 6. Health checks

| Check | URL / action | Expected | If it fails |
|-------|----------------|----------|-------------|
| API liveness | `GET /api/health` | `{ ok: true }` | API down or proxy misconfigured |
| API readiness | `GET /api/health/ready` | `database: ok`, redis/s3/clamav per config | DB URL, network, or dependency |
| Mail config | `GET /api/health/mail` | `ok: true` when SMTP configured | Missing `SMTP_*`, wrong transport |
| Landing page | `GET /` | Loads, no 5xx | Web container or Caddy |
| Login page | `/login` | Form loads | Web routing |
| Forgot password page | `/forgot-password` or linked from login | Page loads; copy does not enumerate accounts | Feature flag off or routing |
| Home (signed in) | `/home` after login | Feed shell loads | Auth or API errors |
| Messaging | `/messaging` | Inbox shell loads | Auth |
| Notifications | `/notifications` | List or empty state | Auth |
| Upload (if enabled) | Profile photo upload | Quarantine/promote path or clear disabled message | S3, scanner, alpha disable flags |

**Password reset during this pass:** load the forgot-password **page only**. Do **not** submit a reset request on VPS alpha.

---

## 7. Alpha seed checklist

Seeds add data; they do **not** replace ECKE listings. See [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md).

Before any seed:

- [ ] **Backup** completed
- [ ] Confirmed **not** running `db:wipe` or full `db:seed`
- [ ] `USE_DATABASE=true` on target API env

### ECKE alpha seed (optional)

- [ ] `ALLOW_ALPHA_SEED=true` set
- [ ] Run only if ECKE demo listings are intended: `npm run db:seed:alpha:ecke -w @c2k/api`
- [ ] Batch key: `alpha-ecke-demo` (reversible via `db:clear:alpha:ecke` only when operator plans cleanup)

### Alpha social seed (optional)

- [ ] `ALLOW_ALPHA_SOCIAL_SEED=true` set
- [ ] **Not** production public DB unless explicitly intended (`FORCE_ALPHA_SOCIAL_SEED_ON_PROD` only with written approval)
- [ ] Command:

```bash
ALLOW_ALPHA_SOCIAL_SEED=true USE_DATABASE=true npm run seed:alpha-social
```

- [ ] Batch key: `alpha-social-seed`
- [ ] Verify fictional users log in (default password in seed doc: `AlphaSocial!23`)
- [ ] Confirm **no real personal data** inserted (fictional `alpha_*`, `example.test` emails only)
- [ ] Re-run is idempotent; duplicates should not appear

---

## 8. Alpha smoke test checklist (operator)

Short pass before inviting testers. Use [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) for full detail.

- [ ] Register with **invite code** (fictional profile data)
- [ ] Log in as **seeded user** (`alpha_social` if seed ran)
- [ ] Visit **Home**; no fake signed-in padding
- [ ] **Create a post**; react/comment
- [ ] Visit **People**; follow or connect
- [ ] View **profile** recent posts
- [ ] **Join a group**; open forum thread; test **deep link**
- [ ] **RSVP** to an event
- [ ] Open **messaging**; check Main and Requests
- [ ] Open **notifications** and **activity**
- [ ] Review **settings / privacy**
- [ ] **Block** a disposable test user (seed pair only)
- [ ] **Report** flow visible on a surface
- [ ] Log out and log back in

---

## 9. Privacy smoke test checklist

| Check | Pass? | Notes |
|-------|-------|-------|
| Only-me post hidden from other users | | `alpha_private` vs stranger |
| Connections-only post gated | | `alpha_connected` |
| Blocked user hidden from feed/people/notifications | | `alpha_blocker` |
| Hidden group membership not on public profile | | `alpha_hidden_member` |
| Private group thread not in non-member Following | | |
| Count-only event hides attendee names | | |
| Scoped/private media omitted for unauthorized viewer | | |
| DM request notification safe preview | | No full private body |
| Undiscoverable profile absent from People search | | `alpha_quiet` |

---

## 10. Mail and password reset readiness (no reset performed)

**This section is configuration and UI verification only.** Do **not** mutate passwords or trigger reset flows on VPS alpha during this pass.

### Allowed

- [ ] Confirm `C2K_PASSWORD_RESET_ENABLED` is set as intended (true or false)
- [ ] `GET /api/health/mail` returns expected status when mail is configured
- [ ] SMTP env vars present when `C2K_MAIL_TRANSPORT=smtp` and reset is enabled
- [ ] **Forgot-password page loads** from login (no form submit required)
- [ ] UI copy does **not** reveal whether an email exists (no account enumeration)
- [ ] Seeded/test credentials documented in [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md)

### Not allowed on VPS alpha during this pass

- [ ] Do **not** request a real password reset email
- [ ] Do **not** click or use a reset token
- [ ] Do **not** change any account password (seeded, tester, owner, admin, moderator)
- [ ] Do **not** run password-reset **mutation** tests against VPS (`password-reset.test.ts`, manual reset confirm)
- [ ] Do **not** use real tester emails for reset testing

**Full password reset testing:** schedule a separate **controlled mail QA pass** (Mailpit locally or dedicated mail staging) per [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md).

---

## 11. Upload checklist

### If uploads enabled (profile photos, etc.)

- [ ] Upload profile photo; quarantine/promote path completes or shows clear status
- [ ] Feed media only if not alpha-disabled
- [ ] Moderation/quarantine behavior visible to operator
- [ ] Private/scoped media does not leak on feed/profile for unauthorized viewer
- [ ] S3 objects not public unless intended (bucket policy review)

### If uploads disabled (typical alpha)

- [ ] UI fails gracefully (message, not silent broken image)
- [ ] API returns `403` with `alpha_upload_disabled` where expected
- [ ] Profile photo lane still works if explicitly allowed

---

## 12. Admin / moderation checklist

- [ ] **Owner** UUID in `C2K_SITE_OWNER_USER_IDS`
- [ ] **Admin** UUID in `C2K_SITE_ADMIN_USER_IDS`
- [ ] **Moderator** UUID in `C2K_PLATFORM_MODERATOR_USER_IDS` (if used)
- [ ] Moderation dashboard loads for staff
- [ ] Report queue loads
- [ ] Test report creates queue item (fictional/safe content only)
- [ ] Owner investigation / sensitive reveal routes are **owner-only** per policy
- [ ] Site admin cannot access owner-only DM reveal if policy requires owner

---

## 13. Tester invite checklist

Before sending invites:

- [ ] Backup exists and backup id recorded
- [ ] Health checks pass (section 6)
- [ ] Seed users verified (if seed ran)
- [ ] Invite code tested once
- [ ] Link testers to [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md)
- [ ] Bug report template in section 6 of QA journey shared
- [ ] **Known issues** list prepared (section 14 below)
- [ ] Tester expectations: fictional data only, no destructive DB actions
- [ ] **Database wipe policy** communicated: operators do not wipe during test window

---

## 14. Known not-ready items

Do not treat absence as a blocker for alpha social QA:

- Payment processing and vendor checkout
- Full group channels, resources, and photo galleries
- Group reply activity aggregation in Following
- Per-group activity mute
- Notification **inline** accept/ignore actions
- Production-scale push notifications on all devices
- Real identity verification
- Mobile app store native apps
- Full vendor integrations
- Full public launch hardening

---

## 15. Emergency rollback notes

Capture before rollback: API/worker logs, `docker compose ps`, last good git tag, backup filename.

| Action | Approach |
|--------|----------|
| Stop traffic | `docker compose -f docker-compose.prod.yml stop` (or scale web to 0) |
| Revert app | Redeploy **previous image tag** or `git checkout <prev>` + rebuild |
| Restore database | Restore from **backup** (pg_restore or operator script); not inline `DROP DATABASE` |
| Disable registration quickly | Set `C2K_REGISTRATION_OPEN=false` and rotate/remove invite code |
| Disable uploads quickly | Set relevant `C2K_ALPHA_DISABLE_*` flags; restart API |
| Disable password reset if mail broken | `C2K_PASSWORD_RESET_ENABLED=false`; restart API |
| Notify | Owner, moderators, active testers with status and ETA |

Record rollback in [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md).

---

## 16. Quick links

| Doc | Use |
|-----|-----|
| [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) | Tester walkthrough |
| [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md) | Seed accounts and commands |
| [`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md) | Wayfinding and moderation notes |
| [`PILOT_READINESS.md`](./PILOT_READINESS.md) | Broader pilot gates |
| [`ALPHA_DEPLOYMENT.md`](./ALPHA_DEPLOYMENT.md) | Controlled alpha deploy |
| [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) | Full mail QA (separate pass) |

---

*When health, seed, smoke, and invite checklists are green, invite testers and track feedback using the QA journey doc.*
