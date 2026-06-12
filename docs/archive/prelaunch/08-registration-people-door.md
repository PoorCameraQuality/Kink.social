# Prelaunch audit 08 — Registration, people ops, door mode

**Audit date:** 2026-06-04  
**Wave 4 remediation (2026-06-04):** Door bulk check-in UI removed; door page passes `exitHref` to People → Signups. Staff import board no longer offered on Import tab.

**Wave 5 remediation (2026-06-04):** Door POST matches signups PATCH early-window policy (`EARLY_CHECK_IN` 409); roster/lookup return real `checkInEligibility`; sets `registrationStatus` on check-in.  
**Wave 6 remediation (2026-06-04):** Signups PATCH refactored to `resolveCheckInUpdate` — single policy engine with door POST.
**Auditor:** Subagent 8 (read-only)  
**Scope:** Convention Command Bridge People hub, registration settings, door mode, people sync job, attendee identity rules  
**Method:** Code + doc review (`docs/architecture/CONVENTION_PEOPLE_TAB.md`, routes, panels, e2e). No fixes applied.

**Primary route:** `/organizer/orgs/:orgSlug/conventions/:convSlug?tab=people&peopleTab=<subTab>`  
**Door route:** `/organizer/orgs/:orgSlug/conventions/:convSlug/door`  
**Reference architecture:** [`docs/architecture/CONVENTION_PEOPLE_TAB.md`](../../architecture/CONVENTION_PEOPLE_TAB.md)

---

## 1. Executive summary

People ops for conventions are **largely implemented end-to-end** on the Fastify + Vite stack: registration categories and form builder (Settings), signups master/detail with import/export and URL deep links, roster with `?person=` drawer sync, staff shifts, trusted-role applications and participation offers, shift swaps, badges, coverage, incidents, compliance, and a **mobile-first door mode** with offline queue + Playwright smoke.

**Production readiness:** **Staging with limitations** — suitable for pilot with trained organizers if door check-in policy enforcement and dual check-in models are understood. Not “hands-off production” until P0 door/signups parity and permission UX are fixed.

**Identity model is documented and mostly enforced in API:** one `users` row per person; signups = `convention_registrants`; roster = `convention_persons`; staff shift `personId` = `users.id`. Gaps remain in **door/signups check-in consistency**, **simplified door mappers hiding eligibility**, **legacy `convention_check_ins`**, and **registration-only users blocked from category CRUD** without clear UI.

| Area | Status | Notes |
|------|--------|--------|
| Registration categories | Implemented | API CRUD requires `admin`; list requires `registration` |
| Form builder + attendee preview | Implemented | Settings admin; preview in `RegistrationAttendeePreview` |
| Signups (add/import/export/check-in) | Implemented | `userId` required; `?registrant=` deep link works |
| Roster + person drawer | Implemented | `GET /people` triggers sync; `?person=` wired in `PeopleDirectoryPanel` |
| Staff shifts | Implemented | `convention_volunteer_shifts.personId` = user UUID |
| Applications vs presenter requests | Split correctly | Applications = People; presenter requests = Program (different auth) |
| Participation offers | Implemented | BullMQ notifications on send/respond |
| Door mode | Implemented with gaps | No category window enforcement on `POST …/check-in` |
| People sync job | Implemented | BullMQ `c2k-convention-people-sync` + inline fallback |

---

## 2. Blockers

None that prevent **local/staging pilot** if DB + worker + Redis (or inline sync) are up. For **unattended door operations at scale**, treat the following as release blockers:

| ID | Blocker | Why |
|----|---------|-----|
| B1 | Door `POST /registrants/check-in` does not enforce category check-in windows | Sets `checkedInAt` only; ignores `computeCheckInEligibility` / `assertCheckInAllowed`. Signups PATCH path returns `409 EARLY_CHECK_IN` — **two behaviors for the same action**. |
| B2 | Door/signup responses use `mapRegistrant` (shared) for roster/lookup/check-in | Always `checkInEligibility: 'ok'`; door UI early/late tone classes never reflect server rules on those endpoints. |

---

## 3. High-risk issues

| ID | Issue | Evidence |
|----|-------|----------|
| H1 | **Dual check-in models** | Registrant flow: `convention_registrants.checkedInAt` + timing (door + signups). Legacy: `POST /api/v1/conventions/:key/check-ins` writes `convention_check_ins` by `userId` — not used by door UI; can diverge from registrant state. |
| H2 | Door check-in does not set `registrationStatus = 'checked_in'` | Only `checkedInAt`/`checkedInTiming`. Display status often derives from `checkedInAt` (`displayRegistrationStatus`) but DB column and filters using `registrationStatus` alone can be inconsistent. |
| H3 | Door check-in `checkedInTiming` defaults to `on_time` without computing early/late | Override flag only sets `early_override`; no `late` timing from category window. |
| H4 | **`GET /people` enqueues full directory sync every load** | `people-routes.ts` → `requestConventionPeopleDirectorySync` on every list; expensive at scale; stale UX if worker lags. |
| H5 | People sync **only upserts linked `userId` rows** | Manual roster rows without `userId` are not rebuilt from sync sources; can drift from registrants/program until manual PATCH. |
| H6 | Registration category **mutations require `admin`** while signups UI is gated on `registration` | Registration-only command grant can list categories in signups but **403 on POST/PATCH/DELETE** — easy misconfiguration at pilot. |

---

## 4. Medium-risk issues

| ID | Issue | Evidence |
|----|-------|----------|
| M1 | `readOnlyForTab('people')` always false | Shell never shows read-only on People; sub-panels accept `readOnly` but parent passes effective write access via tab visibility only. |
| M2 | Policy documents + session tags | Policies: admin API; tags: scheduler — signups panel `.catch` → empty (silent failure for registration-only). |
| M3 | Staff shifts panel **demo expected hours** map | `DEMO_EXPECTED_HOURS` in `StaffShiftsPanel.tsx` — misleading if shown as live data (UI cleanup registry M14). |
| M4 | Presenter requests use raw `fetch` not `organizerDancecardFetch` | `PresenterRequestsPanel.tsx` — inconsistent error handling/cache vs rest of bridge. |
| M5 | QR endpoint returns placeholder SVG | `GET …/registrants/:id/qr` embeds token text, not scannable QR semantics. |
| M6 | Offline door queue has no idempotency guard | Re-sync could double-apply if server already checked in (depends on server accepting repeat POST). |
| M7 | `usePeopleSubTab` does not clear `vettingRoleId` / `applicationId` when switching sub-tabs | Stale filters on applications queue. |
| M8 | Compliance uses volunteer shifts + signups hours; staff panel labels may confuse **shift personId (user)** vs **roster person id** | Documented in architecture; still operator error vector. |
| M9 | Architecture doc **stale** on deep links | `CONVENTION_PEOPLE_TAB.md` §12 claims `?person=` and `?registrant=` not wired; code now implements both in `PeopleDirectoryPanel` / `RegistrantsPanel`. |

---

## 5. Low-risk issues

| ID | Issue |
|----|-------|
| L1 | Import JSON hidden in `<details>` (CSV primary) — discoverability |
| L2 | Badge batch filters: `confirmed` = not checked in; naming may confuse organizers |
| L3 | Munch `peopleHubTemplate` hides ops tabs without strong upgrade CTA in People hub |
| L4 | No People-specific WebSocket; freshness is poll + sync job |
| L5 | Registrant CRUD / vetting / incidents do not emit organizer notifications |
| L6 | Door service worker registration is best-effort (`catch` swallow) |
| L7 | `mapRegistrant` hardcodes `vettingStatus: 'approved'` on door paths |

---

## 6. Dead/misleading UI found

| Location | Finding |
|----------|---------|
| `StaffShiftsPanel.tsx` | `DEMO_EXPECTED_HOURS` — demo labels unless wired to category `expectedHours` |
| `VettingQueuePanel.tsx` | Copy correctly states **not** presenter requests; Program tab may still feel duplicate to new organizers |
| `VolunteerCompliancePanel.tsx` | Read-only data but no `readOnly` prop — looks like an editable panel family member |
| `RegistrationAttendeePreview.tsx` | Disabled form — correct preview; “Publish the form” depends on Settings admin path (easy to miss) |
| `CONVENTION_PEOPLE_TAB.md` §12 | Lists broken deep links — **misleading for agents**; code has been fixed |
| Door roster tones | UI supports early/late/eligibility colors; door API mapper nullifies eligibility on lookup/roster |

---

## 7. Permission issues found

Command Bridge domains: `registration`, `staff_ops`, `scheduler`, `admin` (`@c2k/shared`).

| Feature | UI gate | API gate | Gap |
|---------|---------|----------|-----|
| Signups list/detail | `registration` | `registration` | Aligned |
| Add signup / import | `registration` | `registration` + `userId` | Aligned |
| Category CRUD | Signups visible with `registration` | **`admin`** | Registration-only cannot edit categories |
| Registration form | Settings | **`admin`** | Aligned but hidden from registration-only |
| Policy docs | Signups detail | **`admin`** | Silent empty for registration-only |
| Session tags on registrant | Signups | **`scheduler`** | Silent empty |
| Roster / people CRUD | `staff_ops` | `staff_ops` | Aligned |
| Staff shifts / swaps / badges / coverage / incidents | `staff_ops` | `staff_ops` | Aligned |
| Applications / vetting | `registration` | `registration` | Aligned |
| Participation settings | Settings | **`admin`** | Offers work; settings may 403 |
| Participation offers create | Applications UI | `registration` / `scheduler` / `staff_ops` by `sourceType` | Aligned |
| Presenter requests | Program tab | Org **canManage** (moderator+) | **Not** command grants — intentional split |
| Door mode | `registration` | `registration` | Aligned |
| Door page bootstrap | Checks `registration` in permissions | Same | Aligned |

`scripts/audit-command-bridge.mjs` probes GET paths including `/people`, `/registrants`, `/door/roster`, `/volunteer-compliance`, `/badges/print-data` — PILOT_READINESS cites green RBAC run (2026-05-26); re-run before prod cutover.

---

## 8. Missing env/config

| Variable | People/door impact |
|----------|-------------------|
| `USE_DATABASE=true` | Required — all routes `requireDb` |
| `REDIS_URL` | People sync queue; falls back to inline sync on enqueue failure |
| `C2K_PEOPLE_SYNC_INLINE=true` | Forces synchronous directory rebuild (dev/single-node) |
| Worker process | Must run `packages/api/src/worker.ts` for queued people sync + offer notifications |
| MinIO / S3 | Badge logo upload |
| `VITE_HOME_DEMO_FALLBACK=false` | Prod builds — avoid mock bleed (PILOT_READINESS) |
| Mail / VAPID | Not blocking People ops; offers use BullMQ notifications when worker up |

No Stripe/payments in registration (by design per strategic guidance).

---

## 9. Recommended fixes

Prioritized **recommendations only** (not implemented in this audit).

1. **Unify check-in enforcement** — Call `assertCheckInAllowed` (or shared helper) from `door-routes.ts` `POST …/check-in`; align `registrationStatus` and `checkedInTiming` with signups PATCH.
2. **Use `mapRegistrantFull` on door roster/lookup/check-in responses** — So eligibility and vetting display match signups.
3. **Deprecate or bridge `convention_check_ins`** — Single source of truth: `convention_registrants.checkedInAt`, or sync both in one handler.
4. **Surface permission errors in signups** — When registration-only hits category/policy 403, show CTA “Requires event admin” instead of empty panels.
5. **People sync debounce** — Do not enqueue on every `GET /people`; sync on writes + manual “Refresh roster” or short TTL.
6. **Door offline idempotency** — Server rejects duplicate check-in with 200 + current row; client drops queue item.
7. **Update `CONVENTION_PEOPLE_TAB.md` §12** — Mark `?person=` / `?registrant=` as implemented; add door check-in parity gap.
8. **Label staff shift picker** — “C2K member (user account)” vs roster person id in UI tooltips.

---

## 10. Files likely affected

| Layer | Paths |
|-------|--------|
| Door API | `packages/api/src/routes/convention-organizer/door-routes.ts` |
| Registrant PATCH | `packages/api/src/routes/convention-organizer-routes.ts` |
| Mappers | `packages/api/src/routes/convention-organizer/shared.ts`, `packages/api/src/lib/convention-organizer/registration.ts` |
| Legacy check-ins | `packages/api/src/routes/conventions-routes.ts` |
| People sync | `packages/api/src/lib/convention-people-sync.ts`, `convention-people-sync-queue.ts`, `people-routes.ts` |
| Door UI | `packages/web/src/components/dancecard/organizer/door/DoorModePanel.tsx` |
| Signups / roster | `RegistrantsPanel.tsx`, `PeopleDirectoryPanel.tsx`, `PersonDetailDrawer.tsx` |
| Settings / form | `RegistrationSettingsSection.tsx`, `registration-routes.ts` |
| Applications | `VettingQueuePanel.tsx`, `participation-routes.ts` |
| Program (presenter) | `PresenterRequestsPanel.tsx`, `conventions-routes.ts` |
| Docs | `docs/architecture/CONVENTION_PEOPLE_TAB.md` |
| Tests | `e2e/door.spec.ts`, `packages/api/scripts/smoke-organizer-parity.ts`, `scripts/audit-command-bridge.mjs` |

---

## 11. Suggested tests

- Extend `e2e/door.spec.ts`: category with `checkInValidFrom` in future → expect 409 without override, success with override.
- API test: door check-in vs signups PATCH parity on same registrant.
- Smoke: `POST /registrants/check-in` after seed category window mutation.
- Manual: registration-only grant → signups → category edit → expect visible error.
- Manual: signups → roster link with `?person=` → drawer opens.
- Manual: add signup → wait for sync → roster shows registered bucket.
- `node scripts/audit-command-bridge.mjs` with `SMOKE_CONV=preview-c2k-weekend`.
- Worker off vs on: `GET /people` then verify roster updates after job.

---

## 12. Confidence level

**Medium-high** for feature inventory and identity rules (code paths traced). **Medium** for production incident rates (no live pilot telemetry in repo). **High** for door/signups check-in divergence (direct code comparison). Re-validate after any refactor of `mapRegistrant` vs `mapRegistrantFull`.

---

## People ops test matrix

| # | Flow | Steps | Pass criteria | Auto? |
|---|------|--------|---------------|-------|
| P1 | Registration categories | Settings → categories CRUD (admin) | Round-trip name, `expectedHours`, check-in window | `smoke-organizer-parity` partial |
| P2 | Form builder publish | Settings → form PUT/PATCH → preview | Questions visible in attendee preview | Manual |
| P3 | Public register | `/conventions/:slug/register` | Registrant row with `user_id` set | Pilot path doc |
| P4 | Add signup | People → signups → user picker → POST | One row per user; duplicate blocked by unique index | Manual |
| P5 | Import CSV | Import rows with known emails | Rows linked to users; skipped emails reported | Manual |
| P6 | Export CSV | Export button | CSV matches list filters | Manual |
| P7 | Signups check-in | Detail → check-in / status | `409` early without override; `checked_in` display | Manual |
| P8 | Door search check-in | `/door` → search → check in | `checkedInAt` set; message shown | `e2e/door.spec.ts` |
| P9 | Door QR / token | Lookup with `checkInToken` | Match registrant | Manual |
| P10 | Door offline queue | Offline → check-in → online | Queue drains; server state updated | Manual |
| P11 | Roster sync | Add signup → open roster | Person appears with `registered` bucket | Manual |
| P12 | Roster deep link | `?peopleTab=roster&person=<uuid>` | Drawer opens | Manual |
| P13 | Signups deep link | `?peopleTab=signups&registrant=<uuid>` | Detail opens | Manual |
| P14 | Staff shift assign | Staff → picker → POST | Shift `personId` = user id; visible on coverage | Manual |
| P15 | Trusted role apply | Public apply URL → queue | Application in People → applications | Manual |
| P16 | Participation offer | Approve → compose → send | Notification job; applicant accept | Manual + worker |
| P17 | Shift swap | Attendee request → organizer approve | Status updated | Manual |
| P18 | Badges batch | Badges → print by category/status | Print data registrants match filter | Manual |
| P19 | Coverage gap | Event window set → coverage grid | Gap modal assigns staff | Manual |
| P20 | Safety incident | Incidents → create | Row in list; restricted notes if permitted | Manual |
| P21 | Volunteer compliance | Category with expected hours + shifts | Deficit rows when under hours | Manual |
| P22 | Presenter request (Program) | Program → requests ≠ applications | Promote to slot / offer path | Manual |
| P23 | Munch template | `peopleHubTemplate=munch` | Only signups + roster tabs | Manual |
| P24 | Command bridge RBAC | `audit-command-bridge.mjs` | Expected 403/200 matrix | Script |

---

## Identity / data risks

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Three IDs** | `users.id` vs `convention_registrants.id` vs `convention_persons.id` | UI labels; `directoryPersonId` on signups rows; never use person id in shift POST |
| **Staff shift `personId`** | Must be `users.id` | User picker only; API validates on POST |
| **Signups without `userId`** | Import/create should resolve user | Orphan registrants excluded from people sync seeds |
| **Manual roster row** | `convention_persons` without `userId` | Not in sync job aggregation; manual only |
| **Duplicate attendance** | `convention_check_ins` vs registrant `checkedInAt` | Pick one model or sync |
| **directoryPersonId stale** | Mapped at list time from sync | Refresh list after sync job delay |
| **Program slot persons** | `schedule_slot_persons` / presenters use user ids on program side | Session drawer ≠ roster person id for unlinked manual rows |
| **Presenter request identity** | `presenterUserId` on `convention_presenter_requests` | Separate from vetting applications table |

**Enforced in API (2026-05-22 identity pass per FEATURE_REGISTRY):** `POST /registrants` requires `userId`; import resolves email; unique `(convention_id, user_id)`.

---

## UI / API mismatches

| UI expectation | API/UI actual | Severity |
|----------------|---------------|----------|
| Door early/late row colors | `mapRegistrant` → `checkInEligibility: 'ok'` on door paths | High |
| Signups check-in policy | PATCH enforces window; door POST does not | High |
| Category edit in signups | UI may expose for registration role | API admin-only | Medium |
| Policy / tags tabs | Shown in detail | 403 → empty | Medium |
| “Checked in” filter on badges `confirmed` | Means **not** checked in | Low |
| Architecture doc deep links broken | Code supports `person` / `registrant` params | Low (doc only) |
| Presenter requests “pending” on Program | Hidden when empty — may look like feature missing | Low |

---

## Required fixes

Grouped for prelaunch / pilot sign-off (maps to §9).

### P0 — Before unattended door at event

| ID | Fix |
|----|-----|
| RF-01 | Enforce `assertCheckInAllowed` on `POST /registrants/check-in` (door + offline replay) |
| RF-02 | Return `mapRegistrantFull` (or equivalent) on door roster, lookup, check-in |
| RF-03 | Set `registrationStatus` and computed `checkedInTiming` on door check-in to match signups PATCH |

### P1 — Before multi-role organizer pilot

| ID | Fix |
|----|-----|
| RF-04 | Permission-aware empty states for categories, policies, tags |
| RF-05 | Document or remove legacy `POST /check-ins` or sync to registrant row |
| RF-06 | Debounce or decouple `GET /people` from unconditional sync enqueue |

### P2 — Quality / ops

| ID | Fix |
|----|-----|
| RF-07 | Door offline idempotency |
| RF-08 | Real QR generation for registrant tokens |
| RF-09 | Refresh architecture doc §12 (deep links, door parity) |
| RF-10 | Remove or wire `DEMO_EXPECTED_HOURS` in staff shifts UI |

---

## Feature checklist (audit scope)

| Feature | UI | API | Notes |
|---------|----|-----|-------|
| Registration categories | Settings + signups filters | `registration-routes.ts` | Admin mutate |
| Form builder | `RegistrationSettingsSection` | GET/PUT/PATCH `/registration-form` | Admin |
| Attendee preview | `RegistrationAttendeePreview` | Driven by form + categories load | Static preview |
| Signups | `RegistrantsPanel` | `/registrants*` | Full mapper on list |
| Import/export | `ImportSignupsMenu` + export | import POST, export GET | Email → user |
| Roster | `PeopleDirectoryPanel` | `/people*` | Sync on GET |
| Person drawer | `PersonDetailDrawer` | `/people/:id` | Sessions via user program joins |
| Staff shifts | `StaffShiftsPanel` | `/staff-shifts` | `convention_volunteer_shifts` |
| Applications | `VettingQueuePanel` | `/vetting-applications`, `/trusted-roles` | `needsMigration` banner |
| Participation offers | `ParticipationOfferComposer` | `/participation-offers` | Worker notifications |
| Shift swaps | `ShiftSwapsPanel` | `/shift-swaps` | Attendee routes separate |
| Badges | `BadgesPrintPanel` | `/badges/print-data`, logo upload | staff_ops |
| Coverage | `DmCoveragePanel` | `/dm-requirements` | Requires event window |
| Incidents | `SafetyIncidentsPanel` | `/safety-incidents` | Human-only |
| Compliance | `VolunteerCompliancePanel` | `/volunteer-compliance` | Read-only table |
| Door mode | `DoorModePanel` + page | `door-routes.ts`, check-in POST | e2e coverage |
| People sync job | N/A (background) | `c2k-convention-people-sync` | Inline fallback |
| Presenter requests | `PresenterRequestsPanel` (Program) | `/presenter-requests` | Not vetting queue |

---

## Related commands

```bash
# Command bridge GET/RBAC probe
node scripts/audit-command-bridge.mjs

# Organizer HTTP smokes (incl. registration-form)
npx tsx packages/api/scripts/smoke-organizer-parity.ts preview-c2k-weekend

# Door e2e (needs db:prepare + demo user)
npx playwright test e2e/door.spec.ts
```

---

*End of audit 08. No code changes in this pass.*
