# Trust Signal Schema (Alpha)

**Last updated:** 2026-06-06

Tables added in `packages/api/src/db/schema.ts` + `apply-incremental-migration.ts`:

| Table | Purpose |
|-------|---------|
| `trust_signal_events` | Append-only accountability signals |
| `trust_signal_rollups` | Per-user/per-scope materialized rollups |
| `moderation_incidents` | Incident clustering spine |
| `incident_reports` | Links reports to incidents |
| `incident_participants` | Accused/reporter/witness roles (mod-only) |
| `incident_actions` | Actions taken on incidents |
| `messaging_health_rollups` | Private DM accountability metrics |
| `messaging_restrictions` | Active DM cooldowns/rate limits |
| `scoped_standing_events` | Org/group/event/convention standing history |
| `scoped_moderation_appeals` | Scoped restriction appeals |

**Legacy frozen:** `profiles.trust_score`, `profile_reputation_events` — not extended.

**Public lane:** `GET /api/v1/users/:userId/community-trust`, `GET /api/v1/profile/:username/community-trust`

**Private lane:** `GET /api/v1/moderation/users/:userId/trust-summary`
