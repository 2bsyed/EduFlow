import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.models.models import User, Institute, Student, Batch, Teacher, Role, StudentBatch
from app.core.security import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def db_session():
    # Fresh database for every single test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Institute 1 & 2
    inst1 = Institute(id="inst-1", name="Institute 1", code="INST1")
    inst2 = Institute(id="inst-2", name="Institute 2", code="INST2")
    db.add_all([inst1, inst2])
    db.commit()

    # Users
    owner1 = User(id="user-1", email="owner1@test.com", name="Owner 1", role=Role.OWNER, institute_id="inst-1", password_hash="hash")
    owner2 = User(id="user-2", email="owner2@test.com", name="Owner 2", role=Role.OWNER, institute_id="inst-2", password_hash="hash")
    teacher_user = User(id="user-t1", email="teacher1@test.com", name="Teacher 1", role=Role.TEACHER, institute_id="inst-1", password_hash="hash")
    student_user = User(id="user-s1", email="student1@test.com", name="Student 1", role=Role.STUDENT, institute_id="inst-1", password_hash="hash")
    db.add_all([owner1, owner2, teacher_user, student_user])
    db.commit()

    # Teacher Profile
    t1 = Teacher(id="teacher-1", user_id="user-t1", institute_id="inst-1", subject="Math")
    db.add(t1)
    db.commit()

    # Students
    s1 = Student(id="student-1", user_id="user-s1", institute_id="inst-1", full_name="Student 1", roll_no="1", status="ACTIVE")
    s2 = Student(id="student-2", institute_id="inst-2", full_name="Student 2", roll_no="2", status="ACTIVE")
    db.add_all([s1, s2])
    db.commit()

    # Batches
    b1 = Batch(id="batch-1", institute_id="inst-1", name="Batch 1", subject="Math", teacher_id="teacher-1")
    b2 = Batch(id="batch-2", institute_id="inst-2", name="Batch 2", subject="Physics")
    db.add_all([b1, b2])
    db.commit()

    yield db
    db.close()

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def teacher_token():
    return create_access_token(data={"id": "user-t1", "role": "TEACHER", "instituteId": "inst-1"})

@pytest.fixture
def student_token():
    return create_access_token(data={"id": "user-s1", "role": "STUDENT", "instituteId": "inst-1"})

@pytest.fixture
def owner_token():
    return create_access_token(data={"id": "user-1", "role": "OWNER", "instituteId": "inst-1"})
