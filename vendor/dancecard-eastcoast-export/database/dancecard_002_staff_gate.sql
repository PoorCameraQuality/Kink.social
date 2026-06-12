-- Staff roster gate: shared code unlocks is_staff on the account (per-event via event_id on account).

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS staff_access_code text;

ALTER TABLE dancecard_accounts ADD COLUMN IF NOT EXISTS is_staff boolean NOT NULL DEFAULT false;

-- Default staff code for PAF26 — change in Supabase after apply if desired.
UPDATE dancecard_events
SET staff_access_code = 'PAF26-STAFF-2026'
WHERE slug = 'paf26' AND (staff_access_code IS NULL OR staff_access_code = '');
