-- FINAL FIX FOR REGISTRATION ERRORS
-- Run this entire script in the Supabase SQL Editor

BEGIN;

-- 1. Fix User Role Enum (Add 'insurance' if missing)
DO $$
BEGIN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'insurance';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure Tables Exist
CREATE TABLE IF NOT EXISTS public.insurance_providers (
  id uuid references public.profiles(id) on delete cascade primary key,
  company_name text not null,
  verified boolean default false
);

-- 3. Fix Permissions (RLS)
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert providers" ON public.insurance_providers;
CREATE POLICY "Public insert providers" ON public.insurance_providers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Providers view own record" ON public.insurance_providers;
CREATE POLICY "Providers view own record" ON public.insurance_providers FOR SELECT USING (auth.uid() = id);

-- 4. Fix The Trigger Function (Robust Version)
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
    u_role := 'patient'; -- Default fallback
  END IF;

  -- Create Profile
  INSERT INTO public.profiles (id, email, role, full_name, phone)
  VALUES (
    new.id,
    new.email,
    u_role,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.phone
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create Child Records based on Role
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
           COALESCE(new.raw_user_meta_data->>'company_name', new.raw_user_meta_data->>'full_name', 'New Insurance Provider'),
           false
       )
       ON CONFLICT (id) DO NOTHING;
       
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
  -- Log error content for debugging (visible in Supabase logs)
  RAISE WARNING 'Registration Trigger Failed: %', SQLERRM;
  -- Fail the transaction so the user sees the error
  RAISE EXCEPTION 'Database Error: %', SQLERRM;
END;
$$;

-- 5. Re-bind Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;
