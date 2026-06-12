# Prelaunch audit — Event creation & public event workflows

**Audit ID:** 06  
**Scope:** Global create-event wizard, URL deep links, `POST /api/v1/events`, convention shell from create flow, public discovery (`/events`), event detail (`/events/:id`), RSVP, location/join privacy, org hub calendar surfaces.  
**Method:** Static code review (no fixes applied).  
**Wave 5 remediation (2026-06-04):** Convention shell create aligned to ADMIN+ via `canCreateConventionShell` on `me/event-publish` + CreateFlowModal gating; orphan event recovery navigates to `/events/:id`.  
**Primary sources:** `packages/web/src/components/CreateFlowModal.tsx`, `packages/web/src/lib/open-create-flow.ts`, `packages/web/src/app/events/**`, `packages/web/src/components/cards/EventCard.tsx`, `packages/api/src/routes/ecosystem-stubs.ts`, `packages/api/src/routes/conventions-routes.ts`, `packages/api/src/lib/physical-location-visibility.ts`, `docs/FEATURE_REGISTRY.md`, `docs/plans/group-location-discovery.plan.md`.

---

## 1. Executive summary

Event creation is **centered on a single global wizard** (`CreateFlowModal` in `RootLayout`) opened from query params (`?create=event|convention`), Create menu links, `data-create-trigger` buttons, or `openCreateFlow()` custom events. The happy path for a **simple event** is coherent: authenticated user → 4 steps → `POST /api/v1/events` → redirect to `/events/:uuid`.

**Production gaps** cluster around **permission mismatch for convention shells**, **incomplete validation vs UI labels**, **group context loss on one create CTA**, and **no draft/publish model** (events are live immediately). Public discovery and detail pages work for **logged-out viewers** when the API and DB are enabled; RSVP and calendar export correctly require sign-in.

**Readiness:** Deployable for **single-event + RSVP** flows with known limitations; **“Make a convention” from create menu** is unreliable for org **MODERATOR** roles (event may succeed, shell fails). Group-scoped private `events.visibility` is not enforced on detail GET.

---

## 2. Blockers

| ID | Issue | Evidence |
|----|--------|----------|
| B-06-1 | **Convention shell creation requires org ADMIN; create flow only guarantees MODERATOR for calendar events.** A moderator who enables “full program” gets `POST /api/v1/events` success then `POST /api/v1/conventions` **403** (`Admin role required`). UI error: “Event was created but convention shell failed…”. | `conventions-routes.ts` `ORG_ROLE_RANK.ADMIN` on `POST /api/v1/conventions`; `ecosystem-stubs.ts` `ORG_EVENT_ROLE_RANK.MODERATOR` on `POST /api/v1/events`; `CreateFlowModal.tsx` convention branch after event create. |
| B-06-2 | **Orphan anchor events after failed convention shell.** No rollback of the inserted `events` row when convention POST fails; user may not be redirected to the new event page. | `CreateFlowModal.tsx` returns early with `setEventPublishError` on convention failure. |

---

## 3. High-risk issues

| ID | Issue | Impact |
|----|--------|--------|
| H-06-1 | **`GET /api/v1/events/:eventId` does not apply group visibility or `events.visibility`.** Group lists filter via `canViewerSeeGroupEvent`; detail returns any UUID that exists. Future non-`public` events could leak to anyone with the link. | `ecosystem-stubs.ts` detail handler; `group-access.ts` `canViewerSeeGroupEvent`. |
| H-06-2 | **Category marked “Required” in UI but not validated** on step 1 or at publish (only title + start time). Empty category events reach production list/detail. | `CreateFlowModal.tsx` `readBasicsValidation`, step 1 `badge="Required"` on category section. |
| H-06-3 | **`datetime-local` → `new Date(dtLocal).toISOString()`** uses browser local offset with no `eventTimezone` default for in-person events. Cross-timezone hosts and attendees can see skewed times unless host sets IANA tz (virtual only field today). | `CreateFlowModal.tsx` publish payload; `EventDetailClient.tsx` `formatInTimezone` only when `eventTimezone` set. |
| H-06-4 | **Logged-out users can open the full create wizard** (steps 1–3) but only discover login requirement on step 4 (`primaryDisabled`). Wastes effort; no redirect to login with return URL. | `StickyWizardFooter` `primaryDisabled={eventStep === 4 && !isAuthenticated}`. |
| H-06-5 | **`/events?groupId=…` “Create Event” button** uses bare `data-create-trigger` **without** `prefillGroupId` / `kind=munch`, unlike group hub CTA. Events created from scoped finder may not associate with the group. | `packages/web/src/app/events/page.tsx` `EventsGroupScopedPage`. |

---

## 4. Medium-risk issues

| ID | Issue | Notes |
|----|--------|-------|
| M-06-1 | **No draft / publish state.** `POST /api/v1/events` inserts immediately; `visibility` defaults to `public` in schema; create UI never sets visibility. “Publish event” means “create live row”. | `schema.ts` `events.visibility` default; no draft enum in create flow. |
| M-06-2 | **Planned group place prefill not implemented.** `group-location-discovery.plan.md` calls for default `publicLocationSummary` and “Use group home region” when `prefillGroupId` + `placeId`; only parent `organizationId` is fetched from group. | `CreateFlowModal.tsx` group fetch effect; plan §1.3. |
| M-06-3 | **`materialsUrl` API requires valid URL**; client has `type="url"` but no pre-submit validation — users see generic 400. | `eventBody` zod in `ecosystem-stubs.ts`. |
| M-06-4 | **Partial convention success messaging** does not link to the created `/events/:id` for recovery. | Error string only in modal. |
| M-06-5 | **Event list caps at 100** with no pagination (`orderBy desc startsAt limit 100`). Busy org/group calendars truncate. | `GET /api/v1/events`. |
| M-06-6 | **Demo fallback when `VITE_HOME_DEMO_FALLBACK=true` and logged out** shows mock events on `/events`, which can diverge from production API behavior. | `EventsDiscoverPage.tsx`, `EventsGroupScopedPage`. |
| M-06-7 | **Non-UUID `/events/:id` still serves mock detail** (`apiMode idle`); mixed demo/production confusing for testers. | `EventDetailClient.tsx` `UUID_PARAM_RE`. |
| M-06-8 | **`.ics` download requires authentication** (`requireUser` on `calendar.ics`). UI only shows calendar links after RSVP + login — consistent but no “add to calendar” for browse-only guests. | `ecosystem-stubs.ts` `calendar.ics`; `EventDetailClient.tsx` calendar block gated. |

---

## 5. Low-risk issues

| ID | Issue | Notes |
|----|--------|-------|
| L-06-1 | **Munch defaults** (RSVP location visibility, newcomer-friendly, +2h end) apply when category is Munch, including via `kind=munch` URL — works as designed. | `useEffect` on `isMunchCategory`. |
| L-06-2 | **URL param strip on close** removes `create`, `prefillOrgId`, `prefillGroupId`, `kind` — good for shareable links not sticking. | `stripCreateFlowSearchParams`. |
| L-06-3 | **Pathname change closes modal** (except first paint skip) — avoids stale modal on navigation; documented fix for empty `/events?create=event` in plans. | `skipPathCloseRef` effect. |
| L-06-4 | **Event cards have no inline RSVP** — by design; RSVP only on detail page. | `EventCard.tsx`, `EventsListRow.tsx`. |
| L-06-5 | **Capacity bar on cards** uses `capacityLimit` from mock shape; API maps `capacityMax` inconsistently on list cards (often missing → synthetic /100 bar). | `api-event-mapper.ts` omits `capacityMax` on `MockEvent`. |
| L-06-6 | **“Make a convention” menu** routes to same wizard as event (`create=convention` only forces full-program messaging + checkbox default). | `CreateMenuDropdown.tsx`. |

---

## 6. Dead/misleading UI found

| Location | Element | Problem |
|----------|---------|---------|
| Create step 1 | Category section `badge="Required"` | Not enforced; misleading. |
| Create step 4 | Button label **“Publish event”** | No separate publish state; event is live on POST. |
| Create step 3 | **“Make a convention”** menu implication | Same modal as event; convention shell still needs org + full program + **ADMIN** for API. |
| `/events` (logged out + demo env) | Mock event grid | Looks like real data when `VITE_HOME_DEMO_FALLBACK=true`. |
| Event detail (non-UUID id) | Full mock tabs (Vendors, Matchmaker, etc.) | Implies features exist for seed ids. |
| Group scoped `/events?groupId=` | **Create Event** | Implies group association; trigger omits prefill. |

---

## 7. Permission issues found

| Flow | UI gate | API gate | Match? |
|------|---------|----------|--------|
| Post org calendar event | Org picker from `GET /organizations/me/event-publish` (moderator+) | `POST /events` moderator+ + `calendarEnabled` | Yes |
| Post group event | Implicit via `prefillGroupId` | Group moderator+; may force org moderator if group has `organizationId` | Yes |
| Convention shell from create | Full program checkbox when org selected | `POST /conventions` **ADMIN+** | **No** — UI allows moderators |
| RSVP going/maybe | Disabled when logged out | `PUT …/rsvp` requires user | Yes |
| RSVP when closed | Buttons + copy | 403 when `rsvpOpen === false` except `not_going` | Yes |
| Host approval queue | Shown when `viewerCanManage` | `PATCH rsvp-approval`, `GET rsvps` | Yes (host/org mod) |
| View full address (RSVP tier) | Redacted location on detail/cards | `physicalLocationDetailVisibleEventIds` | Yes |
| View virtual join link | Redacted when gated | `virtualJoinLinkVisibleEventIds` | Yes |
| Save event (bookmark) | Hidden when logged out | Bookmarks API auth | Yes |

---

## 8. Missing env/config

| Variable / config | Relevance to events |
|-------------------|---------------------|
| `USE_DATABASE` / API DB | Without DB, `requireDb` fails event routes. |
| `VITE_HOME_DEMO_FALLBACK` | Switches `/events` to mock data when unauthenticated. |
| Org `featureFlags.calendarEnabled` | Blocks org-posted events if disabled (400). |
| `C2K_EMBED_ALLOWLIST_HOSTS` | Only if using `ticketEmbedUrl` (not in create wizard today). |
| Session cookie / `credentials: 'include'` | Required for create, RSVP, org list, `.ics`. |

No event-specific env vars missing beyond general app deployment (covered in audit 01).

---

## 9. Recommended fixes

| Priority | Fix |
|----------|-----|
| P0 | Align convention shell permission with UI: either require **ADMIN** in org picker before showing full program, or lower `POST /conventions` to moderator+ with explicit product sign-off. |
| P0 | On convention shell failure: return `eventId` in error response and offer **“Open event”** link; optional transactional delete or “link existing event” repair job. |
| P1 | Enforce category (and optionally org) in `readBasicsValidation` or step-1 gate. |
| P1 | Apply `canViewerSeeGroupEvent` + `visibility` on `GET /events/:id`. |
| P1 | Replace `EventsGroupScopedPage` create button with `CreateFlowTriggerButton` or link to `/events?create=event&prefillGroupId=…`. |
| P2 | Default `eventTimezone` from browser IANA for all formats; show secondary line on detail. |
| P2 | Logged-out create: redirect to login with `redirect` back to current `?create=…` URL at step 1 or 4. |
| P2 | Implement group place → `publicLocationSummary` prefill per plan. |
| P3 | Map `capacityMax` into list/card UI; paginate `GET /events`. |
| P3 | Rename “Publish event” → “Create event” or add real draft workflow later. |

---

## 10. Files likely affected

| Area | Paths |
|------|--------|
| Create wizard | `packages/web/src/components/CreateFlowModal.tsx`, `packages/web/src/lib/open-create-flow.ts`, `packages/web/src/components/create-flow/*` |
| Events pages | `packages/web/src/app/events/page.tsx`, `EventsDiscoverPage.tsx`, `app/events/[id]/EventDetailClient.tsx` |
| Cards / list | `packages/web/src/components/cards/EventCard.tsx`, `EventsListRow.tsx`, `hooks/useApiEvents.ts`, `lib/api-event-mapper.ts` |
| Group CTAs | `packages/web/src/components/group/GroupEventsSection.tsx`, `app/events/page.tsx` |
| API | `packages/api/src/routes/ecosystem-stubs.ts`, `conventions-routes.ts`, `lib/physical-location-visibility.ts`, `lib/group-access.ts` |
| Org calendar | `packages/web/src/components/org/hub/OrgHubCalendarTab.tsx`, `app/orgs/[slug]/OrgHubClient.tsx` |
| Docs | `docs/FEATURE_REGISTRY.md`, `docs/UI_CLEANUP_REGISTRY.md` |

---

## 11. Suggested tests

- API: moderator creates event + full program → convention POST (expect 403 today); admin same path (expect 201).  
- API: group event with `organizationId` mismatch → 400.  
- API: RSVP tiers (`public` / `rsvp` / `approved`) + redaction for anonymous vs going vs host.  
- API: `screeningAnswer` required when question set.  
- E2E: `/events?create=event&kind=munch&prefillGroupId=<uuid>` opens modal with Munch selected and group copy.  
- E2E: publish → lands on `/events/<uuid>` with title visible.  
- E2E: logged-out opens `?create=event`, reaches step 4, publish disabled + login copy.  
- Manual: timezone — create in PT, view in ET with `eventTimezone` set vs unset.

---

## 12. Confidence level

**Medium–high** for create modal, URL params, RSVP, and redaction (clear code paths). **Medium** for permission edge cases across org/group/convention (role matrices spread across files). **Lower** for runtime UI regressions (modal open on all routes, mobile sheet) without browser pass.

---

## Event creation smoke test

Manual checklist for staging/production (DB + session required).

| # | Step | Expected |
|---|------|----------|
| 1 | Logged out: open `/events?create=event` | Modal opens; munch banner if `kind=munch`. |
| 2 | Logged out: complete steps 1–3, step 4 | Publish disabled; “Log in to publish” visible. |
| 3 | Log in: `/events?create=event` | Modal opens; params stripped on close. |
| 4 | Step 1: submit without title/time | Step error on Continue. |
| 5 | Create in-person munch (category or `kind=munch`) | Defaults: RSVP visibility, newcomer-friendly; end +2h if blank. |
| 6 | Publish personal event (no org) | `POST /events` 200; redirect `/events/:uuid`; public page loads logged out. |
| 7 | Org moderator: select org, no full program | Event on org calendar; no convention row. |
| 8 | Org **moderator**: full program enabled | Event created; convention step **fails** (document until fixed); note event id. |
| 9 | Org **admin**: full program | Redirect `/organizer/orgs/:slug/conventions/:convSlug`. |
| 10 | `?create=convention&prefillOrgId=<mod org>` | Convention hint; full program defaulted when org in list. |
| 11 | Group mod: `/events?create=event&prefillGroupId=<gid>&kind=munch` | `groupId` on POST; org auto-filled if group has parent org. |
| 12 | Virtual event with agenda + `eventTimezone` | Fields on detail; join link redaction until RSVP if URL in location. |
| 13 | In-person `locationVisibility=rsvp` without public summary | Public list shows redacted/summary copy. |
| 14 | From `/events?groupId=<gid>` click Create Event | **Known fail:** verify groupId **not** sent unless using link from group tab. |

---

## Bugs/blockers

Consolidated tracker (same as §2–§3, IDs preserved).

1. **B-06-1** — Convention shell ADMIN vs moderator create flow.  
2. **B-06-2** — Orphan event when shell fails.  
3. **H-06-1** — Detail GET missing visibility gate.  
4. **H-06-2** — Category required label lie.  
5. **H-06-3** — Timezone / `datetime-local` semantics.  
6. **H-06-4** — Logged-out wizard dead-end.  
7. **H-06-5** — Group finder create missing prefill.

---

## UI inconsistencies

| Topic | Inconsistency |
|-------|----------------|
| Create entry points | Menu uses query links; organizer uses `openCreateFlow` / `CreateFlowTriggerButton`; group hub uses full query string; group-scoped events page uses undecorated trigger. |
| Convention naming | “Make a convention” vs single “Create event” dialog title. |
| Required fields | Badges vs validation differ for category vs title/time. |
| Location fields | Single “Location” on step 1 vs split `publicLocationSummary` only when visibility ≠ public (organizer panel has fuller ADR 003 story). |
| List vs detail | Cards show “going” counts; no RSVP state on card; detail has full RSVP strip. |
| Featured / capacity | Featured badge from API; capacity bar often uses placeholder denominator on cards. |
| Tabs on detail | Munch-simple tabs hide Vendors/Matchmaker; API-backed non-munch shows full set — good, but mock ids show full tab set always. |

---

## Required fixes

Minimum before advertising **“create convention from Create menu”** or **group-scoped create from event finder**:

| Must fix | Owner hint |
|----------|------------|
| B-06-1 permission alignment or UI gate for ADMIN-only shell | API + `CreateFlowModal.tsx` |
| B-06-2 orphan recovery UX (+ optional API rollback) | `CreateFlowModal.tsx` + `POST /conventions` |
| H-06-5 group finder create prefill | `app/events/page.tsx` |
| H-06-2 category validation or remove Required badge | `CreateFlowModal.tsx` |
| H-06-1 detail visibility (before non-public events ship) | `ecosystem-stubs.ts` |

**Should fix before production polish:** H-06-3 timezone, H-06-4 login redirect, M-06-2 group place prefill, M-06-3 URL validation messaging.

**Can document as alpha:** no draft events, `.ics` auth-only, 100-event list cap, demo mock fallback env.

---

## Appendix — Workflow map

```mermaid
flowchart TD
  entry[Create entry: menu / query / trigger / openCreateFlow]
  modal[CreateFlowModal 4 steps]
  postEvent[POST /api/v1/events]
  branch{fullProgram and publishOrgId?}
  postConv[POST /api/v1/conventions]
  orgKit[/organizer/.../conventions/:slug]
  detail[/events/:id]
  entry --> modal --> postEvent --> branch
  branch -->|no| detail
  branch -->|yes| postConv
  postConv -->|ok ADMIN| orgKit
  postConv -->|fail MOD| modal
```

### URL parameters (reference)

| Param | Values | Behavior |
|-------|--------|----------|
| `create` | `event`, `convention` | Opens modal; convention sets `fullProgram` default |
| `kind` | `munch` | Sets category Munch + munch defaults |
| `prefillOrgId` | UUID | Sets org calendar select (validated UUID) |
| `prefillGroupId` | UUID | Sets `groupId` on POST; fetches parent org if needed |

### Publish / state assumptions

- **No draft:** Event is public-ready on insert (`visibility` default `public`, `rsvpOpen` default `true`).  
- **Activity:** `event_created` feed emission on successful insert.  
- **Convention shell:** Separate `conventions` row linked via `anchorEventId`; program slots are **not** created in create flow — organizer adds later in Command Bridge.  
- **“Publish” button:** Solely triggers create + redirect; does not toggle `featured` or ECKE.

---

*Audit completed 2026-06-04. No code changes in this pass.*
