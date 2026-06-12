# Coast to Coast Kink (C2K) — Comprehensive Project Audit

**Purpose:** Full handoff document for Claude or other AI/developers to understand the project, make suggestions, and prioritize work.

**Audit date:** **2026-05-24** (§1 stack + ops refreshed; full-project snapshot in [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md); priorities in [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md)). Historical narrative below through April 2026.  
**Methodology:** 10 parallel subagent audits (March 2026) + **2026-05-24** parallel API/web/docs audits.

> **Stack note:** The live app is **Vite + React Router** (`packages/web`) and **Fastify** (`packages/api`) with **PostgreSQL + Drizzle**, **Redis**, **MinIO**, **Docker Compose**. Next.js lives under `legacy/` only.
>
> **§2–§12 = historical snapshot (March–April 2026).** Do **not** use for current routing, auth, or notifications. For **current** status use, in order: [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md) → [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) → [`PLATFORM_STATUS_AUDIT.md`](./PLATFORM_STATUS_AUDIT.md) → [`EXECUTIVE_PLATFORM_READINESS.md`](./EXECUTIVE_PLATFORM_READINESS.md).

---

## Executive Summary

C2K is a **kink-positive community platform** for events, dungeons, groups, vendors, education, and connections. The product runs as a **local-first monorepo**: **Vite 6 + React 18 + React Router 7 + Tailwind** (`packages/web`), **Fastify 5 + TypeScript** (`packages/api`), shared types/utils (`packages/shared`), **PostgreSQL 16 + PostGIS**, **Redis**, **S3-compatible storage (MinIO dev)**, and **Drizzle ORM**. Auth uses an HMAC-signed **`c2k_session`** cookie; with **`USE_DATABASE=true`**, registration, sessions, profiles, settings, uploads, and many **`/api/v1/*`** routes persist to Postgres.

The **UI is hybrid**: core flows hit the API (session, profile, settings, discovery people, connections, **UUID groups** with forums/events/feedback, **organizer console** for orgs/groups/conventions, **EventOrganizerPanel** for org and group events, **scope branding** on groups/orgs/conventions, **signed-in home/events/vendors** API-first, **notifications** API-only when authenticated, conventions at `/conventions/:slug` with program + registration + hub v2). **Mock** remains for guests, legacy ids (`g1`…), **`VITE_HOME_DEMO_FALLBACK`**, 14 **ComingSoon** marketing routes, and education/tags/landing. **Organizations** expose a **composite rating** (reviews + internal member reputation); global `trustScore` propagation from org reviews is **opt-in** via `ORG_REVIEW_PROPAGATES_GLOBAL_TRUST`. **Org hub** (`/orgs/:slug`) includes **community** content (welcome, FAQ, links, this week, spotlight), **RSVP** on org events, **member directory** opt-in + **volunteer tags**, org-scoped **forum reactions** (thanks/helpful), **reports** for forum and chat, channel **slow mode**, **Chat tab** with WebSocket-backed refetch for text channels, and **LiveKit-backed voice** for `VOICE`/`VIDEO`/`LIVE_STREAM` when `LIVEKIT_*` env is set — see ADR `docs/adr/002-org-realtime-chat-and-digests.md`. **Vendor pages** can show **native products + cached external listings** (Etsy / Shopify / Woo / link-only) when configured — see `FEATURE_REGISTRY.md` (External storefront aggregation). **WebSocket** at `/api/ws` uses **authenticated** `subscribe` scopes (`ws-subscribe-auth.ts`). **BullMQ** processes **`c2k-moderation`**, **`c2k-external-sync`**, and **`c2k-lifecycle`** (incl. **org-digest-sweep** with optional outbound mail) in `packages/api/src/worker.ts`.

| Category | Status |
|----------|--------|
| **Build** | `npm run build` / `typecheck` at repo root; address ESLint warnings in `packages/web` as needed |
| **Lint** | `npm run lint` (web workspace) |
| **Routes** | 40+ SPA routes in `packages/web/src/router.tsx` (incl. `/conventions/:slug`); see `FEATURE_REGISTRY.md` for freshness |
| **Auth** | Fastify auth routes + cookie; DB users when `USE_DATABASE=true` (see `docs/technical-reference.md`) |
| **Persistence** | Postgres for accounts/profiles/ecosystem tables; some UI still localStorage/mock for legacy screens |
| **Messaging / Notifications** | REST: conversations + messages + notification rows; web uses API when authenticated; WS at `/api/ws` — ping + **authorized** subscribe (org channels, convention schedule); org digest email when mail env configured |

---

## 1. Project Overview

### 1.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vite, React 18, React Router 7, Tailwind CSS (`packages/web`) |
| Backend | Fastify 5, TypeScript (`packages/api`) |
| Shared | `@c2k/shared` — browser-safe + Node session helpers |
| Database | PostgreSQL + Drizzle ORM; `drizzle-kit push` |
| Cache / jobs | Redis; BullMQ worker (`packages/api/src/worker.ts`) |
| Object storage | MinIO locally; S3-compatible client in API |
| Tooling | Docker Compose (`docker-compose.dev.yml`, `docker-compose.prod.yml`), Playwright `e2e/smoke.spec.ts` |

### 1.2 Theme

- **Palette:** Black/charcoal backgrounds (`#0f0f0f`–`#2d2d2d`), teal accents (`#14b8a6`), white/muted text
- **Font:** Inter (300–800)
- **Tokens:** `c2k-accent-primary`, `c2k-bg`, `c2k-bg-card`, CSS variables in `packages/web/src/app/globals.css`

### 1.3 Key constants & demo

- **Demo user (seed):** `RopeDreamer` / password from `DEMO_LOGIN_PASSWORD` (default `demo`) when `npm run db:seed -w @c2k/api` has run
- **localStorage:** still used by some legacy UI (e.g. notifications read ids); profile editing targets API when DB mode is on
- **Tag seeds (UI):** `TAG_SEEDS` in mock data; kink catalog also seeded in DB for `/api/kink-tags`

### 1.4 Database schema sync (when Postgres / Docker is back)

Use this when the host has been **offline** or the database is **behind** current `main`. The canonical model is **`packages/api/src/db/schema.ts`** (Drizzle). The repo uses **`drizzle-kit push`**, not checked-in versioned SQL migrations; `packages/api/drizzle/` may be empty or absent until someone runs `drizzle-kit generate` for snapshots.

| Step | Action |
|------|--------|
| 1 | Start infra: `docker compose -f docker-compose.dev.yml up -d` — wait until Postgres is **healthy** (host port **6432** per `scripts/wait-for-postgres.mjs` / `.env.development`). |
| 2 | Apply schema: `npm run db:push -w @c2k/api` from repo root (uses `drizzle.config.cjs`; loads `.env.development` for `DATABASE_URL`). **Or** one shot: `npm run db:prepare` (= wait + push + seed). |
| 3 | Optional seed / demo data: `npm run db:seed -w @c2k/api` if you skipped `db:prepare` — includes convention slug **`seed-demo-con-program`** when seeds define it. |
| 4 | Restart **worker**: `npm run start:worker -w @c2k/api` so BullMQ registers jobs that depend on new tables (e.g. **`org-digest-sweep`** on `c2k-lifecycle`). |

**If the database predates the ~April 2026 convention-program slice**, `db:push` should create or align at least:

| Change | Purpose |
|--------|---------|
| **`user_notification_preferences`** | `org_digest_email_weekly`, `updated_at` — foundation for prefs API + future digests. |
| **`schedule_slots`** columns | `track_label`, `room_label`, `presenter_offering_id`, `import_key`, `updated_at` + index on `(convention_id, import_key)` for CSV idempotency. |
| **`convention_volunteer_shifts`**, **`convention_volunteer_shift_signups`** | Volunteer ops (separate from program slots). |
| **`convention_check_ins`** | Staff check-in rows. |

**JSON (no column migration):** `conventions.settings` already is `jsonb`; the app now reads **`publicProgramListing`** inside that object for attendee-gated program listing.

**Verify:** API boots without “column does not exist” errors; with a session, `GET /api/v1/me/notification-preferences` returns 200; optional smoke: `/conventions/seed-demo-con-program` after seed.

**Production:** Point `DATABASE_URL` at the real cluster, take a **backup** first, then the same `db:push` workflow (or your deployment pipeline equivalent). PostGIS exclusions in `drizzle.config.cjs` avoid destructive prompts against catalog tables.

---

## 2. Routing & Pages — Full Inventory

> **2026-04 note:** Subsections **§2.2–§2.6** are a **legacy snapshot** (March 2026) from before much of the API-backed UI landed. They still list `/notifications` and `/settings` as placeholders, hardcoded auth, etc. — **that is outdated.** For route status, **`packages/web/src/router.tsx`**, and org/convention coverage, use **[FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) §2** and **[FUNCTIONALITY_AND_STATUS.md](./FUNCTIONALITY_AND_STATUS.md)** first; keep §2 here only for historical narrative unless refreshed row-by-row.

### 2.1 Route Status Summary

| Status | Count | Description |
|--------|-------|-------------|
| **Full** | 12 | Fully implemented with mock data |
| **Partial** | 8 | Core works; some tabs/sections placeholder |
| **Placeholder** | 17 | "Coming soon" or minimal content |
| **Redirect** | 1 | `/feed` → `/home?tab=local` |

### 2.2 Fully Implemented Routes

| Route | Description |
|-------|-------------|
| `/` | Landing: hero, trust strip, how it works, featured events/vendors, LoginCard |
| `/home` | Main feed: 7 tabs (Local, Events, People, Groups, Vendors, Education, Trending), post composer, sidebar |
| `/discovery` | Search, filters, result types (People/Events/Vendors/Groups), tag browse |
| `/events` | Events list with filters, search, RSVP sidebar |
| `/groups` | Groups list with search, stream tabs, visibility filter |
| `/groups/[id]` | Group detail: Channels, Events, Members, Resources, Photos, Settings |
| `/vendors` | Vendors list with filters |
| `/education` | Education hub with category tabs, search, and filters |
| `/profile` | Own profile: About, Events, Groups, Reviews, Media, Education tabs |
| `/profile/edit` | Edit bio, location, sexuality, roles, age, main photo (localStorage) |
| `/onboarding` | 6-step signup flow |
| `/tags/[tag]` | Browse content by tag (photos, events, groups, articles, discussions, writings) |

### 2.3 Partially Implemented Routes

| Route | What Works | What's Placeholder |
|-------|------------|--------------------|
| `/events/[id]` | Overview, RSVP toggle, host, rules, dress code, consent, group link | Attendees, Vendors, Discussion, Safety Info tabs; Eventbrite embed |
| `/places` | US states + Canada provinces grid | No map, no events/groups by location |
| `/vendors/[id]` | Banner, about, Visit Shop, upcoming events sidebar | Products, Reviews sections |
| `/education/[slug]` | Article from `getMockArticleBySlug`; `notFound()` for unknown slugs | Deep sections still mock |
| `/messaging` | Layout, conversation list, per-thread message state | Attach/search are UI-only; not persisted |
| `/profile/[username]` | Read-only profile, endorsements, photos | Endorse button not wired |
| `/profile/complete` | Location, age, main photo | "Complete Signup!" → `/home` when valid; optional age |
| `/settings` | Layout, sections | All controls disabled; "Placeholder – API not connected" |

### 2.4 Placeholder Routes (Coming Soon)

| Route | Content |
|-------|---------|
| `/notifications` | "Your notifications will appear here. Coming soon." |
| `/chat` | "Real-time chat rooms for the kink community. Coming soon." |
| `/about`, `/contact`, `/support`, `/privacy`, `/terms`, `/guidelines`, `/accessibility` | `ComingSoonLayout` + CTAs; Support includes demo **FeedbackForm** |
| `/community`, `/dungeons`, `/calendar`, `/forums`, `/online`, `/rendezvous`, `/states` | Minimal placeholder |

### 2.5 Broken / Missing

- **`/connections`** — Page exists (`src/app/connections/page.tsx`); keep nav and audit docs in sync.

### 2.6 Navigation

- **Bottom nav (mobile):** Home, Explore, Create, Messages, Profile
- **Header:** Logo, search (non-functional), Create, Notifications, Messages, Profile dropdown
- **Footer:** Links from `site.config.ts`

---

## 3. What Works (Functional Features)

### 3.1 Home Feed

- Post composer adds in-memory local posts (`addMockLocalPost`; lost on full refresh)
- Local posts feed with edit/delete for own posts
- Tabs: Local, Events, People, Groups, Vendors, Education, Trending
- Sidebar: Upcoming Events, Suggested Connections, Reputation Tips

### 3.2 Discovery

- Search across People, Events, Vendors, Groups
- Filters: Distance, Roles, Experience level, Verified only, Event active, Reputation threshold
- Stream tabs: Recommended, Near you, New, Popular
- Tag cloud → `/tags/[tag]`
- Ranking via `discovery-utils.ts`

### 3.3 Profile

- **Own profile:** About (bio from localStorage), Events Attended, Groups, Media (photo CRUD)
- **Edit profile:** Bio, Location, Sexuality, Roles, Age, main photo → localStorage
- **Other profile:** Read-only; endorsements; TrustRing; badges
- **Media tab:** Add, edit caption, delete photos; `c2k_profile_photos_mock`

### 3.4 Groups

- **List:** Search, stream tabs, visibility filter
- **Detail:** Channels (pinned + discussions), Events (calendar + list), Members, Resources, Photos, Settings
- **Channel posts:** Edit/delete own; staff pin/unpin, delete
- **Photo approval:** Upload → pending → staff approve/deny; members withdraw
- **Resources:** Add/remove (canManage)
- **Tags:** Editable in Settings
- **Role management UI:** Present but Save disabled; no persistence

### 3.5 Events

- List with filters, search, ranking
- Detail: Overview, host, rules, dress code, consent, group link
- RSVP toggle (local state only)
- Group event calendar (GroupEventCalendar component)

### 3.6 Vendors

- List with VendorCard grid
- Detail: Banner, about, Visit Shop, upcoming events
- **Note:** Search and filters on list page are **not wired**

### 3.7 Education

- List with category tabs, EducationCard grid
- **Note:** Search not wired; article detail ignores slug (all show same article)

### 3.8 Trust & Reputation

- **TrustRing:** 5 segments (Event Reliability, Consent & Safety, Skill, Contribution, Vendor/Host)
- **Badges:** event_verified, community_contributor, community_trusted, etc.
- **TrustTierIndicator:** Implemented but **not used** in UI
- **Endorsements:** Display only; endorse button not wired

### 3.9 Tags

- TagLink component renders `#tag` → `/tags/[tag]`
- Tag browse: Photos, Events, Groups, Articles, Discussions, Writings
- Surfaces on GroupCard, EventCard, EducationCard, group photos

---

## 4. What Doesn't Work / Is Broken

### 4.1 Build-Blocking (Fixed)

- ~~`messaging/page.tsx`: `Link` used but not imported~~ → **Fixed** (import added)

### 4.2 Known Bugs

| Bug | Location | Fix |
|-----|----------|-----|
| `canManage` before init (if still occurs) | `groups/[id]/page.tsx` | Wrap `GROUP_TABS` in `useMemo`; use `viewerRole` in deps |
| Education article detail | `/education/[slug]` | All slugs show same article; add `getMockArticleBySlug(slug)` and use it |

### 4.3 Non-Functional Features

| Feature | Issue |
|--------|-------|
| **Auth** | `IS_LOGGED_IN = true` hardcoded; LoginCard forms do nothing |
| **Login/Signup** | `onSubmit` prevents default; no API |
| **Protected routes** | None; all routes public |
| **Messaging** | Send appends per thread (mock); Attach not wired; convo search filters list |
| **Notifications** | Placeholder only |
| **Settings** | All toggles/inputs disabled |
| **Create Event** | Wizard doesn't persist; Publish only closes modal |
| **Group Join** | Join button not wired |
| **LocalPostCard** | Love increments locally; Comment/Share/Bookmark disabled (demo) |
| **Header search** | Non-functional |
| **Vendors list** | Filters wired (mock) |
| **Education list** | Search wired (mock) |
| **Event type filter** | In-person/virtual toggle not applied |
| **GroupPhotoAlbumPreview** | Never renders `photo.url`; always placeholder icon |

---

## 5. What Is Placeholder

### 5.1 Pages

- `/notifications`, `/chat`, `/community`, `/dungeons`, `/calendar`, `/forums`, `/online`, `/rendezvous`, `/states`
- Legal/static (`/about`, `/contact`, `/support`, `/privacy`, `/terms`, `/guidelines`, `/accessibility`) use **ComingSoonLayout** + CTAs — product copy still TBD

### 5.2 Sections Within Pages

| Page | Placeholder Section |
|------|---------------------|
| Profile | Reviews tab, Education Contributions tab |
| Event detail | Attendees, Vendors, Discussion, Safety Info tabs |
| Vendor detail | Products, Reviews |
| Education detail | Per-slug content; TOC may need polish |
| Settings | Account email, password change; Notification toggles; Privacy selects |
| Messaging | Attach; server persistence |

### 5.3 Components

- **LoginCard:** Form submit does nothing
- **CreateFlowModal Event:** No persistence
- **WelcomeBanner:** Used on landing `/` (dismissible)
- **FeedbackForm:** Used on `/support` (demo)

---

## 6. What Needs UI

### 6.1 High Priority

| Item | Current State | Needed |
|------|---------------|--------|
| **GroupPhotoAlbumPreview** | Always shows placeholder icon | Render `photo.url` when present |
| **GroupHeader Join** | Button present | Wire join/leave logic |
| **GroupSettingsSection** | Role changes not saved | Persist role changes; enable Save |
| **Education article detail** | ~~Same article for all slugs~~ | `getMockArticleBySlug` + `notFound()` |
| **Vendors list filters** | Wired | Further polish / API later |

### 6.2 Medium Priority

| Item | Current State | Needed |
|------|---------------|--------|
| **LocalPostCard** | Love local; others disabled (demo) | Full comments/share when API exists |
| **Header search** | Input present | Search flow |
| **TrustTierIndicator** | On `PersonCard` | Profile header optional |
| **Loading states** | None | Skeletons/spinners for async |
| **Modal accessibility** | CreateFlowModal: trap + Escape | Event step labels still TODO |
| **Form labels** | Many inputs unlabeled | Associate labels for a11y |

### 6.3 Low Priority

| Item | Current State | Needed |
|------|---------------|--------|
| **FeedbackForm** | On `/support` | Real submit later |
| **WelcomeBanner** | On `/` | Copy/links review |
| **safe-area-pb** | Defined in `globals.css` + BottomNav | — |
| **Replace `<img>`** | 7 uses | Use Next.js `<Image />` |

---

## 7. Data Layer

### 7.1 Mock Data (src/data/)

| File | Purpose |
|------|---------|
| `mock-seeds.ts` | Generates People (~100), Events (~30), Groups (~25), Vendors (~15), Articles (~20), etc. |
| `mock-mutations.ts` | approve/deny/remove/add/withdraw group photos; edit/delete group posts; edit/delete/add local posts; add/remove resources; set group tags |
| `types.ts` | MockPerson, MockEvent, MockGroup, MockVendor, MockArticle, MockGroupPost, MockGroupPhoto, MockLocalPost, etc. |
| `mock-data.ts` | Barrel re-export |

### 7.2 Persistence

| Data | Storage | Lost on Refresh? |
|------|--------|------------------|
| Profile edit (bio, location, sexuality, roles, age, avatarUrl) | localStorage `c2k_profile_edit_mock` | No |
| Profile photos | localStorage `c2k_profile_photos_mock` | No |
| Group photos, posts, resources, tags | In-memory | Yes |
| Local posts | In-memory | Yes |
| All seed data | In-memory | Yes (regenerated) |

### 7.3 Hooks

| Hook | Purpose |
|------|----------|
| `useProfilePhotos` | Profile photo CRUD; localStorage |
| `useDiscoveryFilters` | Discovery filters, pagination |
| `useGroupDetail` | Group data, viewerRole, canManage, canModerate |
| `useTabFromUrl` | Tab state from `?tab=` |
| `useLocalStorage` | Generic; **unused** (dead code) |

---

## 8. Auth & Permissions

### 8.1 Auth

- **Logged-in state:** `IS_LOGGED_IN = true` in Header (hardcoded)
- **Viewer identity:** `MOCK_VIEWER_USERNAME = 'RopeDreamer'`
- **Login/Signup:** LoginCard exists; forms prevent default; no API
- **Protected routes:** None
- **Profile complete:** Page exists; "Complete Signup!" navigates to `/home` when location + photo are set (mock)

### 8.2 Permissions

| Check | Used For |
|-------|----------|
| `canManage` | owner or admin: Settings, Resources, group settings |
| `canModerate` | owner, admin, or moderator: Pin/unpin, delete others' posts, approve/deny photos |
| `authorUsername === RopeDreamer` | Edit/delete own posts; withdraw own pending photos |
| `isMember` | Upload photos, post in channels |

### 8.3 Group Roles

- **Defined:** owner, admin, moderator, event_host, vetted, member
- **Used in logic:** owner, admin, moderator
- **event_host, vetted:** Only in seeds and GroupRoleBadge; no permission logic

---

## 9. Technical Debt

### 9.1 Lint

| Severity | Count | Notes |
|----------|-------|-------|
| Error | 0 | Fixed Link import |
| Warning | 14 | react-hooks/exhaustive-deps (7), @next/next/no-img-element (7) |

### 9.2 Build

- **Status:** Passes after Link fix
- **Tailwind:** `content` includes `./src/pages/**/*` but no `src/pages` (App Router only) — redundant

### 9.3 Dead / Unused Code

- ~~`WelcomeBanner`~~ — used on landing `/`
- `useLocalStorage` — generic hook; not used by features yet (profile uses dedicated hooks)
- ~~`FeedbackForm`~~ — used on `/support` (demo)
- ~~`TrustTierIndicator`~~ — used on `PersonCard`

### 9.4 Architecture Docs

- `docs/FUNCTIONALITY_AND_STATUS.md` — feature overview
- `docs/c2k-kink-community-plan.md` — phase plan
- `docs/ROUTING_AND_PAGES_AUDIT.md` — routing audit
- `docs/UI_COMPONENTS_AUDIT.md` — components audit
- `docs/GROUPS_FEATURE_AUDIT.md` — groups audit
- `docs/HANDOFF-UI-UX-STYLING-AUDIT.md` — UI/UX audit

---

## 10. Deferred / Not Started

| Feature | Notes |
|---------|-------|
| Eventbrite integration | No embed; no `eventbriteEventId` in model |
| Recurring events | One-off only |
| Site-wide moderators | Only group-level roles |
| Real messaging | Placeholder only |
| Real notifications | Placeholder only |
| Channels: create, archive | Placeholder |
| Group settings persistence | Read-only for now |
| Invite links, vetting queue | Placeholder |
| Ticket sales | Stripe vs Eventbrite decision pending |
| `/connections` polish | Page exists; ensure content matches IA |

---

## 11. Recommendations for Claude / Next Steps

### 11.1 Immediate (Unblock / Fix)

1. ~~Add `/connections` page or remove from nav~~ — route present; verify copy
2. ~~Education article detail uses slug~~ — `getMockArticleBySlug`
3. ~~Vendors search/filters~~ — wired in list UI
4. ~~Education search~~ — wired in hub

*Next:* refresh auxiliary audits (`ROUTING_AND_PAGES_AUDIT.md`, etc.) and trim stale warnings.

### 11.2 Short-Term (Core UX)

1. Wire GroupPhotoAlbumPreview to show `photo.url`
2. Wire GroupHeader Join button
3. ~~LocalPostCard Love~~ — Love increments locally; Comment/Share/Bookmark disabled (honest)
4. Add loading states for key pages
5. ~~TrustTierIndicator on PersonCard~~ — done

### 11.3 Medium-Term (Features)

1. Auth: real login/signup, session, protected routes
2. Messaging: API, Send, per-conversation messages
3. Notifications: list UI, API
4. Settings: wire toggles and selects to API
5. Create Event: persist via API

### 11.4 Long-Term (Platform)

1. Backend API integration
2. Eventbrite / ticket flow
3. Recurring events
4. Site-wide moderation
5. Real-time chat rooms

---

## 12. How to Run

```bash
cd coast-to-coast-kink
npm install
npm run dev
```

Open `http://localhost:3000`. Default "logged in" as RopeDreamer. Navigate to `/groups/g1` to see a group where RopeDreamer is a moderator.

**Actionable backlog:** see `docs/NEXT_STEPS.md`.

---

## Appendix: File Reference

| Purpose | Path |
|---------|------|
| Mock data | `src/data/mock-data.ts`, `mock-seeds.ts`, `mock-mutations.ts` |
| Types | `src/data/types.ts` |
| Discovery ranking | `src/lib/discovery-utils.ts` |
| Group detail | `src/app/groups/[id]/page.tsx` |
| Profile | `src/app/profile/page.tsx`, `profile/edit/page.tsx` |
| Photo upload | `src/components/PhotoUpload.tsx` |
| Tag link | `src/components/TagLink.tsx` |
| Tag browse | `src/app/tags/[tag]/page.tsx` |
| Group calendar | `src/components/GroupEventCalendar.tsx` |
| Trust ring | `src/components/TrustRing.tsx` |
| Site config | `src/config/site.config.ts` |
