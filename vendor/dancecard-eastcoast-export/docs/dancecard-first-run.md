# Dancecard — first run & operations

## One-time database setup (Supabase)

1. In the Supabase SQL editor (or `psql`), run in order:
   - [`database/dancecard_000_schema.sql`](../database/dancecard_000_schema.sql)
   - [`database/dancecard_seed_paf26_demo.sql`](../database/dancecard_seed_paf26_demo.sql)
2. Confirm tables exist: `dancecard_events`, `dancecard_program_slots`, `dancecard_accounts`, …

## Supabase CLI (optional)

The repo includes [`supabase/config.toml`](../supabase/config.toml) from `supabase init` so you can use the [Supabase CLI](https://supabase.com/docs/guides/cli) for `db pull`, migrations, and local stacks.

On your machine (no secrets committed):

```bash
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` is the subdomain of your project URL (`https://YOUR_PROJECT_REF.supabase.co`). Linking may prompt for the **database password** (set under Project Settings → Database; it is **not** the anon or service_role API keys).

**Direct Postgres** (`postgresql://postgres:…@db.YOUR_PROJECT_REF.supabase.co:5432/postgres`) is only for tools like `psql`; keep the password out of git and chat logs.

For **Next.js / Vercel**, continue to use **Project URL** + **anon/publishable** + **service_role/secret** from **Project Settings → API**, copied into `.env.local` / Vercel env vars as documented below.

## Local environment

Copy [`.env.example`](../.env.example) to `.env.local` and set at minimum:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose to the browser)

Optional:

- `NEXT_PUBLIC_SITE_URL` — canonical origin for share links if the request host behind a proxy is wrong.

## Run the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dancecard/paf26`. After SQL setup you still need to **import the program** (next section) before the Program tab lists sessions. **Official program** (organizer Grid workbook): [Google Sheets — Grid](https://docs.google.com/spreadsheets/d/14gT9gufCcbHoDtabJeGSRSAkwhiEFUfGdDQcw-2Ju1U/edit?gid=1445461642#gid=1445461642). **Personal dancecard:** registered users click classes on the Program tab to add or remove them; open **My dancecard** to see the list (titles, times, rooms) and optional manual busy blocks.

## Automated smoke

With dev server running:

```bash
npm run dancecard:smoke
```

Optional: `DANCECARD_SMOKE_URL=http://127.0.0.1:3000 npm run dancecard:smoke`

Expect: `OK dancecard smoke` with a slot count. If the count is `0`, the smoke script prints a warning until you run the import below.

## Manual happy path (5 minutes)

1. Open `/dancecard/paf26`, **Register** user A (username, password, display name).
2. Add one or two program sessions to **My dancecard** (Program tab → click cards).
3. **Copy share for Discord**; note the `/dancecard/paf26/s/…` URL.
4. In a private window, open the share URL; **Register** user B on `/dancecard/paf26`, then reload the share tab — **Mutual free** should list gaps if both have non-overlapping busy time.
5. On the share page as B, set a window inside a mutual gap and **Reserve** — both accounts should show the block under **Reservations** / busy math.

## PAF26 official Grid → JSON → Supabase

**Official program** is maintained by the organizer here: [Google Sheets — Grid (gid 1445461642)](https://docs.google.com/spreadsheets/d/14gT9gufCcbHoDtabJeGSRSAkwhiEFUfGdDQcw-2Ju1U/edit?gid=1445461642#gid=1445461642).

That workbook is a **time × venue matrix** on the **Grid** sheet, not a flat Start/End table. Use the dedicated parser (defaults to the standard Downloads filename if present):

```bash
npm run dancecard:parse-paf26
# or, with explicit paths:
node scripts/paf26-grid-to-json.mjs "C:/path/to/PAF26 Schedule Daily At-A-Glance & Grid.xlsx" ./data/paf26-program-slots.json
```

That writes [`data/paf26-program-slots.json`](../data/paf26-program-slots.json) (committed copy can be refreshed after each schedule revision). Times are interpreted as **May 2026, America/New_York (EDT, −04:00)** to match the festival.

Then import into Supabase (requires `.env.local` with service role):

```bash
npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json
```

The seed SQL already sets the `paf26` event window to cover the festival; re-run the parser + import whenever the Grid changes.

### After you deploy to Vercel (or any host)

Deploying the Next.js app does **not** copy rows into Postgres. If `/dancecard/paf26` shows an empty program on the live site, your **production** Supabase project still needs the same import step, using that project’s URL and **secret / service_role** key (never the publishable key in the browser bundle for this script).

From a trusted machine with the repo checked out:

```bash
export NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-production-secret-or-service-role-key"
npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json
```

On Windows PowerShell, use `$env:NEXT_PUBLIC_SUPABASE_URL="..."` and `$env:SUPABASE_SERVICE_ROLE_KEY="..."` instead of `export`. Then reload the live `/dancecard/paf26` Program tab.

## Import other schedules (flat Excel or JSON)

```bash
npm run dancecard:import -- --slug paf26 --json ./path/to/slots.json
npm run dancecard:import -- --slug paf26 ./path/to/schedule.xlsx
```

JSON shape: `{ "slots": [ { "startsAt", "endsAt", "title", "track?", "room?", "sortOrder?" } ] }`.

XLSX (row-oriented): prefers a sheet whose name contains **Grid**; otherwise first sheet. Header row must map to Start / End / Title columns (legacy heuristics). **PAF26 Grid matrix:** use `dancecard:parse-paf26` instead of direct XLSX import.

**Chat → deploy workflow:** when an organizer sends a workbook, create or confirm the `dancecard_events` row (slug, window, titles), run import for that slug, spot-check first/last session times in the UI, then announce the public URL `/dancecard/{slug}`.

## Cutover from standalone repo

The previous Fastify+Vite app (`eck-paf26-dancecard`) is **reference-only**. After production traffic on ECKE is verified, archive that repository and treat **EastCoast-master** as the only source of truth for dancecard.
