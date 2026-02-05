-- DEBUGGING SCRIPT V7
-- 1. Create an error logging table to capture the exact SQL error
CREATE TABLE IF NOT EXISTS public.app_errors (
    id uuid default uuid_generate_v4() primary key,
    error_message text,
    occurred_at timestamptz default now()
);

-- Allow public insert to this table for debugging purposes
ALTER TABLE public.app_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert errors" ON public.app_errors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select errors" ON public.app_errors FOR SELECT USING (true);


-- 2. Modify User Role Enum safely
-- Just in case it's missing 'insurance'
DO $$ 
BEGIN 
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'insurance';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not alter enum: %', SQLERRM;
END $$;


-- 3. Debug Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  u_role public.user_role;
  meta_role text;
BEGIN
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

  EXCEPTION WHEN OTHERS THEN
      -- CAPTURE THE ERROR
      INSERT INTO public.app_errors (error_message) VALUES ('Trigger Failed: ' || SQLERRM);
      
      -- We do NOT raise exception here, so the user IS created in auth.users
      -- This allows us to inspect app_errors table.
  END;

  RETURN new;
END;
$$;
