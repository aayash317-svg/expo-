-- Seed Test Policy & Claim for Next.js Verification
-- Run this in Supabase SQL Editor

-- 1. Create a Dummy Insurance Provider (Compulsory for FK)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'provider@healthone.com', 
    '{"role": "insurance", "company_name": "HealthOne Insurance"}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, email, role, full_name)
VALUES ('11111111-1111-1111-1111-111111111111', 'provider@healthone.com', 'insurance', 'HealthOne Provider')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.insurance_providers (id, company_name, verified)
VALUES ('11111111-1111-1111-1111-111111111111', 'HealthOne Insurance', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert the Policy (Matches Flask Test Policy)
-- We use a known ID to link the claim easily
INSERT INTO public.insurance_policies (
    id, 
    patient_id, 
    provider_id, 
    policy_number, 
    coverage_amount, 
    valid_until
)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Known Policy UUID
    '00000000-0000-0000-0000-000000000001', -- Test Patient UUID
    '11111111-1111-1111-1111-111111111111', -- Test Provider UUID
    'TEST-POLICY-AUTO-1',
    50000,
    '2025-12-31'
)
ON CONFLICT (policy_number) DO NOTHING;

-- 3. Insert a Test Claim (To Verify Relationship Fix)
INSERT INTO public.claims (
    id,
    patient_id,
    provider_id,
    policy_id,
    claim_amount,
    status,
    description
)
VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    150.00,
    'pending',
    'General Checkup - Test Claim'
)
ON CONFLICT (id) DO NOTHING;
