# MEDIA-MOD-MINIMUM — orchestration

**ID:** `MEDIA-MOD-MINIMUM`  
**Status:** Done — platform T&S media viewer + remove/keep/restore actions shipped (MEDIA-MOD-MINIMUM)  
**Priority:** P0/P1 operational gap (not UI-2, not full scoped-mod console)

**Problem (plain English):** T&S case detail is a **case/triage system**, not a **media moderation tool**. Mods see metadata and scanner signals but cannot view quarantined bytes or take real actions on `media_asset` targets. “Reveal snapshot” unblurs metadata text and logs a stub — not the file.

**Verdict:** Legitimate build under anti-fiddling rules (#2 reduces safety risk, #6 makes built feature usable). **Legal/policy stays frozen.** **SCOPED-MOD-1 stays gated.** This is a **narrow platform T&S slice** for media only.

---

## Build (tight scope)

### 1. Mod-only quarantine media viewer

- Signed, short-lived URL to quarantined object (MinIO/S3 prefix)
- Step-up required (reuse LEGAL-ALPHA step-up foundation)
- Audit event when **actual file bytes** are accessed (`media.viewed_by_moderator` or extend case events — **not** metadata blur)
- Solo-alpha: action audit matters more than access audit, but real viewer should still log view for when team grows

### 2. Real media asset actions (case-linked)

| Action | Effect |
|--------|--------|
| **Keep quarantined** | No public URL; case note + audit; close or leave open per policy |
| **Remove asset** | `upload_status` → `REMOVED`; storage state → `REMOVED_PRIVATE`; unlink profile photo if linked |
| **Restore / approve** | Only when policy allows (not for denylist hash / RED lane without override) |
| All | Require **reason**; write **audit event** with actor, target, action, case id |

Wire via extend `executeModerationCaseAction` / new `remove_media_asset` action — **do not** duplicate moderation stack.

### 3. UI cleanup

- Remove misleading **“Reveal snapshot”** for media (metadata panel is not a reveal)
- Label panel **“Metadata snapshot”** always visible (no fake blur/reveal on text)
- **“View quarantined media”** button only when viewer API exists
- Case guidance copy (inline help):
  - **Denylist hash match** → can action without viewing
  - **Member-reported / ambiguous** → require viewer before “no violation”

### 4. Explicitly out of scope

- Full moderation dashboard, bulk actions, analytics
- ML classifiers, PhotoDNA, NCMEC, StopNCII
- Appeals UI, scoped-mod console (orgs/groups/events)
- Beautiful redesign / T&S UI-2

---

## Gate

| Condition | Build? |
|-----------|--------|
| Profile/gallery upload + report path live for pilot | **Yes** |
| Media reports disabled / media show only | **No** — backlog only |
| Denylist-only scanner cases, no member photo reports | **Defer viewer**; still wire **remove/keep quarantined** if cases exist |

---

## Verification

- Extend `legal-alpha.test.ts` pattern or new `media-mod-minimum.test.ts` (DB): remove sets `REMOVED`, viewer requires step-up, audit row
- Manual: open media case → view quarantined file → remove with reason → asset gone from profile
- `npm run verify:trust-safety`, `npm test`, `verify:prelaunch`

---

## Key files (expected touch)

- `packages/api/src/lib/moderation-ts-admin.ts` — `media_asset` actions
- `packages/api/src/lib/media-pipeline.ts` or `media-asset-service.ts` — quarantine signed URL
- `packages/api/src/routes/moderation-ts-admin.ts` — viewer + action routes
- `packages/web/src/app/moderation/cases/[caseId]/page.tsx` — UI cleanup + actions
- `packages/web/src/hooks/useApiModerationTs.ts`

**Related:** [`trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](../trust-safety/SCOPED_MODERATION_GAP_AUDIT.md) · [`audits/trust-and-safety/MODERATOR_WORKFLOW.md`](../audits/trust-and-safety/MODERATOR_WORKFLOW.md)
