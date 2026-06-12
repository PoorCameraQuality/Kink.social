# Social graph — FetLife parity backlog (screenshot capture)

**Last updated:** 2026-06-06 (Phase 2 — defer until `UI-DISC-*` per [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) Track C)

**Status:** Planning backlog only — **not implemented**  
**Captured:** 2026-05-26 — batches 1–2; **2026-05-27 — batch 3**; **2026-05-28 — batch 4**; **2026-05-29 — batch 5**; **2026-05-30 — batch 6**; **2026-05-27 — batch 7** (fetish.com browse/discovery IA — selective)  
**Product phase:** **Phase 2** per [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) — after Tier 1 organizer pilot unless explicitly prioritized  
**Companion:** [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) (Following feed / `feed_activities`); this doc is the **broader social surface** beyond home IA.

---

## Intent

C2K is **not** cloning FetLife branding, copy, or legal posture. We **do** need comparable capability so members and organizers do not feel they are giving up baseline social tooling when they adopt C2K for events.

Every row below is **needs implementation** unless noted as partial. Implementations should be **De-Fetlifed** (C2K vocabulary, permission layers, worker/notification rules) while matching the **user-visible behavior** described.

---

## How to use this doc

| Column | Meaning |
|--------|---------|
| **ID** | Stable backlog key (`SG-###`) for queue / PR references |
| **C2K today** | What exists now (if anything) |
| **Target** | What “done” means for parity |
| **Depends on** | Schema or vertical that must exist first |

Do **not** add parallel tables for the same noun — extend `connections`, `events`, `feed_posts`, `notifications`, group forums, etc. per [extend-before-add](../.cursor/rules/extend-before-add.mdc).

---

## Shipped

### Pre-launch Wave 1 (2026-05-27)

| ID | Feature | Notes |
|----|---------|--------|
| **SG-033** | Member since on profile | `GET /api/profile/:username` → `user.memberSince` (month/year); public profile header |
| **SG-031** | Copy link overflow menus | `CopyLinkOverflowMenu` on feed posts, events, groups, activity cards |
| **SG-137** | Connection RSVP avatars on EventCard | `connectionRsvpPreview` on `GET /api/v1/events` (list + detail); up to 3 avatars + overflow |
| **SG-082** | Calendar export (community events) | `GET /api/v1/events/:eventId/calendar.ics`; Google Calendar + webcal subscribe + `.ics` on event detail |
| **SG-138** | Group discovery grid enrichment | `/groups` cards: cover, category pill, description snippet, member avatar stack + count |
| **SG-015** | Close / reopen RSVPs | `events.rsvpOpen`; host `PATCH` + organizer panel; attendee closed state |

### Pre-launch Wave 2 (2026-05-27)

| ID | Feature | Notes |
|----|---------|--------|
| **SG-105** | Event type filters + My agenda | `/events` multi-select category chips (SG-080), In-person/Virtual toggle, geo + date filters; signed-in **My agenda** sidebar via `GET /api/v1/events/me/rsvps`; API list filters `?format=` + `?category=` |
| **SG-085** | Bookmarks (read later) | `user_bookmarks` table; `GET/POST/DELETE /api/v1/me/bookmarks`; **Saved** page `/saved`; **Bookmark** in feed post overflow (`CopyLinkOverflowMenu` + `LocalPostCard`) |
| **Create group** | Public group creation | `POST /api/v1/groups` + **`CreateGroupModal`** on `/groups` (was disabled “Coming soon”) |
| **Organizer spacing** | Console layout polish | `OrganizerAppShell` gap/padding pass — sidebar + main column rhythm on org/group/convention shells |

### Wave 1 Local meantime (2026-05-27)

| ID | Feature | Notes |
|----|---------|--------|
| **SG-120** | RSVP **Interested** label | `RSVP_LABEL_INTERESTED` in `@c2k/shared/rsvp-labels`; attendee UI + organizer copy use **Interested** (DB/API value stays `maybe`) |
| **SG-138** | Group settings follow-up | `PATCH /api/v1/groups/:groupId` accepts `category` + `description`; **`GroupSettingsPanel`** on `/organizer/groups/:id` settings tab |
| **UX B2** | Org hub staff hint | Non-staff note on org hub tabs: “Staff tools appear when you're added as staff.” (`OrgHubClient` tab footer) |
| **UX N1** | Messaging surfaces QA guide | [`QA_TESTER_GUIDE.md`](./QA_TESTER_GUIDE.md) § N1 — DMs vs `/chat` vs org Chat (E1/M1 shipped prior) |

### Wave 2 Local meantime (2026-05-27)

| ID | Feature | Notes |
|----|---------|--------|
| **SG-130** | Connections who appreciated | `post_likes` table; `POST` / `DELETE /api/v1/feed/posts/:postId/like`; feed list enriches `likeCount`, `likedByViewer`, **`connectionLikerPreview`** (up to 3 connection avatars, most recent first); **`LocalPostCard`** Love toggle + preview strip |
| **SG-084** | Mute interest tags (feed) | **`GET` / `POST` / `DELETE /api/mutes/me`** (`kind=TAG`); Settings → **Hidden interest tags** list + unmute (`useApiMutedTags`); Following + Near you feeds filter posts matching muted tag mentions (`muted-tags.ts`) |
| **Profile photos** | API-first gallery | `profile_photos` table; **`GET` / `POST` / `PATCH` / `DELETE /api/profile/me/photos`**; public **`GET /api/profile/:username`** includes `photos`; **`useProfilePhotos({ apiBacked: true })`** on own profile (no localStorage when DB-backed) |

### Wave 3 Local meantime (2026-05-27)

| ID | Feature | Notes |
|----|---------|--------|
| **SG-093** | Event story cards in Following feed | **`EventFeedStoryCard`** in **`ActivityFeedCard`**: type badge + actor line, hero image, datetime, city/virtual; inline **`PUT /api/v1/events/:id/rsvp`** — **Going** / **Interested** (SG-120 label); respects **`rsvpOpen`**; **`CopyLinkOverflowMenu`**; verbs `event_created` / `event_rsvp` |
| **G304** | API UUID group tab gating | **`groupCommunityTabs`** in **`GroupCommunityShell`**: mock slug groups keep **Channels/Resources/Photos**; UUID API groups show **Forums/Feedback/Events/Members** only |

### Wave 3C — placeholder / legal UX (2026-05-27, registry pass 14)

| Item | Notes |
|------|--------|
| **`/community` redirect** | Legacy footer/nav link → **`/groups`** (live discovery) |
| **ComingSoon live links** | **`ComingSoonLayout`** **Explore live features** strip → `/events`, `/groups`, `/home`; per-page primary CTAs on `/about`, `/contact`, etc. |

### Four-phase plan Phase 4 slices (2026-05-27)

| ID | Feature | Notes |
|----|---------|--------|
| **SG-080** | Event category enum | `@c2k/shared/event-categories`; API validation on events POST/PATCH |
| **SG-081** | Author / Moderator badges | `ForumPostRoleBadges` on org + group forums |
| **SG-087** | Thread lines | `forum-thread.css` + depth map (depth 2+ when API adds `parentId`) |
| **SG-096** | Join group rules modal | `groups.rules` JSONB + `GroupJoinRulesModal` |
| **SG-121** | Feed type filters | Photos / Video / Articles tabs on Following feed |
| **SG-134–136** | Browse geo + featured | `GeoFilterControl`, `events.featured` / `featured_until`, EventCard pill |

Remaining **SG-*** rows stay backlog until explicitly prioritized.

---

## A. Graph & requests (follow / friend / block)

| ID | Reference (FL) | Feature | C2K today | Target (De-Fetlifed) | Depends on |
|----|----------------|---------|-----------|----------------------|------------|
| SG-001 | 2026-03-05 | **Unfriend without unfollowing** | `connections` accept/decline only; no separate follow edge | On disconnect, modal: “Remove connection” + optional **“Keep following”** so one-way follow survives mutual unlink | Follow model distinct from `connections` (or explicit connection `kind`) |
| SG-002 | 2026-03-03 | **Ignore follow requests** | No `ignored` request state | **Ignore** on incoming follow/connection requests → hidden list, **no notification to requester**; **Undo** restores to inbox; bulk ignore/accept | Requests inbox + `connection`/`follow_request` status enum |
| SG-003 | 2025-10-23 | **Search blocked members** | Blocks exist in product areas; no searchable blocked list UX called out in registry | Settings → Blocked: search by nickname, sort, **Unblock** per row, “blocked N ago” | `user_blocks` (or equivalent) + settings UI |
| SG-004 | — | **Follow vs friend semantics** | `connections` ≈ friend request | Document and enforce: **connection** (mutual workflow) vs **follow** (one-way, feed audience) — required for SG-001/002 | Product decision in §B of [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) |
| SG-119 | 2024-03-19 | **Approve new followers** | No follower-approval privacy mode | Settings: **New followers must be approved**; pending **Follow requests** queue (accept/reject, accept all, dismiss all); your posts **hidden from their feed** until accepted | SG-004 follow model; extends SG-002 inbox |
| SG-131 | 2023-12-21 | **Mute member (soft hide)** | `mutes` table (`USER`/`GROUP`/`TAG`); no member-mute UX | **Mute** on profile/feed ⋯: hide member’s posts/comments/appreciations in **your** feed; **no notification** to them; does not unfollow/block; **Muted** list in settings + **Unmute** | `mutes` `USER` kind; distinct from SG-084 tag mute |
| SG-091 | 2022-07-27 | **Blocks in group discussions** | Platform blocks exist; forum visibility may not respect block graph | In **group/org forums:** blocked users cannot see each other’s threads/comments; **group moderators** still see all for moderation; **leader/organizer announcement** posts remain visible to members even across blocks | Block resolver scoped to `forum_*` + tests with SG-011 patterns |

---

## B. Events (community events / munches — not convention command bridge)

Convention/Event Systems organizer tools stay separate; these rows are **social `events`** (`ecosystem-stubs` / group events) unless noted.

| ID | Reference (FL) | Feature | C2K today | Target | Depends on |
|----|----------------|---------|-----------|--------|------------|
| SG-010 | 2026-03-13 | **Event co-hosts** | Single organizer on events | Invite co-hosts from connections; accept/decline via **Requests**; co-host can edit event, RSVPs, discussions, invite more co-hosts | `event_co_hosts` or role rows on `events` |
| SG-011 | 2026-03-13 | **Co-host block rules** | N/A | **Organizer’s** block list gates event visibility; blocks between co-hosts/attendees **do not** hide event content inside the event context | Block resolver scoped by resource |
| SG-012 | 2026-02-08 | **Public event privacy tier** | Partial: convention `publicProgramListing`; munch RSVP visibility fields | **Public** event URL: logged-out users see title, tagline, type, schedule, city/region/country, description, non-NSFW image, dress code, price — **not** attendee list, organizer identity, street address, discussions | [`adr/003-irl-event-location-privacy.md`](./adr/003-irl-event-location-privacy.md) alignment |
| SG-013 | 2026-02-08 | **Members-only & private tiers** | Org/convention visibility patterns | **Members-only** (signed-in) vs **Private** (invite/RSVP gate) on same event model | SG-012 |
| SG-014 | 2026-01-23 | **Readable event URLs** | Numeric/slug IDs on some routes | `/events/YYYY/MM/DD/event-name-shortid` with **legacy ID redirect** | Slug generator + router |
| SG-015 | 2025-08-14 | **Close / reopen RSVPs** | Open RSVP by default | Organizer **⋯** menu: Close RSVPs / Reopen; attendee UI shows closed state | `events.rsvpOpen` or status flag |
| SG-120 | 2024-03-26 | **RSVP “Interested” label** | DB enum `maybe`; UI may say “Maybe” | Attendee-facing label **Interested** (not “Maybe going”); maps to `event_rsvp_status.maybe`; copy explains curiosity/promotion without commitment | UI + i18n only unless enum rename approved |
| SG-122 | 2024-03-13 | **Organizer RSVP notifications** | Partial notification prefs | Organizers get **in-app + push** when someone RSVPs or changes status; grouped by event (“8 going · 6 interested”); show **Interested → Going** transitions | Register `event_rsvp` notification type; BullMQ after RSVP commit |
| SG-080 | 2022-08-30 | **Event category taxonomy** | `events.category` free text (`Munch`, `Workshop`, …) | Organizer picks **one** structured category on create/edit: **Educational** (class, demo), **Social** (munch, slosh), **Play party** (dungeon/fetish party), **Sex-positive party** (swingers, etc.), **Conference / festival**; powers **Explore → Events** filters | `event_category` enum or curated list + migration from legacy strings |
| SG-082 | 2023-01-10 | **Add to personal calendar** | **Partial:** `GET …/conventions/:key/program.ics` for convention program | On **community event** detail: **Add to calendar** → download `.ics` (Google/Apple/Outlook); include title, start/end, timezone, location per privacy tier (see ADR 003) | ICS builder for `events` rows; not only conventions |
| SG-093 | 2023-07-21 | **Event cards in activity feed** | `feed_activities` for events; home shows compact event cards | **Large event story** in Following/Discover: type label, title, datetime, city; **inline RSVP** (Going/Maybe); **Appreciate**, comment, **Save** on same card — no navigation required for RSVP | `feed_activities` verb `event_created` / RSVP API; SG-085 for Save |
| SG-105 | 2023-11-22 | **Event type filters + My agenda** | `/events` discovery partial; `category` string only | **Events** page: multi-select **event type** chips (SG-080); **In-person / Virtual** toggle; location + radius; **My agenda** shortcut (organizing + RSVP’d); social proof “N connections RSVP’d” | SG-080 enum; events list API filters |
| SG-136 | — | **Featured event badge (discovery)** | No organizer “feature this event” flag | Org/group hosts can mark an event **Featured** for local/discovery grids (curated, not paid bump); green **Featured** pill on card image | `events.featuredUntil` or org spotlight config |
| SG-137 | — | **Connection RSVP avatars on event cards** | SG-105 mentions social proof; not on cards | Browse/event cards: up to **3** connection avatars who RSVP’d + “+N”; most recent first | Graph join on `event_rsvps` |
| SG-111 | 2023-11-13 | **Event cover image** | Event cards may lack hero image | Upload + **crop** cover on create/edit (Settings → General); shows on cards, feed stories (SG-093), share OG | `events.coverMediaId`; reuse upload pipeline |
| SG-112 | 2023-09-13 | **Event discussions (announcements)** | Partial / stub threads on events | **Discussions** tab on event: organizer posts + member replies per privacy tier; **Appreciate**, comment, **Save**, share; public vs RSVP-gated visibility | Extend event discussion entity; SG-023 images |
| SG-113 | 2023-09-29 | **Subscribe to event discussion updates** | RSVP notifications partial | **Bell** on event: subscribe/unsubscribe to new discussion posts **without** changing RSVP; auto-subscribe on RSVP; request-only events after approval; prefs in notification settings | `event_discussion_subscriptions`; register notification type |

---

## C. Content creation & media

| ID | Reference (FL) | Feature | C2K today | Target | Depends on |
|----|----------------|---------|-----------|--------|------------|
| SG-020 | 2025-12-17 | **Rich editor — writings** | TipTap on some surfaces; not unified | WYSIWYG: bold/italic/strike, link, heading, lists, indent; **inline images** without pre-uploading to gallery | Media upload + post body model |
| SG-021 | 2026-02-16 | **Rich editor — group discussions** | Group forums vary by scope | Same editor stack as SG-020 on **group posts** | SG-020, org/group forum routes |
| SG-022 | 2025-10-08 | **Pictures on status updates** | `feed_posts` kinds include `status` | Up to **5 images** per status; images **not** auto-added to profile gallery; consent attestation before post | `feed_posts` + media join table |
| SG-023 | 2025-11-03 | **Pictures on event discussions** | Event discussion threads partial / stub | Up to 5 images per event discussion post + consent step | Event discussion entity |
| SG-024 | 2025-11-08 | **Safe mode (blur media)** | No global safe mode | User toggle: blur all images/video in feed/profile; **per-device** + optional **all devices** sync | `user_settings` + CSS/component wrapper |
| SG-025 | 2025-10-23 | **Avatar first in gallery** | Profile + gallery exist | Current avatar pinned as **first** tile in member picture gallery with badge | Gallery ordering rule |
| SG-026 | 2025-05-15 | **Multi-picture upload (picture sets)** | Single-file uploads in places | Upload up to **10** images → auto **picture set**; captions/tags/tagged people; consent; carousel (swipe/arrows/dots) | Media album model |
| SG-027 | 2025-06-09 | **Set picture set as avatar** | Avatar from profile edit | **Set as avatar** on set options + **“Use first picture as avatar”** on upload | SG-026, avatar field on `users` |
| SG-095 | 2023-07-06 | **Longer status updates** | Composer limits vary / undocumented | Configurable **`STATUS_POST_MAX_CHARS`** (product default ≥ 500); live counter in composer; no “kinky mind” placeholder — neutral **Share an update** | `feed_posts` validation + shared constant in `@c2k/shared` |
| SG-106 | 2023-10-13 | **Photo albums** | Gallery + SG-026 picture sets backlog | Named **albums** (title, description, cover); add from gallery or on upload; member fair cap (e.g. **10** albums — no paid-tier split) | Extend SG-026 `media_albums` model |
| SG-107 | 2023-11-16 | **Album batch edit** | Single-image actions only | **Update album** mode: multi-select add/remove; summary “N added, M removed”; **Save** once | SG-106 |
| SG-108 | 2023-11-10 | **Album cover & edit UX** | N/A | **Set as album cover** on photo ⋯ menu; **Edit album** modal (not full page); album name in photo header breadcrumb; linkify URLs in description; album share in feed **hides** muted-tag thumbnails (SG-084) | SG-106, SG-084 |
| SG-132 | 2023-12-14 | **Album manual order** | Gallery sort by date only | **Re-order** mode: drag-and-drop photos/videos in album; **Save** persists `sortOrder` | SG-106 |
| SG-133 | 2023-12-07 | **Album social actions** | Per-photo actions only | On **album page:** **Appreciate**, **Save**, **Share** (SG-115) with counts; comments on album optional | SG-106, SG-085, SG-115 |
| SG-109 | 2023-09-11 | **Pin gallery photos (≤3)** | SG-025 avatar-first only | Pin up to **3** gallery images to top; order = last-pinned first; **Pin** / **Unpin** on photo ⋯ | `media.pinnedAt` + sort |
| SG-117 | 2023-08-03 | **Markdown in status posts** | Plain text / limited HTML | Status composer: **bold**, *italic*, ~~strike~~, lists, blockquote; safe render + linkify; help link to syntax | Shared markdown subset with SG-020 where possible |

---

## D. Profile, sharing, discovery

| ID | Reference (FL) | Feature | C2K today | Target | Depends on |
|----|----------------|---------|-----------|--------|------------|
| SG-030 | 2025-11-10 | **Profile QR code** | Share profile via URL | **Share profile** → modal QR, copy link, download PNG; C2K branding not FL fox | `/profile/:username` canonical URL |
| SG-031 | 2025-08-10 | **Copy link (in-app)** | Share via browser sometimes only | Overflow menu on posts/events: **Copy link** to clipboard without leaving app/PWA | Deep links per object type |
| SG-032 | 2025-03-24 | **Username profile URLs** | `/profile/[username]` exists | Canonical `@username` URLs for profile + media/writings; **numeric ID redirects**; old username → new for **60 days** then reclaimable | Username change policy |
| SG-033 | 2025-02-21 | **Join date on profile** | Partial account metadata | Show **member since** (month/year) on public profile | `users.createdAt` display |
| SG-034 | 2025-02-21 | **Private profile notes** | Not surfaced | Viewer-only note on another member (“add note”) — **never visible to subject** | `profile_private_notes` or settings JSON |
| SG-035 | 2025-04-30 | **Favorites tab (self only)** | No favorites list | Private **Favorites** tab on own profile: sort, search, capacity limit (e.g. N max), quick unfavorite / follow actions | `user_favorites` edge |
| SG-036 | 2025-05-07 | **Non-sequential public member IDs** | UUID/internal ids | Public-facing member # is **non-sequential** (no scrape-by-increment); display optional alongside join date | ID generation policy |
| SG-056 | 2025-05-26 | **Places → writings discovery** | Location discovery partial (`/discovery`, home rails) | **Places** hub tabs: Everything, People, Events, **Writings**, Lists, Groups; **Places override** in privacy opts out | Geo index on posts + privacy flags |
| SG-084 | 2023-02-13 | **Mute interest tags (feed)** | `mutes` table exists (`USER`/`GROUP`/`TAG` kinds); no feed settings UX | **Activity feed settings:** list of **muted tags**; posts with those tags hidden from **Following** and **Near you**; mute from tag page **⋯** menu | Tag index on `feed_posts`; extend [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) filters |
| SG-085 | 2023-02-24 | **Bookmarks (read later)** | Not implemented (distinct from SG-035 member favorites) | Save **posts, articles, group threads** to **Saved** page; **⋯** on feed/profile/explore: Bookmark / Remove | `user_bookmarks` polymorphic `(object_type, object_id)` |
| SG-086 | 2023-03-14 | **Romantic orientation (profile)** | `profiles.sexuality` single field only | Up to **5** tags: **sexual** and **romantic** orientation pickers (separate lists); drag to reorder; display with privacy | JSONB array or join table |
| SG-088 | 2023-03-22 | **Multiple genders (profile)** | Single `profiles.gender` varchar | Up to **3** gender tags, searchable dropdown, **drag reorder**; first tag drives optional compact badge on header | Extend `gender` + `fieldVisibility` |
| SG-090 | 2023-03-23 | **Pronouns (profile)** | Single `profiles.pronouns` string; convention registrants separate | Up to **3** pronoun sets, searchable suggestions, drag reorder; show on profile + cards | Ordered array in profile JSONB |
| SG-098 | 2023-05-22 | **Who can tag you (privacy)** | No tag-request privacy tier | Settings → **Requests:** “Who can tag me in photos?” — **Everyone** / **Connections only** / **Connections of connections**; filters tag picker search; **new requests only** (no retroactive revoke of pending) | `user_settings` + tag API |
| SG-099 | 2023-05-09 | **Highlight when you’re @mentioned** | `mentions` on posts; no viewer-specific styling | When **viewing** a thread, your `@handle` renders with distinct **mention-you** style (accessible contrast, not FL yellow-only) | Comment/post renderer |
| SG-100 | 2023-05-05 | **Organization identity on profiles** | **Orgs are separate entities** (`organizations` table) — not FL “convert user to org” | **Do not** add personal→org conversion. Ensure **org pages** show **Organization** badge, hide age/gender/orientation, and link from member profiles only as **staff/affiliation** — extend existing org profile, not second org type | Orgs product model (extend-before-add) |
| SG-101 | 2023-05-02 | **Tag requests inbox** | Reports exist; no media tag approval queue | **Requests** hub tab: pending **photo/video tags** with thumbnail; **Accept** / **Decline**; badge count **sums** connection + tag requests; accepted tags may emit `feed_activity` | `media_tag_requests` or polymorphic `requests` |
| SG-102 | 2023-04-27 | **Save on content detail** | SG-085 backlog only | On **post/article/media detail:** **Save** icon in primary action row (beside Appreciate + Comment); overflow menu on feed cards until promoted | SG-085 UI pass |
| SG-103 | 2023-03-30 | **Expanded identity taxonomy** | Kink tags seeded; profile gender/orientation/role not multi-tag | Searchable taxonomies for **gender** (≤3), **orientation** (≤5), **roles** (≤5) including expanded list (e.g. service top, rope switch); type-to-search reveals full catalog | Shared vocab in `@c2k/shared` + seed; SG-086/088 |
| SG-104 | 2023-12-05 | **Global search — articles & media** | People search + `discoverableInPeopleSearch`; writings not in global search | **Search** indexes public **articles**, photos, video for non-connections when author opts in; per-type toggles: Photos / Videos / Articles; tag-based discovery | Search index + `user_settings.searchVisibility` |
| SG-134 | — | **Unified Browse hub + filter sidebar** | `/discovery`, `/events`, group lists are separate; `CommunityNavBar` partial | **Browse** surface (or shared layout): left rail switches **People / Events / Groups / Places / Media** without losing filter state; right pane = card grid; complements SG-097 Discover menu | [`design/04-NAVIGATION_AND_IA.md`](./design/04-NAVIGATION_AND_IA.md) |
| SG-135 | — | **Shared geo filter (city + radius slider)** | Discovery has distance; radius UX inconsistent | Reusable **Country → City → Radius** control (mi/km toggle) on People, Events, Groups, Places browse; persists in session/localStorage | `places-seed` + geo index |
| SG-139 | — | **Community places directory** | `/places` = picker only; `/dungeons` placeholder | **Places** browse: category chips (**Dungeon / club**, **Nude beach**, **Kink-friendly hotel**, **Web resource**, …); card grid; **Suggest a place** → moderation queue; distinct from ADR 003 event address privacy | Extend places model; do not duplicate `convention_locations` |
| SG-140 | — | **Community place ratings** | No venue rating surface | Optional aggregate **rating** on place cards (member submissions + report); show on card footer; org-linked venues can show org reputation instead | `place_ratings` or reviews pattern |
| SG-141 | — | **People discovery sort tabs** | `/discovery` limited sort | Sort tabs: **Nearest**, **Last active**, **Newest members** — no pay-to-bump “rise up” | `GET /profiles` sort params |
| SG-142 | — | **Online now indicator** | `/online` route is ComingSoon | Small **online** dot on profile cards when member active within N minutes; respect **hide online status** privacy | Presence heartbeat or last-seen |
| SG-143 | — | **New member badge** | No signup-age badge | **New** pill on profiles for first **30 days** (configurable); optional user opt-out in privacy | `users.createdAt` |
| SG-144 | — | **People browse filter toggles** | Partial filters on `/discovery` | Checkboxes: **Has photo**, **Online now**, **Verified only**, **Looking for** (respects profile prefs) | Extend discovery API queries |
| SG-145 | — | **Home discover content-type sidebar** | Home modes via query params | Signed-in home/discover: left column **content-type** pills (Near you, Events, Groups, Photos, Articles) filtering the main rail — not a second global nav | [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) §2 |
| SG-146 | — | **Curated spotlight rail (not paid)** | Org `spotlightGroupId`; no discover rail | Horizontal **Spotlight** strip on Browse/Discover: staff- or org-curated **presenters / vendors / orgs** — never pay-to-win member promotion | Org community spotlight + admin curation |
| SG-110 | 2023-10-27 | **Pin one article on profile** | No pinned post | **Pin** one `article` to top of profile **Articles** tab; **Pinned** badge; ⋯ → Pin / Unpin | `feed_posts.pinnedAt` unique per author |
| SG-116 | 2023-08-07 | **@mention autocomplete (all composers)** | `mentions` on posts; autocomplete partial | `@` picker on: status, photo/video caption, articles, group/org forum, **event description**; avatar + handle in dropdown | Shared `MentionInput` component |
| SG-124 | 2024-03-12 | **Article collections** | No grouped articles | **Collections** for `article` posts: title, description, cover, manual order, pin one (SG-110); appreciate/save/share on collection; fair member cap (e.g. **10**) | Mirror SG-106 albums pattern |
| SG-126 | 2024-02-28 | **Soft & hard limits (kinks)** | User kinks list; limit nuance unclear | Per kink on profile: **interested** / **soft limit** / **hard limit** + optional **giving/receiving**; searchable add flow | Extend `user_kinks` or profile JSONB |

---

## E. Notifications & reactions

| ID | Reference (FL) | Feature | C2K today | Target | Depends on |
|----|----------------|---------|-----------|--------|------------|
| SG-040 | 2025-08-12 | **Grouped “love” notifications** | Per-action notifications; no aggregation at scale | When same actor loves multiple items (pics, writings, status, comments), **one** notification listing targets | `feed_activities` + notification grouper job (guidance §10: no per-love email blast) |
| SG-041 | — | **Reaction verbs on feed** | `connection_like` on posts | Extend activity types: love/comment/share aligned with home filters in FETLIFE_CLASS_HOME §2.4 | `feed_activities` F1 |
| SG-121 | 2024-03-14 | **Feed type filters** | Home Following/Discover modes partial | Tabs: **All activity**, **Posts only** (media + articles, no graph noise), **Groups**, **Status**, **Photos**, **Video**, **Articles**; same on **profile activity**; desktop sidebar + mobile top bar | [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) §2 |
| SG-123 | 2024-03-12 | **Following feed load-more** | `GET /feed/following` paginated | At end of Following feed, fetch **more posts/media** from people you follow (cursor); no dead-end after first page | Cursor pagination + empty state |
| SG-130 | 2024-01-19 | **Connections who appreciated** | Like counts only | On feed card: up to **3** connection avatars who appreciated + total count (most recent first) | Join `connection_like` + graph |
| SG-042 | 2025-05-22 | **Community list — featured-in** | Lists unclear / stub | Profile **Lists** tab: lists you created + lists **you’re on**; add member from profile → **Add to list** | List membership model |
| SG-043 | 2025-05-22 | **Community list — Follow all** | N/A | **Follow all** on a list; show follower count; notify list owner on use | SG-042, follow graph |
| SG-044 | 2025-05-22 | **Community list — view counts** | N/A | Creator sees list views (feed, profile, search); privacy opt-out for own analytics | View counter + privacy |

---

## F. Groups & forums (moderation UX)

| ID | Reference (FL) | Feature | C2K today | Target | Depends on |
|----|----------------|---------|-----------|--------|------------|
| SG-051 | 2025-07-09 | **Delete own group post** | Forum delete varies by role | Author **⋯** → delete discussion (confirm); soft-delete vs hard per policy | Group forum posts |
| SG-052 | 2025-07-09 | **Delete own comment** | Partial | Comment **more** menu → **Delete** for author | Threaded comments |
| SG-053 | 2025-07-09 | **OP close comments** | Not surfaced | Original poster can **Close comments** without deleting thread | `commentsClosedAt` on thread |
| SG-054 | 2025-04-10 | **Group locations (max 3)** | Group geo on discovery API | Owner sets up to **3** location tags; show on About; power **search by location** | `groups` location fields |
| SG-138 | — | **Group discovery browse grid** | Group pages exist; no `/groups` discovery grid like events | **Groups** browse: cover image, **category** pill (BDSM / Fetish / Kink / Lifestyle / …), description snippet, **member avatar stack** + count; filters via SG-135 + category chips | `GET /groups` discovery + SG-054 |
| SG-055 | 2025-06-12 | **Group post view counts** | No author analytics on group posts | **OP + group leaders** see view count; member privacy can hide **own** counts; leaders always see in their groups | SG-071, SG-073 |
| SG-081 | 2022-11-29 | **Thread role badges** | No OP/MOD labels on forum posts | On **group/org forum** threads and comments: badge **Author** (original poster) and **Mod** (group/org moderator); never shown on own posts for self | Role resolver from `forum_threads.authorId` + membership role |
| SG-087 | 2023-03-16 | **Threaded comment affordance** | Comments exist; nesting UX minimal | **Vertical thread line** at left of nested replies so depth is obvious (1st vs 2nd level); keep accessibility (indent + `aria`) | CSS + comment `parentId` tree in forum + hub chat |
| SG-096 | 2023-06-21 | **Join group — rules modal** | Group join navigates or applies inline | **Join** opens in-place **rules** modal (accordion list) + **Join group** confirm — no full-page navigation; preserves scroll on discovery | `groups.rules` JSON + join API |
| SG-114 | 2023-10-12 | **Appreciate group discussions** | Forum reactions partial (`thanks`/`helpful` on org forums) | **Appreciate** on group thread if viewer can read thread; hidden when banned, blocked author, or closed group non-member; counts + SG-040 grouping | Unify reaction model across org/group forums |
| SG-125 | 2024-03-07 | **Mod delete with reason + timeout** | Forum delete varies; org reports exist | Leader **Delete discussion** modal: optional **rule violated** dropdown; optional **member timeout**; notify author + log for co-mods | Group `rules[]` + `member_timeout_until` |
| SG-127 | 2024-02-23 | **Notify on your group threads** | Partial forum subscriptions | Starting a group thread **auto-follows** it; on-site notification when new comments; **Unfollow** from thread or notification row | `forum_thread_follows` + notification type |

*Note: FL limited delete/close to posts after 2025-07-09; C2K can support all posts if schema allows without migration pain.*

---

## G. Messaging (inbox / DMs)

| ID | Reference (FL) | Feature | C2K today | Target | Depends on |
|----|----------------|---------|-----------|--------|------------|
| SG-060 | 2025-06-11 | **Inbox filters** | Messages exist; limited inbox UX | Tabs: **All**, **Unread**, **Favorites**, **Friends**, **Followers** (Favorites tab hidden if empty) | DM threads + graph edges |
| SG-061 | 2025-06-11 | **Inbox sort** | Chronological default | Toggle **newest ↔ oldest** (sort icon in inbox header) | Thread `updatedAt` index |
| SG-062 | 2025-02-14 | **Search conversations** | No PM search | Search **subject**, **body**, and **participant nickname** from inbox; **highlight** query terms in snippets (2024-02 inbox search) | Full-text or dedicated search index |
| SG-129 | 2024-01-26 | **Share — suggested recipients** | SG-115 backlog | Share modal shows up to **6** suggested connections (recent DM partners) + search; cap **10** recipients | SG-115 |
| SG-083 | 2023-02-13 | **Inbox row actions** | Delete/archive via thread detail only | **Mobile:** swipe conversation row → **Delete**, **Mark read**, **Archive**; **Desktop:** same actions on hover; confirm delete | `conversations` status flags + archive table or folder |
| SG-092 | 2023-07-26 | **Pin conversations** | No pin sort | **Pin** / **Unpin** via swipe (mobile) or hover (desktop); pinned threads sort to top; pin icon on row | `conversation_participants.pinnedAt` or equivalent |
| SG-094 | 2023-07-20 | **Group chats beyond connections** | DMs may be connection-gated | Start **group conversation** (cap e.g. **10**) with **connections + followers + following** in recipient picker; grouped autocomplete sections | Follow graph + `conversations` participants |
| SG-115 | 2023-08-17 | **Share post to connections (DM)** | Repost exists; no “send to friend” | **Share** on feed/detail → pick up to **10** connections; optional message; delivers as **separate** DM threads (not one group blast) | `conversations` + message template |
| SG-118 | 2023-10-26 | **“Not looking for” DM boundary** | No boundary gate on cold DMs | Profile **Boundaries** list; when **non-connection** starts new DM, modal shows recipient’s **Not looking for** items; **Cancel** or **Send anyway** | `profiles.notLookingFor` JSONB + DM compose guard |

---

## H. Trust, safety & analytics (view counts)

| ID | Reference (FL) | Feature | C2K today | Target | Depends on |
|----|----------------|---------|-----------|--------|------------|
| SG-070 | 2025-06-09 | **CSAM / NCII hash check on upload** | Reports + moderation queues; no hash API | On image/video upload: compute hash, check **NCMEC Take It Down** + **StopNCII** (or equivalent); **flag → human review**; never auto-publish match | Legal review, worker job, vendor contracts |
| SG-071 | 2025-03-07 | **Author-only view counts (baseline)** | Not on posts | Histogram icon + count visible **only to author**; privacy toggle to hide on own content | `content_views` aggregate |
| SG-072 | 2025-05-23 | **View counts — more surfaces** | N/A | Same rules as SG-071 for: albums/collections, **event discussions**, profile updates, relationship updates | SG-071, object-type polymorphism |
| SG-073 | — | **View counts — privacy** | N/A | User setting: disable seeing view counts on **own** posts (leaders/mod overrides per SG-055 where applicable) | `user_settings` |

*Consolidates FL “Reintroducing view counts”, “Group post view counts”, and “View counts added to more places”.*

---

## I. Mobile / PWA (distribution, not graph logic)

| ID | Reference (FL) | Feature | C2K today | Target |
|----|----------------|---------|-----------|--------|
| SG-050 | 2025-08-10 | **Installable PWA hints** | Web app | Document/install prompts for Add to Home Screen (iOS/Android) where product wants app-like feed |
| SG-097 | 2023-05-25 | **Split nav + global compose** | **Partial:** `CommunityNavBar`, home modes | **Discover menu** (site IA) vs **Account menu** (profile, Saved, RSVPs, settings, logout at top); header **+** compose (post/event); optional **status** link in Discover menu; drop redundant sub-nav bars on mobile | [`design/04-NAVIGATION_AND_IA.md`](./design/04-NAVIGATION_AND_IA.md) |

---

## J. Cross-cutting implementation notes

1. **Phase gate:** Ship organizer pilot (Phase 1) before starting SG-040 + home Following UI; SG-010–015 can align with **group/munch events** already in flight (G301–G312).
2. **Notifications:** New social types must register in `@c2k/shared` before routes/UI; high-volume types enqueue via **BullMQ** after commit ([`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) §4).
3. **Blocks:** Reuse platform block table; event-scoped exceptions (SG-011) need explicit resolver tests.
4. **Media consent:** SG-022/023/026 should share one “I have consent to upload” component for liability parity.
5. **Convention dancecard:** Attendee availability/compare/profile are **not** in this backlog — track under [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md) / command bridge.
6. **SG-070:** Requires explicit product/legal sign-off before third-party hash APIs; do not stub in production without compliance review.

---

## K. Suggested implementation waves (when Phase 2 opens)

| Wave | IDs | Rationale |
|------|-----|-----------|
| **W0 — Baseline UX (batch 3–4)** | SG-080, SG-081, SG-087, SG-082, SG-083, SG-090, SG-088, SG-099, SG-096 | Categories, badges, thread lines, ICS, inbox gestures, profile fields, mention style, join modal |
| **W1 — Graph inbox** | SG-001–004, SG-060–062, SG-035, SG-083, SG-092, SG-094, SG-119, SG-129 | Requests, approve-followers, inbox search, share suggestions |
| **W2 — Event + group social** | SG-010–015, SG-023, SG-051–055, SG-054, SG-080, SG-082, SG-091, SG-093, SG-105, SG-111–113, SG-114, SG-120, SG-122, SG-125, SG-127, SG-136–138 | Events, forums, mod tools, RSVP notify, discovery cards |
| **W3 — Feed + media** | SG-020–027, SG-022, SG-024, SG-025, SG-040, SG-041, SG-056, SG-084, SG-085, SG-095, SG-102, SG-106–109, SG-115, SG-117, SG-121, SG-123, SG-130, SG-131, SG-124, SG-132–133, SG-145 | Editor, albums, feed filters, mute member, collections |
| **W4 — Profile + URLs** | SG-030–034, SG-032, SG-033, SG-036, SG-086, SG-088, SG-090, SG-098, SG-101, SG-103, SG-100, SG-104, SG-110, SG-116, SG-118, SG-126, SG-134–135, SG-139–144, SG-146 | QR, notes, browse IA, places, presence, boundaries |
| **W5 — Lists + analytics** | SG-042–044, SG-071–073, SG-055 | Lists, view counts |
| **W6 — Trust pipeline** | SG-070 | Hash APIs + caretaker review — after legal |
| **W7 — Polish** | SG-050, SG-031 | PWA, copy link |

### Batch 3 quick matrix (2026-05-27 screenshots)

| Theme | IDs | C2K De-Fetlifed name | Effort hint |
|-------|-----|----------------------|-------------|
| Event discovery | SG-080, SG-082 | **Event type** + **Export to calendar** | S — enum + ICS endpoint reuse |
| Group clarity | SG-081, SG-087 | **Author / Mod badges** + **Reply thread lines** | S — UI + forum components |
| Messaging | SG-083 | **Inbox swipe actions** | M — mobile gesture + API |
| Feed control | SG-084, SG-085 | **Muted tags** + **Saved posts** | M — settings + bookmark table |
| Profile identity | SG-086, SG-088, SG-090 | **Orientations**, **Genders**, **Pronouns** | M — profile schema + settings UI |

### Batch 4 quick matrix (2026-05-28 screenshots)

| Theme | IDs | C2K De-Fetlifed name | Effort hint |
|-------|-----|----------------------|-------------|
| Safety in groups | SG-091 | **Blocks in forums** | M — resolver + mod/leader exceptions |
| Inbox | SG-092, SG-094 | **Pin thread** + **Group chat eligibility** | M — participant model |
| Feed events | SG-093 | **Event story cards** + inline RSVP — **shipped** (Wave 3 Local meantime) | — |
| Groups UX | SG-096 | **Rules before join** | S — modal on existing join |
| Composer | SG-095 | **Status length** | S — shared limit constant |
| Nav / IA | SG-097 | **Discover vs Account menus** | M — aligns with Track B nav |
| Tags & requests | SG-098, SG-101 | **Tag privacy** + **Tag requests inbox** | M — settings + queue |
| Social polish | SG-099, SG-102 | **Your mentions** + **Save on detail** | S — renderer + SG-085 |
| Identity vocab | SG-103 | **Roles / orientations / genders catalog** | M — extends SG-086/088 |
| Orgs | SG-100 | **Organization pages** (not user conversion) | S — product already split; polish badge |
| Profile CRM | SG-034 | **Private notes** (batch 2; same screenshot era) | S — viewer-only note field |

*Batch 4 assets 1–2: image descriptions unavailable in capture — review workspace `assets/` filenames `image-a287235d…` and `image-3bcf56cd…` if those map to extra rows.*

### Batch 5 quick matrix (2026-05-29 screenshots)

| Theme | IDs | C2K De-Fetlifed name | Effort hint |
|-------|-----|----------------------|-------------|
| Search | SG-104 | **Search visibility** (articles, photos, video) | M — index + privacy toggles |
| Events UX | SG-105, SG-111–113 | **Type filters**, **Cover**, **Discussions**, **Notify bell** | M–L — builds on SG-080 |
| Albums | SG-106–109, SG-108 | **Albums**, **Batch edit**, **Cover**, **Pin photos** | L — extends SG-026 |
| Composers | SG-116, SG-117 | **@mentions everywhere**, **Markdown status** | M |
| Feed actions | SG-114, SG-115 | **Appreciate forums**, **Share via message** | M |
| Profile | SG-110, SG-118 | **Pinned article**, **Boundaries** (not looking for) | S–M |

### Batch 6 quick matrix (2026-05-30 screenshots)

| Theme | IDs | C2K De-Fetlifed name | Effort hint |
|-------|-----|----------------------|-------------|
| Follow graph | SG-119 | **Approve followers** | M — privacy + requests UI |
| Feed | SG-121, SG-123, SG-130 | **Feed filters**, **Load more**, **Who appreciated** | M — home Following |
| Events | SG-120, SG-122 | **Interested** RSVP label, **Organizer RSVP alerts** | S–M |
| Albums | SG-132, SG-133 | **Reorder album**, **Album actions** | S — extends SG-106 |
| Articles | SG-124 | **Article collections** | M — mirror albums |
| Forums | SG-125, SG-127 | **Delete + timeout**, **Thread follow notify** | M |
| Inbox / share | SG-062, SG-129 | **Search highlight**, **Share suggestions** | S — enhances existing rows |
| Safety / profile | SG-131, SG-126 | **Mute member**, **Kink soft/hard limits** | M |

*Batch 6 asset 1: description unavailable — see `image-68a22fd1…` in `assets/` if needed.*

### Batch 7 quick matrix (2026-05-27 — fetish.com browse IA)

| Theme | IDs | C2K De-Fetlifed name | Effort hint |
|-------|-----|----------------------|-------------|
| Browse IA | SG-134, SG-135, SG-145 | **Unified Browse** + **Geo radius** + **Home type filters** | M — layout + shared filter component |
| Events grid | SG-136, SG-137 | **Featured** badge + **Connection RSVP avatars** | S — extends SG-105 cards |
| Groups grid | SG-138 | **Group discovery cards** | M — `GET /groups` + geo |
| Places | SG-139, SG-140 | **Places directory** + **Community ratings** | L — extend `/places`; not event addresses |
| People browse | SG-141–144 | **Sort tabs**, **Online dot**, **New badge**, **Filter toggles** | M — `/discovery` + `/online` |
| Spotlight | SG-146 | **Curated spotlight rail** (orgs/presenters) | S — reuse org spotlight; no paid bump |

**Explicitly out of scope (fetish.com — do not build):** **Kinky Ads** / personal classifieds (dating, escort, NSA marketplace); **pay-to-bump** profile sort (“Rise up”); **subscription-gated** spotlight; **Image Competition** gamification; **Spanks** as a standalone product tab. C2K is organizer-first — discovery supports **events, groups, places, people**, not classified hookup ads.

*Batch 7 assets: `image-2d5afa6b…` (groups), `image-277276a2…` (locations), `image-a8b88c88…` (events), `image-a496a641…` (kinky ads — rejected), `image-badcc6d4…` (kinksters), `image-e8e01948…` (home).*

---

## L. Screenshot archive

| Batch | Date | Notes |
|-------|------|--------|
| 1 | 2026-05-26 | Co-hosts, follow/ignore, editors, public events, safe mode, grouped loves, etc. |
| 2 | 2026-05-26 | Group delete/close, view counts, inbox filters, picture sets, lists, places writings, favorites, PM search, hash safety, profile URLs |
| 3 | 2026-05-27 | Event categories, OP/MOD badges, add-to-calendar, inbox swipe, mute tags, bookmarks, romantic orientation, threaded lines, multi-gender, pronouns |
| 4 | 2026-05-28 | Blocks in forums, pin inbox, event feed stories, group DM graph, status length, join rules modal, split nav, tag privacy/requests, mention highlight, org badge, save on detail, identity taxonomy |
| 5 | 2026-05-29 | Global search writings, event filters/agenda/cover/discussions, photo albums, pin article/photos, markdown status, share-via-DM, forum appreciate, boundaries modal |
| 6 | 2026-05-30 | Approve followers, feed filters/load-more, Interested RSVP, organizer RSVP notify, article collections, mute member, album reorder/actions, mod delete+timeout, kink limits, share suggestions |
| 7 | 2026-05-27 | fetish.com Browse IA: unified sidebar filters, geo radius, event/group/place grids, people sort/presence, curated spotlight; **rejects** kinky ads + pay-to-bump |

Assets under Cursor workspace `assets/` (reference screenshots). Append new rows to §A–M with `SG-###` — do not fork a second backlog doc.

---

## M. De-Fetlifed vocabulary (batches 3–7)

Use C2K copy — **not** FetLife terms in UI:

| FL / reference term | C2K UI label |
|---------------------|--------------|
| Category (event) | **Event type** |
| BDSM Party / Sex Party | **Play party** / **Sex-positive party** (or single **Party** with subtype) |
| OP | **Author** (thread starter) |
| MOD | **Moderator** |
| Add to Calendar | **Add to calendar** |
| Muted Tags | **Muted interests** or **Hidden tags** |
| Bookmarks | **Saved** |
| Romantic orientation | **Romantic orientation** (keep — clinical/neutral) |
| Writings | **Articles** or **Journal** (matches `feed_posts.kind = article`) |
| Love | **Appreciate** or **React** (align with SG-040 grouped notifications) |
| FetLifers (privacy) | **Members** / **Signed-in members** / **Public** |
| Friend request | **Connection request** (or **Follow request** per SG-004) |
| Tag Requests | **Photo tags** or **Tag approvals** |
| Convert to Organization | **N/A** — use existing **Create organization** / org admin flows (SG-100) |
| Pin conversation | **Pin** |
| Stuff You Love | **Saved** (SG-085) or **Favorites** (SG-035 members only) |
| Writings | **Articles** / **Journal** |
| My Agenda | **My events** (RSVP + organizing) |
| NOT Looking For | **Boundaries** or **Not open to** |
| Say It! | **Post** / **Publish** |
| Loved | **Appreciated** |
| FetLife Tech Support (group) | *(example only)* — use org/group name |
| Maybe Going | **Interested** (RSVP `maybe`) |
| Stories | **Posts** / **Feed items** |
| Mute (member) | **Mute** (distinct from hidden tags) |
| Soft / Hard limit | **Soft boundary** / **Hard boundary** (kinks) |
| Writing Collection | **Article collection** |
| Kinky Ads | **Out of scope** — not a C2K surface |
| Rise up / Spotlight (paid) | **Curated spotlight** (SG-146) — staff/org only, never pay-to-win |
| Browse (fetish.com) | **Discover** or **Browse** — People / Events / Groups / Places |
| Dungeons & Studios | **Dungeon / playspace** (place category) |
| Kinksters | **Members** / **People** |
| Get a subscription | **N/A** — no member paywall for discovery sort |

---

## Links

| Doc | Role |
|-----|------|
| [`FETLIFE_CLASS_HOME.md`](./FETLIFE_CLASS_HOME.md) | Following feed, `feed_activities`, home IA |
| [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) | Autonomous queue — SG items **not** auto-enqueued until Phase 2 kickoff |
| [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) | Routes/API truth when implementing |
| [`BRANDING_AND_SOCIAL_SHARING.md`](./BRANDING_AND_SOCIAL_SHARING.md) | Share cards / OG (complements SG-030/031) |
