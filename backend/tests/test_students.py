import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.models.models import User, Institute, Student, Batch, Role
from app.core.security import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def setup_test_data():
    db = TestingSessionLocal()
    # Create Institutes
    inst1 = Institute(id="inst-1", name="Institute 1", code="INST1")
    inst2 = Institute(id="inst-2", name="Institute 2", code="INST2")
    db.add_all([inst1, inst2])
    db.commit()
    
    # Create Users
    user_owner1 = User(id="user-1", email="owner1@test.com", password_hash="hash", role=Role.OWNER, institute_id="inst-1")
    user_owner2 = User(id="user-2", email="owner2@test.com", password_hash="hash", role=Role.OWNER, institute_id="inst-2")
    db.add_all([user_owner1, user_owner2])
    db.commit()
    
    # Create Students
    s1 = Student(id="student-1", institute_id="inst-1", full_name="Student 1", roll_no="1", status="ACTIVE")
    s2 = Student(id="student-2", institute_id="inst-2", full_name="Student 2", roll_no="2", status="ACTIVE")
    db.add_all([s1, s2])
    db.commit()
    
    # Create Batches
    b1 = Batch(id="batch-1", institute_id="inst-1", name="Batch 1")
    b2 = Batch(id="batch-2", institute_id="inst-2", name="Batch 2")
    db.add_all([b1, b2])
    db.commit()
    db.close()

@pytest.fixture(autouse=True)
def run_before_and_after_tests():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    setup_test_data()
    yield

def test_delete_student_cross_tenant():
    # User 1 belongs to Inst 1. Tries to delete student-2 which belongs to Inst 2.
    token = create_access_token(data={"id": "user-1", "role": "OWNER", "instituteId": "inst-1"})
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.delete("/api/v1/students/student-2", headers=headers)
    assert res.status_code == 404
    assert "Student not found in your institute" in res.json()["detail"]

def test_delete_student_unauthorized_role():
    # User 1 is a TEACHER now (let's forge token).
    token = create_access_token(data={"id": "user-1", "role": "TEACHER", "instituteId": "inst-1"})
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.delete("/api/v1/students/student-1", headers=headers)
    assert res.status_code == 403
    assert "Only institute owners can delete student records" in res.json()["detail"]

def test_assign_batch_cross_tenant():
    # Assign student-1 (inst-1) to batch-2 (inst-2)
    token = create_access_token(data={"id": "user-1", "role": "OWNER", "instituteId": "inst-1"})
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post("/api/v1/batches/assign", json={
        "student_id": "student-1",
        "batch_id": "batch-2"
    }, headers=headers)
    
    assert res.status_code == 403
    assert "Unauthorized cross-tenant attempt" in res.json()["detail"]

def test_assign_batch_success():
    token = create_access_token(data={"id": "user-1", "role": "OWNER", "instituteId": "inst-1"})
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post("/api/v1/batches/assign", json={
        "student_id": "student-1",
        "batch_id": "batch-1"
    }, headers=headers)
    
    assert res.status_code == 201
    assert "Student assigned to batch successfully" in res.json()["message"]
