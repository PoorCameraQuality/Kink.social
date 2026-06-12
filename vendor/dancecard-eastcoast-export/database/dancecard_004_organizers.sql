-- Organizer access + optional registration gate (shared code before register/login).
-- Apply via Supabase SQL editor or: npm run dancecard:apply-migrations with DANCECARD_SQL_FILES.

ALTER TABLE dancecard_events ADD COLUMN IF NOT EXISTS registration_access_code text;

CREATE TABLE IF NOT EXISTS dancecard_event_organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS dancecard_event_organizers_user_idx ON dancecard_event_organizers (user_id);
CREATE INDEX IF NOT EXISTS dancecard_event_organizers_event_idx ON dancecard_event_organizers (event_id);

-- Seed organizers (replace UUIDs with real auth.users ids from Supabase → Authentication → Users):
-- INSERT INTO dancecard_event_organizers (event_id, user_id, role)
-- SELECT id, '00000000-0000-0000-0000-000000000000'::uuid, 'owner'
-- FROM dancecard_events WHERE slug = 'paf26'
-- ON CONFLICT (event_id, user_id) DO NOTHING;
