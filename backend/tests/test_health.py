def test_health_check_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert data["app"] == "EduFlow API"

def test_api_v1_health_check_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def test_ping_endpoints(client):
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

    response = client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
