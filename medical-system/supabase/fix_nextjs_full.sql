-- Comprehensive Fix Script for Next.js App
-- Run this in the Supabase SQL Editor

-- 1. Enable Crypto Extension (for passwords)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Fix Patient Login (Create/Update with Password)
-- Password will be: password123
INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data)
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'patient@example.com', 
    crypt('password123', gen_salt('bf')),
    '{"role": "patient", "full_name": "Test Patient"}'
)
ON CONFLICT (id) DO UPDATE SET
    encrypted_password = crypt('password123', gen_salt('bf'));

-- 3. Ensure Profiles & Patients Data Exists
INSERT INTO public.profiles (id, email, role, full_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'patient@example.com', 'patient', 'Test Patient')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patients (id, dob)
VALUES ('00000000-0000-0000-0000-000000000001', '1990-01-01')
ON CONFLICT (id) DO NOTHING;

-- 4. FIX CLAIMS RELATIONSHIP ERROR
-- Drop & Recreate Claims table to ensure FKs are explicit and cache refreshes
DROP TABLE IF EXISTS public.claims CASCADE;

CREATE TABLE public.claims (
  id uuid default uuid_generate_v4() primary key,
  -- Explicit References to ensure PostgREST detects them
  patient_id uuid NOT NULL references public.patients(id), 
  provider_id uuid NOT NULL references public.insurance_providers(id),
  policy_id uuid NOT NULL references public.insurance_policies(id),
  claim_amount numeric not null,
  status text default 'pending',
  description text,
  submitted_at timestamptz default now(),
  processed_at timestamptz
);

-- 5. Enable RLS and Refresh Policies
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Access Claims" ON public.claims 
FOR ALL USING (auth.uid() = patient_id OR auth.uid() = provider_id);

-- 6. Reload Schema Cache (Force PostgREST query update)
NOTIFY pgrst, 'reload config';
