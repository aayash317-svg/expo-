-- V4: Debug Trigger (Isolating Insurance Table)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  u_role public.user_role;
begin
  -- 1. Determine Role
  if new.raw_user_meta_data->>'role' = 'insurance' then
    u_role := 'insurance';
  elsif new.raw_user_meta_data->>'role' = 'hospital' then
    u_role := 'hospital';
  else
    u_role := 'patient';
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

  -- 3. Insert into Child Tables
  if u_role = 'hospital' then
     -- Hospital logic (kept as is since it worked? or maybe it failed too?)
      insert into public.hospitals (id, license_number, address, verified)
      values (
          new.id,
           COALESCE(new.raw_user_meta_data->>'license_number', 'PENDING-' || substr(new.id::text, 1, 8)),
           COALESCE(new.raw_user_meta_data->>'address', 'Pending Address'),
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

  elsif u_role = 'insurance' then
       -- DEBUG: COMMENTED OUT INSERT TO CHECK IF THIS TABLE IS THE PROBLEM
       -- If registration succeeds now, we know 'insurance_providers' table is missing or has bad schema.
       /*
       insert into public.insurance_providers (id, company_name, verified)
       values (
           new.id,
           COALESCE(new.raw_user_meta_data->>'company_name', new.raw_user_meta_data->>'full_name', 'Insurance Provider'),
           false
       );
       */
       -- Do nothing for now
       raise notice 'Skipped insurance insert for debug';
  end if;

  return new;
exception when others then
  raise exception 'Trigger V4 Failed: %', SQLERRM;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
