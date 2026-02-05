import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY") # Try service key first, else ANON

if not url or not key:
    print("Missing SUPABASE credentials in .env")
    exit(1)

supabase: Client = create_client(url, key)

email = "patient@example.com"

print(f"Checking for user with email: {email}")

# 1. Check Profiles
try:
    res = supabase.table("profiles").select("*").eq("email", email).execute()
    if res.data:
        print(f"[FOUND] Profile found: {res.data[0]}")
    else:
        print("[MISSING] No profile found in 'profiles' table.")
except Exception as e:
    print(f"[ERROR] querying profiles: {e}")

# 2. Check Patients
try:
    # We need the ID from profile to check patient, but let's see if we can just list
    res = supabase.table("patients").select("*").execute()
    print(f"Total patients in 'patients' table: {len(res.data)}")
except Exception as e:
    print(f"[ERROR] querying patients: {e}")
