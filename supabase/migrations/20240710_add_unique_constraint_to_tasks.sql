-- Add a unique constraint to the tasks table for external_id and user_id
ALTER TABLE tasks
ADD CONSTRAINT tasks_external_id_user_id_unique UNIQUE (external_id, user_id);