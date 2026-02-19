from supabase import create_client, Client
import os

url = "https://epbxjdzviyyaiwbijmjn.supabase.co"
key = "sb_publishable_pe97Q92EG9uY8H3lbal_AA_oOgUm7pd"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnhqZHp2aXl5YWl3YmlqbWpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI0MDE4NiwiZXhwIjoyMDg0ODE2MTg2fQ.AfdYkSczE-wfDqnVtuPpQ5tf4AVkoUxPk91FqfoSFNA"

supabase: Client = create_client(url, service_key)

emails = ["hospital12@gmail.com", "hospital12@gmai.com", "insurance122@gmail.com"]

for email in emails:
    print(f"\n--- Checking Email: {email} ---")
    
    # 1. Check Auth
    users = supabase.auth.admin.list_users()
    user = next((u for u in users if u.email == email), None)
    
    if not user:
        print("Auth: NOT FOUND")
        continue
    
    print(f"Auth: FOUND (ID: {user.id})")
    print(f"Auth Metadata: {user.user_metadata}")
    
    # 2. Check Profile
    profile = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if profile.data:
        print(f"Profile: FOUND (Role: {profile.data[0].get('role')})")
    else:
        print("Profile: NOT FOUND")
        
    # 3. Check Hospital
    hospital = supabase.table("hospitals").select("*").eq("id", user.id).execute()
    if hospital.data:
        print(f"Hospital Record: FOUND (License: {hospital.data[0].get('license_number')})")
    else:
        print("Hospital Record: NOT FOUND")
        
    # 4. Check Insurance
    insurance = supabase.table("insurance_providers").select("*").eq("id", user.id).execute()
    if insurance.data:
        print(f"Insurance Provider: FOUND (Company: {insurance.data[0].get('company_name')})")
    else:
        print("Insurance Provider: NOT FOUND")
