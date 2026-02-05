import sqlite3
import os
import sys

def check_db():
    print("1. Checking Database (health_system.db)...")
    if not os.path.exists('health_system.db'):
        print("   [ERROR] health_system.db missing!")
        return False
        
    try:
        conn = sqlite3.connect('health_system.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Check 'patients' table schema
        cursor.execute("PRAGMA table_info(patients)")
        cols = [r['name'] for r in cursor.fetchall()]
        if 'email' not in cols:
            print("   [FAIL] 'email' column missing in 'patients'.")
            return False
            
        # Check patient record
        cursor.execute("SELECT * FROM patients WHERE email='patient@example.com'")
        row = cursor.fetchone()
        if not row:
            print("   [FAIL] Test patient 'patient@example.com' NOT found.")
            return False
            
        print("   [OK] Database schema and test patient verified.")
        return True
        
    except Exception as e:
        print(f"   [ERROR] Database check failed: {e}")
        return False

def check_imports():
    print("\n2. Checking Imports...")
    try:
        import qrcode
        import cryptography
        from insurance_service import generate_policy
        print("   [OK] Libraries (qrcode, cryptography) and insurance_service loaded.")
        return True
    except ImportError as e:
        print(f"   [FAIL] Import error: {e}")
        print("   -> Run: pip install qrcode[pil] cryptography")
        return False
    except Exception as e:
        print(f"   [FAIL] Code error: {e}")
        return False

if __name__ == "__main__":
    print("--- NFC Health System Verification ---\n")
    db_ok = check_db()
    imports_ok = check_imports()
    
    if db_ok and imports_ok:
        print("\n[SUCCESS] Backend is ready.")
        print("IMPORTANT: Please RESTART your Flask server to apply changes:")
        print("1. Stop the current server (Ctrl+C)")
        print("2. Run: python app.py")
    else:
        print("\n[FAILURE] Please fix the issues above.")
