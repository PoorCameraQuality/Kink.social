# Prelaunch Audit 09 — Program Schedule, Import & Publishing

**Scope:** Convention Command Bridge program tab, `schedule_slots`, spreadsheet import (CSV/XLSX/Google Sheets), staging batches, direct CSV API, `importKey` idempotency, timezone/event-window validation, per-slot publish model, public attendee visibility, ECKE/Dancecard outbound sync.

**Method:** Static code review of API routes, shared import libraries, organizer UI (`ProgramTab`, `ProgramScheduleGrid`, `ProgramListView`, `SessionDetailDrawer`, `ScheduleImportPanel`, `ConflictDock`, `PresenterRequestsPanel`, ECKE publish surfaces). No fixes implemented. No live import/publish smoke run in this pass.

**Audit date:** 2026-06-04  
**Wave 5 remediation (2026-06-04):** ECKE entity queue returns 503 when bridge disconnected; auto-enqueue skipped without bridge; outbound convention slots still filtered via `filterSlotsForPublicProgram`.
**Wave 6 remediation (2026-06-04):** `ConventionPublishActions` fetches bridge status; ECKE checkbox hidden/disabled when disconnected; publish blocked before C2K when ECKE selected without bridge.

---

## 1. Executive summary

Program scheduling on C2K is **feature-rich but not production-trustworthy for draft/publish semantics**. The organizer UI correctly models per-session draft vs published state (`isPublished`), and the **staging import pipeline** (parse → draft batch → publish-preview diff → publish) is thoughtfully designed with `importKey`-based upserts and explicit “missing from source ≠ delete” behavior.

However, **public read paths do not honor `isPublished` or slot visibility**, so draft and staff-only sessions can appear on the convention hub, in ICS exports, and in ECKE/Dancecard outbound payloads. **`importKey` idempotency works in code but lacks a DB uniqueness guarantee and automated tests.** Import publish and legacy slot-creation paths default new rows to **`isPublished = true`** (schema default) while the Command Bridge manual-create path defaults to **draft (`false`)** — a serious inconsistency.

**ECKE/Dancecard UI is mostly honest** when the publish bridge is disconnected (`bridgeConnected: false`), but convention “Publish” actions can still flip C2K listing flags and imply attendee visibility that the slot filter does not enforce.

**Readiness:** Deployable to **staging with documented limitations**; **not safe for production** until public slot filtering and import publish defaults are fixed.

---

## 2. Blockers

| ID | Issue | Evidence |
|----|-------|----------|
| B1 | **Public program API returns all slots — no `isPublished` or visibility filter** | `GET /api/v1/conventions/:key/slots` selects all `schedule_slots` for the convention with no `isPublished` / `visibility` predicate (`packages/api/src/routes/conventions-routes.ts` ~745–945). UI copy claims drafts are hidden (`ProgramVisibilityCard.tsx` ~76–78). |
| B2 | **ICS export includes draft/unpublished slots** | `GET /api/v1/conventions/:key/program.ics` loads all slots without publish filter (`conventions-routes.ts` ~1437–1441). |
| B3 | **Import publish creates/updates live slots as published by default** | `publishProgramCandidates` insert/update payload omits `isPublished`; DB column defaults to `true` (`schema.ts` ~1877). Manual organizer create uses `isPublished: false` (`convention-organizer-routes.ts` ~905). Organizers can accidentally publish entire imports to the public schedule. |
| B4 | **ECKE Dancecard outbound sync sends all slots regardless of publish state** | Slot load in `ecke-publish-routes.ts` (~185–200) has no `isPublished` filter; `buildDancecardEventPayload` maps every slot (`ecke-publish-payload.ts` ~247–257). |

---

## 3. High-risk issues

| ID | Issue | Notes |
|----|-------|-------|
| H1 | **Dual slot API surfaces** | Legacy `/api/v1/conventions/:key/slots` (CRUD, import-csv, export) vs organizer `/api/v1/conventions/:key/program-slots`. Promote presenter request uses legacy insert without `isPublished: false` (`conventions-routes.ts` ~2208–2221) → **promoted sessions may be public immediately**. |
| H2 | **`importKey` not unique in DB** | Index only on `(convention_id, import_key)` — not unique (`schema.ts` ~1893). Concurrent or buggy double-insert could duplicate rows with same key. |
| H3 | **Generated `importKey` changes when row content changes** | `generateFallbackImportKey` hashes title/times/room (`organizer-import-publish.ts` ~75–92). Re-import without explicit `importKey` column creates **new slots** instead of updates. |
| H4 | **Presenter promote: UI allows `OFFER_ACCEPTED`, API requires `APPROVED`** | `PresenterRequestsPanel.tsx` ~138 vs `conventions-routes.ts` ~2194–2196. Users see promote UI but get 400. |
| H5 | **Presenter promote datetime uses browser local TZ, not convention TZ** | `toIsoFromLocal` in `PresenterRequestsPanel.tsx` ~20–23; convention `timezone` prop unused for conversion. |
| H6 | **`program_grid` timezone handling is approximate** | `guessOffsetMinutes` in `organizer-import-grid.ts` ~72–86; comment admits “DST not perfect”. Grid parse uses UTC month/year from `windowStartsAt` ref (`parseProgramGridRows` ~151–157). |
| H7 | **Convention “Publish” sets `publicProgramListing: true` without slot-level gate** | `EckePublishStub.tsx` / `ConventionPublishActions.tsx` patch settings; public API still exposes all slots (B1). |

---

## 4. Medium-risk issues

| ID | Issue | Notes |
|----|-------|-------|
| M1 | **Direct CSV import bypasses staging UI** | `POST /api/v1/conventions/:key/slots/import-csv` calls `publishProgramCandidates` immediately (`conventions-routes.ts` ~1357–1402). **Not linked from `packages/web/src`** — API-only footgun for scripts/integrations. |
| M2 | **Import batch publish does not sync presenters on unchanged slots** | Presenters synced only when status is `new` or `update` (`scheduleImportPublish.ts` ~295–297). Re-import with unchanged body but presenter column change may not update. |
| M3 | **`programCandidateMatchesExisting` ignores presenters** | Diff marks slot `unchanged` without comparing presenter lists (`organizer-import-publish.ts` ~114–128). |
| M4 | **Window validation skipped when window unset** | `isWithinEventWindow` returns `true` if window timestamps invalid (`organizer-import-validate.ts` ~11–12). Parse still runs without window on some paths if `windowStartsAt`/`windowEndsAt` missing. |
| M5 | **Grid visible hours 06:00–25:00 local only** | `PROGRAM_GRID_START_HOUR = 6`, `PROGRAM_GRID_END_HOUR_EXCL = 25` (`programGridConfig.ts`). Overnight sessions outside band need list view or manual times. |
| M6 | **Conflict scan is on-demand, not continuous** | `ConflictDock` copy: “Server scan — not live on every edit” (`ConflictDock.tsx` ~118). Uses `scheduleSlotPersons` + room overlap (`convention-organizer-routes.ts` ~1406–1448) — may diverge from `scheduleSlotPresenters` used elsewhere. |
| M7 | **Google Sheets import requires OAuth or public sheet** | `modules-routes.ts` Google endpoints; failures return 502. Mapping profiles stored but auto-apply logic is partial (`convention-organizer-routes.ts` ~1951+). |
| M8 | **Staff import publish uses name/time matching, not `importKey`** | `publishStaffImportRows` matches personName+role+startsAt (`scheduleImportPublish.ts` ~324–328) — weaker idempotency than program path. |
| M9 | **Duplicate slot action omits `importKey`** | Bulk duplicate in `program-ext-routes.ts` ~127–150 — copies may get new UUID keys; re-import dedupe harder. |

---

## 5. Low-risk issues

| ID | Issue | Notes |
|----|-------|-------|
| L1 | **No unit tests for `computeProgramPublishDiff` / import publish** | Shared logic exists (`packages/shared/src/organizer-import-publish.ts`) but no `*.test.ts` found in repo for import publish. |
| L2 | **`eventPublished` in ProgramTab conflates convention status with slot publish** | Uses `eventStatus === 'published'` for visibility card (`ProgramTab.tsx` ~113) while product model is per-slot `isPublished`. |
| L3 | **Mobile defaults to list view** | `ProgramTab.tsx` ~82–84 — acceptable; grid may be cramped on phone. |
| L4 | **SessionDetailDrawer `isPublicOnSchedule` always true in GET people** | `program-ext-routes.ts` ~188 — PUT may differ; attendee display rules unclear vs slot visibility. |
| L5 | **Export CSV from legacy route includes all slots** | `/slots/export.csv` — no draft filter; organizer-only endpoint. |
| L6 | **`parseDateValue` uses `Date.parse` for flat imports** | Locale-dependent strings may fail validation (`organizer-import.ts` ~165–169). |

---

## 6. Dead/misleading UI found

| Location | Problem |
|----------|---------|
| `ProgramVisibilityCard.tsx` | States draft sessions “stay hidden from the public Schedule tab and Dancecard until published” — **false** given B1/B4. |
| `ProgramTab.tsx` | “Preview attendee schedule” implies published-only view; public API returns all slots when listing is public. |
| `ScheduleImportPanel.tsx` | Publish confirm says re-import won’t duplicate with matching keys — **true only with stable explicit or content-stable generated keys** (H3). |
| `EckePublishStub.tsx` | Preview message correctly notes bridge dependency (~145); convention publish still sets C2K listing flags even when ECKE sync blocked (~169–183). |
| `ProgramExportsSection.tsx` | ICS/CSV links export **all** slots including drafts. |

---

## 7. Permission issues found

| Area | Finding |
|------|---------|
| Staging import / publish | Correctly gated: `requireOrganizer(..., 'scheduler')` on import batch routes (`convention-organizer-routes.ts`). |
| Direct CSV import | Uses `canManageConvention` (broader than scheduler-only) on legacy `/slots/import-csv`. |
| Presenter requests | Promote uses `canManage` on legacy route, not explicit `scheduler` grant — **broader than program grid mutations** for delegated roles. |
| Public slots | When `publicProgramListing !== false`, **unauthenticated** clients receive full slot list including drafts (B1). |

---

## 8. Missing env/config

| Config | Impact on program/import |
|--------|--------------------------|
| `USE_DATABASE=true` | Required for all import/publish endpoints. |
| Google OAuth / service account | Google Sheets pull (`modules-routes.ts`); without it, file upload path only. |
| ECKE publish client env (`loadEckePublishClientConfig`) | When unset, `bridgeConnected: false` — UI should not promise ECKE sync (mostly handled). |
| `C2K_WEB_PUBLIC_URL` / `VITE_SITE_URL` | Used in ICS URLs. |
| S3 (optional) | Program ext routes for map/assets — not core schedule. |

No missing env blocks **local** staging import via file upload; Google and ECKE are optional integrations.

---

## 9. Recommended fixes

**P0 (before production)**

1. Filter public `GET /conventions/:key/slots`, `program.ics`, and hub client rendering to **`isPublished = true`** and respect `visibility` (exclude `staff_only` / `secret` for anonymous and non-staff viewers).
2. Set **`isPublished: false`** on all import publish inserts; optionally bulk-publish workflow after organizer review.
3. Align **schema default** `isPublished` to `false` or always set explicitly on every insert path (legacy slots, promote-to-slot, import, duplicate).
4. Filter **ECKE Dancecard payload** slots to published (and optionally public visibility) only.

**P1**

5. Add **unique partial index** on `(convention_id, import_key)` where `import_key IS NOT NULL`.
6. Fix presenter promote: accept `OFFER_ACCEPTED` or hide promote button; use **convention timezone** for datetime fields.
7. Consolidate or document **legacy vs program-slots** APIs; hide `/slots/import-csv` behind scheduler permission or deprecate in favor of staging path.
8. Include presenter lists in import diff / sync presenters on update when usernames change.

**P2**

9. Improve `program_grid` TZ: use `fromZonedTime` / convention IANA TZ consistently (match grid UI `organizerTimeline.ts`).
10. Add unit tests for `resolveImportKey`, `computeProgramPublishDiff`, double-import scenarios.
11. Update misleading copy in `ProgramVisibilityCard` until B1 fixed.

---

## 10. Files likely affected

| Domain | Paths |
|--------|-------|
| Public slot read | `packages/api/src/routes/conventions-routes.ts` |
| Import publish | `packages/api/src/lib/convention-organizer/scheduleImportPublish.ts`, `packages/shared/src/organizer-import-publish.ts` |
| Organizer program CRUD | `packages/api/src/routes/convention-organizer-routes.ts`, `packages/api/src/routes/convention-organizer/program-ext-routes.ts` |
| ECKE sync | `packages/api/src/routes/ecke-publish-routes.ts`, `packages/api/src/lib/ecke-publish-payload.ts` |
| Schema | `packages/api/src/db/schema.ts` (+ migration) |
| Grid / import UI | `packages/web/src/components/dancecard/organizer/ProgramScheduleGrid.tsx`, `ScheduleImportPanel.tsx`, `program/ProgramVisibilityCard.tsx` |
| Shared parse | `packages/shared/src/organizer-import-parse.ts`, `organizer-import-grid.ts`, `organizer-import.ts` |
| Presenter requests | `packages/web/src/components/dancecard/organizer/program/PresenterRequestsPanel.tsx`, `conventions-routes.ts` (promote) |
| Public hub | `packages/web/src/hooks/useConventionHub.ts`, `ConventionProgramSchedulePanel.tsx` |

---

## 11. Suggested tests

### Manual smoke (program/import)

1. Create convention with event window + timezone (e.g. `America/New_York`).
2. Manual add session via Program grid → confirm **draft** (`isPublished: false`) in drawer.
3. Bulk publish one session → public hub shows **only** that session (after fix; currently fails B1).
4. Import CSV with explicit `importKey` column twice → second run **updates** count, zero duplicate titles (staging publish path).
5. Import same sheet **without** `importKey` but change start time → observe **new** slot (document H3).
6. Import `program_grid` XLSX with day headers + time rows → verify day columns match window.
7. Publish import batch → verify preview diff counts; confirm `missingFromSource` rows **not deleted**.
8. Set slot draft → verify ICS/hub/Dancecard preview exclude it (after fix).
9. ECKE publish with bridge disconnected → UI shows not connected; no false “published to ECKE” success.
10. Presenter request: approve → promote with times → slot appears in organizer grid.

### Automated (recommended)

- Unit: `computeProgramPublishDiff` — new/update/unchanged/invalid/unplaced/missingFromSource.
- Unit: `resolveImportKey` + double candidate same key.
- API integration: import batch publish twice → single row per `importKey`.
- API integration: public slots endpoint excludes `isPublished: false`.

---

## 12. Confidence level

**Medium–high** for architectural and contract issues (static analysis across API + shared + web). **Medium** for runtime spreadsheet edge cases (XLSX date cells, Google OAuth flows, DST boundary days) without executing imports on a live DB. **High** confidence on B1–B4 (clear code paths, no filter present).

---

## Schedule / import reliability report

### Architecture (what works)

```
Upload / Google Sheets / JSON rows
    → parseSpreadsheetImport (flat_rows | program_grid)
    → optional column mapping + window validation
    → convention_import_batches + convention_import_rows (staging)
    → POST .../publish-preview (dryRun)
    → POST .../publish → publishProgramCandidates
         → upsert schedule_slots by importKey
```

- **Idempotent upsert logic:** `loadProgramSlotsByImportKey` + `computeProgramPublishDiff` + update/insert by key (`scheduleImportPublish.ts`).
- **Safe re-import:** Rows absent from sheet are reported as `missingFromSource`; **not auto-deleted** (UI confirm in `ScheduleImportPanel.tsx` ~891–893).
- **Room matching:** Fuzzy/exact location match with validation errors (`organizerImportBatch.ts` `applyRoomMatchesToParsedRows`).
- **Organizer grid:** Event window enforced on drag via `clampSlotIntervalToWindow` (`ProgramScheduleGrid.tsx` ~680–741); day columns from `dayKeysInWindow` in convention TZ.
- **Mapping profiles:** Persisted per convention/kind (`convention_import_mapping_profiles`).

### Import twice / `importKey` behavior

| Scenario | Expected | Actual (code) |
|----------|----------|-----------------|
| Same explicit `importKey`, changed title/time | Update | Update (`status: 'update'`) |
| Same explicit `importKey`, identical fields | Unchanged | Unchanged — skipped write |
| No explicit key, identical title/time/room | Same generated key | Unchanged/update |
| No explicit key, changed start time | New slot | **New `importKey`** → duplicate session |
| Concurrent double publish same key | Single row | **Race possible** — no UNIQUE constraint |

### Staging vs direct CSV

| Path | UI | Staging | Preview diff | Notes |
|------|-----|---------|--------------|-------|
| Command Bridge Import tab | Yes | Yes | Yes | Primary path |
| `POST .../slots/import-csv` | **No web UI** | No | No | Immediate live publish |
| Google `create-import-batch` | Yes (Integrations) | Yes | Yes | Same as file staging |

### `program_grid` gaps (document for operators)

- Detected when column A has “Time” header + time-like cells (`organizer-import-detect.ts`).
- Requires day-of-month lines (e.g. “Friday 12”) before time rows; **year inferred from event window**.
- Single-duration default: one time → +1 hour block (`organizer-import-grid.ts` ~103–110).
- Multi-line cell titles joined; track not parsed from grid cells.
- **DST / offset:** rough GMT offset guess — verify imports near DST transitions manually.

### Google Sheets mapping flow

1. Connect OAuth (Integrations) or public pull if configured.
2. Preview rows → fetch rows → `beginPendingParse` → column mapping panel.
3. `create-import-batch` (API) or POST `/imports` with mapped rows.
4. Mapping profiles save header indices and column map for repeat imports.

**Risk:** Wrong auto-detected header row (`detectHeaderRowIndex`) silently maps wrong columns — organizer must verify mapping panel.

### Date/time display

- Grid/list use `formatInTimeZone` / `formatTimeLabel` with convention `timezone` (good).
- Flat import ISO strings stored as UTC instants.
- Presenter promote uses local browser datetime (bad — H5).

### Grid dates vs convention window

- Column days: intersection of `[windowStartsAt, windowEndsAt]` stepped by 30 min in TZ (`organizerTimeline.ts`).
- Drops outside window rejected with user-visible error (`ProgramScheduleGrid.tsx`).
- Import validation adds “Outside convention event window” when parse includes window params (`organizer-import-validate.ts`).

### Published vs draft public visibility

| Layer | Filters drafts? |
|-------|-----------------|
| Organizer `GET /program-slots` | Optional query `isPublished` |
| Public `GET /slots` | **No** |
| `program.ics` | **No** |
| ECKE Dancecard publish | **No** |
| Hub UI (`useConventionHub`) | Uses public slots API — **No** |

**Verdict:** Per-slot publish model exists in organizer UI but **is not enforced on read paths** — critical trust bug.

### ECKE/Dancecard sync honesty

| Claim / UI | Honest? |
|------------|---------|
| “Preview saved… sync ships when bridge connected” | Yes (`EckePublishStub.tsx`) |
| `bridgeConnected: false` blocks ECKE publish | Yes |
| C2K-only convention publish sets `publicProgramListing` | Works, but **overstates** slot-level readiness |
| Dancecard `externalKey` = slot UUID | Stable across import updates; **not** `importKey` |
| Outbound includes draft slots | **Misleading** if organizers believe ECKE respects draft state |

---

## Known unsafe paths

1. **`POST /api/v1/conventions/:key/slots/import-csv`** — immediate live merge, no staging, import rows published by default.
2. **Public program listing enabled + any draft slots** — drafts leak to world (B1).
3. **Re-import spreadsheet without `importKey` column after schedule edits** — duplicate sessions (H3).
4. **ECKE “Publish” with bridge connected** — pushes unpublished slots to Dancecard (B4).
5. **Promote presenter request via legacy route** — creates `isPublished: true` slot (H1).
6. **Local demo import batch (`local-` id)** — publish blocked in UI; good. Demo drag board only.

---

## What must be fixed before production

1. **Enforce `isPublished` (+ visibility) on all attendee/public read surfaces** (API, ICS, hub, ECKE payload).
2. **Import publish must not default new slots to published** — match manual-create draft default.
3. **Align all slot insert paths** (promote, legacy POST `/slots`, duplicate) to explicit publish defaults.
4. **Add DB uniqueness or transactional upsert** for `(convention_id, import_key)`.
5. **Fix or gate presenter promote** (status mismatch + timezone + publish default).
6. **Update misleading visibility copy** after API fixes.

---

## Alpha limitations (acceptable if documented)

- **Google Sheets** requires integration setup; OAuth failures are operator-facing 502s.
- **`program_grid` parser** does not handle all spreadsheet layouts (merged cells, multi-track sheets, non-English day names beyond regex set).
- **Conflict dock** is scan-on-load/manual refresh, not real-time.
- **Staff import idempotency** weaker than program (`importKey` not fully used in staff publish).
- **Direct CSV API** exists for power users/scripts — not exposed in Command Bridge UI.
- **ECKE outbound** is optional; C2K is source of truth when bridge disabled.
- **Overnight grid** display limited to configured hour band; use list view for edge times.
- **No automatic deletion** of slots removed from source spreadsheet (by design — operators prune manually).

---

## Related docs

- `docs/FEATURE_REGISTRY.md` — convention/program routes
- `docs/UI_CLEANUP_REGISTRY.md` — program visibility row (partial)
- `packages/api/src/lib/convention-program-policy.ts` — `filterSlotsForPublicProgram` (draft + visibility); listing gate unchanged

---

## Phase 3 Wave 3 fixes (2026-06-04)

| Issue | Resolution |
|-------|------------|
| B1 Draft slots on public GET /slots | `filterSlotsForPublicProgram` before response |
| B2 Draft slots in program.ics | Same filter on ICS path |
| B3 Draft slots in ECKE Dancecard publish | Filter at slot load in `ecke-publish-routes.ts` |
| B4 Import publish defaults published | New inserts `isPublished: false` in `publishProgramCandidates` |

**Alpha note:** After import publish, organizers must publish sessions in Program tab before attendees see them on Schedule/ICS/ECKE.

**Tests:** `convention-program-policy.test.ts` (draft/staff/secret filtering).

---

*Wave 3 implemented public schedule filtering and import draft default (2026-06-04).*
