import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.models import Role, User, Institute, Teacher, Batch, Student, AdmissionInquiry, InquiryStatus
from app.core.security import get_password_hash, create_access_token
from datetime import datetime, timezone, date

client = TestClient(app)

def test_teacher_lifecycle_and_deactivation_security(db_session, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}

    # 1. Create a teacher
    create_payload = {
        "name": "Prof. Anwar Hossain",
        "email": "anwar.teacher@test.com",
        "password": "SecurePassword123!",
        "subject": "Physics",
        "phone": "01711223344"
    }
    create_res = client.post("/api/v1/teachers/", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    teacher_id = create_res.json()["id"]

    # 2. Update teacher profile
    update_payload = {
        "name": "Prof. Anwar Hossain PhD",
        "subject": "Advanced Physics",
        "phone": "01799887766"
    }
    update_res = client.put(f"/api/v1/teachers/{teacher_id}", json=update_payload, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Prof. Anwar Hossain PhD"
    assert update_res.json()["subject"] == "Advanced Physics"

    # 3. Reset teacher password
    reset_res = client.post(
        f"/api/v1/teachers/{teacher_id}/reset-password",
        json={"password": "NewSecretPassword2026!"},
        headers=headers
    )
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True

    # 4. Verify teacher can log in with new password
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "anwar.teacher@test.com", "password": "NewSecretPassword2026!"}
    )
    assert login_res.status_code == 200

    # 5. Deactivate teacher
    status_res = client.post(
        f"/api/v1/teachers/{teacher_id}/status",
        json={"is_active": False},
        headers=headers
    )
    assert status_res.status_code == 200
    assert status_res.json()["isActive"] is False

    # 6. Verify deactivated teacher login is REJECTED with 403
    deactivated_login = client.post(
        "/api/v1/auth/login",
        json={"email": "anwar.teacher@test.com", "password": "NewSecretPassword2026!"}
    )
    assert deactivated_login.status_code == 403
    assert "deactivated" in deactivated_login.json()["detail"].lower()


def test_admission_inquiries_and_website_api(db_session, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}
    institute_id = "inst-1"

    # 1. Submit public inquiry with valid BD mobile
    inquiry_payload = {
        "name": "Sabbir Ahmed",
        "phone": "01712345678",
        "email": "sabbir@gmail.com",
        "course_interest": "HSC 2026 Physics",
        "notes": "Interested in morning batch"
    }
    sub_res = client.post(f"/api/v1/institutes/{institute_id}/inquiries", json=inquiry_payload)
    assert sub_res.status_code == 201
    assert sub_res.json()["success"] is True

    # 2. Reject invalid phone number
    bad_phone_payload = {
        "name": "Spam User",
        "phone": "12345",
        "email": "bad@spam.com"
    }
    bad_res = client.post(f"/api/v1/institutes/{institute_id}/inquiries", json=bad_phone_payload)
    assert bad_res.status_code == 422

    # 3. Anti-spam honeypot silent ignore
    honeypot_payload = {
        "name": "Bot User",
        "phone": "01788990011",
        "website_url_hp": "http://spamsite.com"
    }
    hp_res = client.post(f"/api/v1/institutes/{institute_id}/inquiries", json=honeypot_payload)
    assert hp_res.status_code == 201

    # 4. Owner reads inquiries
    leads_res = client.get("/api/v1/inquiries", headers=headers)
    assert leads_res.status_code == 200
    leads = leads_res.json()
    assert len(leads) >= 1
    target_lead = next(l for l in leads if l["name"] == "Sabbir Ahmed")
    assert target_lead["status"] == "NEW"

    # 5. Owner updates inquiry status to CONTACTED
    patch_res = client.patch(
        f"/api/v1/inquiries/{target_lead['id']}/status",
        json={"status": "CONTACTED"},
        headers=headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "CONTACTED"

    # 6. Update website settings
    web_settings = {
        "hero_headline": "Premier Academic Excellence",
        "hero_subhead": "Empowering students across Dhaka",
        "contact_phone": "01700000000",
        "contact_email": "contact@showcase.eduflow.bd",
        "about_text": "Top coaching institute in Bangladesh."
    }
    put_web = client.put("/api/v1/settings/website", json=web_settings, headers=headers)
    assert put_web.status_code == 200

    # 7. Get public institute showcase
    public_res = client.get(f"/api/v1/institutes/public/{institute_id}")
    assert public_res.status_code == 200
    pub_data = public_res.json()
    assert pub_data["heroHeadline"] == "Premier Academic Excellence"
    assert "courses" in pub_data
    assert "faculty" in pub_data


def test_quick_search_and_attendance_reports(db_session, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}

    # 1. Search with short query -> empty
    short_res = client.get("/api/v1/core/search?q=a", headers=headers)
    assert short_res.status_code == 200
    assert short_res.json() == {"students": [], "teachers": [], "batches": []}

    # 2. Search with query matching students/batches
    search_res = client.get("/api/v1/core/search?q=Student", headers=headers)
    assert search_res.status_code == 200
    data = search_res.json()
    assert "students" in data
    assert "teachers" in data
    assert "batches" in data
    assert len(data["students"]) >= 1

    # 3. Attendance period report
    report_res = client.get("/api/v1/core/reports/attendance", headers=headers)
    assert report_res.status_code == 200
    rep_data = report_res.json()
    assert "totalSessions" in rep_data
    assert "overallPercentage" in rep_data
    assert "students" in rep_data

    # 4. Attendance report CSV export
    csv_res = client.get("/api/v1/core/reports/attendance?export_csv=true", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
