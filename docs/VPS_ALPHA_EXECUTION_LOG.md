# VPS alpha execution log

Running journal for operator execution passes against the live VPS alpha stack. No secrets in this file.

**Guide:** [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md) · **Cutover:** [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md)

---

## Pass 1 — 2026-06-17 (remote smoke only)

**Operator:** Cursor agent (local workstation)  
**Target label:** VPS alpha — **kink.social** (`srv1747903`, stack `/opt/c2k` per cutover log)  
**Environment class:** Public-facing VPS alpha (open for visitors; not final public launch)  
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
| Public visitors allowed? | **Yes** (site publicly reachable; registration policy not verified this pass) |
| Ready to actively promote for alpha testing? | **No** — seed and authenticated smoke pending |
| Ready for structured tester QA? | **No** |
| Ready for full public launch? | **No** |

---

## Pass 2 — 2026-06-17 (deploy + alpha social seed)

**Operator:** Cursor agent (local workstation → VPS SSH)  
**Target:** **kink.social** (`srv1747903`, `/opt/c2k`)  
**Environment class:** Public-facing VPS alpha (open for visitors; not final public launch)  
**Compose:** `docker-compose.prod.yml` + `docker-compose.prod.vps.yml`  
**Local commit (built + pushed):** `917e831c32df3fde80611d72c9da6c22fead60ea` — *Harden social spine and add alpha readiness tooling*  
**Deploy method:** Tarball upload (VPS `/opt/c2k` is **not** a git clone; `git pull` unavailable)  
**Deployed source marker:** `package.json` mtime `2026-06-17 14:44:21 UTC` after tarball extract  

### Local preflight

| Step | Result |
|------|--------|
| `git status` | Social spine + seed + tests staged; logs/tgz excluded |
| `npm run typecheck` | **Pass** (fixed `awaitingPartnerAcceptance` type in messaging page) |
| `npm run build` | **Pass** |
| `npm run test` | **Fail (environment)** — Node v24 + tsx cannot resolve `packages/api/tsconfig.app.json`; not a code regression from this pass |

### Backup (before migrate/seed)

| Step | Result |
|------|--------|
| Postgres backup | **OK** — `/opt/c2k/backups/c2k-pg-pass2-20260617-152123.sql` (~1.67 MB) |
| `.env.production` backup | **OK** — `.env.production.bak-pass2-20260617-152123` |
| User count before | **79** |

**No wipe/truncate/reset commands run.**

### Deploy / migrations

| Step | Result |
|------|--------|
| Source upload | Tarball extract to `/opt/c2k` |
| `npm ci --omit=optional` | OK |
| `node scripts/migrate-prod.mjs` | OK — drizzle push Zod warning (known expression-index issue); incremental + hub-ext + organizer-parity applied |
| `docker compose build api web worker` | OK |
| `docker compose up -d` | OK — api, web, worker recreated; postgres/redis/caddy/mail unchanged |

### Services (post-deploy)

| Service | Status |
|---------|--------|
| c2k-api-1 | Up |
| c2k-web-1 | Up |
| c2k-worker-1 | Up |
| c2k-postgres-1 | Up (5 days) |
| c2k-redis-1 | Up |
| c2k-caddy-1 | Up (reverse proxy) |
| Boot loops | **None observed** |

### Env readiness (names only; values not verified on shell)

Assumed present from prior cutover + health endpoints: `NODE_ENV`, `USE_DATABASE`, `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `COOKIE_SECRET`, `C2K_PUBLIC_WEB_URL`, `DOMAIN`, mail SMTP vars, S3 vars. Staff ID lists not re-audited this pass.

### Health checks (HTTPS; no password reset submitted)

| Check | Result |
|-------|--------|
| `GET /` | 200 |
| Login shell | 200 |
| Forgot-password page | 200 (load only) |
| Messaging shell | 200 |
| Notifications shell | 200 |
| `GET /api/health` | 200 ok |
| `GET /api/health/ready` | 200 database/redis/s3 ok |
| `GET /api/health/mail` | 200 smtp ok, passwordResetEnabled true |
| `_smoke-prod-quick.mjs` | **9/9 pass** |

**Password reset:** Not tested (no form submit, no email, no token, no password change).

### Alpha social seed

```bash
ALLOW_ALPHA_SOCIAL_SEED=true FORCE_ALPHA_SOCIAL_SEED_ON_PROD=true USE_DATABASE=true npm run seed:alpha-social
```

| Item | Result |
|------|--------|
| Guard | Allowed (production warning shown; host 127.0.0.1) |
| Batch key | `alpha-social-seed` present |
| alpha_* users | **15** created |
| Events total | **55** (50 existing + 4 alpha-only + seed RSVPs on existing) |
| Feed posts (alpha_social) | Seeded content visible via `/api/v1/me/feed-posts` |
| Groups / forums / DMs / notifications | Seeded (3 DM convs, 5 notifications on first run) |
| ECKE/event wipe | **None** — inventory reported 50 events before seed; existing titles reused |
| Idempotency re-run | **OK** — alpha user count stayed 15; 0 duplicate comments/reactions/DMs/notifications |

### Login + authenticated API smoke (`alpha_social`)

| Check | Result |
|-------|--------|
| `POST /api/auth/session` | **200** authenticated |
| `/api/v1/feed/home` | 200, cards with seeded activity |
| `/api/v1/feed/following` | 200, seeded items |
| `/api/v1/me/feed-posts` | 200, seeded posts |
| `/api/v1/connections` | 200, accepted connections present |
| `/api/v1/conversations?folder=main` | 200 |
| `/api/v1/notifications` | 200 |
| `/api/v1/activity/inbox` | 200 |
| `/api/v1/groups` | 200 |
| `/api/v1/events?upcoming=true` | 200, ECKE titles present |

Browser UI walkthrough (Home, People, Groups, Events, Settings) **not fully automated** this pass — run **Internal Browser QA Pass 1** per [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) §12 before active promotion.

### Privacy smoke (seed personas)

| Scenario | Result |
|----------|--------|
| Only-me post (`alpha_private`) | Author sees 1; `alpha_newbie` sees **0** on profile feed-posts |
| Undiscoverable profile search (`alpha_hidden`) | `/api/v1/profiles?q=alpha_hidden` → **empty** |
| Moderation queue as non-staff | **403** (expected) |

Full blocked-user / private-group / count-only attendee / media-scoped checks deferred to human [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) pass.

### Upload smoke

| Check | Result |
|-------|--------|
| `GET /api/v1/profile/photos` | **404** (route not registered at this path; upload UI may use different endpoint) |
| File upload test | **Not run** — needs correct route + safe test image in browser |

### Admin / moderation smoke

| Check | Result |
|-------|--------|
| Moderation cases API as `alpha_private` | 403 |
| Owner/admin dashboard | **Not run** (no staff session this pass) |

### Known issues

1. VPS deploy path is tarball-based, not git — record commit hash in runbook when deploying.
2. `npm run test` fails locally on Node 24 (tsx/tsconfig path), unrelated to VPS.
3. Some smoke probes used wrong paths (`/api/v1/people`, `/api/v1/social-graph/connections`) — correct routes include `/api/v1/profiles`, `/api/v1/connections`.
4. Human browser QA, upload smoke, and staff moderation flows still needed **before actively promoting alpha testing**.

### Readiness verdict (Pass 2)

| Question | Answer |
|----------|--------|
| Public visitors allowed? | **Yes** — alpha server open for visitors |
| Ready to actively promote for alpha testing? | **Not yet** — complete Internal Browser QA Pass 1 first |
| Ready for structured tester QA? | **After** browser QA + upload/staff smokes |
| Ready for full public launch? | **No** |

---

## Framing correction — 2026-06-17 (docs only)

**Change:** kink.social is documented as **public-facing alpha** (open for visitors), not invite-only by default. Registration is **env-driven** — verify with `GET /api/auth/registration-policy`.

**Live check (this pass):** `{"registrationOpen":true,"inviteRequired":false}` — registration is **open during alpha**; docs updated to match.

**Docs updated:** [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md), [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md), [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md), [`PILOT_READINESS.md`](./PILOT_READINESS.md), [`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md), this log; UI `AlphaNotice` copy.

**Still not launch:** Alpha warnings, fictional seed data, and internal browser QA before active promotion remain required.

**Remaining doc mismatches (not in this pass scope):** [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md), [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md), [`ALPHA_DEPLOYMENT.md`](./ALPHA_DEPLOYMENT.md), [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) still mention invite-only alpha in places — update when those files are next touched.

---

## Pass 3 — 2026-06-17 (Internal Browser QA Pass 1)

**Operator:** Cursor agent (Cursor IDE browser automation + API-assisted privacy checks)  
**Target:** **https://kink.social** — public-facing VPS alpha  
**Deployed commit (tarball):** `917e831` (social spine + seed); log/docs `14c69f8`  
**Primary account:** `alpha_social` (seed password from [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md); not printed here)  
**Browser method:** Cursor IDE browser MCP (Chromium); mobile via CDP `390×844` emulation  
**Password reset:** Not tested (no form submit, no email, no token, no password change)  
**Destructive DB:** None  

### Environment confirmation

| Item | Result |
|------|--------|
| Public-facing alpha | **Yes** — unauthenticated `GET /` → 200 |
| Registration policy | `registrationOpen: true`, `inviteRequired: false` |
| Seeded login | **Pass** — `alpha_social` → onboarding then `/home` |

### Area results (browser unless noted)

| Area | Route | Account | Result | Notes |
|------|-------|---------|--------|-------|
| Login | `/?login=1` | `alpha_social` | **Pass** | Lands on 7-step onboarding first visit; completes to Home |
| Home | `/home` | `alpha_social` | **Pass** | Following / Near you / Trending; seeded feed + composer; `ALPHA TEST` badges; no client demo padding |
| People | `/people` | `alpha_social` | **Pass** | Follow vs Connect copy; seeded suggestions (`alpha_mod`); 2 directory members |
| Profile | `/profile` | `alpha_social` | **Pass** | Recent posts, RSVPs, groups, **Add photos** CTA |
| Connections | `/connections` | `alpha_social` | **Pass** (API) | Browser nav partial; API: 5 connections; Activity shows pending request from `alpha_newbie` |
| Groups | `/groups` | `alpha_social` | **Pass** | Seeded alpha groups listed (`alpha-social-regional-hub`, etc.) |
| Group forums | `/groups/{id}?tab=Forums` | `alpha_social` | **Pass** | Regional hub opens; forum tab loads |
| Events | `/events`, `/events/{id}` | `alpha_social` | **Pass** (API+partial UI) | ECKE title **Twisted Tryst** in API; event detail route loads |
| Messaging | `/messaging` | `alpha_social` | **Pass** | Main / Requests / ISO; accepted thread (Quinn Park); safety copy |
| Notifications | `/notifications` | `alpha_social` | **Pass** (via Activity) | Connection accept + DM previews on `/activity` |
| Activity | `/activity` | `alpha_social` | **Pass** | Explains broader recap; links to settings/messages |
| Settings privacy | `/settings/privacy` | `alpha_social` | **Pass** | Page loads (authenticated shell) |
| Upload | `/profile` + `POST /api/profile/me/photos` | `alpha_social` | **Partial** | API route **`/api/profile/me/photos`** → 200 `{photos:[]}`. UI shows **Add photos**. File upload not executed this pass |
| Admin/mod | `/moderation` | `alpha_social`, `alpha_mod` | **Blocked** | UI: “not platform staff”; API moderation → 403. No owner/site-admin creds in seed doc |
| Mobile | `/home` (390px) | `alpha_social` | **Pass** | Bottom nav (Home/Explore/Events/Messages/Me); feed usable; badges visible |
| Desktop | core routes | `alpha_social` | **Pass** | Three-column Home/People; rails render |

### Privacy smoke (API + browser where noted)

| Scenario | Result |
|----------|--------|
| Only-me post (`alpha_private`) | **Pass** — author sees posts; `alpha_newbie` sees `items:[]` |
| Connections-only (`alpha_connected`) | **Pass** — non-connection sees 0 posts |
| Blocked user in search (`alpha_blocked` as `alpha_blocker`) | **Pass** — 0 results |
| Undiscoverable (`alpha_quiet` search) | **Pass** — empty `/api/v1/profiles?q=alpha_quiet` |
| Non-staff moderation | **Pass** — 403 |
| Private group forum (non-member) | **Not fully verified** — private group not in discover list for quick API probe |
| Count-only attendees | **Not verified in browser** this pass |
| DM preview in Activity | **Acceptable** — seed-tagged body visible to recipient only (not public surface) |

### Console errors

None captured in automation session (no persistent error overlay; no loading loops observed on Home after onboarding).

### Screenshots (local temp; no secrets)

| File | Area |
|------|------|
| `qa-pass1-home-desktop.png` | Home desktop |
| `qa-pass1-people-desktop.png` | People |
| `qa-pass1-messaging-desktop.png` | Messaging |
| `qa-pass1-home-mobile.png` | Home mobile |

Saved under Cursor screenshots temp path on operator workstation.

### Known blockers / polish before active promotion

1. **Upload smoke incomplete** — identify UI file picker + run safe image upload through profile composer.
2. **Staff moderation smoke blocked** — need site owner/admin UUID account (not seeded `alpha_mod` group mod).
3. **Onboarding gate** on first seeded login — expected for new accounts; document for structured testers.
4. **Seed markers visible** (`[alpha_social_seed:…]`, `ALPHA TEST` badges) — good for alpha honesty; may want softer presentation before broad promotion.
5. **Private group / count-only attendee** privacy scenarios need dedicated browser pass with persona switching.

### Readiness verdict (Pass 3)

| Question | Answer |
|----------|--------|
| Public visitors allowed? | **Yes** |
| Safe to leave visible? | **Yes with caveats** — no obvious public privacy leaks; seed/test labeling visible |
| Ready to actively promote for alpha testing? | **Not yet** — finish upload + staff smokes; optional seed-marker polish |
| Ready for structured tester QA? | **Yes** — share [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) with seeded accounts |
| Ready for full public launch? | **No** |

---
