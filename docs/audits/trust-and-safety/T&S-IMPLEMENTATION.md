# T&S implementation (waves 1–5)

**Master plan:** [`../../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](../../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md) — phases 0–15, alpha posture, build order  
**Audit source (pre-build):** [`T&S-AUDIT.md`](./T&S-AUDIT.md) — read-only inventory; **superseded for shipped status by this doc**  
**Companion docs:** [`MODERATOR_WORKFLOW.md`](./MODERATOR_WORKFLOW.md), [`POLICY_TAXONOMY.md`](./POLICY_TAXONOMY.md)

## Wave completion index

| Wave | Focus | Status |
|------|-------|--------|
| **T&S-1** | Cases, intake, queues, audit | **Complete** — mergeable, automation-proven |
| **T&S-2** | Media metadata, attestation, publish lanes | **Complete** (2026-06-05) |
| **T&S-3** | Upload quarantine, promotion, scan adapter | **Complete** |
| **T&S-3.5** | Mod console nav, dashboard usability | **Complete** |
| **T&S-4A** | OSS scanner adapter pack | **Complete** |
| **T&S-4B** | Legal-profile hardening, hash governance | **Complete** |
| **T&S-5** | Unified intake, scoped mod parity, reporter notify | **Complete** (2026-06-06) |
| **T&S-6+** | Suspend column enforcement, platform appeals, external vendors | **Deferred** |

**Alpha reputation cross-cut (parallel track):** public Community Trust, mod-only Trust Summary, incident clustering, scoped standing/appeals — alpha in code; see [`COMMUNITY_REPUTATION_MASTER_PLAN.md`](../../COMMUNITY_REPUTATION_MASTER_PLAN.md).

---

## T&S-1 implementation

**Wave:** T&S-1 — moderation foundation (reports, cases, queues, audit)  
**Status:** **Complete — mergeable, automation-proven**

---

## What shipped

| Area | Deliverable |
|------|-------------|
| **Policy taxonomy** | `@c2k/shared` `moderation-types.ts` — 15 reasons, severities, queues, case statuses, routing helpers |
| **Schema** | `moderation_cases`, `moderation_reports`, `moderation_queue_items`, `moderation_events`, `content_snapshots`, `user_risk_flags`, `moderation_appeals`; `moderation_actions.case_id` |
| **Report intake** | `POST /api/v1/moderation/reports`, `GET /api/v1/me/moderation/reports`; legacy `POST /api/v1/reports` delegates to same intake |
| **Admin API** | Dashboard, queues, cases list/detail, assign/status, notes, actions, audit timeline |
| **Admin UI** | `/moderation/dashboard`, `/moderation/queues`, `/moderation/cases`, `/moderation/cases/:caseId` |
| **Report UI** | `ReportAction` → `TsReportModal` on UGC surfaces (profiles, feed, forums, chat, media, education, DMs, etc.) |
| **Tests** | Unit + DB integration (`moderation-ts-intake`, `moderation-ts-admin`) |
| **Verify** | `npm run verify:trust-safety` (local orchestration + DB tests) |
| **Docs** | [`POLICY_TAXONOMY.md`](./POLICY_TAXONOMY.md), [`MODERATOR_WORKFLOW.md`](./MODERATOR_WORKFLOW.md), [`MIGRATION_HYGIENE.md`](./MIGRATION_HYGIENE.md) |

### Schema apply note

`drizzle-kit push` can fail on expression-index Zod (pre-existing convention index issue). T&S-1 tables are applied idempotently via `packages/api/scripts/apply-incremental-migration.ts` during `db:prepare`.

---

## API routes (T&S-1)

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/v1/moderation/reports` | User |
| `GET` | `/api/v1/me/moderation/reports` | User |
| `GET` | `/api/v1/moderation/dashboard` | Platform mod |
| `GET` | `/api/v1/moderation/queues` | Platform mod (restricted queue: site admin only) |
| `GET` | `/api/v1/moderation/cases` | Platform mod |
| `GET` | `/api/v1/moderation/cases/:caseId` | Platform mod |
| `PATCH` | `/api/v1/moderation/cases/:caseId` | Platform mod |
| `POST` | `/api/v1/moderation/cases/:caseId/notes` | Platform mod |
| `POST` | `/api/v1/moderation/cases/:caseId/actions` | Platform mod |

Case actions (current): `mark_no_violation`, `close_duplicate`, `escalate`, `hide_content`, `keep_quarantined`, `remove_media`, `restore_media`.  
`hide_content` executes only for forum/chat/comment targets; other types return unsupported + audit event. Media targets use `remove_media` / `keep_quarantined` / `restore_media` (T&S-2+).

Later waves added platform routes: rule-of-two (`/moderation/actions`), legacy report inbox, trust summary, incidents, hash list, legal admin — see sections below.

---

## Enforcement gaps (current, post T&S-5)

| Target / action | Current behavior |
|-----------------|------------------|
| `profile`, `post`, `event`, `message`, `conversation`, etc. | Report + case + snapshot; **`hide_content` not executed** — unsupported + audit event |
| `org_forum_reply`, `group_reply`, `comment`, `org_chat_message` | `hide_content` → `executeModerationAction(HIDE_CONTENT)` |
| `media_asset`, `profile_photo` | `remove_media` / `keep_quarantined` / `restore_media`; `upload_status` + linked surfaces |
| User suspend/ban | `POST .../admin/users/:userId/suspend` — **audit-only stub**; no `users.suspended_at` (T&S-6) |
| Platform `moderation_appeals` | Schema only — full workflow T&S-7; **scoped appeals** alpha at `/settings/trust` |
| Feed post platform hide | Reportable; not in `resolveHideContentExecuteTarget` |
| AI case summarization | Not implemented — trust summary is SQL aggregation, not LLM |

---

## Verification (proven)

```bash
npm run verify:trust-safety          # docker + db:prepare + unit + DB tests — exit 0
npm run verify:trust-safety:unit     # unit only (no Docker)
VERIFY_TS_E2E=1 npm run verify:trust-safety:local   # + Playwright moderation-ts.spec.ts
```

**Last local gate:** `verify-trust-safety-local` — **PASS** (docker, db:prepare, 16/16 moderation-ts tests).  
Log: `docs/audits/trust-and-safety/verify-trust-safety.log`

Also required green: `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:prelaunch`, `npm run verify:alpha:auto:local`.

---

## Deferred (not T&S-1)

| Item | Wave |
|------|------|
| External scanning vendors (PhotoDNA, etc.) | T&S-3+ |
| CSAM external reporting automation | T&S-4+ |
| NCII public takedown form | T&S-4+ |
| Video scanning | T&S-3+ |
| Private-message image attachments | T&S-5+ |
| Perceptual hashing enforcement | T&S-3+ |
| Report button on every UGC surface | ~~T&S-5+~~ **Done (2026-06-06)** — see T&S-5 § |
| Platform appeals workflow (`moderation_appeals` API) | T&S-7 — scoped appeals alpha shipped separately |
| Full media gallery product (all surfaces) | T&S-3+ |
| External scan vendors, S3 quarantine | T&S-3+ |

---

## Key files

- Shared: `packages/shared/src/moderation-types.ts`
- Schema: `packages/api/src/db/schema.ts`, incremental SQL in `apply-incremental-migration.ts`
- Intake: `packages/api/src/lib/moderation-ts-intake.ts`, `moderation-ts-target-validate.ts`
- Admin: `packages/api/src/lib/moderation-ts-admin.ts`, `routes/moderation-ts-admin.ts`
- Web: `packages/web/src/components/moderation/TsReportModal.tsx`, `hooks/useApiModerationTs.ts`, `app/moderation/**`
- Tests: `packages/api/src/test/moderation-ts-*.test.ts`, `e2e/moderation-ts.spec.ts`
- Verify: `scripts/verify-trust-safety.mjs`, `scripts/verify-trust-safety-local.mjs`

---

## T&S-2 implementation

**Wave:** T&S-2 — adult media metadata, upload attestation, visibility rules, publish-most lanes  
**Audit source:** [`T&S-AUDIT.md`](./T&S-AUDIT.md) §4, [`MEDIA_LIFECYCLE.md`](./MEDIA_LIFECYCLE.md)  
**Preflight:** [`MIGRATION_HYGIENE.md`](./MIGRATION_HYGIENE.md) — incremental apply for `media_assets`  
**Status:** **Complete — mergeable, automation-proven (2026-06-05)**

### Scope

| Area | Deliverable | Status |
|------|-------------|--------|
| **Shared taxonomy** | `@c2k/shared` `media-types.ts` — upload status, content rating, visibility, depicted people, scan status, adult content pref, `resolvePublishLane()` | Done |
| **Schema** | `media_assets` table + `profile_photos.media_asset_id` FK; pgEnums aligned with shared | Done |
| **Attestation API** | `POST/PATCH/GET /api/v1/media/assets`; profile photo link | Done |
| **Visibility helpers** | `media-visibility.ts`, `media-publish-lane.ts` | Done |
| **Adult content pref** | `user_settings.privacy_settings.adultContentPreference` (`SHOW` \| `BLUR` \| `HIDE`, default `BLUR`) | Done |
| **Upload UI** | `MediaAttestationModal`; profile photo path wired | Done |
| **Moderation integration** | `media_asset` reports → cases; metadata in case detail; blurred mod preview | Done |
| **Tests** | Unit + DB + E2E (`media-*.test.ts`, `media-assets.test.ts`, `e2e/media-ts.spec.ts`) | Done |
| **Verify** | `verify:trust-safety` includes media tests; `verify:trust-safety:media` slice | Done |
| **Docs** | [`MEDIA_LIFECYCLE.md`](./MEDIA_LIFECYCLE.md), this section, workflow/taxonomy updates | Done |

### Alpha rules (product contract)

**Current alpha posture (2026-06-05):** production default **`MEDIA_POLICY_MODE=community_only`** — explicit uploads blocked unless operator enables `attested_explicit_beta` + `C2K_ALLOW_EXPLICIT_MEDIA`. See master plan.

When explicit beta is enabled:

- Explicit adult uploads require attestation + **`SHOW`** adult content preference.
- **`EXPLICIT_ADULT` + `PUBLIC_PREVIEW`** → **coerced to `logged_in`** at attestation (intentional; regression in `media-assets.test.ts`).
- **Multi-person explicit** → YELLOW lane / human review (not auto-publish).
- **Publish-most:** solo attested explicit auto-publishes (GREEN) when policy allows; mods review problems and risk, not every nude.

### API routes (T&S-2)

| Method | Path | Auth | Status |
|--------|------|------|--------|
| `POST` | `/api/v1/media/assets` | User | Done |
| `GET` | `/api/v1/media/assets/:id` | User / visibility rules | Done |
| `PATCH` | `/api/v1/media/assets/:id/attestation` | Owner | Done |
| `GET` | `/api/v1/me/adult-content-preference` | User | Done |
| `PATCH` | `/api/v1/me/adult-content-preference` | User | Done |

Profile photo path extends existing `profile-photos` routes with optional `mediaAssetId` or server-side asset creation.

### Enforcement (T&S-2 vs T&S-1)

| Target / action | T&S-2 behavior |
|-----------------|----------------|
| `media_asset` report | Case + snapshot with metadata; queue per lane |
| `media_asset` hide/remove | `upload_status` → `REMOVED`; hide on linked surface |
| Feed post / education hide | Still T&S-2 slice (parallel agent) |
| User suspend/ban | Deferred T&S-6 |

### Deferred (not T&S-2)

| Item | Wave |
|------|------|
| External scanning vendors, PhotoDNA | T&S-3+ |
| S3 quarantine prefix, MIME magic-byte, EXIF strip | T&S-3 |
| Hash blocklist + blurred mod reveal UX | T&S-4 |
| CSAM external reporting, NCII public takedown | T&S-4+ |
| Video scanning, DM attachments | T&S-5+ |
| Full gallery product, all upload surfaces | T&S-3+ |

### Key files (T&S-2)

- Shared: `packages/shared/src/media-types.ts`
- Schema: `packages/api/src/db/schema.ts`, incremental SQL in `apply-incremental-migration.ts`
- Lib: `packages/api/src/lib/media-visibility.ts`, `media-publish-lane.ts`, `adult-content-preference.ts`
- Routes: `packages/api/src/routes/media-assets.ts`, `profile-photos.ts`
- Web: `packages/web/src/components/media/MediaAttestationModal.tsx`, `hooks/useAdultContentPreference.ts`
- Tests: `packages/shared/src/media-types.test.ts`, `packages/api/src/lib/media-*.test.ts`, `packages/api/src/test/media-assets.test.ts`, `e2e/media-ts.spec.ts`

### Verification (proven)

```bash
npm run verify:trust-safety          # 3/3 — moderation + media unit/DB/E2E — exit 0
npm run verify:alpha:auto:local      # 11/11 post-T&S-2 — exit 0
npm run test:e2e                     # 161 passed, 8 skipped — full regression matrix
```

**Last gate (2026-06-05):**

| Command | Result |
|---------|--------|
| `npm run verify:trust-safety` | **PASS** (moderation-ts-unit, media-ts-tests, moderation-ts-db) |
| `npm run verify:alpha:auto:local` | **PASS 11/11** (~4.4 min) |
| `npm run test:e2e` | **PASS** (161 passed, 8 skipped, ~1.7 min) |

Logs: `docs/audits/ui/verify-alpha-auto.log`, `docs/audits/ui/verify-e2e-full.log`  
Screenshots: `docs/audits/ui/screenshots/latest-alpha/`

**Behavior covered by automation:**

| Rule | Test surface |
|------|----------------|
| Owner sees own published media unblurred | `media-assets.test.ts` |
| Logged-out cannot see explicit `LOGGED_IN` media | `media-assets.test.ts`, `media-visibility.test.ts` |
| `BLUR` / `SHOW` / `HIDE` preference | `media-visibility.test.ts` |
| Solo attested explicit → GREEN / `AUTO_APPROVED` | `media-publish-lane.test.ts`, `media-assets.test.ts` |
| Multi-person explicit → YELLOW / `QUARANTINED` + case | `media-assets.test.ts` |
| P0 reports → restricted queues | `moderation-ts-admin.test.ts` |
| `media_asset` report → case + snapshot + event | `moderation-ts-intake.test.ts` |

Alpha gate split: `verify:alpha:auto:local` = release confidence; `npm run test:e2e` = full regression before major merges.

---

## T&S-3 implementation

**Wave:** T&S-3 — upload safety pipeline (quarantine, validate, hash, EXIF strip, scan adapter, promotion)  
**Audit source:** [`UPLOAD_PIPELINE.md`](./UPLOAD_PIPELINE.md), [`MEDIA_LIFECYCLE.md`](./MEDIA_LIFECYCLE.md)  
**Status:** **Complete — mergeable, automation-proven**

### Delivered

| Area | Status |
|------|--------|
| Quarantine ingest (`POST /api/upload`) | Done — no public URL before promotion |
| Magic-byte validation + size limits | Done |
| EXIF strip via sharp | Done |
| sha256 on ingest | Done |
| `storage_state` + quarantine/public keys | Done |
| Noop scan adapter + `MEDIA_SCAN_SIMULATE` | Done |
| Promotion on GREEN + PASSED | Done |
| Content proxy route for non-public media | Done |
| Profile upload wired | Done |
| Moderation snapshot pipeline metadata | Done |
| Tests | Done — unit + DB pipeline tests |

See [`UPLOAD_PIPELINE.md`](./UPLOAD_PIPELINE.md) for flow diagram and deferred items.

### Verification (proven)

| Command | Result |
|---------|--------|
| `npm run verify:trust-safety` | **PASS** (includes pipeline unit + DB tests) |
| `npm test` | **PASS** (219 tests) |
| `npm run build` | **PASS** |
| `npm run verify:prelaunch` | **PASS** |
| `npm run verify:alpha:auto:local` | **PASS 11/11** |

---

## T&S-3.5 implementation

**Wave:** T&S-3.5 — moderation console access, admin nav, operational usability  
**Status:** **Complete — platform admins can discover and use T&S tools from normal navigation**

### Delivered

| Area | Status |
|------|--------|
| Account menu **Trust & Safety** section (desktop + mobile) | Done — platform mod/site admin only |
| Settings moderation tools → `/moderation/dashboard` | Done |
| `/moderation` index → dashboard | Done |
| Dashboard API: `openCases`, `openQueueItems`, NCII/minor-safety counts, recent cases | Done |
| Dashboard UI: empty state, urgent callouts, recent cases | Done |
| Queue/case screens: back links, retry on error | Done |
| Case detail: T&S-3 pipeline metadata in snapshots | Done |
| `npm run db:ensure-brax-site-admin` | Done |
| DB tests: dashboard shape + restricted count ACL | Done |

### How admins reach tools

1. Log in as Brax or any `platform_staff` user.
2. Open account menu → **Trust & Safety** → **Trust & Safety dashboard**.
3. Or Settings → Account → **Moderation tools**.

**Upgrade Brax on existing DB:** `npm run db:ensure-brax-site-admin`

### Verification

| Command | Covers |
|---------|--------|
| `npm run verify:trust-safety` | Moderation API + dashboard ACL (includes T&S-3.5 DB tests) |
| `npm run verify:trust-safety:admin-ui` | Dashboard/queue admin API tests only (fast DB slice) |

Screenshots: `docs/audits/trust-and-safety/screenshots/` (capture with dev stack + platform admin session).

**Not in this wave:** T&S-4 scanner integrations, UI-2 polish, full E2E nav tests (optional `test:e2e:trust-safety`).

---

## T&S-4A implementation

**Wave:** T&S-4A — free/open-source scanner adapter pack  
**Status:** **Complete — scanner signals integrated into T&S-3 pipeline**

See [`SCANNER_ADAPTERS.md`](./SCANNER_ADAPTERS.md).

### Delivered

| Area | Status |
|------|--------|
| `media_scanner_results` table | Done |
| `media_hash_list_entries` deny/review registry | Done |
| Malware adapter (ClamAV shell + dev noop) | Done |
| Exact hash deny/review matching | Done |
| Adult classifier stub + rating mismatch | Done |
| OCR risk stub + policy term routing | Done |
| Orchestrator + aggregate scan status | Done |
| Admin snapshot scanner summary | Done |
| Unit + DB tests | Done |
| `verify:trust-safety:scanners` | Done |
| Optional ClamAV docker profile | Done |

### Verification

| Command | Covers |
|---------|--------|
| `npm run verify:trust-safety:scanners` | Scanner unit (+ DB when `USE_DATABASE=true`) |
| `npm run verify:trust-safety` | Full T&S gate including scanner tests via media discovery |

**Deferred:** PhotoDNA, NCMEC reporting, NCII takedown automation, video scan, production ML/OCR installs.

---

## T&S-4B implementation

**Wave:** T&S-4B — legal-profile hardening (scanner strictness, media policy mode, privacy defaults, hash governance)  
**Status:** **Complete — extends T&S-4A + prior `content-policy` / `ALLOW_EXPLICIT_MEDIA` work**

### Delivered

| Epic | Area | Status |
|------|------|--------|
| **2** | Production scanner strictness | `media-scanner-config.ts`, boot guard, `NOOP_PASSED` summary, staging/production fail-closed |
| **1** | Media policy mode | `MEDIA_POLICY_MODE` + `C2K_ALLOW_EXPLICIT_MEDIA` gate; admin read-only config |
| **3** | Explicit privacy defaults | Member-only discovery/OG URL gates; visibility coercion on attestation |
| **5** | Hash list governance | `source` enum, `reason_code`, `notes_private`, `expires_at`, admin POST API |
| **7** | Scanner case dedupe | One open case per asset; append events; `minorSafetyReviewStatus` in event metadata |
| **6** | Playbooks | `docs/trust-safety/minor-safety-escalation.md`, `ncmec-manual-reporting-playbook.md` |
| **8** | Verify + docs | `verify:trust-safety:media-policy`, `verify:trust-safety:legal-profile` |

### Environment variables (new / documented)

| Variable | Default (production) | Purpose |
|----------|----------------------|---------|
| `MEDIA_SCANNER_STRICT_MODE` | `true` | Fail closed when scanners unavailable |
| `MEDIA_SCANNER_ALLOW_NOOP` | `false` | Dev noop passes |
| `MEDIA_SCANNER_ALLOW_NOOP_PRODUCTION_ACK` | unset | Required ack for production noop |
| `MEDIA_POLICY_MODE` | `community_only` | `community_only` \| `attested_explicit_beta` \| `explicit_enabled` |
| `C2K_ALLOW_EXPLICIT_MEDIA` | `false` | Operator flag (alias `ALLOW_EXPLICIT_MEDIA`) |
| `C2K_ALLOW_NUDITY` | `false` | Adult non-explicit gate |

### API routes (T&S-4B)

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/v1/moderation/trust-safety/config` | Platform mod |
| `GET` | `/api/v1/moderation/media-hash-list` | Platform mod |
| `POST` | `/api/v1/moderation/media-hash-list` | Platform mod (requires `reasonCode`) |

Dashboard `GET /api/v1/moderation/dashboard` includes `trustSafety.mediaPolicy` and `trustSafety.mediaScanner`.

### Verification

```bash
npm run verify:trust-safety:scanners
npm run verify:trust-safety:media-policy
npm run verify:trust-safety:legal-profile
npm run verify:trust-safety   # full local gate when Docker + USE_DATABASE=true
```

### Deferred (T&S-4B session)

| Item | Epic |
|------|------|
| Raw JSON access audit | 4 |
| Re-scan scheduled jobs | 6 |
| Full legal hold enforcement on purge | 9 |
| All classifier mismatch auto-rules | 8 |

---

## T&S-5 implementation — Moderation alpha pass

**Wave:** T&S-5 — unified report intake, scoped mod parity, platform polish  
**Status:** **Complete — mergeable, automation-proven (2026-06-06)**

### Delivered

| Area | Deliverable | Status |
|------|-------------|--------|
| **Canonical intake** | `ReportAction` → `TsReportModal` → `useSubmitReport` → `POST /api/v1/moderation/reports` | Done |
| **Target types** | `education_article`, `media_show`, `media_episode`, `convention_chat_message`, `conversation`, `platform` + legacy aliases | Done |
| **Legacy bridge** | T&S intake mirrors scoped `reports` rows; org `org_moderation_needed` | Done |
| **P0 notify** | BullMQ `p0_report_notify` → `notifyP0ModerationCaseCreated` | Done |
| **Group mod** | PATCH reports, hide, lock, ban list/lift, audit; organizer panel | Done |
| **Event mod** | Host hide/lock on discussion (`event-moderation.ts`) | Done |
| **Convention mod** | Staff hide hub chat message | Done |
| **Platform polish** | Case `hide_content` UI; `report_reviewed` notification; settings `/me/moderation/reports` | Done |
| **Docs** | [`UGC_REPORT_SURFACE_AUDIT.md`](./UGC_REPORT_SURFACE_AUDIT.md), updated [`SCOPED_MODERATION_GAP_AUDIT.md`](../../trust-safety/SCOPED_MODERATION_GAP_AUDIT.md) | Done |
| **Tests** | `moderation-scoped.test.ts`, intake/admin gates, `smoke-moderation-checkpoint.mjs` | Done |

### Deferred (not T&S-5)

| Item | Notes |
|------|-------|
| Group photo upload moderation | Mock-only group tabs |
| Following-feed activity reports | Per-verb wiring |
| Review row reports | No review target type in alpha |
| Public group hub inline mod UI | Organizer panel primary |
| Platform appeals on `moderation_appeals` | Schema only — scoped appeals alpha at `/settings/trust` |

### Verification

```bash
npm run verify:trust-safety          # full Docker gate — PASS 2026-06-06
npm run verify:trust-safety:admin-ui
npm run verify:prelaunch
npm test
npm run build
npm run test:e2e:trust-safety
node scripts/smoke-moderation-checkpoint.mjs
```

**Checkpoint PR title:** *Unify report intake and complete scoped moderation alpha pass*

---

## Remaining alpha gaps (post T&S-5)

Honest inventory for the next waves — not “not started” for the core stack above.

| Gap | Notes |
|-----|-------|
| `users.suspended_at` enforcement | Suspend route writes audit only |
| Platform appeals on `moderation_appeals` | Table exists; no file/resolve API |
| Feed post / profile / event platform `hide_content` | Case + snapshot only |
| Case media reveal API | Web references reveal flow; confirm handler before prod |
| `POST /api/v1/moderation/jobs` | Placeholder — worker marks `COMPLETED`, no analysis |
| PhotoDNA, NCMEC automation, NCII public form | Manual playbooks only |
| Group photo upload moderation | Mock-only group tabs |
| Following-feed activity reports | Per-verb wiring deferred |
| Audit CSV export | T&S-8 |

