import sqlite3
import os

DATABASE = 'health_system.db'
SCHEMA_FILE = 'schema.sql'

def init_db():
    print(f"Initializing database: {DATABASE}")
    
    # Check if DB exists, if so, remove it to "Completely wipe existing test data"
    if os.path.exists(DATABASE):
        print(f"Removing existing database file: {DATABASE}")
        try:
            os.remove(DATABASE)
        except Exception as e:
            print(f"Error removing {DATABASE}: {e}")
            return

    # Create new DB
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Read schema
        if not os.path.exists(SCHEMA_FILE):
            print(f"Error: {SCHEMA_FILE} not found.")
            return

        with open(SCHEMA_FILE, 'r') as f:
            schema_script = f.read()
            
        # Execute schema
        cursor.executescript(schema_script)
        # Seed Data
        try:
            from utils import hash_password, generate_uuid
            print("Seeding default users...")
            
            # Admin (admin/admin123)
            cursor.execute("INSERT INTO admins (id, username, password_hash) VALUES (?, ?, ?)", 
                        (generate_uuid(), 'admin', hash_password('admin123')))
            
            # Hospital (Apollo - HOSP001/password123)
            cursor.execute("INSERT INTO hospitals (id, name, council_id, email, password_hash, verified) VALUES (?, ?, ?, ?, ?, ?)",
                        (generate_uuid(), 'Apollo Hospital', 'HOSP001', 'apollo@med.com', hash_password('password123'), 1))
                        
            # Insurance (Star Health - INS001/password123)
            cursor.execute("INSERT INTO insurance_companies (id, name, license_number, email, password_hash) VALUES (?, ?, ?, ?, ?)",
                        (generate_uuid(), 'Star Health', 'INS001', 'star@ins.com', hash_password('password123')))
            
            conn.commit()
            print("Seeded: Admin (admin/admin123), Hospital (HOSP001/password123), Insurance (INS001/password123)")
        except ImportError:
            print("Could not import utils for seeding. Database created empty.")
            conn.commit()

        print("Database initialized successfully with new schema.")
        
        # Verify tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("Created tables:")
        for table in tables:
            print(f"- {table[0]}")
            
        conn.close()
        
    except Exception as e:
        print(f"Database initialization failed: {e}")

if __name__ == "__main__":
    init_db()
