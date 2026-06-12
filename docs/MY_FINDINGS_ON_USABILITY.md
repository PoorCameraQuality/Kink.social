# My findings on usability

**Audit date:** 2026-06-01  
**Method:** Ten parallel read-only domain audits (code + docs + seed contracts), plus spot checks in the local dev stack (Brax session, API smoke, browser on home/profile).  
**Environment:** `http://127.0.0.1:5173` + API `:3001`, `USE_DATABASE=true`, full `npm run db:seed` (wipes and reseeds).

**Test accounts (seed):**

| Username | Password | Best for |
|----------|----------|----------|
| **Brax** | `Airship!2` | Site admin, org owner (`demo-east-collective`), moderation |
| **RopeDreamer** | `demo` (or `DEMO_LOGIN_PASSWORD`) | Attendee RSVP, gated convention, vendor shop owner, education author |
| **ShutterSeed** | `demo` | Registered attendee on `preview-c2k-weekend` |
| **LeatherCraftDemo** | `demo` | Dancecard share guest |

After any **DB wipe/reseed**, prefer the repo script (correct order):

```bash
npm run db:prepare
```

That runs **`db:push` → `db:migrate-incremental` → `db:seed`**. If you only run seed + migrate, older table shapes can remain (e.g. missing `conversation_participants.last_read_at` → messaging **500**). Incremental migration now adds those messaging columns when migrate runs.

Then **sign out and sign in again.** Stale cookies caused **HTTP 500** on feeds (orphan JWT `sub`); API now returns **401** or skips viewer settings on public feed—still re-login after reseed.

**Brax:** username `Brax`, password `Airship!2` (seed resets user id each run).

---

## Executive summary

C2K’s **core surfaces are implemented and API-backed** when Docker, Postgres, and seed are up. The largest usability problems are not missing routes—they are **misleading UI** (trust scores, geo filters, gated-schedule copy), **navigation density** (one overcrowded community bar, duplicate guest browse row—partially tightened), **chrome stacking** on mobile (header + community nav + dev banner + bottom nav), and **silent failures** (chat send, spotlight enrichment, discussion reply without RSVP).

**Alpha recommendation:** Fix P0 trust and gating copy before pilot; collapse community nav on detail pages; use **RopeDreamer** (not only Brax) for attendee QA.

---

## What we tested (coverage map)

| Domain | Routes / APIs | Verdict |
|--------|----------------|---------|
| Auth, profile, settings | `/profile`, `/profile/edit`, `/profile/:user`, `/settings/*` | Works; trust UI inconsistent |
| Home & feeds | `/home`, `/activity`, `GET /feed`, `GET /feed/following` | Works after fresh login |
| Events & conventions | `/events`, `/conventions/:slug`, register, schedule, dancecard | Works; copy/RSVP gaps |
| Groups & orgs | `/orgs/demo-east-collective`, `/groups`, organizer org | Works; chat errors silent |
| Vendors | `/vendors`, `/vendors/rope-dreamer-supply`, onboarding | Works; rail on Home not `/vendors` |
| Education & media | `/education`, `/education/write`, `/media`, `/presenters` | Education seeded; media often empty |
| Messaging & social | `/messaging`, `/notifications`, `/connections` | Works if migrations applied |
| Discovery & places | `/discovery`, `/places`, `/presenters`, `/saved`, `/tags/:tag` | Discovery works; tags mock-only |
| Organizer & moderation | `/organizer/...`, door, `/moderation/*` | Works for Brax; door needs localhost/HTTPS for camera |
| Cross-cutting | Header Create, CommunityNavBar, dev banner, PWA | Density and overlap remain |

---

## P0 — Fix before wider pilot

### Trust and reputation (profile)

- **Public profile (`/profile/Brax`):** Total trust **95** but five dimension bars each show **19%** (`getSegmentValues` divides score by 5 when real segments are missing). Reads as weak sub-scores, not a 95/100 overall.
- **Owner dashboard (`/profile`):** Trust ring shows **82** from **mock** data while stats row can show **95** from API/ecosystem. Same user, three different numbers.

**Files:** `packages/web/src/components/TrustRing.tsx`, `ProfilePageClient.tsx`, `app/profile/[username]/page.tsx`

### Discovery geo filters mislead users

- Country/city filters on `/discovery` reset UI but **do not filter** API results in `rankPeople`.
- **Near you** distance uses **mock** geography (`MOCK_USER_LOCATION`), not the viewer’s profile `stateId`.

**Files:** `packages/web/src/hooks/useApiPeopleSearch.ts`, `packages/web/src/lib/discovery-utils.ts`

### Convention gated schedule copy

- `ConventionScheduleLockedPanel` tells users to RSVP on the **anchor event**; access for `seed-demo-con-gated` is via **registration/grant**, not anchor RSVP alone. Brax as org owner may see full schedule and miss the attendee bug.

**Repro as RopeDreamer:** `/conventions/seed-demo-con-gated?tab=Schedule`

### Tag browse is mock-only

- `/tags/:tag` uses `getMockContentByTag` only. Settings copy references “tag browse pages” that are not production-real.

### Session after DB reset

- Stale session → Following/Activity **401** while UI still shows signed-in name until retry. Activity inbox lacks the same “session expired” copy as home feeds.

---

## P1 — High friction

### Navigation and chrome

- **CommunityNavBar:** ~13 items in one horizontal row with **hidden scrollbar** (`c2k-no-scrollbar`)—**Presenters** and **Places** easy to miss on ~390px width.
- **Create menu:** Eight items; **desktop dropdown overlaps profile hero** on `/profile/:user`. “Make a post” and “Make a article” duplicate the same composer hash.
- **Public profile** still shows full community nav + dev banner + bottom nav → ~180–220px chrome before content on phone.
- **Guest home** (mock): Tab shell + Sign in button + subtitle was redundant (subtitle link removed); signed-in users use global nav only.

### Events & conventions

- Event **Discussion:** reply composer visible without **Going** RSVP; API returns 403.
- No **breadcrumb** on public convention hub (attendee wayfinding).
- Registration wizard: weak **Back** between steps.

### Groups & orgs

- Org **chat:** failed sends often show **no error** (`postChannelMessage` swallows `!r.ok`).
- Group forums: composer shown for **non-members**; API returns “Members only”.

### Education & media

- **Publish** with `listInEducation` default **off** → article never appears on `/education` hub without toggling.
- **Media hub** empty after seed (no demo channels); submit + moderation required for listing.
- Education search: **no debounce** (presenters directory debounces).

### Messaging

- **`GET /api/v1/conversations?folder=main` → 500** if `user_follows` (and other incremental tables) are missing after a full reseed. Run incremental migration post-seed (see above).
- Header **message badge** can show **mock unread** when `GET /conversations` fails (`useConversationsPreview` fallback)—inbox empty but badge non-zero.

### Discovery & search

- **Header search** below `md`: icon only, no query field in chrome.
- **Home People** vs **`/discovery`:** different APIs (`connections/suggested` vs `profiles`)—same mental model, different results.

### Vendors

- Docs mention “Vending soon **rail**” on `/vendors`; rail is on **Home**, not vendor directory.
- **Spotlight** API failure is silent—cards lose product imagery.

### Organizer

- Two shells (org hub vs dancecard convention)—weak deep links to convention tabs (no URL `?tab=`).
- Platform vs org **moderation** surfaces easy to confuse.
- `/moderation/admin` identity ban expects raw **UUID**, not username.

---

## P2 — Polish

- Settings: password/2FA “coming soon”; account deactivate not available.
- Onboarding: wizard + full profile editor stacked on `/profile/edit?onboarding=1`.
- Owner vs public profile URLs (`/profile` vs `/profile/Brax`) confuse “canonical” profile.
- Activity hub only in **profile menu**, not bottom nav.
- Connections **Requests** tab without count badge.
- Native `confirm()` still in convention **gallery** and **event contributors** (not `OrganizerConfirmDialog`).
- Door **camera** blocked off localhost/HTTPS (paste/wedge OK).
- PWA icons reuse marketing asset; no install prompt UX.
- Skeleton mix: `animate-pulse` vs `dc-skeleton-bone` on some routes.

---

## What works well (keep)

- **Following feed** and **Near you** feed load with seed data (49+ posts, activities, connections) after valid session.
- **Activity inbox** (`/activity`) unified API with filters.
- **Community nav** merged to **one row** (Following | Near you | browse…)—saves vertical space vs two rows; still needs “More” on small screens.
- **Convention hub:** URL tabs, schedule agenda, registration flow on `preview-c2k-weekend`, dancecard share demo.
- **Org hub** `demo-east-collective`: forums, chat, calendar (seeded).
- **Vendor directory** with category filters and spotlight enrichment when API healthy.
- **Education hub** with RopeDreamer seed articles and **kink-101** series.
- **Door mode:** mobile-first layout, `ConfirmDialog` for early check-in, Playwright coverage.
- **Messaging** split list/thread with back on mobile; folder/filter URL params.
- **Empty states and retries** on many API-backed lists (home, connections, messaging).

---

## API smoke checklist (signed-in Brax)

Run after `npm run db:seed` and fresh login:

| Endpoint | Expected |
|----------|----------|
| `GET /api/v1/feed/following?limit=3` | 200, `items` |
| `GET /api/v1/feed?limit=3` | 200 |
| `GET /api/v1/conversations?folder=main` | 200 |
| `GET /api/v1/activity/inbox` | 200 |
| `GET /api/v1/education/articles?limit=5` | 200, seeded articles |
| `GET /api/v1/media/shows?limit=5` | 200 (may be empty array) |
| `GET /api/v1/conventions?limit=5` | 200 |
| `GET /api/v1/vendors?limit=5` | 200 |
| `GET /api/v1/profiles?limit=5` | 200 |

**Messaging:** `GET /api/v1/conversations?folder=main` returned **500** when `user_follows` was missing (inbox loads following IDs even for default folder). **Fix:** `npm run db:migrate-incremental -w @c2k/api` after seed. Re-test messaging badge and `/messaging` after migrate.

**Spot-check (Brax, post-migrate):** following feed, local feed, education, media, conventions, vendors → **200**; conversations → re-check after incremental migration.

---

## Top 10 manual repro steps

1. **Trust bars on public profile** — `/profile/Brax` → note 95 total vs 19% × 5 bars.
2. **Trust 82 vs 95** — `/profile` ring vs `/profile/Brax` stat.
3. **Discovery geo** — `/discovery` → set country/city → results unchanged.
4. **Gated schedule** — RopeDreamer → `/conventions/seed-demo-con-gated?tab=Schedule` vs Brax (owner view).
5. **Discussion without RSVP** — event Discussion tab, reply without Going.
6. **Community nav truncation** — 390px width → swipe to find Places/Presenters.
7. **Create over profile** — desktop → `/profile/Brax` → open Create menu.
8. **Stale session** — reseed DB without logout → Following 401 until re-login.
9. **Org chat silent fail** — non-member send in org Chat tab.
10. **Header badge vs inbox** — break `/api/v1/conversations` → badge vs empty messaging.

---

## Recommended tightening (mobile-safe)

Aligned with recent nav work and `docs/UI_UX_DECISIONS.md`:

1. **Hide `CommunityNavBar`** on entity detail routes: public profile, event detail, convention hub (keep on home and directory hubs).
2. **“More browse” sheet** on small screens: show 5–6 primary pills; rest in bottom sheet (same pattern as Create).
3. **Scroll affordance:** gradient fade or visible scrollbar on community nav; drop `c2k-no-scrollbar` for that row only.
4. **Create menu:** collapse to ~5 items; remove duplicate article; on profile routes use bottom sheet or `bottom-full` placement.
5. **Dev banner:** dismissible via `sessionStorage` or home-only.
6. **Fix P0 trust segment display** — use real `trustSegments` from API or hide bars when segments missing.
7. **Wire discovery geo** or hide controls until wired.
8. **Attendee QA playbook:** document RopeDreamer/ShutterSeed paths separately from Brax admin paths.

---

## Create menu inventory (for consolidation)

Current targets from `CreateMenuDropdown.tsx`:

| Label | Target |
|-------|--------|
| Make a post | `/home?tab=Local#home-feed-composer` |
| Make an event | `/events/new` (or organizer flow) |
| Make a group | group create |
| Make a vendor shop | `/vendors/onboarding` |
| Make a convention | organizer convention |
| Make an organization | `/orgs/new` |
| Make an article | same composer hash as post |
| Make a presenter profile | `/presenters/onboarding` |

---

## Seed deep links (quick QA)

| Surface | URL |
|---------|-----|
| Org hub | `/orgs/demo-east-collective` |
| Org moderation | `/organizer/orgs/demo-east-collective?tab=moderation` |
| Convention | `/conventions/preview-c2k-weekend` |
| Door | `/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend/door` |
| Vendor shop | `/vendors/rope-dreamer-supply` |
| Education series | `/education/series/kink-101` |
| Platform moderation | `/moderation/reports`, `/moderation/admin` |
| Dancecard share | `/conventions/preview-c2k-weekend/dancecard/s/0123456789abcdef0123456789abcdef0123456789abcdef` |

---

## Relationship to other docs

| Doc | Role |
|-----|------|
| [`UI_UX_AUDIT.md`](./UI_UX_AUDIT.md) | Original P0–P2 audit (waves A–E) |
| [`UI_UX_COMPLETION.md`](./UI_UX_COMPLETION.md) | Closure matrix (many items marked done) |
| **This doc** | Post-closure **usability findings** from full-surface pass |
| [`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md) | Wayfinding, home matrix, messaging N1 |
| [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) | Routes and API truth |
| [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md) | Demo URLs and passwords |

---

## Next engineering pass (suggested order)

1. Trust ring/segments on public + owner profile (P0).  
2. Discovery geo: wire or hide (P0).  
3. Gated schedule + discussion RSVP UX (P0/P1).  
4. Community nav: hide on detail + More sheet (P1).  
5. Create menu shorten + profile placement (P1).  
6. Org chat error surfacing; conversations preview badge fix (P1).  
7. `listInEducation` default or post-publish CTA (P1).  
8. Media seed or pilot content (P2).  
9. Gallery `confirm()` → `OrganizerConfirmDialog` (P2).  

---

**Discover UI refresh (2026-06-01):** New shells on `/events`, `/groups`, `/conventions`, `/discovery`, `/education` — nav/search duplication and stub links tracked in [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md).

*Generated from parallel domain audits (auth, home, events, orgs/groups, vendors, education/media, messaging, discovery, organizer, cross-cutting) and local verification. Re-run after major nav or feed changes.*
