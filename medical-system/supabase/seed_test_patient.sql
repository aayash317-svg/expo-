-- SEED DUMMY PATIENT
-- Run this to create a patient you can use for testing "Create Policy"

-- 1. Create Auth User (Fake) - We actually just need a Profile for the foreign key check
-- But normally we need an auth user. 
-- Since we can't easily create auth.users from SQL without the pgcrypto/internal functions sometimes,
-- we will try to insert into profiles directly if constraint allows, or use a known user ID.

-- Let's assume we want to use specific UUIDs or just random ones if the auth linkage is loose.
-- However, profiles.id references auth.users.id. 
-- So we must create a fake auth user first.

INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
    '00000000-0000-0000-0000-000000000001', 
    'patient@example.com', 
    '{"role": "patient", "full_name": "Test Patient"}'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Profile
INSERT INTO public.profiles (id, email, role, full_name)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'patient@example.com',
    'patient',
    'Test Patient'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Create Patient Record
INSERT INTO public.patients (id, dob, blood_group)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '1990-01-01',
    'O+'
)
ON CONFLICT (id) DO NOTHING;
