import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("Checking Database Tables...")

tables_to_check = ["profiles", "hospitals", "patients", "insurance_providers"]

for table in tables_to_check:
    try:
        # Check by selecting 0 rows, just to test existence/access
        res = supabase.from_(table).select("count", count="exact").limit(0).execute()
        print(f"✅ Table '{table}' exists (or at least accessible). Count: {res.count}")
    except Exception as e:
        print(f"❌ Table '{table}' Error: {e}")
