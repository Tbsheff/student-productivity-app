-- Create users table in public schema
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  user_id UUID,
  token_identifier UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for users table
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    -- If it exists, drop it first
    ALTER PUBLICATION supabase_realtime DROP TABLE public.users;
  END IF;
  
  -- Add the table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
END
$$;