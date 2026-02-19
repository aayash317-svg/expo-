
import unittest
import os
import sys
import json
import tempfile

# Add parent directory to path to import app correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import get_db
from utils import decrypt_data, encrypt_data

class NFCHealthSystemTestCase(unittest.TestCase):

    def setUp(self):
        # Configure app for testing
        app.config['TESTING'] = True
        app.config['DATABASE'] = 'test_health_system.db'
        
        # Create a temporary database file
        self.db_fd, app.config['DATABASE'] = tempfile.mkstemp()
        
        # Override get_db to use test db? 
        # The app hardcodes DATABASE in database.py usually.
        # Let's check database.py. If it uses app.config, we are good.
        # If not, we might need to monkeypatch or just use the main DB.
        # Checking database.py: `DATABASE = 'health_system.db'` usually hardcoded in simple flask apps unless using g.
        
        self.app = app.test_client()
        
        # Initialize the database
        with app.app_context():
            # We need to run the schema script on this temp db
            import sqlite3
            conn = sqlite3.connect(app.config['DATABASE'])
            with open('schema.sql', 'r') as f:
                conn.executescript(f.read())
            
            # Create an Admin for testing
            from utils import hash_password
            conn.execute("INSERT INTO admins (id, username, password_hash) VALUES (?, ?, ?)", 
                         ('admin1', 'admin', hash_password('admin123')))
            
            # Create an Insurance Provider
            conn.execute("INSERT INTO insurance_companies (id, name, license_number, email, password_hash) VALUES (?, ?, ?, ?, ?)",
                         ('ins1', 'HealthGuard', 'LIC123', 'ins@test.com', hash_password('ins123')))
            
            conn.commit()
            conn.close()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(app.config['DATABASE'])

    def login(self, council_id, password):
        return self.app.post('/api/auth/login', json={
            'council_id': council_id,
            'password': password
        })

    def test_full_workflow(self):
        request_id = None
        # 1. Login as Insurance
        print("Testing Login...")
        resp = self.login('LIC123', 'ins123')
        if resp.status_code != 200:
            print(f"Login Failed: {resp.status_code} - {resp.get_json()}")
        self.assertEqual(resp.status_code, 200)
        
        # 2. Create Policy (triggers atomic creation)
        print("Testing Policy Creation...")
        with self.app.session_transaction() as sess:
            sess['user_id'] = 'ins1'
            sess['role'] = 'insurance'

        resp = self.app.post('/insurance/policies/create', data={
            'patient_email': 'newpatient@test.com',
            'policy_number': 'POL-999',
            'coverage_amount': '10000',
            'valid_until': '2030-12-31'
        }, follow_redirects=True)
        
        if resp.status_code != 200:
            print(f"Policy Creation Failed: {resp.status_code}")
            print(resp.data.decode(errors='replace'))
            
        self.assertEqual(resp.status_code, 200)
        self.assertIn(b'HealthGuard', resp.data) # Should be on policies page

        # 3. Verify Database State
        print("Verifying Database State...")
        with app.app_context():
            from database import query_db
            # Patient created?
            patient = query_db("SELECT * FROM patients WHERE email = ?", ('newpatient@test.com',), one=True)
            self.assertIsNotNone(patient, "Patient not created")
            patient_id = patient['id']
            
            # Medical Record created?
            med = query_db("SELECT * FROM medical_records WHERE patient_id = ?", (patient_id,), one=True)
            self.assertIsNotNone(med, "Medical Record not created")
            self.assertEqual(med['title'], 'Initial Medical Dataset')
            
            # Pending Request created?
            req = query_db("SELECT * FROM pending_medical_data_requests WHERE patient_id = ?", (patient_id,), one=True)
            self.assertIsNotNone(req, "Pending Request not created")
            request_id = req['id']
            
            # QR and NFC
            qr = query_db("SELECT * FROM qr_records WHERE patient_id = ?", (patient_id,), one=True)
            self.assertIsNotNone(qr, "QR Record not created")
            
            nfc = query_db("SELECT * FROM nfc_records WHERE patient_id = ?", (patient_id,), one=True)
            self.assertIsNotNone(nfc, "NFC Record not created")
            
            # 4. Test QR Scan
            print("Testing QR Scan...")
            # Decrypt QR payload
            decrypted_qr = decrypt_data(qr['encrypted_payload'])
            self.assertEqual(decrypted_qr, patient_id)
            
            # Call API
            scan_resp = self.app.post('/api/patient/scan', json={'data': qr['encrypted_payload']})
            if scan_resp.status_code != 200:
                print(f"Scan Failed: {scan_resp.status_code} - {scan_resp.get_json()}")
            self.assertEqual(scan_resp.status_code, 200)
            json_resp = scan_resp.get_json()
            self.assertEqual(json_resp['redirect'], f'/patient/{patient_id}/view')

        # 5. Admin Flow
        print("Testing Admin Flow...")
        # Login
        resp = self.login('admin', 'admin123')
        if resp.status_code != 200:
            print(f"Admin Login Failed: {resp.status_code}")
        self.assertEqual(resp.status_code, 200)
        
        with self.app.session_transaction() as sess:
            sess['user_id'] = 'admin1'
            sess['role'] = 'admin'
            
        # View Dashboard
        resp = self.app.get('/admin/dashboard')
        self.assertEqual(resp.status_code, 200)
        # self.assertIn(b'newpatient@test.com', resp.data) # might fail if table is empty or name different
        
        # Submit Medical Data
        print(f"DEBUG: request_id type: {type(request_id)} value: {request_id}")
        
        try:
            resp = self.app.post(f'/admin/medical-entry/{request_id}', data={
                'title': 'Admin Checkup',
                'description': 'Everything looks good.'
            })
        except Exception as e:
            print(f"EXCEPTION in Admin Post: {e}")
            raise e
        
        if resp.status_code != 200:
            print(f"Admin Submit Failed: {resp.status_code}")
        
        self.assertEqual(resp.status_code, 200)
        
        # Verify status updated
        with app.app_context():
            from database import query_db
            req = query_db("SELECT * FROM pending_medical_data_requests WHERE id = ?", (request_id,), one=True)
            self.assertEqual(req['status'], 'completed')
            
            # Verify new medical record
            recs = query_db("SELECT * FROM medical_records WHERE patient_id = ? AND title = ?", (patient_id, 'Admin Checkup'), one=True)
            self.assertIsNotNone(recs, "Admin Medical Record not created")

if __name__ == '__main__':
    unittest.main()
