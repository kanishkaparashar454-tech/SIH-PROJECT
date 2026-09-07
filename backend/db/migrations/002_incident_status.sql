-- Add lifecycle tracking to incident reports.
ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'incidents_status_check'
  ) THEN
    ALTER TABLE incidents ADD CONSTRAINT incidents_status_check
      CHECK (status IN ('active', 'verified', 'resolved'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents(status);
