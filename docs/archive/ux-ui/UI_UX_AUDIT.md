# C2K Web UI/UX Audit (2026-05-30)

**Purpose:** Read-only, line-by-line–oriented review of `packages/web` focused on whether existing UI **belongs where it is**, reads clearly on **small phones**, feels **cohesive** (not abrupt), and **does not jump** during load. Use this document with the product owner to **prioritize fixes** and **answer IA questions** before implementation plans.

**Scope:** `packages/web` (React Router app). API behavior noted only where it affects UI. Not a visual design critique of brand/colors.

**Method:** Ten parallel read-only audits (navigation, settings/profile, home feed, events/conventions/organizer/door, orgs/groups, education/media/presenters, messaging/notifications/connections/saved, vendors/discovery/places, global UI primitives, auth/landing/moderation/legal). Findings deduplicated and grouped below.

**Related:** [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md), [`C2K-STRATEGIC-GUIDANCE.md`](./C2K-STRATEGIC-GUIDANCE.md) (Phase 1 = organizer gravity; social polish is Phase 2 unless overridden).

---

## Executive summary

The product has **strong domain features** (convention hub, org forums/chat, door mode, education, new Media directory) but **inconsistent shell and loading patterns** make the site feel like several apps stitched together rather than one mobile-first community OS.

### Top 10 cross-cutting themes

| # | Theme | Impact |
|---|--------|--------|
| 1 | **Stacked mobile chrome** — Header + 2-row `CommunityNavBar` + `BottomNav` + often `Footer` on social routes | Very little viewport for content; not “app-like” |
| 2 | **No global route loading** — Most navigations hard-swap pages; few `Suspense` fallbacks | Abrupt clicks; layout shift on entry |
| 3 | **Two skeleton dialects** — `dc-skeleton-bone` vs plain `animate-pulse` vs text `Loading…` | Perceived performance varies by page |
| 4 | **Tab URL desync** — Convention hub, org/group hubs read `?tab=` but **don’t write it** on click (events do) | Broken share/back; unlike organizer patterns |
| 5 | **Misleading browse highlights** — `/media`, `/presenters`, `/orgs`, `/connections` light wrong home browse chips | Users think they’re on Education/Groups/People |
| 6 | **Following vs URL desync** — Feed can show Following while nav highlights “Near you” | Trust-breaking nav state |
| 7 | **Guest vs signed-in dual nav** — Home `TabShell` vs `CommunityNavBar`; guests lose directory row on `/media` | Fragmented first-run |
| 8 | **Focused surfaces still get feed chrome** — Messaging, settings, onboarding, convention register | Chat/settings feel cramped |
| 9 | **Mock/API split visible** — Group Channels mobile bug, demo header with full app nav, filter chips that empty | Alpha confusion |
| 10 | **Discoverability gaps** — `/saved` barely linked; `media_episode` bookmarks dropped; Places geo UI not wired | Features exist but feel orphaned |

### What already works (keep / extend)

- **Door mode** — `100dvh`, safe areas, large tap targets, offline queue (QR capture still weak).
- **Org forums** — Mobile master–detail with “← Thread list”.
- **Media outbound pattern** — Clear “listen/watch elsewhere” copy and `rel=noopener`.
- **Following empty states** — Good copy and deep links.
- **Group join modal** — Bottom sheet on small screens.
- **`TabContentTransition`** + `prefers-reduced-motion` — Use more widely.
- **Bookmark/report on education + media detail** — Pattern to standardize.

---

## How to use this doc for planning

1. **Answer [Owner decision queue](#owner-decision-queue)** first — many fixes depend on IA choices, not implementation skill.
2. Pick a **track** (Mobile shell / Nav truth / Loading system / Domain punch-list).
3. For each track, pull items from **Prioritized backlog** and link to domain sections.
4. Do **not** block organizer alpha on Media polish; **do** fix nav lies and mobile-breaking bugs (group Channels, tablet discovery filters).

---

## Owner decision queue

Answer these before a large UI refactor. Copy into a planning issue or PRD.

### Navigation & information architecture

1. **Following feed:** Alpha-ready for all signed-in users? Should URL always show `?mode=following` when active?
2. **Browse model:** Primary discovery on `/home?tab=…`, standalone routes (`/events`, `/groups`, …), or intentional hybrid? Should **Conventions** get a list route?
3. **CommunityNavBar scope:** Feed/browse only, or every signed-in page (settings, messaging, conventions)?
4. **Mobile primary nav:** Bottom bar vs community browse row — collapse one to reduce height?
5. **People vs Find people:** Is `/discovery` people-only, or all exploration? One label, one entry point?
6. **Media placement:** Peer **Education** tab + footer, or stay **directory link** only? Fix highlight stealing “Education” when on `/media`?
7. **Places:** First-class browse tab or directory-only? Wire geo filters or hide until API supports them?
8. **Dungeons:** Marketing label vs redirect to `/places?category=dungeon_club`?

### Tabs & deep linking

9. **Convention hub:** Default tab Welcome vs Schedule? Collapse tabs (Chat/ISO/Documents → More)?
10. **Convention `?tab=`:** Sync URL on every tab click (like events)?
11. **Schedule source of truth:** Schedule tab only, Dancecard only, or both for attendees?
12. **Org/group hub tabs:** Sync `?tab=` on click? Unify forum layout (org master–detail on groups)?

### Social & inbox

13. **Messaging shell:** Hide community nav + footer on mobile; `100dvh` minus header/bottom nav only?
14. **Inbox hub:** Single “Activity” (messages + notifications + connection requests) vs separate bottom-nav items?
15. **Saved:** Chronological mix vs type filters? Surface `/saved` in nav? Render `media_episode` bookmarks?

### Settings & onboarding

16. **Profile entry:** Settings “Profile” hub vs `/profile/edit` only — one front door?
17. **Roles & tools tab:** Split presenter/vendor/staff out of one long ecosystem page?
18. **Muted + blocked:** Separate tabs or one “Safety” area?
19. **Payment history label:** Rename to “Event access” / registration history?
20. **Onboarding canonical path:** `ProfileFinishPanel` only vs 6-step wizard vs merge? Block `/home` until complete?
21. **Authenticated `/`:** Redirect to `/home` or marketing layout without community nav?

### Presenter / education / media

22. **Home Education Video/Presentation filters:** Legacy mock or deep-link to `/media`?
23. **Presenter section order:** By `profileKind` (About first for authors)?
24. **Cross-links:** Hubs and show pages → `/presenters/{username}`; education ↔ media?

### Organizer / door

25. **Door QR:** Camera scan in alpha or keyboard/wedge only? Kiosk mode (hide exits)?
26. **Post-register landing:** Schedule, Dancecard, Welcome, or RSVP?

### Design system

27. **Loading standard:** Shimmer skeletons everywhere vs pulse OK for fast lists?
28. **Route motion:** CSS tab fades only vs View Transitions on major navigations?
29. **Modal primitive:** One `Dialog`/`Sheet` in `components/ui` and migrate ad-hoc modals?
30. **PWA priority:** Installable manifest vs door/program SW only for alpha?

---

## Prioritized backlog

### P0 — Broken or misleading (fix soon)

| ID | Finding | Location |
|----|---------|----------|
| P0-1 | **Group Channels unusable on mobile** — channel list `hidden lg:block`; only first channel | `app/groups/[id]/page.tsx` |
| P0-2 | **Discovery filters dead zone 768–1023px** — button `md:hidden`, sidebar `lg:block` | `app/discovery/page.tsx` |
| P0-3 | **Following content vs nav mismatch** — no `?mode=following` in URL | `HomePageClient.tsx`, `community-nav.ts` |
| P0-4 | **Wrong browse tab highlighted** on `/media`, `/presenters`, `/orgs`, `/connections` | `community-nav.ts` |
| P0-5 | **`media_episode` bookmarks saved but not shown** | `app/saved/page.tsx` |
| P0-6 | **Places geo filters UI lies** — distance/city/country not sent to API | `CommunityPlacesBrowse.tsx` |
| P0-7 | **Sticky hub tabs under community nav** — both `top-16`, z-order clash | `CommunityHubShell.tsx`, `CommunityNavBar.tsx` |
| P0-8 | **Profile edit renders before load** — no skeleton; save with empty state | `ProfileEditLayout.tsx` |

### P1 — High friction (alpha polish)

| ID | Finding | Location |
|----|---------|----------|
| P1-1 | No global route pending UI / layout-level skeleton | `RootLayout.tsx`, `router.tsx` |
| P1-2 | Convention tabs don’t update URL on click | `conventions/[slug]/page.tsx` |
| P1-3 | Org hub: text-only load vs group skeleton | `OrgHubClient.tsx` |
| P1-4 | Messaging viewport `100vh-8rem` vs real chrome stack | `messaging/page.tsx` |
| P1-5 | CommunityNavBar on messaging/settings/register | `showCommunityNav()` |
| P1-6 | Duplicate Find people + People → `/discovery` | `CommunityNavBar.tsx` |
| P1-7 | FeedCardSkeleton shorter than `LocalPostCard` → CLS | `C2kSkeleton.tsx`, feeds |
| P1-8 | Following filter change shows stale posts under skeleton | `useApiFeed.ts` |
| P1-9 | `/saved` almost no in-app links | site config, header |
| P1-10 | Settings ecosystem tab overload (presenter/vendor/staff) | `settings/ecosystem/page.tsx` |
| P1-11 | Convention triple schedule (Schedule / Dancecard / embed) | convention hub |
| P1-12 | Event RSVP below fold on mobile | `EventDetailClient.tsx` |
| P1-13 | Education write → `/settings` not login with return URL | `education/write/page.tsx` |
| P1-14 | Landing `/onboarding` vs router → profile edit only | `router.tsx`, `page.tsx` |
| P1-15 | “My reports” copy points to Settings but lives on Ecosystem | `support/page.tsx`, settings |

### P2 — Consistency & app-feel (post-alpha or parallel)

| ID | Finding | Location |
|----|---------|----------|
| P2-1 | Unify skeleton system (`dc-skeleton-bone` vs pulse) | ~55 files |
| P2-2 | Adopt `TabContentTransition` on settings, connections, profile edit | multiple |
| P2-3 | Shared modal/dialog primitive + z-index ladder | 15+ modals |
| P2-4 | Hide footer on mobile social routes | `RootLayout.tsx` |
| P2-5 | View Transitions API on router (optional) | `router.tsx` |
| P2-6 | PWA manifest icons / install UX | `public/manifest.json` |
| P2-7 | TabButton touch tokens on all settings nav | `SettingsTabNav.tsx` |
| P2-8 | Media filtered-empty vs global empty | `media/page.tsx` |
| P2-9 | Presenter profile section order by `profileKind` | `presenters/[username]/page.tsx` |
| P2-10 | Door camera QR + replace `window.confirm` | `DoorModePanel.tsx` |
| P2-11 | Footer + nav triple directory surfaces | footer, CommunityNavBar, DiscoveryBrowseLinks |
| P2-12 | Guest CommunityNavBar or align guest TabShell | auth flows |
| P2-13 | Connections → Message CTA | `connections/page.tsx` |
| P2-14 | Copy link visible feedback (toast) | `CopyLinkOverflowMenu.tsx` |
| P2-15 | Remove demo credentials from production login UI | `LoginCard.tsx` |

---

## Domain findings (detail)

### 1. Navigation, routing & chrome

- **Following vs URL:** Auto mode from settings without updating query string; CommunityNavBar reads URL only.
- **Stacked sticky layers:** Header (16) + CommunityNavBar (16) + hub tabs (16) → content scrolls under wrong layer.
- **Browse highlights wrong** for directory routes (orgs→Groups, media/presenters→Education, connections→People).
- **Duplicate entry points:** Find people + People; Near you in two rows; hamburger duplicates community nav on mobile.
- **Desktop signed-in:** No primary nav in header; everything in community bar + hamburger.
- **Logo always → `/home?tab=Local`:** Ignores Following preference.
- **No route-level loading** at layout; sparse `Suspense` on home/profile/events only.
- **CommunityNavBar null during auth loading** → layout pop-in.
- **Split home model:** Some tabs standalone URLs, Conventions/Trending stay on `/home?tab=`.
- **Legacy redirects** (`/feed`, `/forums`, etc.) — fine for bookmarks, noisy for IA docs.

### 2. Settings & profile edit

- Nine flat settings tabs without grouping; **Roles & tools** is a dumping ground (~presenter catalog + vendor + staff + support).
- Profile split: settings hub vs `/profile/edit`; ecosystem panel in edit unused.
- Privacy tab: many panels, two save models; notification matrix horizontal scroll on ~320px.
- Touch: settings nav below `min-h-touch`; account rows are text links.
- Settings skeleton `max-w-2xl` vs loaded `max-w-6xl` → shift.
- No tab content transition on settings outlet.
- Profile edit: fixed save bar + bottom nav overlap; mobile shows nav + completion + preview before fields.
- Payment history label vs organizer-only payments model.

### 3. Home feed & cards

- Guest `TabShell` vs signed-in `CommunityNavBar` — two IA models.
- Column width jumps: `max-w-2xl` (Local/Following) vs `max-w-6xl` (other tabs).
- `LocalPostCard`: disabled Comment, Report outside overflow, dense action row on phone.
- Following mixes `LocalPostCard` + tall `ActivityFeedCard` — uneven rhythm.
- Discover tab loading: People/Trending text-only; Conventions empty plain `<p>`.
- `dc-skeleton-stagger` on **loaded** posts in LocalHomeFeed.
- Local feed cap 12, no load more; events block appears after feed (CLS).

### 4. Events, conventions, organizer, door

- Event tabs grow after load (Matchmaker/Schedule appear) — tab strip shifts.
- Event detail minimal skeleton; RSVP column below fold on mobile.
- **Convention:** 8 horizontal tabs; Schedule + Dancecard + embed redundancy; Manage redirect abrupt.
- Convention load: hero/tabs while data null; ISO “Loading board…” text only.
- Register flow: text loading, separate route without convention chrome.
- Door: strong shell; text QR field; `window.confirm`; light-theme success colors on door surface.
- Two organizer shells: C2K sidebar stacks on mobile vs Dancecard drawer.

### 5. Orgs & groups

- Org: Forums + Chat separate; group API: forums only; mock group: Channels (chat-like) — three models.
- **Org `?tab=` read-only** on click; group same.
- Org load “Loading…” vs group full skeleton.
- Org forums: mobile master–detail ✓; org chat: stacked rail; group forums: no mobile back.
- Org god-component ~2.4k lines vs split group sections.
- Report modal org bespoke vs `ContentReportDialog` on groups.

### 6. Education, media, presenters

- Media directory-only; highlights **Education** tab when on `/media`.
- Footer omits Media; no cross-links education ↔ media.
- Home Education tab Video/Presentation filters vs article-only `/education` hub.
- Media submit: all URL fields always visible; success path not a link.
- Education write: toolbar below editor; `window.prompt` for series; write CTA missing when hub has articles.
- Presenter order: Media before Writing, About late; owner username on media show not linked.
- Media filtered empty same as catalog empty.

### 7. Messaging, notifications, connections, saved

- Messaging: `100vh-8rem` wrong with banners + community nav + bottom nav.
- Thread open: no skeleton; messages pop in.
- Composer single-line; broken `/profile` link in thread header.
- Notifications: local filter state; sticky `top-0` under chrome; mark-read full refetch.
- Connections: raw PENDING/ACCEPTED labels; no request count on tab; no Message CTA.
- Saved: `max-w-xl`, mixed types unlabeled, episodes missing, poor discoverability.

### 8. Vendors, discovery, places

- Vendor onboarding long on phone with community nav visible.
- Vendor skeleton `h-44` vs tall `VendorCard`.
- Places: no detail links from list; dungeons redirect vs nav label.
- Discovery drawer no scrim/focus trap.

### 9. Global UI infrastructure

- No shared Modal/Dialog; z-index fragmentation (`z-50` … `z-[310]`).
- No View Transitions; Framer not used.
- `HomeEventGridSkeleton` underused.
- Dual Button (`ui/Button` vs dancecard).
- `c2k-*` and `dc-*` tokens mixed.
- PWA manifest minimal (one icon).

### 10. Landing, auth, moderation, legal

- `/onboarding` redirects; 6-step wizard orphaned.
- Signed-in users on `/` still get CommunityNavBar.
- Fallback mode shows full app header.
- Support reports live under Settings → Ecosystem only.
- Moderation reports: text loading, `alert()` on errors.
- Legal TOC below content on mobile.

---

## Mobile “app-like” opportunities

| Pattern | Current | Opportunity |
|---------|---------|-------------|
| Bottom nav | Home, Find people, Create, Messages, Profile | Add Notifications or “Activity”; don’t add without removing chrome |
| Focused routes | Messaging/settings keep full marketing footer + community nav | **Route-aware shell:** minimal chrome, `100dvh`, hide footer |
| Tab transitions | ~6 uses of `TabContentTransition` | Standard on all tabbed hubs + settings |
| Pull-to-refresh | Not observed | Optional on feed/lists (PWA) |
| Safe area | Bottom padding on main; top mainly door | `safe-area-inset-top` on sticky headers |
| Install/PWA | Basic manifest | Icons, shortcuts, “Add to Home Screen” prompt after login |
| Haptic / native | N/A web | Defer; focus layout and motion first |

---

## Skeleton & loading inventory

| Tier | Use when | Examples |
|------|----------|----------|
| **A — Layout skeleton** | Route or tab first paint | `SettingsPageSkeleton`, group hub header, convention hub shell |
| **B — Content skeleton** | Lists/grids | `FeedCardSkeleton`, `DancecardPanelSkeleton`, `dc-skeleton-bone` |
| **C — Pulse blocks** | Legacy / quick | `animate-pulse h-44` on discover tabs |
| **D — Text only** | Avoid for >200ms loads | “Loading…”, “Checking session…” |

**Target:** A for shells, B shaped like real cards (avatar + action row for posts), retire C/D on primary journeys (home, convention, org hub, messaging thread).

---

## Transitions inventory

| Mechanism | Coverage | Recommendation |
|-----------|----------|----------------|
| `TabContentTransition` | Org/group hub, some home/organizer | Extend to settings, connections, profile edit |
| `dc-tab-content-enter` | 0.2s fade | Keep; pair with stable min-heights |
| Route-level | None | Optional View Transitions for top 5 routes |
| List enter | `dc-skeleton-stagger` misused on real posts | Remove from loaded lists |

---

## Suggested planning phases (after owner answers)

### Phase UX-A — Truth & bugs (1–2 weeks)
P0 items + Following URL sync + convention/org `?tab=` write + group Channels mobile + discovery tablet filters + saved episodes + nav highlight map.

### Phase UX-B — Mobile shell (1–2 weeks)
Focused route chrome policy; messaging viewport; reduce duplicate nav; footer hide on mobile app routes; sticky offset CSS variables.

### Phase UX-C — Loading system (1 week)
Layout-level pending UI; skeleton parity for post cards; convention/org first paint; replace text gates.

### Phase UX-D — IA consolidation (needs decisions)
Settings regroup; presenter/media/education cross-links; schedule tab model; onboarding single path; saved in nav.

### Phase UX-E — App polish
Modal primitive; PWA assets; door QR; optional view transitions.

---

## Appendix: audit agents & paths

| Agent | Primary paths |
|-------|----------------|
| Nav | `router.tsx`, `CommunityNavBar.tsx`, `community-nav.ts`, `RootLayout.tsx` |
| Settings | `app/settings/*`, `app/profile/edit/*` |
| Home | `app/home/*`, `components/cards/LocalPostCard.tsx` |
| Events | `app/events/*`, `app/conventions/*`, `organizer/*`, door components |
| Orgs/groups | `app/orgs/*`, `app/groups/*`, `CommunityHubShell.tsx` |
| Edu/media | `app/education/*`, `app/media/*`, `app/presenters/*` |
| Social | `app/messaging/*`, `notifications/*`, `connections/*`, `saved/*` |
| Vendors | `app/vendors/*`, `discovery/*`, `places/*` |
| Primitives | `components/ui/*`, `globals.css`, `dancecard-motion.css` |
| Auth/legal | `app/page.tsx`, `login/*`, `support/*`, `moderation/*` |

---

## Changelog

| Date | Note |
|------|------|
| 2026-05-30 | Initial synthesis from 10 parallel read-only audits |
| 2026-05-30 | UX waves A–E executed; decisions in [UI_UX_DECISIONS.md](./UI_UX_DECISIONS.md); P0–P2 largely addressed (see plan) |
| 2026-06-01 | **100% closure** — sign-off matrix [UI_UX_COMPLETION.md](./UI_UX_COMPLETION.md) |
