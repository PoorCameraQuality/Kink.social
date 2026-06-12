# Pilot critical gap audit — stop-check before scoped mod build

**Last updated:** 2026-06-06  
**Status:** **Moderation alpha pass complete** — per-surface minimums shipped; product LEGAL-ALPHA-1 manual freeze pending owner walkthrough.

**Purpose:** Read-only gate before any **SCOPED-MOD-MINIMUM** implementation. Do not launch a full scoped moderation console until this audit is complete and gaps are explicitly listed.

**Related:** [`PILOT_READINESS.md`](./PILOT_READINESS.md) · [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) § Reports · [`plans/SCOPED-MOD-1-ORCHESTRATION.md`](./plans/SCOPED-MOD-1-ORCHESTRATION.md) · [`PROJECT_DECISIONS.md`](./PROJECT_DECISIONS.md) (anti-fiddling rule) · [`trust-safety/POLICY_COVERAGE_MATRIX.md`](./trust-safety/POLICY_COVERAGE_MATRIX.md) · [`trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](./trust-safety/SCOPED_MODERATION_GAP_AUDIT.md)

**Output artifact:** Completed checklist tables in this file **or** the linked scoped moderation gap audit with pass/fail/gap per UGC surface.

---

## When to run

| Trigger | Action |
|---------|--------|
| Before **SCOPED-MOD-1** / **SCOPED-MOD-MINIMUM** worker | Full audit (steps 1–5) |
| After enabling a new UGC surface for alpha | Re-run step 3–5 for that surface only |
| After LEGAL-ALPHA-1 manual smoke pass | Mark LEGAL-ALPHA-1 **frozen** — no further legal/compliance feature work unless blocker |

---

## Step 1 — Manual smoke LEGAL-ALPHA-1

**Status:** LEGAL-ALPHA-1 is **functionally landed** (2026-06-05). **Engineering gates green** (2026-06-06). Freeze after product manual smoke pass.

Follow [`handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md`](./handoff/LEGAL-ALPHA-1-MANUAL-SMOKE.md). Automated coverage: `packages/api/src/test/legal-alpha.test.ts` (in `verify:trust-safety`); UI: `e2e/legal-alpha-smoke.spec.ts` (run via `npx playwright test e2e/legal-alpha-smoke.spec.ts` — not in default `verify:alpha` E2E slice).

**Exit:** All public policy routes load; signup/footer links work; admin legal/DMCA/settings privacy flows work for a privileged test account; no 404/500 on listed routes.

| Check | Owner | Pass | Date / notes |
|-------|-------|------|--------------|
| Public policy pages (footer + direct URL) | Product | ☐ | Automated: `legal-alpha-smoke.spec.ts` — owner sign-off pending |
| Signup terms/age links | Product | ☐ | Automated: `legal-alpha-smoke.spec.ts` — owner sign-off pending |
| `/settings/privacy` export/delete foundation | Product | ☐ | Automated: `legal-alpha-smoke.spec.ts` + `legal-alpha.test.ts` — owner sign-off pending |
| `/moderation/legal` + `/moderation/dmca` (staff) | Product | ☐ | Automated: `legal-alpha-smoke.spec.ts` + `legal-alpha.test.ts` — owner sign-off pending |
| Automated gates still green | Engineering | ☑ | `verify:prelaunch`, `verify:alpha:auto`, `verify:trust-safety` (2026-06-06) |

---

## Step 2 — Confirm no broken legal / admin / settings flows

Spot-check that LEGAL-ALPHA-1 did not regress adjacent surfaces:

| Area | Route / API | Pass | Notes |
|------|-------------|------|-------|
| Platform moderation shell | `/moderation/*` | ☑ | `e2e/moderation-ts.spec.ts` + `smoke-moderation-checkpoint.mjs` (2026-06-06) |
| Org moderation tab | `/organizer/orgs/:slug?tab=moderation` | ☑ | Route smoke + alpha-flows (no TODO strings) |
| Group moderation tab | `/organizer/groups/:id?tab=moderation` | ☑ | `moderation-scoped.test.ts` group mod API; organizer panel shipped |
| Settings support | `/settings` → Support / reports history | ☑ | `smoke-moderation-checkpoint.mjs` → `GET /api/v1/me/moderation/reports` |
| Support hub | `/support` | ☑ | `ReportAction` / canonical intake — see [`trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](./trust-safety/SCOPED_MODERATION_GAP_AUDIT.md) |
| Login/signup | `/login` | ☑ | `e2e/auth.spec.ts` + `legal-alpha-smoke.spec.ts` age/terms links |

---

## Step 3 — Alpha UGC surface inventory

Cross-reference [`FEATURE_REGISTRY.md`](./FEATURE_REGISTRY.md) § Reports and [`PILOT_READINESS.md`](./PILOT_READINESS.md) pilot path. Mark each surface **enabled for alpha** vs **disabled / ComingSoon / out of pilot scope**.

| Surface | `targetType`(s) | Alpha enabled? | Primary UI location | Registry ref |
|---------|-----------------|----------------|---------------------|--------------|
| Platform support | `platform` | ☑ | `/support` | FEATURE_REGISTRY § Reports |
| Org forum | `org_forum_thread`, `org_forum_post` | ☑ | Org hub Forums | FEATURE_REGISTRY § Org ecosystem |
| Org hub chat | `org_channel_message` | ☑ | Org hub Channels | Pilot path § hub comms |
| Convention hub chat | (via org/hub channels) | ☑ | `/conventions/:slug` Chat | PILOT_READINESS C212–C214 |
| Group forum | `group_forum_thread`, `group_forum_post` | ☑ | Group detail Forums | FEATURE_REGISTRY § Reports |
| Event discussion | `event_discussion_thread`, `event_discussion_post` | ☑ | Event detail Discussion | pass 23 |
| Home / Following feed | `feed_post` | ☑* | `/home` | *Shipped F1–F5; not pilot-critical |
| Profile | `profile` | ☑ | Public profile | FEATURE_REGISTRY |
| Education article | `education_article` | ☑ | `/education/:slug` | Educator contributions |
| Media show / episode | `media_show`, `media_episode` | ☐ defer | `/media` | Alpha posture: community_only; report path exists — enable UI when ready |
| Convention gallery | (gallery moderation — separate path) | ☑ | Convention hub Gallery | C213 staff approve/reject; partial vs full UGC report pass |
| Presenter / vendor photos | `media_assets` / profile photos | ☑ | Profile / settings | T&S upload pipeline + `verify:trust-safety:media` |
| Direct messages | `conversation`, message | ☑ | `/messaging` | Report path shipped; block-only local mod (no DM hide) |

**Auditor:** Adjust ☑/☐ after product sign-off. Disabled surfaces must not accept public UGC in prod builds.

---

## Step 4 — Per-surface minimum checklist

For each **alpha-enabled** row in step 3, verify five minimums. **Gap** = any ☐ that blocks safe alpha operation.

| Minimum | Question |
|---------|----------|
| **Report exists** | Can a member (or guest where allowed) file `POST /api/v1/reports` for this content? UI: `ContentReportDialog`, `PlatformReportForm`, or equivalent? |
| **Local hide/remove** | Can org/group/event owner or moderator hide or remove content **in scope** without platform staff? |
| **Platform escalation** | Do serious categories (minor safety, NCII, illegal, credible threat) route to platform T&S inbox or escalation path? |
| **Audit exists** | Are hide/remove/ban/escalation actions written to scoped or platform audit (`moderation_audit_events`, org/group audit APIs)? |
| **Serious category routing** | Is category mapping documented and tested for this `targetType`? |

### Per-surface scorecard (2026-06-06 — synced with [`trust-safety/SCOPED_MODERATION_GAP_AUDIT.md`](./trust-safety/SCOPED_MODERATION_GAP_AUDIT.md))

| Surface | Report | Local mod | Platform escalate | Audit | Serious routing | Gap summary |
|---------|--------|-----------|-------------------|-------|-----------------|-------------|
| Platform `/support` | ☑ | n/a | ☑ | ☑ | ☑ | — |
| Org forum | ☑ | ☑ | ☑ | ☑ | ☑ | — |
| Org / hub chat | ☑ | ☑ | ☑ | ☑ | ☑ | — |
| Convention hub chat | ☑ | ☑ | ☑ | ☑ | ☑ | No convention scope_bans by design |
| Group forum | ☑ | ☑ | ☑ | ☑ | ☑ | — |
| Event discussion | ☑ | ☑ | ☑ | ☑ | ☑ | Host hide/lock; no scope ban |
| Feed post | ☑ | n/a | ☑ | ☑ | ☑ | Platform T&S only |
| Profile | ☑ | n/a | ☑ | ☑ | ☑ | Profile hide deferred (policy) |
| Education article | ☑ | n/a | ☑ | ☑ | ☑ | Platform T&S |
| Convention gallery | ⚠️ | ⚠️ | ☑ | ⚠️ | ☑ | C213 approve/reject path; separate from canonical report pass |
| Presenter/vendor media | ☑ | ☑ | ☑ | ☑ | ☑ | Platform T&S + media pipeline |
| DMs | ☑ | ⚠️ | ☑ | ☑ | ☑ | Block only; no mod hide of DMs |

---

## Step 5 — Build only missing minimums

**Do not** implement a full scoped moderation dashboard, local queues, appeals UI, analytics, or permission builder as part of this gate.

| Audit outcome | Next action |
|---------------|-------------|
| All alpha surfaces pass step 4 | ☑ **2026-06-06** — mark **PILOT-GAP-AUDIT-1** done; **SCOPED-MOD-1** closed (no SCOPED-MOD-MINIMUM gaps) |
| One or more gaps | Queue **SCOPED-MOD-MINIMUM** items — **only** the missing rows from step 4 scorecard |
| New surface enabled for alpha | Re-run step 4 for that surface before ship |

Implementation scope for gaps: see [`plans/SCOPED-MOD-1-ORCHESTRATION.md`](./plans/SCOPED-MOD-1-ORCHESTRATION.md) — **SCOPED-MOD-MINIMUM** section only.

---

## Sign-off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Product | | | LEGAL-ALPHA-1 manual smoke + UGC inventory — automated coverage green; owner walkthrough pending |
| Engineering | | **2026-06-06** | `verify:alpha:auto`, `verify:trust-safety`, `smoke-moderation-checkpoint.mjs`, `moderation-scoped.test.ts` |
| Trust & Safety | | **2026-06-06** | P0 routing + restricted queue — see scoped gap audit |

**After sign-off:** Update [`BACKLOG_QUEUE.md`](./BACKLOG_QUEUE.md) — `PILOT-GAP-AUDIT-1` → `done`; `SCOPED-MOD-1` → `done` (2026-06-06).

### Verification commands

```bash
npm run verify:alpha              # prelaunch + alpha-gate E2E + pilot smokes (incl. smoke-reports.mjs)
npm run verify:trust-safety         # moderation-scoped, legal-alpha, intake DB tests
node scripts/smoke-moderation-checkpoint.mjs
npx playwright test e2e/legal-alpha-smoke.spec.ts   # LEGAL-ALPHA-1 UI (not in alpha-gate slice)
```
