-- Create clients table for shopping association
CREATE TABLE IF NOT EXISTS clients (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name        TEXT NOT NULL UNIQUE
);

-- Alter recordings table to support memo vs shopping types, client reference, and nullable date_recorded for shopping items
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'memo' CHECK (type IN ('memo', 'shopping'));
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Make date_recorded nullable for shopping items (memos still have date_recorded)
ALTER TABLE recordings ALTER COLUMN date_recorded DROP NOT NULL;

-- Index for client lookups and type filtering
CREATE INDEX IF NOT EXISTS idx_recordings_type ON recordings(type);
CREATE INDEX IF NOT EXISTS idx_recordings_client ON recordings(client_id);
