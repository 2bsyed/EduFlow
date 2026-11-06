from app.models.models import User, Institute, Role


def test_register_creates_institute_owner(client, db_session):
    response = client.post("/api/v1/auth/register", json={
        "institute_name": "North Star Learning",
        "owner_name": "Test Owner",
        "email": "northstar@example.test",
        "phone": "+8801700000000",
        "password": "a-strong-passphrase-2026",
    })

    assert response.status_code == 201
    owner = db_session.query(User).filter(User.email == "northstar@example.test").first()
    institute = db_session.query(Institute).filter(Institute.id == owner.institute_id).first()
    assert owner.role == Role.OWNER
    assert owner.password_hash != "a-strong-passphrase-2026"
    assert institute.name == "North Star Learning"


def test_register_rejects_duplicate_email(client):
    response = client.post("/api/v1/auth/register", json={
        "institute_name": "Another Institute",
        "owner_name": "Duplicate Owner",
        "email": "OWNER1@test.com",
        "phone": "+8801700000001",
        "password": "a-strong-passphrase-2026",
    })

    assert response.status_code == 409
