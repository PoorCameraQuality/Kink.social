# Sprint 3 Explore Research + Code Context Brief

**Status:** Accepted — CP3 Explore polish complete  
**Page group:** Explore discovery hub

**Routes in scope for implementation:**

- `/explore`

**Routes in audit context only:**

- `/events`
- `/groups`
- `/people`
- `/orgs`
- `/vendors`
- `/education`
- `/media`
- `/home?mode=discover`

**Implementation status:**

- Do not implement Explore visual changes until this brief is reviewed and accepted.
- Explore implementation must be one scoped commit after brief acceptance.
- Do not bundle Explore polish with Events, Home, Groups, Vendors, Education, Media, Profile, Messaging, Notifications, or Settings polish.

---

## 1. Product pattern classification

Explore is the cross-site discovery hub.

It is a mixed product surface:

- global discovery hub
- search and browse surface
- multi-category directory
- personalized suggestion surface
- content router
- trust and safety filter surface
- marketplace and event prefilter surface
- community operating system index

Explore is not a feed. Explore is not a dashboard. Explore is the place users go when they do not yet know which exact part of kink.social they need.

The page must help users decide whether to search, filter, browse by category, open a section, or jump into a deeper directory.

---

## 2. Research-backed principles

References: [NN/g information scent](https://www.nngroup.com/articles/information-scent/), [NN/g IA mistakes](https://www.nngroup.com/articles/3-ia-mistakes/), [Baymard product list & filtering](https://baymard.com/blog/current-state-product-list-and-filtering), [Baymard search benchmark](https://baymard.com/blog/ecommerce-search-query-types), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Information scent

Every Explore link, card, chip, section title, and CTA must answer:

- What is this?
- Why is it shown here?
- What happens if I click?

Explore is especially sensitive to weak information scent because it points to many different product areas. Vague labels make users hesitate.

### Discovery needs both search and browsing

Users often split between search and navigation when looking for something. Explore must support both behaviors.

Search should feel like a primary path:

- search events
- search groups
- search people
- search organizations
- search vendors
- search education

Browsing should feel equally legitimate:

- discovery chips
- topic chips
- sections
- featured content
- suggested rows
- filters

### Faceted filtering must stay understandable

Explore already has strong filter categories:

- content type
- location
- date
- trust and safety
- topics
- vendors

This is a major advantage. Do not hide or weaken it.

Facets should be legible enough that users understand why results changed.

### Section design should clarify category differences

Explore contains many content types. Cards must not all feel the same.

Sections should make content types distinct:

- Trending: active community signal
- Events: time and place decisions
- Groups: community membership decision
- People: connection decision
- Organizations: legitimacy and organizer context
- Vendors: marketplace decision
- Education: learning decision
- Suggestions: personalized or context-driven next step

### Cards should act as entry points, not decorations

Explore cards should be compact but high-scent.

Each card or row should make clear:

- type
- name/title
- context
- why it matters
- next action

Do not turn Explore into a collage of pretty boxes.

### Trust and safety are part of discovery

Because this is an adult community, users need to discover safely.

Explore filters already include trust and safety concepts:

- verified organizers
- beginner friendly
- public spaces only

These should remain visible and understandable.

Do not add fake trust signals.

### Accessibility is part of discovery quality

Explore has many controls. It must preserve:

- visible focus
- readable contrast
- keyboard-safe filters
- labeled search
- labeled chips
- target sizes
- no horizontal overflow
- no nested interactive controls

---

## 3. kink.social-specific user job

A member comes to Explore to answer:

- What is available on kink.social?
- What is near me?
- What is happening soon?
- Are there active groups?
- Who might I connect with?
- Which organizations are legitimate or active?
- What vendors can I browse?
- What can I learn?
- What is beginner friendly?
- What is online?
- What is safe enough for my comfort level?
- Where should I go next?

Explore should reduce the feeling that kink.social is a pile of disconnected features.

It should feel like a map of the community.

---

## 4. Current code context

### Main route

Files:

- `packages/web/src/app/explore/page.tsx`
- `packages/web/src/app/explore/ExploreDashboardPage.tsx`

`page.tsx` renders `ExploreDashboardPage`.

`ExploreDashboardPage` is the main implementation.

Current responsibilities:

- reads URL search params
- manages filter sheet state
- manages filter draft state
- writes filter state back to URL params
- removes legacy `tab` params by converting them to filter params
- uses `useAuth`
- uses `useHomeSurface`
- uses `useApiEducationArticles`
- uses `useApiOrganizations`
- uses organizer scope helpers
- builds people pool
- builds vendor pool
- maps organizations
- filters events, groups, people, vendors, trending, articles, and orgs
- builds suggested items
- decides which sections show
- renders DirectoryTemplate
- renders FilterSheet

**Implementation warning:** Do not rewrite filter state, URL state, legacy tab handling, data hooks, or section visibility logic.

### Template

File:

- `packages/web/src/components/templates/DirectoryTemplate.tsx`

Explore uses `DirectoryTemplate`.

**Implementation opportunity:** Explore can use this as the benchmark for all other discovery surfaces.

**Implementation warning:** Do not change `DirectoryTemplate` API unless it is backwards compatible for all directories.

### Header and search

File:

- `packages/web/src/components/explore/ExploreHubHeader.tsx`

Current header owns:

- page title
- page description
- search box
- search helper text
- filter button
- discovery chips
- topic chips
- active filter pills

Current title:

- `Explore the community`

Current description:

- `Find events, groups, people, organizations, vendors, and learning resources that match what you are looking for.`

Current search helper:

- `Search across events, groups, people, organizations, education, and vendors.`

**Implementation opportunity:** This is the core information scent surface for Explore. It can become more intentional without changing search behavior.

**Implementation warning:** Do not alter search state logic or URL param behavior.

### Filters

File:

- `packages/web/src/components/explore/ExploreFiltersPanel.tsx`

Current filter groups:

- Content type
- Location
- Date
- Trust and safety
- Topic tags
- Vendors

Current filter options include:

- near me
- city or region
- online only
- today
- this week
- this month
- verified organizers
- beginner friendly
- public spaces only
- ships to me
- sold externally

**Implementation opportunity:** Filter group labels and helper copy can clarify discovery.

**Implementation warning:** Do not change filter logic, query params, or matching behavior.

### Discovery chips

Files:

- `packages/web/src/components/explore/ExploreChipRow.tsx`
- `packages/web/src/lib/explore-hub.ts`

Current discovery chips:

- Near me
- This week
- Online
- Beginner friendly
- New here
- Active groups
- Upcoming events
- Verified organizers
- Vendors shipping to me

Current topic chips:

- BDSM
- Rope
- Impact play
- Leather
- Kink 101
- Community
- Aftercare
- Safety
- Consent
- Conventions

**Implementation opportunity:** Chips are a strong discovery pattern. They should remain prominent and scannable.

**Implementation warning:** Do not change chip IDs or filter behavior.

### Active filter pills

File:

- `packages/web/src/components/explore/ExploreActiveFilterPills.tsx`

Current behavior:

- renders active filter pills
- each pill has a remove button with `aria-label`

**Implementation opportunity:** Improve hierarchy or spacing if needed.

**Implementation warning:** Do not weaken accessible labels or remove behavior.

### Featured and trending

Files:

- `packages/web/src/components/explore/ExploreFeaturedTrendingCard.tsx`
- `packages/web/src/components/explore/ExploreCompactTrendingRow.tsx`
- `packages/web/src/components/home/TrendingItemCard.tsx`

Current featured section:

- uses `trending[0]` as hero
- uses `trending.slice(1, 4)` rows
- uses extra trending rows
- shows empty state if nothing featured

**Implementation opportunity:** Trending should read as “active community signal,” not generic featured content.

**Implementation warning:** Do not change ranking source or add fake trend data.

### Events section

File:

- `packages/web/src/components/explore/ExploreCompactEventRow.tsx`

Current event row:

- date block
- title
- date label
- location
- RSVP count
- mutual connections going
- optional thumbnail or fallback

**Implementation opportunity:** This already aligns with the Events brief. It can become a benchmark mini event row.

**Implementation warning:** Do not change event source or link behavior.

### Sections

File:

- `packages/web/src/components/explore/ExploreHubSection.tsx`

Current behavior:

- title
- description
- optional href and link label
- children

**Implementation opportunity:** Section headers can carry stronger “why this section exists” copy.

**Implementation warning:** Do not globally change section behavior in a way that harms all Explore sections.

### Suggestions

File:

- `packages/web/src/components/explore/ExploreSuggestedRow.tsx`

Current behavior:

- item image/avatar
- name
- type
- reason
- href

**Implementation opportunity:** This is good recommendation explainability structure. It should be visually strengthened.

**Implementation warning:** Do not add fake reasons or data.

### Data and filter utility

File:

- `packages/web/src/lib/explore-hub.ts`

Current utilities:

- category tabs
- popular categories
- suggested item model
- tab normalization
- trending kind labels
- event date block formatting
- search filtering
- people pool building
- URL param parsing
- URL param writing
- chip toggles
- active filter pills
- section visibility
- content-type filters
- event filters
- group filters
- people filters
- vendor filters
- org filters
- article filters
- trending filters

**Implementation warning:** Do not change this file during visual polish unless a label-only change is approved. Logic changes are out of scope.

---

## 5. Current UX diagnosis

### Strengths

Explore is currently one of the strongest desktop surfaces because it already has:

- unified search
- discovery chips
- topic chips
- active filter pills
- filter sheet
- content-type filtering
- trust and safety filters
- multiple content sections
- featured/trending area
- event rows
- group, org, vendor, people, and education previews
- suggested rows with reasons
- DirectoryTemplate layout

This page can become the visual benchmark for discovery.

### Problems to solve

Explore still risks feeling like a dense collection of modules.

Likely issues:

- header is clear but generic
- search helper text can be more action-oriented
- chips may not clearly explain whether they filter or navigate
- sections may not clearly differentiate content types
- featured/trending may feel like generic content instead of active community signal
- suggestions may be useful but visually understated
- filter drawer has many controls that need hierarchy
- education section may feel detached from the rest of discovery
- vendors may read like generic cards rather than marketplace entry points
- organizations may not clearly signal legitimacy or organizer context
- there may be too many sections competing without a clear scan path

### Desired direction

Explore should feel like:

- a map of kink.social
- a discovery command center
- a guided search and browse surface
- the benchmark for events, groups, people, vendors, education, media, and org discovery

The main visual question:

Can a user look at Explore and quickly decide whether to search, filter, browse chips, or jump into a section?

---

## 6. Safe Explore CP3 implementation ideas

These are safe candidates after brief acceptance.

### Safe item 1: Header information scent

File:

- `ExploreHubHeader.tsx`

Safe changes:

- strengthen subtitle
- add compact “Search, filter, browse” framing
- clarify that chips refine the hub
- improve visual hierarchy of search, chips, and filter button
- keep title and H1 structure safe

Do not change search behavior.

### Safe item 2: Filter context

Files:

- `ExploreHubHeader.tsx`
- `ExploreActiveFilterPills.tsx`
- `ExploreFiltersPanel.tsx`

Safe changes:

- improve helper text
- improve active filter pill spacing
- make active filters easier to scan
- label filter groups more clearly

Do not change filter state, URL params, or matching logic.

### Safe item 3: Section hierarchy

Files:

- `ExploreHubSection.tsx`
- possibly local section composition in `ExploreDashboardPage.tsx`

Safe changes:

- strengthen section descriptions
- make section headers more useful
- make “View all” links clearer
- ensure each section explains why it exists

Do not change section visibility logic.

### Safe item 4: Featured/trending treatment

Files:

- `ExploreFeaturedTrendingCard.tsx`
- `ExploreCompactTrendingRow.tsx`

Safe changes:

- make content type and activity context clearer
- improve hero/row hierarchy
- make fallback media intentional
- make trending feel like active community signal

Do not change trending ranking or data source.

### Safe item 5: Compact event row alignment

File:

- `ExploreCompactEventRow.tsx`

Safe changes:

- align with Events CP3 card improvements
- improve date, location, attendance hierarchy
- keep row compact

Do not change event link or event data behavior.

### Safe item 6: Suggested row explainability

File:

- `ExploreSuggestedRow.tsx`

Safe changes:

- make reason text more visible
- make type label clearer
- make item image/fallback more intentional

Do not add fake reasons.

### Safe item 7: Discover page visual rhythm

File:

- `ExploreDashboardPage.tsx`

Safe changes:

- improve spacing between sections
- improve section grouping
- make empty states less flat
- improve sign-in prompt context

Do not change data flow.

### Safe item 8: CSS if needed

Files:

- `shared-surfaces.css`
- `desktop-surfaces.css`

Rules:

- Use `desktop-surfaces.css` for desktop-only polish behind `lg+`.
- Use `shared-surfaces.css` only for cross-breakpoint primitive polish that is mobile-safe.
- Do not edit `mobile-polish.css`.

---

## 7. Risky changes requiring approval

Do not do these automatically:

- changing URL param parsing or writing
- changing filter matching behavior
- changing search behavior
- changing content-type chip IDs
- changing topic chip IDs
- changing section visibility logic
- changing ranking
- changing data hooks
- adding new API calls
- adding fake counts
- adding fake trend data
- adding fake recommendation reasons
- changing links to deeper directories
- changing auth behavior
- changing mobile FilterSheet behavior
- changing mobile chip scroll behavior
- changing DirectoryTemplate globally
- introducing a new tab system

---

## 8. Hard no-change list

Do not change:

- routes
- auth
- API contracts
- data fetching
- schema
- permissions
- URL param behavior
- search behavior
- filter logic
- filter IDs
- chip IDs
- topic values
- ranking
- section visibility logic
- suggested item generation
- org scope logic
- mobile layout
- mobile FilterSheet
- mobile chip row behavior
- BottomNav
- CommunityNavBar
- moderation/report/save behavior on nested cards
- adult or trust visibility behavior

---

## 9. Acceptance criteria

Explore implementation may proceed if it meets these criteria.

### Discovery clarity

- A desktop user understands Explore as the cross-site discovery hub within 3 seconds.
- Search, filters, chips, and sections all feel like intentional ways to discover.
- The user can tell whether they should search, filter, or browse.

### Information scent

- Section titles explain what each section contains.
- CTAs explain where they lead.
- Cards and rows show type, context, and next action.

### Filter clarity

- Active filters are visible and removable.
- Filter group labels are understandable.
- Trust and safety filters remain visible.
- Filter behavior is unchanged.

### Category distinction

Explore should make these content types feel meaningfully different:

- trending
- events
- groups
- people
- organizations
- vendors
- education
- suggestions

### No fake data

- No fake counts.
- No fake trend claims.
- No fake recommendation reasons.
- No new trust badges from unavailable data.

### Mobile protection

- Mobile FilterSheet behavior is unchanged.
- Mobile chip rows remain usable.
- No horizontal overflow.
- No mobile layout shift from desktop polish.

### Accessibility

- No duplicate H1.
- Search remains labeled.
- Filter controls remain labeled.
- Active filter remove buttons keep accessible labels.
- Focus states remain visible.
- Target sizes remain safe.
- Contrast remains readable.

---

## Recommended Explore CP3 implementation pass

After this brief is accepted, implement one Explore-only pass.

Recommended order:

1. Header information scent in `ExploreHubHeader.tsx`
2. Active filter and chip context in `ExploreHubHeader.tsx`, `ExploreActiveFilterPills.tsx`, and `ExploreChipRow.tsx`
3. Section heading clarity in `ExploreHubSection.tsx` and section copy inside `ExploreDashboardPage.tsx`
4. Featured/trending hierarchy in `ExploreFeaturedTrendingCard.tsx` and `ExploreCompactTrendingRow.tsx`
5. Compact event row alignment in `ExploreCompactEventRow.tsx`
6. Suggested row explainability in `ExploreSuggestedRow.tsx`
7. Docs update in `docs/UI_DESKTOP_SPRINT_3.md`

Stop after Explore. Do not polish another route in the same commit.

---

## Verification plan for Explore CP3

Run:

- `npm run typecheck -w web`
- `npm run build -w web`
- focused Explore smoke if available

Inspect or screenshot:

- `/explore`
- `/explore?q=rope`
- `/explore?types=Events`
- `/explore?types=Groups`
- `/explore?types=People`
- `/explore?types=Organizations`
- `/explore?types=Education`
- `/explore?types=Vendors`
- `/explore?near=1`
- `/explore?verified=1`
- `/explore?topics=Rope`

Widths:

- 375 x 812
- 390 x 844
- 430 x 932
- 768 x 1024
- 820 x 1180
- 912 x 1368
- 1024 x 768
- 1280 x 800
- 1440 x 1000
- 1600 x 1000
- 1920 x 1080

Report:

- files changed
- research principles applied
- code context used
- visual changes made
- behavior preserved
- mobile impact
- verification results
- screenshots captured or deferred
- regressions found
- regressions fixed
- recommended next page group
