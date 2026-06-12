# Coast to Coast Kink – Functionality Recap & Status

**Last updated:** 2026-05-28 (month-end) — Profile public/edit UX; verified-host UI removed; pass 24 registry sync. Prior: G301–G312 groups/events; scope branding. **Paused until next session** — **[MASTER_NEXT_STEPS.md](./MASTER_NEXT_STEPS.md)** §9. Registry: **[FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md)** pass 24. Handoff: **[HANDOFF.md](./HANDOFF.md)** § 2026-05-28.

---

## Overview

C2K is a kink-positive community platform for events, dungeons, groups, and connections. The app is **hybrid**:

- With **`USE_DATABASE=true`** (see `.env.development`), **auth, profiles, settings, uploads**, and many **`/api/v1/*`** routes persist to **PostgreSQL** (Drizzle). The web UI calls these endpoints with `credentials: 'include'` (session cookie).
- **Mock data** and **localStorage** still back parts of the UI (legacy numeric event/vendor IDs, group detail for non-UUID ids, etc.) when the API is off or for demo-only flows. **Home, Discovery, `/events`, and `/vendors`** treat **`GET /api/v1/events`** and **`GET /api/v1/vendors`** as authoritative: a **successful empty `items` array** is shown as an honest empty state (no silent substitution of mock catalogs for signed-in users). Guests still see **sample event/vendor rows** on Home while those requests are loading or failed; the **Local** tab shows a **sign-in / Discovery CTA** instead of a fictional rich feed unless **`VITE_HOME_DEMO_FALLBACK=true`** (dev screenshots).

**Theme:** Black and teal (`c2k-accent-primary`, `c2k-bg`, etc.)

**Demo user (seed):** `RopeDreamer` / `DEMO_LOGIN_PASSWORD` (default `demo`) after `npm run db:seed -w @c2k/api`.

---

## Stack (where code lives)

| Area | Path |
|------|------|
| Web (Vite + React Router) | `packages/web/src` |
| API (Fastify) | `packages/api/src` |
| Drizzle schema | `packages/api/src/db/schema.ts` |
| Ecosystem REST | `packages/api/src/routes/ecosystem-stubs.ts` |

---

## Navigation & Layout

| Route | Purpose |
|-------|---------|
| `/` | Landing (session may redirect toward app) |
| `/home` | Main feed with tabs — **API-first** event/vendor rails for signed-in users (empty API → empty copy, not mock backfill); guest Local tab → CTA unless demo fallback env |
| `/discovery` | Explore people (**DB** when `/api/v1/profiles` works); **events/vendors** ranked from API lists only when the list request has settled **`ready`** (empty 200 → empty results, not mock catalogs) |
| `/profile` | Own profile |
| `/profile/[username]` | Other user's profile |
| `/profile/edit` | Edit own profile (API when logged in; localStorage still mirrors some fields for legacy/demo) |
| `/profile/complete` | Onboarding flow |
| `/groups` | Groups list (**DB** when `/api/v1/groups` returns data) |
| `/groups/[id]` | Group detail — **full API** for UUID ids; mock for legacy ids |
| `/events` | Events list — **`GET /api/v1/events`**; empty **`items`** after 200 → empty UI (mock catalog only if **`VITE_HOME_DEMO_FALLBACK=true`**) |
| `/events/[id]` | Event detail — **DB** for UUID id; mock for numeric legacy ids; **Overview** partners strip + **Vendors** tab links when contributors carry `vendorSlug` / `username` |
| `/conventions/[slug]` | **Convention hub** — program (day-grouped agenda), **Partners** strip from anchor `event_contributors`, **Manage** (logistics incl. public staff role hints), **ISO** board, documents, chat; API when `USE_DATABASE=true` |
| `/presenters`, `/presenters/[username]` | Directory + detail (offerings, reviews; **scheduled sessions** respect convention program visibility for non-owners) |
| `/education` | Education articles |
| `/education/[slug]` | Article detail |
| `/vendors` | Vendors list — **`GET /api/v1/vendors`**; empty **`items`** after 200 → empty UI (mock catalog only if **`VITE_HOME_DEMO_FALLBACK=true`**) |
| `/vendors/[id]` | Vendor detail — **DB** for UUID or **slug**; mock for numeric legacy ids |
| `/tags/[tag]` | Browse content by tag |
| `/settings` | Account, notifications, privacy, feed, profile-search visibility, presenter catalog — **`/api/settings/me`** + profile PATCH when DB auth; account email change flow still thin |
| `/messaging` | Messages — **DB** conversations/messages when authenticated; folders **main** / **requests** / **iso** (`?folder=iso`); mock demo threads when not |
| `/notifications` | **DB** inbox when authenticated (**All/Unread**, day sections, empty states); header bell refetches + mark-all-read; message notifications deep-link **`/messaging?c=`** when `conversationId` is set; mock + sessionStorage when not |
| `/connections` | **DB** connection requests |
| `/orgs/[slug]` | **Org hub** — Overview (community welcome/FAQ/links, this week, spotlight), Calendar (events + program badges), Forums, Chat, Members, Reviews, Settings (staff); API-backed when `USE_DATABASE=true` |
| `/organizer`, `/organizer/orgs/:slug`, `/organizer/orgs/:slug/conventions/:convSlug` | **Organizer console** — staff command bridge; Event Systems convention manager (Dancecard parity). Members use public org hub. |
| `/organizer/orgs/:slug/events/:eventId`, `/organizer/groups/:id/events/:eventId` | **Event manager** — `EventOrganizerPanel` (PATCH event, RSVP queue, attendees); UUID events only |
| `/support/branding` | Staff guide for scope branding and social share images |
| `/guidelines`, `/about`, `/terms`, `/privacy`, `/contact`, `/support`, `/accessibility` | Static/info pages (many “coming soon” shells) |

**Bottom nav (mobile):** Home, Explore, Create, Messages, Profile  

**Header:** Logo, search, Create (modal can **POST** `/api/v1/events` when logged in), Notifications (dropdown refetches on open; mark all read when unread), Messages, Profile dropdown.

---

## Persistence & localStorage (audit)

| Key / area | Behavior |
|------------|----------|
| `c2k_profile_edit_mock` | Profile edit still **writes** here for offline/demo parity; when authenticated, the form also targets **`/api/profile/*`**. Prefer API as source of truth when logged in with DB. |
| `c2k_profile_photos_mock` | Profile media tab mock storage; not yet replaced by upload API everywhere. |
| Local feed posts | Signed-in: **`GET /api/v1/feed`**; guests: CTA on Local tab (no rich mock timeline by default). Composer-only mock posts still supported for demo flows. |
| Notifications (mock mode) | `sessionStorage` read ids for demo list. |
| Authenticated notifications | **`/api/v1/notifications`** + `read` / `read-all`. |

---

## Where older sections diverged

The long per-screen tables below (home tabs, group tabs, etc.) still describe **UI behavior** and mock flows. Treat them as **product spec**, not as “no API.” If a bullet says “mock only,” check **FEATURE_REGISTRY** for whether a vertical slice now hits the API.

---

## How to Run

```bash
cd coast-to-coast-kink
docker compose -f docker-compose.dev.yml up -d
npm install
npm run db:prepare
npm run dev
```

- **Web:** http://localhost:5173  
- **API:** http://localhost:3001/api/health  

**Connection refused on :5173** means the Vite dev server is not running — use `npm run dev` from repo root (Docker alone only starts Postgres/Redis/MinIO).

If **`db:push`** fails with module resolution errors, run `npm run build -w @c2k/shared` and retry `npm run db:prepare`.

See [README.md](../README.md) and [technical-reference.md](./technical-reference.md). From repo root, **`npm test`** runs the API unit test suite (no Docker required); **`npm run test:e2e`** runs Playwright smoke.

---

## Deferred / Not Started (selected)

- **Event Systems identity Phase 3+** — self-register API, unified “my participation” read API, People hub identity consolidation, munch template ([`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md))
- Eventbrite / Stripe checkout, recurring events  
- Full replacement of local feed and all legacy mock ids  
- Site-wide moderator roles (beyond group roles)  
- **DM / site-wide messaging:** REST conversations are implemented; **WebSocket** is not the primary DM transport yet. **Org hub Chat** uses **`/api/ws`** with **authorized** subscribe + refetch (ADR 002); **weekly org digest email** when mail env is configured — see [`adr/002-org-realtime-chat-and-digests.md`](./adr/002-org-realtime-chat-and-digests.md). **Push** notifications still deferred.  
- Settings: core bundle + presenter catalog wired to API; **full** parity (e.g. every pref vs `user_notification_preferences` v1 route, mobile polish) still open per **EXECUTIVE_PLATFORM_READINESS**
- **Group location discovery** — `place_id`, nearby groups API, Places picker ([`plans/group-location-discovery.plan.md`](./plans/group-location-discovery.plan.md), 4/8 todos done)  
- **Public page v2 follow-ups** — C212–C215, O75–O77 ([`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md))  

---

## Related docs

| Doc | Use |
|-----|-----|
| [MASTER_NEXT_STEPS.md](./MASTER_NEXT_STEPS.md) | **Priorities hub** — backlog table, verification |
| [PLATFORM_STATUS_AUDIT.md](./PLATFORM_STATUS_AUDIT.md) | 2026-05-24 audit snapshot |
| [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) | Routes, components, API prefixes |
| [NEXT_STEPS.md](./NEXT_STEPS.md) | Engineering narrative + recent ships |
| [AGENT_STATUS_HANDOFF.md](./AGENT_STATUS_HANDOFF.md) | Next-session snapshot (recent ships, env, caveats) |
| [PROJECT_AUDIT.md](./PROJECT_AUDIT.md) | Handoff / inventory |
| [EXECUTIVE_PLATFORM_READINESS.md](./EXECUTIVE_PLATFORM_READINESS.md) | Leadership: site-wide % readiness, gaps |
| [adr/README.md](./adr/README.md) | Architecture Decision Records (index) |
| [E2E.md](./E2E.md) | Playwright |
