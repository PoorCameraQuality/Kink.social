# Organizer console (C2K)

**Last updated:** 2026-06-06 (mobile door walkthrough — PASS WITH FOLLOWUPS)

**Status:** Command bridge complete (2026-05-21); identity Phase 1–2 (2026-05-22); **groups/events G301–G312** + group event routes (2026-05-22); scope branding in settings (2026-05-24); **org/group moderation tab** + scopes/people API sync (2026-06-06). Priorities: [`MASTER_NEXT_STEPS.md`](./MASTER_NEXT_STEPS.md)  
**Vision:** [`PLATFORM_VISION.md`](./PLATFORM_VISION.md) · **Entity map:** [`ECKE_C2K_ENTITY_MAP.md`](./ECKE_C2K_ENTITY_MAP.md) · **Identity ADR:** [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md) · **Branding:** [`BRANDING_AND_SOCIAL_SHARING.md`](./BRANDING_AND_SOCIAL_SHARING.md)

---

## Purpose

The **organizer console** is the single **command bridge** for staff:

1. **Configure** in-house C2K community (forums structure, chat channels, members, content CMS)
2. **Build** convention programs (**Event Systems** — Dancecard-parity UI; gold standard: **`dancecard-integration-kit`**, see [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md); identity [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md))
3. **Publish** outward to ECKE listings + Dancecard attendee runtime (public copy only — **not** registration; attendees sign up on C2K)

**Members** interact on public org/group hubs (`/orgs/:slug`, `/groups/:id`) — forums, chat, gallery, calendar. **Staff** configure everything here; they participate as members on the public hub.

---

## Routes (web)

Source: `packages/web/src/router.tsx`.

| Route | Role gate |
|-------|-----------|
| `/organizer` | Authenticated; scope picker dashboard (`GET /api/v1/organizer/scopes`) |
| `/organizer/orgs/:slug?tab=` | Org **STAFF+** (console); **MODERATOR+** on hub scope cards. Sidebar tabs below. |
| `/organizer/orgs/:slug?tab=settings&settingsSection=` | Org **OWNER/ADMIN** (settings tab) |
| `/organizer/orgs/:slug/conventions/:convSlug?tab=` | Org convention command bridge — Dancecard kit shell. Tabs below. |
| `/organizer/orgs/:slug/conventions/:convSlug/door` | Door/check-in mode (`DoorModePanel`) |
| `/organizer/orgs/:slug/conventions/:convSlug/print/schedule` | Printable schedule |
| `/organizer/orgs/:slug/conventions/:convSlug/print/venue-signs` | Venue sign sheets |
| `/organizer/orgs/:slug/events/:eventId` | Standalone **event manager** (`EventOrganizerPanel`) |
| `/organizer/groups/:id?tab=` | Group **owner/admin/moderator/event_host**; parent org **OWNER** for settings. Sidebar tabs below. |
| `/organizer/groups/:id/events/:eventId` | Group-scoped event manager (`EventOrganizerPanel`) |
| `/organizer/conventions/:slug` | Redirect → `/organizer/orgs/:orgSlug/conventions/:slug` |
| `/organizer/dancecard` | Redirect → `/organizer` |
| `/organizer/dancecard/:slug` | Redirect → `/organizer/conventions/:slug` |

**UI shell:** `OrganizerAppShell` — sidebar nav, breadcrumbs, Cmd/Ctrl+K command palette, status bar.

**Public hubs:** No Admin/Manage/Settings tabs. Staff see one **Organizer console** header link.

### Org / group sidebar tabs

Query param: `?tab=` (default **home**). Labels from `packages/web/src/lib/organizer/types.ts`.

| Tab key | Label | Gate notes |
|---------|-------|------------|
| `home` | Home | All console roles |
| `schedule` | Events & conventions | All console roles |
| `people` | People | All console roles; role edits need settings access |
| `communications` | Communications | All console roles |
| `moderation` | Moderation | Org: **MODERATOR+** only (`canAccessOrganizerModeration`). Group: group mods + parent org staff with access |
| `settings` | Settings | Org: **OWNER/ADMIN**. Group: group mod or parent org **OWNER** |
| `tools` | Tools | All console roles |

### Tab capabilities (org)

| Tab | Contents |
|-----|----------|
| **home** | `OrganizerOrgHomePanel` — setup checklist, quick actions, upcoming programs |
| **schedule** | Conventions + standalone events table; **Manage program** → nested convention route |
| **people** | Member roster, filters, role guide; **Transfer ownership** claim link (OWNER); role changes when settings access |
| **communications** | `OrganizerOrgCommunicationsPanel` — forum categories + chat channels managers; links to public hub |
| **moderation** | `OrganizerOrgModerationPanel` — report inbox, bans, audit timeline |
| **settings** | Sections via `?settingsSection=`: **general** (includes **listing type**: community org vs permanent venue + map fields), **branding**, **features**, **content**, **publish** (`Settings*Tab` panels; publish uses ECKE preview/publish UI) |
| **tools** | `OrganizerOrgToolsPanel` — program exports, ECKE publishing checklist, quick links; **payments** card is placeholder only |

### Tab capabilities (group)

| Tab | Contents |
|-----|----------|
| **home** | Setup checklist |
| **schedule** | Group events table (`GET /api/v1/events?groupId=`); **+ Event** → `/events?create=event&prefillGroupId=` |
| **people** | `GroupMemberRolePanel` |
| **communications** | `GroupForumModerationPanel` + `GroupCommunicationsAdminPanel` |
| **moderation** | `OrganizerGroupModerationPanel` — group report inbox, bans, audit |
| **settings** | Branding (`ScopeBrandingPanel`), group metadata (`GroupSettingsPanel`), scope email broadcast, ECKE publish, payments placeholder |
| **tools** | Quick link to public group page (org-level exports/publish live under parent org **Tools**) |

### Convention manager tabs

Route: `/organizer/orgs/:slug/conventions/:convSlug?tab=`  
Shell: `ConventionDancecardOrganizerClient` + `OrganizerEventShell`. Nav: `packages/web/src/components/dancecard/organizer/shell/organizerNavConfig.ts`.

| Section | Tab key | Sidebar label |
|---------|---------|---------------|
| Home | `dashboard` | Overview |
| Schedule | `program` | Program |
| Schedule | `venues` | Room availability |
| Schedule | `import` | Import |
| People | `people` | People |
| Communications | `messaging` | Messaging |
| Settings | `settings` | Settings |
| Tools | `exports` | Exports |
| Tools | `integrations` | Integrations |

**People sub-tabs** (`?peopleTab=` when `tab=people`): `signups`, `roster`, `staff`, `applications`, `swaps`, `badges`, `coverage`, `incidents`, `compliance`.

**Legacy routable tabs** (redirect into `tab=people` + `peopleTab`): `registrants`, `staff`, `swaps`, `vetting`, `badges`, `dm`. Deep-link only: `assignments` (`AssignmentBoardPanel`).

**Settings panels** (`?settingsPanel=` when `tab=settings`): `basics`, `logistics`, `program`, `documents`, `advanced`.

Command-bridge permissions from `GET /api/v1/conventions/:key/organizer/bootstrap` filter which tabs are writable. See [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md).

---

## API

### Organizer hub (`packages/api/src/routes/organizer-routes.ts`)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/organizer/scopes` | Orgs/groups the viewer can manage from the hub |
| `GET` | `/api/v1/organizer/people/organizations/:slug` | Org people roster |
| `GET` | `/api/v1/organizer/people/conventions/:slug` | Convention-scoped people roster |
| `GET` | `/api/v1/organizer/people/groups/:groupId` | Group people roster |

**`GET /api/v1/organizer/scopes` response:**

```json
{
  "orgs": [{ "id", "slug", "displayName", "role" }],
  "groups": [{ "id", "slug", "name", "role", "organizationId", "parentOrganizationSlug" }]
}
```

- **orgs:** membership role rank ≥ `MODERATOR`
- **groups:** role ∈ `owner`, `admin`, `moderator`, `event_host`; excludes disbanded groups

Direct URL access to `/organizer/orgs/:slug` also allows org **STAFF** (not returned on the hub scope cards).

### ECKE publish (`packages/api/src/routes/ecke-publish-routes.ts`)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/organizer/ecke-publish/organizations/:slug` | Org listing publish status |
| `POST` | `/api/v1/organizer/ecke-publish/organizations/:slug/preview` | Preview org listing payload |
| `POST` | `/api/v1/organizer/ecke-publish/organizations/:slug/publish` | Publish org listing to ECKE |
| `GET` | `/api/v1/organizer/ecke-publish/conventions/:slug` | Convention listing + Dancecard status |
| `POST` | `/api/v1/organizer/ecke-publish/conventions/:slug/preview` | Preview convention payloads |
| `POST` | `/api/v1/organizer/ecke-publish/conventions/:slug/publish` | Publish listing + Dancecard program to ECKE |
| `GET` | `/api/v1/organizer/ecke-publish/groups/:groupId` | Group listing publish status |
| `POST` | `/api/v1/organizer/ecke-publish/groups/:groupId/preview` | Preview group listing |
| `POST` | `/api/v1/organizer/ecke-publish/groups/:groupId/publish` | Publish group listing to ECKE |

Publishes enqueue BullMQ when Redis is available; UI surfaces status via `EckePublishStub` on org settings **Publish**, group settings, convention **Integrations**, and org **Tools**.

### Group admin (outside organizer prefix)

| Method | Path | Purpose |
|--------|------|---------|
| `PATCH` | `/api/v1/groups/:groupId` | Group name/visibility |
| `PATCH` | `/api/v1/groups/:groupId/members/:userId` | Group member role |
| `PATCH/DELETE` | `/api/v1/groups/:groupKey/forum/categories/:id` | Group forum categories |

### Convention organizer API (`/api/v1/conventions/:key/…`)

~165 routes across `convention-organizer-routes.ts` and `convention-organizer/*` extension modules. Highlights:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/organizer/bootstrap` | Permissions, event DTO, slots, shifts, timezone window |
| `GET` | `/organizer/command-access` | Lightweight permission probe (shell gate) |
| `GET` | `/organizer/user-picker` | Org members for registrant signup and staff-shift picker |
| `GET` | `/organizer/print-data` | Print views (schedule, venue signs) |
| `GET/PATCH` | `/event` | Event Systems title/window/branding settings |
| `GET/POST/PATCH/DELETE` | `/locations`, `/program-slots`, `/maps`, `/tracks`, `/tags`, … | Program + venue stack |
| `GET/POST/PATCH/DELETE` | `/registrants`, `/registrants/:id` | Registrants — **`POST` requires `userId`** |
| `POST` | `/registrants/import` | Bulk import by email → C2K user (`{ rows: [...] }`) |
| `GET/POST/PATCH/DELETE` | `/staff-shifts` | Volunteer shifts — **`personId` required** (C2K user UUID) |
| `GET/PUT/DELETE` | `/command-team`, `/command-team/:userId` | Command-bridge grants |
| `GET/POST/PATCH/DELETE` | `/people`, `/people/:personId` | Convention people directory |
| `GET/POST/PATCH/DELETE` | `/registration-categories`, `/registration-form`, `/trusted-roles`, … | Registration stack |
| `GET/POST/PATCH/DELETE` | `/imports`, `/imports/:batchId/publish`, … | Schedule import batches |
| `GET/POST` | `/message-templates`, `/message-campaigns` | Messaging |
| `GET` | `/exports/sessions`, `/exports/conflict-report`, `/exports/event-pack` | Exports |
| `GET/POST` | `/api-keys`, `/webhooks`, `/embed-tokens`, … | Integrations |
| `GET/POST` | `/door/roster`, `/registrants/check-in`, `/registrants/lookup` | Door mode |
| `GET` | `/ops/live` | Live ops console payload |

Extension modules: `people-routes`, `registration-routes`, `door-routes`, `program-ext-routes`, `policy-routes`, `modules-routes`, `ops-routes`, `participation-routes`.

Identity rules: [`EVENT_SYSTEMS_IDENTITY.md`](./EVENT_SYSTEMS_IDENTITY.md). Route inventory: [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md).

---

## Legacy redirects

| Old URL | Redirect |
|---------|----------|
| `/orgs/:slug?tab=Admin` | `/organizer/orgs/:slug?tab=settings` |
| `/orgs/:slug?communityEdit=1` | `/organizer/orgs/:slug?tab=settings&settingsSection=content` |
| `/groups/:id?tab=Settings` | `/organizer/groups/:id?tab=settings` |
| `/conventions/:slug?tab=Manage` | `/organizer/orgs/:orgSlug/conventions/:slug` |
| `/organizer/dancecard` | `/organizer` |
| `/organizer/dancecard/:slug` | `/organizer/conventions/:slug` |

---

## Manual smoke

1. `npm run db:prepare`
2. Sign in as mod+ on `demo-east-collective`
3. `/organizer` — dashboard cards for orgs/groups from scopes API
4. `/organizer/orgs/demo-east-collective` — sidebar tabs; **Communications** has forum/chat setup; **Moderation** has report inbox
5. Schedule → **Manage program** → `/organizer/orgs/demo-east-collective/conventions/seed-demo-con-program`
6. `/orgs/demo-east-collective` — no Admin tab; forums/chat work for members; header **Organizer console** for staff
7. Create org → lands on `/organizer/orgs/:slug?tab=home`

---

## Mobile door walkthrough (2026-06-06)

**Verdict:** **PASS WITH FOLLOWUPS** — see [`PILOT_READINESS.md`](./PILOT_READINESS.md) § Mobile door walkthrough.

| Check | Mobile (390×844) | Desktop |
|-------|------------------|---------|
| Door route loads | ☑ `…/door` — safe-area, touch targets, event title | same |
| Search + check-in | ☑ Playwright + API lookup | same |
| Exit to Signups | ☑ Exit link → `?tab=people&peopleTab=signups` | same |
| Unauthorized user | ☑ `PermissionDeniedPanel` (sign-in vs no registration grant) | same |
| Signups from People hub | ☑ filters, stats, **Open door mode** CTA | full sidebar nav |

**Hardening this session:** waitlisted/cancelled blocked on all check-in writes; door zero-results copy; payment/tags honesty in `RegistrantsPanel`.

---

*Convention program UI targets ECKE Dancecard organizer parity per [`DANCECARD_ORGANIZER_PARITY.md`](./DANCECARD_ORGANIZER_PARITY.md) (source: `dancecard-integration-kit`, not the slim `vendor/dancecard-eastcoast-export/`).*
