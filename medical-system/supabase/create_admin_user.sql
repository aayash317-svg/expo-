-- STEP 2: Run this script AFTER running 'add_role.sql'.
-- This creates the Admin User.

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- 1. Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@nfc-health.com',
    crypt('dhilshath123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- 2. Update public.profiles
  -- (A Trigger likely created the profile already with default values)
  -- We just need to upgrade it to Admin.
  UPDATE public.profiles
  SET role = 'admin',
      full_name = 'System Admin',
      email = 'admin@nfc-health.com'
  WHERE id = new_user_id;

  -- Verify if update didn't happen (e.g. no trigger), then insert
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, full_name, role, email)
    VALUES (new_user_id, 'System Admin', 'admin', 'admin@nfc-health.com');
  END IF;

  -- 3. Insert into public.admins (if exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
      INSERT INTO public.admins (id, username, password_hash)
      VALUES (new_user_id, 'admin', 'dhilshath123'); 
  END IF;

  RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
END $$;
