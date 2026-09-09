import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime
from app.main import app
from app.db.database import get_db, Base
from app.models.models import Institute, User, Role, Student

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_reject_cross_institute_fees():
    db = TestingSessionLocal()
    
    inst1 = Institute(name="Inst 1", code="I1")
    inst2 = Institute(name="Inst 2", code="I2")
    db.add(inst1)
    db.add(inst2)
    db.commit()
    
    owner1 = User(institute_id=inst1.id, name="Owner 1", email="o1@e.com", role=Role.OWNER, password_hash="hash")
    db.add(owner1)
    
    student2 = Student(institute_id=inst2.id, full_name="Student 2", roll_no="S2")
    db.add(student2)
    
    db.commit()

    response = client.post("/api/auth/login", json={"email": "o1@e.com", "password": "password"})
    # Since password is just mocked as not working easily without real hash, let's just generate a token
    from app.core.security import create_access_token
    token = create_access_token({"id": owner1.id, "role": "OWNER", "instituteId": inst1.id, "email": "o1@e.com"})

    res = client.post("/api/fees/", headers={"Authorization": f"Bearer {token}"}, json={
        "student_id": student2.id,
        "amount": 100,
        "date": "2024-01-01",
        "payment_method": "CASH"
    })
    
    assert res.status_code == 404
    assert res.json()["detail"] == "Student not found"
