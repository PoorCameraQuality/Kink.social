# Layout + Information Architecture Reset — Member Surfaces

**Status:** Active — **replaces** per-page Sprint 3 visual polish until layout contracts are approved and implemented  
**Supersedes for new work:** [`UI_DESKTOP_SPRINT_3.md`](UI_DESKTOP_SPRINT_3.md) CP3+ polish queue (Home, Explore, Events CP3 work stays shipped; **no new component polish** until this doc’s checkpoints land)  
**Branch:** continue on `desktop-ui-sprint-3-visual-polish` or a dedicated `layout-ia-reset` branch  
**Monorepo anchor:** `packages/web` — verify paths in `packages/web/src/router.tsx` before editing  
**Companion docs:** [`UI_DISCOVER_REFRESH_PROGRESS.md`](UI_DISCOVER_REFRESH_PROGRESS.md), [`design/02-LAYOUT_AND_RESPONSIVE.md`](design/02-LAYOUT_AND_RESPONSIVE.md), [`FEATURE_REGISTRY.md`](FEATURE_REGISTRY.md) §2, [`UI_DESKTOP_SPRINT_3.md`](UI_DESKTOP_SPRINT_3.md) (audit + CSS boundary rules)

---

## Why this reset exists

Sprint 3 CP3 polished **copy and card hierarchy** on Home, Explore, and Events. That helped information scent inside existing shells — but it did **not** resolve deeper problems:

- Inconsistent **layout families** across discover routes (3-col vs 2-col vs hub mosaic vs feed shell)
- Unclear **center vs rail ownership** (filters duplicated, right rails empty or duplicated on mobile)
- **Mobile/tablet handoff** varies route by route (`FilterSheet` vs inline drawer vs chip row only)
- **Card schemas** differ for comparable items (event row on Explore vs Events vs Home)
- Pages compete for attention without a defined **above-the-fold contract**

**Hard rule for all agents:** Do **not** polish components (headers, cards, rails, CSS surfaces) until the **page layout contract** for that route is written, reviewed, and listed in [Page contract registry](#page-contract-registry) as **Approved**.

**Hard rule on research:** This reset is **not** “look at the repo and organize boxes better.” It is **research-backed layout strategy by page type**, then **repo-grounded implementation planning**. Do not approve or implement a contract from taste, habit, or “what the code already does” alone.

Structural work first. Visual polish second. Research before structure.

---

## Phase method: research → contract → implementation

| Step | Action | Gate |
|------|--------|------|
| 1 | **Research notes** — UX/layout principles for the route’s layout family (see [Layout family research requirements](#layout-family-research-requirements)) | Required before draft |
| 2 | **Draft contract** — seven fields + `research_principle_notes` grounded in step 1 and inspected code | Required before review |
| 3 | **User review** — product owner approves mental model, not just box placement | Required before Approved |
| 4 | **Status Approved** — registry updated | Required before code |
| 5 | **Structural implementation** — one CP-LIA checkpoint; extend existing shells/templates | One route per commit |
| 6 | **Optional visual polish** — Sprint 3 CP4+ only after step 5 | Deferred |

**Goal:** kink.social feels like a mature product because each surface follows the **right mental model for that page type**, not because every card got prettier.

Anchor references (reuse across families): [NN/g information scent](https://www.nngroup.com/articles/information-scent/), [NN/g cards](https://www.nngroup.com/articles/cards-component/), [NN/g complex applications](https://www.nngroup.com/articles/complex-application-design/), [Baymard product lists & filtering](https://baymard.com/blog/current-state-product-list-and-filtering), [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [GOV.UK settings pattern](https://design-system.service.gov.uk/patterns/change-additional-contact-details/), [`UI_DESKTOP_SPRINT_3.md`](UI_DESKTOP_SPRINT_3.md) research rubric.

---

## Research-backed layout principles (CP-LIA-0)

Cross-cutting rules for **all** layout families and card schemas. Route contracts (CP-LIA-1+) must trace back to these — not to “how the repo looks today.”

| Principle | Source | kink.social application |
|-----------|--------|-------------------------|
| **Match page type to mental model** | NN/g IA, complex apps | Feed pages feel like feeds; directories feel like find-and-compare; hubs feel like wayfinding; settings feel like forms — never swap models between routes. |
| **Information scent before decoration** | NN/g information scent | Every above-the-fold block answers what / why / what happens on click. Weak scent causes users to treat kink.social as disconnected features. |
| **Decision info stays visible** | Baymard lists, Sprint rubric | Event when/where/host, vendor trust/shipping, org legitimacy, person connect context — must not live only in hover or overflow on directory surfaces. |
| **Filters are part of the layout** | Baymard filtering | Desktop: persistent left rail when facet count is high (`directory-3col`, `marketplace-3col`). Low facet count: toolbar chips (`directory-2col`). Mobile: one filter entry (`FilterSheet` or drawer) — never orphan filters. |
| **Rails are secondary, not competing mains** | NN/g recommendation guidelines | Left rail = refine or section nav. Right rail = decision support, safety, suggestions. Center owns the user’s primary task. Empty rails feel broken — hide or fill with honest empty copy. |
| **Mobile is one column with a clear stack order** | Material adaptive layout, WCAG | Document order: header → primary action/context → main content → collapsed rail content. Tablet (`md`–`1023px`): often single main + sheet/drawer; avoid three skinny columns. |
| **Same entity, same schema** | NN/g cards, Baymard comparability | `event-decision` on Home, Explore, and Events — compact row vs card is density only. Breaking schema breaks scan learning site-wide. |
| **Trust and safety are layout slots** | C2K strategic guidance | Report/block/mute/safety panels get explicit schema slots and rail space on social, directory, messaging, and marketplace surfaces — not polish afterthoughts. |
| **Organizer is a different product mode** | NN/g complex apps, Atlassian | Member surfaces optimize discovery and connection; organizer surfaces optimize status, next action, and checklist — separate family, separate token stack today. |

**Tablet band (`md`–`1023px`):** Default policy for member routes — **single primary column** + bottom nav; page left/right rails hidden; filters via `FilterSheet`/drawer; feed scope via `CommunityNavBar` on home only. Do not introduce persistent 3-col below `lg` without route-specific approval.

---

## Layout families — validated reference (CP-LIA-0)

Use **one** primary family per route. Detail pages (`/events/:id`, `/groups/:id`, org hubs, etc.) are out of scope for this member pass — but must **reuse** the card schemas defined below.

**Shell width policy** (coded — do not change during IA pass): [`packages/web/src/lib/shell-contract.ts`](../packages/web/src/lib/shell-contract.ts)

| Shell class | Width cap (lg+) | Used by |
|-------------|-----------------|---------|
| `shellFeedClass` | ~1440 (`max-w-shell-feed`) | `/home` feed shell, `PersonalUtilityPageShell` |
| `shellWideClass` | ~1920 (`max-w-shell-wide`) | Profile, settings, home non-feed tabs |
| `shellOuterClass` + `shellDirectoryClass` | Outer 1920; inner grid fills | Discover directories, explore, messaging |

### Family summary table

| ID | Primary user job | Desktop (lg+) | Tablet (md–1023) | Mobile | Rail policy | Filter policy | Sticky behavior | Common failure mode | Research principle notes |
|----|------------------|---------------|------------------|--------|-------------|---------------|-------------------|---------------------|--------------------------|
| **`feed-3col`** | Catch up, post, see near-me activity, one next action | Left shortcuts · center feed (~640–760px) · right discover previews | Single column: scope nav + composer + feed; rails hidden | `CommunityNavBar` scope pills; composer above feed; bottom nav + FAB | Left: shortcuts/trust only — **not** duplicate scope tabs. Right: grouped discover previews with “why here.” | Scope in nav/chips — not left rail | Page header optional; feed scrolls; avoid sticky duplicate scope controls | Feed becomes dashboard widgets; sidebar competes with stream; duplicate scope tabs (known `/home` issue) | NN/g: reduce feed overload via type clarity and scope control ([social feed insights](https://www.nngroup.com/articles/social-media-research-insights/)). Center column = reading width (~45–75 char body). Composer adjacent to stream ([LinkedIn/Twitter convention](https://www.nngroup.com/articles/recommendation-guidelines/)). Sidebars for **secondary** discovery only. |
| **`hub-mosaic`** | Map the community when destination unknown; search, filter, or jump to a directory | Center-only `DirectoryTemplate`; internal 12-col mosaic (sections + inline 5-col companions) | Filter sheet + stacked sections; no side rails | `FilterSheet` + horizontal chip scroll; sections in **priority** order | **No** persistent left/right rails — filters in header toolbar | Header search + chips + sheet; active pills visible | Section headers sticky optional; avoid sticky chip + sticky header stack | Six equal sections → no scan path; hub becomes second home feed; weak “where next” on section CTAs | NN/g: strong information scent on cross-links ([information scent](https://www.nngroup.com/articles/information-scent/)). Hub = **router**, not destination — section priority reflects user decisions ([IA mistakes](https://www.nngroup.com/articles/3-ia-mistakes/)). Search + browse equally valid ([Baymard search types](https://baymard.com/blog/ecommerce-search-query-types)). |
| **`directory-3col`** | Find and compare items in one domain; refine; shortlist | Left refine/filters · center results · right widgets (`xl` or `lg`) | Single column results; filters in sheet | `FilterSheet` + result list/grid; right rail below or omitted | Left: facets only. Right: decision support — not duplicate filters | Left rail desktop; `FilterSheet` mobile; result count visible | Result summary near top; list scrolls; optional sticky filter summary bar | Filters duplicated in header and rail; empty right rail; list/grid without comparable fields | Baymard: faceted filtering + visible result context ([product list UX](https://baymard.com/blog/current-state-product-list-and-filtering)). List rows for **comparison**; grid for **browse** when media-forward. Trust cues inline, not buried. |
| **`directory-2col`** | Same as directory — fewer facets; hero/toolbar carries filter weight | Center results · right widgets only | Toolbar chips + sheet/drawer; no left rail | Chips or drawer; rail content stacks below grid | **No** left rail — toolbar/chips own filters | Horizontal chips + drawer when facets exceed ~3 | Hero + sort row may stick; avoid double sticky with global header | Toolbar overcrowded; filters “coming soon” dead weight (`/places` risk); rail duplicated on mobile (`/media` today) | Use when facet count is low — persistent left rail adds noise (Baymard: expose filters without hiding). Right rail for trust/featured only. |
| **`marketplace-3col`** | Browse vendors; compare trust, category, shipping; open shop | Left category/trust filters · center grid · right featured/safety | Sheet + grid; trust banner visible | `FilterSheet` + vendor grid; external-shop flow clear in card | Left: category + trust facets. Right: featured + safety + “vending soon” honest stubs | Same as `directory-3col` + marketplace-specific trust facets | Category context sticky in header on scroll optional | Generic product cards without trust/shipping; external shop surprise; CommunityNavBar inconsistency (`/vendors` today) | Baymard marketplace: category + trust near decision ([marketplace UX](https://baymard.com/blog/marketplace-ux)). Polaris: primary action = view shop / contact. C2K: adult-community fraud cues visible — ships/external badges required in schema. |
| **`library-2col`** | Manage **my** registrations, groups, posts, saved — not discover | Left section nav · center list | Section nav → drawer/tabs; center list | Mobile drawer or tabs for section; honest empty states | Left: **section nav only** (My / Invitations / Saved) — not discover filters | Section = URL/query mode; no discover FilterSheet | Section nav may stick within page shell | Discover filters leak into library mode; user cannot tell browse vs mine | GOV.UK task-list pattern: section nav for owned collections. Clear mode switch in URL + header ([task list](https://design-system.service.gov.uk/components/task-list/)). Same **entity schemas** as discover — different layout family. |
| **`profile-3col`** | Understand identity; trust; connect or message; explore tabbed depth | Cover (lg+) · left story · center tabs · right social rail | Stacked hero → story → tabs; cover often lg+ only | Single column stack; primary actions in hero | Left: story/about. Right: mutuals/links — not primary content | Tabs = content filter — not directory facets | Cover + action row sticky cautiously on mobile | Admin/form density on visitor view; tab order hides trust; owner tools mixed with public tabs | Social profile convention: identity + primary actions above fold; tabs for depth ([profile patterns](https://www.nngroup.com/articles/profile-pages/)). Visitor vs owner action hierarchy. Mobile: compress hero, keep connect/message visible (WCAG target size). |
| **`inbox-split`** | Triage conversations; reply; access safety without leaving thread | List ~340px · thread · safety aside (xl+) | List **or** thread — not both narrow | Single pane + back; safety banner/sheet | List = triage. Center = conversation. Right = safety tools | Folder tabs + inbox filters in list header — not center | List header sticky within pane; thread scrolls independently | Duplicate empty CTAs (list + main); dead thread pane; safety buried | Gmail/Outlook split-pane convention; mobile **one pane + back** (Material adaptive). Safety panel always reachable on adult platform — explicit slot in layout family. |
| **`utility-2col`** | Triage notifications or activity; act or dismiss | Left app shortcuts · center list (~52rem) | Nav collapses; center full width | Full-width list; bottom nav | Left: app nav shortcuts — not content filters | Filter tabs/chips in center header if needed | List header + filter row sticky optional | Single notification floating in 1920px void; duplicate profile/trust widgets | Notification center: unread hierarchy, batch triage, action adjacent to row ([Apple HIG status patterns](https://developer.apple.com/design/human-interface-guidelines/activity-views)). Density scales with viewport — not one row centered. |
| **`settings-2col`** | Change account/privacy/preferences; danger actions separated | Left settings tabs · center forms · optional danger aside (account) | Tabs stack above forms | Tabs → sections; form max ~640px | Left: global settings IA — not page-specific filters | Tab = settings domain | Section headings visible; danger zone never inline with casual fields | Staff/mod blocks shown to all users; danger actions adjacent to profile photo | GOV.UK: group related fields; separate irreversible actions ([settings pattern](https://design-system.service.gov.uk/patterns/change-additional-contact-details/)). WCAG: logical focus order through forms. |
| **`organizer-dashboard`** *(member pass: document only)* | Run events/orgs/groups: status, next action, staffing, publish | Sidebar domain nav · status bar · context rail · main workspace | Collapsed sidebar + drawer; single main | Not primary mobile target — door mode excepted | Sidebar = domain tabs. Context rail = checklist/risks. Main = task workspace | Command palette + sidebar — not member FilterSheet | Status bar + sidebar sticky; main scrolls | Member polish applied to organizer; admin density on member routes; duplicate command bridges | NN/g complex apps: show status, next action, risks ([complex application design](https://www.nngroup.com/articles/complex-application-design/)). Atlassian: sidebar for domains, content for work. **Out of scope** for CP-LIA-1–13 — shell: `OrganizerAppShell`, `OrganizerCommandShell`. |

**Example routes (member pass):**

| Family | Routes today (router + inspected components) |
|--------|-----------------------------------------------|
| `feed-3col` | `/home` (`HomePageClient.tsx`, `home-feed-layout.ts`) when `isHomeFeedPresentation` |
| `hub-mosaic` | `/explore` (`ExploreDashboardPage.tsx`, `DirectoryTemplate` without rails) |
| `directory-3col` | `/events`, `/groups`, `/people`, `/education` discover modes |
| `directory-2col` | `/orgs`, `/media` |
| `marketplace-3col` | `/vendors` |
| `library-2col` | `/events?mine=*`, `/groups?tab=my|invitations|posts|saved` |
| `profile-3col` | `/profile`, `/profile/:username` (`ProfilePageShell`) |
| `inbox-split` | `/messaging` (custom `shellDirectoryClass` grid) |
| `utility-2col` | `/notifications`, `/activity` (`PersonalUtilityPageShell`) |
| `settings-2col` | `/settings/*` (`SettingsLayout`) |
| `organizer-dashboard` | `/organizer/**` (`OrganizerAppShell`) |

---

## Shared card schemas — validated reference (CP-LIA-0)

Define **information slots and action hierarchy**, not visual skin. Sprint 3 card polish (CP-LIA-15) waits until schemas are aligned in code (CP-LIA-14).

**Global alignment rule:** Same entity type → same schema ID across routes. Density variants: **compact row** (Explore, rails) vs **standard card** (grid) vs **featured** (hero strip) — slot order unchanged.

| Schema ID | Entity decision | Required slots (display order) | Optional slots | Primary action | Safety / trust action | Never primary | Compact row rules | Mobile compression |
|-----------|-----------------|----------------------------------|----------------|----------------|----------------------|---------------|-------------------|-------------------|
| **`event-decision`** | Attend or save for later | date block · title · when label · location/format · host or social proof · primary action | thumbnail, RSVP count, format badge, mutuals going | View details / RSVP | Report event (overflow ok if labeled) | Decorative media, host avatar alone | Drop thumbnail first; keep date block + title + location + action | Single column: date block inline left or top; action full-width if needed |
| **`community-join`** | Join or view group community | avatar/cover · name · member signal · purpose/tags · join/view action | privacy badge, last activity, location | View group / Join | Report group | Member count without context | Horizontal row: avatar + name/purpose + action | Stack avatar above text; keep purpose line visible |
| **`org-trust`** | Trust organizer before visiting hub | logo · name · trust tier · review signal · scope/location · view action | featured badge, event count teaser | View org | Report org | Star rating without review count | Row: logo + name/trust + action | Trust tier + review count must remain visible |
| **`marketplace-vendor`** | Open shop or contact vendor | logo · shop name · category · trust signal · ships/external badge · shop action | cover, rating, convention badge | Visit shop / List shop | Report vendor | Cover image without shop name | Row: logo + name/category/trust + action | External shop badge required when applicable |
| **`person-connect`** | Connect or view profile | avatar · display name · role/kind · location/activity · connect/view | mutuals, tags, trust chip | View profile / Connect | Report / block (profile context) | Avatar-only card | Row: avatar + name/role + action | 2-col grid max; name wraps; tags collapse to +N |
| **`education-entry`** | Read, continue, or save lesson | type badge · title · level/topic · author · read/continue | duration, series, progress | Read / Continue | Report article | “SOON” admin stub as primary content | Strip card: drop cover; keep title + level + author | Single column list; progress bar if continue |
| **`media-channel`** | Follow or browse show/channel | cover · channel name · content type · creator · follow/browse | episode count, visibility badge | Browse channel | Report channel | Empty cover box without title | Row: small thumb + name/type + action | Cover aspect fixed; title never truncated before type |
| **`feed-activity`** | Engage with post or actor update | actor · verb/context · content preview · reaction/action row | repost banner, media, link preview | Discuss / react / share | Report post | Reaction counts without actions | Collapse link preview; keep actor + verb + one action row | Full-width actions; touch targets ≥44px |
| **`suggestion-row`** | Understand why recommended; act | type label · name · reason · action | avatar/thumb | View suggested entity | Dismiss/hide if wired | Reason text omitted | Always show reason — compact type label | Reason wraps; type label above name |
| **`hub-section`** | Choose to drill into a domain | section title · why this section · view-all · 3–6 previews | empty state with honest CTA | View all | — | Empty section with no explanation | Max 3 previews in compact hub | Stack section header + previews; view-all visible |
| **`notification-row`** | Triage alert; act or dismiss | unread indicator · type/icon · title · time · primary action | actor thumb, secondary link | Open target / Mark read | Report if applicable | Timestamp without title context | Single line title + time; action icon | Full-width tap row; swipe actions deferred |
| **`message-row`** | Open conversation; see urgency | partner avatar · name · snippet · time · unread state | trust chip, folder badge | Open thread | Report user/message (thread context) | Snippet without name | Fixed height row; snippet one line ellipsis | Same row pattern; back nav on thread view |
| **`settings-section`** | Complete settings task in grouped form | section title · helper text · fields · save implicit on blur/submit | inline validation | Save / Continue (if explicit) | Privacy/safety cross-links | Staff/mod tools for non-staff | N/A — form sections not cards | Single column; danger never in same card as avatar upload |
| **`profile-header`** | Recognize person; connect/message/block | cover (lg+) · avatar · display name · trust/role · primary actions (connect/message) | badges, location, mutual count | Connect / Message | Block / Report | Edit profile (visitor view) | N/A — header zone not list card | Stack: avatar + name + actions; cover hidden or shortened on mobile |

**Canonical components today (repo — CP-LIA-0 inspection):**

| Schema | Components / location |
|--------|----------------------|
| `event-decision` | `EventsListRow`, `EventCard`, `EventsFeaturedStrip`, `ExploreCompactEventRow` |
| `community-join` | `GroupDiscoverListCard`, `GroupCard` |
| `org-trust` | `OrgDirectoryCard`, `OrgCard` |
| `marketplace-vendor` | `VendorCard` |
| `person-connect` | `FindPeopleProfileCard`, `PersonCard` |
| `education-entry` | `EducationArticleStripCard`, `EducationCard` |
| `media-channel` | `MediaChannelCard` |
| `feed-activity` | `LocalPostCard`, `ActivityFeedCard` |
| `suggestion-row` | `ExploreSuggestedRow`, `HomeFeedSuggestedPerson` |
| `hub-section` | `ExploreHubSection` |
| `notification-row` | `NotificationRow` in `NotificationsPageClient.tsx` |
| `message-row` | Inline `ConvRow` / conversation list in `messaging/page.tsx` — **not yet extracted** |
| `settings-section` | `SettingsAccountSection`, `SettingsAppearanceSection`, etc. |
| `profile-header` | `ProfileCoverHeader`, `ProfilePublicHero`, `ProfileHeroCard` — **multiple implementations; consolidate in CP-LIA-10/14** |

---

## Repo layout inventory (CP-LIA-0 code inspection)

Inspected 2026-06-13 for foundation validation. Do not treat as frozen — re-verify before each CP-LIA-n implementation.

| Route | Router entry | Main component | Shell / template | `*-page-layout.ts` | Notes |
|-------|--------------|----------------|------------------|-------------------|--------|
| `/home` | `app/home/page.tsx` | `HomePageClient.tsx` | `shellFeedClass` or `shellWideClass` | `home-feed-layout.ts` | 3-col when `isHomeFeedPresentation` |
| `/explore` | `app/explore/page.tsx` | `ExploreDashboardPage.tsx` | `DirectoryTemplate` (no rails) | `explore-page-layout.ts` | Hides `CommunityNavBar` |
| `/events` | `app/events/page.tsx` | `EventsDiscoverPage.tsx` / personal / group branch | `DirectoryTemplate` | `events-page-layout.ts` | Right rail `xl+`; FilterSheet mobile |
| `/groups` | `app/groups/page.tsx` | `GroupsDiscoverPage.tsx` / `GroupsPersonalLibraryPage.tsx` | `DirectoryTemplate` + `shellOuterClass` | `groups-page-layout.ts` | Right rail `lg+` |
| `/orgs` | `app/orgs/page.tsx` | inline `OrgsListPage` | `DirectoryTemplate` + `shellOuterClass` | `orgs-page-layout.ts` | No left rail; chips in toolbar |
| `/vendors` | `app/vendors/page.tsx` | inline page | `DirectoryTemplate` + `shellOuterClass` | **none** — `CommunityNavBar` not hidden |
| `/education` | `app/education/page.tsx` | `EducationDiscoverPage.tsx` | `EducationDiscoverShell` + `DirectoryTemplate` | `education-page-layout.ts` | Custom topics drawer (not FilterSheet) |
| `/media` | `app/media/page.tsx` | inline page | `DirectoryTemplate` + `shellOuterClass` | **none** | Right rail duplicated below on mobile |
| `/people` | `app/people/page.tsx` | `FindPeopleDiscoverPage.tsx` | `DirectoryTemplate` + `shellOuterClass` | `explore-page-layout.ts` | Canonical people directory |
| `/profile` | `app/profile/**` | `ProfilePageClient.tsx` / username page | `ProfilePageShell` | — | 3-col grid lg+ |
| `/messaging` | `app/messaging/page.tsx` | inline page | Custom `shellDirectoryClass` | — | Split pane lg+; mobile single pane |
| `/notifications` | `app/notifications/page.tsx` | `NotificationsPageClient.tsx` | `PersonalUtilityPageShell` | — | Left `HomeDashboardLeftRail` lg+ |
| `/settings/account` | `SettingsLayout` + `account/page.tsx` | account sections | `SettingsLayout` (`shellWideClass`) | — | Danger aside lg on account |
| `/organizer/**` | `app/organizer/**` | various | `OrganizerAppShell` | — | Out of member CP-LIA-1–13 scope |

**Shared primitives:** `DirectoryTemplate.tsx`, `shell-contract.ts`, `PersonalUtilityPageShell.tsx`, `FilterSheet` + `DirectoryFilterButton`, `community-nav.ts` + per-route hide helpers.

---

## CP-LIA-0 status

| Field | Value |
|-------|--------|
| **Checkpoint** | CP-LIA-0 — Research-backed layout family + card schema approval |
| **Status** | **Approved** (2026-06-13 — user) |
| **Date** | 2026-06-13 |
| **Implementation changes** | **None** — docs only |

### Files inspected

- `docs/UI_DESKTOP_SPRINT_3_LAYOUT_INFORMATION_ARCHITECTURE.md` (prior draft)
- `docs/UI_DISCOVER_REFRESH_PROGRESS.md`
- `docs/UI_DESKTOP_SPRINT_3.md`
- `docs/design/02-LAYOUT_AND_RESPONSIVE.md`
- `docs/FEATURE_REGISTRY.md` §2
- `packages/web/src/router.tsx`
- `packages/web/src/lib/shell-contract.ts`
- `packages/web/src/lib/home-feed-layout.ts`
- `packages/web/src/lib/community-nav.ts`
- `packages/web/src/lib/*-page-layout.ts` (events, groups, explore, orgs, education, conventions)
- `packages/web/src/components/templates/DirectoryTemplate.tsx`
- `packages/web/src/components/layout/PersonalUtilityPageShell.tsx`
- `packages/web/src/components/profile/layout/ProfilePageShell.tsx`
- `packages/web/src/components/organizer/ui/OrganizerAppShell.tsx`
- `packages/web/src/app/home/HomePageClient.tsx`
- `packages/web/src/app/explore/ExploreDashboardPage.tsx`
- `packages/web/src/app/events/EventsDiscoverPage.tsx`
- `packages/web/src/app/groups/GroupsDiscoverPage.tsx`
- `packages/web/src/app/orgs/page.tsx`
- `packages/web/src/app/vendors/page.tsx`
- `packages/web/src/app/education/EducationDiscoverPage.tsx`
- `packages/web/src/app/media/page.tsx`
- `packages/web/src/app/discovery/FindPeopleDiscoverPage.tsx`
- `packages/web/src/app/messaging/page.tsx`
- `packages/web/src/app/notifications/NotificationsPageClient.tsx`
- `packages/web/src/app/settings/SettingsLayout.tsx`
- `packages/web/src/app/settings/account/page.tsx`

### Families validated

All 11 families documented with research notes and failure modes: `feed-3col`, `hub-mosaic`, `directory-3col`, `directory-2col`, `marketplace-3col`, `library-2col`, `profile-3col`, `inbox-split`, `utility-2col`, `settings-2col`, `organizer-dashboard` (document-only for member pass).

### Schemas validated

All 14 schemas documented with slot order and action hierarchy: `event-decision`, `community-join`, `org-trust`, `marketplace-vendor`, `person-connect`, `education-entry`, `media-channel`, `feed-activity`, `suggestion-row`, `hub-section`, `notification-row`, **`message-row`** (new), `settings-section`, **`profile-header`** (new).

### Top structural risks (before route work)

1. **Schema drift** — `ExploreCompactEventRow` vs `EventsListRow` vs home embeds may not share `event-decision` slot order (CP-LIA-2, CP-LIA-14).
2. **Filter/mobile inconsistency** — `FilterSheet` vs inline drawer vs chips-only across `/education`, `/media`, `/orgs`, `/vendors`.
3. **Nav chrome** — `/vendors` lacks `*-page-layout.ts` hide for `CommunityNavBar`; breaks discover IA.
4. **Rail duplication on mobile** — `/media` right rail stacks below grid; policy must pick one pattern for `directory-2col`.
5. **Profile header fragmentation** — three header components; `profile-header` schema needs consolidation (CP-LIA-10).
6. **Message row not componentized** — inbox layout family validated but `message-row` schema lives inline in `messaging/page.tsx` (CP-LIA-11).
7. **Home scope duplication** — feed shell vs legacy `FeedScopeTabs` (CP-LIA-1).
8. **Organizer vs member** — separate families documented; resist applying member directory polish to `OrganizerAppShell`.

### Open questions for user approval

1. **CP-LIA-0 approved?** Accept layout families + card schemas as site-wide foundation?
2. **Tablet policy** — Confirm default “single column + sheet” for `md`–`1023` on all discover routes?
3. **`directory-2col` filter standard** — Standardize on chips + optional drawer, or migrate `/orgs` and `/media` to `FilterSheet`?
4. **`/vendors` nav** — Hide `CommunityNavBar` like other discover routes (add `vendors-page-layout.ts`)?
5. **`profile-header`** — Single canonical header component in CP-LIA-10, or document three variants?
6. **List vs grid default** — Events/people: list-first for comparison vs grid-first for browse — per-route or global rule?

### Routes blocked until CP-LIA-0 approved

**CP-LIA-0 Approved (2026-06-13).** Foundation locked. **CP-LIA-1 Home contract approved** — structural implementation may proceed when owner confirms.

| After user says | Agent may start |
|-----------------|-----------------|
| CP-LIA-0 Approved | **Done** |
| Home CP-LIA-1 contract approved | CP-LIA-1 structural implementation (`/home` only) |
| Other route contract Approved | That route’s CP-LIA-n only |

### Agent workflow (permanent)

**Product owner provides research-backed UX direction.** Cursor inspects the repo and executes only the scoped checkpoint — it does not invent product strategy.

---

## CP-LIA-1 status — `/home`

| Field | Value |
|-------|--------|
| **Checkpoint** | CP-LIA-1 — Home feed command center layout contract |
| **Status** | **Complete** (2026-06-13 — structural implementation) |
| **Date** | 2026-06-13 |
| **Code changes this session** | `LocalHomeFeed.tsx`, `FollowingFeedTab.tsx`, `HomePageClient.tsx` — scope dedup + welcome panel gate |

### Duplicate scope control diagnosis

**Rule:** One scope system — no competing Following / Near you / Trending controls on one screen.

| Control | Component | When | Viewport |
|---------|-----------|------|----------|
| **Canonical** | `HomeFeedScopeNav` | `CommunityNavBar` on `/home` | **&lt; lg** |
| **Canonical** | `HomeFeedScopeNav` | `HomePageClient` when `showFeedThreeColumn` | **lg+** |
| **Legacy (remove in feed shell)** | `FeedScopeTabs` | `LocalHomeFeed` / `FollowingFeedTab` when `feedShell` | **&lt; lg** (hidden lg+ via `hideOnDesktop`) |

**Desktop:** No duplicate today. **Mobile/tablet feed shell:** duplicate — sticky `HomeFeedScopeNav` (A) plus in-column `FeedScopeTabs` (B) with different labels (For you / Nearby / Organizers).

**Also above-the-fold:** `HomeWelcomePanel` in center when `showFeedThreeColumn && !returningMember`; `FeedScopeTabs` “Community activity” heading on mobile.

**Proposed structural fix (safe, small):**

1. Do not render `FeedScopeTabs` when `feedShell === true` (`LocalHomeFeed.tsx`, `FollowingFeedTab.tsx`).
2. Gate `HomeWelcomePanel` out of feed-shell center above composer.
3. Keep `HomeFeedScopeNav` as sole scope owner (mobile: `CommunityNavBar`; desktop: `HomePageClient`).
4. Keep `FeedScopeTabs` for `feedShell === false` only.
5. Keep `FollowingFeedTab` content filters (`TabShell` All/Posts/Events) — not scope.

See [§ Home scope control rule](#home) for full contract.

---

## What “layout contract” means (eight fields)

Every member route in scope must answer these **before** implementation. Field 8 is mandatory and must cite research-backed rationale — not internal opinion alone.

| # | Question | Deliverable field |
|---|----------|-------------------|
| 1 | What is this page **for**? (one user job) | `user_job` |
| 2 | What information appears **first** above the fold? | `above_the_fold` |
| 3 | What belongs in **center** vs **left rail** vs **right rail**? | `column_contract` |
| 4 | What **changes on mobile** (stack order, drawers, hidden rails)? | `mobile_contract` |
| 5 | Which **card schema** applies to center items? | `card_schema` |
| 6 | Which **layout family** does this page belong to? | `layout_family` |
| 7 | What **implementation checkpoint** runs first? | `checkpoint` |
| 8 | **Why** is this layout structured this way? (research principle notes) | `research_principle_notes` |

No CSS edits, no copy tweaks, no “make cards prettier” until all eight fields are filled for that page **and** research notes precede the draft.

Route-level contracts must reference a **validated layout family** and **card schema** from [Layout families — validated reference](#layout-families--validated-reference-cp-lia-0) and [Shared card schemas — validated reference](#shared-card-schemas--validated-reference-cp-lia-0) above.

---

## Global navigation + chrome contract

Already shipped (UI-DISC-1) — IA reset **documents** behavior; changing it requires explicit approval.

| Chrome | Role | Visibility |
|--------|------|------------|
| `Header` | Global top nav | All authenticated routes |
| `CommunityNavBar` | Home feed scope only (Following / Near you / Trending) | Home paths only; hidden on discover via `*-page-layout.ts` |
| `BottomNav` | Primary mobile destinations | `< md` (767px mount guard) |
| Page left rail | Refine, section nav, shortcuts | Route-specific; `lg+` |
| Page right rail | Decision support, suggestions, safety | Route-specific; `lg` or `xl+` |
| `FilterSheet` | Mobile filters | Directories that use `DirectoryFilterButton` |

**Known inconsistency to resolve in IA (not polish):** `/vendors` still shows `CommunityNavBar` while sibling discover routes hide it — pick one policy in vendors contract.

---

## Page contract registry

| Route | Research | Contract status | Layout family | Brief / contract section |
|-------|----------|-----------------|---------------|--------------------------|
| `/home` | **Approved** (CP-LIA-1 contract) | **Approved** | `feed-3col` | [§ Home](#home) |
| `/explore` | **Not started** | **Draft** | `hub-mosaic` | [§ Explore](#explore) |
| `/events` | **Not started** | **Draft** | `directory-3col` (+ `library-2col` for `?mine=*`) | [§ Events](#events) |
| `/groups` | **Not started** | **Draft** | `directory-3col` (+ `library-2col` for `?tab=*`) | [§ Groups](#groups) |
| `/orgs` | **Not started** | **Draft** | `directory-2col` | [§ Orgs](#orgs) |
| `/vendors` | **Not started** | **Draft** | `marketplace-3col` | [§ Vendors](#vendors) |
| `/education` | **Not started** | **Draft** | `directory-3col` | [§ Education](#education) |
| `/media` | **Not started** | **Draft** | `directory-2col` | [§ Media](#media) |
| `/people` | **Not started** | **Draft** | `directory-3col` | [§ People](#people) |
| `/profile` | **Not started** | **Draft** | `profile-3col` | [§ Profile](#profile) |
| `/messaging` | **Not started** | **Draft** | `inbox-split` | [§ Messaging](#messaging) |
| `/notifications` | **Not started** | **Draft** | `utility-2col` | [§ Notifications](#notifications) |
| `/settings/account` | **Not started** | **Draft** | `settings-2col` | [§ Settings account](#settings-account) |

**Workflow:** **Research notes** → draft contract (eight fields) → user review → status **Approved** → structural implementation checkpoint → only then optional Sprint 3 visual polish for that route.

**Research status values:** `Not started` | `Draft` (notes in route section) | `Approved` (principles accepted with contract).

---

## Per-route layout contracts (draft)

Each subsection follows the **eight-field contract**. Routes other than `/home` remain **Draft** until owner provides guidance and approves the contract. **Home is approved** for CP-LIA-1 structural implementation.

### Home

**CP-LIA-1 contract — Approved for implementation (2026-06-13).** Product guidance provided by owner; Cursor applied to repo inspection.

#### Research principle notes

Home is a **feed command center**, not a dashboard, discovery hub, welcome page, settings panel, directory, or second Explore.

**User job:** Help me catch up, post, and find one useful next action.

Research anchors:

- **Information scent** — Every rail item and scope label must explain why it appears (near you, active this week, from a group you follow, new organizer near you). No vague “Discover more” blocks. ([NN/g information scent](https://www.nngroup.com/articles/information-scent/))
- **Cards as single conceptual units** — One object per card (post, event activity, group update, person suggestion). No mixed unrelated CTAs in one card. ([NN/g cards](https://www.nngroup.com/articles/cards-component/))
- **Responsive navigation** — Compact widths: bottom nav + single column; medium: rails collapse before center changes; expanded: persistent side rails only when justified. Aligns with CP-LIA-0 tablet policy and Material adaptive navigation guidance. ([Android responsive navigation](https://developer.android.com/develop/ui/views/layout/build-responsive-navigation))
- **Accessibility is layout** — Scope pills, composer, post actions, save/report need adequate target size and spacing ([WCAG 2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)); focus remains visible through layout changes ([WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).

**Home rule:** Center feed owns attention. Rails support decisions. Scope controls must not duplicate. Mobile gets one clean stack.

Home must answer, in order:

1. Which feed scope am I viewing?
2. Can I post quickly?
3. What happened since I was last here?
4. What is one useful nearby or followed action?
5. Where can I go deeper if I choose?

#### Eight-field contract

| Field | Contract |
|-------|----------|
| **user_job** | Catch up on followed/near-me activity; post quickly; find **one** useful next action — not browse the whole site. |
| **above_the_fold** | **Desktop:** (1) active scope label + orientation, (2) composer, (3) first feed item or intentional empty state; right rail may show **one** high-scent discovery block only after feed column established — must not compete with composer/feed. **Mobile:** (1) scope pills (`HomeFeedScopeNav` via `CommunityNavBar`), (2) composer or collapsed trigger, (3) first feed item or empty state — **no** left/right rail above feed, **no** welcome/dashboard cards, **no** duplicate scope rows. |
| **column_contract** | **`feed-3col` when `showFeedThreeColumn`:** **Left (lg+):** shortcuts, profile completion, trust reminders, lightweight orientation — not scope tabs, not primary feed, not full discovery modules. **Center:** feed stream only (composer + posts/activity); ideal width **640–760px** via grid `minmax(680px,760px)`; must not stretch to newspaper layout at 1600/1920. **Right (lg+):** reason-labeled discovery (`HomeFeedDiscoverRail` groups: plan your week, grow your network) — not generic widgets, not safety actions required to read feed. **Non-shell home modes** (discover tabs Events/Groups/etc.): not feed command center — use `shellWideClass`; deep-link policy favors standalone directories per UI-DISC-3. |
| **mobile_contract** | One column stack: scope → composer → feed → supplemental discovery **below** several items or behind explicit action. `CommunityNavBar` + `BottomNav` + optional FAB. Rails hidden. No `FeedScopeTabs` when feed shell active. |
| **tablet_contract** | **md–1023:** Behave closer to mobile — no forced 3-col; rails collapsed; scope + composer before feed; supplemental rail content below feed or hidden. |
| **card_schema** | Posts/activity: **`feed-activity`** (actor → context/visibility → timestamp → type cue → content → media → primary interaction → secondary actions → save/report). Embedded events: compact **`event-decision`**. Right rail people: **`suggestion-row`**. |
| **layout_family** | `feed-3col` (Following + Near you / Local discover tab only when `isHomeFeedPresentation` + `showFeedThreeColumn`) |
| **checkpoint** | **CP-LIA-1** — Scope dedup; remove welcome panel from feed-shell above-the-fold; document rail ownership; optional right-rail below feed on tablet. |
| **research_principle_notes** | See subsection above — owner-provided, repo-grounded. |

#### Rail ownership (explicit)

| Left rail (`HomeDashboardLeftRail`) | Right rail (`HomeFeedDiscoverRail`) |
|-------------------------------------|-------------------------------------|
| Shortcuts (messages, notifications, saved, etc.) | Upcoming near you (reason: area + RSVPs) |
| Profile completion checklist | People you may know (reason labeled) |
| Trust reminders | Suggested groups / organizer prompts |
| Lightweight orientation | Trending events teaser |
| **Not:** scope tabs, feed body, full discovery | **Not:** generic widgets, hollow empty panels, feed-required safety |

#### Sticky behavior

| Viewport | Policy |
|----------|--------|
| Desktop | Global header sticky (app chrome). Left/right rails may stick if short (`HomeFeedDiscoverRail` uses `sticky top-[7.5rem]`). Composer **not** a large sticky block. Feed scrolls normally. |
| Mobile | Do not sticky composer in a way that steals reading space. Scope bar sticky via `CommunityNavBar`. Safety/report on cards locally. |

#### Width behavior

| Viewport | Expected layout |
|----------|-----------------|
| **1280** | 3 columns allowed; compact rails; center feed readable (~680–760px). |
| **1440** | Ideal full feed command center (`shellFeedClass` reference). |
| **1600** | Rails breathe; center does not stretch — extra width to rails, not feed cards. |
| **1920** | `shellFeedClass` / `max-w-shell-feed` cap prevents stranded islands; right rail modules need density or max width — avoid giant empty columns. |

#### Scope control rule (implementation)

| Owner | Location |
|-------|----------|
| **`HomeFeedScopeNav`** | Mobile: `CommunityNavBar` (&lt; lg). Desktop: `HomePageClient` (lg+, when `showFeedThreeColumn`). |
| **`FeedScopeTabs`** | **Must not render** when `feedShell === true`. Legacy non-shell layouts only. |
| **Following content filters** | `FollowingFeedTab` `TabShell` (All/Posts/Events/…) — keep; not scope. |

#### Code context

`HomePageClient.tsx`, `FollowingFeedTab.tsx`, `LocalHomeFeed.tsx`, `home-feed-layout.ts`, `HomeFeedScopeNav.tsx`, `FeedScopeTabs.tsx`, `HomeDashboardLeftRail.tsx`, `HomeFeedDiscoverRail.tsx`, `FeedTemplate.tsx`, `CommunityNavBar.tsx`, `LocalPostCard.tsx`, `ActivityFeedCard.tsx`.

#### CP-LIA-1 risks

| Risk | Mitigation |
|------|------------|
| Removing `FeedScopeTabs` breaks non-shell home | Gate on `feedShell` only |
| `HomeWelcomePanel` removal affects onboarding | Relocate to left rail or post-first-item slot |
| Returning-member `feedFirst` composer order | Document in contract; keep feed-before-composer for that cohort only |
| Discover tabs on home (Events/Groups grids) | Out of CP-LIA-1 scope — separate IA for non-shell modes |
| E2E smoke targets `FeedScopeTabs` | Update smoke to query `Home feed scope` tablist only |

---

### Explore

| Field | Contract |
|-------|----------|
| **user_job** | Map the whole community when I do not know which directory to open; search, filter, or browse into a domain. |
| **above_the_fold** | Page purpose line; search + filter entry; primary discovery chips; first section OR featured trending — not six equal sections. |
| **column_contract** | **Center-only mosaic** (no DirectoryTemplate left/right rails). Internal grid: primary sections 7-col, companion blocks 5-col (upcoming events, people). Filters live in header toolbar + sheet — not a persistent left rail. |
| **mobile_contract** | `FilterSheet`; stacked sections in priority order; chips horizontal scroll; sign-in CTA when guest. |
| **card_schema** | `hub-section` wrappers; per-section previews use domain schemas (`event-decision`, `community-join`, etc.); `suggestion-row` for recommendations. |
| **layout_family** | `hub-mosaic` |
| **checkpoint** | **CP-LIA-2** — Section priority order + scan path documented in code comments; align compact event rows to `event-decision` schema with Events route. |
| **research_principle_notes** | *Pending.* Research `hub-mosaic`: discovery hub IA, information scent, section prioritization, search vs browse — then justify mosaic vs directory rails. |

**Code context:** `ExploreDashboardPage.tsx`, `ExploreHubHeader.tsx`, `explore-hub.ts`, `explore-page-layout.ts`.

**Pause note:** Sprint 3 Explore CP3 polish is **complete** — do not revisit header/card copy until CP-LIA-2 structural pass is approved.

---

### Events

| Field | Contract |
|-------|----------|
| **user_job** | Decide whether to attend: when, where, format, host, trust — then filter to a short list. |
| **above_the_fold** | Decision-oriented title + result count; featured/happening-soon strip OR first list rows; scope tabs (Upcoming / Past / Mine). |
| **column_contract** | **Left:** refine (date, format, location) — not agenda marketing copy. **Center:** featured strip + list/grid results. **Right:** decision support (host CTA, safety, social context) — xl+. |
| **mobile_contract** | `FilterSheet`; featured strip above list; right rail content moves below results or drops to single CTA block. |
| **card_schema** | `event-decision` for all list/grid/featured items. |
| **layout_family** | `directory-3col`; personal modes → `library-2col` |
| **checkpoint** | **CP-LIA-3** — Personal library (`EventsPersonalLibraryPage`) uses same list schema as discover; group scope (`?groupId=`) documents exception or aligns to 2-col discover. |
| **research_principle_notes** | *Pending.* Research `directory-3col` + event decision UX: filters, list vs grid, result counts, mobile filter sheets — then justify featured strip + rails. |

**Code context:** `EventsDiscoverPage.tsx`, `events-page-layout.ts`, `EventsDiscoverLeftRail`, `EventsRightRail`.

---

### Groups

| Field | Contract |
|-------|----------|
| **user_job** | Find a community to join or compare groups by purpose, size, and privacy expectations. |
| **above_the_fold** | Directory purpose line; scope/purpose chips; first page of group list — not personal library nav unless `?tab=*`. |
| **column_contract** | **Left:** purpose + privacy filters. **Center:** list cards (not grid of avatars). **Right:** suggested groups + safety (lg+). |
| **mobile_contract** | `FilterSheet`; sparse-results rail stacks below center. |
| **card_schema** | `community-join` via `GroupDiscoverListCard`. |
| **layout_family** | `directory-3col`; `?tab=my|invitations|posts|saved` → `library-2col` |
| **checkpoint** | **CP-LIA-4** — Personal library left nav labels match FEATURE_REGISTRY; discover vs library mode switch is obvious in URL + header. |
| **research_principle_notes** | *Pending.* Research community directory + join decision UX; library-2col for personal modes. |

**Code context:** `GroupsDiscoverPage.tsx`, `GroupsPersonalLibraryPage.tsx`, `groups-page-layout.ts`.

---

### Orgs

| Field | Contract |
|-------|----------|
| **user_job** | Find legitimate organizers and communities; compare trust signals before visiting an org hub. |
| **above_the_fold** | Hero trust framing (`OrganizationsHero`); search/sort; first row of org cards. |
| **column_contract** | **Center:** sortable grid/list. **Right:** featured orgs + safety (lg+). **No left rail** — filters in toolbar chips. |
| **mobile_contract** | Horizontal filter chips; right rail below grid. |
| **card_schema** | `org-trust` |
| **layout_family** | `directory-2col` |
| **checkpoint** | **CP-LIA-5** — Filter pattern matches `/media` (chip + drawer) or gains `FilterSheet` — pick one marketplace/directory policy. |
| **research_principle_notes** | *Pending.* Research org trust signals in directory UX; 2-col when filters live in toolbar. |

**Code context:** `app/orgs/page.tsx`, `OrganizationsHero`, `OrganizationsRightRail`, `orgs-page-layout.ts`.

---

### Vendors

| Field | Contract |
|-------|----------|
| **user_job** | Browse marketplace: category, search, trust, shipping — open shop or contact. |
| **above_the_fold** | Marketplace hero + trust note; search; category chips; first vendor results. |
| **column_contract** | **Left:** category + trust filters. **Center:** vendor grid. **Right:** featured + safety + vending soon. |
| **mobile_contract** | `FilterSheet`; resolve **CommunityNavBar** hide/show vs other discover routes. |
| **card_schema** | `marketplace-vendor` |
| **layout_family** | `marketplace-3col` |
| **checkpoint** | **CP-LIA-6** — Align nav chrome with events/groups (`vendors-page-layout.ts` if needed); empty media fallback policy. |
| **research_principle_notes** | *Pending.* Research marketplace discovery, trust/fraud cues, external shop flow — then justify 3-col filters + trust rail. |

**Code context:** `app/vendors/page.tsx`, `VendorsFiltersPanel`, `VendorsRightRail`.

---

### Education

| Field | Contract |
|-------|----------|
| **user_job** | Learn: pick topic/level, continue in-progress, discover instructors and articles. |
| **above_the_fold** | Learning hub hero; continue/progress slot (when data exists); topic entry — not “SOON” admin copy above real content. |
| **column_contract** | **Left:** topics + level nav. **Center:** hero + paths + article/video strips + catalog. **Right:** progress + suggestions (stub honest). |
| **mobile_contract** | Topics inline drawer (today) — IA decides FilterSheet parity vs keep custom drawer. |
| **card_schema** | `education-entry` |
| **layout_family** | `directory-3col` |
| **checkpoint** | **CP-LIA-7** — Center column section order (hero → continue → catalog); stub panels demoted below real content. |
| **research_principle_notes** | *Pending.* Research learning library IA: pathways, continue-learning placement, level progression. |

**Code context:** `EducationDiscoverPage.tsx`, `EducationDiscoverCenter`, `education-page-layout.ts`.

---

### Media

| Field | Contract |
|-------|----------|
| **user_job** | Browse shows/channels; understand content type and safety before follow/play. |
| **above_the_fold** | Hub title + explainer; browse/submit actions; first channels OR intentional empty state with guidance. |
| **column_contract** | **Center:** channel grid. **Right:** explainer + safety (lg+). **No left rail** — tags via drawer. |
| **mobile_contract** | Tag drawer; right rail duplicates below list (today) — IA should pick **one** mobile pattern. |
| **card_schema** | `media-channel` |
| **layout_family** | `directory-2col` |
| **checkpoint** | **CP-LIA-8** — Empty hub still satisfies above-the-fold contract (explainer + submit path, not hollow main column). |
| **research_principle_notes** | *Pending.* Research media library/channel browsing, content-type hierarchy, intentional empty states. |

**Code context:** `app/media/page.tsx`, `MediaRightRail`.

---

### People

| Field | Contract |
|-------|----------|
| **user_job** | Find people to connect with; refine by scope, activity, tags — canonical directory (not Explore people grid). |
| **above_the_fold** | Directory title; scope tabs; search; first profile grid page. |
| **column_contract** | **Left:** refine search. **Center:** profile grid. **Right:** PYMK + safety (lg+). |
| **mobile_contract** | `FilterSheet`; grid 1–2 columns. |
| **card_schema** | `person-connect` |
| **layout_family** | `directory-3col` |
| **checkpoint** | **CP-LIA-9** — Geo filter UI: wire or hide per [`UI_DISCOVER_REFRESH_PROGRESS.md`](UI_DISCOVER_REFRESH_PROGRESS.md) POL-2. |
| **research_principle_notes** | *Pending.* Research people directory UX: refine search, grid scanability, PYMK placement. |

**Code context:** `FindPeopleDiscoverPage.tsx`, `explore-page-layout.ts` (people uses same community-nav hide).

---

### Profile

| Field | Contract |
|-------|----------|
| **user_job** | Understand who this person is; trust signals; stories, events, writing, connections — decide whether to connect. |
| **above_the_fold** | Identity hero (cover, avatar, name, trust); primary connect/message actions; story or first tab content. |
| **column_contract** | **Left:** story sidebar (desktop). **Center:** tabbed studio content. **Right:** social rail (mutuals, links). **Below grid:** owner `ProfileMeHub` when self. |
| **mobile_contract** | Stacked hero → story → tabs; cover desktop-only policy documented. |
| **card_schema** | Tab-specific; attended events use compact `event-decision`; header zone uses `profile-header`. |
| **layout_family** | `profile-3col` |
| **checkpoint** | **CP-LIA-10** — Tab order and default tab; reduce admin/form density in first tab for visitors. |
| **research_principle_notes** | *Pending.* Research profile layout: visitor vs owner, action hierarchy, tab order, mobile hero compression. |

**Code context:** `ProfilePageClient.tsx`, `ProfilePageShell`, `ProfileSocialRail`.

---

### Messaging

| Field | Contract |
|-------|----------|
| **user_job** | Read and reply to conversations safely; access safety tools without leaving thread. |
| **above_the_fold** | Inbox list or active thread header — never duplicate empty CTAs in list and main pane. |
| **column_contract** | **Left:** conversation list (~340px). **Center:** thread. **Right:** safety panel (xl+). |
| **mobile_contract** | Single pane: list OR thread with back; safety in overflow or sheet. |
| **card_schema** | Thread rows → `message-row`; not domain cards. |
| **layout_family** | `inbox-split` |
| **checkpoint** | **CP-LIA-11** — One empty-state pattern; dead zone in conversation pane addressed structurally (max-width, placeholder). |
| **research_principle_notes** | *Pending.* Research split-pane inbox, mobile single-pane, safety control placement, triage. |

**Code context:** `app/messaging/page.tsx`, `MessagingSafetyPanel`.

---

### Notifications

| Field | Contract |
|-------|----------|
| **user_job** | Triage what needs attention since last visit; act or dismiss. |
| **above_the_fold** | Page title + filter tabs if any; unread summary; first notification rows. |
| **column_contract** | **Left:** `HomeDashboardLeftRail` app shortcuts (desktop). **Center:** notification list (~52rem). **No right rail.** |
| **mobile_contract** | Full-width list; bottom nav; no duplicate trust profile card if empty. |
| **card_schema** | `notification-row` |
| **layout_family** | `utility-2col` |
| **checkpoint** | **CP-LIA-12** — Density balance at 1920 (not sparse single row); filter model documented. |
| **research_principle_notes** | *Pending.* Research notification triage, unread hierarchy, desktop density, action placement. |

**Code context:** `NotificationsPageClient.tsx`, `PersonalUtilityPageShell`.

---

### Settings account

| Field | Contract |
|-------|----------|
| **user_job** | Manage account identity, appearance, age confirmation, danger zone — without admin-console anxiety. |
| **above_the_fold** | Settings context (“Account”); first actionable section (profile basics) — not staff moderation blocks for non-staff. |
| **column_contract** | **Left:** `SettingsTabNav`. **Center:** form sections. **Right (lg):** danger panel on account route only. |
| **mobile_contract** | Tabs stack above content; form max-width ~640px. |
| **card_schema** | `settings-section` |
| **layout_family** | `settings-2col` |
| **checkpoint** | **CP-LIA-13** — Staff-only blocks gated by role in layout contract; appearance section order. |
| **research_principle_notes** | *Pending.* Research settings IA, form grouping, danger-zone placement, privacy visibility. |

**Code context:** `SettingsLayout.tsx`, `app/settings/account/page.tsx`.

---

## Implementation checkpoint order (structural only)

Do **not** skip ahead to card CSS polish.

| Order | ID | Scope | Type |
|-------|-----|-------|------|
| 0 | **CP-LIA-0** | Research + approve layout families, card schema table, repo inventory | **Ready for user review** — see [CP-LIA-0 status](#cp-lia-0-status) |
| 1 | **CP-LIA-1** | `/home` column contract + scope dedup + welcome panel gate | **Complete** |
| 2 | **CP-LIA-2** | `/explore` section priority + schema alignment | Layout structure |
| 3 | **CP-LIA-3** | `/events` discover + personal library consistency | Layout structure |
| 4 | **CP-LIA-4** | `/groups` discover vs library IA | Layout structure |
| 5 | **CP-LIA-5** | `/orgs` filter/chrome policy | Layout structure |
| 6 | **CP-LIA-6** | `/vendors` nav hide + marketplace rails | Layout structure |
| 7 | **CP-LIA-7** | `/education` center section order | Layout structure |
| 8 | **CP-LIA-8** | `/media` empty hub + mobile rail duplication | Layout structure |
| 9 | **CP-LIA-9** | `/people` geo filter honesty | Layout structure |
| 10 | **CP-LIA-10** | `/profile` tab IA | Layout structure |
| 11 | **CP-LIA-11** | `/messaging` split pane empty states | Layout structure |
| 12 | **CP-LIA-12** | `/notifications` density + rail duplication | Layout structure |
| 13 | **CP-LIA-13** | `/settings/account` section gating | Layout structure |
| 14 | **CP-LIA-14** | Cross-route card schema refactors (shared row components) | Component structure |
| 15 | **CP-LIA-15** | Resume Sprint 3 visual polish per route (optional) | Visual polish |

Each checkpoint: one scoped commit, typecheck + build + relevant smoke, mobile screenshot at 375 and 768 for touched routes.

---

## Hard rules (layout IA phase)

- **No contract approval** without **`research_principle_notes`** grounded in layout-family research — not taste or “match existing code” alone
- **No component polish** (copy, color, hover, glow, card borders) until that route’s contract is **Approved**
- **No new routes, API, auth, schema, or permission changes**
- **No RSVP, registration, join, payment, or moderation logic changes**
- **Extend** `DirectoryTemplate`, `shell-contract.ts`, `*-page-layout.ts` — do not add parallel templates without ADR
- **Mobile:** document stack order before changing CSS; respect [`UI_DESKTOP_SPRINT_3.md`](UI_DESKTOP_SPRINT_3.md) CSS boundary table
- **Organizer / convention surfaces** out of scope unless explicitly added

---

## Verification (each checkpoint)

```powershell
npm run typecheck -w web
npm run build -w web
npm run test:e2e:smoke
```

Viewports for structural changes: **375**, **768**, **1024**, **1440**, **1920** on the touched route.

Report: files changed, contract fields addressed, behavior preserved, mobile stack order, regressions.

---

## Copy-ready master prompt (paste into new Cursor chat)

```markdown
# C2K Layout + Information Architecture Reset

Read first:
- docs/UI_DESKTOP_SPRINT_3_LAYOUT_INFORMATION_ARCHITECTURE.md (full authority — CP-LIA-0 status, families, schemas)
- docs/UI_DISCOVER_REFRESH_PROGRESS.md
- packages/web/src/lib/shell-contract.ts
- packages/web/src/components/templates/DirectoryTemplate.tsx
- packages/web/src/router.tsx

## Gate

**CP-LIA-0 must be user-approved before CP-LIA-1+.** Route contracts remain Draft until individually approved.

## Direction

**Pause Sprint 3 visual polish.** Research-backed layout strategy by page type, then repo-grounded implementation.

Workflow: **Research notes → draft contract (8 fields) → user review → Approved → one CP-LIA implementation.**

Do not polish components until the route contract is Approved.

## If CP-LIA-0 is not yet approved

Complete or revise CP-LIA-0 only — strengthen families/schemas in the IA doc. No route work.

## If CP-LIA-0 is approved — next route (usually CP-LIA-1 `/home`)

1. Research layout family principles (cite NN/g, Baymard, WCAG, etc.)
2. Inspect code — no guessing
3. Update route subsection with eight fields including research_principle_notes
4. Stop for review OR implement one structural CP-LIA-n after approval

## Hard stops

- No visual polish (copy, color, hover, CSS)
- No API, auth, schema, RSVP, join, payment changes
- No new parallel templates
- One route per commit
```

---

## Related Sprint 3 artifacts (read-only during IA phase)

| Doc | Role |
|-----|------|
| [`UI_DESKTOP_SPRINT_3.md`](UI_DESKTOP_SPRINT_3.md) | CP1 audit, CSS boundaries, completed Home/Explore/Events polish |
| [`UI_DESKTOP_SPRINT_3_HOME_BRIEF.md`](UI_DESKTOP_SPRINT_3_HOME_BRIEF.md) | Shipped CP3 home |
| [`UI_DESKTOP_SPRINT_3_EXPLORE_BRIEF.md`](UI_DESKTOP_SPRINT_3_EXPLORE_BRIEF.md) | Shipped CP3 explore |
| [`UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md`](UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md) | Shipped CP3 events |
| [`UX_WALKTHROUGH_AUDIT.md`](UX_WALKTHROUGH_AUDIT.md) | Page-by-page user lens |

---

**Next action:** Verify CP-LIA-1 at `/home` (375, 768, 1440) — then owner guidance + **CP-LIA-2** (`/explore`). Do not polish cards/CSS on Home in this pass.
