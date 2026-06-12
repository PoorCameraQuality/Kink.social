# C2K interaction registry

**Purpose:** One row per workflow-critical control with an **interaction contract**. Refresh route table via `npm run audit:ui-inventory` → [`generated/ROUTES_TABLE.md`](./generated/ROUTES_TABLE.md).

**Status legend:** `works` | `broken` | `no-op` | `404` | `unsupported` | `future-only` | `permission` | `needs-test`

---

## How to add a row

| Column | Meaning |
|--------|---------|
| Route | Path + query/tab state |
| Screen/state | Tab, modal, drawer, empty vs loaded |
| Component/file | Primary React file |
| Control | Label users see |
| Type | button, link, tab, form submit, … |
| Required role | public / member / org MOD / command grant domain |
| Expected behavior | Contract bullets below |
| API | Method + path or — |
| Mobile notes | 390×844 caveats |
| Status | Current verification |
| Action | keep / fix / hide / disable / add test |
| Risk | P0–P4 |

---

## Workflow-critical controls (seed contracts)

| Route | Screen | Component | Control | Type | Role | Expected behavior | API | Status | Action | Risk |
|-------|--------|-----------|---------|------|------|-------------------|-----|--------|--------|------|
| `?create=event` | Wizard step 1–4 | `CreateFlowModal.tsx` | Continue / Publish event | button | signed-in | Step validation; publish creates event; convention shell only if ADMIN org | `POST /api/v1/events`, optional `POST /api/v1/conventions` | needs-test | add test | P1 |
| `…/door` | Lookup | `DoorModePanel.tsx` | Search | input | command registration+ | Filters roster; selects registrant | `GET …/door/roster` or lookup | needs-test | add test | P1 |
| `…/door` | Check-in | `DoorModePanel.tsx` | Check in | button | command registration+ | Eligible check-in; early 409; sets checked_in | `POST …/registrants/check-in` | works | keep | P1 |
| `?tab=program` | Program | `ConventionPublishActions.tsx` | Publish | button | command admin / publish role | C2K public listing; ECKE only if bridge connected | PATCH settings + optional ECKE POST | needs-test | add test | P1 |
| `?tab=people&peopleTab=signups` | Signups | People hub | Check in | button | registration grant | Same policy as door (`resolveCheckInUpdate`) | PATCH registrant | needs-test | add test | P1 |
| `?tab=import` | Import | Schedule import | Publish import | button | scheduler | Updates slots; no staff board if hidden | import publish routes | needs-test | keep | P2 |
| `?tab=exports` | Exports | `ExportsHubPanel.tsx` | Calendar subscribe | link | staff_ops+ | Mint URL returns 200 ICS | `GET …/calendar-feed/:token` | works | keep | P2 |
| `?tab=integrations` | ECKE | `EckeEntityPublishStatus.tsx` | Queue publish | button | owner/article | Disabled when `!bridgeConnected` | POST entity ecke-publish | works | keep | P1 |
| `/orgs/:slug` | Forums | `OrgHubClient.tsx` | Reply | composer | member, not banned | 403 if banned/locked | org forum POST | works | keep | P0 |
| `/orgs/:slug` | Chat | `OrgHubClient.tsx` | Send message | button | member, not banned | 403 if scope banned | org channel POST | works | keep | P0 |
| `/groups/:id` | Forums | `GroupForumsSection.tsx` | Post thread / Reply | button | member | Ban + locked thread enforced | group forum POST | needs-test | add test | P1 |

### Example contract (program slot publish)

```text
Role: scheduler command grant (or org OWNER/ADMIN)
Starting state: draft program slot exists, convention hub loaded
User action: Publish slot (supported mechanism in program UI)
Expected API: PATCH slot or settings per existing program publish path
Expected immediate UI: slot shows published badge / public listing on
Expected persisted state after refresh: slot still published
Expected public-facing result: slot on public Schedule tab when listing public
Expected unauthorized behavior: 403 API; button hidden or disabled in UI
```

---

## Generated routes

See [`generated/ROUTES_TABLE.md`](./generated/ROUTES_TABLE.md) (94 app routes). Classify each new route here when adding features.

---

## E2E coverage map

| Workflow | Spec file | data-testid |
|----------|-----------|-------------|
| Auth | `e2e/auth.spec.ts` | — |
| Route smoke desktop | `e2e/route-smoke.desktop.spec.ts` | — |
| Route smoke mobile | `e2e/route-smoke.mobile.spec.ts` | — |
| Create event | `e2e/event-create.spec.ts` | `create-event-next`, `create-event-publish` |
| Door | `e2e/door.spec.ts` | `door-search`, `door-check-in-submit` |
| Permissions API | `e2e/permissions.spec.ts` | — |
| ECKE / exports | `e2e/exports-integrations.spec.ts` | `program-convention-publish-open` |

---

## Maintenance

1. Run `npm run audit:ui-inventory` after adding routes or test IDs.
2. Run `npm run test:e2e:smoke` before PRs touching web nav or layouts.
3. Run `npm run test:e2e:workflows` when Docker DB + seed available.
4. Update **Status** column when fixing; link PR in commit message.
