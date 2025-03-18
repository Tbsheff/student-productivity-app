-- Drop any existing constraints for external_id and user_id if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'tasks' 
    AND constraint_name = 'tasks_external_id_user_id_key'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_external_id_user_id_key;
  END IF;
END $$;

-- Add the proper unique constraint that handles NULL values correctly
ALTER TABLE tasks ADD CONSTRAINT tasks_external_id_user_id_key 
  UNIQUE NULLS NOT DISTINCT (external_id, user_id);