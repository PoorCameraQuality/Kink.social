# VPS alpha execution log

Running journal for operator execution passes against the live VPS alpha stack. No secrets in this file.

**Guide:** [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md) · **Cutover:** [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md)

---

## Pass 1 — 2026-06-17 (remote smoke only)

**Operator:** Cursor agent (local workstation)  
**Target label:** VPS alpha — **kink.social** (`srv1747903`, stack `/opt/c2k` per cutover log)  
**Environment class:** Invite-only VPS alpha (not public launch)  
**Compose files (expected):** `docker-compose.prod.yml` + `docker-compose.prod.vps.yml`  
**Local repo reference (not deployed this pass):** branch `desktop-ui-sprint-3-visual-polish`, commit `6d1a0df604ab9a0e8f24a221f82e2e4f97ac27dc` (many uncommitted local changes; not pushed/deployed)

### Blocker

**No VPS shell access from execution environment.** `SSH_PASS` / `SSH_PASSWORD` unset. Steps requiring SSH (backup, pull, migrate, seed, authenticated smoke) were **not executed**.

### ECKE / seed intent

| Item | Status |
|------|--------|
| ECKE data on VPS | **Expected present** (per cutover log; not re-verified this pass) |
| Alpha social seed this pass | **Intended but not run** (blocked: no backup + no SSH) |
| `alpha_social` login probe | **401 Invalid credentials** (seed not present or creds differ) |

### Backup

| Step | Result |
|------|--------|
| Postgres backup | **Not run** (requires VPS shell + `DATABASE_URL`) |
| Env file backup | **Not confirmed** |

**Do not seed until backup succeeds on VPS.**

### Deploy / pull

| Step | Result |
|------|--------|
| git pull on VPS | **Not run** |
| docker compose build/up | **Not run** |

### Env readiness (VPS)

**Not verified on server** (no SSH). Remote mail health suggests SMTP transport configured. Variable **names** to confirm on VPS before seed:

- Core: `NODE_ENV`, `USE_DATABASE`, `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `COOKIE_SECRET`, `C2K_PUBLIC_WEB_URL`, `DOMAIN`
- Encryption: `C2K_FIELD_ENCRYPTION_KEY`, `EMAIL_LOOKUP_PEPPER`
- Registration: `C2K_REGISTRATION_INVITE_CODE`, `C2K_REGISTRATION_OPEN`
- Mail: `C2K_MAIL_TRANSPORT`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `C2K_MAIL_FROM`, `C2K_PASSWORD_RESET_ENABLED`
- Uploads: `S3_*`, `C2K_ALPHA_DISABLE_*` as applicable
- Staff: `C2K_SITE_OWNER_USER_IDS`, `C2K_SITE_ADMIN_USER_IDS`, `C2K_PLATFORM_MODERATOR_USER_IDS`

### Remote health checks (HTTPS, no password reset)

| Check | Result |
|-------|--------|
| `GET /` | 200 |
| `GET /api/health` | 200 ok |
| `GET /api/health/ready` | 200, database/redis/s3 ok |
| `GET /api/health/mail` | 200, `ok: true`, transport smtp, passwordResetEnabled true |
| Login shell | 200 |
| Forgot-password page | 200 (page load only; **no reset submitted**) |
| Messaging shell | 200 |
| `_smoke-prod-quick.mjs` | **9/9 pass** |

**Password reset:** Not tested (no request, no token, no password change).

### Migrations

**Not run** (no VPS shell).

### Alpha social seed

**Not run.** Prerequisites missing: backup + SSH + deploy decision on commit.

Command when ready (on VPS, after backup):

```bash
ALLOW_ALPHA_SOCIAL_SEED=true USE_DATABASE=true npm run seed:alpha-social
```

Requires `FORCE_ALPHA_SOCIAL_SEED_ON_PROD=true` only if guard treats host as production-like.

### Smoke tests

| Area | Result |
|------|--------|
| Login as `alpha_social` | **Blocked** (401; seed absent) |
| Home / People / Groups / Events / Messaging / Notifications authenticated | **Blocked** (no session) |
| Privacy personas | **Blocked** (requires seed) |
| Upload smoke | **Not run** |
| Admin/moderation | **Not run** |

### Local verification (workstation)

```bash
npm run test
```

**Result:** Exit 1 — `password-reset.test.ts` → `ECONNREFUSED 127.0.0.1:6432` (local Postgres not running). Environment issue, not doc/code regression from this pass.

### Known issues / next actions

1. Operator: SSH to VPS with existing runbook (`SERVER_MOUNT_RUNBOOK.md`).
2. Backup Postgres + `.env.production` on VPS.
3. Decide deploy commit (social spine + seed script may be uncommitted locally).
4. Pull/build/up, run `db:migrate-prod` (non-destructive).
5. Run alpha social seed with guards; verify `alpha_social` login.
6. Operator smoke per [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md).
7. **Do not** run password reset flow on VPS during alpha prep.

### Readiness verdict (Pass 1)

| Question | Answer |
|----------|--------|
| Ready for internal dry run (full social seed QA)? | **No** — seed and authenticated smoke pending |
| External testers should wait? | **Yes** |

---
