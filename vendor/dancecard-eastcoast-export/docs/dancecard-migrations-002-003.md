# Dancecard migrations 002–003

## Option A — npm script (uses `DATABASE_URL` from `.env.local`)

1. In Supabase Dashboard → **Project Settings** → **Database**, copy the **URI** connection string (includes the DB password).
2. Add to `.env.local`: `DATABASE_URL=<paste URI>`
3. From repo root:

```bash
npm install
npm run dancecard:apply-migrations
```

## Option B — Supabase CLI (linked project)

If the project is linked (`supabase link`):

```bash
npx supabase db push
```

That applies pending files under `supabase/migrations/`, including `20260422140000_dancecard_staff_gate_selection_notes.sql`.

## Option C — Supabase SQL editor (in order)

1. `database/dancecard_002_staff_gate.sql` — adds `staff_access_code` on `dancecard_events`, `is_staff` on `dancecard_accounts`, and seeds `paf26` with default code `PAF26-STAFF-2026` (change after apply if needed).
2. `database/dancecard_003_selection_notes.sql` — adds `note` on `dancecard_selections`.

## Staff JSON re-import (after parser changes)

From repo root with `.env.local` pointing at the correct Supabase project:

```bash
npm run dancecard:parse-staff-paf26 -- "path/to/PAF 26 Staff & Volunteer Schedule.xlsx"
npm run dancecard:import-staff -- --slug paf26 --json data/paf26-staff-volunteer-shifts.json
```

## Un-pause event (when ready)

```sql
UPDATE dancecard_events SET status = 'published' WHERE slug = 'paf26';
```
