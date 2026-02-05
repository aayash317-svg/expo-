import sqlite3
import os

DATABASE = 'health_system.db'
SCRIPT_FILE = 'fix_patient_identity.sql'

def apply_fix():
    print(f"Applying identity fix from {SCRIPT_FILE}...")
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    with open(SCRIPT_FILE, 'r') as f:
        statements = f.read().split(';')
        
    for stmt in statements:
        if stmt.strip():
            try:
                cursor.execute(stmt)
                print(f"Executed: {stmt[:50]}...")
            except Exception as e:
                print(f"Ignored/Error (likely already exists): {e}")
                
    conn.commit()
    conn.close()
    print("Fix applied.")

if __name__ == "__main__":
    apply_fix()
