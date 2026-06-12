-- Dancecard (multi-event) — apply in Supabase SQL editor or psql.
-- Accessed only from Next.js route handlers via service role (no RLS policies required for v1).

CREATE TABLE IF NOT EXISTS dancecard_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  product_title text NOT NULL,
  event_title text NOT NULL,
  subtitle text,
  timezone text NOT NULL,
  window_starts_at timestamptz NOT NULL,
  window_ends_at timestamptz NOT NULL,
  shared_by_label text NOT NULL,
  shared_by_detail text,
  logo_url text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dancecard_program_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  title text NOT NULL,
  track text,
  room text,
  description text,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS dancecard_program_slots_event_starts_idx
  ON dancecard_program_slots (event_id, starts_at, sort_order);

CREATE TABLE IF NOT EXISTS dancecard_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  username text NOT NULL,
  password_hash text NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_accounts_event_username_uidx
  ON dancecard_accounts (event_id, lower(username));

CREATE INDEX IF NOT EXISTS dancecard_accounts_event_idx ON dancecard_accounts (event_id);

CREATE TABLE IF NOT EXISTS dancecard_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_sessions_token_hash_uidx ON dancecard_sessions (token_hash);
CREATE INDEX IF NOT EXISTS dancecard_sessions_account_idx ON dancecard_sessions (account_id);

CREATE TABLE IF NOT EXISTS dancecard_prefs (
  account_id uuid PRIMARY KEY REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  buffer_minutes integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dancecard_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  slot_id uuid REFERENCES dancecard_program_slots (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  kind text NOT NULL
);

CREATE INDEX IF NOT EXISTS dancecard_selections_account_idx ON dancecard_selections (account_id);

CREATE TABLE IF NOT EXISTS dancecard_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  token text NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS dancecard_share_links_token_uidx ON dancecard_share_links (token);
CREATE INDEX IF NOT EXISTS dancecard_share_links_account_idx ON dancecard_share_links (account_id);

CREATE TABLE IF NOT EXISTS dancecard_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES dancecard_events (id) ON DELETE CASCADE,
  host_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  guest_account_id uuid NOT NULL REFERENCES dancecard_accounts (id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dancecard_reservations_host_idx ON dancecard_reservations (host_account_id);
CREATE INDEX IF NOT EXISTS dancecard_reservations_guest_idx ON dancecard_reservations (guest_account_id);
CREATE INDEX IF NOT EXISTS dancecard_reservations_event_idx ON dancecard_reservations (event_id);

-- Staff / volunteer shifts (Dancecard autofill). Same as dancecard_001_staff_shifts.sql for incremental apply.
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
