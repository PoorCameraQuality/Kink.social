# Dancecard organizer parity (C2K ↔ integration kit)

**Last updated:** 2026-06-06 (parity table vs `convention-organizer-routes.ts` + dancecard kit shell)

**Gold standard:** `C:\Users\shkin\Desktop\eastcoast\dancecard-integration-kit\` (688 files)

**C2K convention manager:** `/organizer/orgs/:slug/conventions/:convSlug?tab=…`  
**Kit reference route:** `/organizer/dancecard/[eventSlug]?tab=…`  
**Identity ADR:** [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md) — ECKE publish is marketing/SEO; registration stays on C2K.

Parity means **same organizer UX and behavior** as the kit, backed by **C2K Postgres + `/api/v1/conventions/:key/…`**, with **publish bridge** to ECKE `dancecard_*` on outbound sync.

---

## Implementation status (2026-06-06)

| Layer | Status | Notes |
|-------|--------|-------|
| Schema (`convention_*` tables) | **Shipped** | `convention-organizer-schema.ts` + FKs on `schedule_slots` / `convention_volunteer_shifts`; **ECKE 007–059 parity columns landed** (see [`ECKE_C2K_ENTITY_MAP.md`](./ECKE_C2K_ENTITY_MAP.md#convention-schema-parity-additions-ecke-007059)). Apply via `npx tsx packages/api/scripts/migrate-organizer-parity.ts`. |
| API routes | **Shipped** | `convention-organizer-routes.ts` + domain modules under `routes/convention-organizer/` (~85 GET paths); shared mappers in `packages/api/src/lib/convention-organizer/registration.ts` (`RegistrationCategoryBody`, `RegistrationFormBody`, `TrustedRoleBody`, `mapRegistrantFull`, `assertCheckInAllowed`). Kit-equivalent handlers for registration categories, registration form PUT, trusted roles, policy documents, message campaigns, webhooks, event entitlements, meal periods, exhibitors, session feedback. |
| **Organizer bootstrap** | **Shipped** | `GET /api/v1/conventions/:key/organizer/bootstrap` — see [Bootstrap](#organizer-bootstrap) below. |
| Public attendee API | **Shipped** | `convention-public-routes.ts` (`/api/v1/public/conventions/:key/register-info`, `/registrations`, `/trusted-roles/:applySlug`, `/trusted-roles/:applySlug/apply`). |
| Public attendee UI | **Shipped** | `/conventions/:slug/register` (`RegisterFlow.tsx`), `/conventions/:slug/apply/:applySlug`. Convention page shows registration CTA based on `access.hasPaidAccess`. |
| API libs | **Shipped** | `packages/api/src/lib/convention-organizer/` + `convention-organizer/registration.ts` shared Zod + mappers |
| Web UI (kit shell) | **Shipped** | `packages/web/src/components/dancecard/organizer/` (~120 files) + `ConventionDancecardOrganizerClient`; bootstrap-driven workspace; `RegistrantsPanel` + `PersonDetailDrawer` check-in fields; command palette + onboarding guides. |
| Web API client | **Shipped** | `organizerApi.ts` → `/api/v1/conventions/:key/`; GET cache + `invalidateOrganizerDancecardCache`; legacy `/api/organizer/dancecard/` removed |
| Extra routes | **Shipped** | `/door`, `/print/schedule`, `/print/venue-signs` under org convention path |
| ECKE location sync | **Shipped** | `ecke-dancecard-location-sync.ts`; `locationId` on slots/shifts in publish payload |
| ECKE slot sync | **Shipped** | `ecke-dancecard-slot-sync.ts`; C2K slot UUID upserted as ECKE `id` |
| ECKE staff shift sync | **Shipped** | `ecke-dancecard-staff-sync.ts`; volunteer shifts on publish |
| Legacy deprecations | **Shipped** | `ConventionProgramOrganizer` deprecated; Manage tab uses full kit shell; legacy `/organizer/dancecard/:slug` → org-scoped workspace |
| Identity Phase 1–2 | **Shipped** | Registrants require `userId`; staff shifts require `personId`; link-account removed from UI |
| Command bridge RBAC | **Shipped** | `convention_command_grants`; API + nav filtered by registration / staff_ops / scheduler; Settings → Command team |

### Open gaps (organizer)

| Gap | Status | Where |
|-----|--------|-------|
| Dashboard **Recent activity** feed | **Open** | `OrganizerEventDashboard.tsx` — placeholder panel; no audit/event stream wired |
| Embed token **revoke** | **Open** | `IntegrationsPanel.tsx` — tokens list as Active; revoke not implemented |
| Google Sheets **OAuth** import | **Partial** | `GoogleSheetsImportSection.tsx` — file/JSON import shipped; live Sheets pull needs server OAuth or `publicPullAvailable` |
| **Grant-persona** manual walk | **Open** | Registration-only / scheduler-only / staff-only nav boundaries — not covered by automated tab walk |
| **Door mobile walkthrough** | **done (2026-06-06)** | Playwright `door.spec.ts` + manual 390×844; check-in eligibility unified on PATCH + POST |
| Full **manual tab smoke** sign-off | **Open** | Checklist below; API tab-walk passes core paths only |

---

## Organizer bootstrap

Single round-trip loads the workspace shell. Implemented in `convention-organizer-routes.ts`; consumed by `ConventionDancecardOrganizerClient.tsx` and the standalone door page.

### API — `GET /api/v1/conventions/:key/organizer/bootstrap`

| Field | When included | Purpose |
|-------|---------------|---------|
| `event` | always | Kit `mapEventDto` (title, window, settings, access codes for full admin) |
| `permissions`, `organizerRole` | always | Command bridge RBAC for nav + read-only gates |
| `timezone`, `windowStartsAt`, `windowEndsAt` | always | Shell header + date-gated panels |
| `slots` | `scheduler` or full admin | Program grid bootstrap |
| `locations` | `scheduler` or full admin | Venues tab |
| `shifts` | `staff_ops` or full admin | People → Staff shifts |

Auth: session + org **MODERATOR+** via `requireOrganizer(…, 'any')`. Runs `migrateVenueRoomsToLocations` before read.

### Web client

| Consumer | Behavior |
|----------|----------|
| `ConventionDancecardOrganizerClient` | `loadBootstrap()` on mount; `OrganizerWorkspaceSkeleton` until ready; invalidates bootstrap after program/staff refresh |
| Door page (`…/door/page.tsx`) | Loads bootstrap for title + permissions gate |
| `organizerApi.ts` | GET cache TTL **5s** for `/organizer/bootstrap` |

After bootstrap, tabs fetch their own endpoints (e.g. settings uses `GET /event`, people sub-tabs hit `/registrants`, `/staff-shifts`, etc.).

---

### Automated verification

| Script | Purpose | Coverage |
|--------|---------|----------|
| `node scripts/audit-command-bridge.mjs` | Owner probes all v1 GET paths + RBAC matrix | API |
| `node scripts/smoke-command-bridge.mjs` | Grant lifecycle smoke (21 checks) | RBAC |
| `npx tsx packages/api/scripts/smoke-organizer-parity.ts <slug>` | Round-trip save paths (categories, form PUT, trusted roles, campaigns, entitlements, modules) | API mutations |
| `node scripts/smoke-organizer-tab-walk.mjs` | Login + GET per primary tab | bootstrap, program-slots, locations, registrants, message-templates, registration-categories, door/roster — **not** exports, integrations, or people sub-tabs |

Legacy bookmarks `/organizer/dancecard/:slug` redirect to org-scoped workspace via `OrganizerConventionManageRedirect`.

---

## Command bridge RBAC smoke (2026-05-22)

1. As org **owner** (`RopeDreamer`): open Settings → **Command team**; grant a test user **Registration** only.
2. Log in as that user: sidebar shows People (signups/applications) only; `PATCH .../program-slots/:id` → 403.
3. Grant **Staff ops**: staff shifts, messaging, exports appear; program tab still hidden.
4. Grant **Scheduler**: program, venues, import appear; `POST .../registrants` → 403 without registration flag.
5. Door mode (`/door`) requires registration permission.
6. **Settings tab**: `GET|PATCH .../event` loads and saves (admin only); header dates from bootstrap `event` + wrapper.
7. **Publish bar**: visible only when `permissions.isFullAdmin`; ECKE publish routes require full admin.
8. **Print routes** (`/print/schedule`, `/print/venue-signs`): gate on `GET .../organizer/command-access`; data from `GET .../organizer/print-data` (any command grant).
9. **Dashboard**: setup tasks and readiness shortcuts filtered by permission domain; readiness API 403 handled for non-scheduler users.

### Completion-pass API routes

| Method | Path | Permission | Purpose |
|--------|------|------------|---------|
| `GET` | `/organizer/bootstrap` | any | Workspace DTO (event, slots, shifts, locations, permissions) |
| `GET` | `/event` | admin | Kit event settings DTO (`mapEventDto`) |
| `PATCH` | `/event` | admin | Merge kit fields into `conventions.settings.eventSystems` |
| `GET` | `/organizer/print-data` | any | `{ eventTitle, timezone, slots, locations }` for print pages |
| `GET` | `/organizer/command-access` | any | `{ permissions, organizerRole, hasAnyAccess }` for shell + print gate |

---

## Local demo (requires `npm run dev`)

| What | URL |
|------|-----|
| Convention organizer dashboard | http://localhost:5173/organizer/orgs/demo-east-collective/conventions/preview-c2k-weekend?tab=dashboard |
| People → registrants | `…?tab=people&peopleTab=signups` |
| Program / venues / import | `…?tab=program`, `…?tab=venues`, `…?tab=import` |
| Door mode | `…/door` |

Sign in as org **MODERATOR+** on `demo-east-collective` (see [`LOCALHOST_DEMO_LINKS.md`](./LOCALHOST_DEMO_LINKS.md)). Parity seed convention: `preview-c2k-weekend`.

---

## Convention organizer — parity matrix

**Sidebar** (`organizerNavConfig.ts` + `commandBridgeNavPermissions.ts`): Overview, Program, Room availability, Import, People, Messaging, Settings, Exports, Integrations. Door is a sidebar link to `…/door`, not a `tab=` value.

**Legacy routable tabs** (redirect or deep link, not in sidebar): `registrants`, `staff`, `vetting`, `swaps`, `badges`, `dm` → `tab=people&peopleTab=…`; `media` → `exports`; `assignments` → deep link from Program (“Schedule credits”).

| Area | Status | C2K surface |
|------|--------|-------------|
| **Overview** (`dashboard`) | **Shipped** | `OrganizerEventDashboard` + `LiveOpsConsolePanel` (`GET /ops/live`, readiness API); setup checklist; quick actions + door link |
| ↳ Recent activity feed | **Open** | Placeholder copy only — no live feed |
| **Program** (`program`) | **Shipped** | `ProgramTab` — grid (`ProgramScheduleGrid`), list, `SessionDetailDrawer`, conflicts dock, `PresenterRequestsPanel`, publish filter, ghost-cursor onboarding |
| **Room availability** (`venues`) | **Shipped** | `VenuesTabPanel` — `VenueAvailabilityGrid`, map canvas, location CRUD; requires event window |
| **Import** (`import`) | **Shipped** | `ScheduleImportPanel` — CSV/JSON DnD, column mapping, staff import board |
| ↳ Google Sheets | **Partial** | `GoogleSheetsImportSection` — needs OAuth or public-pull env |
| **People** (`people`) | **Shipped** | `PeopleHubPanel` — grouped sub-tabs (see below); munch template limits to signups + roster |
| **Messaging** (`messaging`) | **Shipped** | `MessagingPanel` — templates + campaigns (`POST …/send`) |
| **Settings** (`settings`) | **Shipped** | `EventSettingsPanel` — wizard + 13 panels (basics, branding, gallery, channels, registration, policies, venue/maps, tracks, attendee guide/profile, participation, command team, advanced) |
| **Exports** (`exports`) | **Shipped** | `ExportsHubPanel` — CSV/ZIP downloads, calendar feeds, iCal busy preview, print layout links |
| **Integrations** (`integrations`) | **Shipped** | `IntegrationsPanel` — module entitlements, API keys, webhooks, embed tokens, inbound registrant secret, ECKE publish (`EckePublishStub`) |
| ↳ Embed revoke | **Open** | Mint only; revoke UI not wired |
| **Assignments** (`assignments`) | **Shipped** | `AssignmentBoardPanel` — slot people board; opened from Program, not sidebar |
| **Door** (`…/door`) | **Shipped** | `DoorModePanel` — roster cache, check-in, QR lookup/camera |

### People hub sub-tabs (`peopleTab=`)

| Sub-tab | Status | Panel |
|---------|--------|-------|
| `signups` | **Shipped** | `RegistrantsPanel` — user picker, import, check-in eligibility, category inline edit |
| `roster` | **Shipped** | `PeopleDirectoryPanel` — unified directory |
| `staff` | **Shipped** | `StaffShiftsPanel` — user picker, no link-account |
| `applications` | **Shipped** | `VettingQueuePanel` + `TrustedRolesPanel` |
| `swaps` | **Shipped** | `ShiftSwapsPanel` |
| `badges` | **Shipped** | `BadgesPrintPanel` |
| `coverage` | **Shipped** | `DmCoveragePanel` — requires event window |
| `incidents` | **Shipped** | `SafetyIncidentsPanel` |
| `compliance` | **Shipped** | `VolunteerCompliancePanel` |

---

## Identity enforcement (Phase 1–2, 2026-05-22)

Aligned with [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md):

| Area | Behavior |
|------|----------|
| **Add registrant** | `POST /registrants` requires `userId` (UUID). Upserts `(convention_id, user_id)` and syncs `convention_access_grants.attendingConfirmed`. |
| **Import registrants** | `POST /registrants/import` accepts `{ rows: [...] }`; each row must have `email` that resolves to an existing C2K user — otherwise skipped with error. |
| **Staff shifts** | `POST/PATCH /staff-shifts` require `personId` (C2K user UUID). Display name defaults from profile. |
| **User picker** | `GET /organizer/user-picker` returns org members (`userId`, display name, username, email) for `EntityPickerModal` in registrants + staff UI. |
| **UI removed** | Kit “link account” / orphan registrant paths removed from `RegistrantsPanel` and `StaffShiftsPanel`. |
| **DB constraint** | `convention_registrants_conv_user_idx` unique on `(convention_id, user_id)`. |

Kit JSON field `personId` on registrant payloads maps to `user_id` in Postgres.

---

## Identity & people API routes

All paths under `/api/v1/conventions/:key/`; require auth + org **MODERATOR+** (via `requireOrganizer`).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/organizer/user-picker` | Org members for registrant signup and staff-shift assignment |
| `GET` | `/registrants` | Paginated list (`limit`, `offset`, `q`); joins profile display name |
| `POST` | `/registrants` | Create/upsert registrant — body **`userId`** required |
| `POST` | `/registrants/import` | Bulk import — `{ rows: [{ email, categoryName?, badgeName?, … }] }`; email → C2K user |
| `PATCH` | `/registrants/:registrantId` | Update category, badge, pronouns, notes, status (metadata only; identity fixed at create) |
| `DELETE` | `/registrants/:registrantId` | Remove registrant row |
| `GET` | `/staff-shifts` | List shifts with window metadata |
| `POST` | `/staff-shifts` | Create shift — body **`personId`** required (C2K user UUID) |
| `PATCH` | `/staff-shifts/:shiftId` | Update shift; changing assignee requires valid `personId` |
| `DELETE` | `/staff-shifts/:shiftId` | Remove shift |

Full route inventory: `packages/api/src/routes/convention-organizer-routes.ts` + `routes/convention-organizer/*.ts` (ops, people, registration, door, policy, program-ext, modules).

### P0 completion routes (2026-05-22)

| Method | Path | Permission | Purpose |
|--------|------|------------|---------|
| `GET` | `/ops/live` | any | Live ops dashboard payload |
| `GET\|POST\|PATCH\|DELETE` | `/people`, `/people/:id` | staff_ops | People directory CRUD |
| `GET\|POST\|PATCH\|DELETE` | `/registration-categories` | registration (read) / admin (write) | Ticket types |
| `GET\|PATCH` | `/registration-form` | admin | Signup form + questions |
| `GET\|POST\|PATCH\|DELETE` | `/policy-documents` | admin | Policy ledger |
| `GET` | `/policy-acceptances/stats`, `/policy-acceptances/export` | registration | Compliance exports |
| `GET\|POST\|PATCH\|DELETE` | `/trusted-roles` | admin | Trusted role workflow |
| `GET` | `/door/roster` | any (read) | Door mode offline cache |
| `POST` | `/registrants/check-in` | registration | Door check-in |
| `GET` | `/registrants/lookup`, `/registrants/:id/qr` | registration | QR scan |
| `GET` | `/registrants/export` | registration | CSV export |
| `POST` | `/program-slots/bulk` | scheduler | Bulk slot updates |
| `GET\|PUT` | `/program-slots/:id/people` | scheduler | Slot people drawer |
| `GET` | `/program-slots/:id/change-log`, `/audit` | scheduler | Slot history |
| `POST` | `/ical-busy-preview` | scheduler | ICS busy preview |
| `GET` | `/badges/print-data` | registration | Badge print sheet |
| `POST` | `/badges/logo/upload` | admin | Badge logo upload |
| `GET` | `/exports/event-pack` | staff_ops | ZIP event pack |
| Module routes | `/iso`, `/attendee-groups`, `/exhibitors`, `/meal-*`, `/session-feedback`, `/volunteer-compliance`, `/calendar-feeds`, `/google-sheets/*`, `/registrant-inbound-secret` | varies | Integrations panel |

---

## Extra routes (C2K web)

| Route | Component |
|-------|-----------|
| `…/conventions/:convSlug/door` | `DoorModePanel` |
| `…/conventions/:convSlug/print/schedule` | Printable schedule — `command-access` gate + `GET .../organizer/print-data` |
| `…/conventions/:convSlug/print/venue-signs` | Venue sign sheets — same gate + print-data API |

---

## Attendee dancecard (C2K hub — 2026-05-26)

**Target UX:** [ECKE sandbox](https://www.eastcoastkinkevents.com/dancecard/sandbox) feature cards — native in C2K, not link-out for attendees.

| Card | C2K component | API |
|------|---------------|-----|
| Program | `ConventionAttendeeHubShell` → `ConventionScheduleAgenda` | schedule slots + signup |
| My availability | `ConventionDancecardPanel` (+ personal block `POST …/dancecard`) | `convention-dancecard-routes.ts` |
| Profile | Link to `/settings` | — |
| Compare | Share links + `/dancecard/s/:token` | share + booking-requests |
| Reservations | `ConventionDancecardPanel` (focus mode) | booking-requests |
| ISO board | Hub ISO tab (or shell pointer) | iso-board routes |
| Attendee groups | `ConventionAttendeeGroupsPanel` | `convention-attendee-routes.ts` |
| Venue map | `ConventionAttendeeMapsPanel` | `GET …/maps` + pins |
| Policies | `ConventionPublishedPoliciesPanel` on **Documents** tab (not a hub card) | `GET/POST …/policies/published|sign` |
| Volunteer claim | `ConventionDancecardPanel` — Open volunteer shifts | `GET …/volunteer-shifts/open`, `POST …/volunteer-shifts/:shiftId/claim` |
| Shift swaps | `ConventionDancecardPanel` — Shift swap requests | `GET …/shift-swaps/mine`, `GET …/shift-swaps/eligible-shifts`, `POST …/shift-swaps/requests`, `PATCH …/shift-swaps/requests/:swapId` (cancel own pending; organizer approve on `…/shift-swaps`) |
| Compare grid | `ConventionAttendeeComparePanel` + `ConventionDancecardCompareGrid` | In-hub day grid; full scene booking on `/dancecard/s/:token` |

**Seed / QA:** `npm run db:ensure-preview-attendee-parity -w @c2k/api` — floor plan SVG, Tent City group, published policy, **RopeDreamer access grant**, **one open volunteer shift** on `preview-c2k-weekend`.

### Attendee manual smoke

_Signed off via `node scripts/smoke-attendee-dancecard.mjs` + Playwright dancecard smokes **2026-05-26** (local `preview-c2k-weekend`, RopeDreamer). Re-run after schema or seed changes._

- [x] Hub **Dancecard** tab shows feature card grid (gold-style selection on localhost)
- [x] Program → add session → appears under My availability _(API calendar smoke; UI add-to-dancecard manual spot-check)_
- [x] Add personal block; buffer saves _(calendar API)_
- [x] Share link opens mutual compare page _(shared route + compare grid component)_
- [x] Groups: Discover Tent City; join; post announcement; chore/bring signup _(Tent City in attendee-groups smoke)_
- [x] **Documents** tab → Policies & sign-off: expand policy, sign with legal name _(published policies API)_
- [x] My availability → **Open volunteer shifts**: claim one; appears on calendar _(open list API + e2e Claim shift)_
- [x] My availability → **Shift swap requests**: submit for assigned shift; cancel pending _(eligible + mine API)_
- [x] Compare: paste share link → in-hub day grid + mutual list; open full compare for scene request
- [x] Maps: Preview floor plan (not marketing screenshot) _(parity seed)_

---

## Verification checklist

### Automated (verified 2026-05-22)

- [x] `npm run typecheck` — web + api
- [x] API unit tests — ECKE publish payload, location/slot/staff sync, `icalBusyPreview.test.ts`
- [x] `node scripts/smoke-command-bridge.mjs` — RBAC grant lifecycle
- [x] `node scripts/audit-command-bridge.mjs` — v1 GET probes + RBAC matrix
- [x] `node scripts/smoke-organizer-tab-walk.mjs` — bootstrap + core tab GET paths (`preview-c2k-weekend`)

### Manual smoke (owner + grant personas) — **open**

`node scripts/smoke-organizer-tab-walk.mjs` covers API GETs for seven primary tabs only. UI + RBAC persona walk still manual on `preview-c2k-weekend`:

- [ ] **Dashboard** — Live ops loads (no “Not Found”); readiness shortcuts work; recent activity remains placeholder
- [ ] **Program** — grid, slot drawer, bulk actions, slot people tab, assignments deep link
- [ ] **Venues** — location CRUD, map upload
- [ ] **Import** — file upload; Google Sheets when OAuth configured
- [ ] **People** — all 9 sub-tabs (signups, roster, staff, applications, swaps, badges, coverage, incidents, compliance)
- [ ] **Messaging** — templates + campaigns
- [ ] **Settings** — every `settingsPanel=` (basics through advanced, command team)
- [ ] **Exports** — every download + print schedule/signs pages
- [ ] **Integrations** — module toggles, API keys, webhooks, ECKE publish panel
- [ ] **Door** — roster cache, check-in, QR lookup
- [x] **Door mobile** — Playwright iPhone 13 + manual spot-check **2026-06-06** (search, check-in, duplicate, permission denied)
- [ ] **Grant personas** — registration-only / scheduler-only / staff-only nav + API 403 boundaries

---

## Known overlap (full_kit architecture)

C2K-native tables (`convention_check_ins`, C2K ISO, `dancecard_entries`) run **in parallel** with kit-mode tables (`convention_registrants`, kit ISO, etc.). Long-term unification rules: [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md) — do not delete C2K-native paths without an explicit migration plan.

**Identity direction:** new participation writes must resolve to `users.id`. Legacy orphan rows may exist until Phase 3+ cleanup ([`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md)).

---

## Key paths

| Area | Path |
|------|------|
| Schema | `packages/api/src/db/convention-organizer-schema.ts` |
| Routes + bootstrap | `packages/api/src/routes/convention-organizer-routes.ts`, `routes/convention-organizer/` |
| Shell entry | `packages/web/src/components/organizer/convention/ConventionDancecardOrganizerClient.tsx` |
| Kit UI root | `packages/web/src/components/dancecard/organizer/` |
| API client | `packages/web/src/components/dancecard/organizer/organizerApi.ts` |
| Nav + tabs | `packages/web/src/components/dancecard/organizer/shell/organizerNavConfig.ts` |
| RBAC nav filter | `packages/web/src/lib/dancecard/commandBridgeNavPermissions.ts` |
| Registrants UI | `packages/web/src/components/dancecard/organizer/RegistrantsPanel.tsx` |
| Staff shifts UI | `packages/web/src/components/dancecard/organizer/StaffShiftsPanel.tsx` |
| ECKE publish | `ecke-publish-payload.ts`, `ecke-publish-client.ts`, `ecke-dancecard-location-sync.ts`, `ecke-dancecard-slot-sync.ts`, `ecke-dancecard-staff-sync.ts` |
