import requests
import json
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import jwt

DATABASE_URL = "postgresql://syed@localhost:5432/eduflow?sslmode=disable"
SECRET_KEY = "eduflow_secret_development_key_2026_bd"
ALGORITHM = "HS256"

def create_token(user_id, role, institute_id, email, expired=False, invalid=False):
    if invalid:
        return "invalid_token_string"
    
    expires_delta = timedelta(minutes=-10) if expired else timedelta(minutes=60)
    expire = datetime.now(timezone.utc) + expires_delta
    
    to_encode = {
        "id": user_id,
        "role": role,
        "instituteId": institute_id,
        "email": email,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

BASE_URL = "http://127.0.0.1:8001"

def check_endpoint(name, method, url, headers=None, data=None, expected_status=None):
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{url}", headers=headers)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{url}", headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(f"{BASE_URL}{url}", headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(f"{BASE_URL}{url}", headers=headers)
        
        status_match = "PASS" if not expected_status or response.status_code in expected_status else "FAIL"
        
        print(f"[{status_match}] {name} - {method} {url} - Status: {response.status_code}")
        if status_match == "FAIL" or response.status_code >= 400:
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"[ERROR] {name} - {str(e)}")

if __name__ == "__main__":
    token_a_owner = create_token("user_a", "OWNER", "inst_a", "a@a.com")
    headers_a = {"Authorization": f"Bearer {token_a_owner}"}
    
    print("\n=== Testing Dashboard & Core Endpoints ===")
    check_endpoint("Fee Reminder", "GET", "/api/v1/core/dashboard/fee-reminder", headers_a, expected_status=[200])
    check_endpoint("KPI", "GET", "/api/v1/core/dashboard/kpi", headers_a, expected_status=[200])
    check_endpoint("Notices (GET)", "GET", "/api/v1/core/notices", headers_a, expected_status=[200])
    check_endpoint("Settings Language (PUT)", "PUT", "/api/v1/core/settings/language", headers_a, data={"language": "bn"}, expected_status=[200])
    check_endpoint("Settings Profile (PUT)", "PUT", "/api/v1/core/settings/profile", headers_a, data={"name": "New Name"}, expected_status=[200])
