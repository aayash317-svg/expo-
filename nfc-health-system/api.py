from flask import Blueprint, request, jsonify, session, g
from database import query_db, execute_db
from utils import hash_password, verify_password, generate_uuid
import datetime

bp = Blueprint('api', __name__, url_prefix='/api')

# --- Authentication ---

@bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    council_id = data.get('council_id')
    email = data.get('email')
    password = data.get('password')

    if not all([name, council_id, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    # check if exists
    existing = query_db("SELECT id FROM hospitals WHERE council_id = ? OR email = ?", (council_id, email), one=True)
    if existing:
        return jsonify({'error': 'Hospital with this Council ID or Email already exists.'}), 400

    try:
        new_id = generate_uuid()
        hashed_pw = hash_password(password)
        
        execute_db(
            "INSERT INTO hospitals (id, name, council_id, email, password_hash) VALUES (?, ?, ?, ?, ?)",
            (new_id, name, council_id, email, hashed_pw)
        )
        
        return jsonify({'message': 'Registration successful'}), 201

    except Exception as e:
        return jsonify({'error': f'Registration Error: {str(e)}'}), 500

@bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    # Accept any of the valid identifier keys
    identifier = data.get('council_id') or data.get('license_number') or data.get('username')
    password = data.get('password')
    
    if not identifier or not password:
        return jsonify({'error': 'Missing Council ID, License Number, or Password'}), 400

    # Try finding in Hospitals
    user = query_db("SELECT * FROM hospitals WHERE council_id = ?", (identifier,), one=True)
    role = 'hospital'
    
    if not user:
        # Try Insurance
        user = query_db("SELECT * FROM insurance_companies WHERE license_number = ?", (identifier,), one=True)
        role = 'insurance'
    
    if not user:
        # Try Admin
        user = query_db("SELECT * FROM admins WHERE username = ?", (identifier,), one=True)
        role = 'admin'

    if user and verify_password(user['password_hash'], password):
        session.clear()
        session['user_id'] = user['id']
        session['user_name'] = user['name'] if role != 'admin' else user['username']
        session['role'] = role
        
        redirect_url = '/dashboard'
        if role == 'insurance': redirect_url = '/insurance/policies'
        if role == 'admin': redirect_url = '/admin/dashboard'
        
        return jsonify({'message': 'Login successful', 'redirect': redirect_url, 'role': role}), 200
    else:
        return jsonify({'error': 'Invalid Credentials'}), 401

# --- Patient Data ---

@bp.route('/patient/scan', methods=['POST'])
def scan_patient():
    data = request.get_json()
    # Support both 'data' (from scan.html) and 'scan_data' (legacy/api)
    encrypted_payload = data.get('data') or data.get('scan_data')

    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized: Please login first'}), 401
        
    if not encrypted_payload:
        return jsonify({'error': 'No data provided'}), 400
        
    try:
        from utils import decrypt_data
        import json
        
        # 1. Try to decrypt (for legacy/NFC encrypted tags)
        decrypted = decrypt_data(encrypted_payload)
        
        # 2. Determine raw data to parse
        raw_data = decrypted if decrypted else encrypted_payload
        patient_id = None
        patient_name = "New Patient"
        patient_dob = "2000-01-01"
        
        # 3. Try parsing as JSON (New system uses raw JSON QR)
        try:
            payload = json.loads(raw_data)
            if isinstance(payload, dict):
                # Check for various ID keys
                patient_id = payload.get('patient_id') or payload.get('id') or payload.get('pid')
                patient_name = payload.get('name') or payload.get('full_name') or "New Patient"
                patient_dob = payload.get('dob') or "2000-01-01"
        except:
            # Not JSON, treat as raw ID
            patient_id = raw_data

        if not patient_id:
            return jsonify({'error': 'Invalid payload: No patient ID found'}), 400

        # 4. Verify/Sync patient in local SQLite
        patient = query_db("SELECT * FROM patients WHERE id = ?", (patient_id,), one=True)
        
        if not patient:
            # Auto-Sync: Add to local database if it came from the trusted system
            print(f"Auto-syncing patient: {patient_id}")
            try:
                execute_db(
                    "INSERT INTO patients (id, full_name, dob, email) VALUES (?, ?, ?, ?)",
                    (patient_id, patient_name, patient_dob, f"sync_{patient_id[:8]}@example.com")
                )
                patient = query_db("SELECT * FROM patients WHERE id = ?", (patient_id,), one=True)
            except Exception as e:
                print(f"Auto-sync error: {e}")

        if patient:
            return jsonify({
                'patient_id': patient['id'], 
                'redirect': f'/patient/{patient["id"]}/view'
            }), 200
        else:
             return jsonify({'error': 'Patient not found and could not be synced'}), 404

    except Exception as e:
        print(f"Scan Error: {e}")
        return jsonify({'error': str(e)}), 500

@bp.route('/patient/<patient_id>/records', methods=['GET'])
def get_records(patient_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        records = query_db("""
            SELECT m.*, h.name as hospital_name 
            FROM medical_records m 
            LEFT JOIN hospitals h ON m.hospital_id = h.id 
            WHERE m.patient_id = ? 
            ORDER BY m.created_at DESC
        """, (patient_id,))
        
        # Convert to list of dicts for JSON serialization
        results = []
        for r in records:
            results.append({
                'id': r['id'],
                'record_type': r['record_type'],
                'data_payload': r['description'],
                'summary': r['title'],
                'created_at': r['created_at'],
                'hospital_name': r['hospital_name'] or 'Unknown/Admin'
            })
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/patient/<patient_id>/add', methods=['POST'])
def add_record(patient_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    record_type = data.get('record_type', 'text')
    payload = data.get('data_payload')
    summary = data.get('summary')
    hospital_id = session['user_id']
    
    # Validation
    if not payload:
        return jsonify({'error': 'Data empty'}), 400

    try:
        new_id = generate_uuid()
        
        # 1. Save to Local SQLite (for offline/performance)
        execute_db("""
            INSERT INTO medical_records (id, patient_id, hospital_id, record_type, title, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (new_id, patient_id, hospital_id, record_type, summary, payload))

        # 2. Sync to Supabase (Global Visibility)
        import os
        import requests
        
        supabase_url = os.environ.get('SUPABASE_URL')
        supabase_service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
        
        if supabase_url and supabase_service_key:
            try:
                # We use the Service Role key to bypass RLS and ensure the write succeeds
                sync_url = f"{supabase_url}/rest/v1/medical_records"
                headers = {
                    "apikey": supabase_service_key,
                    "Authorization": f"Bearer {supabase_service_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
                
                # Check if hospital_id exists in Supabase. 
                # If not (e.g. legacy local ID), we might need to use a fallback or skip.
                # But our current ID ccfb... should be valid if it was synced.
                
                payload_supabase = {
                    "id": new_id,
                    "patient_id": patient_id,
                    "hospital_id": hospital_id,
                    "record_type": record_type,
                    "title": summary,
                    "description": payload
                }
                
                resp = requests.post(sync_url, headers=headers, json=payload_supabase)
                if not resp.ok:
                    print(f"Supabase Sync Warning: {resp.text}")
            except Exception as se:
                print(f"Supabase Sync Error: {se}")

        return jsonify({'message': 'Record saved and synced.', 'redirect': '/'}), 201
    except Exception as e:
        print(f"Add Record Error: {e}")
        return jsonify({'error': str(e)}), 500

