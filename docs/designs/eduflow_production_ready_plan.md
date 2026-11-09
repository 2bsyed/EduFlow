# EduFlow: Master Production-Ready Specification & Execution Plan
**Architecture Framework:** Google Elephant-Goldfish Model (EGM)  
**Target Product:** EduFlow Multi-Tenant Coaching-Centre SaaS (Bangladesh)  
**Source Baseline:** `EduFlow_ChatGPT_Work_Handoff.md`, `EduFlow_Phased_Product_Design_Engineering_Roadmap.md`, `EduFlow_Stitch_Design_Prompts.md`, `requirements-audit.md`, `design-qa.md`.  
**Goldfish Review Status:** Approved with 5 Critical Hardening Directives Incorporated.

---

## 1. Executive Summary & Problem Definition

EduFlow provides a complete operating system for Bangladeshi coaching centres, combining two clearly separated experiences:
1. **The Public Institute Website:** Premium, photographic, cinematic campus hero with glass-blur translucent navigation, institute branding, courses/teachers/results showcase, and a working **Admission Inquiry Form** that feeds leads directly into the institute's ERP.
2. **The Signed-in EduFlow ERP:** Flat, structured, familiar business application inspired by Microsoft 365, Outlook, and Fluent UI. Solid surfaces, thin dividers, restrained `#0F6CBD` blue actions, strict table grid alignment, and Inter typography (`400` body, `500` labels, `600` headlines).

### Identified Deficiencies in Current Codebase (Audited)
1. **Fake/Hardcoded Fallbacks in Dashboard (`page.tsx`):**
   - Fallbacks to fake numbers (1,284 students, 42 batches, ৳ 5,42,000 revenue) when institute data is fresh or 0.
   - Hardcoded arrays for `todaysClasses`, `recentStudents`, and `pendingFees` instead of rendering live institute records.
   - Hardcoded date button "Today, 10 Jan 2025".
2. **Lack of Structured Schedule for Batches & Asia/Dhaka Timezone Desync:**
   - Free-text batch schedules prevented reliable filtering for "Today's Classes".
   - Server running UTC desynced from Bangladesh standard time (Asia/Dhaka, UTC+6).
3. **Incomplete Teacher Management & Security Gaps:**
   - Teachers could only be created; editing teacher profile, deactivating/activating accounts, and resetting passwords were not implemented.
   - Missing `is_active` enforcement in `auth.py`.
4. **Missing Public Institute Website & Admission Lead Inbox:**
   - Only a generic SaaS marketing page existed. No dedicated public institute showcase with glass-blur navigation and interactive admission inquiry capture.
5. **Report & Analytics Gaps:**
   - Reports page lacked attendance period summaries (per-batch / date range attendance rates) and export capabilities.
6. **Header Quick Search:**
   - Header search was non-functional; needs live multi-module search with `min_length=2` and institute scoping.
7. **Notice Categories & Read State:**
   - Notice viewing lacked quick categorization and clear status tracking.

---

## 2. Hardened Architecture & Design Directives (Incorporating EGM Goldfish Review)

### 2.1 Backend Architecture (FastAPI + SQLAlchemy + PostgreSQL)
1. **Database Schema & Migrations (`app/models/models.py`):**
   - **User Model Addition:**
     - `is_active = Column(Boolean, default=True, nullable=False)`
     - Enforced in `app/api/auth.py`: login rejects inactive users with `403 Account is deactivated`.
   - **Institute Model Additions:**
     - `hero_headline = Column(String)`
     - `hero_subhead = Column(String)`
     - `hero_image_url = Column(String)`
     - `about_text = Column(Text)`
     - `contact_phone = Column(String)`
     - `contact_email = Column(String)`
     - `features_json = Column(Text)`
     - `is_published = Column(Boolean, default=True)`
   - **AdmissionInquiry Model:**
     - Table: `admission_inquiries`
     - Fields: `id`, `institute_id` (FK), `name`, `phone`, `email`, `course_interest`, `notes`, `status` (`NEW`, `CONTACTED`, `ENROLLED`, `REJECTED`), `created_at`, `updated_at`.
   - **Safe Migration Hook:**
     - On backend startup (`app/db/database.py` or lifespan), run `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for zero-downtime schema evolution.

2. **Admission Inquiries & Website Configuration API (`app/api/admissions.py`):**
   - `POST /api/v1/institutes/{institute_id}/inquiries` (Public):
     - Validates Bangladesh mobile numbers: `^(?:\+?880|0)?1[3-9]\d{8}$`.
     - Honeypot check: `website_url_hp` must be empty.
     - Rate-limiting & duplicate check (prevents spamming).
   - `GET /api/v1/inquiries` (Owner only, institute-scoped, optional status filter).
   - `PATCH /api/v1/inquiries/{inquiry_id}/status` (Owner only, strictly filtered by `Inquiry.institute_id == current_user.institute_id`).
   - `GET /api/v1/institutes/public/{subdomain_or_id}` (Public details for institute site).
   - `PUT /api/v1/settings/website` (Owner only, saves website details).

3. **Teacher Management API (`app/api/teachers.py`):**
   - `PUT /api/v1/teachers/{teacher_id}`: Edit name, phone, subject.
   - `POST /api/v1/teachers/{teacher_id}/status`: Toggle `User.is_active` (Active/Inactive).
   - `POST /api/v1/teachers/{teacher_id}/reset-password`: Set or generate temporary password.
   - All endpoints verify `Teacher.institute_id == current_user.institute_id` and require `Role.OWNER`.

4. **Structured Schedule & Today's Classes Engine (`app/api/core.py`):**
   - Timezone: `ZoneInfo("Asia/Dhaka")` (UTC+6).
   - Regex day matching using word boundaries (`\b(SUN|MON|TUE|WED|THU|FRI|SAT)\b`).
   - Matches current day in Dhaka time against batch schedules.
   - Returns live `todaysClasses` list, or an honest empty list if no classes are scheduled today.
   - Replaces all hardcoded KPI mock fallbacks (`1284`, `42`, `৳ 5,42,000`) with honest zero/empty states.

5. **Attendance Period Reports API (`app/api/core.py` or `reports`):**
   - `GET /api/v1/core/reports/attendance`:
     - Params: `batch_id` (optional), `start_date`, `end_date`.
     - Returns total sessions held, student attendance counts, student percentages, and overall batch percentage.
     - CSV export format.

6. **Cross-Module Header Quick Search (`app/api/core.py`):**
   - `GET /api/v1/core/search?q={query}`:
     - `min_length=2`.
     - Restricted to `OWNER` and `TEACHER` roles.
     - Searches Students, Teachers, Batches scoped by `current_user.institute_id`.
     - Capped at 5 results per category.

### 2.2 Frontend Architecture (Next.js 16 + React 19 + Tailwind CSS)
1. **Public Institute Website (`/showcase` & `/institute/[subdomain]`):**
   - Cinematic photography hero with glass-blur translucent navigation bar (`backdrop-blur-md bg-white/70`).
   - Links: Home, About, Courses, Teachers, Results, Gallery, Contact, Login button at top-right.
   - Showcase grids for Courses, Faculty, and Results.
   - **Interactive Admission Inquiry Form** with immediate submission to `POST /api/v1/institutes/{id}/inquiries` and feedback toast.
   - Modern institute footer.

2. **Owner Admissions & Website Management ERP (`/admissions`):**
   - Added to `frontend/src/proxy.ts` (with strict `OWNER` role restriction).
   - Added to `OwnerSidebar.tsx` under "Institute Website".
   - Tab 1: Leads Inbox (table with status badges: `NEW`, `CONTACTED`, `ENROLLED`, `REJECTED`, quick status change actions).
   - Tab 2: Website Settings (Headline, subhead, about text, phone, email, hero image URL, publish toggle).

3. **Dashboard (`frontend/src/app/(app)/dashboard/page.tsx`):**
   - 100% honest data: no fake 1,284 fallbacks; truthful zero states.
   - Live `todaysClasses` derived from batch schedules matching today's Dhaka weekday.
   - Live `recentStudents` and `pendingFees` populated from API.
   - Dynamic today's date pill (e.g. "Monday, 9 Nov 2026").
   - Functional Quick Search connected to `/api/v1/core/search`.

4. **Teacher Management UI (`frontend/src/app/(app)/teachers/page.tsx`):**
   - Teacher table with Status pill (Active/Inactive), Edit modal, Reset Password modal, and Status toggle button.

5. **Reports UI (`frontend/src/app/(app)/reports/page.tsx`):**
   - Added Attendance Period Report tab with batch filter, date range picker, summary KPIs, student attendance table, and CSV download.

---

## 3. Product Manager Orchestration & SQA Verification Protocol

As requested by the user:
- **Project Manager (`product_manager`):**
  - Runs the orchestra.
  - Formulates the work packages.
  - Commands `debugger_agent` to implement the modules.
  - After each implementation, commands `sqa_tester` to test.
  - Evaluates test reports against `EduFlow_ChatGPT_Work_Handoff.md` and acceptance criteria.
  - If defects are found, routes them to `debugger_agent` to fix.
  - Gives final confirmation when tasks are complete.
- **SQA Tester (`sqa_tester`):**
  - Executes automated backend test suites (pytest), frontend build (`npm run build`), lint, security audits, and UI checks.
  - Reports findings directly to the Project Manager.
- **Debugger Agent (`debugger_agent`):**
  - Receives bug reports and implementation tasks from the Project Manager.
  - Writes and refactors code, models, and endpoints.
  - Reports completed fixes back with evidence.

---

## 4. Execution Roadmap (Phases)

- **Phase 1: Architecture Review & Master Plan Finalization** *(COMPLETED)*
- **Phase 2: Backend Core Models, Migrations & Security Hardening**
  - `User.is_active` + `auth.py` enforcement
  - `Institute` website fields & `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
  - `AdmissionInquiry` model & `app/api/admissions.py`
  - Teachers CRUD enhancements (edit, reset-password, toggle status)
  - Timezone-aware schedule matcher (`ZoneInfo("Asia/Dhaka")`)
  - Attendance period report endpoint & CSV export
  - Header quick search endpoint
- **Phase 3: Dashboard Honest Data & Structured Today's Classes**
  - Remove all fake fallback numbers (`1284`, `42`, `৳ 5,42,000`)
  - Hook live `todaysClasses`, `recentStudents`, `pendingFeeRecords`, and dynamic date
  - Hook Header search to search API
- **Phase 4: Teacher Lifecycle Management UI**
  - Teacher edit modal, password reset modal, active/inactive toggle
- **Phase 5: Public Institute Website with Glass-Blur Navigation & Admission Form**
  - Modern campus hero, glass-blur navbar, courses, faculty, results, gallery, admission inquiry form
- **Phase 6: Owner Admissions Lead Inbox & Website Editor UI (`/admissions`)**
  - `proxy.ts` routing protection
  - Leads inbox table with status updates
  - Website configuration editor
- **Phase 7: Attendance Period Reports & Polish**
  - Attendance summary report tab, date/batch filters, CSV export
- **Phase 8: Comprehensive SQA Audit, Bug Fixing & PM Final Sign-Off**
  - SQA test suite execution, PM review and sign-off
