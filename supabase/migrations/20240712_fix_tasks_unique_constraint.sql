-- This migration fixes the issue with the unique constraint on external_id and user_id
-- First, drop any existing constraints that might be causing problems
DO $$
BEGIN
  -- Drop the first constraint if it exists
  IF EXISTS (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'tasks' 
    AND constraint_name = 'tasks_external_id_user_id_key'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_external_id_user_id_key;
  END IF;

  -- Drop the second constraint if it exists
  IF EXISTS (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'tasks' 
    AND constraint_name = 'tasks_external_id_user_id_unique'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_external_id_user_id_unique;
  END IF;
END $$;

-- Create a proper unique constraint
-- We'll use coalesce to handle NULL values appropriately
CREATE UNIQUE INDEX tasks_external_id_user_id_idx ON tasks (user_id, COALESCE(external_id, ''));

-- Alternative approach if the above doesn't work:
-- ALTER TABLE tasks ADD CONSTRAINT tasks_external_id_user_id_key 
--   UNIQUE (user_id, external_id);
-- With the above approach, two rows with NULL external_id would be considered unique
-- which may or may not be what you want

-- Make sure the column exists with the right type
ALTER TABLE tasks ALTER COLUMN external_id TYPE TEXT;