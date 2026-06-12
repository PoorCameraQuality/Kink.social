# SCOPED-MOD-1 — Lower-tier moderation tools for orgs, groups, events, conventions, scoped UGC

**Backlog ID:** `SCOPED-MOD-1`  
**Status:** **Complete (2026-06-06)** — moderation alpha pass shipped Phases A–E. See [`../audits/trust-and-safety/T&S-IMPLEMENTATION.md`](../audits/trust-and-safety/T&S-IMPLEMENTATION.md) § T&S-5.  
**Builds on:** LEGAL-ALPHA-1 audit/roles, platform T&S stack (T&S-3.5 console, reports, moderation audit)  
**Queue:** [`BACKLOG_QUEUE.md`](../BACKLOG_QUEUE.md) · **Decisions:** [`PROJECT_DECISIONS.md`](../PROJECT_DECISIONS.md) · **Registry:** [`FEATURE_REGISTRY.md`](../FEATURE_REGISTRY.md) § Reports

---

## Product frame

C2K is organizer-first. **Local scope owners** (org admins, group mods, event/convention staff with command-bridge roles) handle day-to-day community hygiene inside their scope. **Platform Trust & Safety** handles serious harm, cross-scope patterns, and legal escalations.

**Extend-before-add:** Used existing org/group moderation panels, `moderation_audit_events`, and platform `/moderation/*` routes. Canonical intake: `ReportAction` → `POST /api/v1/moderation/reports` with legacy inbox bridge — no second moderation stack.

---

## Local scope owners handle

Within org, group, event, or convention boundaries:

| Category | Examples |
|----------|----------|
| Spam / noise | Repetitive promos, bot-like posting, link spam |
| Off-topic | Content outside group/event purpose |
| Local rules | Scope-specific guidelines (see `/policies/groups`, `/policies/events`) |
| Bad-faith participation | Trolling, baiting, rule evasion within scope |
| Scoped bans | Temporary or permanent ban **within that org/group/event/convention** |
| Locks | Thread/topic/channel lock in scoped forums or hub chat |
| Hide / restore | Hide scoped UGC (posts, comments, gallery items) pending review; restore when appropriate |
| Member removals | Remove member from org/group; revoke scoped roles |

Every local action: **role check + required reason + audit log** (extend existing org/group audit APIs).

---

## Platform T&S escalations (must route up)

These categories **always** escalate to platform Trust & Safety — local mods must not unilaterally resolve:

| Category | Notes |
|----------|-------|
| Minor safety | Underage concern, grooming indicators |
| CSAM | Any CSAM signal — human review; no autonomous vendor submission |
| NCII | Non-consensual intimate imagery |
| Doxing | Publishing private identifying information |
| Outing | Non-consensual disclosure of identity/orientation/kink |
| Threats | Credible violence or harm threats |
| Trafficking | Human trafficking indicators |
| Commercial sex | Prostitution / escort solicitation where prohibited |
| Illegal goods | Controlled substances, weapons, other illegal commerce |
| Leadership abuse | Organizer/mod using power for coercion, retaliation, or sexual misconduct |
| Cross-scope patterns | Same actor harming multiple orgs/groups/events |

Routing: serious report categories → platform `/moderation/reports` inbox; link to existing LEGAL-ALPHA-1 legal/DMCA paths where applicable.

---

## Existing stack to extend (do not duplicate)

| Layer | Extend |
|-------|--------|
| Reports | `POST /api/v1/reports`, `PlatformReportForm`, `ContentReportDialog` |
| Org mod | `OrganizerOrgModerationPanel`, org hide/ban APIs |
| Group mod | `OrganizerGroupModerationPanel`, group hide/ban APIs |
| Event/convention | Command-bridge scoped roles; convention hub moderation hooks |
| Platform console | `/moderation/reports`, `/moderation/cases`, `/moderation/audit` |
| Audit | `moderation_audit_events`, org/group `…/moderation/audit` |
| Roles | Platform `SITE_ADMIN` / `TRUST_SAFETY_ADMIN` / `LEGAL_ADMIN`; org/group role matrix |

Optional read-only gate before coding: [`PILOT_CRITICAL_GAP_AUDIT.md`](../PILOT_CRITICAL_GAP_AUDIT.md) — list gaps only; implement **missing minimums**, not a full scoped mod console.

---

## Hard rejects

Do **not** implement unless user explicitly overrides:

| Reject | Why |
|--------|-----|
| PhotoDNA | Enterprise CSAM vendor — hard reject per [`PROJECT_DECISIONS.md`](../PROJECT_DECISIONS.md) |
| NCMEC API | Live submission — placeholders only |
| StopNCII / Take It Down | Fake integrations |
| Explicit media / video expansion | Alpha `community_only`; explicit off |
| Payments / Stripe | No checkout in mod flows |
| Full T&S UI-2 redesign | Basic T&S-3.5 console exists |
| Second report/moderation stack | Extend-before-add |
| Autonomous ML resolution | AI summarizes; humans decide |
| Scoped moderation mega-dashboard | Org/group tabs sufficient for alpha minimum |

---

## Acceptance criteria (when implemented)

1. Every alpha-enabled UGC surface has **report** entry point.
2. Local hide/restore/ban/lock/removal works **in scope** with reason + audit.
3. Serious categories route to **platform T&S** — not silently closed locally.
4. Non-privileged users blocked from platform mod routes.
5. No overclaim of legal hold, instant deletion, or vendor integrations.
6. Green: `verify:trust-safety`, `npm test`, `npm run build`.

---

## Coordinator prompt skeleton (paste-ready)

```text
You are the coordinator for C2K SCOPED-MOD-1.

Project: Coast to Coast Kink — organizer-first adults-only community OS. Alpha posture: community_only. Explicit media off. Extend existing T&S stack; no parallel moderation systems.

Read first:
- docs/plans/SCOPED-MOD-1-ORCHESTRATION.md (this plan)
- docs/BACKLOG_QUEUE.md § SCOPED-MOD-1
- docs/PROJECT_DECISIONS.md (hard rejects, anti-fiddling rule)
- docs/FEATURE_REGISTRY.md § Reports
- docs/LEGAL-PROFILE-TRUST-SAFETY-MASTER-PLAN.md (roles/audit patterns)
- docs/PILOT_CRITICAL_GAP_AUDIT.md (optional — implement only listed gaps)

Prerequisite: LEGAL-ALPHA-1 manual smoke passed and frozen (docs/handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md).

Goal:
Ship lower-tier scoped moderation minimums for orgs, groups, events, conventions, and scoped UGC — local owners handle spam/off-topic/local rules/bad-faith/scoped bans/locks/hide-restore/member removals; platform T&S handles serious escalations.

Scope (extend existing):
- Report everywhere on alpha UGC surfaces
- Local hide/restore, scoped ban, lock, member removal with reason + audit
- Serious category routing to platform /moderation/reports
- Org/group/event/convention role enforcement via existing command bridge

Hard rejects:
- PhotoDNA, NCMEC API, StopNCII, Take It Down
- Explicit media/video expansion, payments, full UI-2
- Second moderation stack; inline ML resolution

Architecture:
- extend-before-add; one users row; side effects via BullMQ after commit
- useApi[Domain].ts hooks before page components
- update authorizeWebSocketSubscribe if WS scopes change

Verify before done:
npm run verify:trust-safety
npm test
npm run build

Do not implement deferred items (scoped analytics, appeals UI per action, bulk actions, permission builder, local policy customization) unless user overrides.
```

---

## Orchestration note

Parallel subagents are **not** recommended for v1. Split by **surface** (org vs group vs event/convention) in sequential PRs. Coordinator-only files: `schema.ts`, `server.ts`, `router.tsx`, `site.config.ts`.

---

## Exit criteria

- ✅ [`BACKLOG_QUEUE.md`](../BACKLOG_QUEUE.md) `SCOPED-MOD-1` → `done` (2026-06-06)
- ✅ Automation: `verify:trust-safety`, `moderation-scoped.test.ts`, `smoke-moderation-checkpoint.mjs`
- ✅ Docs: T&S-5, UGC audit, scoped gap audit, planning brief Phases A–E
- Manual smoke for scoped mod UI optional (API/DB tests cover primary flows)
- No hard-reject items shipped under this ID
