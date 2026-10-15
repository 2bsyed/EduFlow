def test_delete_student_cross_tenant(client, owner_token):
    # User 1 belongs to Inst 1. Tries to delete student-2 which belongs to Inst 2.
    res = client.delete("/api/v1/students/student-2", headers={"Authorization": f"Bearer {owner_token}"})
    assert res.status_code == 404
    assert "Student not found in your institute" in res.json()["detail"]

def test_delete_student_unauthorized_role(client, teacher_token):
    # Teacher tries to delete student
    res = client.delete("/api/v1/students/student-1", headers={"Authorization": f"Bearer {teacher_token}"})
    assert res.status_code == 403
    assert "Only institute owners can delete student records" in res.json()["detail"]

def test_assign_batch_cross_tenant(client, owner_token):
    # Assign student-1 (inst-1) to batch-2 (inst-2)
    res = client.post("/api/v1/batches/assign", json={
        "student_id": "student-1",
        "batch_id": "batch-2"
    }, headers={"Authorization": f"Bearer {owner_token}"})
    
    assert res.status_code == 403
    assert "Unauthorized cross-tenant attempt" in res.json()["detail"]

def test_assign_batch_success(client, owner_token):
    # Assign student-1 (inst-1) to batch-1 (inst-1)
    res = client.post("/api/v1/batches/assign", json={
        "student_id": "student-1",
        "batch_id": "batch-1"
    }, headers={"Authorization": f"Bearer {owner_token}"})
    
    assert res.status_code == 201
    assert "Student assigned to batch successfully" in res.json()["message"]
