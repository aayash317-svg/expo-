import os
import uuid
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("Attempting Reg WITH Metadata...")

name = "Debug Hospital"
council_id = f"DEBUG_{str(uuid.uuid4())[:6]}"
email = f"debug_{str(uuid.uuid4())[:6]}@test.com"
system_email = f"{council_id}@nfc-health.system"
password = "password123"

try:
    auth_res = supabase.auth.sign_up({
        "email": system_email,
        "password": password,
        "options": {
            "data": {
                "full_name": name,
                "role": "insurance",
                "company_name": "Debug Insurance Co",
                "contact_email": email
            }
        }
    })
    
    if auth_res.user:
        print(f"✅ Success With Metadata. User ID: {auth_res.user.id}")
        
        # Verify Profile Creation
        print("   Verifying Profile creation...")
        profile_res = supabase.from_("profiles").select("*").eq("id", auth_res.user.id).execute()
        if profile_res.data:
             print(f"   ✅ Profile Found: {profile_res.data[0]['role']}")
        else:
             print("   ❌ Profile NOT Found (Trigger failed?)")

        # Verify Hospital Creation
        print("   Verifying Hospital Record creation...")
        hosp_res = supabase.from_("hospitals").select("*").eq("id", auth_res.user.id).execute()
        if hosp_res.data:
             print(f"   ✅ Hospital Record Found: {hosp_res.data[0]['license_number']}")
        else:
             print("   ❌ Hospital Record NOT Found (Trigger failed?)")

    else:
        print("❌ Failed (User None)")

except Exception as e:
    print(f"❌ Exception With Metadata: {e}")

# -----------------
# Skip the second test for now to focus on the full flow
print("\nSkipping second test.")

