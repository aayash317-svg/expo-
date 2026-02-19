import uuid
import json
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
import os

# Load or Generate Key
KEY_FILE = 'secret.key'
enc_key = os.environ.get('ENCRYPTION_KEY')

if enc_key:
    SECRET_KEY = enc_key.encode()
elif os.path.exists(KEY_FILE):
    with open(KEY_FILE, 'rb') as f:
        SECRET_KEY = f.read()
else:
    SECRET_KEY = Fernet.generate_key()
    with open(KEY_FILE, 'wb') as f:
        f.write(SECRET_KEY)

cipher_suite = Fernet(SECRET_KEY)

def generate_uuid():
    return str(uuid.uuid4())

def hash_password(password):
    return generate_password_hash(password)

def verify_password(stored_hash, password):
    return check_password_hash(stored_hash, password)

def encrypt_data(data):
    if not data: return None
    if isinstance(data, dict) or isinstance(data, list):
        data = json.dumps(data)
    return cipher_suite.encrypt(data.encode('utf-8')).decode('utf-8')

def decrypt_data(encrypted_data):
    if not encrypted_data: return None
    try:
        decrypted = cipher_suite.decrypt(encrypted_data.encode('utf-8')).decode('utf-8')
        # Try to parse as JSON if possible
        try:
            return json.loads(decrypted)
        except:
            return decrypted
    except Exception as e:
        print(f"Decryption error: {e}")
        return None
