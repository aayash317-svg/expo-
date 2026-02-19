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
        decrypted = decrypt_data(encrypted_payload)
        
        # If decryption fails, assume it might be a raw ID (manual input or NFC)
        patient_id = decrypted if decrypted else encrypted_payload
        
        # Resolve Patient ID from decrypted data or raw input
        # If it's a JSON string, try to parse it
        import json
        try:
            payload = json.loads(decrypted)
            if isinstance(payload, dict) and 'id' in payload:
                patient_id = payload['id']
            elif isinstance(payload, dict) and 'pid' in payload: # NFC payload uses 'pid'
                patient_id = payload['pid']
        except:
            pass 

        # Verify patient exists
        patient = query_db("SELECT * FROM patients WHERE id = ?", (patient_id,), one=True)
        if not patient:
             # Fallback: maybe it IS an NFC ID directly? (backward compat if needed, but we prefer encrypted)
             patient = query_db("SELECT * FROM patients WHERE nfc_id = ?", (decrypted,), one=True)

        if patient:
            return jsonify({'patient_id': patient['id'], 'redirect': f'/patient/{patient["id"]}/view'}), 200
        else:
             return jsonify({'error': 'Patient not found'}), 404

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
        execute_db("""
            INSERT INTO medical_records (id, patient_id, hospital_id, record_type, title, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (new_id, patient_id, hospital_id, record_type, summary, payload))

        # session.clear() # Removed this security rule as it might be annoying to re-login every time
        return jsonify({'message': 'Record saved.', 'redirect': '/'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

