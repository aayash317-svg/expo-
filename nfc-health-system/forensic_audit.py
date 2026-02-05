import sqlite3
import os

DATABASE = 'health_system.db'

def audit_db():
    if not os.path.exists(DATABASE):
        print(f"CRITICAL: Database file {DATABASE} MISSING at runtime path.")
        return

    print(f"AUDITING: {DATABASE}")
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # 1. Check Schema for 'patients'
    print("\n[SCHEMA] patients table:")
    try:
        cursor.execute("PRAGMA table_info(patients)")
        columns = cursor.fetchall()
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        col_names = [c[1] for c in columns]
        if 'email' not in col_names:
            print("  🚨 CRITICAL: 'email' column MISSING in patients table.")
        else:
             print("  ✅ 'email' column present.")

    except Exception as e:
        print(f"  ERROR reading schema: {e}")

    # 2. Check Content
    print("\n[DATA] patients content:")
    try:
        cursor.execute("SELECT * FROM patients")
        rows = cursor.fetchall()
        if not rows:
            print("  🚨 CRITICAL: patients table is EMPTY.")
        else:
            for row in rows:
                print(f"  - {row}")
    except Exception as e:
        print(f"  ERROR reading data: {e}")

    conn.close()

if __name__ == "__main__":
    audit_db()
