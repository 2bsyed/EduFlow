import pytest
from app.models.models import StudentBatch, Teacher, Batch, Fee, Expense, ActivityLog

def test_teacher_crud_and_role_protection(client, owner_token, teacher_token, student_token):
    # 1. Student or Teacher cannot list all teachers
    res = client.get("/api/v1/teachers/", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

    res = client.get("/api/v1/teachers/", headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 403

    # 2. Owner can list teachers
    res = client.get("/api/v1/teachers/", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # 3. Owner can create a teacher
    new_teacher_data = {
        "name": "Jane Doe",
        "email": "janedoe@test.com",
        "password": "valid-strong-password-123",
        "subject": "Physics",
        "phone": "01700-000000"
    }
    res = client.post("/api/v1/teachers/", headers={"Authorization": f"Bearer {owner_token}"}, json=new_teacher_data)
    assert res.status_code == 201
    assert res.json()["name"] == "Jane Doe"

    # 4. Teacher can view their own profile
    res = client.get("/api/v1/teachers/me", headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200
    assert res.json()["subject"] == "Math"

def test_expenses_management_and_role_protection(client, owner_token, teacher_token, student_token):
    # 1. Non-owners cannot access expenses
    res = client.get("/api/v1/expenses/", headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 403
    res = client.get("/api/v1/expenses/", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

    # 2. Owner can record an expense
    expense_data = {
        "title": "Office Supplies",
        "category": "Office",
        "amount": 1500.0,
        "notes": "Pens, markers, paper"
    }
    res = client.post("/api/v1/expenses/", headers={"Authorization": f"Bearer {owner_token}"}, json=expense_data)
    assert res.status_code == 200
    data = res.json()
    assert data["title"] == "Office Supplies"
    assert data["amount"] == 1500.0

    # 3. Owner can list expenses
    res = client.get("/api/v1/expenses/", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 200
    assert len(res.json()) >= 1

def test_batches_crud_and_role_protection(client, owner_token, teacher_token, student_token):
    # 1. Student cannot list batches
    res = client.get("/api/v1/batches/", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

    # 2. Owner can list batches
    res = client.get("/api/v1/batches/", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 200

    # 3. Teacher can list their assigned batches
    res = client.get("/api/v1/batches/", headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 200

    # 4. Owner can create a batch
    batch_data = {
        "name": "HSC 2026 - Physics",
        "subject": "Physics",
        "schedule": "MWF 10:00 AM",
        "monthly_fee": 2500.0
    }
    res = client.post("/api/v1/batches/", headers={"Authorization": f"Bearer {owner_token}"}, json=batch_data)
    assert res.status_code == 201

def test_notices_system(client, owner_token, teacher_token, student_token, db_session):
    # Enroll student in batch-1
    db_session.add(StudentBatch(id="sb-test-1", institute_id="inst-1", student_id="student-1", batch_id="batch-1"))
    db_session.commit()

    # 1. Owner can post institute-wide notice
    owner_notice = {
        "title": "Winter Vacation",
        "content": "Institute will remain closed next week.",
        "category": "GENERAL",
        "urgent": False,
        "targetScope": "EVERYONE"
    }
    res = client.post("/api/v1/core/notices", headers={"Authorization": f"Bearer {owner_token}"}, json=owner_notice)
    assert res.status_code == 200

    # 2. Teacher can post batch notice to their assigned batch
    teacher_notice = {
        "title": "Upcoming Physics Quiz",
        "content": "Chapters 1 and 2 quiz on Monday.",
        "category": "ACADEMIC",
        "urgent": True,
        "targetScope": "BATCH",
        "batchId": "batch-1"
    }
    res = client.post("/api/v1/core/notices", headers={"Authorization": f"Bearer {teacher_token}"}, json=teacher_notice)
    assert res.status_code == 200

    # 3. Student can read notices (both everyone and their batch)
    res = client.get("/api/v1/core/notices", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    notices = res.json()["notices"]
    assert len(notices) >= 2

def test_settings_profile_and_language(client, owner_token, teacher_token, student_token):
    # 1. Non-owners cannot update settings
    res = client.put("/api/v1/core/settings/language", headers={"Authorization": f"Bearer {teacher_token}"}, json={"language": "bn"})
    assert res.status_code == 403

    res = client.put("/api/v1/core/settings/profile", headers={"Authorization": f"Bearer {student_token}"}, json={"name": "Hacked"})
    assert res.status_code == 403

    # 2. Owner can view profile
    res = client.get("/api/v1/core/settings/profile", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 200
    assert res.json()["name"] == "Institute 1"

    # 3. Owner can update profile
    res = client.put("/api/v1/core/settings/profile", headers={"Authorization": f"Bearer {owner_token}"}, json={
        "name": "Updated Institute 1",
        "address": "Dhaka, Bangladesh",
        "currency": "BDT",
        "timezone": "Asia/Dhaka"
    })
    assert res.status_code == 200

    # 4. Owner can update language
    res = client.put("/api/v1/core/settings/language", headers={"Authorization": f"Bearer {owner_token}"}, json={"language": "bn"})
    assert res.status_code == 200
    assert "বাংলা" in res.json()["message"]
