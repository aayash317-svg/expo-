import sqlite3
import uuid
import os
import json
import base64
from datetime import datetime
import qrcode
from cryptography.fernet import Fernet
from database import get_db

# --- CONFIGURATION ---
# In production, this key MUST be secure (env var). For demo:
KEY_FILE = 'secret.key'

def get_or_create_key():
    """Load or create a Fernet key for encryption."""
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, 'rb') as f:
            return f.read()
    else:
        key = Fernet.generate_key()
        with open(KEY_FILE, 'wb') as f:
            f.write(key)
        return key

CIPHER = Fernet(get_or_create_key())

QR_FOLDER = os.path.join('static', 'qrcodes')
os.makedirs(QR_FOLDER, exist_ok=True)

def generate_policy(provider_id, patient_identifier, policy_number, coverage_amount, valid_until):
    """
    Atomic creation of Policy + Encrypted ID + QR + NFC.
    Resolves patient_identifier (Email/ID) to Patient UUID.
    """
    db = get_db()
    cursor = db.cursor()

    # 0. Identity Resolution (Email -> UUID)
    cursor.execute("SELECT id, email FROM patients WHERE email = ? OR id = ?", (patient_identifier, patient_identifier))
    patient = cursor.fetchone()
    
    if not patient:
        raise ValueError(f"Identity Resolution Failed: Patient not found with identifier '{patient_identifier}'")
    
    patient_id = patient['id']
    
    # 1. Generate unique Policy UUID
    policy_id = str(uuid.uuid4())
    
    # 2. Generate Encrypted Identity Payload
    # We encrypt: {policy_id, patient_id, valid_until}
    identity_payload = json.dumps({
        "pid": policy_id,
        "uid": str(patient_id),
        "exp": valid_until
    })
    encrypted_identity = CIPHER.encrypt(identity_payload.encode()).decode()
    
    # 3. Generate QR Code
    qr_filename = f"{policy_id}.png"
    qr_path = os.path.join(QR_FOLDER, qr_filename)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(encrypted_identity)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(qr_path)
    
    # Relative path for web
    web_qr_path = f"qrcodes/{qr_filename}"
    
    # 4. Generate NFC Payload (Simulated)
    # Just the encrypted string, but potentially formatted for NDEF later
    nfc_payload = f"nfchealth://policy/{encrypted_identity}"
    
    # 5. Database Interaction (Atomic)
    # We use a NEW connection to control the transaction explicitly, or use the Flask g.db
    # Flask's get_db() is per-request. We'll use it assuming we are in a request context.
    # If this service is run outside request, we need manual conn.
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # A. Insert Policy
        cursor.execute("""
            INSERT INTO insurance_policies (id, patient_id, provider_id, policy_number, coverage_amount, valid_until, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (policy_id, patient_id, provider_id, policy_number, coverage_amount, valid_until, 'active'))
        
        # B. Insert Artifacts
        cursor.execute("""
            INSERT INTO policy_artifacts (policy_id, encrypted_identity, qr_code_path, nfc_payload)
            VALUES (?, ?, ?, ?)
        """, (policy_id, encrypted_identity, web_qr_path, nfc_payload))
        
        db.commit()
        
        return {
            "id": policy_id,
            "policy_number": policy_number,
            "qr_url": web_qr_path,
            "nfc_payload": nfc_payload
        }
        
    except Exception as e:
        db.rollback()
        # Clean up image if DB failed
        if os.path.exists(qr_path):
            os.remove(qr_path)
        raise e

def get_all_policies(provider_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        SELECT p.*, a.qr_code_path, pt.full_name as patient_name
        FROM insurance_policies p
        JOIN policy_artifacts a ON p.id = a.policy_id
        LEFT JOIN patients pt ON p.patient_id = pt.id
        WHERE p.provider_id = ?
        ORDER BY p.created_at DESC
    """, (provider_id,))
    return cursor.fetchall()
