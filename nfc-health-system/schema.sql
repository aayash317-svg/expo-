-- Unified SQLite Schema for NFC Health ID System
-- compacted from schema.sql, schema_insurance.sql, and schema_v2_fix.sql
-- Enforcing UUIDs for all primary keys where applicable (stored as TEXT in SQLite)

-- Enable Foreign Key support
PRAGMA foreign_keys = ON;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY, -- UUID
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY, -- UUID
    name TEXT NOT NULL,
    council_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'pending', 'suspended'
    verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insurance Companies Table
CREATE TABLE IF NOT EXISTS insurance_companies (
    id TEXT PRIMARY KEY, -- UUID
    name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY, -- UUID
    full_name TEXT NOT NULL,
    dob DATE NOT NULL,
    email TEXT UNIQUE, -- Optional, but good for lookup
    phone TEXT,
    address TEXT,
    blood_group TEXT,
    emergency_contacts TEXT, -- JSON string
    allergies TEXT, -- JSON string
    chronic_conditions TEXT, -- JSON string
    nfc_id TEXT UNIQUE, -- The physical NFC tag ID
    generated_nfc_id TEXT UNIQUE, -- The encrypted/logical NFC ID
    qr_code TEXT, -- Path or Content of QR
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insurance Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id TEXT PRIMARY KEY, -- UUID
    patient_id TEXT NOT NULL,
    provider_id TEXT NOT NULL, -- Link to insurance_companies
    policy_number TEXT UNIQUE NOT NULL,
    coverage_amount REAL NOT NULL,
    status TEXT DEFAULT 'active',
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES insurance_companies(id)
);

-- 6. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY, -- UUID
    patient_id TEXT NOT NULL,
    hospital_id TEXT, -- Nullable if added by Admin/System
    record_type TEXT CHECK(record_type IN ('text', 'image', 'pdf', 'scan', 'lab_result', 'prescription')) NOT NULL,
    title TEXT,
    description TEXT, -- Main payload
    file_path TEXT, -- If it's a file
    encrypted_data TEXT, -- For sensitive fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

-- 7. QR/NFC Artifacts
CREATE TABLE IF NOT EXISTS qr_records (
    id TEXT PRIMARY KEY, -- UUID
    patient_id TEXT NOT NULL,
    encrypted_payload TEXT NOT NULL,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS nfc_records (
    id TEXT PRIMARY KEY, -- UUID
    patient_id TEXT NOT NULL,
    tag_id TEXT, -- Physical ID
    encrypted_payload TEXT NOT NULL, -- Logical ID
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 8. Admin Medical Entry Workflow (Pending Data)
CREATE TABLE IF NOT EXISTS pending_medical_data_requests (
    id TEXT PRIMARY KEY, -- UUID
    policy_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'skipped')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
