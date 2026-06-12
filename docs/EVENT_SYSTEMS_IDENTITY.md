# Event Systems — identity & participation (ADR)

**Status:** Accepted (2026-05-22) · **Last synced:** 2026-06-06 (People hub, staff shifts `personId` = `users.id`, no guest checkout)
**Scope:** C2K platform identity, event registration, roster/staff, organizer tooling.  
**Renaming:** “Dancecard organizer” → **Event Systems** (product name in progress).

This ADR locks decisions **before** further wiring. It supersedes the “full_kit parallel identity” approach as a long-term model — kit tables may remain temporarily, but **one C2K user** is the only durable identity.

---

## Decisions (signed off)

| Topic | Decision |
|-------|----------|
| **Canonical identity** | One `users` + `profiles` record per person on C2K. Vendor, photographer, organizer, attendee, etc. are **capabilities under that profile** (sub-profiles / roles), not separate account types. |
| **Registration** | **Logged-in C2K only.** No guest checkout, no email-only accounts, no “claim later.” |
| **External registration** | If an organizer uses off-platform ticketing, that is their choice; C2K does not model guest identities for it. |
| **Attending an event** | Not a separate profile. Registration is a **state change** on the same C2K profile: not attending → attending, with event-specific metadata (category, comp, check-in, policies). |
| **Roster / staff** | Not a separate profile. A **list of people** granted staff/volunteer/presenter status via comp code or organizer toggle, still tied to `user_id` when on C2K. |
| **ECKE legacy users** | **No migration.** Old `dancecard_accounts` on ECKE are irrelevant going forward. |
| **ECKE role** | **Marketing / SEO surface** while C2K is built: Google-indexable listings for events, conventions, articles. Users who want to register are sent to **C2K** (create account → event listing on C2K). |
| **ECKE identity** | C2K is identity authority. ECKE is not a login system for new work. |
| **ECKE publish** | **Low priority for identity planning.** Organizers get **toggles** for what appears on the public advertising page. Future option: **in-C2K advertisement designer + preview** before any push to ECKE (may bypass today’s “publish” flow). |
| **Event scale** | **Same identity rules** for conventions, org events, and munches. **Conventions** use the full Event Systems feature set first; **munches** get a **smaller, simpler** UI (RSVP + basic roles) — hide complexity, don’t fork identity. |
| **Duplicate stores** | Deprecate parallel “who is this person?” models over time. Do not grow new orphan name/email rows without `user_id`. |

---

## Mental model

```
C2K User (users.id + profiles)
├── Platform capabilities: vendor, photographer, org member, presenter, …
└── Per-event participation (convention / event / munch)
    ├── attending: yes | no  (+ category, policies, check-in)  → convention_registrants
    ├── directory row (presenter/staff/registered buckets)     → convention_persons (+ sync job)
    ├── roles: attendee, staff, volunteer, presenter, …        (flags / grants / category roleKind)
    └── event-only display overrides (badge name, pronouns) when needed for print
```

**Not a second person:** `convention_registrants`, roster directory rows, and staff-shift assignees are **records about participation**, not alternate identities. Display defaults come from `profiles`; overrides are fields on the participation record.

**Organizer People hub (current):** **Signups** edit `convention_registrants`; **Roster** reads `convention_persons` (rebuilt by people sync from registrants, shifts, program slots, access grants). The same linked C2K account can appear in both — cross-linked in UI, not merged into one table yet.

---

## Schema direction (link identity, don’t merge tables)

Keep separate tables for **different concerns**, but **require `user_id` on all new participation writes**:

| Table / concept | Role going forward |
|-----------------|-------------------|
| `users` / `profiles` | **Source of truth** for who someone is |
| `convention_registrants` | Registration **state + metadata**. Columns include `user_id`, `category_id`, display overrides (`badge_name`, `pronouns`), check-in fields, vetting/import metadata. **`user_id` nullable in Postgres** (legacy rows); **API writes require it**. Unique index `convention_registrants_conv_user_idx` on `(convention_id, user_id)` — Postgres allows multiple rows with `user_id` NULL. |
| `convention_access_grants` | Ticket/staff gate on C2K — `attending_confirmed`, `role` (`ATTENDEE` \| `STAFF` \| `MODERATOR`); synced on registrant upsert |
| `convention_command_grants` | **Event Systems command bridge** — registration / staff_ops / scheduler tooling (separate from attendance) |
| `convention_persons` | **Event directory** (roster UI). Linked via `user_id` when known; import/staging rows may lack `user_id`. Rebuilt by `syncConventionPeopleDirectory` — not the registration write path. |
| `convention_participation_offers` | Comp/role **offer letters** tied to `applicant_user_id` (presenter request, vetting application, vendor application). Accept updates offer status; may return a register URL — does not auto-upsert registrants. |
| `conventions.settings.participation` | Apply windows, offer templates, trusted-role links (`@c2k/shared` `ConventionParticipationSettings`) |
| `schedule_slot_presenters` / slot people | Program assignments → prefer `user_id` / linked directory person |
| `convention_volunteer_shifts` | Shifts store **`person_id` → `users.id`** (column name is legacy kit parity; not `convention_persons.id`) |
| `dancecard_entries` | In-app personal schedule — already user-scoped |
| Kit ISO / parallel tables | Same rule: **`user_id` on new rows**; unify UX later |

**Invariant (new work):** If the actor is on C2K, resolve to `users.id` first. **One registrant row per `(convention_id, user_id)`** when logged in.

---

## ECKE (advertising only)

- ECKE lists events for discovery (search, articles, public teaser content).
- **Register / attend / staff / organize** → always on C2K.
- Organizer controls **visibility toggles** (what the ECKE listing shows).
- Optional future: **C2K-hosted ad page builder** → preview → push to ECKE (implementation TBD; not blocking Event Systems core).

Existing publish bridge (program/locations → ECKE DB) remains for transitional SEO/listings; it is **not** the identity or registration path.

---

## Phased implementation (after ADR)

1. **API guards** — authenticated registrant create/update sets `user_id`; reject orphan creates except explicit import staging. **Done (2026-05-22):** `POST /registrants` requires `userId`; `POST /registrants/import` resolves email → C2K user; staff shifts require `personId` (**`users.id`**, despite the field name); upserts sync `convention_access_grants` via `convention-participation.ts`; registrant writes enqueue people directory sync. UI: org-member user picker (`GET /organizer/user-picker`); link-account removed. Route table: [`DANCECARD_ORGANIZER_PARITY.md#identity--people-api-routes`](./DANCECARD_ORGANIZER_PARITY.md#identity--people-api-routes).
2. **Unique constraint** — `(convention_id, user_id)` on registrants where `user_id` is set. **Done (2026-05-22):** `convention_registrants_conv_user_idx` (partial uniqueness — multiple legacy NULL `user_id` rows still possible).
3. **Organizer UI** — People hub Signups + Staff shifts use C2K user picker. **Done (2026-05-22):** `RegistrantsPanel`, `StaffShiftsPanel` embedded in `PeopleHubPanel` (`?tab=people&peopleTab=signups|staff|…`).
4. **Command bridge RBAC** — convention-scoped team grants (`convention_command_grants`: registration, staff_ops, scheduler). Org **OWNER/ADMIN** = implicit full access; all others (including org MODERATOR) need explicit grants. Enforced on Event Systems API routes + nav filtering. **Done (2026-05-22).** Team CRUD: `GET|PUT|DELETE /api/v1/conventions/:key/command-team`; bootstrap returns `permissions`.
5. **Read API — viewer participation** — signed-in viewer’s profile + attendance gate in one payload. **Done (2026-05-24):** `GET /api/v1/conventions/:key/me/participation` — `loadMyConventionParticipation()` returns `{ profile, registrant, access }` (not roster role assignments or open offers). Used by `PeopleHubParticipationStrip` and public `ConventionParticipationStrip`.
6. **Organizer People hub — cross-links** — unify mental model in copy and navigation; **not** a single-table merge. **Partial (2026-05-24):** `participation: { registrantId, registered }` on `GET …/people`; `directoryPersonId` on `GET …/registrants`; Signups ↔ Roster deep links (`peopleTab=roster&person=…`); `PeopleHelpCard` / grouped sub-tabs (`peopleHubConfig.ts`). **Still open:** directory keyed only by `user_id`; retire orphan `convention_persons` without `user_id`; optional richer “my ops context” strip. UI reference: [`architecture/CONVENTION_PEOPLE_TAB.md`](./architecture/CONVENTION_PEOPLE_TAB.md).
7. **Munch template** — same backend, feature flags / simplified nav (RSVP, basic roles). **Done (2026-05-24):** `settings.eventSystems.peopleHubTemplate` = `munch` | `full`; bootstrap + `filterPeopleSubTabsForTemplate` (munch → Signups + Roster only, after permission filter).
8. **Retire** — new ECKE dancecard logins, guest registrant paths, long-lived `convention_persons` without `user_id`. **Partial:** new registrant writes require `userId`; orphan persons remain for import/staging and pre-link directory rows; slot people and program imports may still create directory rows before link.
9. **Participation offers & apply windows** — user-scoped comp/application pipeline (extends registration, not a second identity). **Done (2026-06):** `convention_participation_offers` + `participation-routes.ts` — public `GET …/participation-opportunities`, `POST …/vendor-applications`; organizer `GET|POST|PATCH …/participation-offers`, send/accept/decline; `GET|PATCH …/participation-settings`; applicant `GET …/me/participation-offers`. Accept may return `registerUrl` with category + access code; organizer Applications tab (`VettingQueuePanel`) + settings panel wire the flow.

**Registration write sync:** New registrant creates/imports upsert `convention_registrants` and set `convention_access_grants.attendingConfirmed = true` for the same `user_id`. Kit JSON field `personId` on registrant payloads maps to `user_id`. People directory sync runs after registrant writes (BullMQ when configured).

### Participation & people API routes (implemented)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/conventions/:key/me/participation` | Viewer profile + registrant row + access grant |
| `GET` | `/api/v1/conventions/:key/people` | Directory list; each linked row includes `participation` |
| `GET` | `/api/v1/conventions/:key/registrants` | Signups list; includes `directoryPersonId` when synced |
| `POST` | `/api/v1/conventions/:key/registrants` | Upsert by `userId` (required) |
| `GET` | `/api/v1/public/conventions/:key/participation-opportunities` | Public apply windows + applicant status |
| `GET\|PATCH` | `/api/v1/conventions/:key/participation-settings` | Admin — `conventions.settings.participation` |
| `GET\|POST\|PATCH` | `/api/v1/conventions/:key/participation-offers` | Organizer offer CRUD |
| `POST` | `/api/v1/conventions/:key/participation-offers/:id/send\|accept\|decline` | Send letter / applicant response |
| `GET` | `/api/v1/conventions/:key/me/participation-offers` | Applicant’s offers |

Full registrant/staff/people inventory: [`DANCECARD_ORGANIZER_PARITY.md#identity--people-api-routes`](./DANCECARD_ORGANIZER_PARITY.md#identity--people-api-routes).

### Key paths (Phase 1–9)

| Area | Path |
|------|------|
| Participation lib | `packages/api/src/lib/convention-participation.ts` (+ unit tests) |
| Participation offers | `packages/api/src/lib/convention-participation-offers.ts`, `participation-routes.ts` |
| People directory API | `packages/api/src/routes/convention-organizer/people-routes.ts` |
| People links / sync | `packages/api/src/lib/convention-people-links.ts`, `convention-people-sync-queue.ts` |
| Command access lib | `packages/api/src/lib/convention-command-access.ts` |
| Shared permission / participation types | `packages/shared/src/convention-command-permissions.ts`, participation settings in `@c2k/shared` |
| Organizer API (registrants, bootstrap) | `packages/api/src/routes/convention-organizer-routes.ts` |
| Schema + index | `packages/api/src/db/convention-organizer-schema.ts` (`convention_registrants`, `convention_participation_offers`, `convention_registrants_conv_user_idx`) |
| People hub shell | `packages/web/src/components/dancecard/organizer/PeopleHubPanel.tsx` |
| People hub config / tabs | `packages/web/src/components/dancecard/organizer/people/peopleHubConfig.ts`, `PeopleGroupedTabs.tsx`, `PeopleHelpCard.tsx` |
| Munch filter | `packages/web/src/lib/dancecard/commandBridgeNavPermissions.ts` — `filterPeopleSubTabsForTemplate` |
| Signups UI | `packages/web/src/components/dancecard/organizer/RegistrantsPanel.tsx` |
| Roster UI | `packages/web/src/components/dancecard/organizer/PeopleDirectoryPanel.tsx` |
| Staff shifts UI | `packages/web/src/components/dancecard/organizer/StaffShiftsPanel.tsx` |
| Viewer strip (organizer) | `packages/web/src/components/dancecard/organizer/PeopleHubParticipationStrip.tsx` |

---

## Out of scope (explicit)

- Guest checkout or email-only registration
- Migrating legacy ECKE `dancecard_accounts`
- Merging registrant/person/profile into one DB table
- Full ECKE publish redesign (toggles / ad builder are product follow-ups)
- Auto-creating registrants on participation-offer accept (today: register URL + manual/self-serve signup)

---

## Related docs

- [DANCECARD_ORGANIZER_PARITY.md](./DANCECARD_ORGANIZER_PARITY.md) — kit UI/API parity (parallel tables during transition)
- [architecture/CONVENTION_PEOPLE_TAB.md](./architecture/CONVENTION_PEOPLE_TAB.md) — People hub routes, sub-tabs, permissions, gaps
- [ECKE_C2K_ENTITY_MAP.md](./ECKE_C2K_ENTITY_MAP.md) — outbound publish field mapping (non-identity)
- [FEATURE_REGISTRY.md](./FEATURE_REGISTRY.md) — routes and feature ownership
