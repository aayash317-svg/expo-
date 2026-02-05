from flask import Flask, render_template, g, request, redirect, url_for, session
from dotenv import load_dotenv
import api
import os

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-dev-key')

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
    return render_template('dashboard.html')

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
    """View patient records. Takes UUID now."""
    if 'user_id' not in session:
        return redirect(url_for('index'))
    
    # We pass the ID to the template. The template JS fetches details via API.
    # We can fetch basic Name info here if we want, but better to let API handle it consistency
    # Hack: Pass a dummy object so template {{ patient.id }} works.
    # Actually, let's fetch the name to be nice.
    from supabase_client import get_supabase_client
    supabase = get_supabase_client()
    try:
        # Get Profile for Name
        prof = supabase.table('profiles').select('full_name').eq('id', str(patient_id)).execute()
        full_name = prof.data[0]['full_name'] if prof.data else "Unknown Patient"
    except:
        full_name = "Loading..."

    patient = {'id': str(patient_id), 'full_name': full_name}
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
    
    # Assume logged in user is the provider. 
    # In real app we'd check role='insurance'.
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
    patient_identifier = request.form.get('patient_email') # Changed from patient_id to email for resolution
    policy_number = request.form.get('policy_number')
    coverage = request.form.get('coverage_amount')
    valid_until = request.form.get('valid_until')
    
    try:
        from insurance_service import generate_policy
        generate_policy(provider_id, patient_identifier, policy_number, coverage, valid_until)
        return redirect(url_for('insurance_policies'))
    except ValueError as e:
        return f"Input Error: {e}", 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        if "UNIQUE constraint failed" in str(e):
             return "Error: This Policy Number already exists. Please use a different one.", 400
        return f"Error creating policy: {e}", 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
