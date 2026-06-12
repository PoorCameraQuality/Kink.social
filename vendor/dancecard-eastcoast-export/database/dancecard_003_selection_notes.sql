-- Private per-account notes on dance card selections.

ALTER TABLE dancecard_selections ADD COLUMN IF NOT EXISTS note text;
