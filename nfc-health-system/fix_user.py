import sqlite3
import uuid
from werkzeug.security import generate_password_hash

def fix_user():
    conn = sqlite3.connect('health_system.db')
    cur = conn.cursor()
    
    new_id = str(uuid.uuid4())
    hashed_pw = generate_password_hash('password')
    
    try:
        cur.execute("""
            INSERT INTO hospitals (id, name, council_id, email, password_hash, verified, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (new_id, 'LifeCare Hospital Staff', 'HOSP6564', 'staff6564@lifecare.com', hashed_pw, 1, 'active'))
        conn.commit()
        print("Successfully created user HOSP6564")
    except sqlite3.IntegrityError as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_user()
