# C2K UI & experience context (for external AI design tools)

**Purpose:** Give ChatGPT, Claude, or other assistants a **single, dense briefing** on Coast to Coast Kink (C2K) so they can help with UI/UX without reading the whole monorepo.

**Last updated:** 2026-06-12 (pass 26 — UI-DISC done; prod profile social rail; VPS alpha)  
**Codebase:** `packages/web` (Vite + React Router), `packages/api` (Fastify + Postgres)  
**Do not treat this file as legal/product spec** — verify against `docs/FEATURE_REGISTRY.md` before implementation.

---

## How to use this document with GPT

1. Paste **§1–§4** first (product + users + shells + navigation).
2. Add **§5** for the area you are redesigning (e.g. only “Conventions attendee”).
3. Add **§7** (known UX debt) so the model does not “fix” things that are already planned differently.
4. Add **§8** (constraints) so proposals stay buildable.
5. Ask for: wireframe copy, IA changes, mobile-first layouts, empty/loading/error states, **not** new feature categories unless you explicitly want greenfield ideas.

**Companion docs (humans / deeper dives):**

| Doc | Use for |
|-----|---------|
| `docs/FEATURE_REGISTRY.md` | Every route + API prefix |
| `docs/C2K-STRATEGIC-GUIDANCE.md` | Phase gates, hard rejects |
| `docs/MY_FINDINGS_ON_USABILITY.md` | Recent audit + repro steps |
| `docs/WAYFINDING.md` | Tabs vs breadcrumbs vs back links |
| `docs/UI_DISCOVER_REFRESH_PROGRESS.md` | June 2026 discover shells + **`UI-DISC-*`** consolidation backlog |

---

## 1. What C2K is (product frame)

**Not:** a FetLife clone or generic social network first.  
**Is:** a **community operating system** for organized kink — **organizer-first**, with social layered on operational infrastructure.

| Layer | What users get | Examples |
|-------|----------------|----------|
| **Operational** | Orgs, conventions, registration, door check-in, program/schedule, dancecard | `/organizer/...`, convention hub, door mode |
| **Discovery** | Events, groups, vendors, education, places, people | `/events`, `/groups`, `/discovery` |
| **Social** | Feed, following, DMs, connections, notifications | `/home`, `/messaging`, `/connections` |
| **Reputation** | Trust score, references, presenter/vendor/org directories | Profiles, `/presenters`, `/orgs` |

**Competitive wedge:** workflow gravity (organizers depend on C2K for their event), not infinite-scroll engagement.

**Phases (what to prioritize in UI work):**

| Phase | Focus | De-prioritize in UI unless user overrides |
|-------|--------|-------------------------------------------|
| **1 — Alpha** | Event systems, door mobile, PWA, org onboarding | Following-feed polish before organizer gaps |
| **2** | `feed_activities`, richer following feed | — |
| **3** | Portable identity panel | — |

**Hard rejects for UI proposals:** Stripe checkout in registration, second forum stack, guest checkout, autonomous moderation UI, Apple-native app before PWA alpha.

---

## 2. Who uses the site (personas & modes)

### Personas

| Persona | Typical goals | Seed account (local dev) |
|---------|----------------|------------------------|
| **Attendee / member** | Find events, RSVP, convention schedule, DM, follow people | `RopeDreamer` / `demo` |
| **Organizer / org staff** | Run org hub, convention program, registration, door | `Brax` / `Airship!2` (also site admin) |
| **Presenter / educator** | Directory profile, offerings, long-form articles | `RopeDreamer` (articles on hub) |
| **Vendor** | Shop page, listings, external store link-out | `rope-dreamer-supply` (owned by RopeDreamer) |
| **Moderator / admin** | Reports queue, org moderation, platform admin | `Brax` → `/moderation/*` |

**QA trap:** Testing only as **Brax** shows organizer/admin views and hides attendee bugs (e.g. gated schedule). Use **RopeDreamer** for attendee flows.

### Auth modes (affects what UI shows)

| Mode | When | UI behavior |
|------|------|-------------|
| **Logged out** | No session cookie | Landing, login CTAs; home may show **mock** content if `VITE_HOME_DEMO_FALLBACK=true` |
| **Logged in + API** | `USE_DATABASE=true`, valid session | Real lists, feeds, settings |
| **Logged in + fallback** | Mock auth path | Demo data; not production shape |

After **DB reseed**, users must **sign out and sign in again** or feeds/messaging break (stale JWT user id).

---

## 3. Global layout shells (every page fits one)

Think in **shells**, not individual pages. Chrome repeats; only the main column changes.

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (sticky): logo, search (md+), Create, notif, msgs,   │
│                  account menu                                │
├─────────────────────────────────────────────────────────────┤
│ COMMUNITY NAV (signed-in only, most routes): one scroll row │
│   Following | Near you | Events | … | Find people | Orgs…   │
├─────────────────────────────────────────────────────────────┤
│ DEV BANNER (local only): "Signed in to your dev server"     │
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT (route-specific)                                │
├─────────────────────────────────────────────────────────────┤
│ BOTTOM NAV (mobile, signed-in): Home | Find | Create | Msg | Profile │
├─────────────────────────────────────────────────────────────┤
│ FOOTER (marketing; hidden on many mobile app routes)         │
└─────────────────────────────────────────────────────────────┘
```

### Shell variants

| Shell | Routes | Community nav? | Bottom nav? | Notes |
|-------|--------|----------------|-------------|-------|
| **Marketing** | `/`, legal, about | No | No | Hero + login/signup |
| **App — feed** | `/home` | Yes | Yes | Following vs discover modes |
| **App — directory** | `/events`, `/groups`, … | Often **hidden** on list pages (recent UX) | Yes | Full-width directory UX |
| **App — entity hub** | `/orgs/:slug`, `/groups/:id`, `/conventions/:slug` | Often hidden on discover lists | Varies | URL `?tab=` for sections |
| **App — profile** | `/profile`, `/profile/:user` | Yes today (crowding issue) | Yes | Owner vs public split |
| **Focused** | `/messaging`, `/settings/*`, `/profile/edit` | No | Messaging: yes | `100dvh` messaging |
| **Organizer** | `/organizer/*` | No | No | Sidebar / dancecard console |
| **Door** | `.../door` | No | No | Mobile kiosk, full viewport |
| **Moderation** | `/moderation/*` | No | No | Platform staff |

**Mobile constraint:** Target **44px min touch** (`min-h-touch` = 2.75rem). Bottom nav is **fixed 5 slots** — do not add a 6th without removing one.

---

## 4. Navigation model (critical for IA proposals)

### 4.1 Header (logged in)

- **Search** (desktop): submits to `/discovery?q=…`. Mobile: icon → `/discovery` only (no header field).
- **Create (+):** dropdown with 8 actions (see §4.4).
- **Notifications** bell → dropdown + `/notifications`.
- **Messages** → `/messaging` (badge from API; can lie if API fails — known bug).
- **Account:** profile menu → settings, activity, logout, role-specific links.

Config source: `packages/web/src/config/site.config.ts`

### 4.2 Community nav bar (signed-in)

**One horizontal row** (recently merged from two rows):

1. **Feed pills:** `Following` → `/home?mode=following` · `Near you` → `/home?mode=discover&tab=Local`
2. **Separator**
3. **Browse pills:** Events, Conventions, Groups, Vendors, Education, Media, Trending
4. **Find people** → `/discovery`
5. **Directory:** Organizations, Presenters, Places

**Problem to solve in design:** ~13 items, horizontal scroll, **scrollbar hidden** — Presenters/Places easy to miss on phone.

**Hidden on:** messaging, settings, profile edit, organizer, door, moderation, and **many directory list pages** (events, groups, education, conventions list, explore/discovery) per layout helpers in `community-nav.ts`.

### 4.3 Bottom nav (mobile, 5 slots)

| Slot | Label | Target |
|------|-------|--------|
| Home | Home | `/home` |
| Explore | Find people | `/discovery` |
| Center | Create | Opens **bottom sheet** (same 8 links as header) |
| Messages | Messages | `/messaging` |
| Profile | Profile | `/profile` (owner dashboard) |

**Not in bottom nav:** Notifications, Activity, Connections — reached via header/account.

### 4.4 Create menu (duplicate entry points)

| Label | Goes to |
|-------|---------|
| Make a post | `/home?tab=Local#home-feed-composer` |
| Make an event | `/events?create=event` |
| Make a group | `/groups` |
| Make a vendor shop | `/vendors/new` → onboarding |
| Make a convention | `/events?create=convention` |
| Make an organization | `/orgs/new` |
| Make an article | **Same hash as post** (duplicate) |
| Make a presenter profile | `/settings/ecosystem#presenter-catalog` |

**Design ask:** Collapse to ~5 items; avoid desktop dropdown covering profile hero.

### 4.5 Wayfinding patterns (use consistently)

| Pattern | When | Example |
|---------|------|---------|
| **`?tab=` URL** | Multi-section hubs | `/orgs/demo-east-collective?tab=Forums` |
| **`?mode=` on home** | Following vs discover | `/home?mode=following` |
| **Breadcrumbs** | Nested organizer context | Org → convention manage |
| **Back link** | Linear flows | Profile edit, article reader |
| **Standalone directory** | Canonical list pages | `/events` not only home tab |

Full rules: `docs/WAYFINDING.md`

---

## 5. Product areas — routes, purpose, UX notes

### 5.1 Home & feeds (`/home`)

**Two modes:**

| Mode | URL | Main content |
|------|-----|----------------|
| **Following** | `?mode=following` | Social feed: posts + activities from connections; filter chips (All, Posts, Photos, Video, Articles); composer |
| **Discover — Near you** | `?mode=discover&tab=Local` | Local feed posts + convention pins + sidebar “people you may meet” |
| **Discover — other tabs** | `?mode=discover&tab=Events` etc. | Grid/list for that entity type **or** link-out to standalone directory |

**Guest/mock:** Tab shell on home (Near you, Events, …) + Search link; no community nav until signed in.

**Data:** API `GET /api/v1/feed`, `GET /api/v1/feed/following` when DB on.

---

### 5.2 People & discovery

| Route | Purpose |
|-------|---------|
| `/discovery` | **Find people** — search, filters (gender, roles, geo UI), stream tabs (Recommended, Near you, New, Popular) |
| `/profile` | **Owner dashboard** — many tabs (About, ISO, events, etc.); “View as public” |
| `/profile/:username` | **Public profile** — About, ISO, Photos, References; trust sidebar |
| `/profile/edit` | Multi-section editor + onboarding wizard |
| `/connections` | Friends/requests; Message → `/messaging?user=` |

**Known UX debt:** Discovery country/city filters **do not filter** API; Near you distance uses **mock** geography. Trust score **differs** between `/profile` (mock 82) and `/profile/:user` (API 95) with misleading 19% bars on public profile.

---

### 5.3 Events (`/events`, `/events/:id`)

- **List:** Category chips, in-person/virtual, geo, date; **My agenda** sidebar (desktop).
- **Detail:** Tabs — Overview, Attendees, Vendors, Discussion, Safety; RSVP Going/Interested; host tools if permitted.
- **Create:** Query `?create=event` from Create menu.

**Discussion tab:** Reply UI shown without RSVP; API returns 403 — should gate in UI.

---

### 5.4 Conventions — attendee (`/conventions`, `/conventions/:slug`)

- **List:** Multi-day / hotel takeovers directory.
- **Hub tabs (URL `?tab=`):** Welcome, Documents, Announcements, Chat, ISO, Schedule, Dancecard, More — not all visible for every convention.
- **Schedule:** Day-grouped agenda; may be **locked** until registration/paid access (`publicProgramListing`, access grants).
- **Register:** `/conventions/:slug/register` — 3-step wizard (category, questions, policies).
- **Dancecard share:** `/conventions/:slug/dancecard/s/:token` — compare availability (public link).

**Seed slugs:** `preview-c2k-weekend`, `seed-demo-con-gated`, `seed-demo-con-program`

**Known UX debt:** Locked schedule copy says “RSVP anchor event” but access is **registration/grant**; no attendee breadcrumb on hub.

---

### 5.5 Organizations (`/orgs`, `/orgs/:slug`)

- **List:** Org directory with trust/reputation.
- **Hub (member-facing):** Overview, Calendar, Forums, Chat, About, … — **no Admin tab** on public hub; staff use **Organizer console**.
- **Seed:** `demo-east-collective` — forums, chat, calendar, moderation seed content.

**Chat vs DMs:** Org **Chat** is org-scoped channels (like Discord-lite), **not** `/messaging` inbox.

---

### 5.6 Groups (`/groups`, `/groups/:id`)

- **List:** Purpose categories, tags, geo, stream tabs (All, Near you, …).
- **Detail (API UUID):** Forums, Feedback, Events, Members — **no** mock-only Channels/Resources/Photos tabs.
- **Detail (legacy mock slug):** Extra mock tabs for demo only.

---

### 5.7 Vendors (`/vendors`, `/vendors/:slug`, onboarding)

- **List:** Category filters, product-forward cards (spotlight API), sort tabs.
- **Shop:** Banner, listings grid, external store CTA, reviews, policies.
- **Onboarding:** Wizard → publish shop.

**Note:** “Vending soon” **horizontal rail** is on **Home**, not vendor list page.

---

### 5.8 Education & media

| Route | Purpose |
|-------|---------|
| `/education` | Article hub (categories, search) |
| `/education/:slug` | Reader — sanitized HTML, embeds, series nav |
| `/education/write` | TipTap author editor; **list on hub** is opt-in (`listInEducation`) |
| `/education/series/:slug` | Series landing (e.g. kink-101) |
| `/media` | Podcast/video **link-out** directory (no hosting) |
| `/media/:slug` | Channel + episodes + outbound links |
| `/media/submit` | Submit channel for moderation |
| `/presenters` | Presenter directory |
| `/presenters/:username` | Teaching history, offerings, gallery, reviews |

**Media:** Often **empty after seed** — needs user submissions + mod approval.

---

### 5.9 Messaging, notifications, activity

| Route | Purpose |
|-------|---------|
| `/messaging` | DM inbox — folders Main/Requests/ISO; filters; split list/thread on mobile |
| `/notifications` | Notification list (API-backed when signed in) |
| `/activity` | Unified inbox (social + requests + messages preview) — **buried in profile menu** |
| `/saved` | Bookmarks (posts, articles, media, episodes) |

**Three chat concepts (do not merge in design copy):** `/messaging` (DMs), org/group **Chat** tabs, placeholder `/chat` redirect.

---

### 5.10 Places & tags

| Route | Purpose |
|-------|---------|
| `/places` | Community places (dungeons, venues); map/list |
| `/dungeons` | Redirect to places filter |
| `/tags/:tag` | **Mock only** — not production |

---

### 5.11 Organizer console (`/organizer/...`)

**Entry:** `/organizer` — cards for orgs/groups you can manage.

| Route | Purpose |
|-------|---------|
| `/organizer/orgs/:slug` | Org command bridge — schedule, people, communications, moderation, settings |
| `/organizer/orgs/:slug/conventions/:convSlug` | **Convention manager** (dancecard kit) — program, people, registrants, exports |
| `/organizer/.../door` | **Door mode** — mobile check-in, QR scan (HTTPS/localhost), large touch targets |
| `/organizer/orgs/:slug/events/:eventId` | Single-event manager (RSVP queue, matchmaker, link to convention program) |

**Two shells:** C2K `OrganizerAppShell` (org) vs dancecard `OrganizerEventShell` (convention) — different nav mental models.

**Convention tabs:** Often **in-component state**, weak deep links (design opportunity: URL tabs).

---

### 5.12 Moderation (`/moderation/...`)

Platform staff only (seed: `Brax` — `C2K_PLATFORM_MODERATOR_USER_IDS` / site admin).

| Route | Purpose |
|-------|---------|
| `/moderation` | Index |
| `/moderation/dashboard` | Overview |
| `/moderation/queues` | Queue list |
| `/moderation/cases` | Case list |
| `/moderation/cases/:caseId` | Case detail (media quarantine, actions) |
| `/moderation/reports` | Report intake backlog |
| `/moderation/profile-flags` | Profile review flags |
| `/moderation/actions` | Enforcement actions log |
| `/moderation/audit` | Audit trail |
| `/moderation/legal` | Legal/compliance tools |
| `/moderation/dmca` | DMCA workflow |
| `/moderation/admin` | Admin settings (e.g. identity ban — improve UX vs raw UUID) |

**Scoped mod (2026-06-06 alpha):** org / group / event / convention organizer tabs use unified **`ReportAction`** intake — same case model, scoped permissions. Not the platform shell above.

Org hub: `/organizer/orgs/:slug?tab=moderation`. Group/event/convention scoped mod on respective organizer surfaces.

---

### 5.13 Settings (`/settings/...`)

Vertical nav: Account, Profile hub, Privacy, Notifications, Activity feed prefs, Muted tags, Blocked, Payment history (stub), **Ecosystem** (presenter/vendor/org roles).

---

## 6. Design system (visual language)

**Config:** `packages/web/src/config/site.config.ts` (name, nav labels)  
**Tokens:** `packages/web/src/app/globals.css` — **`--dc-*`** primary (Midnight Brass / ECKE V2); legacy `--c2k-*` aliases retained

| Concept | Typical use |
|---------|-------------|
| **Surface** | Dark app background |
| **Elevated panels** | Cards, sidebars (`rounded-2xl`, soft border) |
| **Accent** | Gold/amber CTAs, active nav, links |
| **Text** | `dc-text`, `dc-muted`, `dc-text-muted` hierarchy |
| **Touch** | `min-h-touch` (44px) on primary controls |
| **Tab shell** | Pill tabs in rounded bordered container (`TabShell`) |
| **Cards** | Event, Person, Vendor, Group, Convention, Education article, Media channel |
| **Skeletons** | `dc-skeleton-bone` on some routes; `animate-pulse` elsewhere |
| **Empty states** | `EmptyState` with title, message, CTA |
| **Dialogs** | Shared `Dialog` / `ConfirmDialog`; organizer uses `OrganizerConfirmDialog` |

**Aesthetic:** Dark, community app — **not** generic purple-gradient SaaS. Organizer/door areas borrow dancecard (`dc-*`) density for power users.

**PWA:** `manifest.json`, service worker for offline hints on schedule — install UX minimal.

---

## 7. Known UX / usability debt (honest list for designers)

Prioritize fixing these before cosmetic polish:

### P0 — misleading or broken trust

- Public profile trust **95** with five **19%** bars (algorithm artifact).
- Owner `/profile` trust **82** vs public **95** for same user.
- Discovery geo filters **fake**; Near you uses mock map center.
- Gated convention schedule **wrong unlock instructions**.
- `/tags/:tag` is mock-only.

### P1 — navigation & chrome

- ~~**Discover refresh consolidation**~~ — **done 2026-06-06** (`UI-DISC-1`–`UI-DISC-6`); followups in [`UI_DISCOVER_REFRESH_PROGRESS.md`](./UI_DISCOVER_REFRESH_PROGRESS.md).
- Community nav **too dense**; hidden scroll.
- Create menu **8 items**, overlaps profile on desktop; post/article duplicate.
- Profile pages still show full community nav + dev banner + bottom nav (~200px chrome before content on phone).
- Header message badge can show **mock unread** when API fails.
- Activity hub hard to discover.
- Education publish defaults **off** hub listing.

### P1 — flows

- Event discussion reply without RSVP.
- Org chat send failures **silent**.
- Group forum composer for non-members.
- Platform vs org **moderation** confusion.

### P2 — polish

- Settings password/2FA “coming soon”.
- Registration wizard weak **back** navigation.
- Some `window.confirm` still in organizer gallery (not themed).
- Presenter directory highlights wrong community tab (Near you).

Full audit: `docs/MY_FINDINGS_ON_USABILITY.md`

---

## 8. Constraints for external AI proposals

**Do propose:**

- Mobile-first layouts, collapsible nav, “More” sheets, route-aware chrome hiding.
- Clear empty/loading/error states; session-expired messaging.
- Consistent `?tab=` deep linking on hubs.
- Attendee vs organizer **visual separation** (already partially separate shells).
- Copy that explains org chat vs DMs vs following feed.

**Do not propose (without explicit approval):**

- Stripe / paid registration checkout UI.
- Second messaging or forum system.
- Feed-first home that demotes events/conventions.
- Native iOS/Android app chrome before PWA.
- Autonomous AI moderation actions.
- Hosted podcast/video player (media is **link-out** only).

**Data / tech assumptions:**

- Single `users` identity; permissions: Platform → Org → Group → Convention → Resource.
- API-first when `USE_DATABASE=true`; mock only for guests/dev flag.
- Side effects (email, push) via workers — not inline in UI flows.

---

## 9. Suggested GPT prompts (copy-paste)

**Navigation density (mobile):**  
> Using §3–§4 of the C2K UI context doc, redesign the signed-in community nav for 390px width: max 6 visible pills, rest in a “More” bottom sheet. Keep Following and Near you always visible. Do not add a 6th bottom-nav item.

**Convention attendee hub:**  
> Using §5.4 and §7, propose a convention hub IA for `/conventions/:slug` with URL tabs, attendee breadcrumb (Conventions → name), and a single clear locked-state for Schedule when registration required. Mobile-first.

**Profile trust UI:**  
> Using §5.2 and §7 P0, redesign the public profile trust sidebar so a score of 95 never shows five identical 19% bars. Prefer hiding dimension bars until real segment data exists.

**Create menu:**  
> Using §4.4, collapse 8 create actions into 5 with grouped “Content” vs “Organize” vs “Commerce”. Same list for header dropdown and mobile sheet.

---

## 10. Route index (quick lookup)

| Area | Primary routes |
|------|----------------|
| Landing | `/` |
| Home | `/home`, `/home?mode=following`, `/home?mode=discover&tab=*` |
| People | `/discovery`, `/profile`, `/profile/:user`, `/profile/edit`, `/connections` |
| Events | `/events`, `/events/:id` |
| Conventions | `/conventions`, `/conventions/:slug`, `.../register`, `.../dancecard/s/:token` |
| Orgs | `/orgs`, `/orgs/new`, `/orgs/:slug` |
| Groups | `/groups`, `/groups/:id` |
| Vendors | `/vendors`, `/vendors/onboarding`, `/vendors/:slug` |
| Education | `/education`, `/education/:slug`, `/education/write` |
| Media | `/media`, `/media/submit`, `/media/:slug` |
| Presenters | `/presenters`, `/presenters/:username`, `/presenters/onboarding` |
| Social | `/messaging`, `/notifications`, `/activity`, `/saved` |
| Places | `/places` |
| Organizer | `/organizer`, `/organizer/orgs/:slug`, `.../conventions/:conv`, `.../door` |
| Moderation | `/moderation`, `/moderation/cases`, `/moderation/reports`, `/moderation/dmca` |
| Settings | `/settings/account`, `.../privacy`, `.../ecosystem` |
| Legal | `/privacy`, `/terms`, `/guidelines` |

---

## 11. Local demo URLs (for screenshot-driven design)

After `npm run db:prepare` and login:

| What | URL |
|------|-----|
| Home following | http://127.0.0.1:5173/home?mode=following |
| Home near you | http://127.0.0.1:5173/home?mode=discover&tab=Local |
| Find people | http://127.0.0.1:5173/discovery |
| Events | http://127.0.0.1:5173/events |
| Convention | http://127.0.0.1:5173/conventions/preview-c2k-weekend |
| Org hub | http://127.0.0.1:5173/orgs/demo-east-collective |
| Vendor shop | http://127.0.0.1:5173/vendors/rope-dreamer-supply |
| Education | http://127.0.0.1:5173/education |
| Media | http://127.0.0.1:5173/media |
| Messaging | http://127.0.0.1:5173/messaging |
| Organizer | http://127.0.0.1:5173/organizer/orgs/demo-east-collective |
| Door | http://127.0.0.1:5173/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend/door |
| Public profile (Brax) | http://127.0.0.1:5173/profile/Brax |

---

*This document is the handoff pack for external UI assistants. Update it when major IA or shell changes ship.*
