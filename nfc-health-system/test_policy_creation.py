from app import app
from insurance_service import generate_policy
import sys

def test_creation():
    print("Testing Policy Creation...")
    with app.app_context():
        try:
            # Try to create a policy for the seeded patient
            result = generate_policy(
                provider_id=999, # Dummy provider
                patient_identifier='patient@example.com', # The email we seeded
                policy_number='TEST-POLICY-AUTO-1',
                coverage_amount=10000,
                valid_until='2025-12-31'
            )
            print("SUCCESS: Policy Created!")
            print(result)
        except Exception as e:
            print(f"FAILURE: {e}")
            sys.exit(1)

if __name__ == "__main__":
    test_creation()
