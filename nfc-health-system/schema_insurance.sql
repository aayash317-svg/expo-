CREATE TABLE IF NOT EXISTS insurance_policies (
    id TEXT PRIMARY KEY, -- UUID
    patient_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL, -- Hospital/Insurance ID
    policy_number TEXT UNIQUE NOT NULL,
    coverage_amount REAL NOT NULL,
    status TEXT DEFAULT 'active',
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (provider_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS policy_artifacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_id TEXT NOT NULL,
    encrypted_identity TEXT NOT NULL, -- The specific centralized Encrypted ID
    qr_code_path TEXT, -- Path to generated image
    nfc_payload TEXT, -- The simulated NFC string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_id) REFERENCES insurance_policies(id)
);
