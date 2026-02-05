from app import app
import sys

def test_endpoint():
    print("Testing Flask Endpoint /insurance/policies/create...")
    with app.test_client() as client:
        # Simulate login by setting session
        with client.session_transaction() as sess:
            sess['user_id'] = 999
        
        import uuid
        unique_policy = f"POL-{uuid.uuid4().hex[:8]}"
        response = client.post('/insurance/policies/create', data={
            'patient_email': 'patient@example.com',
            'policy_number': unique_policy,
            'coverage_amount': '15000',
            'valid_until': '2025-12-31'
        }, follow_redirects=False)
        
        if response.status_code == 302:
            print("SUCCESS: POST returned 302 Redirect.")
            # Now follow the redirect manually
            redirect_url = response.headers['Location']
            print(f"Following redirect to: {redirect_url}")
            resp2 = client.get(redirect_url)
            if resp2.status_code == 200:
                print("SUCCESS: Listing Page returned 200.")
            else:
                print(f"FAILURE: Listing Page returned {resp2.status_code}")
                # print(resp2.data.decode(errors='ignore'))
        else:
            print(f"FAILURE: POST returned {response.status_code}")
            print(f"Response: {response.data}")

if __name__ == "__main__":
    test_endpoint()
