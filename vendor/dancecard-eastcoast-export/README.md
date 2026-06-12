# Dancecard — export from East Coast Kink Events (Next.js)

This folder is a **portable snapshot** of everything that implemented the **multi-event dancecard** feature in the `EastCoast-master` repo (Next.js 14, App Router, Supabase). It was copied here on **2026-04-24** so **Coast to Coast Kink** can reuse the same infrastructure later.

The live Coast site is a **different stack** (this monorepo: `packages/web`, `packages/api`, etc.). Treat this tree as **reference source**, not a drop-in: you will merge routes, components, and SQL into whatever framework you standardize on, or host a small Next sub-app.

---

## What the dancecard did (product)

- **Public `/dancecard/[eventSlug]`** — festival program, “My dancecard” selections, staff-shift autofill hints, mutual free-time with share links, reservations, `.ics` export.
- **Share URLs** — `/dancecard/[eventSlug]/s/[token]` for comparing calendars / booking mutual holds.
- **Organizer `/organizer/dancecard/[eventSlug]`** — edit program slots and staff shifts (Supabase `auth.users` + `dancecard_event_organizers` gate).
- **Organizer login** — `/organizer/login` (minimal page; default redirect pointed at PAF26 demo).

Data lived in **Supabase Postgres** (`dancecard_*` tables). There was **no live Google Sheets** integration; program/staff came from **JSON/XLSX import scripts** and optional PAF26 parsers.

---

## Folder layout (this export)

| Path | Purpose |
|------|---------|
| `src/app/dancecard/` | Public pages (`page.tsx`, share token page). |
| `src/app/api/dancecard/` | REST-style JSON API for the dancecard client (schedule, auth, selections, share, ICS, …). |
| `src/app/api/organizer/dancecard/` | Organizer CRUD for program slots + staff shifts. |
| `src/app/organizer/dancecard/` | Organizer UI layout + `OrganizerDancecardClient`. |
| `src/app/organizer/login/` | Organizer login shell used for dancecard admin. |
| `src/components/dancecard/` | All client UI (grid, lists, mutual availability, API helper). |
| `src/lib/dancecard/` | Shared server/client logic: schemas, session cookies, ICS builder, organizer auth, staff schedule types, colors. |
| `database/` | Idempotent SQL: schema `000`, staff `001`, gate `002`, selection notes `003`, organizers `004`, PAF26 seed `*_seed_paf26_demo.sql`, plus `README_DANCECARD.md`. |
| `supabase/migrations/` | Two timestamped migrations that mirror later SQL (staff shifts + gate/notes). |
| `scripts/` | Smoke test, production verify, schedule/staff import, PAF26 Grid → JSON, staff XLSX → JSON, apply-migrations helper, add-organizer helper, optional repair script. |
| `data/` | Example **`paf26-program-slots.json`** and **`paf26-staff-volunteer-shifts.json`** (large; safe to delete for a fresh event if you replace with your own). |
| `FILE_MANIFEST.txt` | Flat list of every file in this export. |
| `INTEGRATION_HOOKS.md` | Non-dancecard files in the original app that referenced dancecard (header, banner, nav). |
| `package.json.fragment.json` | `scripts` entries and NPM dependencies the dancecard feature expected in the original project. |

**Single-file bundle:** sibling archive `../dancecard-eastcoast-export.zip` (same contents as this directory).

---

## Database apply order (Supabase / psql)

1. `database/dancecard_000_schema.sql`
2. `database/dancecard_001_staff_shifts.sql`
3. `database/dancecard_002_staff_gate.sql`
4. `database/dancecard_003_selection_notes.sql`
5. `database/dancecard_004_organizers.sql`
6. Optional demo event: `database/dancecard_seed_paf26_demo.sql`

See `docs/dancecard-first-run.md` for env vars, smoke test, and import commands.

---

## Environment variables (original app)

From the parent project’s `.env.example` (dancecard slice):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — required for API routes and import scripts.
- Optional: `NEXT_PUBLIC_SITE_URL` — canonical origin for share links behind proxies.
- Optional dev-only: `DANCECARD_ORGANIZER_DEV_BYPASS=1` — skip organizer auth in `next dev`.

Optional: `DATABASE_URL` for `apply-dancecard-migrations.mjs` if you run SQL via Postgres instead of the Supabase SQL editor.

---

## NPM scripts (merge into your app’s `package.json`)

See `package.json.fragment.json` in this folder.

---

## Known limitations (carry forward intentionally)

- **Staff XLSX → JSON** (`paf26-staff-schedule-to-json.mjs`): merged/empty cells can produce **over-long shifts** for some roles until parser rules are tightened; Build Crew times can differ by ~30 minutes from prose schedules depending on column alignment.
- **Program import** (`dancecard-import-schedule.mjs`): full **delete + insert** per event; user selections reference `slot_id` with `ON DELETE CASCADE` — frequent full reimports can wipe picks unless you add stable external IDs / upsert strategy.
- **Post-process typo**: script maps `Adrienne / Athena516` → `Athena816`; fix in script if you still use that path.

---

## Licensing / attribution

Original application: **East Coast Kink Events** codebase. Reuse in Coast to Coast Kink should follow whatever license / ownership applies to the parent `coast-to-coast-kink` repo and your agreements with contributors.

---

## Next steps for C2C

1. Decide whether dancecard stays **Next.js** (e.g. subdomain or `packages/dancecard-site`) or is **ported** to `packages/web` (Vite/React) — the latter means reimplementing route handlers against your `packages/api` or Supabase directly.
2. Copy `src/` subtrees into the chosen app and fix **import aliases** (`@/` → your alias).
3. Apply SQL + wire env vars; run imports with your event slug and JSON.
4. Reapply **layout hooks** from `INTEGRATION_HOOKS.md` (hide site header on dancecard, nav link, support banner).

Questions about behavior: read `docs/dancecard-first-run.md` and inline comments in `src/lib/dancecard/routeCommon.ts`.
