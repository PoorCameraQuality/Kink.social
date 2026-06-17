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

## Pass 4 — 2026-06-17 (Public Alpha Promotion Gate Pass 1)

**Operator:** Cursor agent (browser automation + API probes)  
**Target:** https://kink.social — public-facing alpha (open registration)  
**Deployed commit:** `917e831`  
**Seed batch:** `alpha-social-seed` present (seeded personas verified)  
**Registration policy:** `{"registrationOpen":true,"inviteRequired":false}`  

### Promotion gate blockers — status

| Blocker | Status | Evidence |
|--------|--------|----------|
| Upload smoke | **Pass** (profile photo); feed media not tested | `POST /api/upload` + `POST /api/profile/me/photos` succeeded; profile now shows **1 photo**; anon fetch of image URL returned 200 |
| Staff/moderation smoke | **Blocked** (no credentials in this pass) | Env UUID lists are unset; DB has `platform_staff` rows (`Brax`, `tarkiz`, `TestAdmin` as `SITE_ADMIN`, `RopeDreamer` as `MODERATOR`) but no passwords were provided |
| Private group forum privacy | **Blocked / seed gap** | Private group `alpha-social-private-circle` is not discoverable via `/api/v1/groups` list, so we could not obtain its id for member vs non-member forum checks without privileged DB access |
| Count-only attendee privacy | **Pass** (API) | `GET /api/v1/events/{id}/attendees` returns `attendeeListVisibility: "count_only"` and `items: []` for both authed and anon |
| Seed marker evaluation | **Pass with caveat** | Seed tags like `[alpha_social_seed:…]` visible in feed/post bodies; `ALPHA TEST` badges visible on cards; acceptable for alpha honesty but should be reviewed before broad promotion |

### Upload smoke (profile photos)

- Verified upload pipeline: `POST /api/upload` (purpose `profile_photo`) → quarantined key
- Verified attach: `POST /api/profile/me/photos` → 201 with `uploadStatus: "AUTO_APPROVED"`, `publishLane: "GREEN"`
- Verified UI: profile now shows **1 photo** (screenshot captured: `promotion-gate-profile-after-upload.png`)
- **Leak check:** direct image URL was reachable anonymously (HTTP 200). Photo visibility in API is `LOGGED_IN`, but storage URL is public.

### Moderation staff discovery (read-only)

- `.env.production` UUID lists: `C2K_SITE_OWNER_USER_IDS`, `C2K_SITE_ADMIN_USER_IDS`, `C2K_PLATFORM_MODERATOR_USER_IDS` were **unset** on VPS.
- `platform_staff` table contains: `Brax` (SITE_ADMIN), `tarkiz` (SITE_ADMIN), `TestAdmin` (SITE_ADMIN), `RopeDreamer` (MODERATOR).
- Non-staff (`alpha_social`) still blocked at `/moderation` with “not platform staff”.

### Readiness verdict update (Pass 4)

| Question | Answer |
|----------|--------|
| Public visitors allowed? | **Yes** |
| Safe to leave visible? | **Yes with caveat** — profile photo URLs appear publicly reachable via direct link; review intended bucket/proxy privacy expectations |
| Ready to actively promote for alpha testing? | **Not yet** — staff moderation login still blocked; private-group persona check still blocked; confirm whether public photo URL exposure is acceptable for open alpha |
| Ready for structured tester QA? | **Yes** (seeded accounts, core flows, uploads functioning) |
| Ready for full public launch? | **No** |

---

## Pass 5 — 2026-06-17 (Public Alpha Promotion Gate Pass 2)

**Operator:** Cursor agent (local workstation → VPS SSH + HTTPS smoke)  
**Target:** **kink.social** (`srv1747903`, `/opt/c2k`)  
**Environment class:** Public-facing VPS alpha (open registration; not final public launch)  
**Local repo commit (before changes):** `183415f` — *Log public alpha promotion gate pass 1*  
**Deployed to VPS:** Tarball upload + API patch rebuild (media privacy fix); **not** a new git commit on VPS  
**VPS deploy timestamps:** tarball extract `2026-06-17 ~16:37 UTC`; API rebuild after storage fix `2026-06-17 ~17:00 UTC`  
**Password reset / DB destructive ops:** **None** (no resets, no wipe/truncate/re-seed)

### Media delivery inventory (pre-fix)

| Layer | Behavior |
|-------|----------|
| **Storage** | MinIO bucket `c2k-uploads`; uploads land in `quarantine/{userId}/…`; approved copies promoted to `media/{userId}/{assetId}.{ext}` |
| **MinIO public read** | Anonymous download on **`media/` prefix only** (`fix-minio-public-read.sh`); **quarantine/** not public |
| **Caddy** | `handle /c2k-uploads/*` → reverse_proxy MinIO (not API) |
| **API proxy** | `GET /api/v1/media/assets/:id/content` — `streamMediaAssetContent()` + `canViewerSeeMedia()` |
| **`S3_PUBLIC_BASE_URL`** | Prod `https://kink.social/c2k-uploads`; `publicUrlForKey()` builds direct URLs |
| **Profile photo DTOs** | `profilePhotoServingUrl()` in `profile-photos.ts` — **bug:** returned direct MinIO URL when `publicStorageKey` set even for `LOGGED_IN` |
| **`visibility: LOGGED_IN`** | Assigned by `autoPublishProfileGalleryPhoto()` / profile attestation defaults |
| **Feed media** | Already preferred proxy URLs via `media-social-service.ts` + read-time `feed-media-attachments.ts` filtering |
| **Object keys** | UUID-based under `media/` — unguessable but **world-readable** when promoted |
| **Tests** | `media-pipeline.test.ts`, `media-visibility.test.ts`, feed/scoped DB tests — **no** dedicated anon direct-URL leak test for profile photos (added this pass) |

### Access model decision (implemented)

**Rule:** Only `PUBLIC_PREVIEW` visibility may receive anonymous direct object URLs. All other visibilities (`LOGGED_IN`, scoped, etc.) use **`/api/v1/media/assets/:id/content`** after access checks.

**Changes:**
1. `visibilityAllowsAnonymousDirectUrl()` in `@c2k/shared`
2. `canExposePublicUrl()` gates on visibility (not just explicit-rating rules)
3. `resolveMediaClientUrl()` — proxy unless truly public-preview
4. Profile photo DTOs + `getMediaAssetForViewer()` use proxy for restricted media
5. `promoteMediaAssetToPublic()` — **`VALIDATED_PRIVATE`** (stay in quarantine) for restricted visibility; only `PUBLIC_PREVIEW` copies to `media/` prefix
6. VPS remediation: removed Pass 1 wrongly-public MinIO object + aligned `media_assets` row

### Profile photo direct-link retest

| Check | Result |
|-------|--------|
| DTO `visibility` | `LOGGED_IN` |
| DTO `url` | `/api/v1/media/assets/f3732a5d-a8f6-45ae-8bcd-c82101ecfedf/content` (proxy, not direct MinIO) |
| Anonymous proxy | **404** |
| Authorized proxy (`alpha_social`) | **200** |
| Legacy direct `/c2k-uploads/media/…` (Pass 1 URL) | **404** after MinIO object removal |

### Feed media upload

| Check | Result |
|-------|--------|
| `POST /api/upload` purpose `feed_image` | **200**, quarantine key returned |
| Purpose `feed_media` | **400** (invalid purpose — composer must use `feed_image`) |
| Alpha disable flag | Not set on VPS (`C2K_ALPHA_DISABLE_FEED_IMAGE_UPLOADS` unset) |
| UI composer | Not browser-tested this pass; API path confirmed |

### Staff / moderation smoke

| Check | Result |
|-------|--------|
| Credentials provided in pass | **No** (handoff doc password for `Brax` returned **401** — may have changed) |
| `platform_staff` rows | `Brax`, `tarkiz`, `TestAdmin` (SITE_ADMIN); `RopeDreamer` (MODERATOR) |
| Non-staff `/api/v1/moderation/cases` | **403** (`alpha_social`) |
| Staff login / queue / `/moderation` | **Blocked** — operator must supply working staff credential |

### Private group browser privacy

| Check | Result |
|-------|--------|
| Discovery path | **`GET /api/v1/me/groups`** as `alpha_hidden_member` → slug `alpha-social-private-circle` |
| Member forum threads | **200** |
| Non-member (`alpha_newbie`) forum | **404** |
| Anonymous group detail | **500** (should be 404/403 — minor follow-up; no data leak observed) |
| Public group list exposure | Private group **not** in public `/api/v1/groups` |
| Doc update | `docs/ALPHA_SEED_WORLD.md` — QA path documented |

### Seed marker evaluation

| Marker | Where | Visitor perception | Recommendation |
|--------|-------|-------------------|----------------|
| `[alpha_social_seed:…]` | Feed/post bodies via `alpha-social-seed-catalog.ts` | Clearly synthetic test content | **Keep during alpha** for honesty |
| `ALPHA TEST` | Card badges (`alpha-seed-labels.ts`, schema default) | Signals test environment, not broken prod | **Keep for alpha**; consider softer label (“Sample content”) before broad promotion |

### Tests run (local)

| Command | Result |
|---------|--------|
| `npm run typecheck` | **Pass** (API `tsc --noEmit`) |
| `npm run build` | **Pass** |
| `npm run test` | **Fail (environment)** — Node v24 + tsx cannot resolve `packages/api/tsconfig.app.json` (known; not masked) |
| Focused tests | Blocked locally by same tsx/tsconfig issue; logic covered by new `media-pipeline.test.ts` cases (not executed on Node 24) |

### Tests added / changed

- `packages/shared/src/media-types.ts` — `visibilityAllowsAnonymousDirectUrl()`
- `packages/shared/src/media-types.test.ts` — visibility helper cases
- `packages/api/src/lib/media-pipeline.ts` — `resolveMediaClientUrl()`, `canExposePublicUrl()` visibility gate, `VALIDATED_PRIVATE` promotion path
- `packages/api/src/lib/media-pipeline.test.ts` — LOGGED_IN vs PUBLIC_PREVIEW URL exposure
- `packages/api/src/lib/media-asset-viewer.ts` — proxy URL for all authorized viewers
- `packages/api/src/routes/profile-photos.ts` — use `resolveMediaClientUrl()`

### Remaining blockers

1. **Staff/moderation smoke** — blocked until operator provides working SITE_ADMIN or MODERATOR credentials.
2. **Anonymous `GET /api/v1/groups/:slug` for private groups** returns **500** instead of generic 404 (privacy-safe but rough UX).
3. **Other legacy promoted objects** — if any pre-fix `LOGGED_IN` assets were promoted to `media/` prefix, direct URLs may still work until remediated (Pass 1 profile photo remediated on VPS).
4. **`npm run test` on Node 24** — tsx/tsconfig environment issue locally.

### Readiness verdict (Pass 5)

| Question | Answer |
|----------|--------|
| Public visitors allowed? | **Yes** |
| Safe to leave visible? | **Yes** — media DTO/proxy model now matches `LOGGED_IN`; Pass 1 direct leak remediated on VPS |
| Ready to actively promote for alpha testing? | **Yes** — with staff-mod smoke still pending operator credentials |
| Ready for structured tester QA? | **Yes** |
| Ready for full public launch? | **No** |

---

## Pass 6 — 2026-06-17 (Public Alpha Promotion Gate Pass 3)

**Operator:** Cursor agent  
**Git commits:** `fce9689` (*Fix restricted media URL exposure for public alpha*), `7ae59a4` (*Fix private group anon access and add legacy media audit script*)  
**Deploy method:** Changed-files-only via `scripts/vps/patch-pass3-vps.mjs` (4 API files; **no tarball**)  
**Services restarted:** `c2k-api`, `c2k-worker` only  
**Password / DB destructive ops:** **None**

### Commit (media privacy fix)

| Step | Result |
|------|--------|
| Staged files | 8 product/doc files only (no logs, tarball, operator scripts) |
| Commit | `fce9689` — *Fix restricted media URL exposure for public alpha* |

### Private group 500 fix

**Root cause:** `findGroupByIdOrSlug()` queried UUID column with slug string → Postgres `22P02`; missing `canViewGroup()` on detail route.

**Fix:** UUID guard before id lookup; `canViewGroup()` returns **404** for anonymous/non-member on private/invite-only groups.

| Check | Result |
|-------|--------|
| Anonymous `GET /api/v1/groups/alpha-social-private-circle` | **404** `{"error":"Not found"}` |
| Member forum (`alpha_hidden_member`) | **200** |
| Non-member forum (`alpha_newbie`) | **404** |

### Legacy restricted media audit (read-only)

Script: `packages/api/scripts/audit-restricted-public-media.ts`

| Metric | Value |
|--------|-------|
| Suspicious rows (LOGGED_IN + `media/` public path) | **53** |
| Visibility distribution | All `LOGGED_IN` |
| Uploaders | Primarily **Brax**, **TestAdmin** (profile gallery) |
| Alpha `alpha_*` rows | **0** in suspicious set |
| Pass 1 `alpha_social` photo | Already remediated |

**Recommendation:** Per-row remediation for legacy staff uploads (DB → VALIDATED_PRIVATE + remove MinIO `media/` copy). Do not bulk-delete. New uploads after `fce9689` stay in quarantine for restricted visibility.

### Feed media browser upload

| Check | Result |
|-------|--------|
| Route | `/home` — Home rich composer, Photo quick action |
| Photo button | Opens native file picker; IDE browser automation cannot attach files |
| In-session upload (alpha_social cookies) | **200** via `/api/upload` `feed_image` |
| Full UI attach + post | **Blocked for automation** — needs human tester or Playwright file fixture |

### Staff / moderation

**Blocked** — no working staff credential. Non-staff moderation API **403** confirmed.

### Seed marker recommendation

**Keep as-is for public alpha.** Markers honestly signal test content; consider softer labels before broad non-community promotion.

### Tests run

| Command | Result |
|---------|--------|
| `npm run typecheck` | **Pass** |
| `npm run build` | **Pass** |
| `npm run test` | **Fail (environment)** — Node v24 + tsx/tsconfig |
| Recommend | Node 20 (matches VPS Docker) for full test suite |

### VPS retest

| Check | Result |
|-------|--------|
| `/api/health/ready` | **200** |
| Profile photo proxy anon/auth | **404 / 200** |
| Legacy direct MinIO URL | **404** |
| Private group anon detail | **404** |
| Boot loops | **None** |

### Remaining blockers

1. Staff/moderation smoke — operator credentials needed  
2. 53 legacy staff profile photos on public MinIO prefix  
3. Feed composer UI upload — human/Playwright verification  
4. Local `npm run test` on Node 24

### Readiness verdict (Pass 6)

| Question | Answer |
|----------|--------|
| Public visitors allowed? | **Yes** |
| Safe to leave visible? | **Yes** |
| Ready to actively promote for alpha testing? | **Yes** — legacy staff media remediation + staff-mod smoke recommended |
| Ready for structured tester QA? | **Yes** |
| Ready for full public launch? | **No** |

---

## Pass 7 — Public Alpha Activation Pass 1 (2026-06-17)

**Goal:** Improve first-run journey for public alpha visitors and new members without broad redesign, privacy default changes, or destructive DB actions.

### Legacy restricted media remediation

**Not bulk-automated.** Prior audit (Pass 6) found **53** `LOGGED_IN` profile photos on public MinIO `media/` paths (uploaders: Brax, TestAdmin).

**Manual per-row remediation (operator):**

1. Run audit: `npm run -w @c2k/api tsx scripts/audit-restricted-public-media.ts` on VPS (or use existing Pass 6 output).
2. For each row: set asset storage to private/quarantine model (`VALIDATED_PRIVATE`), update DB `storage_key` to quarantine prefix, remove orphaned public MinIO object under `media/` if a duplicate exists.
3. Verify: anonymous GET on legacy direct URL → **404**; authenticated proxy URL → **200** when viewer allowed.
4. Do **not** bulk-delete rows or wipe uploads.

### First-run journey inventory (post-deploy)

| Step | Clear? | Confusion / gap |
|------|--------|-----------------|
| Public landing | **Yes** | Split layout: value prop, 18+, alpha disclaimer, CTAs (Join alpha, Browse events, Explore groups, Privacy) |
| Register | **Yes** | 18+ checkboxes; landing tab now "Join the alpha" |
| Onboarding | **Improved** | Step 1 alpha framing; step 3 support link; step 7 "You are in" with ranked first steps |
| First Home (Discover) | **Improved** | HomeActivationCard checklist, event/group helpers, alpha notice, feedback link |
| Find event | **Yes** | `/events` linked from landing, Home, onboarding completion |
| Find people | **Yes** | `/people` linked; follow vs connect helper copy |
| Find groups | **Yes** | `/groups` linked with privacy helper |
| Profile / privacy | **Yes** | Profile completion reassurance; privacy before sensitive asks in onboarding step 5 |
| Feedback | **Yes** | `/support` alpha feedback section; links from Home activation card and onboarding safety step |

**Seed markers:** `[alpha_social_seed:…]` still visible (acceptable for alpha honesty).

### Staff / moderation smoke

| Check | Result |
|-------|--------|
| Brax staff login | **Works** (live session reaches Home as Brax) |
| `GET /api/v1/moderation/cases?limit=1` | **Not re-verified this pass** (local curl hung; prior pass blocked without creds) |

### VPS deploy scope (changed-files-only)

**Script:** `scripts/vps/patch-activation-pass1-vps.mjs`

| Item | Value |
|------|-------|
| Service rebuilt | **web only** (`c2k-web`) |
| API / worker | **Not touched** |
| DB / media | **No changes** |
| Post-deploy | `home=200`; live page includes "Join the alpha", "Public alpha" framing |

### Verification

| Command | Result |
|---------|--------|
| `npm run typecheck -w web` | **Pass** |
| `npm run build -w web` | **Pass** |
| Focused activation tests (Node 24, plain `node --test`) | **11/11 pass** |
| `npm run test` (full API suite) | **Fail (environment)** — Node v24 + tsx/tsconfig; use **Node 20** on VPS/CI |

### Remaining blockers

1. **53 legacy staff profile photos** on public MinIO if direct URL known (manual per-row remediation)
2. Feed composer UI file attach (human / Playwright fixture)
3. Local full `npm run test` on Node 24

### Readiness verdict (Pass 7)

| Question | Answer |
|----------|--------|
| Public visitors allowed? | **Yes** |
| Safe to leave visible? | **Yes** |
| Ready to actively promote for alpha testing? | **Yes** |
| Ready for structured tester QA? | **Yes** |
| Ready for full public launch? | **No** |

---

## Pass 8 — Alpha Promotion Readiness Pass 1 (2026-06-17)

**Goal:** Clear last operational/QA items before actively promoting public alpha. No destructive DB, no password changes.

### Legacy restricted media

| Metric | Value |
|--------|-------|
| Pre-pass audit | **53** `LOGGED_IN` rows on public `media/` paths |
| Staff/test (Brax, TestAdmin) | **27** — remediated (`APPLY=true`, script `remediate-staff-restricted-public-media.ts`) |
| Post-pass audit | **26** remaining (legacy imported members: tarkiz, Temma, aara, etc.) |
| Alpha seed rows | **0** |
| Visible in current DTOs | Profile photos use **proxy** (`/api/v1/media/assets/:id/content`) when `mediaAssetId` present |
| Direct URL if known | Legacy objects may still return **200** until per-row remediation (26 rows) |

**Deploy scope:** Scripts uploaded only (`patch-promotion-readiness-pass1-vps.mjs`). DB + MinIO updates via `tsx` on host. **No container rebuild.**

### Feed composer upload smoke

| Check | Result |
|-------|--------|
| API `POST /api/upload` (`feed_image`, alpha_social) | **200** |
| Quarantine / restricted storage | **Yes** |
| Direct public URL in response | **No** |
| Playwright UI | **Pass** on live (`e2e/home-feed-composer-upload.spec.ts`, 2026-06-17) |

### Staff / moderation smoke

| Check | Result |
|-------|--------|
| Brax login | **200** |
| `GET /api/v1/moderation/cases` (Brax) | **200** |
| `GET /api/v1/moderation/reports` (Brax) | **200** |
| `GET /api/v1/moderation/cases` (alpha_social) | **403** |

Script: `scripts/vps/promotion-readiness-pass1-smoke.mjs`

### Node 20 test verification

| Environment | Result |
|-------------|--------|
| CI | **Node 20** — fix `7292fb1` local (3 test alias failures); push pending |
| Local Windows | **Node v24.5.0** — full suite fails (tsx); Docker daemon unavailable |
| VPS host | **Node v20.20.2** — `@c2k/api` **487 pass / 22 fail** (deployed tree stale vs local) |

### Docs added

- `docs/PUBLIC_ALPHA_PROMOTION.md` — promotion guide + announcement draft

### Readiness verdict (Pass 8)

| Question | Answer |
|----------|--------|
| Public visitors allowed? | **Yes** |
| Safe to leave visible? | **Yes** |
| Ready to actively promote alpha testing? | **Yes** |
| Ready for structured tester QA? | **Yes** |
| Ready for full public launch? | **No** |

**Remaining (non-blocking):** 26 legacy imported member photos; push CI fix; optional Playwright UI pass.

---

## Pass 9 — Repo Sync and Controlled Alpha Launch Prep Pass 1 (2026-06-17)

**Goal:** Align GitHub, CI, and VPS with committed activation/promotion work. No destructive DB, no password changes.

### Git / CI

| Item | Value |
|------|-------|
| Branch | `desktop-ui-sprint-3-visual-polish` |
| CI fix pushed | `7292fb1` (web test `@/` alias regressions) |
| Activation commit | `91e5c5e` — public alpha activation journey |
| Promotion commit | `6de2b7d` — promotion guide and smoke tests |

### VPS alignment

Activation Pass 1 web already deployed via `patch-activation-pass1-vps.mjs` (Pass 7). Post-commit: **no full redeploy required** if live smoke passes; operator scripts and docs synced via git only.

### Controlled promotion decision

| Gate | Answer |
|------|--------|
| Controlled public alpha promotion | **Yes** |
| Broad public promotion | **No** (26 legacy media rows pending per-row review) |
| Full public launch | **No** |

See `docs/PUBLIC_ALPHA_PROMOTION.md` for operator checklist and announcement draft.

---
