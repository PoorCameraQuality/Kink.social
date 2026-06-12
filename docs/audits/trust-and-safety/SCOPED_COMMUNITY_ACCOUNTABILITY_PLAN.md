# Scoped Community Accountability — Master Plan

**Last updated:** 2026-06-06  
**Status:** Planning / partial existing infrastructure  
**Companion:** [`../../trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](../../trust-safety/SCOPED_MODERATION_GAP_AUDIT.md) · [`COMMUNITY_REPUTATION_MASTER_PLAN.md`](./COMMUNITY_REPUTATION_MASTER_PLAN.md)

---

## Goal

When a user is disruptive or harmful **within** an org, group, event, or convention, consequences should usually be **scoped first**. Cross-scope patterns and serious policy categories escalate to **platform T&S** — never buried by local mods.

Scoped standing must **not** become a public shame score or global reputation penalty.

---

## Scoped standing model (proposed)

| State | Meaning |
|-------|---------|
| `GOOD_STANDING` | Default |
| `NEEDS_ATTENTION` | Mod-visible flag; no public label |
| `LIMITED` | Reduced participation (e.g. slow mode, post restrict) |
| `TIMED_OUT` | Temporary scoped restriction (`scope_bans.expires_at`) |
| `BANNED` | Cannot participate in scope |
| `ESCALATED_TO_PLATFORM` | Platform T&S case linked |

**Scopes:** `organization` · `group` · `event` · `convention`

**Rules:**

- One group ban ≠ platform-wide bad reputation
- `organization_members.local_reputation` stays org-scoped
- `group_reviews` stay group-scoped
- Cross-scope repetition → **private** platform review
- Serious categories → **immediate** platform case (Phase 5)

---

## Consequence ladder (per scope)

| Step | Action |
|------|--------|
| 0 | Observe |
| 1 | Private warning |
| 2 | Content action (hide post/message, lock thread, slow mode) |
| 3 | Timed scoped timeout (`expires_at`) |
| 4 | Scoped ban |
| 5 | Platform escalation (attach/create T&S case) |

Each step requires **reason category** + **audit log**.

---

## Current infrastructure vs gaps

| Capability | Organization | Group | Event | Convention |
|------------|--------------|-------|-------|--------------|
| Report intake | ✅ | ✅ | ⚠️ legacy | ⚠️ varies |
| Hide content | ✅ forum/chat | ⚠️ API thin UI | ❌ discussion | ⚠️ chat hide gap |
| Lock thread | ✅ | ❌ missing | ❌ | ⚠️ |
| Slow mode | ✅ | ⚠️ | — | — |
| Scoped ban | ✅ `scope_bans` | ⚠️ partial | ❌ | ⚠️ no member ban model |
| Timed timeout (`expires_at`) | ⚠️ column exists, underused | ❌ | ❌ | ❌ |
| Audit log | ✅ org audit | ⚠️ thin | ⚠️ | ⚠️ |
| Platform escalation | ✅ | ⚠️ | ⚠️ | ✅ cases |
| Mod UI parity | ✅ `OrganizerOrgModerationPanel` | ❌ read-only/thin | ❌ host mod incomplete | ⚠️ |

Full surface scorecard: [`SCOPED_MODERATION_GAP_AUDIT.md`](../../trust-safety/SCOPED_MODERATION_GAP_AUDIT.md).

---

## Phase 5 — Serious category routing (must not bury)

These **always** create or attach to a platform T&S case:

- `MINOR_SAFETY`, `CSAM_SUSPECTED`, `NCII`, `AI_DEEPFAKE_NCII`, `HIDDEN_CAMERA_LEAKED`
- `CONSENT_SAFETY`, `DOXXING_OUTING`, `HARASSMENT_THREATS`
- `TRAFFICKING_COERCION`, `COMMERCIAL_SEX_SOLICITATION`, `ILLEGAL_GOODS_SERVICES`
- Impersonation of staff/mod/organizer (coercion/scam)
- Cross-scope harm patterns

**Local mods may:** protective action, hide content, temporary restrict, preserve evidence, escalate.  
**Local mods may not:** permanently dismiss serious safety without platform visibility.

T&S-1 intake and policy taxonomy exist; **per-surface routing** (event discussion, group forum, DMs) still has gaps.

---

## Phase 6 — Incident clustering (backlog)

**Proposed tables:** `moderation_incidents`, `incident_reports`, `incident_participants`, `incident_findings`, `incident_actions`

**Dogpile rule:** 30 reports on same subject → **1 incident**, 30 linked reports. Urgency increases; reputation impact comes from **findings**, not raw count.

**Detection signals:** burst timing, identical text, shared cluster, report-after-block, retaliation timing, unrelated reporters over time.

Today: same-reporter 24h dedupe only.

---

## Phase 7 — Messaging health (backlog)

**Table:** `messaging_health_rollups`  
**API:** `GET /api/v1/moderation/users/:userId/messaging-health` (platform mod)

**Rollups:** outbound velocity, unique recipients, similarity, reply ratio, block/mute/report-after-contact, independent reporter count.

**States:** `HEALTHY` · `NEW_LIMITED_HISTORY` · `HIGH_OUTREACH_VOLUME` · `NEEDS_COOLDOWN` · `MOD_REVIEW_RECOMMENDED` · `RESTRICTED`

**Intervention ladder:** internal signal → soft warning → rate limit → DM cooldown → profile gate → scoped timeout → platform review → suspension/ban via T&S only.

No public “spammy” or “blocked by many” labels.

---

## Phase 8 — Anti-retaliation (backlog)

**Audit required for:** warnings, timeouts, bans, standing changes, local reputation deltas, dismissals, escalations, lifts.

**Second approver / platform trigger when:**

- Ban &gt; 30 days
- Repeated ban of same user
- Paid event removal
- Ban of staff/presenter/vendor/organizer
- Ban shortly after criticism of leadership
- Ban shortly after user reported mod
- High volume of actions by one mod

**Appeals:** scoped appeal to org/group owner; platform path for retaliation/discrimination/consent mishandling.

---

## Phase 9 — Appeals, decay, recovery (backlog)

- User-visible restriction notices with appeal path
- `moderation_appeals` schema exists; workflow not implemented
- Signal expiration and overturned findings
- Decay: dismissed reports = no impact; minor warning 3–6mo; severe findings long-retention mod-only

---

## Implementation phases (scoped track)

| Phase | Deliverable |
|-------|-------------|
| **3** | `scoped_standing` model + API per org/group/event/convention |
| **4** | Group parity UI; event discussion hide/lock; `expires_at` timeouts; convention chat hide |
| **5** | Enforce serious-category platform routing on all live surfaces |
| **6** | Incident clustering schema + mod UI |
| **7** | Messaging health rollups + send-time cooldowns |
| **8** | Mod action audit completeness + retaliation heuristics |
| **9** | Appeals + decay jobs |

**Do not** implement Phases 3–9 until Phase 0–1 reputation freeze and public trust model are stable.

---

## Test plan (scoped)

- Scoped warning created and audited
- Timeout respects `expires_at`
- Scoped ban blocks scope only; no public label
- `local_reputation` does not propagate globally without explicit escalation
- Group: triage PATCH, hide, lock, ban/lift
- Event: discussion hide/lock; serious category → platform case
- Incident: N reports → 1 incident; no stacked reputation hits

---

## Related code (extend, do not duplicate)

- `scope_bans`, `organization-moderation.ts`, `group-moderation.ts`
- `moderation_cases`, `moderation_actions`, `moderation-ts` intake
- `organization_members.local_reputation`, `group_reviews`
- `packages/web/src/app/moderation/` — platform console
- Org: `OrganizerOrgModerationPanel`
