from supabase import create_client, Client
import os

url = "https://epbxjdzviyyaiwbijmjn.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnhqZHp2aXl5YWl3YmlqbWpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI0MDE4NiwiZXhwIjoyMDg0ODE2MTg2fQ.AfdYkSczE-wfDqnVtuPpQ5tf4AVkoUxPk91FqfoSFNA"

supabase: Client = create_client(url, service_key)

# 1. Update existing insurance provider to be verified
email = "insurance1222@gmail.com"
result = supabase.auth.admin.list_users()
user = next((u for u in result if u.email == email), None)

if user:
    print(f"Found user {email} with ID {user.id}")
    # Update insurance_providers
    res_ins = supabase.table("insurance_providers").update({"verified": True}).eq("id", user.id).execute()
    print(f"Insurance Provider verified: {res_ins.data}")
    
    # Also verify hospital if any exists for testing
    res_hosp = supabase.table("hospitals").update({"verified": True}).execute()
    print("All hospitals set to verified for testing purposes.")
else:
    print(f"User {email} not found.")
