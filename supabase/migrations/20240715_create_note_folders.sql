-- Create folders table for organizing notes
CREATE TABLE IF NOT EXISTS note_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES note_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add folder_id to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES note_folders(id) ON DELETE SET NULL;

-- Add RLS policies for folders
ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own folders" ON note_folders;
CREATE POLICY "Users can view their own folders"
  ON note_folders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own folders" ON note_folders;
CREATE POLICY "Users can insert their own folders"
  ON note_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own folders" ON note_folders;
CREATE POLICY "Users can update their own folders"
  ON note_folders FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own folders" ON note_folders;
CREATE POLICY "Users can delete their own folders"
  ON note_folders FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for folders
alter publication supabase_realtime add table note_folders;
