# Pilot readiness — first real org

**Last updated:** 2026-06-12 (VPS alpha live at kink.social — pass 26 doc sync)

**Tier 1 plan:** [`plans/TIER_1_PILOT_READINESS.md`](./plans/TIER_1_PILOT_READINESS.md)  
**Strategic context:** [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) Phase 1  
**Mail runbook:** [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md)  
**Server / K8s mount:** [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) — **start here when SSH or kubectl is available**

Use this doc for operator sign-off and engineer verification before inviting a pilot organization.

**Web UX sign-off:** Every P0–P2 audit item is tracked in [`UI_UX_COMPLETION.md`](./UI_UX_COMPLETION.md) (100% closure 2026-06-01). Run the manual checks there before pilot UI walkthroughs.

**Social platform alpha QA:** Human testers walking Home, People, Groups, Events, Messaging, and privacy scenarios should use [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md). Seeded accounts: [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md). **VPS operator prep:** [`VPS_ALPHA_READINESS.md`](./VPS_ALPHA_READINESS.md).

### Deployment posture

| Mode | Status |
|------|--------|
| **Local Docker** | `docker compose -f docker-compose.dev.yml up -d` → migrate → `npm run dev`. Mail via **Mailpit**; pilot smokes against `http://127.0.0.1:3001` / `:5173`. |
| **Production (VPS alpha)** | **Live** — **https://kink.social** (`/opt/c2k`, Docker Compose). Health/mail green; invite-only registration. See [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) § Prod mounted. |
| **K8s staging** | Manifests ready (`k8s/base/`) — not the current prod path. |

**Engineering dry run** on `preview-c2k-weekend` remains the local gate. **First external pilot org** on prod is still open (row **F** below) — current prod is invite-only alpha with a small user set.

---

## Alpha readiness (v3 §16 — local vs server)

| Criterion | Local (Docker) | Needs server |
|-----------|----------------|--------------|
| Registration → registrant list | ☑ `smoke-greenfield-registration.mjs` | — |
| Door panel on phone | ☑ LOC-DOOR-MOBILE — **engineering signed 2026-06-06** (Playwright `door.spec.ts` + manual 390×844 spot-check) | — |
| Attendee hub schedule/chat/push | ☑ C212–C215 — verify on preview | Push on real device optional |
| ECKE publish listing | ☑ Local — `npm run smoke:ecke-bridge -w @c2k/api` → `preview-c2k-weekend` on ECKE Supabase; ECKE `verify:c2k-bridge` | Prod ECKE redeploy + public URL |
| Email | ☑ Mailpit | Prod SMTP checklist |
| Rate limits + permission audit | ☑ Tier 1 | Re-verify on prod |
| `paidConfirmed` organizer-only | ☑ no payment integration | — |
| Reports E2E | ☑ `smoke-reports.mjs` | — |
| Moderation alpha pass | ☑ `verify:trust-safety` (incl. `moderation-scoped.test.ts`, `legal-alpha.test.ts`); `smoke-moderation-checkpoint.mjs`; `smoke-reports.mjs` in `verify:alpha` (2026-06-06) | — |
| Identity ban on login | ☑ existing | — |
| PWA manifest + offline | ☑ LOC-PWA | — |
| Real org without dev help | Dry run only | **PILOT-ORG** |
| Organizer tab walk | ☑ `smoke-organizer-tab-walk.mjs` + **manual § DANCECARD (owner task)** | — |

---

## Prerequisites

| Resource | Purpose |
|----------|---------|
| [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md) | Dev smoke URLs (`RopeDreamer` / `demo`) |
| [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md) | Organizer automated + manual verification |
| [`DEPLOY_MAIL_K8S.md`](./DEPLOY_MAIL_K8S.md) | SMTP/Resend reference |
| [`REALTIME_SCALING.md`](./REALTIME_SCALING.md) | Single vs multi-replica WS |

**Dev stack:**

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:migrate-incremental -w @c2k/api
npm run dev
```

**Automated local pilot smoke:**

```bash
npm run verify:alpha              # one-command gate (Docker + dev + verify:alpha:auto)
# or, stack already up:
npm run verify:alpha:auto         # fail-fast gate only — see table below
# individual scripts:
node scripts/pilot-readiness-smoke.mjs             # 11 checks — health, mail, organizer, hub, org, feed
node scripts/smoke-attendee-dancecard.mjs          # RopeDreamer: volunteer open, policies, groups, calendar
npm run db:ensure-preview-categories -w @c2k/api   # if parity says no categories
npm run db:ensure-preview-attendee-parity -w @c2k/api
# organizer parity (API on :3001):
cmd /c "set API_BASE=http://127.0.0.1:3001&& npx tsx packages/api/scripts/smoke-organizer-parity.ts preview-c2k-weekend"
# T&S / moderation (separate from verify:alpha):
npm run verify:trust-safety
node scripts/smoke-moderation-checkpoint.mjs
```

### Official alpha gate — `npm run verify:alpha`

`npm run verify:alpha` delegates to `scripts/verify-alpha-local.mjs` → **`verify:alpha:auto:local`** (Docker compose, `db:prepare`, dev servers if needed, then **`verify:alpha:auto`**).

Core gate (`scripts/verify-alpha-auto.mjs`) — **11 steps** when E2E, screenshots, and pilot smokes are enabled; sequential fail-fast. Assumes stack + Mailpit reachable (or use `verify:alpha:auto:local` to orchestrate):

| Step | Command / scope |
|------|-----------------|
| Prelaunch | `npm run verify:prelaunch` — typecheck + `npm test` + `npm run build` |
| Alpha E2E | `npm run test:e2e:alpha-gate` — route smokes, alpha flows/routes, door, moderation-ts (not full Playwright matrix) |
| Screenshots | `node scripts/capture-alpha-screenshots.mjs` (skip: `VERIFY_SKIP_SCREENSHOTS=1`) |
| Pilot readiness | `node scripts/pilot-readiness-smoke.mjs` — **11/11** (health, mail, mailpit, organizer, people, register-info, hub, participation, org, **feed/following**) |
| Registration | `node scripts/smoke-greenfield-registration.mjs` |
| Reports | `node scripts/smoke-reports.mjs` |
| Organizer tab walk | `node scripts/smoke-organizer-tab-walk.mjs` |
| Attendee dancecard | `node scripts/smoke-attendee-dancecard.mjs` |
| Command bridge audit | `node scripts/audit-command-bridge.mjs` |
| Scope email double opt-in | `node scripts/smoke-scope-email-double-optin.mjs` |
| Transactional mail | `node scripts/smoke-transactional-mail.mjs` — org welcome + RSVP confirm via Mailpit |

**Optional skips:** `VERIFY_SKIP_E2E=1`, `VERIFY_SKIP_SCREENSHOTS=1`, `VERIFY_SKIP_PILOT_SMOKES=1`.

**Full Playwright matrix:** `npm run test:e2e` (permissions, media-ts, legal-alpha-smoke, mail, etc.) — not part of the default alpha gate.

**Owner task (not automated):** `npm run verify:alpha:manual` → [`docs/audits/ui/MANUAL_QA_CHECKLIST.md`](./audits/ui/MANUAL_QA_CHECKLIST.md); PWA spot-check per [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md). **Door mobile:** signed 2026-06-06 — see § Mobile door walkthrough below.

---

## Mobile door walkthrough (2026-06-06)

**Verdict:** **PASS WITH FOLLOWUPS** — organizer can run door check-in from phone without developer help on `preview-c2k-weekend`.

| Area | Result | Notes |
|------|--------|-------|
| Organizer console entry | **PASS** | `/organizer` scopes API; convention shell shows event title, timezone, **Open door mode** on mobile |
| Registration / roster | **PASS WITH FOLLOWUPS** | Signups filters, status chips, vetting visible; payment labeled imported; **tags not persisted** (honest banner); **capacity auto-waitlist not implemented** |
| Door check-in mobile | **PASS** | Search, QR field, check-in, duplicate → "Already on-site", early override dialog, offline queue banner |
| Staff / permissions | **PASS WITH FOLLOWUPS** | Command bridge RBAC green (`audit-command-bridge.mjs`); door `PermissionDeniedPanel` for auth/403; **grant-persona E2E not automated** |
| Convention identity parity | **PASS** | API `conventions/:key`; UI says "event" in door copy — acceptable drift |
| Pilot seed path | **PASS** | `RopeDreamer` / `demo` on `preview-c2k-weekend`; `LeatherCraftDemo` for RBAC matrix |

**Commands (all green 2026-06-06):** `pilot-readiness-smoke.mjs` 11/11 · `smoke-organizer-tab-walk.mjs` 7/7 · `audit-command-bridge.mjs` · Playwright `e2e/door.spec.ts` (iPhone 13) · `npm run typecheck`

**Remaining before real pilot org:** hosting + `PILOT-ORG`; Brax LEGAL-ALPHA-1 owner smoke; grant-persona manual walk; tag persistence; optional capacity enforcement.

---

## Pilot event path (end-to-end)

1. **Org** — Create or select org; confirm `organization_members` roles.
2. **Convention** — Create convention under org; set public listing if needed.
3. **Registration** — Public `/conventions/:slug/register`; complete flow; confirm registrant has **`user_id`** (no orphan `convention_persons`).
4. **People hub** — Organizer → People; roster ↔ signups links; `peopleHubTemplate` if munch.
5. **Hub comms** — `#general` / `#announcements`; post as staff; unread badges (C214).
6. **Optional mail** — Org join welcome, RSVP confirm, scope-list confirm (see mail sign-off below).
7. **Optional push** — Pinned users + `pushHubAnnouncements` / `pushHubChat` prefs (VAPID required).

Capture blockers in [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) — **organizer gaps only** (not Following feed / Phase 2).

---

## Recommended env flags (staging / prod)

| Variable | Pilot suggestion |
|----------|------------------|
| `USE_DATABASE` | `true` |
| `C2K_MAIL_TRANSPORT` | `smtp` or `resend` |
| `C2K_MAIL_FROM`, `C2K_PUBLIC_WEB_URL` | Live domain |
| `C2K_ORG_JOIN_EMAIL` | `true` if welcome mail desired |
| `C2K_EVENT_RSVP_EMAIL` | `true` if RSVP mail desired |
| `C2K_SCOPE_EMAIL_DOUBLE_OPTIN` | `true` for public list signup |
| `VAPID_*` | Set for hub push smoke |
| `C2K_PUSH_ANNOUNCEMENTS`, `C2K_PUSH_CHAT` | `true` unless testing off |
| `VITE_HOME_DEMO_FALLBACK` | **`false`** in production builds |
| `C2K_RATE_LIMIT_DISABLE` | **`false`** in staging/prod |
| `C2K_REALTIME_REDIS_BRIDGE` | `true` only if **2+ API replicas** |

---

## Tier 1 sign-off table

| Item | Owner | Status | Date / notes |
|------|-------|--------|----------------|
| **A. Prod mail** — [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) sections A–E on **staging/prod** | Operator | ☐ **Partial** | `GET /api/health/mail` **green** on kink.social (smtp); formal checklist A–E sign-off still operator-owned |
| **B. Permission audit** — `node scripts/audit-command-bridge.mjs` green | Engineering | ☑ **2026-05-26** | All smokes green after PILOT-1–3 fixes — see § Security |
| **C. Auth rate limits** — `C2K_RATE_LIMIT_DISABLE` not set in prod | Engineering | ☑ Shipped | `@fastify/rate-limit`; env tunables in `rate-limit-config.ts` |
| **D. Mock boundary** — signed-in users never see demo fallback | Engineering | ☑ Shipped | Guests-only fallback; `VITE_HOME_DEMO_FALLBACK=false` in prod |
| **E. Redis WS bridge** (if multi-replica) | Engineering | ☑ Shipped (flag off) | `C2K_REALTIME_REDIS_BRIDGE=true` when scaling API |
| **F. Pilot org dry run** | Product | ☑ **Engineering signed 2026-05-27** | Automated: pilot **11/11**, attendee **7/7**, organizer tab walk, audit RBAC green — § Pilot dry run |
| **G. Prod cutover** | Operator | ☑ **VPS mounted 2026-06-11** | [`SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) § Prod mounted; full smoke matrix + pilot org still open |

---

## Pilot dry run (engineering — 2026-06-06)

Convention **`preview-c2k-weekend`** / org **`demo-east-collective`** with `RopeDreamer` / `demo`:

| Step | Result |
|------|--------|
| `npm run verify:alpha` | **All steps green** — orchestrates Docker + `verify:alpha:auto` (prelaunch, alpha-gate E2E, screenshots, pilot smokes) |
| `node scripts/pilot-readiness-smoke.mjs` | **11/11** — health, mail, mailpit, organizer, people, register-info, hub-channels, participation, org, feed/following |
| `node scripts/smoke-attendee-dancecard.mjs` | **7/7** — access, volunteer shift, policies, dancecard, Tent City (run `db:ensure-preview-attendee-parity` if stale) |
| `node scripts/audit-command-bridge.mjs` | RBAC matrix green (owner **Brax** / `Airship!2` for grant updates) |
| `npm run test:e2e:alpha-gate` | Alpha-focused Playwright subset (in default gate); full matrix: `npm run test:e2e` |
| `npm run verify:trust-safety` | T&S unit + DB tests (`moderation-scoped`, `legal-alpha`, intake) |
| Manual UI path | [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md) — **door mobile + PWA spot-check (`verify:alpha:manual`; product owner)** |

## Pilot dry run (engineering — 2026-05-26 archive)

**Not validated here:** brand-new org created from scratch, live attendee registration with a non-demo email, prod DNS mail.

**Engineering gaps PILOT-1–3:** resolved 2026-05-26 (see [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md)).

---

## When you mount the server (operator)

**Runbook:** [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md)

### Pre-flight (repo — done without prod)

| Check | Status |
|-------|--------|
| Tier 1 code (rate limits, mock boundary, Redis WS flag) | Done |
| Local Mailpit mail smoke | Done |
| `node scripts/pilot-readiness-smoke.mjs` | **11/11** local (incl. `feed/following`) |
| Audit + command-bridge + organizer-parity smokes | Green after PILOT fixes |

### On staging / production (you + SSH or kubectl)

1. Deploy per **K8s** (`k8s/base/`) or **VPS** ([`DEPLOY_SMOKE.md`](./DEPLOY_SMOKE.md)).
2. Complete [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md) **A–E**.
3. Run prod smokes (set your domain):

```bash
set SMOKE_BASE=https://yourdomain.com
set API_BASE=https://yourdomain.com
node scripts/pilot-readiness-smoke.mjs
node scripts/audit-command-bridge.mjs
node scripts/smoke-command-bridge.mjs
```

4. Fill **Mail sign-off log** below (Staging, then Production).
5. Complete § **First real pilot org** (product).

**Cursor on server:** see [`SERVER_MOUNT_RUNBOOK.md`](./SERVER_MOUNT_RUNBOOK.md) §7.

---

## Pilot org onboarding packet

**Purpose:** Owner-facing training script for the first real org. Artifacts are **ready**; prod is **live** (invite alpha) — external pilot org walkthrough still product-owned.

**Audience:** Org **OWNER** (or delegated **ADMIN**). MODERATOR does not receive full command bridge unless granted — see § Security.

**Pre-session:** Owner has a C2K account, verified email, and org name/slug decided. Operator confirms prod mail (optional) and `VITE_HOME_DEMO_FALLBACK=false`.

### Owner training script (bullets)

1. **Create org**
   - Settings → **Organizations** → create org (name, slug, region).
   - Confirm owner appears in **Members** with role **OWNER**.
   - Optional: enable org join welcome mail (`C2K_ORG_JOIN_EMAIL=true`); test with a second account joining via public org page.

2. **Create convention**
   - Organizer → select org → **New convention** (title, slug, dates, visibility).
   - Set registration categories / ticket types if using paid-confirmed workflow (organizer marks `paidConfirmed` — no Stripe).
   - Publish public listing when ready; note public URL `/conventions/:slug`.

3. **Registration**
   - Open public `/conventions/:slug/register`; complete flow as a test attendee (real email on prod).
   - Organizer → **People** / **Signups**: confirm registrant row has **`user_id`** (no orphan `convention_persons`).
   - Verify Signups ↔ Roster links and `peopleHubTemplate` (`munch` vs `full`) if applicable.

4. **Door (mobile)**
   - Organizer → convention → **Door** tab on a phone (PWA or mobile browser).
   - Look up registrant (name / token); check in; confirm status updates on roster.
   - Spot-check safe-area layout and offline-tolerant manifest (LOC-PWA).

5. **Hub comms**
   - Attendee hub `/conventions/:slug` → **Chat** / **Announcements** (`#general`, `#announcements`).
   - Post as staff; confirm unread badges (C214) and WS delivery.
   - Optional: pin users + hub push (`VAPID_*`, `pushHubAnnouncements` / `pushHubChat` prefs).

**Close-out:** Log blockers in [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) (organizer gaps only). Sign Tier 1 row **F** when all steps pass on staging or prod.

**Local dry run:** Use `preview-c2k-weekend` / `RopeDreamer` per § Pilot dry run — does **not** satisfy row **F**.

---

## First real pilot org (product — requires prod)

Use this after mail sign-off on **staging or production**. Do not count demo-only `preview-c2k-weekend` as the pilot.

| Step | Owner | Done |
|------|-------|------|
| Pick org + convention (munch or small event) | Product | ☐ |
| Public registration with real attendee accounts (`user_id` on registrants) | Product | ☐ |
| Organizer People hub + registrant links | Product | ☐ |
| Hub `#general` / `#announcements` tested | Product | ☐ |
| Optional: org join / RSVP / scope-list mail received | Operator | ☐ |
| Optional: hub push with VAPID | Operator | ☐ |
| Blockers logged in `BACKLOG_QUEUE.md` (organizer only) | Product | ☐ |
| Sign-off row **F** in Tier 1 table above | Product | ☐ |

---

## Security — command bridge audit

**Rule (strategic guidance):** Org **MODERATOR** does **not** receive full command bridge unless granted via `convention_command_grants`. Only org **OWNER** / **ADMIN** get `fullCommandPermissions()` automatically.

**Verification commands** (require `npm run dev` + DB):

```bash
node scripts/audit-command-bridge.mjs
node scripts/smoke-command-bridge.mjs
cmd /c "set API_BASE=http://127.0.0.1:3001&& npx tsx packages/api/scripts/smoke-organizer-parity.ts preview-c2k-weekend"
```

### Run results (2026-05-26)

| Script | Result |
|--------|--------|
| `audit-command-bridge.mjs` | **52 OK**, 0×404, 0×5xx; 1×other: `GET /registrants/lookup?q=demo` → **400** (`token required` — expected without inbound token) |
| `smoke-command-bridge.mjs` | **21 checks pass** — `POST /registrants` uses live `categoryId` from registration-categories (PILOT-1 fixed) |
| `smoke-organizer-parity.ts` | **11 pass, 0 fail** (API_BASE=:3001) — fixed `categories` response key + session-feedback paths |

**Static review:**

- `convention-command-access.ts`: `FULL_ADMIN_ROLES` = `OWNER` | `ADMIN` only; `MODERATOR` uses grant row.
- RBAC matrix: registration-only blocked from `/people` and `/program-slots`; scheduler/staff splits match grants.

Re-run audits after organizer route changes.

---

## Rollback

| Action | How |
|--------|-----|
| Stop outbound mail | Unset `C2K_MAIL_TRANSPORT` or set invalid; digests no-op in worker |
| Stop hub push | `C2K_PUSH_ANNOUNCEMENTS=false`, `C2K_PUSH_CHAT=false` |
| Disable rate limits (emergency) | `C2K_RATE_LIMIT_DISABLE=true` |

---

## Mail sign-off log

Record operator completion of [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md):

| Environment | Completed by | Date | Notes |
|-------------|--------------|------|-------|
| **Local (Mailpit)** | Engineering | **2026-05-26** | `C2K_MAIL_TRANSPORT=smtp` → `127.0.0.1:1025`; `GET /api/health/ready` **200**; `POST /api/v1/me/email/test-send` **200** `{ok:true}`; Mailpit http://127.0.0.1:8025 shows messages. Checklist **§F** satisfied for dev. |
| Staging | Operator | | DNS SPF/DKIM/DMARC + real `C2K_MAIL_FROM` — not run from dev machine |
| Production | Operator | | Same as staging; use `k8s/base/secret.yaml` + sections A–E |

### Local checklist §F (dev)

- [x] Mailpit up (`docker compose … mailpit`)
- [x] `npm run dev` + `db:migrate-incremental`
- [x] Test message visible in Mailpit UI

### Staging/prod (operator — copy from checklist when done)

Sections **A–E** in [`PROD_SMTP_K8S_CHECKLIST.md`](./PROD_SMTP_K8S_CHECKLIST.md): DNS, secrets, deploy, transactional + list + digest smokes, rollback documented.

---

*After all Tier 1 boxes are checked, repopulate [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) from pilot feedback. Phase 2 (`feed_activities` F1) only after Tier 1 + pilot traction.*
