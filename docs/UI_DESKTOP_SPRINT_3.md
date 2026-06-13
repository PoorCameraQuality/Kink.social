# Desktop UI Sprint 3 — Visual Experience Polish

**Status:** CP2.6 complete — CSS file ownership reconciled with docs. **CP3 Home + Events complete** for discovery polish; other page groups blocked until briefs.  
**Branch:** `desktop-ui-sprint-3-visual-polish` (recommended; may start from `desktop-ui-sprint-2-visual-baseline`)  
**Baseline tag:** `desktop-ui-sprint-2-visual-baseline`  
**Sprint 2 handoff:** Directory/detail template foundation complete enough — **do not continue CP6 migration unless regression found**  
**Monorepo anchor:** `packages/web` (Vite/React), `packages/api` (Fastify), `packages/shared`, `docs/`, `e2e/`, `scripts/` — inspect `packages/web/src/router.tsx` before guessing paths.

## Goal

Make the logged-in desktop app communicate clearly, feel trustworthy, and support discovery — **without** breaking functionality or mobile.

Sprint 3 polish means:

- Better **information scent** (what / why / what happens on click)
- Better **discovery** and **marketplace findability**
- Clearer **event decisions**, **education progression**, **media context**
- Visible **trust and safety**
- Less **admin/tooling language**
- Better **accessibility**
- Changes coded in **actual existing components**, not guessed paths

**Not** Sprint 3 polish: gradients for their own sake, richer cards without scanability, decorative headers without product intent.

## Hard rules (all checkpoints)

- No page/section polish without a completed Research + Code Context Brief **and explicit approval** for that page group
- No route, auth, API, schema, permission, onboarding, upload, payment, or moderation logic changes
- No event registration or RSVP logic changes
- No group/org/vendor/presenter membership or application logic changes
- No new sensitive profile fields
- No mobile redesign (`lg+` only; protect 768–1023 handoff)
- No explicit imagery; no stock sexual imagery
- No em dashes in user-facing copy

## Design direction

Keep existing kink.social dark/gold brand. Polish through **product-appropriate hierarchy**, not decoration:

- Information scent in headers, cards, rails, and CTAs
- Scannable card structure for comparable items (events, vendors, education)
- Subtle surface layering and restrained glow (**lg+** in `desktop-surfaces.css`)
- Trust and safety affordances remain visible

**Do not:** new color theme, neon, childish UI, crypto-dashboard aesthetic, generic Tailwind SaaS look, gradients without UX purpose.

**Target feel:** coherent community OS — social, discoverable, trustworthy, scannable, less admin, more intentional.

## Checkpoint progress

| CP | Scope | Status |
|----|-------|--------|
| 1 | Visual audit from screenshots → ranked polish plan | **Complete** (this doc §CP1) |
| 2 | Global atmosphere and surface polish | **Complete** (boundary repair in CP2.5) |
| 2.5 | Mobile CSS boundary repair (revert CP2 desktop leaks) | **Complete** (superseded by CP2.6 file split) |
| 2.6 | CSS file ownership reconciliation | **Complete** |
| 3+ | Per-page-group polish | **Events + Home complete** — **Explore brief next** |

---

## Checkpoint 1 — Visual audit (screenshots)

**Source:** Sprint 1 audit packet — 186 captures at 1280–1920 in [`docs/audits/ui/screenshots/ui-desktop-audit/`](audits/ui/screenshots/ui-desktop-audit/). Manifest: [`desktop-screenshot-manifest.json`](audits/ui/generated/desktop-screenshot-manifest.json). Heuristics: [`UI_DESKTOP_REDESIGN_RISK_REPORT.md`](audits/ui/screenshots/UI_DESKTOP_REDESIGN_RISK_REPORT.md).

**Viewports reviewed:** 1440, 1600, 1920 (plus 1280 where noted). Wider viewports amplify empty whitespace; polish should scale rails/content proportionally.

**Gaps:** `/groups` discover and `/orgs` directory list were not in the screenshot packet (audit captured group detail and org hub only). Classifications for those routes infer from Sprint 2 migrations + sibling directory patterns. Regenerate in CP7.

### Classification legend

| Tag | Meaning |
|-----|---------|
| **Strong** | Coherent layout; polish is refinement not rescue |
| **Acceptable** | Functional; needs atmosphere/cards/rails |
| **Weak** | Empty, flat, or visually underwhelming |
| **Too dense** | Cluttered above fold; needs hierarchy not more chrome |
| **Too admin** | Settings/console density on member surfaces |
| **Too generic** | Flat SaaS cards, no brand warmth |
| **Hero/header** | Title block, description, or CTA placement weak |
| **Cards** | Card surfaces, media fallbacks, hover hierarchy |
| **Rails** | Left/right rail surfaces feel utilitarian or empty |
| **CTA** | Primary/secondary action competition |
| **Spacing** | Section rhythm, vertical breathing, wide-viewport void |
| **Media** | Empty aspect boxes, broken/placeholder imagery |

### Per-route audit

| Route | Overall | Tags | Notes (1440–1920) |
|-------|---------|------|-------------------|
| `/home` | Acceptable | weak pockets, too generic, hero/header, cards, rails, spacing, media | Richest member surface but still dashboard-flat. Welcome block + feed tabs compete; 6–9 empty media regions; broken avatars at 1280. Right rail widgets (upcoming, PYMK, trending) are plain list cards. Strongest candidate for “alive” polish after global surfaces. |
| `/explore` | **Strong** (relative) | cards, rails, spacing, media | Best hero composition in packet (featured beach card + upcoming rail). Still flat card borders; 8 empty media slots in heuristics. Right rail date blocks are good pattern to extend. |
| `/people` | Acceptable | too generic, cards, rails, spacing | DirectoryTemplate reference. PersonCard grid is readable but uniform grey boxes; recommended gold border is only accent. Left filter panel is dense/form-like. Right rail safety + suggestions need surface warmth. |
| `/events` | Acceptable | too dense, cards, rails, spacing, media | Most complete directory UX. 14 empty media regions (highlights + list). Three-col works; left agenda rail and right host CTA feel utilitarian. EventCard list rows are strong structure, weak atmosphere. |
| `/groups` | Acceptable *(inferred)* | hero/header, cards, rails, spacing | **No discover screenshot** — packet has group hub only. Post-CP2 DirectoryTemplate: scope tabs + list cards. Expect plain list rows, sparse right rail duplication, filter drawer not matching Events polish. |
| `/orgs` | Acceptable *(inferred)* | hero/header, cards, rails, spacing | **No `/orgs` list screenshot** — packet has org hub detail. OrganizationsHero is marketing-forward; directory grid + right rail need same card/rail treatment as vendors/events. |
| `/vendors` | Acceptable | weak pockets, too generic, hero/header, cards, rails, media | CP2 migration solid. Hero trust note + List shop CTA good. 11 empty media regions on vendor cards; grey placeholder initials feel admin. Right rail (vending soon, featured, safety) is text-heavy. |
| `/presenters` | Acceptable | acceptable but plain, hero/header, cards, spacing | Single-column hero card works; narrow max-width leaves wide void at 1600–1920. PresenterCard gradients on avatars are best card color in packet — extend pattern. |
| `/education` | **Strong** (relative) | too dense, cards, rails, media, CTA | Richest hub: hero glow, carousels, topic chips. “SOON” / not-wired copy reads admin. Empty article media slots. Left nav + right progress cards need surface harmony with center hero. |
| `/media` | Weak | weak/empty, hero/header, cards, rails, spacing | Empty-state dominates packet (seed has no channels). Page feels hollow despite good copy. Aside explainer cards are strongest element — main column needs atmosphere even when empty. |
| `/conventions` | Acceptable | cards, spacing, hero/header | Sidebar-main layout clean. Single featured card + wide void at 1920. Convention row card is good candidate for CP4 media/treatment polish. |
| `/places` | Weak | weak/empty, too generic, cards, hero/header, spacing | Sidebar-less directory; simple text cards, no imagery. “Location filters coming soon” bar is dead weight. Lowest visual energy in packet. |
| `/messaging` | Acceptable | spacing, rails, CTA | Split inbox layout correct. Duplicate empty CTAs (sidebar + main). Large dead zone in conversation pane; safety rail is minimal. Functional, not premium. |
| `/notifications` | Acceptable | spacing, rails, cards | Left app nav + single notification reads sparse at 1920. Notification row styling is fine; page needs density balance not more nav. Trust profile card in left rail duplicates home. |
| `/profile` | Acceptable | too dense, hero/header, cards, spacing, media | Hero gradient is best profile atmosphere in packet. Tabbed studio layout feels admin (form sections, upload dropzone). Multiple H1 heuristic. High polish payoff but **defer functional areas** — visual only. |
| `/settings/account` | Weak | too admin, too generic, spacing, cards | Form-forward settings shell. Flat bordered cards, staff moderation block visible to mod user. Lowest “social” energy — polish via surfaces/typography only. |

### Cross-cutting findings (all routes)

1. **Global atmosphere is the highest leverage fix** — background is near-flat black; subtle gold radial exists on some heroes but not unified. CP2 before per-page whack-a-mole.
2. **Card surfaces are uniform grey boxes** — `card-surface` from Sprint 1 helped; still need depth, border rhythm, hover lift, media fallback treatment.
3. **Right rails are utilitarian** — repeated SectionCard pattern, weak visual hierarchy, empty widgets (“No trending”, “No vending soon”) feel broken not intentional.
4. **1920 whitespace** — content islands float; rails drift outward. Address via shell max-width rhythm in CP2/CP6, not new layouts.
5. **Mobile chrome on desktop** — bottom nav visible in heuristics at desktop widths; hide/refine in CP2 (visual only).
6. **Hero/header inconsistency** — Explore + Education lead; Places + Media + Settings trail. Standardize title block, description, and action row in CP3.
7. **Do not migrate more templates** — Sprint 2 foundation is enough; remaining gaps are visual quality.

---

## Checkpoint 2 — Global atmosphere and surface polish

**Status:** Complete  
**Scope:** Shared primitives only — no route-specific page edits, no layout/API/auth changes.

### Changes

| Area | Files | What changed |
|------|-------|----------------|
| App atmosphere | `styles/site-atmosphere.css` | Layered dark base, vignette, warmer gold radial, quieter orbs (slower motion, lower opacity) |
| Surface tokens | `lib/dancecard/appearanceThemeBuilder.ts`, `styles/dancecard-tokens.css` | `--dc-shadow-soft`, `--dc-shadow-panel` with inner highlight |
| Card surfaces | `lib/card-surface.ts`, `components/ui/Card.tsx` | `dc-surface-lift`, richer borders, `railSurfaceCardClass`, `railNavShellClass`, `railAsideClass` |
| Desktop surface CSS | `styles/desktop-surfaces.css` (new), `app/globals.css` | Rail card gradient, header chrome (`lg+`), browse nav active polish, focus ring utility |
| Interaction | `styles/mobile-polish.css` | ~~Stronger hover/focus/empty-state~~ **reverted in CP2.5** — moved to `desktop-surfaces.css` lg+ |
| Empty states | `components/ui/EmptyState.tsx` | Surface variant uses shared lift tokens |
| Header | `components/Header.tsx` | `dc-header-chrome`, `dc-header-subnav`, `dc-browse-nav-link` active classes |
| Shared rail card | `components/ui/RailCard.tsx` (new) | Consolidates 13 duplicated local `RailCard` helpers |
| Right rails | 13 `*RightRail.tsx` files | Import shared `RailCard` + `railAsideClass` |
| Left nav shell | `components/home/HomeDashboardLeftRail.tsx` | `railNavShellClass` |

### Verification (CP2)

| Check | Result |
|-------|--------|
| `npm run typecheck -w web` | **Pass** |
| `npm run build -w web` | **Pass** |
| Screenshot matrix | **Deferred** — dev server not running in closure session; capture in CP7 |
| Route-specific polish | **Not started** (CP3+) |

### Mobile safety (CP2)

| Component | Impact |
|-----------|--------|
| `BottomNav` / `useMaxMd` | **Unchanged** — still `md:hidden`, mount guard at 767px |
| `CommunityNavBar` | **Unchanged** — still `lg:hidden` |
| Card / EmptyState / atmosphere | ~~Richer at all breakpoints~~ **CP2.5:** mobile empty/card rules restored to baseline; lift/glow lg+ only |
| Header chrome depth | **`lg+` only** via `@media (min-width: 1024px)` in `desktop-surfaces.css` |
| Browse subnav polish | **`lg+` only** — same media query |

### Deliberately not touched

- Individual route pages (`/home`, `/explore`, etc. headers/heroes)
- Domain cards (`EventCard`, `PersonCard`, …) — CP4
- `DirectoryTemplate` layout structure
- Organizer/convention shells and tokens
- Mobile bottom nav behavior, drawers, sheets, composer
- Landing/marketing pages (header uses same tokens; marketing layout unchanged)

---

## CSS boundary rule (permanent)

| File | Territory | Rules |
|------|-----------|-------|
| `shared-surfaces.css` | **Cross-breakpoint primitives** | Card `:active`, empty-state baseline, event date badge, feed stagger, identity/cover heroes, avatar ring. Document any change; affects all viewports. |
| `mobile-polish.css` | **Mobile-only layout** | Bottom-nav scroll pad (`c2k-mobile-scroll-pad`), horizontal snap carousel (`c2k-snap-carousel`). **No card polish, empty glow, or hover depth.** |
| `desktop-surfaces.css` | **Desktop lg+** | Stronger card hover/focus, rail gradients, header chrome, empty-state glow enhancement. `@media (min-width: 1024px)` + `(hover: hover) and (pointer: fine)` for hover. |
| `site-atmosphere.css` | **Cross-breakpoint** | App background orbs — document if changed; prefer subtle on mobile. |
| `card-surface.ts` | **Shared class strings** | Pairs with `.dc-card-polish` in `shared-surfaces.css`; depth via `dc-surface-lift` (lg+ in desktop-surfaces). |
| Token files | **Cross-breakpoint** | Any `--dc-shadow-*` change affects mobile — document in checkpoint notes. |

**Import order** (`globals.css`): `shared-surfaces.css` → `mobile-polish.css` → `desktop-surfaces.css`.

**Any edit to `mobile-polish.css` or `shared-surfaces.css` requires mobile screenshot verification** at 375, 390, 430, 768, 820, 912 on `/home`, `/events`, `/people`, `/messaging`.

---

## Research-backed visual rubric

All Sprint 3 polish (CP3–CP7) is judged against these principles, not “make surfaces richer.”

References: [NN/g information scent](https://www.nngroup.com/articles/information-scent/), [NN/g cards](https://www.nngroup.com/articles/cards-component/), [Baymard product lists](https://baymard.com/blog/current-state-product-list-and-filtering), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

1. **Community operating system** — One coherent shell across social, events, groups, orgs, vendors, education, media, organizer tools.
2. **Information scent** — Every header, card, rail item, and CTA answers: What is this? Why care? What happens on click?
3. **Social discovery** — Distinct feed card types; visible feedback controls; not a wall of identical posts.
4. **Event discovery** — Name, date, time, location, host, type, trust context, RSVP/register action visible immediately.
5. **Marketplace / vendor discovery** — Search, filters, sort, category chips, result context, clear shop/contact cards.
6. **Education** — Learning library feel: level, topic, outcome, instructor, series/progress, continue/read/save.
7. **Media** — Content type, creator/show, episode context, visibility/safety, save/report.
8. **Organizer dashboards** — Status, next action, checklist, risks, staffing, messages, publish state — not raw admin.
9. **Adult-community trust** — Safety controls visible; not all buried in overflow menus.
10. **Accessibility** — WCAG contrast, touch targets, visible focus, readable dark-mode text ([WCAG 2.2](https://www.w3.org/TR/WCAG22/), [focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).

---

## Research + Code Context Brief (required gate)

**Hard rule:** No page or section polish may begin until its brief is **written, handed back for review, and explicitly accepted**.

Applies to every member surface, including:

- `/home`, `/explore`, `/events`, `/groups`, `/orgs`, `/vendors`, `/education`, `/media`, `/people`, `/profile`, `/messaging`, `/notifications`, `/settings/account`
- Any **organizer** or **convention** surface touched by polish

One brief per **page group** (not one brief for the whole sprint). **Stop after writing the brief.** Do not implement until approval.

### Mandatory handback process (permanent)

Every page group follows this workflow. No generic “make it pretty” prompts.

| Step | Action | Who |
|------|--------|-----|
| 1 | **Inspect local code** on current branch — do not guess paths | Cursor |
| 2 | **Write** Research + Code Context Brief (§ template below) | User + ChatGPT, filed by Cursor |
| 3 | **Stop** — no implementation | Cursor |
| 4 | **Hand back** to user and ChatGPT: brief path, files inspected, principles used, proposed implementation files, safe/risky/defer, mobile risks, verification plan | Cursor |
| 5 | **Wait for approval** | User + ChatGPT |
| 6 | **Implement one page group only** — one scoped commit | Cursor |
| 7 | **Report back:** files changed, behavior preserved, mobile impact, verification, screenshots, regressions, next page group | Cursor |

**Handback deliverable checklist:**

- Brief file path (e.g. `docs/UI_DESKTOP_SPRINT_3_HOME_BRIEF.md`)
- Files inspected (actual paths from repo)
- Research principles applied
- Exact implementation files proposed
- Safe / risky / defer classification
- Mobile risks
- Verification plan

### Brief template (copy per page group)

Save completed briefs in this doc under [Brief registry](#brief-registry) or as `docs/UI_DESKTOP_SPRINT_3_BRIEFS/<group>.md`.

#### 1. Product pattern classification

Classify as one or more:

- social feed
- discovery directory
- event discovery / ticketing
- marketplace / vendor browsing
- education / learning
- media / show / channel browsing
- profile / community identity
- organizer dashboard / complex application
- utility inbox / settings
- trust and safety surface

#### 2. Research-backed principles

Summarize UX requirements for this pattern. Anchor on:

| Principle | Source | Requirement |
|-----------|--------|-------------|
| Information scent | [NN/g](https://www.nngroup.com/articles/information-scent/) | Labels, context, and next actions must answer what / why / what happens on click |
| Cards | [NN/g](https://www.nngroup.com/articles/cards-component/) | Group related info; compact entry points; consistent structure for comparable items |
| Social discovery | Sprint rubric | Mix post, event, group, media, education, vendor, next-action cards — not identical post walls |
| Event discovery | Sprint rubric | Name, date, time, location, host, type, trust, RSVP/register visible immediately |
| Marketplace | [Baymard](https://baymard.com/blog/current-state-product-list-and-filtering) | Filters, sort, category chips, result context, scannable product/list cards |
| Education | Sprint rubric | Learning library: topic, level, outcome, instructor, series/progress, continue/read/save |
| Media | Sprint rubric | Content type, creator/show, episode context, visibility/safety, save/report |
| Organizer dashboards | [NN/g complex apps](https://www.nngroup.com/articles/complex-application-design/) | Status, next action, risks, staffing — reduce clutter without reducing capability |
| Adult-community trust | Sprint rubric | Privacy, report, block, mute, save visible — not only in overflow |
| Accessibility | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Contrast, focus, target size, keyboard, readable dark-mode text |

#### 3. kink.social-specific user job

What is the user trying to accomplish on this page? (One paragraph, product-specific.)

#### 4. GitHub / code context

**Inspect before proposing implementation.** Record actual paths:

| Layer | Paths to identify |
|-------|-------------------|
| Route | `packages/web/src/router.tsx` entry + `packages/web/src/app/<route>/page.tsx` |
| Main client | `*PageClient.tsx`, `*DiscoverPage.tsx`, or inline page component |
| Template | `DirectoryTemplate`, custom shell, organizer shell |
| Cards | `packages/web/src/components/cards/*`, domain list rows |
| Rails | `*RightRail.tsx`, `*LeftRail.tsx` |
| Header / hero | Domain hero components |
| Empty / loading | `EmptyState`, `*EmptyPanel`, skeletons |
| Mobile-specific | `BottomNav`, `FilterSheet`, `HomeMobileComposer`, `useMaxMd` |
| CSS likely touched | `shared-surfaces.css` (cross-breakpoint), `desktop-surfaces.css` (lg+), **not** `mobile-polish.css` without explicit approval |
| Tests / smoke | `e2e/route-smoke.mobile.spec.ts`, `e2e/route-smoke.desktop.spec.ts`, domain e2e |

Do not guess paths if they can be inspected.

#### 5. Current UX diagnosis

Tag current problems from audit + code:

- weak information scent
- weak CTA hierarchy
- too generic / too admin-like / too empty / too dense
- poor scanability
- weak trust/safety visibility
- weak marketplace filters
- weak event decision info
- weak education progression
- weak media type distinction
- mobile regression risk

#### 6. Proposed visual changes

Only after §1–5. Split into:

- **Safe now** — visual-only, lg+ or documented cross-breakpoint safe
- **Risky, needs approval** — touches mobile CSS, shared tokens, card density, trust affordances
- **Defer** — needs API, copy strategy, or product decision

#### 7. Hard no-change list

Explicit per page:

- routes, auth, API contracts, data fetching, schema, permissions
- onboarding, upload, payment, moderation logic
- privacy-sensitive field visibility
- mobile layout and touch behavior
- RSVP, registration, join, claim, save, report, block, follow, message, shop, application flows

#### 8. Acceptance criteria

Success in **user-experience terms**, not “looks better”:

- First-time desktop user can tell what the page is for within ~3 seconds
- Primary action is visually obvious
- Cards answer what / why / what next
- Filters/search remain findable (directories)
- Safety controls remain visible
- Mobile screenshots match protected expectations
- No new accessibility regressions

#### 9. Implementation checkpoint

After brief approval, implement **one small scoped pass** for that page group. Stop and report:

- files changed
- research principle applied
- code context used
- visual changes made
- behavior preserved
- mobile impact
- verification result

### Code context index (inspect before each brief)

Starter paths from `router.tsx` — **verify in repo**; do not treat as frozen.

| Page group | Route file | Main component(s) | Template / shell | Key cards | Key rails |
|------------|------------|-------------------|------------------|-----------|-----------|
| `/home` | `app/home/page.tsx` | `HomePageClient.tsx` | Custom 3-col feed shell | `LocalHomeFeed`, feed cards | `HomeDashboardLeftRail`, `HomeFeedDiscoverRail` |
| `/explore` | `app/explore/page.tsx` | `ExploreDashboardPage.tsx` | Custom dashboard | `ExploreFeaturedTrendingCard`, `ExploreCompactEventRow` | Explore aside widgets |
| `/events` | `app/events/page.tsx` | `EventsDiscoverPage`, `EventsPersonalLibraryPage` | Custom + filter patterns | `EventCard`, `EventsListRow`, `EventsFeaturedStrip` | `EventsRightRail`, `EventsPersonalRightRail` |
| `/groups` | `app/groups/page.tsx` | `GroupsDiscoverPage`, `GroupsPersonalLibraryPage` | `DirectoryTemplate` | Group discover cards | `GroupsRightRail` |
| `/orgs` | `app/orgs/page.tsx` | Inline in `page.tsx` | `DirectoryTemplate` + `OrganizationsHero` | Org directory cards | `OrganizationsRightRail` |
| `/vendors` | `app/vendors/page.tsx` | Inline in `page.tsx` | `DirectoryTemplate` | `VendorCard` | `VendorsRightRail`, `VendorsFiltersPanel` |
| `/education` | `app/education/page.tsx` | `EducationDiscoverPage.tsx` | Custom hub | `EducationCard`, `EducationVideoStripCard` | `EducationLeftRail`, `EducationRightRail` |
| `/media` | `app/media/page.tsx` | Media hub client | Custom | `MediaCard` | `MediaRightRail` |
| `/people` | `app/people/page.tsx` | `FindPeopleDiscoverPage.tsx` | `DirectoryTemplate` | `FindPeopleProfileCard` | `FindPeopleRightRail` |
| `/profile` | `app/profile/[username]/page.tsx` | `ProfilePageClient.tsx` | `ProfilePageShell` | Story/tabs (visual only) | `ProfileSocialRail` |
| `/messaging` | `app/messaging/page.tsx` | Inline split inbox | Custom split pane | — | Safety aside |
| `/notifications` | `app/notifications/page.tsx` | `NotificationsPageClient.tsx` | App nav + list | Notification rows | Left app nav |
| `/settings/account` | `app/settings/account/page.tsx` | `SettingsLayout` children | Settings shell | Form cards | Settings side nav |
| Organizer | `app/organizer/**` | `Organizer*Shell`, `Organizer*Panel` | Organizer token stack | Dashboard widgets | Org/conv side nav |

Shared primitives (all groups): `components/templates/DirectoryTemplate.tsx`, `components/ui/EmptyState.tsx`, `components/ui/RailCard.tsx`, `lib/card-surface.ts`, `styles/shared-surfaces.css`, `styles/desktop-surfaces.css`.

### Brief registry

| Page group | Brief status | Checkpoint |
|------------|--------------|------------|
| `/home` | **Complete** — [`UI_DESKTOP_SPRINT_3_HOME_BRIEF.md`](UI_DESKTOP_SPRINT_3_HOME_BRIEF.md) | **CP3 Home polish complete** |
| `/explore` | **Complete — awaiting approval** — [`UI_DESKTOP_SPRINT_3_EXPLORE_BRIEF.md`](UI_DESKTOP_SPRINT_3_EXPLORE_BRIEF.md) | CP3 blocked until accepted |
| `/events` | **Complete** — [`UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md`](UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md) | **CP3 Events polish complete** |
| `/groups` | **Not started** | — |
| `/orgs` | **Not started** | — |
| `/vendors` | **Not started** | — |
| `/education` | **Not started** | — |
| `/media` | **Not started** | — |
| `/people` | **Not started** | — |
| `/profile` | **Not started** | — |
| `/messaging` | **Not started** | — |
| `/notifications` | **Not started** | — |
| `/settings/account` | **Not started** | — |
| Organizer / convention | **Not started** | — |

**Next action:** Review and accept [`UI_DESKTOP_SPRINT_3_EXPLORE_BRIEF.md`](UI_DESKTOP_SPRINT_3_EXPLORE_BRIEF.md). Explore implementation starts only after approval. Home CP3 + CP3.1 committed — see §Checkpoint 3 Home.

---

## Checkpoint 3 Home — Social command center (complete)

**Status:** Complete  
**Brief:** [`UI_DESKTOP_SPRINT_3_HOME_BRIEF.md`](UI_DESKTOP_SPRINT_3_HOME_BRIEF.md)  
**Constraint:** Desktop-first polish; `LocalPostCard`, composer, and `HomeFeedScopeNav` treated as shared cross-breakpoint (helper/orientation copy hidden below `lg` where needed).

### Changes

| Area | Files | What changed |
|------|-------|----------------|
| Orientation header | `HomePageClient.tsx` | Compact lg+ mode framing (Following / Near you / Trending / discover tabs): what, why, next — no new API calls |
| Feed scope | `HomeFeedScopeNav.tsx` | Active-scope helper copy; `lg+` only |
| Scope dedup (CP3.1) | `FeedScopeTabs.tsx`, `FollowingFeedTab.tsx`, `LocalHomeFeed.tsx`, `e2e/smoke.spec.ts` | Hide legacy underline tabs at `lg+` when feed shell active; desktop smoke scoped to `Home feed scope` |
| Composer framing | `LocalHomeFeed.tsx`, `HomeFeedShellComposer.tsx`, `HomeFeedRichComposer.tsx` | Warmer placeholder, calmer collapsed trigger, subtle editor ring |
| Feed cards | `LocalPostCard.tsx` | Stronger actor row, repost banner, badge/activity row, calmer action spacing |
| Right rail | `HomeFeedDiscoverRail.tsx`, `HomeFeedSuggestedPerson.tsx` | Job-grouped sections with “why here” copy |
| Left rail | `HomeDashboardLeftRail.tsx` | “Shortcuts” orientation; softer trust panel headline |

### Not touched (per brief)

Feed hooks, API calls, ranking, routing, auth/onboarding, `mobile-polish.css`, `BottomNav`, `CommunityNavBar`, post creation/upload/moderation logic.

### Verification

| Check | Result |
|-------|--------|
| `npm run typecheck -w web` | **Pass** |
| `npm run build -w web` | **Pass** |
| Desktop smoke `/home` (`smoke.spec.ts` home + following) | **Pass** (CP3.1 — single `Home feed scope` control) |
| Mobile smoke `/home` (`route-smoke.mobile` home-mobile) | **Pass** |
| Full viewport screenshot matrix | **Deferred** — visual review recommended at lg+ breakpoints |

### CP3.1 — Duplicate desktop scope tabs

**Cause:** Three-column feed shell rendered both `HomeFeedScopeNav` (Sprint 3 pills, `lg+` in `HomePageClient`) and `FeedScopeTabs` (legacy underline “Community activity scope”) inside `FollowingFeedTab` / `LocalHomeFeed` when `feedShell` was true.

**Fix:** `FeedScopeTabs` accepts `hideOnDesktop`; when `feedShell`, wrapper uses `lg:hidden`. Mobile keeps both `CommunityNavBar` + in-feed `FeedScopeTabs` unchanged. Desktop smoke queries scoped to `Home feed scope` tablist.

---

## Checkpoint 3 Events — Discovery information scent (complete)

**Status:** Complete  
**Brief:** [`UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md`](UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md)

### Changes

| Area | Files | What changed |
|------|-------|----------------|
| Header + result context | `EventsDiscoverPage.tsx` | Eyebrow, decision-oriented subtitle, dynamic result summary with clear-filters |
| Featured strip | `EventsFeaturedStrip.tsx` | “Happening soon” framing; date, location, format, social proof on highlight cards |
| Grid cards | `EventCard.tsx` | Stronger date/location/format hierarchy; in-person badge |
| List rows | `EventsListRow.tsx` | Date block layout; location emphasis; primary View details on lg+ |
| Right rail | `EventsRightRail.tsx` | Decision-support section titles; muted Social+ panel |
| Left rail | `EventsDiscoverLeftRail.tsx` | “Refine results” + agenda helper copy |

### Not touched (per brief)

`page.tsx`, `EventDetailClient.tsx`, hooks, RSVP/register/filter logic, mobile FilterSheet.

### Verification

| Check | Result |
|-------|--------|
| `npm run typecheck -w web` | **Pass** |
| `npm run build -w web` | **Pass** |
| Mobile smoke `/events`, `/home` | **2/2 pass** |

---

## Checkpoint 2.6 — CSS file ownership reconciliation

**Status:** Complete  
**Reason:** CP2.5 reverted CP2 desktop *enhancements* from `mobile-polish.css`, but cross-breakpoint primitives (`.dc-card-polish`, empty states, feed stagger, etc.) still lived in a file named “mobile-only.” Docs and code disagreed.

### Rule ownership table

| Rule / class | Was in (CP2.5) | Final file | Reason | Mobile impact | Verification |
|--------------|----------------|------------|--------|---------------|--------------|
| `.dc-card-polish` base + `:active` | `mobile-polish.css` | `shared-surfaces.css` | Cross-breakpoint touch feedback on cards | Unchanged scale(0.996) press | Smoke + tap feel |
| `.dc-card-polish:hover` (baseline) | `mobile-polish.css` all breakpoints | `shared-surfaces.css` `max-width: 1023px` + fine pointer | Tablet handoff only; desktop lg+ uses desktop-surfaces | No hover on touch phones | Smoke |
| `.dc-card-polish:hover` (stronger) | `desktop-surfaces.css` | `desktop-surfaces.css` lg+ | Desktop depth polish | None on mobile | Desktop audit |
| `.dc-card-polish:focus-visible` | `desktop-surfaces.css` | `desktop-surfaces.css` lg+ | Desktop keyboard focus | N/A mobile | a11y check |
| `.c2k-empty-glow` + `::before` | `mobile-polish.css` | `shared-surfaces.css` | Used by `EmptyState` on all viewports; baseline 10% glow | Unchanged baseline | Empty states on `/media`, `/messaging` |
| `.c2k-empty-icon-ring` | `mobile-polish.css` | `shared-surfaces.css` | Shared empty-state primitive | Unchanged baseline | Empty states |
| `.c2k-empty-state-compact` | `mobile-polish.css` | `shared-surfaces.css` | Compact empty padding — not mobile-exclusive | Unchanged | Empty states |
| `.c2k-empty-glow/icon-ring` lg+ enhance | `desktop-surfaces.css` | `desktop-surfaces.css` lg+ | Desktop empty polish | None on mobile | Desktop audit |
| `.c2k-event-date-badge` | `mobile-polish.css` | `shared-surfaces.css` | `EventCard`, `EventsListRow` — all viewports | Unchanged | `/events` smoke |
| `.dc-feed-stagger` | `mobile-polish.css` | `shared-surfaces.css` | `LocalHomeFeed` — feed entry animation | Unchanged; respects reduced-motion | `/home` smoke |
| `.c2k-profile-hero` | `mobile-polish.css` | `shared-surfaces.css` | Profile/group identity — all viewports | Unchanged | Profile cards |
| `.c2k-community-hero-cover::after` | `mobile-polish.css` | `shared-surfaces.css` | Org/group cover gradient | Unchanged | Group/org hubs |
| `.c2k-org/vendor-cover-fallback` | `mobile-polish.css` | `shared-surfaces.css` | Cover fallbacks | Unchanged | Vendor/org |
| `.c2k-avatar-ring` | `mobile-polish.css` | `shared-surfaces.css` | Profile hero photo ring | Unchanged | Profile |
| `.c2k-mobile-scroll-pad` | `mobile-polish.css` | `mobile-polish.css` | Bottom-nav clearance; resets at 768px | **Mobile-only** | Scroll pad on directories |
| `.c2k-snap-carousel` + fade | `mobile-polish.css` | `mobile-polish.css` | Horizontal snap; fade hidden 768px+ | **Mobile-primary** | Education/events carousels |

### Files changed (CP2.6)

| File | Change |
|------|--------|
| `packages/web/src/styles/shared-surfaces.css` | **New** — cross-breakpoint primitives moved from mobile-polish |
| `packages/web/src/styles/mobile-polish.css` | Slimmed to scroll-pad + snap-carousel only |
| `packages/web/src/app/globals.css` | Import `shared-surfaces.css` before mobile-polish |
| `packages/web/src/lib/card-surface.ts` | Comment points to shared-surfaces |
| `docs/UI_DESKTOP_SPRINT_3.md` | CSS boundary rule + this section |

### Verification (CP2.6)

| Check | Result |
|-------|--------|
| `npm run typecheck -w web` | **Pass** |
| `npm run build -w web` | **Pass** |
| Focused mobile smoke (chromium-mobile) | **6/6 pass** — `/home`, `/events`, `/people`, `/groups`, `/vendors`, `/education` |
| `/media`, `/profile` | Not in route-smoke spec — add to CP7 matrix; CSS split does not target those routes |

Viewport screenshot matrix (375–1024) deferred to CP7; smoke overflow guard covers 390×844 on listed routes.

### Events brief proceed?

**Yes — accepted.** Implementation may start per [`UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md`](UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md). Event detail (`/events/:id`) remains audit-only.

---

## Checkpoint 2.5 — Mobile CSS boundary repair

**Status:** Complete  
**Reason:** CP2 desktop polish leaked into `mobile-polish.css`. CP3 paused until repaired.

### Part A — `mobile-polish.css` diff classification

| Change | Class | Action |
|--------|-------|--------|
| `.dc-card-polish:hover` stronger + glass inset | 3 desktop | Reverted; moved to `desktop-surfaces.css` lg+ fine-pointer hover |
| `.dc-card-polish:focus-visible` | 3 desktop | Removed from mobile; lg+ only in desktop-surfaces |
| `.c2k-empty-glow::before` stronger | 4 risky mobile | Reverted to 10%/70%; lg+ in desktop-surfaces |
| `.c2k-empty-icon-ring` gradient + inset | 4 risky mobile | Reverted to flat fill; lg+ in desktop-surfaces |
| `.dc-card-polish` base + `:active` | 1 mobile-safe | Kept (baseline) |
| Scroll pad, snap carousel, compact empty | 1 mobile-specific | Kept |

**Post-repair (CP2.5):** CP2 desktop *enhancements* reverted; cross-breakpoint primitives still misfiled until **CP2.6** split them into `shared-surfaces.css`.

### Part B — Fixes applied

- All CP2 visual rules **reverted** in `mobile-polish.css`
- Desktop card hover, focus, empty glow/icon → `desktop-surfaces.css` **lg+ gated**
- `dc-surface-lift`, rail cards, header chrome → **lg+ only** (no longer all-breakpoint)

### Part C — Mobile verification

| Check | Result |
|-------|--------|
| `e2e/route-smoke.mobile.spec.ts` (full) | **38/38 pass** — no horizontal overflow, no runtime errors |
| Focused routes (chromium-mobile) | **7/7 pass** — `/home`, `/events`, `/people`, `/groups`, `/vendors`, `/education`, `/explore` |
| Viewport matrix (375–1024) | **Smoke-covered** — overflow guard on all mobile smoke routes at 390×844; full 77-route×viewport screenshot matrix deferred to CP7 |
| Bottom nav / scroll / tap | **No regressions observed** in smoke (CP2.5 reverted mobile visual deltas) |

Routes not in mobile smoke spec this pass: `/media`, `/profile`, `/settings/account` — add to CP7 matrix; no CSS changes targeted those routes in CP2.5.

### Remaining cross-breakpoint risks (documented)

| Item | Note |
|------|------|
| `--dc-shadow-soft/panel` tokens | Subtle mobile depth — monitor contrast |
| `site-atmosphere.css` | Background all viewports — no layout impact |
| `.dc-card-polish:hover` in `mobile-polish.css` | **Resolved in CP2.6** — tablet baseline in `shared-surfaces.css` max-1023px; lg+ in `desktop-surfaces.css` |

### Part F — Verification

| Check | Result |
|-------|--------|
| `npm run typecheck -w web` | **Pass** |
| `npm run build -w web` | **Pass** |
| Mobile smoke | **38/38 pass** |
| Focused member routes | **7/7 pass** |

### Files changed (CP2 + CP2.5)

| File | Change |
|------|--------|
| `packages/web/src/styles/mobile-polish.css` | Reverted CP2 desktop rules; protected header comment |
| `packages/web/src/styles/desktop-surfaces.css` | **New** — lg+ card hover, focus, empty glow, rails, header chrome |
| `packages/web/src/app/globals.css` | Import `desktop-surfaces.css` |
| `packages/web/src/styles/site-atmosphere.css` | CP2 atmosphere (cross-breakpoint) |
| `packages/web/src/styles/dancecard-tokens.css` | Shadow token tweaks |
| `packages/web/src/lib/card-surface.ts` | Surface class helpers |
| `packages/web/src/components/ui/RailCard.tsx` | **New** rail wrapper |
| `packages/web/src/components/ui/EmptyState.tsx` | Class hooks only |
| `packages/web/src/components/Header.tsx` | Dropdown stacking fix |
| `packages/web/src/lib/shell-contract.ts` | `shellHeaderClass` overflow-visible |
| 13 `*RightRail.tsx` + `HomeDashboardLeftRail.tsx` | Rail card classes |
| `docs/UI_DESKTOP_SPRINT_3.md` | CSS boundary rule, research rubric, CP2.5, rewritten CP3 |

### CP3+ proceed?

**Events unblocked** — brief accepted. Other page groups remain blocked until their briefs exist. See [`UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md`](UI_DESKTOP_SPRINT_3_EVENTS_BRIEF.md).

---

## Checkpoint 3+ — Per-page-group polish (blocked)

**Status:** Blocked — requires Research + Code Context Brief per page group (§ above).

CP3 is **not** “make headers prettier.” Each group's first pass should improve **information scent and product intent**:

| Route | Header / above-fold must communicate |
|-------|----------------------------------------|
| `/home` | Social command center — catch up, post, find activity, next useful action |
| `/events` | When, where, what type, filter/register — decide attend + safety |
| `/vendors` | Marketplace — category, search, trust, shop/contact |
| `/education` | Learning library — topics, levels, continue/read/save |
| `/media` | Show/channel, content type, submit/browse, visibility |
| `/groups` / `/orgs` | Community identity — scope, privacy/join expectations |
| `/explore` | Cross-domain discovery with clear section intent |
| `/profile` | Identity + trust + connection (visual only) |

**Workflow:** Brief → scoped implementation → stop → report (§9) → next group.

---

## Ranked polish plan (after briefs exist)

Priority score = member traffic × visual gap × rubric fit. **Each tier requires a completed brief for the target page group before work starts.**

### Suggested brief + implementation order

| Order | Page group | Why first |
|-------|------------|-----------|
| 1 | `/events` | Highest directory traffic; event decision scent is core product |
| 2 | `/home` | Social command center; sets feed card language |
| 3 | `/vendors` | Marketplace UX (Baymard filters/sort/cards) |
| 4 | `/education` | Learning library progression |
| 5 | `/explore` | Cross-domain discovery hub |
| 6 | `/groups`, `/orgs` | Community identity + join expectations |
| 7 | `/media` | Content type + visibility (often empty — intentional empty matters) |
| 8 | `/people` | Directory scanability |
| 9 | `/profile` | Identity + trust (visual only) |
| 10 | `/messaging`, `/notifications` | Utility inboxes |
| 11 | `/settings/account` | Reduce admin tone without touching form logic |

### Tier 1 — Headers & heroes (first pass per group, post-brief)

| # | Route | Rubric focus |
|---|-------|--------------|
| 1 | `/home` | Social command center, not dashboard |
| 2 | `/events` | When/where/who/RSVP scent |
| 3 | `/vendors` | Marketplace findability |
| 4 | `/education` | Learning library intent |
| 5 | `/explore` | Section-level next actions |
| 6 | `/groups`, `/orgs` | Community identity + action |
| 7 | `/media` | Content type + visibility |
| 8 | `/profile` | Identity + trust (visual only) |

### Tier 0 — Foundation (CP2 + CP2.5)

| # | Work | Status |
|---|------|--------|
| 1–7 | Atmosphere, surfaces, rails, header depth, empty harmony | **Complete** (lg+ gated after CP2.5) |


### Tier 2 — Cards (CP4)

| # | Component | Priority |
|---|-----------|----------|
| 1 | `EventCard` | Highest traffic directory |
| 2 | Feed cards (home) | Social “alive” feel |
| 3 | `PersonCard` | People directory |
| 4 | `GroupCard` / discover list row | Groups |
| 5 | `OrgCard` / `OrgDirectoryCard` | Orgs |
| 6 | `VendorCard` | Media fallbacks + CTA |
| 7 | `PresenterCard` | Extend avatar gradient language |
| 8 | `EducationCard` | Carousel + grid variants |
| 9 | `MediaCard` | For when content exists |

### Tier 3 — Right rails (CP5)

| # | Rail | Route |
|---|------|-------|
| 1 | Upcoming events | `/home`, `/explore`, `/events` |
| 2 | Suggested groups / PYMK | `/home`, `/people` |
| 3 | Profile completion | `/home`, left nav |
| 4 | Education/media suggestions | `/education`, `/media` |
| 5 | Vendor/org suggestions | `/vendors`, `/orgs` |
| 6 | Trust/safety reminders | Messaging, notifications, people |

### Tier 4 — Route pass (full group polish, post-brief)

Execute per page group after header/card/rail passes for that group:

1. `/home` → 2. `/explore` → 3. `/events` → 4. `/groups` → 5. `/orgs` → 6. `/vendors` → 7. `/education` → 8. `/media` → 9. `/people` → 10. `/profile` → 11. `/messaging` → 12. `/notifications`

**Also polish when touching nearby surfaces:** `/conventions`, `/places`, `/settings/account` (lower traffic).

**Stop rule:** If a change requires API, routing, or behavior — stop; log for product backlog. If brief is missing — stop; write brief first.

### Tier 5 — Verification (after each group + final matrix)

- `npm run typecheck -w web`
- `npm run build -w web`
- `npm run test:e2e:smoke`
- `npm run audit:ui-desktop` (dev server required)
- Full screenshot matrix (375–1920) per Sprint 3 spec
- Mobile safety report update

---

## Recommended next sprint (after Sprint 3)

| Option | When |
|--------|------|
| **Sprint 4: Detail page atmosphere** | If CP6 leaves event/group/org/convention/profile hubs visually behind |
| **Sprint 4: Organizer visual fork** | Only if organizer surfaces must match member polish (separate token stack today) |
| **Resume CP6 template migration** | Only if verification finds layout regression — not for polish |

---

## Rollback

```powershell
git reset --hard desktop-ui-sprint-2-visual-baseline   # undo all Sprint 3 visual work
```
