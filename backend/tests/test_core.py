import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_db
from app.models.models import User, Institute, Student
from app.db.database import Base
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

@pytest.fixture
def setup_db():
    db = TestingSessionLocal()
    # Institute A
    inst_a = Institute(id="inst_a", name="Inst A", subdomain="insta", code="A")
    user_a = User(id="user_a", email="a@a.com", name="A", role="OWNER", institute_id="inst_a")
    student_a = Student(id="student_a", full_name="Student A", roll_no="1", institute_id="inst_a")
    
    # Institute B
    inst_b = Institute(id="inst_b", name="Inst B", subdomain="instb", code="B")
    user_b = User(id="user_b", email="b@b.com", name="B", role="OWNER", institute_id="inst_b")
    student_b = Student(id="student_b", full_name="Student B", roll_no="2", institute_id="inst_b")
    
    db.add_all([inst_a, inst_b, user_a, user_b, student_a, student_b])
    db.commit()
    yield db
    
    db.query(Student).delete()
    db.query(User).delete()
    db.query(Institute).delete()
    db.commit()
    db.close()

def test_cross_tenant_fee_reminder(setup_db):
    token_b = create_access_token(data={"id": "user_b", "role": "OWNER"})
    headers_b = {"Authorization": f"Bearer {token_b}"}
    
    # User B tries to send fee reminder to Student A (who belongs to Inst A)
    resp = client.post(
        "/api/v1/core/dashboard/fee-reminder", 
        json={"studentId": "student_a", "amount": "100"},
        headers=headers_b
    )
    
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Student not found in your institute"
    
def test_kpi_isolated(setup_db):
    token_a = create_access_token(data={"id": "user_a", "role": "OWNER"})
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    resp = client.get("/api/v1/core/dashboard/kpi", headers=headers_a)
    assert resp.status_code == 200
    data = resp.json()
    assert data["totalStudents"] == 1 # Only student_a
