-- V5: Debug Trigger (SKIP INSURANCE TABLE INSERT)
-- Run this to narrow down the error.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  u_role public.user_role;
  meta_role text;
BEGIN
  -- Safe Role Extraction
  meta_role := new.raw_user_meta_data->>'role';

  -- Normalize Role
  IF meta_role = 'hospital' THEN
    u_role := 'hospital';
  ELSIF meta_role = 'insurance' THEN
    u_role := 'insurance';
  ELSE
    u_role := 'patient';
  END IF;

  -- Create Profile
  -- IF THIS FAILS, THE ISSUE IS THE 'user_role' ENUM OR PROFILES TABLE
  INSERT INTO public.profiles (id, email, role, full_name, phone)
  VALUES (
    new.id,
    new.email,
    u_role,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.phone
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create Child Records
  IF u_role = 'hospital' THEN
      INSERT INTO public.hospitals (id, license_number, address, verified)
      VALUES (
          new.id,
          COALESCE(new.raw_user_meta_data->>'license_number', 'PENDING-' || substr(new.id::text, 1, 8)),
          COALESCE(new.raw_user_meta_data->>'address', 'Pending Address'),
          false
      )
      ON CONFLICT (id) DO NOTHING;
  
  ELSIF u_role = 'insurance' THEN
       -- DEBUG V5: WE ARE SKIPPING THE INSURANCE PROVIDER INSERT
       -- If registration succeeds now, the issue is definitely the insurance_providers table definition.
       RAISE NOTICE 'Skipping insurance_providers insert for debugging';
       
  ELSIF u_role = 'patient' THEN
      INSERT INTO public.patients (id, dob, blood_group)
      VALUES (
          new.id,
          CASE 
            WHEN new.raw_user_meta_data->>'dob' = '' THEN NULL 
            WHEN new.raw_user_meta_data->>'dob' IS NULL THEN NULL
            ELSE (new.raw_user_meta_data->>'dob')::date 
          END,
          new.raw_user_meta_data->>'blood_group'
      )
      ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Trigger V5 Failed: %', SQLERRM;
END;
$$;
