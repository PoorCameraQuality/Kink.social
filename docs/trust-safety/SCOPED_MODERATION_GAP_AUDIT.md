# Scoped moderation gap audit (alpha UGC surfaces)

**Last updated:** 2026-06-06  
**Status:** **Moderation alpha pass complete** — canonical `ReportAction` intake, scoped legacy bridge, group/event/convention mod parity, platform T&S polish. See [`../audits/trust-and-safety/UGC_REPORT_SURFACE_AUDIT.md`](../audits/trust-and-safety/UGC_REPORT_SURFACE_AUDIT.md) and [`../audits/trust-and-safety/T&S-IMPLEMENTATION.md`](../audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5.

**Purpose:** Per-surface scorecard. Remaining rows are **deferred** (mock-only or post-alpha), not alpha blockers.

**Related:** [`PILOT_CRITICAL_GAP_AUDIT.md`](../PILOT_CRITICAL_GAP_AUDIT.md) · [`POLICY_COVERAGE_MATRIX.md`](./POLICY_COVERAGE_MATRIX.md) · [`../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md`](../LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md)

**Source of truth:** `@c2k/shared` [`moderation-types.ts`](../../packages/shared/src/moderation-types.ts) · API routes in `packages/api/src/routes/moderation-*.ts`, `group-moderation.ts`, `organization-moderation.ts`, `event-moderation.ts`

**Legend:** ✅ present · ⚠️ partial · ❌ missing · ⏸ deferred / mock-only

## Critical categories (local mods cannot bury)

P0 reasons (`isP0PolicyReason()` in `moderation-types.ts`): `CSAM_SUSPECTED`, `MINOR_SAFETY`, `NCII`, `AI_DEEPFAKE_NCII`, `HIDDEN_CAMERA_LEAKED`, `TRAFFICKING_COERCION` → BullMQ `p0_report_notify` + platform T&S visibility. Minor-safety/CSAM also route to `MINOR_SAFETY_RESTRICTED` queue (site-admin ACL on list).

Other critical categories (high severity, platform escalation): doxing/outing, threats, commercial sex solicitation, illegal goods, leadership abuse, staff/mod/organizer impersonation (coercion/scam), cross-scope patterns.

---

## Canonical intake (all surfaces)

| Step | Implementation |
|------|----------------|
| UI | `ReportAction` → `TsReportModal` (or `PlatformReportForm` on `/support`) |
| API | `POST /api/v1/moderation/reports` — body: `targetType`, `targetId`, `policyReason` (or legacy `category`) |
| Taxonomy | 15 `PolicyReason` values; `severityForPolicyReason()` + `queueForPolicyReason()` at intake |
| Reporter history | `GET /api/v1/me/moderation/reports` |
| Legacy alias | `POST /api/v1/reports` delegates to same intake (`ecosystem-stubs.ts`) |

**Accepted target types** (`moderation-ts-target-validate.ts`): `profile`, `profile_photo`, `post`, `comment`, `message`, `group`, `group_thread`, `group_reply`, `organization`, `org_chat_message`, `org_forum_thread`, `org_forum_reply`, `event`, `convention`, `vendor`, `presenter`, `media_asset`, `education_article`, `media_show`, `media_episode`, `convention_chat_message`, `conversation`, `platform` (+ legacy aliases e.g. `feed_post` → `post`).

---

## Surface scorecard (post alpha pass)

| Surface | Route | Report | Local hide/remove | Lock thread | Scope ban | Escalate platform | Actions audited | Notes |
|---------|-------|--------|-------------------|-------------|-----------|-------------------|-----------------|-------|
| Platform support | `/support` | ✅ `ReportAction` / `PlatformReportForm` → canonical intake | n/a | n/a | n/a | ✅ default | ✅ cases | `targetType: platform` |
| User profile | `/profile/:username` | ✅ `TsReportModal` / `ReportAction` | ❌ platform-only | n/a | n/a | ✅ | ✅ cases | Profile hide deferred (policy) |
| Profile photos | Photos tab | ✅ `media_asset` / `profile_photo` | ✅ platform T&S (`hide_content`, `remove_media`) | n/a | n/a | ✅ | ✅ | MEDIA-MOD-MINIMUM |
| Group forum | `/groups/:id` | ✅ `ReportAction` | ✅ `POST .../forum/posts/:id/hide` | ✅ `POST .../threads/:id/moderate` | ✅ `POST/DELETE .../bans` | ✅ | ✅ `GET .../moderation/audit` | Scoped inbox: `GET/PATCH .../reports` |
| Org forum / chat | `/orgs/:slug` | ✅ `ReportAction` | ✅ org panel + hub hide | ✅ slow mode + lock | ✅ org panel bans | ✅ escalate | ✅ org audit | |
| Event discussion | `/events/:id` | ✅ `ReportAction` | ✅ `POST .../forum/posts/:id/hide` | ✅ `POST .../threads/:id/moderate` | ⏸ | ✅ | ✅ | Host UI via API; no scope ban |
| Feed post | `/home`, saved | ✅ `ReportAction` (api posts) | platform T&S | n/a | n/a | ✅ | ✅ cases | |
| Education / media | `/education`, `/media` | ✅ `ReportAction` | platform T&S | n/a | n/a | ✅ | ✅ cases | `education_article`, `media_show`, `media_episode` |
| Presenters / people | `/presenters`, `/people` | ✅ `ReportAction` | platform T&S | n/a | n/a | ✅ | ✅ cases | |
| DMs | `/messaging` | ✅ `message` + `conversation` | ⏸ block only | ⏸ | block | ✅ | ✅ cases | No mod hide of DMs |
| Convention hub chat | `/conventions/:slug` | ✅ `ReportAction` (`convention_chat_message`) | ✅ `POST .../messages/:id/hide` | ⏸ | ⏸ | ✅ | ✅ | No convention scope_bans |
| Convention gallery | conv gallery | ⚠️ C213 path | ⚠️ staff approve/reject | n/a | ⏸ | ✅ | ⚠️ | Separate from UGC report pass |
| Group photos / channels | mock slug tabs | ⏸ deferred | ⏸ mock-only | ⏸ | ⏸ | ⏸ | ⏸ | Documented in UGC audit |

---

## Platform T&S API (moderation-ts routes)

| Method | Path | Role |
|--------|------|------|
| `POST` | `/api/v1/moderation/reports` | Member report intake |
| `GET` | `/api/v1/me/moderation/reports` | Reporter history |
| `GET` | `/api/v1/moderation/dashboard` | Open cases, queue counts, T&S config snapshot |
| `GET` | `/api/v1/moderation/queues` | Queue list (`MINOR_SAFETY_RESTRICTED` site-admin only) |
| `GET/PATCH` | `/api/v1/moderation/cases`, `/cases/:id` | Case list, assign, status |
| `POST` | `/api/v1/moderation/cases/:id/notes` | Internal notes |
| `POST` | `/api/v1/moderation/cases/:id/actions` | `hide_content`, `escalate`, `remove_media`, `restore_media`, close paths |
| `GET` | `/api/v1/moderation/cases/:id/media-content` | Privileged media view (audited) |
| `GET/POST` | `/api/v1/moderation/actions` | Rule-of-two proposals + approve/reject |
| `GET` | `/api/v1/moderation/trust-safety/config` | Media policy + scanner config (read-only) |
| `GET/POST` | `/api/v1/moderation/media-hash-list` | SHA-256 deny/review governance |

Web console: `/moderation/dashboard`, `/queues`, `/cases`, `/cases/:caseId`, `/actions`, `/audit`, `/dmca`, `/legal`.

---

## Minimum alpha requirement checklist

| Requirement | Status |
|-------------|--------|
| Report on every **live API-backed** UGC surface | ✅ See UGC audit; mock-only tabs deferred |
| Platform T&S visibility / escalation | ✅ Cases + `/moderation/cases` + queues |
| Local hide/remove where scope owner exists | ✅ Org, group, event host, convention chat |
| Scope remove/ban where membership exists | ✅ Org + group; event/convention partial by design |
| Audit trail for moderator actions | ✅ Org + group audit; platform case timeline + `moderation_audit_events` |
| Critical-category escalation | ✅ P0 policy routing + `p0_report_notify` job |
| Scoped legacy inbox bridge | ✅ T&S intake → `reports` for org/group/event |
| Reporter feedback on resolve | ✅ `report_reviewed` notification |

---

## Completed (2026-06-06 moderation alpha pass)

1. ✅ Canonical **`ReportAction`** + **`POST /api/v1/moderation/reports`** on all API-backed UGC surfaces  
2. ✅ Legacy scoped bridge so org/group/event inboxes receive member reports  
3. ✅ Group moderator parity (triage, hide, lock, ban/lift, audit panel)  
4. ✅ Event host hide/lock on discussion threads/posts  
5. ✅ Convention staff hide on hub chat messages  
6. ✅ P0 platform notify job + org `org_moderation_needed` on scoped intake  
7. ✅ Platform case **`hide_content`** UI + reporter history via `/me/moderation/reports`  
8. ✅ Gate: `npm run verify:trust-safety` (after `--test-force-exit` fix on unit step)

---

## Remaining deferrals (not alpha blockers)

- Group photo upload moderation (mock-only group tabs)
- Following-feed activity card reports (per-verb wiring)
- Org/presenter review row reports (no review target type)
- Full appeals UI (`moderation_appeals` schema only; scoped standing appeals partial)
- ML classifiers, PhotoDNA, NCMEC API
- Profile (non-media) platform hide pending counsel
- Public group hub inline mod controls (organizer panel only today)
- NCII emergency-restrict + hash re-upload workflow (reasons/queues shipped; workflow not built)
- UI-2 polish: scanner health panel, hash-list admin UI, re-scan controls

---

## Verification

```bash
npm run verify:trust-safety
npm run verify:trust-safety:admin-ui
node scripts/smoke-moderation-checkpoint.mjs   # dev stack + seed
```

Log: [`../audits/trust-and-safety/verify-trust-safety.log`](../audits/trust-and-safety/verify-trust-safety.log)
