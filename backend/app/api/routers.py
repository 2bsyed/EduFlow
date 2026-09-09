from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.students import router as students_real_router
from app.api.batches import router as batches_real_router
from app.api.teachers import router as teachers_real_router
from app.api.institutes import router as institutes_real_router
from app.api.attendance import router as attendance_real_router
from app.api.fees import router as fees_real_router
from app.api.results import router as results_real_router
from app.api.expenses import router as expenses_real_router
from app.api.core import router as core_router

api_router = APIRouter()

# Auth
auth_router_with_prefix = APIRouter(prefix="/auth", tags=["auth"])
auth_router_with_prefix.include_router(auth_router)
api_router.include_router(auth_router_with_prefix)

# Institutes
institutes_router = APIRouter(prefix="/institutes", tags=["institutes"])
institutes_router.include_router(institutes_real_router)
api_router.include_router(institutes_router)

# Students
students_router = APIRouter(prefix="/students", tags=["students"])
students_router.include_router(students_real_router)
api_router.include_router(students_router)

# Teachers
teachers_router = APIRouter(prefix="/teachers", tags=["teachers"])
teachers_router.include_router(teachers_real_router)
api_router.include_router(teachers_router)

# Batches
batches_router = APIRouter(prefix="/batches", tags=["batches"])
batches_router.include_router(batches_real_router)
api_router.include_router(batches_router)

# Attendance (mount on both /attendance and /attendances to support all frontend calls)
attendance_router = APIRouter(prefix="/attendance", tags=["attendance"])
attendance_router.include_router(attendance_real_router)
api_router.include_router(attendance_router)

attendances_router = APIRouter(prefix="/attendances", tags=["attendances"])
attendances_router.include_router(attendance_real_router)
api_router.include_router(attendances_router)

# Fees (already has prefix="/fees")
api_router.include_router(fees_real_router)

# Results
results_router = APIRouter(prefix="/results", tags=["results"])
results_router.include_router(results_real_router)
api_router.include_router(results_router)

# Expenses (already has prefix="/expenses")
api_router.include_router(expenses_real_router)

# Core
core_router_with_prefix = APIRouter(prefix="/core", tags=["core"])
core_router_with_prefix.include_router(core_router)
api_router.include_router(core_router_with_prefix)

