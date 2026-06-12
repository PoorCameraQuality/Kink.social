-- Staff roster gate + per-selection notes (idempotent; mirrors database/dancecard_002 + 003).

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS staff_access_code text;

ALTER TABLE dancecard_accounts ADD COLUMN IF NOT EXISTS is_staff boolean NOT NULL DEFAULT false;

UPDATE dancecard_events
SET staff_access_code = 'PAF26-STAFF-2026'
WHERE slug = 'paf26' AND (staff_access_code IS NULL OR staff_access_code = '');

ALTER TABLE dancecard_selections ADD COLUMN IF NOT EXISTS note text;
