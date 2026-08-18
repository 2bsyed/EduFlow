import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";

import { StudentSidebar } from "@/components/layout/StudentSidebar";

export default async function StudentDashboardPage() {
  const t = await getTranslations("Dashboard");
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  const userId = session?.user?.id;

  if (!instituteId || !userId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Session missing.
      </div>
    );
  }

  // Fetch Student record strictly linked to logged-in userId and instituteId
  const student = await prisma.student.findFirst({
    where: { userId, instituteId },
    include: {
      studentBatches: {
        include: {
          batch: true,
        },
      },
      attendances: {
        orderBy: { date: "desc" },
      },
      fees: {
        orderBy: { createdAt: "desc" },
      },
      results: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Student profile not found. Please contact your institute administrator.
      </div>
    );
  }

  // Fetch Institute record
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Calculate stats strictly for THIS student:
  // 1. Monthly Attendance
  const now = new Date();
  const currentMonthAttendances = student.attendances.filter((a) => {
    const d = new Date(a.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const presentCount = currentMonthAttendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const totalCount = currentMonthAttendances.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 96;

  // 2. Latest Result
  const latestResult = student.results[0];
  const latestGrade = latestResult?.grade || "A+";
  const latestExamName = latestResult
    ? `${latestResult.examName} (${latestResult.subject})`
    : "Final Term Math";

  // 3. Fee Status
  const unpaidFee = student.fees.find((f) => f.status === "PENDING" || f.status === "OVERDUE");
  const dueAmount = unpaidFee ? Number(unpaidFee.amount) : 0;
  const isFeePaid = dueAmount === 0;

  // 4. Assigned Batches / Classes
  const studentBatches = student.studentBatches;

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <StudentSidebar activeTab="dashboard" instituteName={institute?.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Student Portal</h2>
          </div>
          <div className="flex items-center gap-md shrink-0 flex-nowrap">
            <NotificationBell />
            <LanguageToggle />
            <ProfileDropdown
              userName={student.fullName}
              userEmail={session?.user?.email || "student@eduflow.bd"}
              userRole="STUDENT"
              avatarUrl={student.photoUrl}
              onSignOut={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            />
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full space-y-xl">
          {/* Greeting Section */}
          <section className="mb-md">
            <h1 className="font-h1 text-h1 text-on-surface font-bold">{t("studentTitle")}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
              {t("welcome")}, {student.fullName.split(" ")[0]}.
            </p>
          </section>

          {/* Stat Cards (Bento Grid) */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            {/* 1. Attendance Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-md">
                <div>
                  <p className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
                    {t("myAttendance")}
                  </p>
                  <h2 className="font-h2 text-h2 text-on-surface font-bold">{attendanceRate}%</h2>
                </div>
                <div className="w-12 h-12 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-variant"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    ></path>
                    <path
                      className="text-secondary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${attendanceRate}, 100`}
                      strokeWidth="3"
                    ></path>
                  </svg>
                  <Icon name="check_circle" className="absolute text-secondary text-[20px]" />
                </div>
              </div>
              <p className="font-caption text-caption text-secondary flex items-center gap-xs font-medium">
                <Icon name="trending_up" className="text-[16px]" /> On track for great attendance
              </p>
            </div>

            {/* 2. Latest Result Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="mb-md">
                <p className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
                  Latest Result
                </p>
                <h3 className="font-h4 text-h4 text-on-surface truncate font-semibold">
                  {latestExamName}
                </h3>
              </div>
              <div className="flex items-end justify-between">
                <span className="font-h1 text-h1 text-primary-container leading-none font-bold">
                  {latestGrade}
                </span>
                <span className="bg-primary-container/10 text-primary-container font-label-md text-caption px-sm py-xs rounded-full font-semibold">
                  Outstanding
                </span>
              </div>
            </div>

            {/* 3. Fee Status Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="mb-md">
                <p className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
                  {t("feeStatus")}
                </p>
                {isFeePaid ? (
                  <div className="inline-flex items-center gap-xs bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full font-label-md text-caption font-semibold mt-xs">
                    <Icon name="check" className="text-[16px]" /> Paid
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-xs bg-error-container text-on-error-container px-sm py-xs rounded-full font-label-md text-caption font-semibold mt-xs">
                    <Icon name="warning" className="text-[16px]" /> Due
                  </div>
                )}
              </div>
              <div>
                <p className="font-caption text-caption text-on-surface-variant mb-xs">
                  Current Balance
                </p>
                <h3 className="font-h3 text-h3 text-on-surface font-bold">
                  BDT {dueAmount.toFixed(2)}
                </h3>
              </div>
            </div>

            {/* 4. Enrolled Batches Card */}
            <div className="bg-primary-container text-on-primary rounded-xl shadow-sm p-lg flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative z-10 mb-md">
                <p className="font-label-md text-caption text-on-primary-container uppercase tracking-wider mb-xs">
                  My Batches
                </p>
                <div className="flex items-baseline gap-sm">
                  <span className="font-h1 text-h1 font-bold">{studentBatches.length}</span>
                  <span className="font-body-md text-body-md text-on-primary-container">
                    Batches Enrolled
                  </span>
                </div>
              </div>
              <div className="relative z-10">
                <Link
                  href="/student/attendance"
                  className="w-full bg-white/20 hover:bg-white/30 text-white py-sm px-md rounded-lg font-label-md text-label-md transition-colors backdrop-blur-sm border border-white/10 block text-center font-medium"
                >
                  View Attendance History
                </Link>
              </div>
            </div>
          </section>

          {/* Widgets Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg mt-md">
            {/* Left Column: Schedule & Batches */}
            <div className="lg:col-span-2 space-y-lg">
              {/* Enrolled Batches Schedule */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg">
                <div className="flex justify-between items-center mb-lg border-b border-surface-variant pb-sm">
                  <h3 className="font-h4 text-h4 text-on-surface flex items-center gap-sm font-semibold">
                    <Icon name="schedule" className="text-primary text-[20px]" />
                    <span>My Classes Schedule</span>
                  </h3>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Active Courses
                  </span>
                </div>

                <div className="space-y-md">
                  {studentBatches.length === 0 ? (
                    <p className="text-on-surface-variant text-center py-md font-body-sm">
                      Not enrolled in any batch yet.
                    </p>
                  ) : (
                    studentBatches.map((sb) => (
                      <div
                        key={sb.batchId}
                        className="bg-surface-container-low rounded-lg p-md border border-surface-variant flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-label-md text-label-md font-bold text-on-surface">
                            {sb.batch.name}
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {sb.batch.subject || "General Science"} • {sb.batch.schedule || "Sun, Tue, Thu"}
                          </p>
                        </div>
                        <span className="font-caption text-caption bg-surface-container-highest px-3 py-1 rounded-full text-on-surface-variant font-medium">
                          Enrolled
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Recent Results & Notices */}
            <div className="space-y-lg">
              {/* Recent Results */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg">
                <div className="flex justify-between items-center mb-md border-b border-surface-variant pb-sm">
                  <h3 className="font-h4 text-h4 text-on-surface flex items-center gap-sm font-semibold">
                    <Icon name="grade" className="text-primary text-[20px]" />
                    <span>{t("recentResults")}</span>
                  </h3>
                </div>

                <ul className="space-y-sm">
                  {student.results.slice(0, 3).map((r) => (
                    <li
                      key={r.id}
                      className="bg-surface-container rounded-lg p-md flex items-center justify-between border border-surface-variant"
                    >
                      <div>
                        <p className="font-label-md text-label-md text-on-surface font-bold">
                          {r.examName} ({r.subject})
                        </p>
                        <p className="font-caption text-caption text-on-surface-variant">
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-label-md text-label-md text-primary-container font-bold">
                          {r.marksObtained.toString()}/{r.totalMarks.toString()}
                        </p>
                        <span className="inline-block bg-primary-container/10 text-primary-container text-caption px-2 py-0.5 rounded-full mt-1 font-semibold">
                          ({r.grade || "A"})
                        </span>
                      </div>
                    </li>
                  ))}

                  {student.results.length === 0 && (
                    <p className="text-on-surface-variant text-center py-sm font-body-sm">
                      No results published yet.
                    </p>
                  )}
                </ul>

                <Link
                  href="/student/results"
                  className="w-full mt-md text-primary font-label-md text-label-md hover:underline text-center block font-semibold"
                >
                  View All Results
                </Link>
              </div>

              {/* Notices Widget */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg">
                <div className="flex justify-between items-center mb-md border-b border-surface-variant pb-sm">
                  <h3 className="font-h4 text-h4 text-on-surface flex items-center gap-sm font-semibold">
                    <Icon name="campaign" className="text-tertiary text-[20px]" />
                    <span>Notices</span>
                  </h3>
                </div>
                <ul className="space-y-md">
                  <li className="flex gap-md items-start">
                    <div className="bg-tertiary-fixed text-on-tertiary-fixed p-sm rounded-lg shrink-0">
                      <Icon name="article" className="text-[18px]" />
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface font-medium">
                        Syllabus for Annual Exam released
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant mt-xs">
                        2 days ago
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-md items-start">
                    <div className="bg-error-container text-on-error-container p-sm rounded-lg shrink-0">
                      <Icon name="event_note" className="text-[18px]" />
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface font-medium">
                        Holiday notice: Independence Day
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant mt-xs">
                        5 days ago
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
