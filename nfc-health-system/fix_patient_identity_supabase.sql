-- CORRECTED: Supabase/Postgres Seed Script
-- This respects the schema: profiles(full_name) -> patients(dob)

-- 1. Create Auth User (Foreign Key Requirement)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'patient@example.com', 
    '{"role": "patient", "full_name": "Test Patient"}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Profile (Holds Name & Email)
INSERT INTO public.profiles (id, email, role, full_name)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'patient@example.com',
    'patient',
    'Test Patient'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name;

-- 3. Create Patient Record (Holds DOB)
INSERT INTO public.patients (id, dob)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '1990-01-01'
)
ON CONFLICT (id) DO UPDATE SET
    dob = EXCLUDED.dob;
