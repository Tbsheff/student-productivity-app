-- Create calendar_connections table to store connection info for external calendars
CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Add source and external_id columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source VARCHAR(255);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Create index on external_id for faster lookups
CREATE INDEX IF NOT EXISTS tasks_external_id_idx ON tasks(external_id);

-- Enable row-level security
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own calendar connections";
CREATE POLICY "Users can view their own calendar connections"
  ON calendar_connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own calendar connections";
CREATE POLICY "Users can insert their own calendar connections"
  ON calendar_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own calendar connections";
CREATE POLICY "Users can update their own calendar connections"
  ON calendar_connections FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own calendar connections";
CREATE POLICY "Users can delete their own calendar connections"
  ON calendar_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Add to realtime publication
alter publication supabase_realtime add table calendar_connections;
