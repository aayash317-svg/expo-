-- FIXED: Ensure 'insurance' role exists and table is correct

-- 1. Safe way to add enum value if it doesn't exist
DO $$
BEGIN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'insurance';
EXCEPTION
    WHEN duplicate_object THEN null; -- Ignore if already exists
END $$;

-- 2. Ensure Insurance Providers table exists
CREATE TABLE IF NOT EXISTS public.insurance_providers (
  id uuid references public.profiles(id) on delete cascade primary key,
  company_name text not null,
  verified boolean default false
);

-- 3. Enable RLS on it
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply Policies (Safe)
DROP POLICY IF EXISTS "Public insert providers" ON public.insurance_providers;
CREATE POLICY "Public insert providers" ON public.insurance_providers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Providers view own record" ON public.insurance_providers;
CREATE POLICY "Providers view own record" ON public.insurance_providers FOR SELECT USING (auth.uid() = id);

-- 5. Restore the V3 Trigger (Uncommented Logic)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  u_role public.user_role;
  meta_role text;
begin
  -- Determine Role
  meta_role := new.raw_user_meta_data->>'role';

  if meta_role = 'hospital' then
    u_role := 'hospital';
  elsif meta_role = 'insurance' then
    u_role := 'insurance';
  else
    u_role := 'patient';
  end if;

  -- Insert Profile
  insert into public.profiles (id, email, role, full_name, phone)
  values (
    new.id,
    new.email,
    u_role,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.phone
  );

  -- Insert Child Record
  if u_role = 'hospital' then
      insert into public.hospitals (id, license_number, address, verified)
      values (
          new.id,
          COALESCE(new.raw_user_meta_data->>'license_number', 'PENDING-' || substr(new.id::text, 1, 8)),
          COALESCE(new.raw_user_meta_data->>'address', 'Pending Address'),
          false
      )
      on conflict (id) do nothing;
  
  elsif u_role = 'insurance' then
       insert into public.insurance_providers (id, company_name, verified)
       values (
           new.id,
           COALESCE(new.raw_user_meta_data->>'company_name', new.raw_user_meta_data->>'full_name', 'Insurance Provider'),
           false
       )
       on conflict (id) do nothing;
       
  elsif u_role = 'patient' then
      insert into public.patients (id, dob, blood_group)
      values (
          new.id,
          case 
            when new.raw_user_meta_data->>'dob' = '' then null 
            when new.raw_user_meta_data->>'dob' is null then null
            else (new.raw_user_meta_data->>'dob')::date 
          end,
          new.raw_user_meta_data->>'blood_group'
      )
      on conflict (id) do nothing;
  end if;

  return new;
exception when others then
  raise exception 'Trigger Failed: %', SQLERRM;
end;
$$;
