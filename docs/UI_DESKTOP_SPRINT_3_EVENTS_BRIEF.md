# Sprint 3 Events Research + Code Context Brief

**Status:** Complete — reviewed and accepted  
**Page group:** Events discovery and event-card scanability

**Routes in scope for implementation:**

- `/events`

**Routes in audit context only:**

- `/events?view=past`
- `/events?mine=...`
- `/events?groupId=...`
- `/events/:id`

**Status:** Accepted — CP3 Events implementation complete (2026-06-13).

---

## 1. Product pattern classification

Events is a mixed product surface:

- Event discovery
- Event registration decision support
- Social discovery
- Directory/list browsing
- Trust and safety surface
- Future organizer funnel

The primary product job is not decoration. The page must help a member decide whether an event is relevant, nearby, safe, worth attending, and actionable.

The page also has organizer-adjacent signals, but organizer workflows are not in scope for this pass.

---

## 2. Research-backed principles

Events polish must be judged against event discovery and decision support, not generic visual appeal.

References: [NN/g information scent](https://www.nngroup.com/articles/information-scent/), [NN/g cards](https://www.nngroup.com/articles/cards-component/), [Baymard product lists](https://baymard.com/blog/current-state-product-list-and-filtering), [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Information scent

Every event surface should answer:

- What is this?
- Why should I care?
- What happens if I click?

That applies to the page header, featured strip, category chips, filters, cards, list rows, rail cards, save actions, and detail links.

### Event decision clarity

Event browsing must make these details easy to find:

- Event name
- Date
- Time if available
- Location or virtual state
- Host or organizer context if available
- Event type or category
- Social proof if available
- Safety or trust context if available
- RSVP, register, save, or view-details action

The user should not need to open every event just to understand basic relevance.

### Card and list scanability

Events are comparable items. Cards can feel alive, but lists are often better for comparison. The page should preserve both modes.

List mode should stay highly scannable:

- date block
- title
- location
- format
- category or tags
- RSVP or mutual-going context
- save action
- view details action

Grid mode should feel richer without hiding the same decision-critical information.

### Filtering and sorting

Events are browsed by time, place, format, category, distance, and relevance. Filters and sorting are not secondary decoration. They are core event-discovery tools.

The filter experience should remain easy to find on desktop and mobile.

### Right rail usefulness

The right rail should help users decide what to do next. It should not feel like filler.

Useful rail patterns:

- suggested events
- active categories
- popular locations
- organizer/create prompt
- upcoming agenda if already available
- safety or planning reminder if already present

No fake data should be added.

### Adult-community trust

Events in an adult community need stronger trust cues than generic event sites.

Do not bury everything in overflow menus. Save, report, visibility, RSVP state, host context, and safety-related affordances should remain understandable.

### Accessibility

The Events pass must preserve:

- readable dark-mode contrast
- visible focus states
- keyboard-safe controls
- touch targets
- non-text UI contrast
- no nested interactive elements
- no mobile overflow
- no loss of labels on form fields

---

## 3. kink.social-specific user job

A member comes to Events to answer:

- What is happening near me?
- What is happening soon?
- Is this online, local, a class, a munch, a convention, or something else?
- Who is hosting it?
- Are people going?
- Is anyone I know interested?
- Is it safe and relevant for me?
- What can I do next: save, RSVP, register, view details, or create an event?

An organizer may also come to Events looking for where to create or manage events, but organizer tooling is not part of this polish pass.

---

## 4. Current code context

### Route branching

File: `packages/web/src/app/events/page.tsx`

This route is not a single flat Events page.

It branches into:

- group-scoped events when `groupId` is present
- personal event modes when `mine` or RSVP query modes are present
- main discovery through `EventsDiscoverPage`

**Implementation warning:** Do not touch group-scoped or personal-library behavior during the first Events polish pass.

### Main discovery page

File: `packages/web/src/app/events/EventsDiscoverPage.tsx`

The main Events discovery page already uses the right structure.

Current components and logic:

- `DirectoryTemplate`
- `EventCard`
- `EventsListRow`
- `EventsFeaturedStrip`
- `EventsDiscoverLeftRail`
- `EventFiltersPanel`
- `EventsRightRail`
- `EventsScopeTabs`
- `EmptyState`
- `EventSkeleton`
- `DirectoryFilterButton`
- `FilterSheet`
- `useApiEvents`
- `useApiMyRsvps`
- `usePersistedGeoText`
- `rankEvents`
- `countEventsByCategory`
- `filterEventsByScope`
- `paginateEvents`
- list/grid view mode
- sort mode
- search query
- filter sheet draft state
- pagination
- mock fallback when configured

Current page title:

- `Events`
- `Past Public Events` for past view

Current subtitle:

- `Find classes, munches, conventions, and community gatherings.`
- `Browse events that have already happened.` for past view

### Template

File: `packages/web/src/components/templates/DirectoryTemplate.tsx`

Current slots: `header`, `toolbar`, `resultSummary`, `desktopSidebar`, `desktopAside`, `desktopAsideFrom`, `children`, `footer`

Events currently uses: left sidebar, right aside, toolbar, children list/grid, no custom header unless changed later.

**Implementation warning:** No new `DirectoryTemplate` API is required for the Events CP3 pass unless the current slots are truly insufficient.

### Filters

File: `packages/web/src/components/events/EventFiltersPanel.tsx`

Current filters: date range, event format, category, location through `GeoFilterControl`, reset filters.

Mobile filter behavior: uses `FilterSheet`.

**Implementation warning:** Do not change filter logic, filter data, or mobile sheet behavior.

### Scope tabs

File: `packages/web/src/components/events/EventsScopeTabs.tsx`

Current tabs: All Events, For You, This Weekend, Next 7 Days, This Month.

**Implementation opportunity:** Tabs already match event decision patterns. The polish pass can improve presentation, not behavior.

### Left rail

File: `packages/web/src/components/events/EventsDiscoverLeftRail.tsx`

Current left rail: collapsible filters, My agenda when available, RSVP/organizing agenda rows, retry state, empty agenda state, sign-in prompt for agenda, sync to calendar link.

**Implementation opportunity:** The left rail is useful but can feel more intentional as event planning support.

**Implementation warning:** Do not change agenda fetch behavior, RSVP state, or calendar sync logic.

### Right rail

File: `packages/web/src/components/events/EventsRightRail.tsx`

Current right rail: create event prompt, suggested events, category counts, location counts, Kink Social+ prompt.

**Implementation opportunity:** The right rail should become event decision support instead of plain utility lists.

**Implementation warning:** Do not add fake data. Use existing suggested events, counts, and links only.

### Featured strip

File: `packages/web/src/components/events/EventsFeaturedStrip.tsx`

Current behavior: takes first three events, returns null if fewer than two, shows featured badge if available, shows hero image or fallback, title, date, preview avatars, RSVP count or “RSVP on event page”.

**Implementation opportunity:** This is one of the best places to add event energy, but it should still help decision-making.

**Implementation warning:** Do not make it a decorative carousel with weaker event facts.

### Event cards

File: `packages/web/src/components/cards/EventCard.tsx`

Current card already supports: title, date, location, image/banner/fallback, event format, tags, RSVP count, capacity where available, mutual-going preview, featured state, save button, formatted location handling.

**Implementation opportunity:** Make date, location, format, category/tags, social proof, and next action easier to scan.

**Implementation warning:** Do not add fields that are not already available.

### List rows

File: `packages/web/src/components/events/EventsListRow.tsx`

Current list rows already support stronger comparison: date block, media/fallback, title, location, format, tags, RSVP/mutual context, save button, view details action.

**Implementation opportunity:** Use list row structure as the benchmark for event scanability.

### Save action

File: `packages/web/src/components/events/EventSaveButton.tsx`

Current behavior: only renders for authenticated, non-fallback users; uses bookmarks API; prevents event card navigation when clicked; has `aria-label`, `aria-pressed`, and title state.

**Implementation warning:** Do not change save behavior.

### Event detail risk context

Files:

- `packages/web/src/app/events/[id]/page.tsx`
- `packages/web/src/app/events/[id]/EventDetailClient.tsx`

Event detail is high risk. It includes: RSVP state and updates, attendee tabs, vendors, discussion, safety info, matchmaker, schedule insertion for convention-linked events, host edit form, attendee visibility, ticket purchase and ticket embed logic, virtual join handling, report action, save action, MobileActionBar, calendar links, reviews, contributors, host permissions.

**Implementation rule:** Do not change event detail in the first Events discovery polish pass.

### Data hooks

Files:

- `packages/web/src/hooks/useApiEvents.ts`
- `packages/web/src/hooks/useApiMyRsvps.ts`

**Implementation warning:** Do not change hooks in CP3 Events polish.

### Utility helpers

File: `packages/web/src/lib/events-page-utils.ts`

**Implementation opportunity:** Use existing helpers for display consistency if needed.

**Implementation warning:** Do not change filtering, pagination, or ranking behavior unless explicitly approved.

---

## 5. Current UX diagnosis

### Header and page scent

Current header copy is clear but plain. Does not yet create strong event-decision scent.

**Safe direction:** Improve the Events header to feel like a decision gateway; add compact metadata/helper line using existing filter/result state.

### Date, location, and type visibility

List rows have a strong date-block pattern. Grid cards need the same clarity.

**Safe direction:** Improve visual hierarchy in `EventCard` and `EventsListRow` using existing fields only.

### Filters and sorting

Toolbar can feel like utility controls rather than guided discovery. Result context is not currently used.

**Safe direction:** Add result-summary copy through `DirectoryTemplate` slot; improve toolbar grouping and microcopy.

### Featured strip

Can be more decision-oriented than generic “Upcoming highlights.”

**Safe direction:** Reframe strip copy; strengthen date/social proof presentation.

### Right rail

Reads as plain utility lists.

**Safe direction:** Reframe sections around decisions (host something, suggested next, browse by category/city). Keep existing data only.

### Trust and safety

Do not invent new trust data. Make host/context signals more legible where already available.

### Mobile protection

EventCard polish and shared date-badge styles are cross-breakpoint. FilterSheet must remain unchanged.

**Safe direction:** Desktop-first changes behind `lg+` where possible; document and verify any mobile-visible change.

---

## 6. Safe CP3 Events changes

### Files likely to change

**Primary:**

- `packages/web/src/app/events/EventsDiscoverPage.tsx`
- `packages/web/src/components/cards/EventCard.tsx`
- `packages/web/src/components/events/EventsListRow.tsx`
- `packages/web/src/components/events/EventsFeaturedStrip.tsx`
- `packages/web/src/components/events/EventsRightRail.tsx`
- `packages/web/src/components/events/EventsDiscoverLeftRail.tsx`
- `docs/UI_DESKTOP_SPRINT_3.md`

**Optional:** `EventsScopeTabs.tsx`, `desktop-surfaces.css`, `shared-surfaces.css`

**Do not touch:**

- `packages/web/src/app/events/page.tsx`
- `packages/web/src/app/events/[id]/EventDetailClient.tsx`
- `packages/web/src/hooks/useApiEvents.ts`
- `packages/web/src/hooks/useApiMyRsvps.ts`

### Safe implementation items

1. Events header information scent (`EventsDiscoverPage.tsx`)
2. Result context row (filtered count, scope, sort, view mode)
3. Featured strip framing (`EventsFeaturedStrip.tsx`)
4. EventCard scanability (`EventCard.tsx`)
5. EventsListRow comparison polish (`EventsListRow.tsx`)
6. EventsRightRail usefulness (`EventsRightRail.tsx`)
7. Left rail planning hierarchy (`EventsDiscoverLeftRail.tsx`)
8. Desktop-only atmosphere via `desktop-surfaces.css` (lg+)

---

## 7. Risky changes requiring approval

Do not do automatically: RSVP/registration logic, event detail actions, event creation flow, ticket/payment assumptions, new trust badges, more attendee exposure, group-scoped/personal mode changes, API hooks, ranking/filter/sort/pagination, MobileActionBar, event detail tabs, new data fetches, filter sheet rework, mobile card layout changes.

---

## 8. Hard no-change list

Do not change: routes, auth, API contracts, data fetching, schema, permissions, event creation, RSVP, registration, payment/ticketing, host permissions, group-scoped behavior, personal library behavior, save/report/share behavior, filter/search/sort/pagination behavior, mobile layout, mobile filter sheet, adult/safety visibility, event detail page behavior.

---

## 9. Acceptance criteria

### Information scent

- Desktop user understands Events page purpose within ~3 seconds.
- Header communicates community gatherings, classes, munches, conventions, nearby activity.
- Primary and secondary actions are visually clear.

### Event decision support

Cards and rows answer: what, when, where/format, type, context, social proof, next action.

### Scanability

- List mode remains highly scannable.
- Grid mode richer without hiding key facts.

### Filters and sorting

- Search, filters, scope tabs, list/grid, sort remain easy to find; behavior unchanged.

### Right rail

- Feels like decision support, not filler; no fake data.

### Trust and safety

- Save, report, RSVP/register/detail paths unchanged; no new sensitive attendee info.

### Accessibility

- No duplicate H1, missing labels, nested interactives; focus/contrast/targets preserved.

### Mobile protection

- Card density unchanged unless documented; no horizontal overflow at 375–1024.

---

## Recommended Events CP3 implementation pass

After brief acceptance, implement one scoped Events pass in this order:

1. Header and result context — `EventsDiscoverPage.tsx`
2. Featured strip framing — `EventsFeaturedStrip.tsx`
3. EventCard scanability — `EventCard.tsx`
4. ListRow polish — `EventsListRow.tsx`
5. Right rail hierarchy — `EventsRightRail.tsx`
6. Left rail planning hierarchy — `EventsDiscoverLeftRail.tsx`
7. Documentation — `docs/UI_DESKTOP_SPRINT_3.md`

**Stop after Events.** Do not polish other pages in the same commit.

---

## Verification plan for Events CP3

Run: `npm run typecheck -w web`, `npm run build -w web`, focused event smoke tests if available.

Inspect: `/events`, `/events?view=past`, `/events?groupId=...`, `/events?mine=registrations` (when available).

Widths: 375–1920 matrix per Sprint 3 spec.

Report: files changed, principles applied, code context, visual changes, behavior preserved, mobile impact, verification, screenshots, regressions.
