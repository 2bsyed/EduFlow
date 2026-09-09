import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.models.models import User, Institute, Student, Batch, Teacher, Role
from app.core.security import create_access_token

# Setup test database
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
    user_teacher1 = User(id="user-t1", email="teacher1@test.com", password_hash="hash", role=Role.TEACHER, institute_id="inst-1")
    db.add_all([user_owner1, user_owner2, user_teacher1])
    db.commit()
    
    # Create Teacher
    t1 = Teacher(id="teacher-1", user_id="user-t1", institute_id="inst-1", subject="Math")
    db.add(t1)
    db.commit()
    
    # Create Students
    s1 = Student(id="student-1", institute_id="inst-1", full_name="Student 1", roll_no="1", status="ACTIVE")
    s2 = Student(id="student-2", institute_id="inst-2", full_name="Student 2", roll_no="2", status="ACTIVE")
    db.add_all([s1, s2])
    db.commit()
    
    # Create Batches
    b1 = Batch(id="batch-1", institute_id="inst-1", name="Batch 1", teacher_id="teacher-1")
    b2 = Batch(id="batch-2", institute_id="inst-2", name="Batch 2")
    b_other = Batch(id="batch-other", institute_id="inst-1", name="Batch Other") # No teacher
    db.add_all([b1, b2, b_other])
    db.commit()
    db.close()

@pytest.fixture(autouse=True)
def run_before_and_after_tests():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    setup_test_data()
    yield

def test_upsert_attendance_cross_tenant_student():
    token = create_access_token(data={"id": "user-1", "role": "OWNER", "instituteId": "inst-1"})
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post("/api/v1/attendances/upsert", json={
        "studentId": "student-2", # belongs to inst-2
        "batchId": "batch-1",
        "dateStr": "2023-10-10",
        "status": "PRESENT"
    }, headers=headers)
    
    assert res.status_code == 404
    assert "Student not found" in res.json()["detail"]

def test_upsert_attendance_unauthorized_teacher():
    token = create_access_token(data={"id": "user-t1", "role": "TEACHER", "instituteId": "inst-1"})
    headers = {"Authorization": f"Bearer {token}"}
    
    # teacher-1 is not authorized for batch-other
    res = client.post("/api/v1/attendances/upsert", json={
        "studentId": "student-1",
        "batchId": "batch-other",
        "dateStr": "2023-10-10",
        "status": "PRESENT"
    }, headers=headers)
    
    assert res.status_code == 403

def test_upsert_attendance_success():
    token = create_access_token(data={"id": "user-t1", "role": "TEACHER", "instituteId": "inst-1"})
    headers = {"Authorization": f"Bearer {token}"}
    
    res = client.post("/api/v1/attendances/upsert", json={
        "studentId": "student-1",
        "batchId": "batch-1",
        "dateStr": "2023-10-10",
        "status": "PRESENT"
    }, headers=headers)
    
    assert res.status_code == 200
    assert res.json()["status"] == "PRESENT"
