# C2K — Strategic & Architectural Guidance Document
**For:** Cursor AI agent sessions  
**Authored:** 2026-05-26  
**Updated:** 2026-06-06 (v3 + Kink Social rebrand; moderation alpha / SCOPED-MOD-1 shipped; doc sync batches)  
**Status:** Active — supersedes all prior session notes  
**Project:** **Kink Social** (kink.social — public brand) · internal codename **C2K** · **ECKE** legacy SEO bridge

---

## 0. Brand & naming

| Layer | Name | Where it appears |
|-------|------|------------------|
| **Public brand** | **Kink Social** | User-facing copy, `site.config.ts`, marketing, kink.social |
| **Internal codename** | **C2K** | Repo root, packages (`@c2k/*`), env vars (`C2K_*`), worker queues, this doc filename |
| **Organizer product** | **Dance Card by Kink Social** | Convention attendee weekend app + organizer program tooling |
| **Legacy SEO bridge** | **ECKE** (East Coast Kink Events) | Public discovery listings; outbound publish from Kink Social — not auth or registration |

Do **not** rename packages, env prefixes, or queue names to match the public brand. Update user-facing strings and docs; keep C2K in code identifiers unless a dedicated UI pass renames display copy only.

---

## 1. What This Platform Actually Is

Stop framing this as "a FetLife competitor." That framing is tactically useful for marketing but architecturally dangerous if it drives development priorities. The accurate framing:

> Kink Social (internal: C2K) is a **community operating system** for the organized kink world — built organizer-first, with social features layered on top of operational infrastructure, not the other way around.

The competitive wedge is **workflow gravity**, not feed engagement. FetLife owns the social graph. Kink Social will own the infrastructure that organizers and conventions depend on. Social features attract users. Operational lock-in keeps them.

This distinction must guide every architectural decision going forward.

---

## 2. Local Development Environment — Active Build Context

**This section exists because Cursor must not treat missing production infrastructure as a blocker for any Phase 1 work. Everything needed to build and test C2K is available locally via Docker Desktop.**

### The Active Stack

```bash
docker compose -f docker-compose.dev.yml up -d
npm run db:prepare    # drizzle push + seed
npm run dev           # web :5173, api :3001
```

All four backing services run locally. There is no dependency on a live server for any current development work:

| Service | Local | Port | What It Replaces |
|---|---|---|---|
| PostgreSQL + PostGIS | `docker-compose.dev.yml` | 6432 | Prod managed DB |
| Redis | `docker-compose.dev.yml` | 6379 | Prod Redis |
| **Mailpit** | `docker-compose.dev.yml` | SMTP: 1025, UI: 8025 | Prod SMTP / Resend |
| MinIO | `docker-compose.dev.yml` | 9000 / console 9001 | S3-compatible prod storage |

**Demo user:** `RopeDreamer` / `demo` — see `docs/LOCALHOST_DEMO_LINKS.md`

### Email in Development — Use Mailpit, Not a Real Provider

Mailpit is a local SMTP catch-all. Every email the application sends is captured and visible at `http://localhost:8025`. No real credentials, no DNS configuration, no external provider needed.

**Required `.env.development` mail vars:**
```
C2K_MAIL_TRANSPORT=smtp
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
C2K_MAIL_FROM=noreply@c2k.local
C2K_PUBLIC_WEB_URL=http://localhost:5173
```

**If `C2K_MAIL_TRANSPORT` is `disabled` or missing, email features appear broken.** Set it to `smtp` pointing at Mailpit and everything works locally — org welcome emails, RSVP confirms, digest previews, scope list double opt-in, all of it.

Cursor must not suggest skipping email-dependent features or marking them as "requires live server." They work on Mailpit. Build and test them now.

### What Actually Cannot Be Done Without a Server

Only three things are genuinely blocked on live infrastructure. Everything else is buildable now:

| Blocked Item | Why | Where Documented |
|---|---|---|
| DNS / SPF / DKIM / DMARC | Requires a real domain pointed at a real server | `docs/PROD_SMTP_K8S_CHECKLIST.md` |
| First real pilot org onboarding | Requires a publicly accessible URL | `docs/PILOT_READINESS.md` |
| Remote org demos without tunnel | Can use Cloudflare Tunnel as a one-off if needed | Not a development requirement |

Everything else — all organizer tooling, registration flows, attendee hub, push notifications (test via VAPID on localhost), gallery, dancecard, moderation queue, worker jobs — is testable locally right now.

### Standard Verification Commands

Run these after every feature slice:

```bash
npm run typecheck
npm test
node scripts/pilot-readiness-smoke.mjs
# when touching organizer or attendee flows:
node scripts/smoke-attendee-dancecard.mjs
node scripts/audit-command-bridge.mjs
```

### Server Cutover Log

When the time comes to move to a live server, `docs/SERVER_CUTOVER_LOG.md` tracks the delta — new env vars, migration scripts, sign-off steps. Every PR that adds a new `C2K_*`, `VITE_*`, or VAPID variable must update `.env.development`, `.env.production.example`, `k8s/base/secret.example.yaml`, and one row in the cutover log in the same commit.

The cutover log is the only server-related document Cursor needs to touch during local development. It is a running journal, not a blocker.

---

## 3. The Two-Surface Strategy

C2K and ECKE are not the same product. They serve different purposes and different audiences. Keep this distinction sharp at all times.

### C2K — The Authenticated Community Platform
- Requires registration and login
- Where everything operational happens: event setup, programming, dancecard, registration, staff management, community hubs, social graph, messaging
- The identity authority — one account, one person, everywhere
- Not publicly indexed (members only by design)

### ECKE — The Public SEO and Advertising Surface
- No login, no registration, no new identity work
- Publicly indexed by Google — currently ~100k visitors/year and growing
- Displays what C2K users and orgs choose to make public: event listings, vendor profiles, educational content
- The monetization vehicle: advertising packages for vendors and events, Google Ads on editorial content, journalist revenue share program
- Gets a full redesign when C2K reaches alpha — the redesign will be driven by what C2K publishes to it, not designed independently

**Data flow is strictly one direction: C2K → ECKE.** Nothing flows back. ECKE never authenticates users, never stores registrations, never originates identity. It is a display layer for curated public data.

### What ECKE Will Monetize
1. **Vendor advertising packages** — vendors pay to promote their profiles and products to ECKE's search audience
2. **Event promotion packages** — orgs pay to boost event visibility in ECKE listings
3. **Google Ads on editorial/educational content** — passive revenue on article traffic
4. **Journalist revenue share** — writers earn a cut of ad revenue on their published articles

The editorial/article content type does not exist in C2K yet. When it is built it becomes its own content domain — not a forum post type, not a feed post. Plan for a separate `articles` table with author attribution, publication status, and ECKE publish target. Do not hack it into existing content types.

---

## 4. The Growth Strategy

### Phase 1: Own the Organizer Layer (Alpha → 6 months post-alpha)
The fastest path to user acquisition is organizer adoption. Every org that runs their events through C2K brings their entire attendee list into the identity system. That is the flywheel.

Target orgs:
- Convention organizers frustrated with Eventbrite/Universe pricing and zero community features
- Munch organizers using FetLife events with no attendee management
- Regional kink orgs that want a real hub beyond a Discord server

**The deal:** Approach orgs individually. Offer to custom-build the specific tools they need. In exchange, they commit to running all event activities through C2K for two years — setup, programming, dancecard, registration, staff management, everything. They can still promote on FetLife and other platforms. C2K is their operational home, not their exclusive marketing channel.

**Pricing:** Free for the two-year agreement period. After two years, transitions to **$0.25 per registered attendee** per event. This is low enough that no org feels gouged and scales naturally with their success. A 200-person convention pays $50. A 1,000-person convention pays $250. Reasonable at any scale.

**Billing source of truth:** `convention_registrants` table already captures this data. Post-launch billing can start as a monthly email with a count and invoice link — it does not need a full billing system at launch.

### Phase 2: Social Graph Activation (6–12 months post-alpha)
Once attendees exist in the system, activate the social layer:
- Following feed showing connections' RSVPs, class attendance, vendor activity
- "Who's going" at conventions with privacy controls
- Presenter reputation that travels across events
- Feed activity emission wired through `feed_activities`

### Phase 3: Portable Identity and Credential Panel (12–24 months)
The feature nobody else has. A user's verified community record — presenter credits, attendance history, staff service, organizer trust grants — is portable across all participating orgs. Once the ecosystem depends on this identity layer, C2K is infrastructure, not just software.

---

## 5. Payments — C2K Does Not Touch Money

**This is a firm architectural decision, not a placeholder.**

C2K will never be a payment processor and will never hold transaction records for convention registrations or vendor sales. The kink community has documented history with payment processors (Stripe, Square, PayPal) terminating accounts with no notice and holding funds. Getting in the middle of that creates legal exposure and operational liability with no upside.

### How Payments Work Instead
- Orgs use whatever payment processor works for their situation: their own Stripe, Eventbrite, cash at the door, whatever
- C2K event and registration records carry a `ticketing_url` field — a link to wherever payment actually happens
- Vendor profiles carry external store URLs (Etsy, Shopify, WooCommerce) — already partially built
- C2K registration records track attendance and access grants, **not** payment confirmation

### Data Model Rule
- No `payments` table, no `transactions` table, no `payment_status` on registrants that implies C2K processed money
- `convention_registrants.paidConfirmed` is an **organizer-managed flag** — the organizer marks it true when they verify payment happened through their external system
- Never add a Stripe integration to the registration flow

### ECKE Advertising Revenue
ECKE advertising packages are a separate business operation from C2K's platform. Revenue from ECKE ads does not flow through C2K's application layer. It is a media business running alongside the platform, not a feature of it.

---

## 6. Content and Community Policy

### Philosophy
C2K is not FetLife. The platform will not suppress discussion of negative experiences. Users can speak openly about their experiences with people and organizations. This is a deliberate choice that makes C2K more trustworthy than platforms that protect the accused by silencing the accuser.

The flip side is that the platform needs a real moderation architecture — not reactionary banning, but a structured process that communities can trust.

### Three-Layer Moderation Structure

**Layer 1: Org-level self-governance (handles ~95% of situations)**
- Org admins can ban users from their organization
- Org moderators can remove content from their forums and channels
- Orgs set their own community standards within platform rules
- This is already built — org role system handles it

**Layer 2: AI-assisted triage (builds on existing `moderation_jobs` queue)**
When a report escalates beyond org-level handling or involves cross-org behavior:
- Report enters `moderation_jobs` queue
- AI analysis step is added to the queue worker: summarizes the report, pulls relevant context (prior reports on same user, reputation events, relevant posts), delivers a structured summary and preliminary verdict
- AI output is a **summary for humans to act on** — never an autonomous action
- The moderation council reviews the AI summary and makes the final call
- Council can overrule the AI recommendation — the AI summary is advisory, not binding

**Layer 3: C2K moderation council (platform staff)**
- Small group of trusted C2K staff
- Handles: cross-org incidents, outing reports, org-goes-rogue situations, identity bans
- Operates on council consensus, not single-moderator decisions
- Can impose: content removal, user suspension, org suspension, identity ban
- Decisions are documented in `moderation_jobs` with the reasoning stored

### Specific High-Risk Scenarios and How They're Handled

**User outing:** Treated as a platform-level emergency. Any report involving someone being outed (real name, workplace, location revealed without consent) goes directly to council — does not wait for AI triage. Content is removed pending review. This is the highest severity class.

**Consent violation reports:** Org handles first. If the accused is in a position of power within the org (leadership, staff), or the report involves multiple orgs, escalates to council. AI triage is appropriate here — it can surface pattern data across prior reports.

**Org goes rogue:** If an org's leadership begins using the platform to protect abusers or systematically silence victims, council can suspend the org's command bridge access, freeze new registrations, and in extreme cases deactivate the org hub entirely. The org's event history and attendee data is preserved — it is not deleted.

**Platform staff misconduct:** Council member accused of misconduct recuses. Remaining council decides. No single council member can make unilateral platform-level decisions.

### What the Platform Will Not Host
- Doxxing or involuntary outing content
- Non-consensual sharing of intimate images
- Content involving minors in any sexual context (immediate permanent ban, no council process)
- Coordinated harassment campaigns
- Fraudulent vendor listings

### AI Integration Architecture
The existing `c2k-moderation` queue in BullMQ is the correct hook for this. The current worker just marks jobs complete — it is a placeholder. The AI integration replaces that placeholder:

```
moderation_jobs (PENDING)
  → c2k-moderation queue
  → worker: pull report + context
  → AI analysis: Claude API or equivalent
  → store structured summary + preliminary verdict on job row
  → notify council via in-app notification
  → council reviews and acts
  → job marked RESOLVED with decision and reasoning
```

Do not build the AI analysis step until the council workflow and notification path are working first. The human process must be functional before AI is layered on top of it.

---

## 7. The Sub-Profile / Capability Profile Architecture

The current system has a single `users` + `profiles` record. The next major identity evolution is **capability profiles** — extensions on the same identity spine, never separate accounts.

### Core Identity (already exists)
```
users → profiles (display_name, bio, location, roles[], visibility, trust_score)
      → user_settings
      → user_notification_preferences
      → sessions
```

### Capability Profiles (to be built)
Each is an extension table referencing `user_id` — not a fork of `users`:

| Profile Type | Key Fields | Gate |
|---|---|---|
| **Vendor** | shop name, product categories, external store URLs, blind feedback | Self-activated (already partially built) |
| **Presenter/Educator** | bio, topic tags, session history, convention credits, references | Self-declared; credits auto-populated from `schedule_slot_presenters` |
| **Photographer** | portfolio links, convention credentials, consent policy | Org-verified |
| **Author/Journalist** | publications, sample links, press credentials | Self-declared; unlocks article publishing and revenue share |
| **Staff/Volunteer** | shift history, org affiliations, skill tags | Auto-populated from shift completions |
| **Dungeon Monitor** | certifications, trained-by references, active orgs | Org `OWNER/ADMIN` grant only — never self-declared |

### Implementation Rules
- Reference `user_id` as the single anchor — no `presenter_users`, no `vendor_accounts`
- Discoverable through unified people search with type filters
- Self-activatable except gated types requiring org grant
- Own visibility settings independent of base profile
- Represented in Discovery domain's `searchPeople()` — not a separate presenter-only search

**Presenter credits:** Do not build a manual credits input. Credits auto-populate from `schedule_slot_presenters` across conventions. That is the source of truth.

**Author/Journalist profile specifically:** This profile type unlocks the ability to publish articles to the C2K editorial system and receive ECKE ad revenue share. The revenue share mechanism is a post-launch operational concern — design the profile type now, wire the revenue logic later.

---

## 8. Architecture Principles — Binding Rules for Cursor

### 7.1 Identity Rules
- One `users` row per human. Always.
- `convention_registrants`, `convention_persons`, `event_rsvps` are **participation records**, not people.
- `convention_persons` without `user_id` is a legacy/staging artifact — never create new orphan rows.
- Every new participation write must set `user_id`. The API rejects orphan creates.
- Display name overrides (badge name) live on the participation row, not in a new profile.
- Import paths resolve email → `user_id` via `resolveUserIdByEmail` before writing.

### 7.2 Extend Before Add
Before creating a new table, ask in this order:
1. Can this be a column on an existing table?
2. Can this be a key in an existing JSONB `settings` field?
3. Can this be a row in an existing pattern table?
4. Only then: create a new table.

Examples:
- New event type → extend `events` with a type enum
- New convention feature flag → extend `conventions.settings` JSONB
- New organizer permission flag → extend `convention_command_grants` columns
- New capability profile → new table `presenter_profiles` referencing `user_id`, not a fork

### 7.3 Route Module Discipline
- New domain features go in named route modules — not stuffed into `ecosystem-stubs.ts`
- `ecosystem-stubs.ts` is production DB-backed (events, groups, connections, notifications, DMs, reports) — document this at the top of the file, do not rename mid-session
- Organizer routes that grow large split into `convention-organizer/[feature]-routes.ts`
- Every new route module registers in `server.ts` — do not nest registration inside other modules

### 7.4 Permission Layers Are Ordered and Cumulative
Layers: Platform (0) → Org (1) → Group (2) → Convention Attendee (3) → Command Bridge (4) → Resource (5)

When adding a permission check:
1. Identify which layer — do not mix layers in one check
2. Enforce at API level always — UI hiding is not enforcement
3. Add to the relevant resolver function, not inline in the route handler
4. If you add a nav tab, add the corresponding `filterNavByPermissions` entry in the same commit
5. If you add a new WS scope, update `authorizeWebSocketSubscribe` in the same commit — WS auth must mirror REST auth

**Key resolvers:**
- `resolveViewerFromRequest` — Layer 0
- `requireOrgRole` / org membership check — Layer 1
- `getConventionWithAccess` — Layer 3
- `requireConventionCommand` / `resolveConventionCommandAccess` — Layer 4

### 7.5 Two Chat Systems, Not Three
- `org_channels` / `org_channel_messages` — org members, WS-backed, no push
- `convention_hub_channels` / `convention_hub_channel_messages` — convention attendees, push to pinned users, HTTP + push

Do not merge them. Do not add a third. If hub chat needs WS in the future, add scope `convention:{id}:hub:{channelId}` — do not route through org channel scopes.

### 7.6 ECKE Is Outbound Only
C2K → ECKE. Never the reverse. No auth, no registration, no identity ingestion from ECKE. Partner API access (future) goes through the Partner API layer, not through ECKE.

### 7.7 Side Effects Belong in the Worker
Notifications, email digests, vendor sync, moderation jobs, feed activity aggregation → BullMQ. Not inline in route handlers. When adding a new async side effect: define a named job type, enqueue after DB commit, handle in `worker.ts` via `lib/` service functions.

**Items not yet moved to worker — future debt:**
- `syncConventionPeopleDirectory` — synchronous on API writes today, should be enqueued
- Hub push fan-out — synchronous today, acceptable at convention scale
- Feed activity emission — when `feed_activities` is built, emit via worker

### 7.8 Notification Types Are a Shared Contract
Notification type strings live in `@c2k/shared` as a registered enum/const. Never define type strings only in a route file. When adding a new type: add to shared registry first, then use the constant in both emitter and consumer.

### 7.9 No Payment Processing — Ever
C2K never holds transaction records. `paidConfirmed` on registrants is an organizer-managed boolean flag, not evidence that C2K processed payment. Never add a Stripe integration to the registration flow. See Section 4.

---

## 9. Domain Boundaries and Contracts

Each domain owns its tables and exposes typed interfaces. Other domains call the interface, not the table.

### Domain Ownership Map

| Domain | Owns | Must Not Own | Key Interfaces |
|---|---|---|---|
| **Identity** | `users`, `profiles`, `sessions`, `user_settings`, `identity_bans` | Per-event duplicate accounts | `resolveViewer()`, `getProfile()`, `checkIdentityBan()` |
| **Social** | `connections`, `blocks`, `mutes`, `feed_posts`, `conversations`, `messages` | Org membership, convention program | `getFeed()`, `getConnections()`, `canDM()` |
| **Feed (planned)** | `feed_activities` | Second post table for same content | `emitActivity()`, `getFollowingFeed()` |
| **Org Hub** | `organizations`, `organization_members`, `org_channels`, org forums | Convention kit registrant schema | `getOrgWithAccess()`, `requireOrgRole()` |
| **Group** | `groups`, `group_members`, group forums | Separate group identity model | `getGroupWithAccess()`, `viewerCanManage()` |
| **Calendar Event** | `events`, `event_rsvps`, `event_contributors` | Multi-day slot grid | `getEvent()`, `createRsvp()` |
| **Convention OS** | `conventions`, `schedule_slots`, grants, pins, hub channels, ISO, gallery | Organizer import batches | `getConventionWithAccess()`, `syncAccessGrant()` |
| **Event Systems** | Registrants, program CRUD, messaging campaigns, exports, command grants | ECKE login state, payment records | `requireConventionCommand()`, `upsertRegistrant()` |
| **Vendor Commerce** | `vendor_profiles`, `products`, `vendor_external_listings` | Transaction records, payment processing | `getVendorProfile()`, `syncExternalListings()` |
| **Discovery** | People search, groups nearby, presenter directory | Feed ranking | `searchPeople()`, `getNearbyGroups()` |
| **Trust & Safety** | `reports`, `moderation_jobs`, `profile_review_flags`, `profile_reputation_events` | Business workflow state | `createReport()`, `enqueueModJob()` |
| **Platform Comms** | `notifications`, `push_subscriptions`, mail, digests, scope email lists | Message body storage for campaigns | `createNotification()`, `sendWebPush()`, `scheduleDigest()` |
| **Editorial (future)** | `articles`, publication status, author attribution | Forum posts, feed posts | `publishArticle()`, `getArticlesByAuthor()` |
| **Publish Bridge** | `ecke_publish_targets`, outbound payloads | Inbound ECKE auth | `publishToEcke()` |

### Implementation Path (Incremental)
As you touch each domain in a session:
1. Extract direct DB calls into `lib/[domain]-service.ts`
2. Route handlers call the service, not `db.select()` directly
3. Services emit domain events to BullMQ when state changes

### Intentional Coupling (Document, Do Not Break)
| Coupling | Why It Exists |
|---|---|
| Convention → Organization via `organization_id` | Command bridge requires org context |
| Event → Convention via `anchor_event_id` | Ticketing on event; program on convention |
| Registrant write → access grant sync | `syncAccessGrantOnRegistration` must stay coherent |
| Registrant write → people directory sync | `syncConventionPeopleDirectory` must stay idempotent |
| Org chat message → `publishToScope` | Client refetch pattern for realtime |
| Hub message → push to pinned users | `convention_pins` is the push audience |

---

## 10. Realtime Architecture

### Current: In-Process Bus (Single Replica Only)
`lib/realtime-bus.ts` is an in-memory pub/sub. Works for single-instance deploys. Breaks silently at multi-replica — a publish on API-1 never reaches WS subscribers on API-2.

### Active WS Scopes — Stable Contracts
Do not change these scope strings without a client migration plan:

| Scope | Subscribers | Published When |
|---|---|---|
| `convention:{uuid}:schedule` | Attendees with grant or public listing, org MODERATOR+ | Slot CRUD, CSV import, staff assignment, slot signup |
| `org:{uuid}:channel:{uuid}` | Org members with `chatEnabled` | Message, reply, reaction events |
| `org:{uuid}:announcements` | Org members with `chatEnabled` | Org announcement post |

### Required Before Multi-Replica: Redis Pub/Sub Bridge
`publishToScope` → Redis channel → all API instances → local WS listeners. This does not change the scope string contract or client protocol. It is purely server-side fan-out. Must be in place before any horizontal scaling of the API.

### WS Auth Must Mirror REST Auth — Always
`authorizeWebSocketSubscribe` duplicates REST visibility logic. When you add a REST visibility rule, update WS auth in the same commit. Drift = data leak.

### Scopes Not Yet Implemented
| Desired | Notes |
|---|---|
| `convention:{id}:hub:{channelId}` | Hub chat uses HTTP + push today; add when needed, do not route through org scopes |
| `user:{id}:notifications` | In-app notifications are pull today |

---

## 11. Background Worker System

**Process:** `packages/api/src/worker.ts` — must share `DATABASE_URL`, `REDIS_URL`, and mail env with API.

### Queue Catalog

| Queue | Handler | Jobs |
|---|---|---|
| `c2k-moderation` | `moderationWorker` | AI triage step (future), mark job complete |
| `c2k-external-sync` | `externalSyncWorker` | `sync-vendor`, `sync-all` (~45min repeat) |
| `c2k-lifecycle` | `lifecycleWorker` | `sweep`, `virtual-event-reminders`, `org-digest-sweep`, `pinned-digest-sweep` |

### Worker Rules
- Handlers orchestrate — they call `lib/` functions, they don't contain business logic
- Repeat jobs use BullMQ `jobId` repeat keys to prevent duplicate schedulers across replicas
- Digest sweeps call `sendEmail` — if mail is not configured they no-op/log, never crash
- `USE_DATABASE=true` required for sweeps to mutate

### Env Kill Switches
`C2K_LIFECYCLE_DISABLE_REPEAT=true` kills all lifecycle repeats. Per-job: `C2K_ORG_DIGEST_DISABLE`, `C2K_PINNED_DIGEST_DISABLE`, `C2K_VIRTUAL_EVENT_REMINDER_DISABLE`, `EXTERNAL_SYNC_DISABLE_REPEAT`.

---

## 12. Notification System

Three delivery channels. Never consolidate them — different delivery guarantees and opt-out semantics.

| Channel | Transport | Triggered By | Opt-Out |
|---|---|---|---|
| **In-app** | DB row in `notifications` | `createNotification()` in route | Per-type UI |
| **Email** | SMTP / Resend via `mailer.ts` | Route or worker digest sweep | List unsubscribe + digest prefs |
| **Web Push** | VAPID via `web-push` | Hub channel post → pinned users | `pushHubAnnouncements`, `pushHubChat` prefs |

### Rules
- In-app: synchronous with request, no queue, type strings registered in `@c2k/shared`
- Email: transactional from routes, digests from worker only
- Push: audience is `convention_pins` filtered by prefs; 410/404 endpoints auto-delete subscription row
- Kill switches: `C2K_PUSH_ANNOUNCEMENTS`, `C2K_PUSH_CHAT`
- Never send in-app notifications at feed-love scale — use `feed_activities` aggregation instead

**Preferences:** `user_notification_preferences` — four columns, all default true: `org_digest_email_weekly`, `pinned_digest_email_weekly`, `push_hub_announcements`, `push_hub_chat`

---

## 13. The Following Feed — Build Order

Build in strict phase order. Do not skip ahead.

### F1: Write Path Only (No UI)
- Add `feed_activities` table: `(id, actor_id, verb, object_type, object_id, audience_type, created_at)`
- Index: `(actor_id, created_at DESC)`
- Emit on: connection accepted, RSVP created, feed post created, presenter assigned to slot
- No read path yet

### F2: Read API
- `GET /api/v1/feed/following` — pull model, keyset pagination
- Query connection graph capped at 2000 — never `WHERE actor_id IN (N unbounded ids)`
- Respect object visibility settings and mutes

### F3: UI
- "Following" tab added to `/home` alongside existing "Discover"
- New component: `src/app/home/FollowingFeedTab.tsx` — do not modify existing global feed
- Activity cards render differently by verb: "X is going to Y", "X taught at Y", "X connected with Z"

### Scaling Notes
- Pull model fine to ~100k MAU at kink community density
- Fan-out-on-write at 500k+ MAU
- Cap connection lookup, never run unbounded `IN` queries

---

## 14. Mobile Strategy

### Current Reality
The SPA is not optimized for mobile but the API/hook architecture is clean enough that a mobile app is feasible without rearchitecting the backend. The constraint is not technical — it is the app store environment.

### Apple App Store
Apple has a documented pattern of removing adult content platforms with no warning. Getting C2K on the iOS App Store as a kink community platform is not a realistic near-term goal. Do not design for it. Do not waste time on it before the web platform is proven.

### Android
Google Play is more permissive for adult content platforms with age verification in place. Android native (React Native + Expo) is the first realistic app target. When the web platform reaches stable post-alpha, evaluate a React Native build that reuses the existing API layer and domain hooks pattern.

### PWA as the Mobile Bridge (Build This First)
The web app should be a solid Progressive Web App before any native app is considered. PWA gives iOS users a functional mobile experience without App Store dependency:
- Add to home screen support
- Offline schedule access (already partially built via `sw-program.js`)
- Push notifications on Android via PWA (already built via VAPID)
- iOS push via PWA became available in iOS 16.4+ — implement and test

**PWA checklist before alpha:**
- [ ] `manifest.json` with correct icons, theme color, display mode
- [ ] Service worker handling offline fallback for core pages
- [ ] `sw-program.js` tested for convention schedule caching
- [ ] Push notification flow tested on Android Chrome and iOS Safari 16.4+
- [ ] Viewport meta tag and touch targets meet mobile usability standards
- [ ] Core organizer workflows usable on a phone screen (registration desk use case)

### Mobile-First Organizer Use Cases
Convention check-in at the door is a phone workflow. Registration desk staff are not sitting at desktops. The door panel in the organizer console must work on mobile — this is a practical requirement for Phase 1 org onboarding, not a nice-to-have.

---

## 15. Org Onboarding — The Phase 1 Playbook

This is how C2K gets its first users. It is a hands-on process, not a self-serve signup flow.

### The Approach
Contact orgs individually. Have a real conversation about what they need. Build what they need within the existing architecture — not custom one-off code, but configuring and completing existing systems to serve their specific use case. The value proposition is: you get enterprise-grade convention tooling for free, we get two years of real-world usage data and a community anchor.

### The Agreement (Informal at First)
- Org commits to running all event activities through C2K for two years
- Activities means: event setup, programming, schedule, dancecard, registration, staff management, attendee hub
- They can still promote on FetLife, Instagram, etc. — C2K is their operational home, not their exclusive marketing channel
- After two years: $0.25 per registered attendee per event — invoiced monthly based on `convention_registrants` count

### What to Build for Each Org Onboarding
Before approaching an org, make sure these are working:
1. Org hub creation and basic setup
2. Convention creation with working registration
3. Schedule builder (slots, presenters, staff)
4. Dancecard for attendees
5. Check-in door panel (mobile-functional)
6. Attendee hub with chat and announcements
7. ECKE publish for their event listing

After the first org is live, document what broke and what they asked for. Let that list drive the next sprint before approaching a second org.

### The Custom Tooling Promise
"Custom" does not mean bespoke code outside the architecture. It means:
- Configuring `peopleHubTemplate` for their event type (convention, munch, class series)
- Building any missing organizer features that fit the existing domain model
- Possibly building the specific capability profile types their community needs (DM certification tracking, presenter directory)

Never build something for one org that breaks the data model rules. If they need something that requires a new table or pattern, do it right — it becomes a feature for all orgs.

### Advertising Dashboard (Post-Phase-1)
Once ECKE has multiple orgs publishing events, build the advertising dashboard:
- Orgs buy promotion packages to boost event visibility in ECKE search results
- Vendors buy placement on relevant event pages and category pages
- Dashboard shows impressions, clicks, package status
- This lives on ECKE, not C2K — it is a media product, not a community feature

---

## 16. Launch Readiness — Go/No-Go Criteria

**Alpha is ready when:**
- [ ] At least one real org can set up a convention end-to-end without developer assistance
- [ ] Registration flow works: user creates account → registers for event → appears in organizer's registrant list
- [ ] Check-in door panel works on a phone
- [ ] Attendee hub works: schedule visible, chat working, announcements pushing to pinned users
- [ ] ECKE publish produces a live public listing for the convention
- [ ] Email is configured and sending (org welcome, RSVP confirm, digest)
- [ ] Push notifications working on Android Chrome
- [ ] Rate limits on auth endpoints confirmed active
- [ ] Organizer permission audit complete — no cross-org data leaks possible
- [ ] `paidConfirmed` flag is organizer-managed only — no payment processor wired
- [ ] Moderation report flow works end-to-end (even without AI triage)
- [ ] Identity ban can be applied and enforced on login
- [ ] PWA manifest and offline fallback tested

**Beta is ready when:**
- [ ] Three or more orgs running real events
- [ ] Following feed F1 write path live
- [ ] Capability profiles: vendor and presenter working
- [ ] Redis pub/sub bus in place (before any multi-replica deploy)
- [ ] Prod mail checklist signed off
- [ ] Moderation council workflow operational with internal tooling
- [ ] ECKE redesign complete and pulling live C2K data
- [ ] Billing tracking operational (even if invoicing is manual)

**Public launch is ready when:**
- [ ] Stable post-beta with no critical auth or data leak bugs for 30 days
- [ ] Following feed F2 and F3 complete
- [ ] ECKE advertising packages available for purchase
- [ ] Moderation AI triage integrated (or explicitly deferred with council bandwidth confirmed)
- [ ] Mobile PWA polished and documented for users
- [ ] Community policy published publicly
- [ ] Data handling and privacy policy published (Swiss hosting can be noted here when active)

---

## 17. Privacy and Data Handling

### Why This Community Has Heightened Privacy Needs
Kink community members face real-world consequences from being outed — job loss, custody disputes, family rupture, physical danger. This is not hypothetical. The platform must be designed with the assumption that every user's participation is sensitive by default.

### Privacy Defaults
- Profiles default to members-only visibility — not publicly indexed
- Real names are never required and never displayed publicly without explicit user action
- Location data is used for discovery features (nearby groups) but never displayed with precision publicly
- Participation in specific events is private by default — users opt in to "who's going" visibility per event
- DM conversations are never surfaced in any admin view without a formal council moderation action

### Data the Platform Collects and Why
- Email: required for account, used for transactional and digest email only
- IP at registration: stored as prefix for one-profile-per-IP enforcement, not for tracking
- Location: user-provided for discovery, stored at region level not coordinate level unless PostGIS geo features require it
- Event attendance: stored in `convention_access_grants` and `convention_registrants` — visible to org organizers for that event, not to other orgs

### What C2K Does Not Do
- Does not sell user data
- Does not build advertising profiles on members (ECKE advertising targets event/vendor categories, not individual user behavior)
- Does not share membership data with law enforcement without legal process — and even then, minimizes what is shared
- Does not retain data after account deletion beyond what is legally required

### Swiss Hosting (Future)
Swiss data residency is a planned future operational decision that will strengthen these commitments. It is not a current requirement for alpha or beta. When implemented, it will be documented publicly as a trust signal. Until then, standard GDPR-aligned practices apply regardless of server location.

---

## 18. Technical Debt — Ordered Payoff Plan

Work this list in priority order. Do not let Cursor tackle debt randomly.

### Tier 1: Before Alpha (Do These First)
1. **Redis pub/sub bridge for WebSocket** — before any multi-replica API deploy
2. **Rate limits on auth endpoints** — `POST /api/auth/session`, register, public subscribe endpoints
3. **Organizer permission audit** — every organizer query scoped by `convention.organization_id`; confirm org MODERATOR ≠ automatic command bridge access
4. **Mock/API boundary cleanup** — remove `VITE_HOME_DEMO_FALLBACK` from authenticated flows; new features API-only
5. **Prod mail sign-off** — `PROD_SMTP_K8S_CHECKLIST.md` before sending to real attendees
6. **PWA manifest and offline fallback** — before first org pilot
7. **Door panel mobile usability** — convention check-in is a phone workflow

### Tier 2: Before Beta
8. **`feed_activities` table + F1 write path**
9. **Notification type enum in `@c2k/shared`** — replace stringly typed strings
10. **Legacy string IDs** (`g1`, etc.) → UUID in demo/seed data
11. **`ecosystem-stubs.ts` header comment** — document what it actually contains
12. **ComingSoon routes** — remove from nav or fill; 14 placeholders is too many for a live product
13. **`syncConventionPeopleDirectory` to worker** — off the API hot path
14. **Moderation council workflow** — internal tooling for council to review and act on reports

### Tier 3: Before Public Launch
15. **Fan-out-on-write following feed** — when MAU approaches 100k
16. **Service layer extraction** — one domain per sprint, not a big refactor
17. **APM / observability** — Grafana, Prometheus, or Axiom before public traffic
18. **AI triage integration** — Claude API or equivalent wired into `c2k-moderation` queue
19. **E2E test coverage** — scope-email confirm, convention registration, hub push, check-in flow
20. **Billing tracking** — `convention_registrants` count per convention per month, exportable for invoicing

---

## 19. Frontend Rules

### Component Discipline
- All new pages are thin route files pointing to client components — no business logic in `page.tsx`
- API calls go through domain hooks — never raw `fetch()` in a component
- When adding a new domain, create `hooks/useApi[Domain].ts` before the page component
- State: AuthContext (session) + domain hooks (server data) + local `useState` (UI only) + `useSearchParams` (tabs/filters)

### Mock Layer Exit Strategy
- New features: API-only from day one, no mock path
- Existing mock paths: replaced as API routes mature
- Guest experience: unauthenticated public routes, not mock data

### Design System Rules
- `--c2k-*` CSS variables in `globals.css` — no hardcoded colors
- TipTap for all rich text — do not add a second editor
- Tailwind only — no CSS-in-JS, no styled-components
- `site.config.ts` for nav config — do not hardcode nav items in components
- Mobile viewport and touch targets required on all new components — especially organizer tools

### New UI Build Order
1. PWA manifest, offline fallback, mobile viewport audit
2. Door panel mobile usability pass
3. Following feed tabs on `/home` (Following | Discover)
4. Capability profile pages (presenter, vendor subprofiles first)
5. Cross-convention presenter directory
6. Kink Community Record / credential panel on profiles
7. Org-level vendor marketplace browsing
8. Editorial article publishing (author/journalist profile holders)

---

## 20. Partner API (Replacing "Federation" Language)

The platform will eventually need controlled, keyed read access for third parties. Call this the Partner API — not federation.

### What It Actually Is
Convention kiosk apps checking in attendees. Discord bots showing event schedules. External calendar sync. An org's custom mobile app pulling their own program data. All of these need a stable, versioned, org-scoped API surface.

### Build Order
**Layer 1 (build when first org asks for it):**
```
GET /api/v1/partner/conventions/:slug/program
GET /api/v1/partner/events/upcoming?org_slug=
```
- Auth: org-scoped API keys (the kit table `convention_api_keys` already exists — extend it)
- Read-only, public fields only — `display_name`, no email, no legal name
- Versioned independently from core app

**Layer 2 (post-beta, when needed):**
- Outbound webhooks for schedule changes (already in kit — document and expose)
- Registrant check-in endpoint for kiosk apps

**Layer 3 (do not build yet):**
- Cross-platform identity assertions
- Activity ingest from external systems

### Stable Export Keys
Never change these in partner API responses — treat as public contracts:

| Entity | Keys |
|---|---|
| User | `user_id` (UUID), `username` |
| Organization | `organization_id`, `slug` |
| Convention | `convention_id`, `slug` |
| Program slot | `schedule_slot_id`, ISO 8601 times |
| Participation | `(convention_id, user_id)` + `access_grant.role` |

Never export `convention_persons.id` as an identity key — it is a directory staging ID only.

---

## 21. What Cursor Must Not Do

| If Cursor Suggests | The Correct Response |
|---|---|
| "This feature requires a live mail server" | It requires Mailpit. Set `C2K_MAIL_TRANSPORT=smtp`, `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`. View sent mail at `localhost:8025`. |
| "Skip this feature until the server is set up" | The only genuine server blockers are DNS/DKIM and real org onboarding. Everything else is testable on Docker now. |
| "This can't be tested locally" | It can. Mailpit for email, MinIO for storage, Redis for queues, Mailpit VAPID for push on localhost. Run the smoke scripts. |
| "Add a `presenter_users` or `vendor_accounts` table" | Capability profile table referencing `user_id` only |
| "Add a `payments` or `transactions` table" | C2K never processes payments. `paidConfirmed` is an organizer-managed boolean flag only. |
| "Integrate Stripe into the registration flow" | Hard no. Orgs use their own external payment systems. C2K stores a `ticketing_url` only. |
| "Create a guest checkout flow" | No. Registration requires a C2K account. API rejects orphan registrant creates. |
| "Add a new forum system for [X]" | Extend the existing org/group forum pattern. |
| "Put notification/email/sync logic in the route handler" | Enqueue a named BullMQ job. Handle in worker. |
| "Merge hub channels into org channels" | Different auth rules. Keep separate. Do not merge. |
| "Add a Next.js app for the marketing site" | ECKE is the legacy SEO bridge. Kink Social is the SPA. No third runtime. |
| "Fetch ECKE auth/identity into C2K" | ECKE has no identity role. Outbound only. |
| "Build the Following feed before organizer features" | Following feed is Phase 2. Organizer completeness is Phase 1. |
| "Cache user/session data in localStorage" | Organizer prefs and saved views only. Never session or identity state. |
| "Add Redux or Zustand" | AuthContext + domain hooks. No external state library. |
| "Expose raw /api/ws scopes to external partners" | Partner API layer with org-scoped API keys. Not direct WS exposure. |
| "Use `convention_persons.id` as an identity key" | Never. Use `user_id`. `convention_persons` is a directory staging table. |
| "Add moderation ML inline in the route handler" | Enqueue to `c2k-moderation` queue. Worker handles it. AI analysis is a worker step. |
| "Change a WS scope string" | Stable client contracts. Treat as breaking change requiring migration. |
| "Build for the Apple App Store now" | Not a realistic near-term target. PWA first, Android native second, Apple later. |
| "Auto-resolve a moderation report with AI" | AI produces a summary for the council. Humans decide. AI never acts autonomously on reports. |
| "Store editorial articles as forum posts or feed posts" | Articles are a separate content domain with their own table when built. |

---

## 22. Session Startup Checklist for Cursor

At the start of every C2K session:

1. **Docker running?** `docker compose -f docker-compose.dev.yml up -d` — all four containers healthy before touching anything. `C2K_MAIL_TRANSPORT=smtp` pointing at Mailpit on port 1025. If mail feels broken, check this first.
2. **Phase?** Phase 1 (organizer tooling), Phase 2 (social/feed), or Phase 3 (portable identity)?
2. **Identity touch?** Does this write a person? `user_id` is the anchor. No new person tables.
3. **Permission layer?** Which of the 5 layers? Enforce at API level.
4. **Side effects?** Notification, email, sync, push → BullMQ job, not inline.
5. **New table?** Can this be a column, JSONB extension, or existing pattern row instead?
6. **Payments?** If this touches money in any way — stop. C2K does not process payments.
7. **ECKE touch?** Outbound publish only. No auth, no identity, no ingestion.
8. **WS impact?** Adding a REST visibility rule → update `authorizeWebSocketSubscribe` in the same commit.
9. **Notification type?** Register in `@c2k/shared` before using in a route.
10. **Hook pattern?** UI needs data → create `useApi[Domain].ts` first.
11. **Mobile?** Does this component need to work on a phone? Organizer tools especially.
12. **Moderation action?** AI summarizes, humans decide. Never autonomous resolution.

---

## 23. Competitor Analysis

**FetLife** owns the social graph but has zero operational tooling, no convention infrastructure, no vendor ecosystem, and an aging architecture. Their age-verification crisis in 2025 accelerated distrust among organizers specifically. They also systematically protect their platform from accountability discussions — C2K's open discussion policy is a direct and meaningful differentiator.

**Eventbrite/Universe** have ticketing but charge heavily and have no community features. Organizers hate the fees and the lack of attendee relationship continuity between events.

**Discord** has real-time comms but no event management, no identity portability, no presenter credentialing, no organizer console. It is the current default community hub — C2K replaces the need for a Discord server entirely.

**Sched.com** has convention scheduling but no community, no identity, no social graph. Used by some larger conventions but has no community stickiness.

**Nobody** has the full stack: organizer tools + community identity + vendor ecosystem + portable credentials + public SEO surface + open moderation philosophy. That is the gap. The window to establish organizer dependency before a well-funded competitor notices is measured in months, not years.

---

## Appendix A: Maturity Snapshot (2026-05-26)

| Layer | % Complete | Primary Blocker |
|---|---|---|
| API surface | 92% | Prod mount + staging mail sign-off |
| Event Systems organizer | 82% | People-directory worker queue (LOC-WORKER-SYNC); messaging campaigns |
| Web member UX | 68% | Guests-only demo fallback; 14 ComingSoon routes |
| Social home | 40% | `feed_activities` not built — **Phase 2** |
| Capability profiles | 15% | Vendor partial; presenter credits from schedule (LOC-PRES-CREDITS) |
| Portable identity | 0% | Design phase only — **Phase 3** |
| Partner API | 5% | ECKE outbound only; Layer 1 not started |
| Realtime (multi-replica) | 75% | **Shipped** — `C2K_REALTIME_REDIS_BRIDGE`; enable on multi-replica deploy |
| Moderation | 50% | Council workflow not built; AI triage not started |
| Infrastructure/Ops | 78% | Tier 1 eng done locally; **prod mail + pilot org** operator/product |
| PWA / Mobile | 30% | Manifest + door mobile pass (LOC-PWA, LOC-DOOR-MOBILE) |
| Privacy policy / Community policy | 0% | Draft locally; publish on prod |
| ECKE redesign | 0% | Waiting on C2K alpha |

**Overall alpha readiness: ~78–84%** (engineering Tier 1 local complete; prod mount + first real org remain)

**Local sprint:** [`docs/SERVER_CUTOVER_LOG.md`](./SERVER_CUTOVER_LOG.md) · active backlog [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) LOC-* rows

---

## Appendix B: Key File Reference

| What you're touching | File |
|---|---|
| Session auth | `packages/api/src/routes/auth.ts` |
| Viewer resolution (Layer 0) | `packages/api/src/auth/resolve-viewer.ts` |
| WS subscribe auth | `packages/api/src/lib/ws-subscribe-auth.ts` |
| Convention command access | `packages/api/src/lib/convention-command-access.ts` |
| Convention access (attendee) | `packages/api/src/routes/conventions-routes.ts` → `getConventionWithAccess` |
| Command permission types | `packages/shared/src/convention-command-permissions.ts` |
| Participation sync | `packages/api/src/lib/convention-participation.ts` |
| Core schema | `packages/api/src/db/schema.ts` |
| Organizer schema | `packages/api/src/db/convention-organizer-schema.ts` |
| Worker entry | `packages/api/src/worker.ts` |
| Realtime bus | `packages/api/src/lib/realtime-bus.ts` |
| Notification create | `packages/api/src/lib/create-notification.ts` |
| Web push send | `packages/api/src/lib/web-push-send.ts` |
| Mail | `packages/api/src/lib/mailer.ts` |
| Route entry | `packages/api/src/server.ts` |
| Web router | `packages/web/src/router.tsx` |
| Auth context | `packages/web/src/contexts/AuthContext.tsx` |
| Home page | `packages/web/src/app/home/HomePageClient.tsx` |
| Convention hub | `packages/web/src/app/conventions/[slug]/page.tsx` |
| Organizer shell | `packages/web/src/components/organizer/convention/ConventionDancecardOrganizerClient.tsx` |
| Design tokens | `packages/web/src/globals.css` (`--c2k-*`) |
| Nav config | `packages/web/src/config/site.config.ts` |
| ECKE publish | `packages/api/src/routes/ecke-publish-routes.ts` |
| Platform moderator | `packages/api/src/lib/platform-moderator.ts` |
| PWA service workers | `packages/web/public/sw-program.js`, `sw-push.js` |
| Live docs | `docs/MASTER_NEXT_STEPS.md`, `docs/HANDOFF.md`, `docs/FEATURE_REGISTRY.md` |
| Architecture docs | `docs/architecture/` (repo copy wins over external pack when they diverge) |

---

*Update this document at the end of any major architecture session. Repo copy lives at `docs/C2K-STRATEGIC-GUIDANCE.md`. When this pack and the repo diverge, the repo copy wins.*
