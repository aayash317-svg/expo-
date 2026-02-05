-- FINAL FIX Regsitration V6
-- 1. Ensure Schema
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
      create type user_role as enum ('patient', 'hospital', 'insurance');
  ELSE
      -- Ensure 'insurance' is in the enum (idempotent-ish check)
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'insurance';
  END IF;
END $$;

-- 2. Ensure Tables Exist (Basic check)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  phone text,
  role user_role not null,
  full_name text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.insurance_providers (
  id uuid references public.profiles(id) on delete cascade primary key,
  company_name text not null,
  verified boolean default false
);

CREATE TABLE IF NOT EXISTS public.hospitals (
  id uuid references public.profiles(id) on delete cascade primary key,
  license_number text unique not null,
  address text,
  verified boolean default false
);

CREATE TABLE IF NOT EXISTS public.patients (
  id uuid references public.profiles(id) on delete cascade primary key,
  dob date,
  blood_group text,
  allergies text[], 
  emergency_contact jsonb,
  nfc_tag_id text unique, 
  qr_code_token text unique
);

-- 3. Robust Trigger Function
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

  -- Create Profile (Idempotent)
  INSERT INTO public.profiles (id, email, role, full_name, phone)
  VALUES (
    new.id,
    new.email, -- May be null for phone auth
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
       INSERT INTO public.insurance_providers (id, company_name, verified)
       VALUES (
           new.id,
           COALESCE(new.raw_user_meta_data->>'full_name', 'Insurance Provider'),
           false
       )
       ON CONFLICT (id) DO NOTHING;
       
  ELSIF u_role = 'patient' THEN
      INSERT INTO public.patients (id, dob, blood_group, emergency_contact)
      VALUES (
          new.id,
          CASE 
            WHEN new.raw_user_meta_data->>'dob' = '' THEN NULL 
            WHEN new.raw_user_meta_data->>'dob' IS NULL THEN NULL
            ELSE (new.raw_user_meta_data->>'dob')::date 
          END,
          new.raw_user_meta_data->>'blood_group',
          CASE
            WHEN new.raw_user_meta_data->>'emergency_contact' IS NOT NULL 
            THEN (new.raw_user_meta_data->>'emergency_contact')::jsonb
            ELSE NULL
          END
      )
      ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't block auth user creation if you want 'soft' failure
  -- For strict consistency, we RAISE EXCEPTION.
  RAISE EXCEPTION 'Trigger Registration Failed: %', SQLERRM;
END;
$$;

-- 4. Recreate Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
