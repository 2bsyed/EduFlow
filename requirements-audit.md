# EduFlow handoff requirements audit

Sources reviewed: `EduFlow_ChatGPT_Work_Handoff.md`, the included handoff ZIP (six planning documents and the project dossier), the dashboard overview image, and the supplied logo image. Requirements in the attachments were treated as product input and reconciled with the user's explicit request to replace the old experience and finish the product; they were not treated as independent instructions.

## Implemented in this pass

- Applied the supplied EduFlow logo across the public landing page, login, registration, owner/teacher/student navigation, and dashboard.
- Rebuilt the owner dashboard around the reference structure: institute summary cards, batch schedule list, attendance summary, recent students, and pending fees. Data comes from institute-scoped records; absent attendance remains empty and no invented comparisons or activity feed are shown.
- Replaced misleading monthly fee totals with paid fee records dated in the current month. Restricted institute-wide KPIs and owner modules to owners.
- Added owner teacher directory and teacher creation with a temporary password; added batch detail data for assigned teachers.
- Added real institute and owner registration with password hashing and duplicate-email handling.
- Added role and institute scoping to student, batch, attendance, fee, expense, result, and notice operations. Attendance cannot be recorded for students outside the selected batch.
- Removed fake payment processing, fake reminder delivery, hardcoded demo login, demo route, sample notices/results/attendance/expenses, fabricated dashboard trends and notifications, fake testimonials/customer logos, false trial/pricing claims, and default payment methods.
- Added student CSV export and removed unimplemented promises from public feature copy. Updated English and Bangla copy.
- Migrated Next.js request interception from deprecated middleware convention to `proxy.ts` and included the teacher route.

## Partial / follow-up required

- The dashboard's “Batches” list displays each batch's free-text schedule. The data model has no structured weekday/time rows, so it cannot reliably select “Today’s Classes.” The reference's day-specific title and real calendar filter remain unimplemented.
- The dashboard search field is visual only; no cross-module search service exists.
- The owner can create teachers, but email invitations, edit, deactivate, and password reset flows are not implemented.
- A basic owner Reports page now summarizes fees and expenses and exports fee/expense CSVs. Student CSV export is also implemented. Attendance period reports and configurable report filters remain outstanding.
- Notices are stored and scoped in-app, but push/email/SMS delivery and a persistent notification center are not implemented. The fake notification bell was removed.
- Expenses can record categories, including a payroll category, but this is not payroll calculation or payment management.
- The current signed-in dashboard was visually opened and checked in the local browser at 1063×679. The supplied overview is 1672×940. The page responds at the available viewport, but exact same-size visual comparison and full-page responsive review remain incomplete.
- Public institute website editor, durable student-file/photo storage, bulk import, and mobile/PWA installation are not present in this build.

## Deferred / explicitly out of MVP scope in the handoff

Do not claim these are available: parent portal, online payment gateway or automatic reconciliation, automated SMS/WhatsApp/email, payroll, inventory, transport, hostel, full LMS/video, online MCQ engine, AI, native apps, real-time chat, complex approvals, and multi-branch support. Manual fee recording and receipts are supported; choosing a payment method records what the institute says it received and does not contact a payment provider.

## Verification

- Frontend production build: passed after the changes.
- Backend Python compile: passed.
- Frontend lint: 0 errors, 120 warnings (mostly existing explicit `any` and effect patterns).
- Backend tests: passed (18 tests) after removing the obsolete reminder-endpoint test and correcting its imports.
- Browser: signed-in owner dashboard opened with existing local session and reviewed. No account or business records were created or changed for visual verification.
