-- STEP 1: Run this script ALONE first.
-- This adds the 'admin' role to the database.
-- It must be committed before we can use it in the next script.

DO $$
BEGIN
  ALTER TYPE user_role ADD VALUE 'admin';
EXCEPTION
  WHEN duplicate_object THEN null; -- Ignore if already exists
END $$;
