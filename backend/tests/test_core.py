from app.core.security import create_access_token

def test_kpi_isolated(client, db_session):
    token_a = create_access_token(data={"id": "user-1", "role": "OWNER"})
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    resp = client.get("/api/v1/core/dashboard/kpi", headers=headers_a)
    assert resp.status_code == 200
    data = resp.json()
    assert data["totalStudents"] == 1 # Only student-1 in inst-1
