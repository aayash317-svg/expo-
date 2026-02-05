-- Create a trigger function to handle new user signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  user_role public.user_role;
begin
  -- Get role from metadata, default to 'patient' if not found
  user_role := (new.raw_user_meta_data->>'role')::public.user_role;
  if user_role is null then
      user_role := 'patient';
  end if;

  -- Insert into public.profiles
  insert into public.profiles (id, email, role, full_name, phone)
  values (
    new.id,
    new.email,
    user_role,
    new.raw_user_meta_data->>'full_name',
    new.phone
  );

  -- Handle specific role data if needed (Optional, but good for consistency)
  -- For Hospitals
  if user_role = 'hospital' then
      insert into public.hospitals (id, license_number, address, verified)
      values (
          new.id,
          COALESCE(new.raw_user_meta_data->>'license_number', 'PENDING'),
           COALESCE(new.raw_user_meta_data->>'address', 'Not Provided'),
          false
      )
      on conflict (id) do nothing; -- Prevent error if code also tries to insert
  end if;

   -- For Insurance
  if user_role = 'insurance' then
      insert into public.insurance_providers (id, company_name, verified)
      values (
          new.id,
          COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown Company'),
          false
      )
      on conflict (id) do nothing;
  end if;
  
  -- For Patients
  if user_role = 'patient' then
     insert into public.patients (id, dob, blood_group)
     values (
         new.id,
         (new.raw_user_meta_data->>'dob')::date,
         new.raw_user_meta_data->>'blood_group'
     )
     on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
