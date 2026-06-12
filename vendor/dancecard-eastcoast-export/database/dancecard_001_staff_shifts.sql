-- Staff / volunteer shifts for Dancecard autofill (per event).
-- Apply in Supabase SQL editor after dancecard_000_schema.sql.

CREATE TABLE IF NOT EXISTS dancecard_staff_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  person_name text NOT NULL,
  role text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS dancecard_staff_shifts_event_person_starts_idx
  ON dancecard_staff_shifts (event_id, person_name, starts_at, sort_order);
