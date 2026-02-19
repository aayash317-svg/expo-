from flask import Flask, render_template, g, request, redirect, url_for, session
from dotenv import load_dotenv
import api
import os
from database import query_db, close_connection

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-dev-key')

# Register Database Teardown
app.teardown_appcontext(close_connection)

# Register API Blueprint
app.register_blueprint(api.bp)

# UI Routes
@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('dashboard.html', user_name=session.get('user_name'))

@app.route('/hospital/profile')
def hospital_profile():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('profile.html')

@app.route('/patient/access')
def patient_access():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('patient_access.html')

@app.route('/patient/<uuid:patient_id>/view')
def patient_view(patient_id):
    """View patient records."""
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    try:
        patient_id_str = str(patient_id)
        # Fetch Patient Details from SQLite
        patient_row = query_db("SELECT * FROM patients WHERE id = ?", (patient_id_str,), one=True)
        
        if patient_row:
            patient = dict(patient_row) # Convert Row to dict
        else:
            patient = {'id': patient_id_str, 'full_name': 'Unknown (Recommended: Register Patient)'}
            
    except Exception as e:
        print(f"Error fetching patient: {e}")
        patient = {'id': str(patient_id), 'full_name': 'Error loading'}

    return render_template('patient_view.html', patient=patient)

@app.route('/patient/<uuid:patient_id>/add')
def add_medical_data(patient_id):
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('add_medical_data.html', patient_id=patient_id)

@app.route('/settings')
def settings():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('settings.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/insurance/policies')
def insurance_policies():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    provider_id = session.get('user_id')
    
    try:
        from insurance_service import get_all_policies
        policies = get_all_policies(provider_id)
    except Exception as e:
        print(f"Error fetching policies: {e}")
        policies = []
        
    return render_template('policies.html', policies=policies)

@app.route('/insurance/policies/create', methods=['POST'])
def create_policy_route():
    if 'user_id' not in session:
        return redirect(url_for('index'))
        
    provider_id = session.get('user_id')
    # Use patient_email to look up patient? Or create new?
    # Prompt says: "When a new insurance policy is created: Create policy record. If patient does NOT already have... Create medical dataset entry... Generate QR... NFC..."
    
    patient_identifier = request.form.get('patient_email') 
    policy_number = request.form.get('policy_number')
    coverage = request.form.get('coverage_amount')
    valid_until = request.form.get('valid_until')
    
    try:
        from insurance_service import generate_policy
        # We need to pass the form data. 
        # Note: insurance_service needs to be refactored next.
        generate_policy(provider_id, patient_identifier, policy_number, coverage, valid_until)
        return redirect(url_for('insurance_policies'))
    except ValueError as e:
        return f"Input Error: {e}", 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        if "UNIQUE constraint failed" in str(e):
             return "Error: This Policy Number already exists.", 400
        return f"Error creating policy: {e}", 500

@app.route('/scan')
def scan_qr():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('scan.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)

@app.route('/admin/dashboard')
def admin_dashboard():
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect(url_for('index'))
    
    # Fetch pending requests
    requests = query_db("""
        SELECT r.id, r.status, r.created_at, p.full_name as patient_name, pol.policy_number
        FROM pending_medical_data_requests r
        JOIN patients p ON r.patient_id = p.id
        JOIN policies pol ON r.policy_id = pol.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at DESC
    """)
    return render_template('admin_dashboard.html', requests=requests)

@app.route('/admin/medical-entry/<request_id>', methods=['GET', 'POST'])
def admin_medical_entry(request_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect(url_for('index'))

    req = query_db("SELECT * FROM pending_medical_data_requests WHERE id = ?", (request_id,), one=True)
    if not req:
        return "Request not found", 404

    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        
        try:
             # Create separate connection for transaction
            conn = get_db()
            cursor = conn.cursor()
            
            # 1. Create Medical Record
            import uuid
            new_id = str(uuid.uuid4())
            # Admin is the "hospital" or source here? Or leave hospital_id NULL?
            # Schema says hospital_id references hospitals table. Admin is not a hospital.
            # So leave it NULL or add an "Admin" hospital entry?
            # Schema comment: "-- Nullable if added by Admin/System" -> So NULL is fine.
            
            cursor.execute("""
                INSERT INTO medical_records (id, patient_id, hospital_id, record_type, title, description)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (new_id, req['patient_id'], None, 'text', title, description))
            
            # 2. Update Request Status
            cursor.execute("UPDATE pending_medical_data_requests SET status = 'completed' WHERE id = ?", (request_id,))
            
            conn.commit()
            return redirect(url_for('admin_dashboard'))
            
        except Exception as e:
            conn.rollback()
            return f"Error: {e}", 500

    return render_template('admin_medical_entry.html', req=req)
