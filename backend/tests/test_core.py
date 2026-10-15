from app.core.security import create_access_token
from app.models.models import Institute, User, Student, Role

def test_cross_tenant_fee_reminder(client, db_session):
    token_b = create_access_token(data={"id": "user-2", "role": "OWNER"})
    headers_b = {"Authorization": f"Bearer {token_b}"}
    
    # User 2 (Inst 2) tries to send fee reminder to Student 1 (Inst 1)
    resp = client.post(
        "/api/v1/core/dashboard/fee-reminder", 
        json={"studentId": "student-1", "amount": "100"},
        headers=headers_b
    )
    
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Student not found in your institute"
    
def test_kpi_isolated(client, db_session):
    token_a = create_access_token(data={"id": "user-1", "role": "OWNER"})
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    resp = client.get("/api/v1/core/dashboard/kpi", headers=headers_a)
    assert resp.status_code == 200
    data = resp.json()
    assert data["totalStudents"] == 1 # Only student-1 in inst-1
