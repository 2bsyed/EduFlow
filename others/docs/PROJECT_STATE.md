# EduFlow Project State Inventory

This document provides a factual, point-in-time snapshot of the EduFlow codebase as of the latest audit. It serves as an inventory of the current stack, architecture, deployment state, and known functional gaps.

## 1. Stack & Versions
The core stack uses the following exact versions (resolved from `package.json` and `package-lock.json` / `npm ls`):
*   **Next.js**: 16.2.12
*   **React** (and `react-dom`): 19.2.4
*   **TypeScript**: 5.9.3
*   **Prisma**: 6.19.3 (`@prisma/client` and `prisma`)
*   **Auth**: NextAuth.js (`next-auth`) 5.0.0-beta.32, `@auth/prisma-adapter` 2.11.3
*   **Tailwind CSS**: 4.3.3 (via `@tailwindcss/postcss`)
*   **i18n**: `next-intl` 4.13.4
*   **Forms/Validation**: `react-hook-form` 7.83.0, `zod` 4.4.3
*   **Charting**: `recharts` 3.10.1
*   **Security**: `bcryptjs` 3.0.3

## 2. Routes / Pages Inventory
All routes reside within `src/app/`. They are categorized by the Next.js Route Groups and middleware role-protections.

### Public / Marketing Routes (Unauthenticated)
*   `/`: Marketing landing page showcasing the product.
*   `/demo`: Demo request page for prospective clients.
*   `/login`: Authentication portal (redirects authenticated users based on their role).
*   `/register`: (Defined in filesystem but likely unused/locked down for tenant provisioning).

### Owner Portal (Role: `OWNER`)
*   `/dashboard`: Owner-level overview of metrics, recent activities, and pending reminders.
*   `/students`: Directory to manage, enroll, and archive all students.
*   `/attendance`: Mark and view attendance records across all batches.
*   `/fees`: Record fee payments and view institute-wide transaction history.
*   `/expenses`: Track and log operational institute expenses.
*   `/results`: Record and view exam results across all batches.
*   `/batches`: Manage active batches and assign teachers/students.
*   `/notices`: Publish and manage institute-wide notices.
*   `/settings`: Configure institute profile details (name, logo, timezone).
*   `/settings/language`: Toggle the default locale (English/Bangla).

### Teacher Portal (Role: `TEACHER`)
*   `/teacher`: Teacher dashboard overview and schedule.
*   `/teacher/batches`: View batches specifically assigned to the logged-in teacher.
*   `/teacher/batches/[batchId]`: Detailed view of an assigned batch (students, history).
*   `/teacher/timetable`: Read-only view of the teacher's schedule.
*   `/teacher/profile`: Detailed profile view for the teacher (though navigation now favors the global top-right profile dropdown).
*   *(Teachers also have scoped access to `/attendance` and `/results` for their assigned batches).*

### Student Portal (Role: `STUDENT`)
*   `/student`: Student dashboard overview.
*   `/student/attendance`: View personal attendance record.
*   `/student/fees`: View personal fee payment history and pending dues.
*   `/student/notices`: View notices published by the institute.
*   `/student/results`: View personal exam results.
*   `/student/timetable`: View personal class schedule.
*   `/results/report-card/[studentId]/[examId]`: Read-only, printable detailed report card view.

## 3. Data Layer
The database schema (`prisma/schema.prisma`) represents a multi-tenant SaaS architecture scoped by `Institute`.

### Schema Models
*   **Institute**: The core multi-tenant entity. Every other domain record links back to an Institute.
*   **User**: The authentication identity (holds role: `OWNER`, `TEACHER`, or `STUDENT`, and login credentials).
*   **Account, Session, VerificationToken**: Standard NextAuth.js tables for OAuth and JWT session management.
*   **Teacher**: A faculty member. Belongs to an `Institute` and is linked 1:1 with a `User` identity.
*   **Student**: A student enrolled in an `Institute`. Optionally linked 1:1 with a `User` if they have portal access.
*   **Batch**: A grouping of students (class/section), optionally assigned to a `Teacher`.
*   **StudentBatch**: A many-to-many join table linking `Student` and `Batch`.
*   **Attendance**: A daily record marking a `Student`'s presence in a `Batch`.
*   **Fee**: A financial transaction record for a `Student`'s payment.
*   **Result**: An exam result/grade for a `Student` in a specific `Batch` and subject.
*   **Expense**: Operational cost records incurred by the `Institute`.
*   **ActivityLog**: An audit trail of actions taken by users within an `Institute`.

### Database Status
*   **Current Connection**: The application is currently connected to a local development PostgreSQL instance via `.env`: `postgresql://syed@localhost:5432/eduflow?sslmode=disable`.
*   **Production State**: Production Neon database migrations have **not** been run yet, as the app is not fully deployed.
*   **Data Population**: The local database contains mock/test data across almost all operational tables (e.g., Users: 18, Students: 15, Fees: 15, Attendances: 10). The `ActivityLog` is currently empty (`0` records).

## 4. Server Actions / API Surface
Server Actions are located in `src/app/actions/`. **All actions include strict `instituteId` authorization checks**, ensuring mutations are scoped to the user's tenant.

*   `attendance.ts`
    *   `upsertAttendanceAction`: Marks attendance for a single student.
    *   `bulkMarkPresentAction`: Marks all unrecorded students in a batch as present.
*   `batches.ts`
    *   `createBatchAction`: Creates a new batch.
    *   `assignStudentToBatchAction`: Links a student to a batch.
*   `dashboard.ts`
    *   `sendFeeReminderAction`: Logs an activity record indicating a fee reminder was sent.
*   `expenses.ts`
    *   `createExpenseAction`: Records an institute operational expense.
*   `fees.ts`
    *   `recordPaymentAction`: Processes and records a student fee payment.
*   `notices.ts`
    *   `createNoticeAction`: Publishes a new institute notice.
*   `results.ts`
    *   `saveResultsAction`: Records exam marks for a batch of students.
*   `settings.ts`
    *   `updateInstituteProfile`: Updates institute metadata (name, timezone).
    *   `updateInstituteLanguage`: Sets the default locale.
*   `students.ts`
    *   `createOrUpdateStudentAction`: Enrolls a new student or updates an existing one (includes file upload for photos).
    *   `deleteStudentAction`: Soft-deletes (archives/suspends) a student.

## 5. Auth & Session Handling
*   **Library**: NextAuth.js (v5 Beta).
*   **Session Storage**: `JWT` strategy (cookies containing signed JSON Web Tokens).
*   **Role-Based Redirects**: Handled centrally by Next.js Middleware (`src/middleware.ts`). It inspects `req.auth?.user?.role` and redirects users attempting to access unauthorized route groups to their respective portal home (`/dashboard`, `/teacher`, or `/student`).
*   **Security Mechanisms**:
    *   `AUTH_SECRET`: Hard-enforced in `src/lib/auth/auth.ts`; the app throws an error and crashes on startup if missing.
    *   **Rate Limiting**: An in-memory tracking map (`failedAttemptsStore`) in `auth.ts` limits brute-force attacks. 5 failed login attempts result in a 15-minute lockout for that email address.

## 6. i18n / Localization State
*   **Library**: `next-intl` (v4.13.4).
*   **Coverage Status**: The core localization matrix is functional and implemented across major transactional tables (`StudentTableClient`, `AttendanceMarkingClient`, `FeesTableClient`).
*   **Gaps**: Exactly **39 hardcoded English fragments** remain in secondary components (e.g., `InstituteProfileClient`, `LanguageSettingsClient`, `ResultsEntryClient`, `PendingReminderList`, `RecordPaymentModal`). This number has not changed since the last deployment audit on August 17.

## 7. Known Stubbed/Incomplete Functionality
*   **Payment Flow (`processPayment()`)**: Clicking "Record Payment" currently invokes a stub function in `fees.ts`. It instantly generates a mock transaction ID (`cash_tx_12345`) and records the status as `"PAID"` in the database. It is **not** wired to SSLCommerz, Moneybag, or any real payment gateway.
*   **SMS Reminders**: Clicking the "SMS Guardian" or "Send Reminder" button simply generates a native `href="sms:<number>"` link. This opens the user's local device messaging app. It is **not** connected to an external SMS API like Twilio.

## 8. Deployment State
*   **Current Status**: The application is **not** currently live. Based on the `FINAL_DEPLOY_AUDIT.md`, deployment was delayed due to unresolved blockers.
*   **Hosting**: Intended for Vercel, but no `.vercel` project configuration exists in the repository yet.
*   **Domain**: `metadataBase` in `layout.tsx` is configured for `https://eduflow.bd`, but a `curl` test confirms the domain is unreachable.
*   **Database**: Production migrations for the intended Neon database have not been executed.
*   **Vercel Environment Variables Required**: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`.
*   **Crucial Configuration Quirk**: The Next.js application lives inside the `/eduflow` subdirectory, not the Git repository root. **Any future Vercel deployment must have the "Root Directory" setting explicitly set to `eduflow`**, otherwise the build will fail.

## 9. Design System State
*   **Drift**: The original raw HTML/Tailwind templates generated by Stitch are preserved in `design/stitch_eduflow_design_system_foundation/`. While the application utilizes the exact same foundational `tailwind.config.ts`, natural drift has occurred as static HTML was converted into dynamic React components.
*   **Assets**: Active branding assets, including `logo.jpg`, `hero.png`, and testimonial images, are securely located in `eduflow/public/images/`. Some components currently use raw `<img>` tags instead of `next/image` to render these, which breaks Next.js optimization.

## 10. Test/QA Coverage
*   **Automated Tests**: There is no formal test runner (e.g., Jest or Playwright `test` command) configured in `package.json`. Instead, there are over 20 standalone Playwright `.mjs` scripts (e.g., `test_bug004.mjs`, `test_fee_submit.mjs`) scattered in the root directory used for manual, agent-driven UI verification.
*   **Open Issues (from last audit)**:
    1.  **BUG-004 (Data Leak)**: Teachers can select and view results for *any* batch in the institute, not just their assigned batches.
    2.  **BUG-005 (Performance)**: Prevalent use of raw `<img>` tags instead of `next/image`.
    3.  **BUG-006 (Localization)**: The 39 hardcoded English strings mentioned above.
    4.  **BUG-007 (UX)**: Tables lack true mobile responsiveness (they rely on horizontal scrolling via `overflow-x-auto`).
