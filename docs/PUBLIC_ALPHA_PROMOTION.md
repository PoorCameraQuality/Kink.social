# Public alpha promotion guide

**Last updated:** 2026-06-17  
**Audience:** Operators, testers, community members considering the alpha  
**Related:** [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md) · [`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md) · [`PILOT_READINESS.md`](./PILOT_READINESS.md) · [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md)

---

## What kink.social is

kink.social is a **public alpha** community platform for consent-first adults. Today you can browse events, meet people, join groups, build a profile, adjust privacy settings, and send messages. Organizer tools and deeper social features are still growing.

This is **not** a full public launch. Features may change, break, or disappear. Some content is demo or test data.

---

## Who should try it

- Kink community members curious about events, groups, and people discovery
- Organizers and group leaders willing to give workflow feedback
- Patient testers comfortable with alpha software and fictional profile data
- People who will read privacy settings before sharing sensitive details

Skip deep testing if you need production-grade reliability, payments, or a finished mobile app store experience.

---

## Alpha expectations

| Expect | Do not expect |
|--------|----------------|
| Registration open at [kink.social](https://kink.social/) | Finished product polish |
| Honest empty states and seed markers | Every upload type enabled |
| Privacy controls you can review in Settings | Perfect moderation automation |
| Human review for reports | Instant support for every issue |
| Events, groups, and people directories | Full launch marketing promises |

**18+ only.** Use fictional names, `example.test` emails, and non-identifying photos for testing.

---

## What to test first (about 30 minutes)

1. **Land and join** — Read the public alpha framing, register, finish onboarding.
2. **Browse events** — Find something upcoming; save or RSVP if available.
3. **Find people** — Follow someone; try Connect if you want a mutual link.
4. **Explore groups** — Join a public group; check member list privacy prompts.
5. **Review privacy** — Settings → Privacy; confirm defaults match your comfort.
6. **Post or message lightly** — Short intro post or one message; watch request/pending states.
7. **Report something harmless** — Use Support to submit test feedback (not real emergencies).

Structured checklist: [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md)

---

## How to report bugs

1. Go to **Support** (`/support`) while signed in.
2. Choose the closest category (bug, confusing UX, other).
3. Describe what you expected vs what happened.
4. Include the page URL and browser (mobile or desktop).

You can also use **Alpha feedback** links on Home during your first session.

---

## Privacy or safety concerns

- **Privacy settings:** `/settings/privacy`
- **Support / reports:** `/support`
- **Community guidelines:** `/guidelines`
- **Privacy policy:** `/privacy`

For urgent in-person safety at an event, also notify on-site staff or event safety contacts. The alpha site is not an emergency service.

---

## What not to share yet

- Real home addresses, phone numbers, or workplace identifiers
- Photos of real people without their consent
- Passwords or invite codes in public channels
- Expectation that DMs, uploads, or notifications work like a mature social network on day one

---

## Known limitations (alpha)

- Some areas use **demo or seed content** (`alpha_*` personas, test event names).
- **Feed image uploads** may quarantine or show review messaging during alpha.
- **Legacy staff profile photos** may still be reachable by direct URL if someone saved an old link (being remediated).
- **Payments, vendor checkout, and app store** flows are out of scope.
- Local development requires **Node 20** for the full test suite (CI uses Node 20; Node 24 may fail tsx path resolution).

---

## Feed composer photo upload (human smoke)

If Playwright cannot attach files against production cookies, run this manually:

1. Sign in as `alpha_social` (seed password in [`ALPHA_SEED_WORLD.md`](./ALPHA_SEED_WORLD.md)).
2. Open **Home** → Discover tab.
3. Tap the collapsed composer (“What do you want your local kink community to know?”) or **Photo**.
4. Attach a safe, non-explicit image (JPEG/PNG under size limits).
5. Confirm: preview appears, upload completes or shows “held for review during alpha”, no stuck spinner, no console errors.
6. Confirm uploaded asset uses `/api/v1/media/assets/.../content` (not a bare MinIO URL) in network tab.

**Automated checks (2026-06-17):** API smoke and Playwright (`e2e/home-feed-composer-upload.spec.ts` against `https://kink.social`) both **pass**.

---

## Legacy profile media (operator)

**Staff/test (Brax, TestAdmin):** 27 rows remediated 2026-06-17 — DB set to `VALIDATED_PRIVATE`, public MinIO objects removed where a quarantine copy existed. DTOs serve via `/api/v1/media/assets/:id/content`.

**Remaining 26 rows:** legacy **imported member** profile photos (`LOGGED_IN`, public `media/` paths). Uploaders include community usernames (not `alpha_*` seeds). Current profile DTOs prefer proxy URLs when `mediaAssetId` is set; risk is **direct URL leakage if an old link was saved**, not listing in normal API responses.

### Operator decision (2026-06-17)

| Promotion type | Proceed? | Rationale |
|----------------|----------|-----------|
| **Controlled public alpha** (invited testers, small communities) | **Yes** | Normal API responses use proxy URLs; no bulk exposure in UI |
| **Broad public promotion** (large open calls, press, ads) | **Wait** | 26 legacy rows need per-row review/remediation; residual direct-linkTags risk if old links circulate |
| **Full public launch** | **No** | Alpha limitations remain (see below) |

**Residual risk:** Previously known direct MinIO `/media/...` links may still return **200** until each row is remediated. Do **not** bulk-delete real member media.

**Per-row remediation (operator only):**

1. On VPS (read-only audit):
   ```bash
   bash scripts/vps/remote-audit-restricted-public-media.sh
   # or locally with prod DATABASE_URL:
   USE_DATABASE=true npm run audit:restricted-public-media -w @c2k/api
   ```
   Review JSON (`suspiciousRestrictedPublicPathCount`, uploader usernames, asset IDs). Do not publish raw output publicly.

2. Dry-run remediation (all non-`alpha_*` uploaders by default):
   ```bash
   USE_DATABASE=true npm run remediate:restricted-public-media -w @c2k/api
   ```
   Per user: `UPLOADER_USERNAME=someuser USE_DATABASE=true npm run remediate:restricted-public-media -w @c2k/api`

3. Apply (after dry-run review): `USE_DATABASE=true APPLY=true npm run remediate:restricted-public-media -w @c2k/api`

4. Legacy staff-only script still available: `USE_DATABASE=true tsx packages/api/scripts/remediate-staff-restricted-public-media.ts`

5. Verify: anonymous GET on old direct URL → **404**; logged-in proxy → **200** when visibility allows.

**Engineering gate (upload hardening):** `npm run verify:alpha-hardening-media` (unit always). With Docker Postgres: `VERIFY_ALPHA_HARDENING_DB=1 npm run verify:alpha-hardening-media`.

**Operator orchestrator (Phases 1–3 automated + 4–6 checklist):**

```bash
npm run verify:alpha-hardening-operator          # unit + prod HTTP smoke (default https://kink.social)
npm run verify:alpha-hardening-prod              # HTTP only: health/mail/mod/upload guards
VERIFY_ALPHA_HARDENING_DB=1 npm run verify:alpha-hardening-operator   # + legacy media audit (local/VPS DB)
BRAX_ADMIN_PASSWORD=... REQUIRE_BRAX_ADMIN_SMOKE=1 npm run verify:alpha-hardening-prod   # optional owner/mod login
RUN_LEGAL_ALPHA_SMOKE=1 npm run verify:alpha-hardening-operator       # legal smoke (Brax admin checks optional)
```

CI runs `verify:alpha-hardening-media` on every PR (`.github/workflows/ci.yml`).

**Full operator gate (Phases 1–6 automated):**

```bash
npm run verify:alpha-hardening-operator
RUN_LEGAL_ALPHA_SMOKE=1 npm run verify:alpha-hardening-operator   # + legal routes (Brax optional)
```

Individual phases: `verify:alpha-hardening-prod`, `verify:alpha-hardening-privacy`, `verify:alpha-hardening-smtp-prod`, `verify:alpha-hardening-pilot-gate`.

---

## Controlled alpha readiness summary (2026-06-25)

| Gate | Status |
|------|--------|
| Ready for **controlled** public alpha promotion | **Yes** |
| Ready for **broad** public promotion | **Closer** — legacy `media/` leak remediated on prod (2026-06-25); privacy QA + pilot org still open |
| Ready for **full public launch** | **No** |

**Known limitations:** Demo/seed content, feed upload quarantine messaging, no payments/app-store flows, Node 20 required for full local test suite. Legacy imported profile photos: DB + MinIO remediated; direct `/media/...` URLs on kink.social now fall through to SPA (not raw object bytes).

**Phase 2 prod remediation (2026-06-25):** 26 `LOGGED_IN` rows moved to `VALIDATED_PRIVATE`; MinIO `media/` objects purged. Re-audit: `suspiciousRestrictedPublicPathCount: 0`. Operator script: `SSH_PASS='...' APPLY=true npm run remediate:vps:legacy-media`.

**Feedback path:** `/support` (alpha feedback category) and Home activation card links during first session.

**Ask testers first:** Register → onboarding → browse events → find people → join a group → review privacy settings → one light post or message → report confusion via Support. Full checklist: [`ALPHA_QA_JOURNEY.md`](./ALPHA_QA_JOURNEY.md).

---

## Developer / operator verification

```bash
# Node 20 required for full suite locally
npm run typecheck
npm run build
npm run test
```

CI: `.github/workflows/ci.yml` pins Node 20.

---

## Draft announcement (copy/paste starting point)

> I've opened **kink.social** for a **public alpha**.
>
> It's a consent-forward community platform where you can **find events**, **meet people**, **join groups**, build a **profile**, tune **privacy settings**, and try **messaging** while we harden the social spine and organizer tools.
>
> This is an **alpha**, not a launch: bugs are expected, some areas use demo content, and things will change. If you join, use fictional profile details and read privacy settings before you share more.
>
> **Good first steps:** browse events, follow a few people, join a group, review privacy, send us feedback via Support if anything feels confusing or unsafe.
>
> Feedback wanted, especially on onboarding, events discovery, groups, and privacy clarity. Thank you for helping us build safer community tools.

---

## Operator promotion checklist

- [ ] CI green on `main` / release branch
- [ ] Landing page shows public alpha + 18+ + join path
- [ ] Registration policy open (`GET /api/auth/registration-policy`)
- [ ] Support / alpha feedback path visible
- [ ] Staff moderation login verified
- [ ] Legacy staff media risk remediated or explicitly accepted (see `VPS_ALPHA_EXECUTION_LOG.md`)
- [ ] Feed composer upload smoke passed (API or Playwright / human steps)
- [ ] `ALPHA_QA_JOURNEY.md` shared with structured testers
