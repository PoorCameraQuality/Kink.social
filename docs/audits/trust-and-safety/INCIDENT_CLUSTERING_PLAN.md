# Incident Clustering (Alpha Implementation)

**Status:** Implemented (alpha) — 2026-06-06

On `createReport()` (`moderation-ts-intake.ts`), `attachReportToIncident()`:

- Finds open incident for same `primary_user_id` + `policy_reason` + scope within 7 days
- Attaches `moderation_reports` row via `incident_reports`
- Tracks independent vs repeat reporters via `incident_participants`
- Platform-critical reasons (`isPlatformCriticalPolicyReason`) set `platform_escalated_at`

**Dogpile rule:** Multiple reports → one incident; impact from findings, not raw count.

**Mod UI:** Trust summary panel shows open incidents + linked report counts.

**Deferred:** Identical-text burst detection, social-cluster graph, finding → `trust_signal_events` automation.
