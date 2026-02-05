-- 1. Add email column (Without UNIQUE constraint to avoid SQLite error)
-- We wrap in a block or just ignore error if column exists (handled by python script logic)
ALTER TABLE patients ADD COLUMN email TEXT;

-- 2. Create Unique Index to enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- 3. Seed the patient
-- Using INSERT OR REPLACE to ensure the record exists with these details
INSERT OR REPLACE INTO patients (id, full_name, dob, email, nfc_id, qr_code)
VALUES (
    1, 
    'Test Patient', 
    '1990-01-01', 
    'patient@example.com', 
    'NFC_TEST_1', 
    'QR_TEST_1'
);
