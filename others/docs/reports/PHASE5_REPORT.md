# Phase 5 API Testing Bug Report

## Overview
The FastAPI backend was tested to verify endpoint functionalities, authentication edge cases, cross-tenant boundaries, and role-based access control. Several issues were discovered, most notably schema field naming mismatches, missing endpoints, and database constraint violations.

## Bugs Found

| ID | Area | Severity | Description | Steps to Reproduce | Suspected File |
|---|---|---|---|---|---|
| BUG-100 | API/Database Models | High | Database `updated_at` column has a not-null constraint but `models.py` uses `onupdate=func.now()` which only applies during updates, leaving it NULL on insert, causing 500 Internal Server Errors (IntegrityError). | Send a POST request to create a Batch (`/api/v1/batches/`) or Student. | `backend/app/models/models.py` |
| BUG-101 | API/Students | Medium | `StudentCreate` schema defines `guardian_name`, `guardian_phone`, and `batch_id` as strictly required `str` instead of `Optional[str]`. This blocks creating students without a batch. | Send a POST request to `/api/v1/students/` omitting `batch_id`. Receives 422 Unprocessable Entity. | `backend/app/api/students.py` |
| BUG-102 | API/Students | Low | Missing GET endpoint for retrieving a single student by ID. The original spec lists `/api/v1/students/{student_id}` as an endpoint, but only PUT and DELETE methods are implemented. | Send a GET request to `/api/v1/students/{student_id}`. Receives 405 Method Not Allowed. | `backend/app/api/students.py` |
| BUG-103 | API/Core | High | `AttributeError` in `update_profile` endpoint due to a mismatch between Pydantic schema field name (`logoUrl`) and the attribute accessed in python (`req.logo_url`). | Send a PUT request to `/api/v1/core/settings/profile` with valid payload. Receives 500 Internal Server Error. | `backend/app/api/core.py` (Line ~242) |

## Edge Cases and Access Controls Verified
- Missing Headers: Returns 401 Unauthorized correctly.
- Invalid Token: Returns 401 Unauthorized correctly.
- Expired Token: Returns 401 Unauthorized correctly.
- Cross-Tenant Access (GET): Correctly returns 404/403 when trying to retrieve data belonging to another institute.
- Cross-Tenant Access (PUT/DELETE): Properly blocked (Returns 404).
- Role-based Access: A `TEACHER` trying to use an `OWNER`-only endpoint (e.g., Delete Student) correctly receives a 403 Forbidden.

# Phase 5 UI Bugs

| ID | Area | Severity | Description | Steps to Reproduce | Suspected File |
|---|---|---|---|---|---|
| BUG-200 | Owner - Students | Medium | Table overflows on mobile viewport | Login as Owner, navigate to /students on mobile width | `src/app/(app)/students/page.tsx` |
| BUG-201 | Teacher - Timetable | Medium | Table overflows on mobile viewport | Login as Teacher, navigate to /teacher/timetable on mobile width | `src/app/(app)/teacher/timetable/page.tsx` |
| BUG-202 | Student - Fees | Medium | Table overflows on mobile viewport | Login as Student, navigate to /student/fees on mobile width | `src/app/(app)/student/fees/page.tsx` |
| BUG-203 | Student - Timetable | Medium | Table overflows on mobile viewport | Login as Student, navigate to /student/timetable on mobile width | `src/app/(app)/student/timetable/page.tsx` |

*Note: Role-based redirecting works properly. All crashes caused by missing backend endpoints during Next.js server-side rendering have been fixed. Bug-007 is confirmed to be still present. Bug-005 and Bug-006 were not detected.*
