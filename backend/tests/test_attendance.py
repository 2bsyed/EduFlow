def test_upsert_attendance_cross_tenant_student(client, owner_token):
    headers = {"Authorization": f"Bearer {owner_token}"}
    
    res = client.post("/api/v1/attendances/upsert", json={
        "studentId": "student-2", # belongs to inst-2
        "batchId": "batch-1",
        "dateStr": "2023-10-10",
        "status": "PRESENT"
    }, headers=headers)
    
    assert res.status_code == 404
    assert "Student not found" in res.json()["detail"]

def test_upsert_attendance_unauthorized_teacher(client, teacher_token):
    headers = {"Authorization": f"Bearer {teacher_token}"}
    
    # teacher-1 is not authorized for batch-2
    res = client.post("/api/v1/attendances/upsert", json={
        "studentId": "student-1",
        "batchId": "batch-2",
        "dateStr": "2023-10-10",
        "status": "PRESENT"
    }, headers=headers)
    
    assert res.status_code == 403

def test_upsert_attendance_success(client, teacher_token, db_session):
    headers = {"Authorization": f"Bearer {teacher_token}"}
    from app.models.models import StudentBatch
    db_session.add(StudentBatch(id="student-batch-1", institute_id="inst-1", student_id="student-1", batch_id="batch-1"))
    db_session.commit()
    
    res = client.post("/api/v1/attendances/upsert", json={
        "studentId": "student-1",
        "batchId": "batch-1",
        "dateStr": "2023-10-10",
        "status": "PRESENT"
    }, headers=headers)
    
    assert res.status_code == 200
    assert res.json()["status"] == "PRESENT"
