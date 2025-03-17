-- This migration fixes the error with the calendar_connections table already being a member of the supabase_realtime publication
-- We'll check if the table exists in the publication before trying to add it

DO $$
BEGIN
  -- Check if calendar_connections is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'calendar_connections'
  ) THEN
    -- Only add it if it's not already there
    ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_connections;
  END IF;
END
$$;