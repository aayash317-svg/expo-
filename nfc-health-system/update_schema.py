import sqlite3
import os

DATABASE = 'health_system.db'
SCHEMA_FILE = 'schema_insurance.sql'

def update_db():
    if not os.path.exists(DATABASE):
        print(f"Database {DATABASE} not found. Initializing...")
        
    print(f"Applying schema from {SCHEMA_FILE}...")
    with sqlite3.connect(DATABASE) as db:
        with open(SCHEMA_FILE, mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()
    print("Database updated successfully.")

if __name__ == "__main__":
    update_db()
