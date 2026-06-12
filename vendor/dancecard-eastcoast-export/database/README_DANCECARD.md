# Dancecard SQL

- `dancecard_000_schema.sql` — creates all `dancecard_*` tables (idempotent `IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`).
- `dancecard_002_staff_gate.sql` — `staff_access_code`, `is_staff`.
- `dancecard_003_selection_notes.sql` — selection notes column.
- `dancecard_004_organizers.sql` — `dancecard_event_organizers` (links `auth.users` to events), `registration_access_code` on `dancecard_events`. After apply, grant access with `INSERT INTO dancecard_event_organizers (event_id, user_id, role) VALUES (...)` (see commented example in that file).
- `dancecard_seed_paf26_demo.sql` — upserts event `paf26` with a May 2026 window. Program rows come from `data/paf26-program-slots.json` via `npm run dancecard:import` (see first-run doc).

See [docs/dancecard-first-run.md](../docs/dancecard-first-run.md) for apply order and smoke tests.
