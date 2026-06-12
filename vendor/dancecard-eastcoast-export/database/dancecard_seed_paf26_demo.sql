-- PAF26 dancecard event row (idempotent). Program slots are not inserted here.
-- After schema + this file, load the official Grid export:
--   npm run dancecard:parse-paf26
--   npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json
-- (Requires .env.local with Supabase service role for the import step.)

INSERT INTO dancecard_events (
  slug,
  product_title,
  event_title,
  subtitle,
  timezone,
  window_starts_at,
  window_ends_at,
  shared_by_label,
  shared_by_detail,
  logo_url,
  status
)
VALUES (
  'paf26',
  'East Coast Kink Events — Dancecard',
  'Primal Arts Festival 2026 (PAF26)',
  'Official program from the organizer Grid workbook (see docs/dancecard-first-run.md).',
  'America/New_York',
  timestamptz '2026-05-06 08:00:00-04',
  timestamptz '2026-05-13 02:00:00-04',
  'East Coast Kink Events',
  'Import ./data/paf26-program-slots.json after running npm run dancecard:parse-paf26.',
  NULL,
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  product_title = EXCLUDED.product_title,
  event_title = EXCLUDED.event_title,
  subtitle = EXCLUDED.subtitle,
  timezone = EXCLUDED.timezone,
  window_starts_at = EXCLUDED.window_starts_at,
  window_ends_at = EXCLUDED.window_ends_at,
  shared_by_label = EXCLUDED.shared_by_label,
  shared_by_detail = EXCLUDED.shared_by_detail,
  logo_url = EXCLUDED.logo_url,
  status = EXCLUDED.status;
