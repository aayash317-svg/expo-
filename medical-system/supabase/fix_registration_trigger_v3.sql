-- V3: Simplified Trigger to fix "Database error saving new user"
-- This version minimizes casting errors and handles nulls aggressively.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  u_role public.user_role;
  meta_role text;
begin
  -- 1. Safely determining role
  meta_role := new.raw_user_meta_data->>'role';

  if meta_role = 'hospital' then
    u_role := 'hospital';
  elsif meta_role = 'insurance' then
    u_role := 'insurance';
  else
    u_role := 'patient'; -- Default for any other value or null
  end if;

  -- 2. Insert into Profiles
  insert into public.profiles (id, email, role, full_name, phone)
  values (
    new.id,
    new.email,
    u_role,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.phone
  );

  -- 3. Insert into Child Tables (Safe Defaults)
  if u_role = 'hospital' then
      insert into public.hospitals (id, license_number, address, verified)
      values (
          new.id,
          -- Ensure unique license if missing
          COALESCE(new.raw_user_meta_data->>'license_number', 'PENDING-' || substr(new.id::text, 1, 8)),
          COALESCE(new.raw_user_meta_data->>'address', 'Pending Address'),
          false
      );
  elsif u_role = 'patient' then
      insert into public.patients (id, dob, blood_group)
      values (
          new.id,
          -- Fix Date Casting: If null/empty, insert NULL explicitly
          case 
            when new.raw_user_meta_data->>'dob' = '' then null 
            when new.raw_user_meta_data->>'dob' is null then null
            else (new.raw_user_meta_data->>'dob')::date 
          end,
          new.raw_user_meta_data->>'blood_group'
      );
  elsif u_role = 'insurance' then
       insert into public.insurance_providers (id, company_name, verified)
       values (
           new.id,
           COALESCE(new.raw_user_meta_data->>'full_name', 'Insurance Provider'),
           false
       );
  end if;

  return new;
exception when others then
  -- OPTIONAL: You can remove 'raise exception' to allow Auth User creation even if Profile fails.
  -- But for this app, we want to know if it fails.
  raise exception 'Trigger V3 Failed: %', SQLERRM;
end;
$$;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
