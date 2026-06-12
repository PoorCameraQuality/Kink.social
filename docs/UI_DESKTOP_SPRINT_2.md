# Desktop UI Sprint 2 — Template Migration and Member Surface Polish

**Status:** Checkpoint 1 complete — Checkpoint 2 in progress  
**Branch:** `desktop-ui-sprint-2-template-migration`  
**CP1 commit:** `c23fff3`  
**CP1 rollback tag:** `desktop-ui-sprint-2-cp1-baseline`  
**CP2 commit:** `43ad6f8`  
**CP2 rollback tag:** `desktop-ui-sprint-2-cp2-baseline`  
**CP2 rollback command:** `git reset --hard desktop-ui-sprint-2-cp2-baseline`  
**Core principle:** Use Sprint 1 foundation to migrate member-facing surfaces into shared templates. **Not** a functionality, organizer, or mobile redesign sprint.

## Sprint 1 handoff

| Item | Value |
|------|-------|
| Final implementation commit | `ed3dcf2` (CP7) |
| Rollback tag | `desktop-ui-sprint-1-cp7-baseline` |
| Rollback command | `git reset --hard desktop-ui-sprint-1-cp7-baseline` |
| Migrated directories (Sprint 1) | `/events`, `/people`, `/explore` |
| Primitives ready | `DirectoryTemplate`, `DetailTemplate`, `EmptyState`, `MediaSurfaceFallback`, `card-surface`, shell contract |

## Hard rules (all checkpoints)

- No route, auth, API, schema, permission, onboarding, payment, upload, or moderation logic changes
- No new privacy-sensitive profile fields; no adult-media visibility changes
- No public landing/login redesign; no organizer/convention operations redesign
- Desktop changes default to `lg+`; 768–1023px is protected handoff territory
- Shared template changes affecting mobile must be documented in [`UI_DESKTOP_SPRINT_1_MOBILE_SAFETY_REPORT.md`](UI_DESKTOP_SPRINT_1_MOBILE_SAFETY_REPORT.md)

## Checkpoint progress

| CP | Scope | Status |
|----|-------|--------|
| 0 | Sprint 1 verification gate | **Complete** |
| 1 | DirectoryTemplate migration plan | **Complete** (this doc) |
| 2 | Low-risk directory migrations (vendors, presenters, groups) | **Complete** |
| 3 | Higher-complexity directories (places, conventions, media, orgs, education) | **Complete** |
| 4 | DetailTemplate audit + plan | Pending |
| 5 | Low-risk detail migrations | Pending |
| 6 | Profile, group, org, event, convention detail refinement | Pending |
| 7 | Desktop hierarchy polish (`lg+` only) | Pending |
| 8 | Sprint 2 verification + screenshot matrix | Pending |

---

## Checkpoint 0 — Sprint 1 verification gate

| Check | Result | Notes |
|-------|--------|-------|
| CP7 committed | `ed3dcf2` | Copy + media fallbacks |
| Rollback tag | `desktop-ui-sprint-1-cp7-baseline` | End of Sprint 1 implementation |
| `npm run typecheck -w web` | Pass | |
| `npm run build -w web` | Pass | |
| `npm run test:e2e:smoke` | **76 passed**, 5 failed, 3 skipped | Pre-existing failures (do not fix in Sprint 2 unless regression): landing H1 copy drift; `/groups` and `/orgs` AuthGate on public smoke |
| `npm run audit:ui-desktop` | Partial | Route/component/design inventories refreshed; screenshot capture blocked (dev server not running). Baseline: 186 desktop screenshots from Sprint 1 audit packet |
| Responsive screenshot matrix | Deferred | Full matrix scheduled for Sprint 2 CP8 |
| Sprint 2 branch | `desktop-ui-sprint-2-template-migration` | Created from tagged Sprint 1 baseline |

---

## Checkpoint 2 — DirectoryTemplate migrations (vendors, presenters, groups)

**Status:** Complete  
**DirectoryTemplate API changes:** None  
**Routes migrated:** `/vendors`, `/presenters`, `/groups`  
**Routes deliberately not migrated:** `/events`, `/people` (reference only — unchanged), all CP3 routes  

### Per-route behavior preserved

| Route | File | Preserved |
|-------|------|-----------|
| `/vendors` | `packages/web/src/app/vendors/page.tsx` | API fetch, search, category chips, filters, sort, `VendorCard` grid, skeleton/empty, left/right rails, `FilterSheet` live apply, mobile List-shop CTA hide rule |
| `/presenters` | `packages/web/src/app/presenters/page.tsx` | Hero card header, search, sort pills, expertise tag chips, `PresenterCard` grid, load-more, education footer CTA |
| `/groups` | `packages/web/src/app/groups/GroupsDiscoverPage.tsx` | Discover list, scope tabs, purpose chips, geo filters, sort, sparse mobile right rail, `CreateGroupModal`, join/membership untouched |

### Shell change

Removed nested `max-w-[1600px]` / `max-w-[1440px]` / `max-w-5xl` islands; parent `shellOuterClass` + `DirectoryTemplate` (`shellDirectoryClass`) now owns width at `lg+`. Mobile gutters unchanged.

### Verification (CP2)

| Check | Result |
|-------|--------|
| `npm run typecheck -w web` | Pass |
| `npm run build -w web` | Pass |
| Focused smoke: vendors, events, people (desktop + mobile) | Pass |
| Focused smoke: groups mobile | Pass |
| Focused smoke: groups desktop | **Pre-existing fail** — unauthenticated `/groups` redirects to landing AuthGate (not caused by CP2) |
| `/presenters` smoke | Not in `PUBLIC_ROUTES`; manual typecheck/build only |

### Recommended CP3 order

1. `/places` — sidebar-less proof  
2. `/conventions` — left-rail list  
3. `/media` — right-rail + mobile duplication  
4. `/orgs` — hero + 2-col  
5. `/education` — last (richest hub)

---

## Checkpoint 3 — Higher-complexity DirectoryTemplate migrations

**Status:** Complete  
**Routes migrated:** `/places`, `/conventions`, `/media`, `/orgs`, `/education` (partial shell alignment)  
**Routes deferred:** None  

### DirectoryTemplate API change

**Inferred grid layout** (backwards compatible, no new props):

| Slots set | Grid at `lg+` |
|-----------|----------------|
| `desktopSidebar` + `desktopAside` | 3-column (unchanged default for Events/People/Vendors/Groups) |
| `desktopSidebar` only | 2-column: sidebar + main (`/conventions`) |
| `desktopAside` only | 2-column: main + aside (`/media`, `/orgs`) |
| Neither | Single main column (`/places`, `/presenters`) |

Removes empty left grid track on aside-only routes. Existing 3-col migrations unchanged.

### Per-route behavior preserved

| Route | File | Notes |
|-------|------|-------|
| `/places` | `places/page.tsx`, `CommunityPlacesBrowse.tsx` | Category chips, fetch, list cards, suggest form, `DiscoveryBrowseLinks`; sidebar-less proof |
| `/conventions` | `ConventionsDiscoverPage.tsx` | Left rail, featured row, list rows, submit CTAs, `?view=` / `?mine=1`; mobile `FilterSheet` |
| `/media` | `media/page.tsx` | Format tabs, topic chips/drawer, search, `MediaChannelCard` list, desktop + mobile `MediaRightRail` duplicate |
| `/orgs` | `orgs/page.tsx` | `OrganizationsHero`, search/sort/chips, `OrgDirectoryCard` grid, right rail |
| `/education` | `EducationDiscoverPage.tsx` | **Partial:** shell + 3-col template; `EducationDiscoverCenter` carousels/paths/views unchanged; mobile Topics drawer preserved (not FilterSheet) |

### Verification (CP3)

| Check | Result |
|-------|--------|
| `npm run typecheck -w web` | Pass |
| `npm run build -w web` | Pass |
| Mobile smoke (places, conventions, media, orgs, education, vendors, groups, events, people) | **Pass** |
| Desktop smoke | Mixed — pre-existing AuthGate on `/groups`, `/orgs`; intermittent timeouts on parallel desktop workers (not reproduced on mobile) |
| Screenshot matrix | Deferred to CP8 |

### Recommended CP4 DetailTemplate audit order

1. `/vendors/:slug` — simpler commerce-adjacent detail  
2. `/presenters/:username` — profile-style, low organizer coupling  
3. `/education/:slug` — article detail  
4. `/media/:slug` — channel show page  
5. `/events/:id` — high-traffic member detail  
6. `/groups/:id` — membership/privacy sensitive  
7. `/orgs/:slug` — org hub with staff/moderation  
8. `/conventions/:slug` — convention hub (defer organizer tabs to Sprint 3)  
9. `/profile/:username` — highest privacy surface; audit last before CP6 code

---

## Checkpoint 1 — DirectoryTemplate migration plan

### Reference implementations

| Route | File | Pattern |
|-------|------|---------|
| `/events` | `packages/web/src/app/events/EventsDiscoverPage.tsx` | 3-col, `FilterSheet`, `desktopAsideFrom="xl"` |
| `/people` | `packages/web/src/app/discovery/FindPeopleDiscoverPage.tsx` | 3-col, custom `header`, `desktopAsideFrom="lg"`, `shellOuterClass` wrapper |
| `/explore` | `packages/web/src/app/explore/ExploreDashboardPage.tsx` | DirectoryTemplate (hub variant) |

### DirectoryTemplate slot API

| Slot | Use |
|------|-----|
| `title` / `description` / `headerActions` | Default `PageHeader` |
| `header` | Custom header (People, Orgs hero) |
| `toolbar` | Search + `DirectoryFilterButton` + sort |
| `resultSummary` | Count line |
| `desktopSidebar` | Left rail (`hidden lg:block`) |
| `desktopAside` | Right rail (`lg` or `xl` via `desktopAsideFrom`) |
| `children` | Main list/grid |
| `footer` | Below grid |

Shell: `shellDirectoryClass` (no nested `max-w-[1600px]` islands). Parent pages should use `shellOuterClass` like People.

### Optional template extensions (evaluate in CP2, not blockers)

| Extension | Why | Routes affected | Status |
|-----------|-----|-----------------|--------|
| Inferred grid layout | Skip empty grid track for 2-col routes | `/media`, `/orgs`, `/conventions` | **Shipped CP3** (no new prop) |
| `toolbarBand` or wider `toolbar` | Full-width chip rows above grid | `/vendors`, `/groups`, `/orgs` | Not needed — chips in `toolbar`/`children` |

---

### Route assessments

#### `/groups` — `GroupsDiscoverPage.tsx`

| Area | Current |
|------|---------|
| Layout | Manual 3-col inside `max-w-[1440px]` |
| Left rail | `GroupsDiscoverLeftRail` (section nav + filters) |
| Right rail | `GroupsRightRail` (desktop); duplicated at bottom when sparse results |
| Filters | Inline mobile drawer (not `FilterSheet`) |
| Cards | `GroupDiscoverListCard` vertical list |
| Empty/loading | `GroupSkeleton`, `EmptyState` |
| Mobile | Filter drawer, scope tabs, sort in main column |

| Migrate? | **Partial** |
| Batch | CP2 (with vendors, presenters) |
| Slot plan | `toolbar` (search, sort, `DirectoryFilterButton`), `desktopSidebar`, `desktopAside`, `children` (scope tabs + list) |
| Risks | FilterSheet swap UX; sparse right-rail-at-bottom; left rail includes nav not just filters; drop 1440px island |

#### `/vendors` — `vendors/page.tsx`

| Area | Current |
|------|---------|
| Layout | Manual 3-col inside `max-w-[1600px]`; header above grid |
| Left rail | `VendorsFiltersPanel` |
| Right rail | `VendorsRightRail` |
| Filters | Already `DirectoryFilterButton` + `FilterSheet` |
| Cards | `VendorCard` grid |
| Empty/loading | Bone skeleton, `EmptyState` |

| Migrate? | **Partial (closest fit)** |
| Batch | **CP2 first** (recommended lead) |
| Slot plan | Custom `header` (title, trust note), `headerActions` (List shop), `toolbar` (search + category chips), sidebars, `children` |
| Risks | Multi-part header; mobile CTA hide rule; category chips placement |

#### `/presenters` — `presenters/page.tsx`

| Area | Current |
|------|---------|
| Layout | Single column `max-w-5xl` |
| Rails | None |
| Filters | Search, sort pills, expertise tag chips (always visible) |
| Cards | `PresenterCard` grid + load more |
| Empty/loading | `EmptyState`, loading in grid area |
| Mobile | Hero card, stacked toolbar, tag wrap |

| Migrate? | **High / easy** |
| Batch | **CP2** |
| Slot plan | Custom `header` (hero card with CTAs), `toolbar` (search, sort, tags), `children` (grid), `footer` (load more) |
| Risks | Hero is a bordered card not plain `PageHeader`; tag chips always visible on mobile |

#### `/orgs` — `orgs/page.tsx` (`OrgsListPage`)

| Area | Current |
|------|---------|
| Layout | `OrganizationsHero` + manual 2-col `max-w-[1600px]` |
| Left rail | None |
| Right rail | `OrganizationsRightRail` |
| Filters | Search, sort, horizontal chip row (always visible) |
| Cards | `OrgDirectoryCard` responsive grid (up to 4 cols at 1800px) |
| Empty/loading | `CardSkeleton`, `EmptyState` |

| Migrate? | **Partial** |
| Batch | **CP3** |
| Slot plan | `header` = `OrganizationsHero`, `toolbar` (search, sort, chips), `desktopAside` only |
| Risks | 2-col vs template 3-track grid; hero marketing block; ultra-wide card breakpoints |

#### `/education` — `EducationDiscoverPage.tsx`

| Area | Current |
|------|---------|
| Layout | Manual 3-col `max-w-[1600px]`; multi-view via `?view=` |
| Left rail | `EducationLeftRail` (nav + topic chips) |
| Right rail | `EducationRightRail` |
| Filters | Topics drawer mobile; search inside center column |
| Cards | Hub carousels, paths, educators, article grid (view-dependent) |
| Empty/loading | Catalogue skeleton, `EmptyState` |

| Migrate? | **Medium–hard** |
| Batch | **CP3 last** |
| Slot plan | Custom `header` or view-specific; `desktopSidebar`, `desktopAside`; center stays rich (not generic card grid) |
| Risks | Multi-view routing; center hero/search placement; carousel snap scroll; nav+filter hybrid left rail |

#### `/media` — `media/page.tsx`

| Area | Current |
|------|---------|
| Layout | Manual 2-col `max-w-[1440px]` |
| Right rail | `MediaRightRail` (desktop column + **mobile duplicate below list**) |
| Filters | Format tabs, topic chips, Topics drawer |
| Cards | `MediaChannelCard` vertical list |
| Empty/loading | `FeedCardSkeleton`, `MediaEmptyPanel` |

| Migrate? | **Medium** |
| Batch | **CP3** |
| Slot plan | `toolbar`, `desktopAsideFrom="lg"`, mobile rail in `children`/`footer` |
| Risks | Dual right-rail mount; format tabs vs FilterSheet |

#### `/conventions` — `ConventionsDiscoverPage.tsx`

| Area | Current |
|------|---------|
| Layout | Manual 2-col `max-w-[1400px]` |
| Left rail | `ConventionsLeftRail` (nav + filters) |
| Right rail | None |
| Filters | Inline mobile drawer |
| Cards | `ConventionsFeaturedRow` + `ConventionsListRow` |
| Empty/loading | Pulse skeletons, `EmptyState` |

| Migrate? | **Medium–easy** |
| Batch | **CP3** (after places) |
| Slot plan | `title`/`description`, `desktopSidebar`, `headerActions` (submit CTA), `children` |
| Risks | Sidebar-only empty third column; `mine=1` stub; FilterSheet migration |

#### `/places` — `CommunityPlacesBrowse.tsx` via `places/page.tsx`

| Area | Current |
|------|---------|
| Layout | Single column `max-w-7xl` |
| Rails | None |
| Filters | Category chips only |
| Cards | Inline list cards (not shared component) |
| Empty/loading | Text loading, `EmptyState` |

| Migrate? | **High / easy** |
| Batch | **CP3 first** (prove sidebar-less path) |
| Slot plan | `title`, `toolbar` (chips), `children`, `footer` (suggest form + browse links) |
| Risks | Weak loading UX; URL category sync is read-only today (preserve behavior) |

---

### Recommended migration order

**Checkpoint 2 (low-risk):**

1. `/vendors` — already uses `DirectoryFilterButton` + `FilterSheet`
2. `/presenters` — sidebar-less, simple grid
3. `/groups` — 3-col like Events; needs FilterSheet standardization

**Checkpoint 3 (higher complexity):**

1. `/places` — sidebar-less proof
2. `/conventions` — left-rail list pattern
3. `/media` — right-rail + mobile duplication
4. `/orgs` — hero + 2-col
5. `/education` — richest hub; do last

---

### Sprint 2 checkpoints 4–8 (outline)

**CP4 — DetailTemplate audit** (plan only): `/profile`, `/groups/:id`, `/orgs/:slug`, `/events/:id`, `/vendors/:id`, `/presenters/:username`, `/education/:slug`, `/education/series/:slug`, `/media/:slug`, `/conventions/:slug`. Document hero, tabs, sidebar, CTAs, safety controls, mobile behavior before any code.

**CP5 — Low-risk detail batch:** vendor detail, presenter profile, education article, media show (if structurally simple).

**CP6 — Higher-risk detail batch:** profile, group, org hub, event detail, convention hub (layout via template only; preserve all actions).

**CP7 — Desktop hierarchy polish (`lg+` only):** headers, rail grouping, CTA clarity, duplicate nav removal. No redesign.

**CP8 — Verification:** typecheck, build, full smoke, audit packet with dev server, screenshot matrix per Sprint 2 spec.

---

## Sprint 3 scope (deferred)

Organizer/convention operations: separate shells, program grids, schedule canvases, door mode. **Out of Sprint 2 scope** except public-facing org/event/convention **display** pages in CP6.

## Rollback (Sprint 2)

| Tag | Commit | When |
|-----|--------|------|
| `desktop-ui-sprint-1-cp7-baseline` | `ed3dcf2` | Before any Sprint 2 work |
| `desktop-ui-sprint-2-cp1-baseline` | `c23fff3` | After CP0/CP1 docs; before CP2 code |
| `desktop-ui-sprint-2-cp2-baseline` | `43ad6f8` | After CP2 migrations |
| `desktop-ui-sprint-2-cp3-baseline` | TBD | After CP3 |

```powershell
git reset --hard desktop-ui-sprint-2-cp2-baseline  # undo CP3+ work, keep CP2 migrations
git reset --hard desktop-ui-sprint-2-cp1-baseline  # undo CP2+ work, keep Sprint 2 plan
git reset --hard desktop-ui-sprint-1-cp7-baseline  # undo all Sprint 2 work
```
