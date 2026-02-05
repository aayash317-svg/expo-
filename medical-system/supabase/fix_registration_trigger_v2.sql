-- Create a trigger function to handle new user signups (V2 - IMPROVED)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role public.user_role;
  meta_dob text;
  final_license text;
begin
  -- 1. Determine Role
  begin
    user_role := (new.raw_user_meta_data->>'role')::public.user_role;
  exception when others then
    user_role := 'patient'; -- Default fallback
  end;
  
  if user_role is null then
      user_role := 'patient';
  end if;

  -- 2. Insert into Profiles
  insert into public.profiles (id, email, role, full_name, phone)
  values (
    new.id,
    new.email,
    user_role,
    new.raw_user_meta_data->>'full_name',
    new.phone
  );

  -- 3. Role-Specific Logic
  
  -- HOSPITAL
  if user_role = 'hospital' then
      -- Fix Unique Constraint: Ensure default license is unique
      if new.raw_user_meta_data->>'license_number' is null or new.raw_user_meta_data->>'license_number' = '' then
          final_license := 'PENDING-' || substr(new.id::text, 1, 8);
      else
          final_license := new.raw_user_meta_data->>'license_number';
      end if;

      insert into public.hospitals (id, license_number, address, verified)
      values (
          new.id,
          final_license,
          COALESCE(new.raw_user_meta_data->>'address', 'Not Provided'),
          false
      )
      on conflict (id) do nothing;
  end if;

   -- INSURANCE
  if user_role = 'insurance' then
      insert into public.insurance_providers (id, company_name, verified)
      values (
          new.id,
          COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown Company'),
          false
      )
      on conflict (id) do nothing;
  end if;
  
  -- PATIENT
  if user_role = 'patient' then
     meta_dob := new.raw_user_meta_data->>'dob';
     
     insert into public.patients (id, dob, blood_group)
     values (
         new.id,
         -- Safe Cast for Date (if empty/null, store null)
         case when meta_dob is null or meta_dob = '' then null else meta_dob::date end,
         new.raw_user_meta_data->>'blood_group'
     )
     on conflict (id) do nothing;
  end if;

  return new;
exception when others then
  -- Log error (visible in Supabase logs) and re-raise to block signup
  raise notice 'Trigger failed: %', SQLERRM;
  raise exception 'Registration failed at database level: %', SQLERRM;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
