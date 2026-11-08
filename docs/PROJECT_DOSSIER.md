# EduFlow — Comprehensive Project Dossier & Technical Audit
**System Architecture, Feature Implementation Status, Interface Audit & Technical Dossier**  
*Document Version: 1.0.0 — Target Market: Bangladesh Coaching-Centre ERP/SaaS*  
*Date of Audit: October 28, 2026 | Environment: Local Multi-Tenant Staging (PostgreSQL 16, FastAPI 0.141, Next.js 16.2 Turbopack)*

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Product Definition & Target Users](#2-product-definition--target-users)
3. [Current Verified Product Capabilities](#3-current-verified-product-capabilities)
4. [Project Structure & Technical Stack](#4-project-structure--technical-stack)
5. [Architecture & Data-Flow Diagrams](#5-architecture--data-flow-diagrams)
6. [Database Schema & Entity Relationship Inventory](#6-database-schema--entity-relationship-inventory)
7. [Authentication, Roles & Permission Enforcement Matrix](#7-authentication-roles--permission-enforcement-matrix)
8. [Complete Route & Screen Inventory](#8-complete-route--screen-inventory)
9. [Detailed Feature Documentation](#9-detailed-feature-documentation)
10. [API Endpoint Reference](#10-api-endpoint-reference)
11. [Frontend Component & Server-Action Map](#11-frontend-component--server-action-map)
12. [Important Business Rules & Calculations](#12-important-business-rules--calculations)
13. [Configuration & Deployment Architecture](#13-configuration--deployment-architecture)
14. [External Integrations & Verification Status](#14-external-integrations--verification-status)
15. [Testing & QA Inventory](#15-testing--qa-inventory)
16. [Screenshot Gallery with Embedded Images](#16-screenshot-gallery-with-embedded-images)
17. [Complete Screenshot Index](#17-complete-screenshot-index)
18. [Current Design System & UI Component Inventory](#18-current-design-system--ui-component-inventory)
19. [UX Audit & ERP-Design Transition Considerations](#19-ux-audit--erp-design-transition-considerations)
20. [End-to-End Workflow Documentation](#20-end-to-end-workflow-documentation)
21. [Feature Implementation Status Matrix](#21-feature-implementation-status-matrix)
22. [Bugs, Security Vulnerabilities & Missing Functionality](#22-bugs-security-vulnerabilities--missing-functionality)
23. [Performance, Accessibility & Maintainability Concerns](#23-performance-accessibility--maintainability-concerns)
24. [Known Limitations & Unresolved Questions](#24-known-limitations--unresolved-questions)
25. [Prioritized Engineering & Product Roadmap](#25-prioritized-engineering--product-roadmap)
26. [Key Source Files & Navigation Guide for AI Engineers](#26-key-source-files--navigation-guide-for-ai-engineers)
27. [Documentation Scope, Test Commands & Audit Limitations](#27-documentation-scope-test-commands--audit-limitations)

---

## 1. Executive Summary

**EduFlow** is a multi-tenant coaching-centre management SaaS designed specifically for the academic coaching, admission test coaching, and private tutoring centre ecosystem in Bangladesh. The software addresses the administrative bottlenecks faced by coaching centre proprietors (*Owners*), instructors (*Teachers*), and enrolled pupils (*Students*).

### Evolution & Architectural Pivot
The repository originated as a Next.js full-stack monolith utilizing Next.js Server Actions, NextAuth v5 Beta, and the Prisma ORM. On September 3, 2026, the architecture underwent a conversion into a decoupled, industrial-grade two-tier structure:
1. **Frontend**: Next.js 16.2.12 (React 19.2.4, TypeScript 5.9.3, Tailwind CSS v4, Next-Intl 4.13.4, Recharts 3.10.1).
2. **Backend**: FastAPI 0.141.1 (Python 3.13 / 3.12, SQLAlchemy 2.0.52 ORM, Alembic 1.19.1 migrations, Pydantic v2, PyJWT 2.13.0).
3. **Database**: PostgreSQL 16 (relational schema enforcing foreign keys, multi-tenant `institute_id` isolation, cascade deletions, and index coverage).

### Current Operational State
- **Functional Modules Verified Working**: Multi-tenant authentication, owner dashboard metric aggregation, student CRUD with search filtering, batch creation and student enrollment, daily batch attendance marking with bulk operations, expense tracking, exam marks recording with Bangladeshi grading conversion, printable student report cards, institute-wide and batch-targeted announcements, and bilingual (English/Bangla) localization toggles.
- **Simulated & Stubbed Functionality**: Online fee payment gateway integration is simulated via a mock transaction generator (`process_payment()`); automated SMS/WhatsApp messaging triggers device-native `sms:<number>` URIs rather than communicating with an SMS gateway aggregator; tenant self-serve registration on `/register` bypasses backend tenant provisioning by immediately authenticating into the seeded demo owner account.
- **Test Baseline**: 17 automated integration tests (`pytest`) pass with zero errors in 0.52s. End-to-end browser audits confirm zero runtime exceptions across 22 distinct portal routes.

---

## 2. Product Definition & Target Users

In Bangladesh, coaching centres operate distinctly from formal K-12 schools. Centres typically cater to Class 8–10 (SSC candidates), Class 11–12 (HSC candidates), and University Admission coaching (Medical, BUET/Engineering, and Varsity 'Ka/Kha/Ga' units).

```
+-----------------------------------------------------------------------------------+
|                              EDUFLOW PLATFORM USERS                               |
+--------------------------+----------------------------+---------------------------+
| 1. INSTITUTE OWNER /     | 2. COURSE TEACHER /        | 3. STUDENT / GUARDIAN     |
|    ADMINISTRATOR         |    INSTRUCTOR              |                           |
|--------------------------+----------------------------+---------------------------|
| - Proprietor or academic | - Full-time or honorarium  | - Enrolled student in SSC,|
|   director               |   subject teacher          |   HSC, or Admission batch |
| - Controls finances,     | - Marks daily attendance   | - Views personal records: |
|   expenses, and fees     | - Records examination test |   attendance percentage,  |
| - Enrolls students and   |   marks                    |   fee receipts/dues, exam |
|   forms batches          | - Publishes batch notices  |   grades, and report cards|
| - Configures branding,   | - Inspects class timetable | - Inspects weekly class   |
|   subdomain, & language  |   and assigned rosters     |   schedule and notices    |
+--------------------------+----------------------------+---------------------------+
```

### Intended Market Fit
- **Currency & Localization**: Native support for Bangladeshi Taka (`৳` / BDT), Asia/Dhaka timezone (`UTC+6`), and bilingual English (`en`) and Bengali (`bn`) locales.
- **Academic Hierarchy**: Institutes do not rely on standard school grade homerooms; rather, academic operations revolve around **Batches** (e.g., *"Class 10 - Higher Math Special"*, *"Class 12 - Physics Revision"*) characterized by specific schedules, monthly tuition rates, and designated faculty instructors.

---

## 3. Current Verified Product Capabilities

The following matrix documents capabilities directly verified during live environment execution:

| Domain | Capability | Real Implementation Status | Evidence / Verification Notes |
|---|---|---|---|
| **Multi-Tenancy** | Institute isolation across all queries | **VERIFIED WORKING** | Every SQL query filters by `institute_id`; cross-tenant 404/403 enforced. |
| **Authentication** | Password authentication & JWT cookies | **VERIFIED WORKING** | Bcrypt hashing, signed JWT cookies, in-memory rate limiting (5 attempts). |
| **Dashboard** | KPI counts (Students, Revenue, Attendance) | **VERIFIED WORKING** | Aggregates DB records; dynamically updates on new fee/attendance inserts. |
| **Students** | Admission enrollment & directory search | **VERIFIED WORKING** | Fast search filter by name/roll; modal drawer for create/edit; soft archive. |
| **Batches** | Batch creation & student enrollment | **VERIFIED WORKING** | Single-screen batch management, subject/fee setup, student assignment join. |
| **Attendance** | Single-click & bulk-present marking | **VERIFIED WORKING** | Upserts unique `(student_id, batch_id, date)` record; teacher batch-verified. |
| **Fees** | Payment recording & receipt numbering | **PARTIALLY IMPLEMENTED** | Records payment to DB with receipt ID; gateway payment flow is simulated. |
| **Expenses** | Institute expenditure logging | **VERIFIED WORKING** | Category, amount, payee, and date recorded; calculates totals instantly. |
| **Exams/Results** | Test mark entry & grade calculation | **VERIFIED WORKING** | Automatic BD grade calculation (`A+`, `A`, `A-`, `B`, `C`, `D`, `F`). |
| **Report Cards** | Printable student academic transcript | **VERIFIED WORKING** | Dynamic route `/results/report-card/[studentId]/[examId]` with print CSS. |
| **Notices** | Announcements & targeted notices | **VERIFIED WORKING** | Logged to `activity_logs` as JSON payload; filtered by audience scope. |
| **Localization** | Dynamic English / Bangla locale toggle | **VERIFIED WORKING** | Instant locale toggle via cookie; translations loaded from JSON dictionaries. |

---

## 4. Project Structure & Technical Stack

### Repository Map
```
EduFlow/
├── backend/                       # Python FastAPI Backend Service
│   ├── alembic/                   # Database migration environment
│   │   ├── versions/              # Migration revision scripts
│   │   └── env.py                 # Alembic environment runner
│   ├── app/
│   │   ├── api/                   # Domain API Routers
│   │   │   ├── attendance.py      # Attendance marking & bulk actions
│   │   │   ├── auth.py            # Authentication, rate limiter & tokens
│   │   │   ├── batches.py         # Batch lifecycle & student enrollments
│   │   │   ├── core.py            # Dashboard KPIs, notices, settings
│   │   │   ├── expenses.py        # Institute expenditure management
│   │   │   ├── fees.py            # Fee payment recording & reporting
│   │   │   ├── institutes.py      # Tenant profile metadata
│   │   │   ├── results.py         # Exam mark recording & report cards
│   │   │   ├── routers.py         # Master API router registration
│   │   │   ├── students.py        # Student CRUD & roster queries
│   │   │   └── teachers.py        # Teacher directory & personal profile
│   │   ├── core/
│   │   │   └── security.py        # JWT generation, verification, password hashing
│   │   ├── db/
│   │   │   └── database.py        # SQLAlchemy engine, session maker, Base
│   │   ├── models/
│   │   │   └── models.py          # SQLAlchemy ORM entity definitions
│   │   ├── schemas/
│   │   │   └── schemas.py         # Pydantic request/response validation schemas
│   │   ├── services/              # Business logic helpers
│   │   └── main.py                # FastAPI initialization, CORS & health checks
│   ├── tests/                     # Pytest automated test suite (17 tests)
│   ├── Dockerfile                 # Backend containerization file
│   ├── requirements.txt           # Python dependency specifications
│   ├── seed.sql                   # Comprehensive demonstration database dump
│   └── venv/                      # Local Python 3.13 virtual environment
│
├── frontend/                      # Next.js Frontend Application
│   ├── messages/                  # Internationalization dictionary strings
│   │   ├── bn.json                # Bengali translation dictionary
│   │   └── en.json                # English translation dictionary
│   ├── public/                    # Static assets & image storage
│   │   ├── images/                # Branding graphics, illustrations, avatars
│   │   └── uploads/               # Local disk upload destination for student photos
│   ├── src/
│   │   ├── actions/               # Next.js Server Actions (proxying to FastAPI)
│   │   │   ├── attendance.ts
│   │   │   ├── batches.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── expenses.ts
│   │   │   ├── fees.ts
│   │   │   ├── notices.ts
│   │   │   ├── results.ts
│   │   │   ├── settings.ts
│   │   │   └── students.ts
│   │   ├── app/                   # App Router pages and route handlers
│   │   │   ├── (app)/             # Authenticated Portal Routes
│   │   │   │   ├── attendance/    # Owner & Teacher attendance marking
│   │   │   │   ├── batches/       # Owner batch management
│   │   │   │   ├── dashboard/     # Owner operational dashboard
│   │   │   │   ├── expenses/      # Owner expense tracking
│   │   │   │   ├── fees/          # Owner fee payment records
│   │   │   │   ├── notices/       # Owner notice management
│   │   │   │   ├── results/       # Owner & Teacher exam mark entry
│   │   │   │   │   └── report-card/[studentId]/[examId]/ # Printable card
│   │   │   │   ├── settings/      # Owner profile & language settings
│   │   │   │   ├── student/       # Student portal (dashboard, fees, etc.)
│   │   │   │   ├── students/      # Owner student directory
│   │   │   │   └── teacher/       # Teacher portal (dashboard, batches, etc.)
│   │   │   ├── (marketing)/       # Public Routes (landing, login, demo, register)
│   │   │   ├── api/               # Next.js internal API route handlers
│   │   │   │   ├── auth/          # NextAuth authentication bridge
│   │   │   │   └── ping/          # Keepalive health ping
│   │   │   ├── globals.css        # Tailwind directives & CSS variables
│   │   │   └── layout.tsx         # Root layout with font definitions & i18n
│   │   ├── components/            # Modular React client & server components
│   │   ├── i18n/                  # Request-level locale resolver
│   │   ├── lib/                   # Shared utility libraries (auth, api client)
│   │   ├── middleware.ts          # Central role-based routing & JWT verification
│   │   └── types/                 # TypeScript interfaces and API payload types
│   ├── Dockerfile                 # Frontend containerization file
│   ├── package.json               # Node.js dependencies and run scripts
│   └── tailwind.config.ts         # Design system tokens and color definitions
│
├── docs/                          # Project documentation deliverables
│   ├── PROJECT_DOSSIER.md         # This technical document
│   └── project-dossier/
│       ├── assets/                # 41 high-resolution screen captures
│       └── PROJECT_DOSSIER_BUNDLE.zip # Complete portable deliverable package
│
├── others/                        # Historical references, audit scripts & assets
│   ├── design/                    # Stitch HTML foundations & design assets
│   ├── docs/                      # Conversion logs and historical milestone reports
│   ├── legacy/                    # Deprecated Next.js monolithic Prisma code
│   └── scripts/                   # Audit test scripts and automation utilities
│
├── docker-compose.yml             # Local multi-container Docker composition
└── render.yaml                    # Production deployment blueprint for Render
```

### Exact Installed Versions & Technologies
- **Frontend Framework**: Next.js `16.2.12` (running with Turbopack)
- **UI Library**: React `19.2.4` & React-DOM `19.2.4`
- **Language**: TypeScript `5.9.3` (Frontend), Python `3.13.2` / `3.12.0` (Backend)
- **Backend Framework**: FastAPI `0.141.1`, Starlette `0.38.0`, Uvicorn `0.52.4`
- **ORM & Migrations**: SQLAlchemy `2.0.52`, Alembic `1.19.1`
- **Database Driver**: `psycopg2-binary` `2.9.12` (PostgreSQL 16)
- **Validation**: Pydantic `2.13.5` (Backend), Zod `4.4.3` & React-Hook-Form `7.83.0` (Frontend)
- **Styling**: Tailwind CSS `v4` (`@tailwindcss/postcss` `4.0.0`)
- **Authentication**: NextAuth.js `5.0.0-beta.32`, PyJWT `2.13.0`, Passlib `1.7.4`, Bcrypt `3.2.2`
- **Internationalization**: `next-intl` `4.13.4`
- **Data Visualization**: `recharts` `3.10.1`
- **Automation / QA**: Playwright `1.64.1`, Pytest `9.1.1`

---

## 5. Architecture & Data-Flow Diagrams

EduFlow separates client presentation, tenant session routing, and persistence boundaries into discrete layers.

### System Architecture Diagram
```mermaid
flowchart TD
    subgraph Client ["Client Devices (Browser / Mobile)"]
        BrowserDesktop["Desktop Browser (1440x1000)"]
        BrowserMobile["Mobile Browser (390x844)"]
    end

    subgraph Edge ["Edge & Routing Layer"]
        NextMiddleware["Next.js Middleware (src/middleware.ts)\n- Cookie-based Role Inspection\n- Expired Token Rejection\n- Route Protection & Redirection"]
    end

    subgraph FrontendApp ["Frontend Application (Next.js 16.2)"]
        SSR["Server Component Pages (RSC)\n- Fetch data via fetchApi()\n- Cache: no-store / SSR"]
        ServerActions["Server Actions (src/actions/*)\n- Form Submissions\n- Revalidation (revalidatePath)"]
        ClientComponents["Interactive Client UI\n- React-Hook-Form + Zod\n- Modals, Drawers & Tabs\n- Recharts Visualizations"]
    end

    subgraph BackendAPI ["Backend Service (FastAPI 0.141)"]
        Uvicorn["Uvicorn ASGI Server (:8000)"]
        AuthDep["Security Dependency (get_current_user)\n- JWT Bearer Validation\n- In-Memory Rate Limiting\n- Tenant Institute Scoping"]
        Routers["Domain Routers\n/students, /batches, /attendance,\n/fees, /results, /core, /expenses"]
        SQLAlchemyORM["SQLAlchemy 2.0 ORM\n- Multi-Tenant Query Filtering\n- Model Relationships & Constraints"]
    end

    subgraph DataStore ["Persistence Layer"]
        PostgresDB[("PostgreSQL 16 Database\n- Multi-Tenant Tables\n- Cascade Deletion\n- Foreign Key Enforcement")]
        LocalUploads["Local Filesystem (/public/uploads/)\n- Ephemeral Student Photos"]
    end

    BrowserDesktop --> NextMiddleware
    BrowserMobile --> NextMiddleware
    NextMiddleware --> SSR
    NextMiddleware --> ClientComponents
    ClientComponents --> ServerActions
    ServerActions -->|Proxy HTTP Request| Uvicorn
    SSR -->|Direct API Fetch| Uvicorn
    Uvicorn --> AuthDep
    AuthDep --> Routers
    Routers --> SQLAlchemyORM
    SQLAlchemyORM --> PostgresDB
    ServerActions -.->|Write Photo| LocalUploads
```

### Complete End-to-End Interaction Flow
Every mutation follows a strict verification cycle:
```
USER ACTION
    ↓
REACT CLIENT HANDLER (e.g. AttendanceMarkingClient / RecordPaymentModal)
    ↓
NEXT.JS SERVER ACTION (src/actions/*.ts)
    ↓ Session Verification (auth() checks active session & instituteId)
    ↓
FETCH API CLIENT (src/lib/api.ts with Bearer Token header)
    ↓ HTTP POST / PUT
FASTAPI ROUTER (backend/app/api/*.py)
    ↓ Dependency get_current_user extracts token claims & verifies DB user
    ↓ Business Validation (Pydantic schemas + instituteId ownership checks)
    ↓
SQLALCHEMY ORM QUERY / MUTATION
    ↓ Transaction Commit & ActivityLog record creation
POSTGRESQL DATABASE COMMIT
    ↓
RESPONSE JSON (Status 200 / 201)
    ↓
NEXT.JS SERVER ACTION COMPLETION
    ↓ revalidatePath('/route')
CLIENT UI RE-RENDER / OPTIMISTIC TOAST CONFIRMATION
```

---

## 6. Database Schema & Entity Relationship Inventory

EduFlow uses a relational model centered around the `Institute` tenant entity. Every major operational table includes a foreign key referencing `institutes.id` with `ON DELETE CASCADE`.

### Entity Relationship Diagram
```mermaid
erDiagram
    INSTITUTES ||--o{ USERS : "owns"
    INSTITUTES ||--o{ TEACHERS : "employs"
    INSTITUTES ||--o{ STUDENTS : "enrolls"
    INSTITUTES ||--o{ BATCHES : "manages"
    INSTITUTES ||--o{ STUDENT_BATCHES : "tracks"
    INSTITUTES ||--o{ ATTENDANCES : "records"
    INSTITUTES ||--o{ FEES : "bills"
    INSTITUTES ||--o{ RESULTS : "evaluates"
    INSTITUTES ||--o{ EXPENSES : "logs"
    INSTITUTES ||--o{ ACTIVITY_LOGS : "audits"

    USERS ||--o| TEACHERS : "profile"
    USERS ||--o| STUDENTS : "portal_account"
    USERS ||--o{ ACTIVITY_LOGS : "performs"

    TEACHERS ||--o{ BATCHES : "instructs"
    STUDENTS ||--o{ STUDENT_BATCHES : "enrolled_in"
    BATCHES ||--o{ STUDENT_BATCHES : "contains"
    STUDENTS ||--o{ ATTENDANCES : "attends"
    BATCHES ||--o{ ATTENDANCES : "session_for"
    STUDENTS ||--o{ FEES : "pays"
    STUDENTS ||--o{ RESULTS : "receives"
    BATCHES ||--o{ RESULTS : "tested_in"

    INSTITUTES {
        string id PK
        string name
        string code UK
        string subdomain UK
        string currency
        string timezone
        string default_language
    }

    USERS {
        string id PK
        string institute_id FK
        string email UK
        string password_hash
        string role
        string name
    }

    TEACHERS {
        string id PK
        string institute_id FK
        string user_id FK,UK
        string subject
        string phone
    }

    STUDENTS {
        string id PK
        string institute_id FK
        string user_id FK,UK
        string roll_no
        string full_name
        string guardian_name
        string guardian_phone
        string status
    }

    BATCHES {
        string id PK
        string institute_id FK
        string teacher_id FK
        string name
        string subject
        decimal monthly_fee
    }

    STUDENT_BATCHES {
        string id PK
        string institute_id FK
        string student_id FK
        string batch_id FK
    }

    ATTENDANCES {
        string id PK
        string institute_id FK
        string student_id FK
        string batch_id FK
        date date
        string status
    }

    FEES {
        string id PK
        string institute_id FK
        string student_id FK
        string receipt_no
        decimal amount
        string month_year
        string status
        string payment_method
    }

    RESULTS {
        string id PK
        string institute_id FK
        string student_id FK
        string batch_id FK
        string exam_name
        string subject
        decimal marks_obtained
        decimal total_marks
        string grade
    }

    EXPENSES {
        string id PK
        string institute_id FK
        string title
        string category
        decimal amount
        string recorded_by
    }

    ACTIVITY_LOGS {
        string id PK
        string institute_id FK
        string user_id FK
        string action
        string details
    }
```

### Table-by-Table Architectural Inventory

#### 1. `institutes`
- **Purpose**: The multi-tenant root entity. All operational data belongs to an Institute.
- **Key Columns**: `id` (VARCHAR PK), `name` (VARCHAR), `code` (VARCHAR Unique, e.g. "INST1"), `subdomain` (VARCHAR Unique, e.g. "excel"), `currency` (Default "BDT"), `timezone` (Default "Asia/Dhaka"), `default_language` (Default "en").
- **Constraints**: Unique index on `code` and `subdomain`.
- **Integrity Risks**: Missing foreign key constraints from legacy migrations if created outside Alembic.

#### 2. `users`
- **Purpose**: Identity authentication table for owners, teachers, and students.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK -> `institutes.id`), `name` (VARCHAR), `email` (VARCHAR Unique), `password_hash` (VARCHAR), `role` (ENUM: `OWNER`, `TEACHER`, `STUDENT`, `PARENT`).
- **Indexes**: `idx_user_institute_id` on `institute_id`.
- **Security Rule**: Passwords must be verified via Bcrypt. The JWT token stores `id`, `role`, and `instituteId`.

#### 3. `teachers`
- **Purpose**: Faculty profile linked 1:1 with a User record.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `user_id` (FK -> `users.id` UNIQUE), `subject` (VARCHAR), `phone` (VARCHAR), `joining_date` (TIMESTAMP).
- **Relationships**: Owns batches via `batches.teacher_id`.

#### 4. `students`
- **Purpose**: Student record enrolled in an institute.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `user_id` (FK -> `users.id` nullable, UNIQUE), `roll_no` (VARCHAR), `full_name` (VARCHAR), `email` (VARCHAR), `guardian_name` (VARCHAR), `guardian_phone` (VARCHAR), `address` (VARCHAR), `photo_url` (VARCHAR), `status` (ENUM: `ACTIVE`, `INACTIVE`, `SUSPENDED`).
- **Unique Constraint**: `UniqueConstraint("institute_id", "roll_no")` prevents duplicate roll numbers inside the same institute.

#### 5. `batches`
- **Purpose**: Classroom sections or tutoring cohorts.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `teacher_id` (FK -> `teachers.id`, SET NULL), `name` (VARCHAR), `subject` (VARCHAR), `schedule` (VARCHAR), `monthly_fee` (NUMERIC(10,2)).
- **Indexes**: `idx_batch_institute_id`, `idx_batch_teacher_id`.

#### 6. `student_batches`
- **Purpose**: Many-to-many join table linking `students` and `batches`.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `student_id` (FK -> `students.id`), `batch_id` (FK -> `batches.id`), `enrolled_at` (TIMESTAMP).
- **Constraints**: `UniqueConstraint("student_id", "batch_id")` ensures a student cannot be enrolled twice into the same batch.

#### 7. `attendances`
- **Purpose**: Daily attendance status for a student in a specific batch.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `student_id` (FK), `batch_id` (FK), `date` (DATE), `status` (ENUM: `PRESENT`, `ABSENT`, `LATE`), `marked_by` (VARCHAR), `notes` (VARCHAR).
- **Constraints**: `UniqueConstraint("student_id", "batch_id", "date")` prevents duplicate marks for a student on the same day.

#### 8. `fees`
- **Purpose**: Billing and payment ledger records.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `student_id` (FK), `receipt_no` (VARCHAR), `amount` (NUMERIC(10,2)), `month_year` (VARCHAR, e.g. "Jul 2026"), `status` (ENUM: `PAID`, `PENDING`, `OVERDUE`), `payment_method` (ENUM: `BKASH`, `NAGAD`, `CASH`, `BANK_TRANSFER`), `transaction_id` (VARCHAR), `payment_date` (TIMESTAMP).
- **Business Rule**: Unpaid balances are modeled as separate rows with status `PENDING` or `OVERDUE`.

#### 9. `results`
- **Purpose**: Academic examination scores.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `student_id` (FK), `batch_id` (FK), `exam_name` (VARCHAR), `subject` (VARCHAR), `marks_obtained` (NUMERIC(5,2)), `total_marks` (NUMERIC(5,2) Default 100.00), `grade` (VARCHAR), `comments` (VARCHAR).
- **Indexes**: `idx_result_institute_id`, `idx_result_student_id`, `idx_result_batch_id`.

#### 10. `expenses`
- **Purpose**: Operational costs incurred by the coaching centre.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `title` (VARCHAR), `category` (VARCHAR, e.g. "Rent & Utilities", "Payroll", "Supplies"), `amount` (NUMERIC(10,2)), `expense_date` (TIMESTAMP), `recorded_by` (VARCHAR), `notes` (VARCHAR).

#### 11. `activity_logs`
- **Purpose**: Audit trail and notification delivery channel.
- **Key Columns**: `id` (VARCHAR PK), `institute_id` (FK), `user_id` (FK, SET NULL), `action` (VARCHAR), `details` (TEXT), `ip_address` (VARCHAR), `created_at` (TIMESTAMP).
- **Notice Storage Architecture**: The system has no dedicated `notices` table. Notices are persisted directly as `ActivityLog` entries with `action="NOTICE:<category>:<scope>"` and a JSON-encoded string in `details`.

---

## 7. Authentication, Roles & Permission Enforcement Matrix

EduFlow enforces role-based access control (RBAC) at two layers:
1. **Frontend Edge Routing (`src/middleware.ts`)**: Decodes the JWT cookie and redirects unauthorized requests to the user's home portal.
2. **Backend API Dependencies (`backend/app/core/security.py`)**: `get_current_user` extracts and validates the JWT Bearer token, binding the database query scope to `current_user.institute_id`.

### Role-vs-Permission Matrix

| Resource / Action | Owner Role | Teacher Role | Student Role | Public / Visitor |
|---|:---:|:---:|:---:|:---:|
| **Public Landing & Login** (`/`, `/login`) | Yes | Yes | Yes | **Yes** |
| **Owner Dashboard** (`/dashboard`) | **Full Access** | 403 Redirect -> `/teacher` | 403 Redirect -> `/student` | Redirect -> `/login` |
| **Student Directory** (`/students`) | **Create, View, Edit, Archive** | 403 Forbidden | 403 Forbidden | Redirect -> `/login` |
| **Batch Management** (`/batches`) | **Create, View, Assign** | Scoped -> `/teacher/batches` | 403 Forbidden | Redirect -> `/login` |
| **Attendance Marking** (`/attendance`) | **All Batches** | **Assigned Batches Only** | View Personal Only | Redirect -> `/login` |
| **Fee Management** (`/fees`) | **View, Record, Filter** | 403 Forbidden | View Personal (`/student/fees`) | Redirect -> `/login` |
| **Expense Logging** (`/expenses`) | **Full Access** | 403 Forbidden | 403 Forbidden | Redirect -> `/login` |
| **Exam Marks Entry** (`/results`) | **All Batches** | **Assigned Batches Only** | View Personal (`/student/results`) | Redirect -> `/login` |
| **Printable Report Cards** | **All Students** | **Assigned Batches Only** | **Self Only** | Redirect -> `/login` |
| **Notice Publishing** (`/notices`) | **Institute-wide & Batch** | **Assigned Batches Only** | View Only (`/student/notices`) | Redirect -> `/login` |
| **Institute Settings** (`/settings`) | **Edit Profile & Subdomain** | 403 Forbidden | 403 Forbidden | Redirect -> `/login` |
| **Language Toggle** (`/settings/language`)| **Institute Default** | Personal Preference | Personal Preference | Local Cookie Only |

---

## 8. Complete Route & Screen Inventory

The following inventory lists every route discovered in the codebase:

| Route Path | Screen Name | Role | Purpose & Information Displayed | Backend API / Entity |
|---|---|:---:|---|---|
| `/` | Marketing Landing | Public | Hero, feature overview, social proof, pricing tiers | Next.js Static / i18n |
| `/login` | Authentication Portal | Public | Email/password sign-in, demo role quick-fill pills | `/api/v1/auth/login` |
| `/register` | Tenant Onboarding | Public | Multi-step trial request (auto-logs into demo owner) | Simulated via NextAuth |
| `/demo` | Video Demo Showcase | Public | Product overview video showcase placeholder | Next.js Static / i18n |
| `/dashboard` | Owner Command Centre | Owner | Student count, revenue, attendance donut, pending fees | `/api/v1/core/dashboard/kpi` |
| `/students` | Student Directory | Owner | Table with search, batch filter, status filter, drawer | `/api/v1/students/` |
| `/batches` | Batches & Classes | Owner | Create batch card, enroll student dropdown, batch cards | `/api/v1/batches/`, `/teachers/` |
| `/attendance` | Attendance Marking | Owner/Teacher | Date picker, batch selector, roster table, bulk mark | `/api/v1/attendance/` |
| `/fees` | Fee Management | Owner | Revenue stats, paid/due tabs, record payment modal | `/api/v1/fees/` |
| `/expenses` | Expense Outflow | Owner | Total expense metric, create expense form, expense list | `/api/v1/expenses/` |
| `/results` | Exam Results Entry | Owner/Teacher | Exam selector, batch selector, student mark inputs | `/api/v1/results/init`, `/save` |
| `/results/report-card/[studentId]/[examId]` | Report Card | All Roles | Printable academic transcript, subject breakdown, GPA | `/api/v1/results/report-card/` |
| `/notices` | Notice Management | Owner/Teacher | Notice composer, target scope selector, notice feed | `/api/v1/core/notices` |
| `/settings` | Institute Profile | Owner | Institute name, address, subdomain, currency, logo | `/api/v1/core/settings/profile` |
| `/settings/language` | Language Settings | Owner/All | Default language selector (English / বাংলা) | `/api/v1/core/settings/language`|
| `/teacher` | Teacher Dashboard | Teacher | Assigned batches overview, today's schedule, stats | `/api/v1/teachers/me`, `/batches/`|
| `/teacher/batches` | Teacher Batches | Teacher | Grid of batches assigned to the authenticated teacher | `/api/v1/batches/` |
| `/teacher/batches/[batchId]` | Teacher Batch Details | Teacher | Enrolled student roster, schedule, attendance history | `/api/v1/batches/[id]` |
| `/teacher/timetable` | Teacher Timetable | Teacher | Weekly schedule broken down by assigned batches | Derived from Batch schedules |
| `/teacher/notices` | Teacher Notices | Teacher | Notices targeting teacher's batches | `/api/v1/core/notices` |
| `/teacher/profile` | Teacher Profile | Teacher | Personal details, subject specialization, joining date | `/api/v1/teachers/me` |
| `/student` | Student Dashboard | Student | Attendance percentage, latest grade, fee balance, timetable | `/api/v1/students/me` |
| `/student/attendance` | Student Attendance | Student | Monthly calendar visualization with status indicators | `/api/v1/students/me` |
| `/student/fees` | Student Fees | Student | Outstanding tuition dues and paid receipt transaction history| `/api/v1/fees/my` |
| `/student/results` | Student Results | Student | GPA calculation, overall grade, past examination list | `/api/v1/results/student` |
| `/student/timetable` | Student Timetable | Student | Weekly schedule across all enrolled batches | `/api/v1/students/me` |
| `/student/notices` | Student Notices | Student | Institute announcements and batch-specific notices | `/api/v1/core/notices` |

---

## 9. Detailed Feature Documentation

### 9.1 Institute & Account Management
- **Organization Settings**: Handled on `/settings` via `InstituteProfileClient.tsx`. Allows updating institute name, address, subdomain, currency (defaults to BDT), and timezone (`Asia/Dhaka`).
- **Logo Storage**: The form accepts a logo URL. File upload is not implemented for logos.
- **Tenant Subdomain Enforcing**: When modifying a subdomain, the backend verifies uniqueness across all institutes in `institutes.py` line 230:
  ```python
  existing = db.query(Institute).filter(Institute.subdomain == req.subdomain, Institute.id != institute_id).first()
  if existing: raise HTTPException(400, "Subdomain already taken.")
  ```
- **Language Management**: The institute owner can toggle the default language between English (`en`) and Bengali (`bn`). Toggling immediately updates the `NEXT_LOCALE` cookie and the `default_language` field in the database.

### 9.2 Dashboard & Reporting
- **KPI Metrics (`/api/v1/core/dashboard/kpi`)**:
  - `totalStudents`: `SELECT count(*) FROM students WHERE institute_id = :id AND status = 'ACTIVE'`.
  - `monthlyRevenue`: `SELECT sum(amount) FROM fees WHERE institute_id = :id AND status = 'PAID'`.
  - `pendingFees`: `SELECT sum(amount) FROM fees WHERE institute_id = :id AND status IN ('PENDING', 'OVERDUE')`.
  - `attendance`: Evaluates attendance records for `date = CURRENT_DATE`. If no attendance records exist for today, the code supplies a hardcoded default percentage of `94%` (line 65 of `core.py`).
- **Pending Reminders List**: Displays the top 5 students with overdue balances. Clicking "SMS Guardian" triggers `href="sms:<guardian_phone>?body=..."` directly opening the user's mobile device SMS composer.
- **Recent Activity Log**: Pulls the last 10 entries from `activity_logs`.

### 9.3 Student Management
- **Student Enrollment**: Enrolled via a slide-out drawer (`StudentFormSidePanel.tsx`). Requires Full Name, Roll No, Guardian Name, Guardian Phone, and Batch assignment.
- **Photo Upload**: Supports uploading an image. Saved locally to `frontend/public/uploads/<timestamp>-<filename>`.
- **Soft Deletion / Archive**: Clicking delete on `/students` updates `status = 'SUSPENDED'` and logs to `activity_logs`. Physical database deletion is prevented.
- **Search & Filtering**: Search box filters students in real time by name and roll number; batch and status dropdown filters operate client-side over the fetched roster.

### 9.4 Teacher Management
- **Capabilities Present**: Directory listing (`GET /api/v1/teachers/`), personal profile inspection (`GET /api/v1/teachers/me`), and teacher assignment to batches.
- **Capabilities Absent**: No UI or API endpoint exists to add, edit, or delete teachers (`POST /teachers` does not exist). Teachers must be pre-provisioned via database seeding or direct SQL.

### 9.5 Batch & Class Management
- **Batch Creation**: Located on `/batches`. Accepts Batch Name, Subject, Weekly Schedule (e.g., "Sun, Tue, Thu 4:00 PM"), Monthly Fee, and assigned Teacher ID.
- **Student Enrollment**: Handled via `AssignStudentClient.tsx` using an interactive search dropdown. Inserts into the `student_batches` join table.

### 9.6 Attendance System
- **Marking Workflow**: Located on `/attendance`. Selects Batch and Date. The table renders all enrolled students with three toggle buttons: **Present** (Green), **Absent** (Red), and **Late** (Yellow).
- **Bulk Action**: The "Mark All Present" button triggers `bulkMarkPresentAction()`, identifying unrecorded students and inserting `PRESENT` records.
- **Teacher Restriction**: A teacher attempting to mark attendance for a batch they do not instruct is rejected with HTTP 403 in `attendance.py` line 47.

### 9.7 Fees & Financial Management
- **Manual Payment Recording**: Clicking "Record Payment" opens `RecordPaymentModal.tsx`. Generates an automatic receipt number (e.g. `RCPT-739102`), allows selecting Student, Amount, Date, and Payment Method (`CASH`, `BKASH`, `NAGAD`, `BANK_TRANSFER`).
- **Payment Gateway Reality**: Online payment processing is simulated. `process_payment()` in `fees.py` instantly assigns status `PAID` with synthetic transaction ID `method_tx_<timestamp>`. No live webhook or SSLCommerz/bKash integration exists.
- **Pending Balances**: Displayed on `/fees` under the "Due" status tab.

### 9.8 Examinations & Results
- **Marks Entry Workflow**: Located on `/results`. Selects Exam Name (e.g. "First Term 2024"), Batch, and Subject. Renders a table of students with number inputs for marks obtained.
- **Automated Grading Logic**: Standard Bangladeshi secondary grading scale:
  - 80% to 100%: Grade **A+** (GPA 5.0)
  - 70% to 79%: Grade **A** (GPA 4.0)
  - 60% to 69%: Grade **A-** (GPA 3.5)
  - 50% to 59%: Grade **B** (GPA 3.0)
  - 40% to 49%: Grade **C** (GPA 2.0)
  - 33% to 39%: Grade **D** (GPA 1.0)
  - Below 33%: Grade **F** (GPA 0.0)
- **Printable Report Card**: Accessible at `/results/report-card/[studentId]/[examId]`. Renders a formal certificate view with institute letterhead, subject table, total marks, percentage, GPA, remarks, and a dedicated `@media print` CSS stylesheet with a "Print Report Card" trigger button.

### 9.9 Notices & Communication
- **Publishing Notices**: Located on `/notices`. Author chooses Title, Category (`ACADEMIC`, `EXAM`, `FEE`, `GENERAL`), Urgency (`true/false`), and Target Scope (`EVERYONE` or specific `BATCH`).
- **Underlying Storage**: Stored as JSON strings in the `activity_logs` table under the action signature `NOTICE:<category>:<scope>`.
- **Communication Channels**: SMS, Email, and WhatsApp sending are simulated. Clicking SMS opens `sms:<phone>`, and notices are displayed within the web portal only.

### 9.10 Student Portal
- **Dashboard (`/student`)**: Summarizes personal attendance percentage, latest exam result, tuition fee balance, and daily class schedule. If no results exist, defaults to placeholder strings (`"A+"`, `"Final Term Math"`).
- **Personal Views**: Sub-pages provide full personal history for Attendance (`/student/attendance` with a monthly calendar view), Fee Receipts (`/student/fees`), Results (`/student/results`), Timetable (`/student/timetable`), and Notices (`/student/notices`).

---

## 10. API Endpoint Reference

The backend exposes endpoints under two concurrent prefixes: `/api/v1` and `/api`. Every authenticated endpoint requires the header `Authorization: Bearer <token>`.

### Authentication & Core Endpoints
| HTTP Method | Route Path | Handler Function | Auth Required | Roles Permitted | Description |
|---|---|---|:---:|:---:|---|
| `POST` | `/api/v1/auth/login` | `login` | No | Public | Validates credentials; returns JWT `access_token` and `refresh_token`. |
| `GET` | `/health` / `/api/v1/health` | `health_check` | No | Public | Returns system health and PostgreSQL connection status. |
| `GET` | `/ping` / `/api/v1/ping` | `health_check` | No | Public | Lightweight keepalive ping for hosting pre-warmers. |
| `GET` | `/api/v1/core/dashboard/kpi`| `get_dashboard_kpis` | Yes | `OWNER` | Aggregates institute student counts, revenue, and attendance. |
| `POST` | `/api/v1/core/dashboard/fee-reminder` | `send_fee_reminder` | Yes | `OWNER` | Records a fee reminder activity log entry. |
| `GET` | `/api/v1/core/notices` | `get_notices` | Yes | All Roles | Lists institute and batch notices based on user role. |
| `POST` | `/api/v1/core/notices` | `create_notice` | Yes | `OWNER`, `TEACHER` | Publishes a new notice; teachers restricted to assigned batches. |
| `GET` | `/api/v1/core/settings/profile` | `get_profile` | Yes | `OWNER` | Fetches institute configuration metadata. |
| `PUT` | `/api/v1/core/settings/profile` | `update_profile` | Yes | `OWNER` | Updates name, address, subdomain, and currency. |
| `PUT` | `/api/v1/core/settings/language`| `update_language` | Yes | `OWNER` | Updates default institute locale (`en` or `bn`). |

### Students & Batches Endpoints
| HTTP Method | Route Path | Handler Function | Auth Required | Roles Permitted | Description |
|---|---|---|:---:|:---:|---|
| `GET` | `/api/v1/students/` | `get_students` | Yes | `OWNER` | Returns all students enrolled in the institute. |
| `GET` | `/api/v1/students/me` | `get_my_student_profile`| Yes | `STUDENT` | Returns authenticated student's profile and records. |
| `GET` | `/api/v1/students/{student_id}` | `get_student` | Yes | `OWNER`, `TEACHER`| Fetches single student record with join relations. |
| `POST` | `/api/v1/students/` | `create_student` | Yes | `OWNER` | Enrolls a new student and assigns to batch. |
| `PUT` | `/api/v1/students/{student_id}` | `update_student` | Yes | `OWNER` | Updates student profile details and batch assignment. |
| `DELETE`| `/api/v1/students/{student_id}` | `delete_student` | Yes | `OWNER` | Soft-archives student by setting status to `SUSPENDED`. |
| `GET` | `/api/v1/batches/` | `get_batches` | Yes | `OWNER`, `TEACHER`| Lists batches; filtered to assigned batches for teachers. |
| `POST` | `/api/v1/batches/` | `create_batch` | Yes | `OWNER` | Creates a new batch with schedule and fee settings. |
| `POST` | `/api/v1/batches/assign` | `assign_student_to_batch`| Yes | `OWNER` | Enrolls a student into a batch via `student_batches`. |
| `GET` | `/api/v1/batches/{batch_id}` | `get_batch_details` | Yes | `OWNER`, `TEACHER`| Detailed batch view including enrolled student roster. |

### Attendance, Fees, Results & Expenses Endpoints
| HTTP Method | Route Path | Handler Function | Auth Required | Roles Permitted | Description |
|---|---|---|:---:|:---:|---|
| `POST` | `/api/v1/attendance/upsert`| `upsert_attendance` | Yes | `OWNER`, `TEACHER`| Upserts daily attendance status for a student. |
| `POST` | `/api/v1/attendance/bulk-present`| `bulk_mark_present` | Yes | `OWNER`, `TEACHER`| Marks all unrecorded students in a batch as present. |
| `GET` | `/api/v1/fees/` | `get_fees` | Yes | `OWNER` | Lists fee records with optional status filtering. |
| `GET` | `/api/v1/fees/my` | `get_my_fees` | Yes | `STUDENT` | Retrieves personal fee ledger for logged-in student. |
| `POST` | `/api/v1/fees/` | `record_fee` | Yes | `OWNER` | Records manual fee payment and generates receipt. |
| `GET` | `/api/v1/results/init` | `get_results_init` | Yes | `OWNER`, `TEACHER`| Initializes result entry view with batches and roster. |
| `POST` | `/api/v1/results/save` | `save_results` | Yes | `OWNER`, `TEACHER`| Saves exam marks and computes letter grades. |
| `GET` | `/api/v1/results/report-card/{student_id}/{exam_id}` | `get_report_card` | Yes | All Roles | Generates printable report card dataset. |
| `GET` | `/api/v1/results/student` | `get_student_results` | Yes | `STUDENT` | Returns exam result history and attendance stats. |
| `GET` | `/api/v1/expenses/` | `get_expenses` | Yes | `OWNER` | Lists operational expenditure records. |
| `POST` | `/api/v1/expenses/` | `create_expense` | Yes | `OWNER` | Records a new expense outflow. |

---

## 11. Frontend Component & Server-Action Map

Next.js Server Actions act as an authenticated bridge between React components and the backend REST API:

```
Component: StudentFormSidePanel.tsx (Client)
  └── Calls Server Action: createOrUpdateStudentAction (src/actions/students.ts)
        └── Validates: Zod studentSchema
        └── Saves Upload: saveUploadedFile() -> public/uploads/
        └── Calls API: POST/PUT /api/v1/students/
        └── Revalidates: revalidatePath('/students'), revalidatePath('/dashboard')

Component: RecordPaymentModal.tsx (Client)
  └── Calls Server Action: recordPaymentAction (src/actions/fees.ts)
        └── Verifies: Session & instituteId
        └── Calls API: POST /api/v1/fees/
        └── Revalidates: revalidatePath('/fees'), revalidatePath('/dashboard')

Component: AttendanceMarkingClient.tsx (Client)
  └── Calls Server Action: upsertAttendanceAction & bulkMarkPresentAction (src/actions/attendance.ts)
        └── Verifies: Teacher batch assignment
        └── Calls API: POST /api/v1/attendance/upsert & /bulk-present
        └── Revalidates: revalidatePath('/attendance')

Component: ResultsEntryClient.tsx (Client)
  └── Calls Server Action: saveResultsAction (src/actions/results.ts)
        └── Calls API: POST /api/v1/results/save
        └── Revalidates: revalidatePath('/results')

Component: AssignStudentClient.tsx (Client)
  └── Calls Server Action: assignStudentToBatchAction (src/actions/batches.ts)
        └── Calls API: POST /api/v1/batches/assign
        └── Revalidates: revalidatePath('/batches'), revalidatePath('/students')
```

---

## 12. Important Business Rules & Calculations

### 1. Grading Scale
The grading logic in `backend/app/api/results.py` (lines 162–168) calculates marks as a percentage of total marks:
$$\text{Percentage} = \left(\frac{\text{marksObtained}}{\text{totalMarks}}\right) \times 100$$
- $\text{Percentage} \ge 80\% \implies \mathbf{A+}$ (GPA 5.0)
- $70\% \le \text{Percentage} < 80\% \implies \mathbf{A}$ (GPA 4.0)
- $60\% \le \text{Percentage} < 70\% \implies \mathbf{A-}$ (GPA 3.5)
- $50\% \le \text{Percentage} < 60\% \implies \mathbf{B}$ (GPA 3.0)
- $40\% \le \text{Percentage} < 50\% \implies \mathbf{C}$ (GPA 2.0)
- $33\% \le \text{Percentage} < 40\% \implies \mathbf{D}$ (GPA 1.0)
- $\text{Percentage} < 33\% \implies \mathbf{F}$ (GPA 0.0)

### 2. Attendance Rate Formula
Attendance percentage in `students.py` and `AttendanceDonut.tsx`:
$$\text{Attendance Rate} = \text{round}\left(\frac{\text{Present Count} + \text{Late Count}}{\text{Total Sessions Marked}}\right) \times 100$$
*Notice: In `StudentDashboardContent` (line 41 of `student/page.tsx`), if no attendance sessions have been recorded, the UI substitutes a fallback constant of $96\%$.*

### 3. Authentication Rate Limiting
Implemented in both FastAPI (`backend/app/api/auth.py`) and Next.js (`frontend/src/lib/auth/auth.ts`):
- Threshold: 5 consecutive failed login attempts for an email address.
- Penalty: 15-minute complete lockout for that email (`HTTP 429 Too Many Requests`).
- Storage: In-memory dictionary/Map. Resets upon server restart.

### 4. Student Roll Number Integrity
A unique compound constraint `(institute_id, roll_no)` is enforced at the database level. Two students within Institute A cannot possess the same roll number; however, Institute A and Institute B may both possess student Roll `2026-001`.

---

## 13. Configuration & Deployment Architecture

### Environment Variables
| Variable Name | Consuming Service | Required | Default / Example Purpose |
|---|---|:---:|---|
| `DATABASE_URL` | Backend & Migrations | **Yes** | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `SECRET_KEY` / `AUTH_SECRET` | Backend & Frontend | **Yes** | Secret cryptographic key for signing JWT tokens |
| `NEXT_PUBLIC_API_URL` | Frontend Client & SSR | **Yes** | Base URL for FastAPI backend (`http://localhost:8000` or production URL) |
| `NEXTAUTH_URL` | Frontend Auth | Optional | Canonical URL for NextAuth callbacks (`http://localhost:3000`) |
| `CORS_ORIGINS` | Backend CORS | Optional | Comma-separated allowed frontend domains |
| `PORT` | Backend / Docker | Optional | Port for Uvicorn process (Defaults to `8000`) |

### Deployment Service Boundaries
```
+---------------------------------------------------------------------------------+
|                               DEPLOYMENT TOPOLOGY                               |
|                                                                                 |
|  [ Vercel Edge / Serverless ]              [ Render Web Service (Free/Starter) ]|
|  Frontend: Next.js 16.2 Turbopack          Backend: FastAPI + Uvicorn           |
|  Root Directory: frontend/                 Root Directory: backend/             |
|  Build: npm run build                      Build: pip install -r requirements   |
|  Output: Static HTML + Serverless Lambdas  Start: uvicorn app.main:app          |
|                                                          |                      |
|                                                          v                      |
|                                             [ Managed Cloud PostgreSQL ]        |
|                                             Neon / Supabase / Render Postgres   |
+---------------------------------------------------------------------------------+
```

---

## 14. External Integrations & Verification Status

| Integration Domain | Third-Party Provider | Status in Repository | Evidence / Finding |
|---|---|:---:|---|
| **Payment Gateway** | SSLCommerz / bKash / Nagad | **MOCKED / SIMULATED** | No gateway SDK installed. `fees.py` generates `cash_tx_<timestamp>`. |
| **SMS Messaging** | Twilio / Greenweb / BulkSMS BD | **UI ONLY / NATIVE LINK** | Reminders use `href="sms:<phone>"`. No server SMS API integrated. |
| **Email Delivery** | SendGrid / Resend / Amazon SES | **NOT FOUND** | No SMTP or transactional email libraries present in dependencies. |
| **Object / File Storage** | AWS S3 / Cloudflare R2 / Vercel Blob | **LOCAL DISK ONLY** | Writes directly to `public/uploads/` on server filesystem. |
| **Accounting / Ledger** | Tally / QuickBooks | **NOT FOUND** | Expenses and fees exist only in local PostgreSQL tables. |

---

## 15. Testing & QA Inventory

### Automated Test Execution Results

#### 1. Backend Integration Tests (`pytest`)
- **Execution Command**: `cd backend && PYTHONPATH=. ./venv/bin/pytest`
- **Result**: **17 PASSED in 0.52s**
- **Test Coverage**:
  - `test_attendance.py`: Multi-tenant student isolation, teacher batch authorization, attendance upsert success.
  - `test_core.py`: Cross-tenant fee reminder rejection, isolated dashboard KPI calculation.
  - `test_fees.py`: Cross-institute fee recording rejection.
  - `test_health.py`: Health check and keepalive endpoints.
  - `test_results.py`: Teacher batch permission validation, unauthorized student report card rejection, student result retrieval.
  - `test_students.py`: Cross-tenant student deletion 404, teacher delete student 403, batch assignment verification.

#### 2. Playwright Live Route Audit (`others/qa_audit.js`)
- **Execution Command**: `node others/qa_audit.js`
- **Result**: **All 22 distinct portal routes returned HTTP 200 with 0 console errors and 0 page exceptions.**
- **Hydration Finding**: The automated script identified that clicking `<button type="submit">` on `/login` before React completes hydration can cause native browser GET navigation.

---

## 16. Screenshot Gallery with Embedded Images

All 41 screenshots captured from the live local execution environment are presented below:

### 16.1 Public & Authentication Interface
![Public Landing Page Desktop](./project-dossier/assets/public-landing-desktop.png)
*Figure 1: Public marketing landing page (1440x1000 desktop view) showcasing hero typography, feature value propositions, pricing tiers, and top navigation.*

![Public Landing Page Mobile](./project-dossier/assets/public-landing-mobile.png)
*Figure 2: Public marketing landing page (390x844 mobile view) showing responsive layout stacking and mobile navigation.*

![Authentication Login Screen Desktop](./project-dossier/assets/public-login-desktop.png)
*Figure 3: Secure authentication portal showing email and password fields, remember-me checkbox, language selector, and quick demo login pills.*

![Authentication Login Screen Mobile](./project-dossier/assets/public-login-mobile.png)
*Figure 4: Mobile viewport rendering of the authentication login screen.*

![Tenant Registration Onboarding Screen](./project-dossier/assets/public-register-desktop.png)
*Figure 5: Tenant registration interface providing institute onboarding form fields and tier selection.*

![Product Video Showcase Demo Screen](./project-dossier/assets/public-demo-desktop.png)
*Figure 6: Product demonstration overview screen featuring video showcase placeholder and trial call-to-actions.*

---

### 16.2 Institute Owner Portal
![Owner Dashboard Desktop](./project-dossier/assets/owner-dashboard-desktop.png)
*Figure 7: Institute Owner command dashboard displaying real-time total active students, monthly collected revenue, pending fee liabilities, today's attendance breakdown donut chart, and pending fee collection reminders.*

![Owner Dashboard Rendered in Bengali Locale](./project-dossier/assets/owner-dashboard-bangla-desktop.png)
*Figure 8: Owner command dashboard rendered in Bengali (বাংলা) demonstrating localized strings across metrics, navigation items, and action buttons.*

![Owner Dashboard Mobile Viewport](./project-dossier/assets/owner-dashboard-mobile.png)
*Figure 9: Mobile viewport rendering of the owner dashboard with vertically stacked metric cards.*

![Owner Student Management Directory](./project-dossier/assets/owner-students-list-desktop.png)
*Figure 10: Student management directory table displaying student photos, roll numbers, guardian contacts, enrolled batch tags, fee status badges, attendance percentages, and row action menus.*

![Owner Student Management Directory Mobile](./project-dossier/assets/owner-students-list-mobile.png)
*Figure 11: Mobile viewport of the student directory demonstrating responsive table container wrapping.*

![Add Student Drawer Form](./project-dossier/assets/owner-student-add-panel-desktop.png)
*Figure 12: Slide-out drawer panel for enrolling a new student, showing fields for full name, roll number, guardian details, photo upload, and batch assignment.*

![Batch Management & Creation Interface](./project-dossier/assets/owner-batches-list-desktop.png)
*Figure 13: Batch management screen showing the Create New Batch card, the Enroll Student in Batch dropdown, and active batch cards with teacher and fee details.*

![Attendance Marking Interface](./project-dossier/assets/owner-attendance-marking-desktop.png)
*Figure 14: Daily attendance marking grid displaying batch selector, date picker, roster of enrolled students, single-click status toggles (Present/Absent/Late), and bulk mark present button.*

![Attendance Marking Interface Mobile](./project-dossier/assets/owner-attendance-marking-mobile.png)
*Figure 15: Mobile viewport of the attendance marking interface.*

![Fee Management Ledger](./project-dossier/assets/owner-fees-list-desktop.png)
*Figure 16: Fee management ledger showing collected revenue metrics, status tabs (All, Paid, Due), receipt numbers, payment methods, transaction timestamps, and Record Payment trigger.*

![Fee Management Ledger Mobile](./project-dossier/assets/owner-fees-list-mobile.png)
*Figure 17: Mobile viewport rendering of the fee management ledger.*

![Record Fee Payment Modal Dialog](./project-dossier/assets/owner-record-payment-modal-desktop.png)
*Figure 18: Record Payment modal dialog showing student selector, payment amount input, date picker, payment method selector (Cash/bKash/Nagad/Bank Transfer), and auto-generated receipt number.*

![Operational Expense Tracking](./project-dossier/assets/owner-expenses-list-desktop.png)
*Figure 19: Operational expenditure tracker displaying monthly outflow summary, expense entry form (title, category, amount, notes), and historical expense logs.*

![Examination Results Entry Grid](./project-dossier/assets/owner-results-entry-desktop.png)
*Figure 20: Examination results entry grid showing exam name selector, batch selector, subject input, total marks configuration, and student marks entry inputs.*

![Printable Report Card Certificate View](./project-dossier/assets/owner-report-card-view-desktop.png)
*Figure 21: Academic report card certificate view displaying institute header, student metadata, subject marks breakdown table, calculated letter grades, overall GPA, remarks, and print trigger button.*

![Notice Publishing & Management](./project-dossier/assets/owner-notices-management-desktop.png)
*Figure 22: Notice management screen featuring notice creation form with category and target scope selector, urgent announcement toggle, and chronological notice feed.*

![Institute Profile Settings](./project-dossier/assets/owner-settings-profile-desktop.png)
*Figure 23: Institute profile configuration screen allowing customization of coaching centre name, physical address, custom subdomain, default currency, and timezone.*

![Language & Localization Settings](./project-dossier/assets/owner-settings-language-desktop.png)
*Figure 24: Localization settings interface displaying institute default language selector (English / বাংলা) and locale preview.*

---

### 16.3 Teacher Portal
![Teacher Dashboard Desktop](./project-dossier/assets/teacher-dashboard-desktop.png)
*Figure 25: Teacher dashboard overview displaying assigned active batches count, greeting section, quick attendance marking shortcut cards, and upcoming class schedule.*

![Teacher Dashboard Mobile Viewport](./project-dossier/assets/teacher-dashboard-mobile.png)
*Figure 26: Mobile viewport rendering of the teacher dashboard.*

![Teacher Assigned Batches Directory](./project-dossier/assets/teacher-batches-list-desktop.png)
*Figure 27: Teacher assigned batches directory listing cohorts instructed by the logged-in teacher.*

![Teacher Batch Detail Roster View](./project-dossier/assets/teacher-batch-details-desktop.png)
*Figure 28: Detailed view of a teacher's assigned batch showing enrolled student roster, schedule, and attendance shortcuts.*

![Teacher Attendance Marking View](./project-dossier/assets/teacher-attendance-desktop.png)
*Figure 29: Attendance marking interface scoped to the teacher's authorized batches.*

![Teacher Exam Results Entry View](./project-dossier/assets/teacher-results-desktop.png)
*Figure 30: Results entry interface scoped to the teacher's assigned batches.*

![Teacher Timetable & Weekly Schedule](./project-dossier/assets/teacher-timetable-desktop.png)
*Figure 31: Teacher timetable display showing weekly class time slots, subjects, and batch assignments.*

![Teacher Notices View](./project-dossier/assets/teacher-notices-desktop.png)
*Figure 32: Notices view for teachers showing institute-wide and batch-targeted announcements.*

![Teacher Faculty Profile](./project-dossier/assets/teacher-profile-desktop.png)
*Figure 33: Teacher personal profile display showing name, email, subject specialization, and joining date.*

![Multi-Tenant Security Boundary Redirect](./project-dossier/assets/security-teacher-redirect-fees-desktop.png)
*Figure 34: Verification of multi-tenant security boundary: a Teacher attempting to navigate to the owner-only `/fees` route is intercepted by middleware and redirected to `/teacher`.*

---

### 16.4 Student Portal
![Student Dashboard Desktop](./project-dossier/assets/student-dashboard-desktop.png)
*Figure 35: Student personal dashboard showing monthly attendance rate, latest exam grade card, tuition payment status badge, and enrolled batch timetable.*

![Student Dashboard Mobile Viewport](./project-dossier/assets/student-dashboard-mobile.png)
*Figure 36: Mobile viewport rendering of the student dashboard.*

![Student Monthly Attendance Calendar](./project-dossier/assets/student-attendance-desktop.png)
*Figure 37: Student attendance calendar view rendering a monthly grid with colour-coded attendance indicators.*

![Student Attendance Calendar Mobile](./project-dossier/assets/student-attendance-mobile.png)
*Figure 38: Mobile viewport of the student attendance calendar.*

![Student Fee Status & Ledger](./project-dossier/assets/student-fees-desktop.png)
*Figure 39: Student fee ledger showing clear status indicator, payment history table, receipt numbers, and payment methods.*

![Student Fee Status Mobile](./project-dossier/assets/student-fees-mobile.png)
*Figure 40: Mobile viewport of the student fee ledger.*

![Student Exam Results History](./project-dossier/assets/student-results-desktop.png)
*Figure 41: Student exam results screen displaying calculated GPA, overall grade, and term-by-term subject marks history.*

![Student Class Timetable](./project-dossier/assets/student-timetable-desktop.png)
*Figure 42: Student class timetable showing weekly academic schedule across all enrolled batches.*

![Student Notices Feed](./project-dossier/assets/student-notices-desktop.png)
*Figure 43: Student notice feed displaying published institute announcements and batch-specific notices.*

---

## 17. Complete Screenshot Index

| Screenshot File Name | Route | Role | Viewport | Interface State & Purpose |
|---|---|:---:|:---:|---|
| `public-landing-desktop.png` | `/` | Public | 1440x1000 | Hero, value propositions, feature highlights, and pricing tiers |
| `public-landing-mobile.png` | `/` | Public | 390x844 | Mobile responsive landing layout with stacked sections |
| `public-login-desktop.png` | `/login` | Public | 1440x1000 | Credentials login form with quick demo role selection pills |
| `public-login-mobile.png` | `/login` | Public | 390x844 | Mobile credentials login form |
| `public-register-desktop.png` | `/register` | Public | 1440x1000 | Trial registration form for new coaching centres |
| `public-demo-desktop.png` | `/demo` | Public | 1440x1000 | Product overview video showcase placeholder |
| `owner-dashboard-desktop.png` | `/dashboard` | Owner | 1440x1000 | Operational metrics, attendance donut chart, fee reminders |
| `owner-dashboard-bangla-desktop.png` | `/dashboard` | Owner | 1440x1000 | Operational dashboard rendered in Bengali (`bn`) locale |
| `owner-dashboard-mobile.png` | `/dashboard` | Owner | 390x844 | Vertically stacked mobile layout of operational dashboard |
| `owner-students-list-desktop.png` | `/students` | Owner | 1440x1000 | Student directory table with search, filters, and action menus |
| `owner-students-list-mobile.png` | `/students` | Owner | 390x844 | Mobile responsive student directory table |
| `owner-student-add-panel-desktop.png`| `/students` | Owner | 1440x1000 | Slide-out drawer with student enrollment form fields |
| `owner-batches-list-desktop.png` | `/batches` | Owner | 1440x1000 | Create batch form, student enroll form, and active batch cards |
| `owner-attendance-marking-desktop.png`| `/attendance` | Owner | 1440x1000 | Daily attendance roster with single-click Present/Absent/Late toggles |
| `owner-attendance-marking-mobile.png` | `/attendance` | Owner | 390x844 | Mobile attendance marking table |
| `owner-fees-list-desktop.png` | `/fees` | Owner | 1440x1000 | Fee collection ledger with status tabs and receipt details |
| `owner-fees-list-mobile.png` | `/fees` | Owner | 390x844 | Mobile view of fee collection ledger |
| `owner-record-payment-modal-desktop.png`| `/fees` | Owner | 1440x1000 | Modal dialog for recording student fee payments |
| `owner-expenses-list-desktop.png` | `/expenses` | Owner | 1440x1000 | Operational expense logging form and expenditure history |
| `owner-results-entry-desktop.png` | `/results` | Owner | 1440x1000 | Batch exam marks entry grid with automatic grade conversion |
| `owner-report-card-view-desktop.png`| `/results/report-card/*`| Owner | 1440x1000 | Formal printable academic report card certificate view |
| `owner-notices-management-desktop.png`| `/notices` | Owner | 1440x1000 | Announcement composer with target scope and chronological notice list |
| `owner-settings-profile-desktop.png`| `/settings` | Owner | 1440x1000 | Coaching centre profile and subdomain settings |
| `owner-settings-language-desktop.png`| `/settings/language`| Owner | 1440x1000 | Default institute language selection (English / বাংলা) |
| `teacher-dashboard-desktop.png` | `/teacher` | Teacher | 1440x1000 | Assigned batches count, today's schedule, and attendance shortcuts |
| `teacher-dashboard-mobile.png` | `/teacher` | Teacher | 390x844 | Mobile view of teacher dashboard |
| `teacher-batches-list-desktop.png` | `/teacher/batches`| Teacher | 1440x1000 | Directory of batches assigned to the logged-in instructor |
| `teacher-batch-details-desktop.png` | `/teacher/batches/*`| Teacher | 1440x1000 | Enrolled student roster and schedule for a specific batch |
| `teacher-attendance-desktop.png` | `/attendance` | Teacher | 1440x1000 | Attendance marking scoped to the teacher's assigned batches |
| `teacher-results-desktop.png` | `/results` | Teacher | 1440x1000 | Exam marks entry scoped to the teacher's assigned batches |
| `teacher-timetable-desktop.png` | `/teacher/timetable`| Teacher | 1440x1000 | Weekly class schedule for assigned cohorts |
| `teacher-notices-desktop.png` | `/teacher/notices`| Teacher | 1440x1000 | Announcements visible to faculty members |
| `teacher-profile-desktop.png` | `/teacher/profile`| Teacher | 1440x1000 | Teacher profile information and subject assignment |
| `security-teacher-redirect-fees-desktop.png`| `/fees` | Teacher | 1440x1000 | Middleware intercept redirecting unauthorized teacher access |
| `student-dashboard-desktop.png` | `/student` | Student | 1440x1000 | Student personal dashboard with attendance rate and fee balance |
| `student-dashboard-mobile.png` | `/student` | Student | 390x844 | Mobile view of student personal dashboard |
| `student-attendance-desktop.png` | `/student/attendance`| Student | 1440x1000 | Monthly calendar grid with color-coded attendance indicators |
| `student-attendance-mobile.png` | `/student/attendance`| Student | 390x844 | Mobile monthly attendance calendar |
| `student-fees-desktop.png` | `/student/fees` | Student | 1440x1000 | Outstanding tuition balance card and past payment receipts |
| `student-fees-mobile.png` | `/student/fees` | Student | 390x844 | Mobile view of student fee ledger |
| `student-results-desktop.png` | `/student/results`| Student | 1440x1000 | Term-by-term exam marks, GPA, and grade breakdown |
| `student-timetable-desktop.png` | `/student/timetable`| Student | 1440x1000 | Weekly class timetable across all enrolled batches |
| `student-notices-desktop.png` | `/student/notices`| Student | 1440x1000 | Announcements published by institute management |

---

## 18. Current Design System & UI Component Inventory

### Color Palette (Tailwind Tokens in `frontend/tailwind.config.ts`)
- **Primary Palette**: `primary: #00288e` (Deep Academic Blue), `primary-container: #1e40af`, `on-primary: #ffffff`.
- **Secondary Palette**: `secondary: #006c4a` (Forest Green for Paid/Success), `secondary-container: #82f5c1`.
- **Tertiary Palette**: `tertiary: #532a00` (Warm Amber for Late/Pending), `tertiary-container: #743d00`.
- **Error Palette**: `error: #ba1a1a` (Red for Absent/Overdue), `error-container: #ffdad6`.
- **Neutral Surface Palette**: `surface: #f8f9ff` (Soft Blue-Gray Tint), `surface-container-lowest: #ffffff` (Pure Card White), `on-surface: #121c28`, `outline-variant: #c4c5d5`.

### Typography Scale
- Fonts: `Inter` (Latin primary) paired with `Noto Sans Bengali` for Bengali text rendering.
- Headings: `h1: [36px/44px, 700]`, `h2: [30px/38px, 600]`, `h3: [24px/32px, 600]`, `h4: [20px/28px, 600]`.
- Body: `body-lg: [18px/28px]`, `body-md: [16px/24px]`, `body-sm: [14px/20px]`, `caption: [12px/16px]`.

### Core Reusable UI Components
- `Button.tsx`: Variants for `primary`, `secondary`, `outline`, and `ghost`.
- `Card.tsx`: Standard rounded card container (`rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-sm`).
- `Modal.tsx`: Fixed overlay dialog with backdrop blur, focus trap, and close button.
- `Icon.tsx`: Google Material Symbols Outlined font wrapper (`<Icon name="check_circle" />`).
- `LanguageToggle.tsx`: Language toggle button (`EN` / `বাংলা`) with immediate cookie update.
- `NotificationBell.tsx`: Utility header alert indicator with notification badge.
- `ProfileDropdown.tsx`: User identity card displaying name, email, role badge, and sign-out button.
- `ContentSkeleton.tsx`: Animated pulse skeleton placeholder for React Suspense fallbacks.

---

## 19. UX Audit & ERP-Design Transition Considerations

### 1. Current Aesthetic: "Website" vs. "Enterprise ERP"
The current interface is built with high visual appeal (generous card padding, rounded corners, soft drop shadows, and illustrated empty states). However, for daily operational use by coaching centre staff, this design introduces several inefficiencies:
- **Low Information Density**: The owner dashboard displays only 4 metrics across full screen width, requiring scrolling to view pending fee reminders.
- **Card-Heavy Layouts**: On `/batches`, `/expenses`, and `/teacher`, forms and lists are wrapped in large cards with 24px–32px padding, limiting visible rows on typical 13-inch laptop screens (1366x768 / 1440x900).
- **Navigation Placement**: The sidebar operates well, but the top bar is tall (64px) with excessive whitespace.

### 2. Specific Screen-by-Screen UX Findings
- **Students Table (`/students`)**: Rows are 64px tall with large avatar circles. In an institute with 500 students, pagination at 10 rows per page requires 50 page clicks.
  *Recommendation for Redesign*: Introduce a compact dense-table mode (36px row height), multi-select checkboxes for bulk batch assignment, and sticky header columns.
- **Batch Management (`/batches`)**: "Create Batch" and "Enroll Student" occupy two 50% split cards at the top, pushing the actual batch list below the fold.
  *Recommendation for Redesign*: Move "Create Batch" and "Enroll Student" into header action modal dialogs or a collapsible sub-toolbar, allowing the batches table/grid to occupy primary screen real estate.
- **Attendance Marking (`/attendance`)**: The 3 toggle buttons (Present, Absent, Late) are clear, but lack keyboard shortcuts. In a classroom of 40 students, staff must click 40 times.
  *Recommendation for Redesign*: Support keyboard hotkeys (`P` for present, `A` for absent, `L` for late) and arrow key row navigation.
- **Fee Management (`/fees`)**: Recording a payment requires opening a modal and picking the student from an unindexed `<select>` dropdown.
  *Recommendation for Redesign*: Replace native `<select>` with a searchable autocomplete input showing Student Name, Roll, and Current Due balance simultaneously.

### 3. Target Modern ERP Architecture Requirements
When implementing the upcoming visual redesign, the following principles should be maintained:
1. **Persistent Operational Workspace**: Fixed full-height layout with independent scrolling for tables and forms.
2. **Compact Utility Header**: Slim 44px–48px header with contextual breadcrumbs, quick global search (`Cmd+K`), active academic term indicator, and profile controls.
3. **Data-Dense Grids**: Standardized data tables featuring customizable columns, column-level sorting, sticky headers, row selection, export to CSV/Excel, and print buttons.
4. **Keyboard-First Navigation**: Tab index flow optimized for fast data entry in attendance marking and exam marks entry.
5. **Unified Design System**: Coherent styling shared across Owner, Teacher, and Student portals while maintaining appropriate role-specific information density.

---

## 20. End-to-End Workflow Documentation

### Workflow 1: First-Time Institute Setup & Onboarding
- **Entry Point**: `/register`
- **Observed Behavior**: User enters Institute Name, Owner Name, Email, Phone, Password, and selects a plan. Submitting the form does not invoke an institute provisioning endpoint; instead, it automatically logs into the demo owner account (`owner@eduflow.bd`) and navigates to `/dashboard`.
- **Status**: **MOCKED / SIMULATED**.

### Workflow 2: Enrolling a New Student
- **Entry Point**: `/students` -> Click "Add Student" button.
- **Sequence**: Slide-out drawer opens -> Enter Full Name ("Tanvir Hasan"), Roll No ("2026-020"), Guardian Phone ("01711000000"), select Batch ("Class 10 - Higher Math Special") -> Click "Save Student".
- **Backend Flow**: Next.js Server Action (`createOrUpdateStudentAction`) validates via Zod -> Sends `POST /api/v1/students/` -> Inserts `students` and `student_batches` records -> Inserts `activity_logs` entry -> Calls `revalidatePath('/students')` -> Drawer closes and new student appears in table.
- **Status**: **VERIFIED WORKING** (3 steps).

### Workflow 3: Creating a Batch & Assigning Students
- **Entry Point**: `/batches`
- **Sequence**: In "Create New Batch" form, enter Name, Subject, Schedule, Monthly Fee, select Teacher -> Submit -> Batch card appears in grid -> In "Enroll Student in Batch" form, search student by name/roll -> Select Batch -> Submit -> Student added to cohort.
- **Status**: **VERIFIED WORKING** (2 discrete actions on one screen).

### Workflow 4: Daily Attendance Marking
- **Entry Point**: `/attendance`
- **Sequence**: Select Batch -> Select Date -> Table renders roster -> User clicks "Mark All Present" or clicks individual "P" / "A" / "L" buttons.
- **Backend Flow**: Invokes `bulkMarkPresentAction` or `upsertAttendanceAction` -> `POST /api/v1/attendance/upsert` -> Upserts into `attendances` table with `marked_by` audit attribute -> Table optimistic state confirms update.
- **Status**: **VERIFIED WORKING**.

### Workflow 5: Recording a Fee Payment & Generating Receipt
- **Entry Point**: `/fees` -> Click "Record Payment" button.
- **Sequence**: Modal dialog opens -> Select Student -> Enter Amount (`2500`) -> Select Date -> Select Payment Method (`BKASH`) -> Click "Record Payment".
- **Backend Flow**: `recordPaymentAction` -> `POST /api/v1/fees/` -> Inserts row into `fees` with `status='PAID'` and synthetic transaction ID -> Modal closes -> Table displays transaction with generated receipt number.
- **Status**: **VERIFIED WORKING** (Payment recording is real; payment gateway transaction is simulated).

### Workflow 6: Operational Expense Logging
- **Entry Point**: `/expenses`
- **Sequence**: Fill Title ("Premises Electricity Bill"), Category ("Rent & Utilities"), Amount (`4200`), Notes -> Click "Record Expense" -> Appended to expense list and added to monthly total.
- **Status**: **VERIFIED WORKING**.

### Workflow 7: Exam Marks Entry & Report Card Generation
- **Entry Point**: `/results`
- **Sequence**: Select Exam ("First Term 2024"), Batch ("Class 10 - Higher Math"), Subject ("Mathematics") -> Enter marks for each student (e.g. `88`, `95`) -> Click "Save Marks" -> Notification confirms successful save -> Click student name or navigate to `/results/report-card/<studentId>/<examId>` -> Academic transcript renders with letter grade and GPA.
- **Status**: **VERIFIED WORKING**.

### Workflow 8: Publishing an Institute Announcement
- **Entry Point**: `/notices`
- **Sequence**: Enter Title ("HSC Model Test Schedule Published"), Category ("EXAM"), select Target ("EVERYONE"), enter message content -> Click "Publish Notice" -> Appended to notice feed -> Immediately visible on `/student/notices` and `/teacher/notices`.
- **Status**: **VERIFIED WORKING**.

### Workflow 9: Student Portal Access & Self-Inspection
- **Entry Point**: `/login` (enter student credentials `student1@eduflow.bd` / `password123`).
- **Sequence**: Redirected to `/student` -> Inspects attendance donut, latest exam grade, fee balance -> Navigates to `/student/attendance` for monthly calendar -> Navigates to `/student/fees` for paid receipt history.
- **Status**: **VERIFIED WORKING**.

---

## 21. Feature Implementation Status Matrix

| Module | Feature / Sub-Feature | Implementation Status | Supporting Evidence / Source Reference |
|---|---|:---:|---|
| **Auth** | Password Login & JWT Cookie | **VERIFIED WORKING** | `backend/app/api/auth.py`, `frontend/src/lib/auth/auth.ts` |
| **Auth** | Rate Limiting (5 Attempts) | **VERIFIED WORKING** | In-memory store in `auth.py` and `auth.ts`; returns 429 |
| **Auth** | Self-Serve Tenant Registration | **MOCKED / SIMULATED** | `/register` logs directly into demo owner; no API |
| **Auth** | Password Reset via Email | **NOT FOUND** | Button triggers `alert()` directing to contact support |
| **Dashboard** | KPI Metric Cards (Students, Revenue)| **VERIFIED WORKING** | `backend/app/api/core.py:get_dashboard_kpis()` |
| **Dashboard** | Attendance Donut Chart | **PARTIALLY IMPLEMENTED**| Uses hardcoded fallback (94%) if no logs exist today |
| **Dashboard** | Fee Reminders via SMS | **UI ONLY** | Uses `href="sms:<phone>"`; no SMS gateway integration |
| **Students** | Student Directory & Search Filter | **VERIFIED WORKING** | `StudentTableClient.tsx`, `api/v1/students/` |
| **Students** | Add / Edit Student Drawer Form | **VERIFIED WORKING** | `StudentFormSidePanel.tsx`, `actions/students.ts` |
| **Students** | Student Photo Upload | **PARTIALLY IMPLEMENTED**| Saves to local disk `public/uploads/`; ephemeral on cloud |
| **Students** | Student Archive (Soft Delete) | **VERIFIED WORKING** | Sets `status='SUSPENDED'`; preserves historical records |
| **Batches** | Create Batch with Subject & Fee | **VERIFIED WORKING** | `batches/page.tsx`, `api/v1/batches/` |
| **Batches** | Student Batch Enrollment | **VERIFIED WORKING** | `AssignStudentClient.tsx`, `api/v1/batches/assign` |
| **Teachers** | Teacher Directory & Profile | **VERIFIED WORKING** | `api/v1/teachers/`, `api/v1/teachers/me` |
| **Teachers** | Create / Edit / Delete Teacher | **NOT FOUND** | No UI form and no `POST /teachers` backend endpoint |
| **Attendance** | Single Student Attendance Toggle | **VERIFIED WORKING** | `AttendanceMarkingClient.tsx`, `api/v1/attendance/upsert` |
| **Attendance** | Bulk Mark All Present | **VERIFIED WORKING** | `bulkMarkPresentAction()`, `api/v1/attendance/bulk-present`|
| **Attendance** | Teacher Batch Scoping Enforcement | **VERIFIED WORKING** | Verified via test `test_upsert_attendance_unauthorized_teacher`|
| **Fees** | Manual Fee Payment Record | **VERIFIED WORKING** | `RecordPaymentModal.tsx`, `api/v1/fees/` |
| **Fees** | Receipt Number Generation | **VERIFIED WORKING** | Auto-generates format `RCPT-XXXXXX` |
| **Fees** | Online Payment Gateway (bKash/SSL) | **MOCKED / SIMULATED** | `process_payment()` generates mock ID `cash_tx_<timestamp>` |
| **Expenses** | Expense Tracking & Categorization | **VERIFIED WORKING** | `expenses/page.tsx`, `api/v1/expenses/` |
| **Results** | Exam Marks Entry Table | **VERIFIED WORKING** | `ResultsEntryClient.tsx`, `api/v1/results/save` |
| **Results** | Automated BD Grade Conversion | **VERIFIED WORKING** | `api/v1/results.py:162-168` (A+, A, A-, B, C, D, F) |
| **Results** | Printable Report Card View | **VERIFIED WORKING** | `/results/report-card/[studentId]/[examId]` |
| **Results** | Online MCQ Test / Question Bank | **NOT FOUND** | No question bank or examination test engine exists |
| **Notices** | Institute Announcements | **VERIFIED WORKING** | Stored in `activity_logs`; rendered on `/notices` |
| **Notices** | Batch-Specific Targeted Notices | **VERIFIED WORKING** | Scoped by `batchId`; verified for teacher postings |
| **Localization**| English & Bengali Language Toggle | **VERIFIED WORKING** | `LanguageToggle.tsx`, `messages/en.json`, `messages/bn.json`|

---

## 22. Bugs, Security Vulnerabilities & Missing Functionality

### 1. Security & Data Protection Findings
- **Ephemeral Photo Storage Risk (High)**: Student admission photos are written to local disk (`frontend/public/uploads/`) via Node's `fs.writeFileSync`. On serverless platforms (e.g. Vercel) or containerized clusters with ephemeral file systems, all uploaded photos will be permanently lost upon instance restart or deployment.
- **In-Memory Rate Limiting (Medium)**: Failed login attempt tracking is stored in Python and JavaScript in-memory dictionaries. In multi-instance production environments (or serverless lambdas), rate limiting will not be synchronized across instances, allowing distributed brute-force attempts.
- **Notice Model Architecture Inconsistency (Low)**: Storing notices as JSON-encoded string payloads inside `activity_logs` rather than in a dedicated `notices` table prevents structured database indexing, foreign key cascade cleanup, and search optimization.

### 2. Functional Gaps
- **Missing Teacher Management CRUD**: The application lacks an interface or backend endpoint for an institute owner to add a new teacher, update their subject, or deprovision their faculty account.
- **Missing Student Self-Registration**: Students cannot create their own accounts; user accounts must be linked directly by an administrator or seeded.
- **Missing Payment Gateway Integration**: There is no live integration with SSLCommerz, bKash Merchant API, or Nagad, preventing self-serve tuition payments.
- **Missing Automated SMS Gateway**: Reminders rely on client-side `sms:<number>` protocol links rather than a server-side SMS gateway aggregator (e.g., Greenweb, BulkSMS BD).

---

## 23. Performance, Accessibility & Maintainability Concerns

- **Server-Side Render Hydration Lag**: When pages are first compiled in Turbopack development mode, form buttons clicked prior to full React hydration submit natively as browser GET requests, causing page reloads.
- **Table Mobile Horizontal Scrolling**: Data tables on `/students`, `/fees`, and `/attendance` rely on `overflow-x-auto`. On viewports below 400px width, horizontal scrolling can be difficult to discover without explicit scrollbar styling or responsive card collapse.
- **Raw Image Optimization**: While active branding assets use `next/image`, user-uploaded student photos rendered via dynamic URLs bypass Next.js image optimization in some components.
- **Database Connection Pre-warming**: Cold starts on serverless architectures can cause a 1–2 second delay on initial database query. A pre-warm hook was added to `app/main.py` and `BackendWarmup.tsx` on the landing page to alleviate this.

---

## 24. Known Limitations & Unresolved Questions

1. **Multi-Branch Operations**: EduFlow currently models an Institute as a single physical entity. It does not possess a concept of multiple branches (e.g., Farmgate Branch, Mirpur Branch, Uttara Branch) under a single master organization.
2. **Tuition Fee Structures**: Tuition fees are modeled as a flat monthly rate per batch. Complex tuition models (e.g., admission fees, lab fees, discount waivers, scholarship quotas) cannot be modeled without database schema additions.
3. **Parent Portal Accounts**: The database enum includes `PARENT`, but there is no dedicated parent dashboard interface; guardians currently rely on student credentials.

---

## 25. Prioritized Engineering & Product Roadmap

```
+---------------------------------------------------------------------------------+
|                       RECOMMENDED IMPLEMENTATION ROADMAP                        |
+---------------------------------------------------------------------------------+
| PHASE 1: ENTERPRISE REDESIGN (NEXT STEP)                                        |
| - Transition visual presentation from website cards to a modern ERP layout.     |
| - Implement compact 48px header, high-density data tables, and modal workflows. |
| - Standardize UI across Owner, Teacher, and Student portals.                    |
+---------------------------------------------------------------------------------+
| PHASE 2: CRITICAL INFRASTRUCTURE HARDENING                                     |
| - Migrate photo storage from local disk to S3-compatible cloud object storage.  |
| - Replace in-memory rate limiting with Redis / Upstash.                         |
| - Extract notices into a dedicated relational database table (`notices`).       |
+---------------------------------------------------------------------------------+
| PHASE 3: BANGLADESH FINANCIAL & TELECOM INTEGRATIONS                            |
| - Integrate SSLCommerz / bKash Checkout for automated tuition collection.       |
| - Integrate local SMS aggregator API (Greenweb / BulkSMS BD) for notifications.  |
| - Implement automated fee receipt PDF generation and WhatsApp share links.      |
+---------------------------------------------------------------------------------+
| PHASE 4: ACADEMIC EXPANSION                                                     |
| - Implement full Teacher CRUD management interface for Institute Owners.        |
| - Build an online examination engine with MCQ question bank and auto-grading.   |
| - Introduce multi-branch organization support for multi-campus coaching chains.  |
+---------------------------------------------------------------------------------+
```

---

## 26. Key Source Files & Navigation Guide for AI Engineers

For an AI engineer or developer exploring this codebase, the following files represent the critical implementation cores:

| Subsystem | Primary Implementation Files | Key Responsibilities |
|---|---|---|
| **Routing & Auth** | `frontend/src/middleware.ts`<br>`frontend/src/lib/auth/auth.ts`<br>`backend/app/core/security.py` | Edge role routing, NextAuth session bridge, JWT verification, and account lockout rate limiter. |
| **API Client** | `frontend/src/lib/api.ts` | Centralized `fetchApi()` helper injecting Bearer token headers into all backend requests. |
| **Database Schema**| `backend/app/models/models.py` | Complete SQLAlchemy ORM definitions for all 11 domain entities. |
| **Backend API** | `backend/app/api/routers.py`<br>`backend/app/api/students.py`<br>`backend/app/api/fees.py`<br>`backend/app/api/attendance.py` | Router registrations, Pydantic validation, tenant scoping, and business logic execution. |
| **Server Actions** | `frontend/src/actions/students.ts`<br>`frontend/src/actions/fees.ts`<br>`frontend/src/actions/attendance.ts` | Next.js Server Actions handling form inputs, file uploads, and cache revalidations. |
| **Owner UI** | `frontend/src/app/(app)/dashboard/page.tsx`<br>`frontend/src/components/students/StudentTableClient.tsx`<br>`frontend/src/components/fees/FeesTableClient.tsx` | Owner dashboard metrics, student directory, fee ledger, and modal dialog controllers. |
| **Teacher UI** | `frontend/src/app/(app)/teacher/page.tsx`<br>`frontend/src/app/(app)/teacher/batches/page.tsx` | Teacher cohort directory, timetable display, and assigned batch details. |
| **Student UI** | `frontend/src/app/(app)/student/page.tsx`<br>`frontend/src/app/(app)/student/attendance/page.tsx`<br>`frontend/src/app/(app)/student/results/page.tsx` | Student attendance calendar, fee receipts, GPA summaries, and timetable views. |

---

## 27. Documentation Scope, Test Commands & Audit Limitations

### Audit Execution Commands
During this audit, the following commands were executed and verified against live services:
- **Database Cluster Startup**: `/opt/homebrew/bin/pg_ctl -D /opt/homebrew/var/postgresql@16 start`
- **Backend Service Startup**: `cd backend && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Frontend Service Startup**: `cd frontend && npm run dev` (Port 3000)
- **Integration Test Execution**: `cd backend && PYTHONPATH=. ./venv/bin/pytest` (17 tests, 100% pass)
- **Browser Automation Suite**: `node others/scripts/capture_all_dossier_screenshots.mjs` (41 screenshots captured)

### Audit Limitations
- **Payment Verification**: Because no live SSLCommerz or bKash merchant API credentials are configured in the repository, payment execution was verified against the mock handler (`process_payment()`).
- **Production Neon Migrations**: Neon production database migrations were not executed, preserving the production database state and running all audit verifications against local development PostgreSQL.
- **Ephemeral Uploads**: Local file uploads were tested against `public/uploads/`; cloud S3 upload reliability remains unverified.

---
*End of EduFlow Project Dossier.*
