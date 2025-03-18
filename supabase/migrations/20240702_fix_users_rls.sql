-- Enable row level security for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow users to insert their own data
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own data
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Create policy to allow service role to manage all users
DROP POLICY IF EXISTS "Service role can manage all users" ON users;
CREATE POLICY "Service role can manage all users"
  ON users
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable realtime for users table
DO $$
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    -- Only add it if it's not already there
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
  END IF;
END
$$;