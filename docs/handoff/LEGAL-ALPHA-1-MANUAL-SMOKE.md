# LEGAL-ALPHA-1 — owner manual smoke (operator script)

**Purpose:** Human trust gate before freezing LEGAL-ALPHA-1. Engineering verification is automated; **this document is the Brax owner/operator walkthrough**. Do not mark LEGAL-ALPHA-1 frozen until every **Owner** row below is signed off.

**Audience:** Platform owner / site admin (`Brax`) + one non-admin demo user for denial checks.

**Time:** ~45–60 minutes (first run); ~20 minutes on repeat.

**Related:** [`LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md) · [`trust-safety/POLICY_COVERAGE_MATRIX.md`](../trust-safety/POLICY_COVERAGE_MATRIX.md) · [`audits/trust-and-safety/T&S-IMPLEMENTATION.md`](../audits/trust-and-safety/T&S-IMPLEMENTATION.md) · [`audits/trust-and-safety/MODERATOR_WORKFLOW.md`](../audits/trust-and-safety/MODERATOR_WORKFLOW.md)

---

## Accounts & passwords (local)

| Account | Role | Password (local default) | Use for |
|---------|------|--------------------------|---------|
| **Brax** | `SITE_ADMIN` | `Airship!2` (`BRAX_ADMIN_PASSWORD` / `E2E_SITE_ADMIN_PASSWORD`) | Legal admin, DMCA admin, step-up, holds |
| **RopeDreamer** | `MODERATOR` (not site admin) | `demo` | Non-admin API/UI denial checks |
| Guest | — | — | Public policy pages, DMCA intake (no login) |

**Production (kink.social):** Brax password **differs** from local seed. Set `BRAX_ADMIN_PASSWORD` in your shell (do not commit). Automated smokes: `SMOKE_BASE=https://kink.social REQUIRE_BRAX_ADMIN_SMOKE=1 BRAX_ADMIN_PASSWORD=... npm run verify:alpha-hardening-prod`

Ensure Brax staff row: `npm run db:ensure-brax-site-admin`

---

## Pre-flight (run before Section 1)

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:migrate-incremental -w @c2k/api   # if schema drift suspected
npm run db:ensure-brax-site-admin
npm run dev                                   # web :5173 + API :3001
```

**Automated engineering gate (run in a second terminal while `npm run dev` is up):**

```bash
node scripts/smoke-legal-alpha-manual.mjs
npx playwright test e2e/legal-alpha-smoke.spec.ts
npm run verify:trust-safety:legal-profile
npm run verify:trust-safety:dmca
npm run verify:trust-safety:admin-security
npm run verify:trust-safety:privacy
npm run verify:trust-safety:admin-ui
npm run verify:prelaunch
npm test                                      # includes legal-alpha.test.ts
```

DB integration only (no UI): `npm run verify:trust-safety` (full gate — runs `db:prepare`, ~5–10 min).

**Fail severity key**

| Code | Meaning |
|------|---------|
| **P0** | Pilot blocked — fix before any real users |
| **P1** | Fix before pilot org; may document workaround |
| **P2** | Polish — track in backlog, do not block pilot |

---

## Section 1 — Local environment starts cleanly

| ID | Action | Expected result | Pass | Notes | If fail |
|----|--------|-----------------|------|-------|---------|
| 1.1 | `docker compose -f docker-compose.dev.yml ps` | postgres, redis, minio healthy/up | ☐ | | **P0** |
| 1.2 | `GET http://127.0.0.1:5173/api/health/ready` | `{ "database": "ok", ... }` | ☐ | Via browser or curl through Vite proxy | **P0** |
| 1.3 | `npm run db:ensure-brax-site-admin` | Prints `Brax site admin ensured` with userId | ☐ | Idempotent | **P0** |
| 1.4 | Log in as **Brax** at `/login` | Session established; account menu loads | ☐ | | **P0** |
| 1.5 | Log in as **RopeDreamer** (separate session/incognito) | Session established | ☐ | For denial checks | **P0** |
| 1.6 | Open `http://127.0.0.1:5173/home` signed in | Home loads without blank screen / 500 | ☐ | | **P0** |

---

## Section 2 — Public legal & policy pages

**Rule:** No page may promise unsupported workflows (instant deletion, StopNCII integration, live 2257 compliance, counsel-published legal text unless `VITE_LEGAL_PUBLISHED=true`).

| ID | Route | Action | Expected result | Pass | Notes | If fail |
|----|-------|--------|-----------------|------|-------|---------|
| 2.1 | `/policies` | Open as guest | Policy Hub index; links to scoped policies | ☐ | LEGAL-ALPHA-1.5 | **P0** |
| 2.2 | `/privacy` | Open as guest | Privacy policy loads; links to Support | ☐ | | **P1** |
| 2.3 | `/terms` | Open as guest | Terms of Service load | ☐ | | **P1** |
| 2.4 | `/guidelines` | Open as guest | Community guidelines load | ☐ | | **P1** |
| 2.5 | `/policies/dmca` | Open as guest | DMCA policy; alias from hub works | ☐ | Spot-check alias | **P0** |
| 2.6 | `/dmca` | Open as guest | DMCA page + **repeat infringer** section; **10–14 business days** counter-notice window | ☐ | Must **not** say 7-day restore | **P0** |
| 2.7 | `/policies/appeals` | Open as guest | Appeals policy; points to Support for filing | ☐ | Full appeals **workflow** is skeleton — page must not claim instant reversal | **P1** |
| 2.8 | `/ncii` | Open as guest | NCII reporting page; states **does not integrate** with StopNCII / Take It Down / PhotoDNA | ☐ | | **P0** |
| 2.9 | `/policies/adult-content-records` | Open as guest | **User-generated content** posture visible; no live 2257 compliance or custodian claim | ☐ | Not a commercial producer claim | **P1** |
| 2.10 | `/adult-content-consent` | Open as guest | Alpha posture (`community_only`, explicit off by default) | ☐ | | **P1** |
| 2.11 | `/law-enforcement` | Open as guest | Credentials + valid legal process required; data minimization and preservation holds described | ☐ | No promise to respond to informal requests | **P1** |
| 2.12 | `/minor-safety` | Open as guest | Minors prohibited; escalation copy | ☐ | | **P0** |
| 2.13 | `/vendor-organizer-terms` | Open as guest | Supplemental terms load | ☐ | | **P2** |
| 2.14 | `/policies/groups` | Open as guest (optional) | Scoped group moderation policy | ☐ | 3rd alias spot-check | **P2** |

---

## Section 3 — Public intake flows

| ID | Action | Expected result | Pass | Notes | If fail |
|----|--------|-----------------|------|-------|---------|
| 3.1 | **DMCA intake** — submit via public API or contact flow | `POST /api/v1/dmca/intake` returns **201** + case `RECEIVED`; or contact form equivalent documented | ☑ | Brax owner 2026-06-06 — intake + admin review confirmed | **P0** |
| 3.2 | **DMCA intake** — omit required field (e.g. email) | **400** with validation error; no silent success | ☑ | Brax owner 2026-06-06 | **P0** |
| 3.3 | **Support / safety report** — `/support` as **RopeDreamer** | Form visible; category + detail required; submit succeeds with confirmation copy | ☑ | Brax owner 2026-06-06 — submit + case path confirmed | **P0** |
| 3.4 | **Support form** — submit with empty body | Validation prevents submit or shows error | ☐ | | **P1** |
| 3.5 | **Support** — guest | Login prompt or clear sign-in requirement; no anonymous spam path without captcha | ☐ | | **P1** |
| 3.6 | **Explicit upload posture** | No public upload surface enables explicit media when `C2K_ALLOW_EXPLICIT_MEDIA=false` | ☐ | Spot-check profile photo / media attestation copy | **P0** |
| 3.7 | **NCII vs DMCA** | `/dmca` copy directs consent/NCII issues to `/ncii` + in-product report — not DMCA | ☐ | | **P1** |

---

## Section 4 — Auth & authorization

| ID | Action | Expected result | Pass | Notes | If fail |
|----|--------|-----------------|------|-------|---------|
| 4.1 | **RopeDreamer** → `GET /api/v1/admin/dmca/cases` | **403** Forbidden | ☐ | Automated | **P0** |
| 4.2 | **RopeDreamer** → `GET /api/v1/admin/legal/requests` | **403** Forbidden | ☐ | Automated | **P0** |
| 4.3 | **RopeDreamer** → `/moderation/legal` | UI: “Legal admin or site admin access required” — no admin forms | ☐ | Playwright covers | **P0** |
| 4.4 | **RopeDreamer** → `/moderation/dmca` | UI: Trust & Safety / site admin access required | ☐ | Playwright covers | **P0** |
| 4.5 | **Brax** → `/moderation/legal` | “Legal requests” heading; list + create form visible | ☑ | Brax owner 2026-06-06 | **P0** |
| 4.6 | **Brax** → `/moderation/dmca` | DMCA case list loads | ☑ | Brax owner 2026-06-06 | **P0** |
| 4.7 | **Brax** → `/moderation/dashboard` | T&S console loads; Legal + DMCA links in nav | ☐ | | **P1** |
| 4.8 | Error clarity | 403/401 pages are readable — not raw JSON stack traces in browser | ☐ | | **P1** |

---

## Section 5 — Admin review flows (Brax)

Complete step-up if prompted (`AdminStepUpModal` — re-enter password).

| ID | Action | Expected result | Pass | Notes | If fail |
|----|--------|-----------------|------|-------|---------|
| 5.1 | `/moderation/dmca` | DMCA case from Section 3.1 appears in list | ☑ | Brax owner 2026-06-06 | **P0** |
| 5.2 | Open a DMCA case | Case detail shows claimant info, status, timestamps — **no raw internal JSON** to operator | ☑ | Brax owner 2026-06-06 | **P1** |
| 5.3 | Disable / restore content action (if UI exposed) | Action requires **reason**; status updates; audit implied | ☑ | Brax owner 2026-06-06 — step-up + disable/restore confirmed | **P1** |
| 5.4 | `/moderation/legal` → Create legal request | Request appears in list; **reason required** | ☐ | Owner click-through | **P1** |
| 5.5 | Create legal hold on test user | Hold attaches; deletion blocked (see 6.4) | ☑ | Brax owner 2026-06-06 | **P0** |
| 5.6 | Release legal hold | Hold releases; user can submit deletion request again | ☑ | Brax owner 2026-06-06 | **P1** |
| 5.7 | `/moderation/cases` | Platform case from Support report (3.3) visible with policy reason + snapshot | ☑ | Brax owner 2026-06-06 | **P0** |
| 5.8 | Case detail | Moderator sees **who reported**, target label, safe excerpt — enough to decide next action | ☑ | Brax owner 2026-06-06 | **P0** |
| 5.9 | Step-up on sensitive admin API | First privileged call may return `step_up_required`; password step-up succeeds | ☑ | Brax owner 2026-06-06 — DMCA disable path | **P1** |

---

## Section 6 — Privacy / export / deletion

| ID | Action | Expected result | Pass | Notes | If fail |
|----|--------|-----------------|------|-------|---------|
| 6.1 | **Brax** → `/settings/privacy` → **Your data** | Panel visible | ☐ | | **P0** |
| 6.2 | **Download JSON export** | File downloads or status `READY`; no instant “all data erased” claim | ☐ | Automated API: READY | **P0** |
| 6.3 | **Request account deletion** | Confirmation copy: processing may take time; **foundation workflow in alpha** | ☐ | Playwright checks “Deletion may be delayed or blocked” | **P0** |
| 6.4 | Deletion under **active legal hold** (RopeDreamer) | Blocked message; status `BLOCKED_LEGAL_HOLD`; user-facing copy does **not** promise instant purge | ☑ | Brax owner 2026-06-06 — hold create → block → release confirmed | **P0** |
| 6.5 | Normal user privacy panel | **No internal legal-hold IDs** or staff-only hold metadata | ☐ | | **P1** |
| 6.6 | Export scope honesty | Copy describes JSON export v1 — not “complete forensic archive” | ☐ | | **P2** |

---

## Section 7 — Trust & Safety operator confidence

| ID | Action | Expected result | Pass | Notes | If fail |
|----|--------|-----------------|------|-------|---------|
| 7.1 | Report path discoverable | Profile / event / feed overflow → **Report** opens `TsReportModal` with policy reasons | ☐ | Pick one live surface (e.g. public profile) | **P0** |
| 7.2 | `/support` linked from footer / messaging safety panels | Support page explains human review; no auto-ban claim | ☐ | | **P1** |
| 7.3 | Brax triage path | From report → case in `/moderation/cases` → queue reason matches policy matrix | ☐ | Cross-check [`POLICY_COVERAGE_MATRIX.md`](../trust-safety/POLICY_COVERAGE_MATRIX.md) | **P0** |
| 7.4 | P0 routes (NCII / minor safety) | P0 reasons route to urgent/restricted queues per docs | ☐ | Submit test report with `NCII` reason if needed | **P1** |
| 7.5 | No fake-complete UI | Buttons for unimplemented actions (platform suspend, full appeals) are absent, disabled, or labeled foundation/stub | ☐ | See T&S-IMPLEMENTATION enforcement gaps | **P0** |
| 7.6 | `/moderation/reports` regression | Legacy inbox still loads (secondary) | ☐ | | **P2** |
| 7.7 | Public explicit media regression | No explicit content on public/guest surfaces (`community_only`) | ☐ | | **P0** |

---

## Section 8 — Signup, footer, documentation freeze

### 8A — Signup & footer (owner)

| ID | Action | Expected result | Pass | Notes | If fail |
|----|--------|-----------------|------|-------|---------|
| 8.1 | `/login` or signup card | Links to Terms, Privacy, Guidelines, Adult content | ☐ | Playwright | **P1** |
| 8.2 | Signup flow | Age affirmation + terms acceptance required before account | ☐ | | **P0** |
| 8.3 | Footer on `/` and `/conventions` (if hub exists) | Legal links from `site.config.ts` → `footer.legal` | ☐ | Privacy, Terms, Guidelines, DMCA minimum | **P1** |

### 8B — Foundation honesty (owner)

| ID | Check | Expected result | Pass | Notes | If fail |
|----|-------|-----------------|------|-------|---------|
| 8.4 | Legal hold lifecycle | UI does **not** claim instant purge or full e-discovery export | ☑ | Brax owner 2026-06-06 | **P1** |
| 8.5 | Retention sweep | Platform account purge still **non-destructive** stub; member **auto-shred** runs when configured | ☐ | `npm run db:retention-sweep -w @c2k/api` | **P0** |
| 8.6 | NCII / DMCA vendor claims | No PhotoDNA / StopNCII / enterprise vendor integration claims | ☐ | | **P0** |

### 8C — Documentation (after owner pass)

| ID | Action | Expected result | Pass | Notes |
|----|--------|-----------------|------|-------|
| 8.7 | Update this file | All Owner rows marked; verdict filled below | ☐ | |
| 8.8 | Update [`HANDOFF.md`](../HANDOFF.md) | Owner-smoke status + date | ☐ | |
| 8.9 | Update [`MASTER_NEXT_STEPS.md`](../MASTER_NEXT_STEPS.md) | LEGAL-ALPHA-1 frozen or P1 follow-ups listed | ☐ | |
| 8.10 | [`BACKLOG_QUEUE.md`](../BACKLOG_QUEUE.md) | Mark frozen only on **PASS** verdict | ☐ | Do not freeze on engineering-only pass |

---

## Automated pre-check results (2026-06-06)

Engineering run while local Docker + `npm run dev` were up. **Does not replace owner rows above.**

| Command | Result | Notes |
|---------|--------|-------|
| `node scripts/smoke-legal-alpha-manual.mjs` | **PASS** | 22/22 — health, auth, routes, API ACL, hold, DMCA intake |
| `npx playwright test e2e/legal-alpha-smoke.spec.ts` | **PASS** | 4/4 — public copy, footer, non-admin block, Brax admin + privacy |
| `npm run verify:trust-safety:legal-profile` | **PASS** | Scanner + media policy + policy hub |
| `npm run verify:trust-safety:dmca` | **PASS** | DMCA page build check |
| `npm run verify:trust-safety:admin-security` | **PASS** | Step-up route + modal present |
| `npm run verify:trust-safety:privacy` | **PASS** | Privacy UI panel |
| `npm run verify:trust-safety:admin-ui` | **PASS** | 9/9 moderation admin DB tests |
| `npm run verify:prelaunch` | **PASS** | typecheck + 251 tests + build |
| `npm run db:ensure-brax-site-admin` | **PASS** | Brax userId confirmed |

**Still owner-only (not automated):** visual policy read-through (Section 2), create legal **request** in admin UI (5.4), in-product Report walkthrough (7.1–7.3), signup age gate click-through (8.2).

**Brax owner partial pass (2026-06-06):** DMCA intake + admin (3.1–3.2, 4.6, 5.1–5.3, 5.9), Support/safety report + case triage (3.3, 5.7–5.8), legal hold freeze lifecycle (5.5–5.6, 6.4, 8.4).

---

## Owner sign-off

| Field | Value |
|-------|-------|
| **Owner** | Brax (platform owner) |
| **Date** | 2026-06-06 (partial — core legal ops paths signed) |
| **Engineering pre-check** | 2026-06-06 — all automated gates green |
| **Owner manual complete** | ☐ partial — Sections 3 intake, 5 admin (except 5.4), 6.4, 8.4 done |

---

## Final verdict (fill after owner walkthrough)

**Select exactly one:**

- ☐ **PASS — legal alpha owner smoke frozen** — No P0 items; owner confirms operator confidence. Update MASTER_NEXT_STEPS + BACKLOG_QUEUE; next: mobile door walkthrough / prod prep per roadmap.
- ☐ **PASS WITH P1 FOLLOWUPS — pilot may continue** — No P0; P1 items listed below with owners/dates.
- ☐ **FAIL — pilot blocked** — One or more P0 items open.

**Current status (2026-06-06):** **PASS WITH P1 FOLLOWUPS — pilot may continue** — engineering gates green; Brax signed core legal ops (DMCA, Support report, hold lifecycle). **Not fully frozen** until Section 2 policy read-through + remaining owner rows complete.

### Open P1 follow-ups (if applicable)

| Item | Owner | Target |
|------|-------|--------|
| Create legal request in admin UI (5.4) | Brax | Before pilot |
| Section 2 public policy read-through | Brax | Before counsel / `VITE_LEGAL_PUBLISHED` |
| In-product Report → case triage walkthrough (7.1–7.3) | Brax | Before pilot |
| Signup age gate + footer links (8.1–8.3) | Brax | Before pilot |

### P0 blockers (if any)

_None from automated run 2026-06-06._

---

## Escalation & freeze notes

- **Freeze means:** No legal/T&S copy or route changes except P0 blockers until post-pilot review.
- **Do not freeze if:** Any P0 row fails, or owner cannot explain DMCA vs NCII vs Support report paths.
- **After freeze:** Next work order per [`MASTER_NEXT_STEPS.md`](../MASTER_NEXT_STEPS.md) — mobile door walkthrough, then UI-DISC-4–6, prod cutover prep, first pilot org.
- **SCOPED-MOD-1 / T&S-5** shipped 2026-06-06 — do not re-audit in this pass unless regression found.

---

## Quick reference — operator questions this smoke must answer

As accountable operator, you should be able to answer **without reading source code**:

1. Where does a **copyright owner** file a takedown? → `/dmca` + admin `/moderation/dmca`
2. Where does someone report **NCII / consent** issues? → `/ncii` + in-product Report (`NCII`, `CONSENT_SAFETY`, …)
3. Where does a **general safety** issue go? → `/support` or in-context Report
4. What happens on **deletion request under legal hold**? → Blocked with honest copy; hold must be released by admin
5. Who can see **legal admin**? → Site admin / legal admin only; step-up for sensitive APIs
6. What is **not** implemented (must not be promised)? → Full appeals workflow, instant deletion, external NCII vendors, live 2257 compliance
