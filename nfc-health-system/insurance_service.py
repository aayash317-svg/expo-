import os
import json
import datetime
import qrcode
from database import get_db, execute_db, query_db
from utils import generate_uuid, encrypt_data

QR_FOLDER = os.path.join('static', 'qrcodes')
os.makedirs(QR_FOLDER, exist_ok=True)

def generate_policy(provider_id, patient_identifier, policy_number, coverage_amount, valid_until):
    """
    Atomic creation of Policy + Medical Record (if missing) + QR + NFC.
    """
    # 0. Resolve Patient
    # Try by Email or ID
    patient = query_db("SELECT id, email, full_name FROM patients WHERE email = ? OR id = ?", (patient_identifier, patient_identifier), one=True)
    
    conn = get_db()
    cursor = conn.cursor()

    try:
        if not patient:
            # Auto-register logic
            if '@' in patient_identifier:
                patient_id = generate_uuid()
                # Use cursor here to be part of transaction if possible, but patient creation might need to be committed 
                # for foreign keys to work if we weren't in a transaction already? 
                # Actually, if we use the same connection/cursor, it's fine.
                cursor.execute("INSERT INTO patients (id, email, full_name, dob) VALUES (?, ?, ?, ?)", 
                           (patient_id, patient_identifier, "New Patient", "2000-01-01"))
            else:
                raise ValueError(f"Patient not found with identifier '{patient_identifier}'")
        else:
            patient_id = patient['id']

        # 1. Create Policy
        policy_id = generate_uuid()
        cursor.execute("""
            INSERT INTO policies (id, patient_id, provider_id, policy_number, coverage_amount, valid_until, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (policy_id, patient_id, provider_id, policy_number, coverage_amount, valid_until, 'active'))

        # 2. Check/Create Medical Record
        # "If patient does NOT already have a medical dataset"
        cursor.execute("SELECT id FROM medical_records WHERE patient_id = ?", (patient_id,))
        has_medical_data = cursor.fetchone()
        
        if not has_medical_data:
            # Create a placeholder medical dataset entry
            med_id = generate_uuid()
            cursor.execute("""
                INSERT INTO medical_records (id, patient_id, hospital_id, record_type, title, description)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (med_id, patient_id, provider_id, 'text', 'Initial Medical Dataset', 'Created automatically with Insurance Policy.'))

            # NEW: Create pending_medical_data_requests entry
            req_id = generate_uuid()
            cursor.execute("""
                INSERT INTO pending_medical_data_requests (id, policy_id, patient_id, status)
                VALUES (?, ?, ?, ?)
            """, (req_id, policy_id, patient_id, 'pending'))

        # 3. Generate QR Record
        encrypted_pid = encrypt_data(patient_id)
        
        qr_id = generate_uuid()
        qr_filename = f"{qr_id}.png"
        qr_path_abs = os.path.join(QR_FOLDER, qr_filename)
        qr_path_rel = f"qrcodes/{qr_filename}"
        
        # Generate Image
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(encrypted_pid)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(qr_path_abs)
        
        cursor.execute("""
            INSERT INTO qr_records (id, patient_id, encrypted_payload, image_path)
            VALUES (?, ?, ?, ?)
        """, (qr_id, patient_id, encrypted_pid, qr_path_rel))
        
        cursor.execute("UPDATE patients SET qr_code = ? WHERE id = ?", (qr_path_rel, patient_id))

        # 4. Generate NFC Record
        nfc_id = generate_uuid()
        physical_tag_id = os.urandom(4).hex().upper() 
        encrypted_nfc_payload = encrypt_data({"pid": patient_id, "type": "nfc_access"})
        
        cursor.execute("""
            INSERT INTO nfc_records (id, patient_id, tag_id, encrypted_payload)
            VALUES (?, ?, ?, ?)
        """, (nfc_id, patient_id, physical_tag_id, encrypted_nfc_payload))
        
        cursor.execute("UPDATE patients SET nfc_id = ?, generated_nfc_id = ? WHERE id = ?", (physical_tag_id, encrypted_nfc_payload, patient_id))

        conn.commit()
        return policy_id

    except Exception as e:
        conn.rollback()
        if 'qr_path_abs' in locals() and os.path.exists(qr_path_abs):
            os.remove(qr_path_abs)
        raise e

def get_all_policies(provider_id):
    # Update query to match new schema
    return query_db("""
        SELECT p.*, pt.full_name as patient_name, pt.qr_code as qr_code_path
        FROM policies p
        LEFT JOIN patients pt ON p.patient_id = pt.id
        WHERE p.provider_id = ?
        ORDER BY p.created_at DESC
    """, (provider_id,))

