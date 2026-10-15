import { fetchApi } from "@/lib/api";
import React, { Suspense } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth, signOut } from "@/lib/auth/auth";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

async function TeacherDashboardContent({ instituteId, userName }: { instituteId: string; userName: string }) {
  const t = await getTranslations("Dashboard");

  // Fetch Teacher record and Batches in parallel
  const [teacher, batchesRaw] = await Promise.all([
    fetchApi("/api/v1/teachers/me").catch(() => null),
    fetchApi("/api/v1/batches/").catch(() => []),
  ]);

  const batches: any[] = batchesRaw || [];
  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate attendance status for today's classes
  const classesWithStatus = batches.map((b: { id: string; name: string; attendances: { date: string }[]; studentBatches: unknown[] }) => {
    const todayAttendances = (b.attendances || []).filter((att: { date: string }) => {
      if (!att.date) return false;
      try {
        return new Date(att.date).toISOString().split("T")[0] === todayStr;
      } catch {
        return false;
      }
    });
    const hasAttendanceToday = todayAttendances.length > 0;
    return {
      batch: b,
      studentCount: (b.studentBatches || []).length,
      hasAttendanceToday,
    };
  });

  return (
    <div className="space-y-xl">
      {/* Greeting Section */}
      <section className="mb-lg">
        <div>
          <h2 className="font-h2 text-h2 font-bold text-on-surface mb-xs">{t("teacherTitle")}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {t("welcome")}, {userName}.
          </p>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          You are assigned to{" "}
          <span className="text-primary font-semibold">{batches.length} active batches</span>.
        </p>
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
        {/* Main Column (Classes & Batches) */}
        <div className="xl:col-span-2 space-y-xl">
          {/* Today's Classes */}
          <section>
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-h4 text-h4 font-semibold text-on-surface">
                {t("myScheduleToday")}
              </h2>
              <Link
                href="/teacher/batches"
                className="text-primary font-label-md text-label-md hover:underline flex items-center gap-xs font-semibold"
              >
                View Batches <Icon name="arrow_forward" className="text-[16px]" />
              </Link>
            </div>

            {classesWithStatus.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center">
                <Icon name="event_busy" className="text-outline text-[40px] mb-sm mx-auto" />
                <p className="text-body-md font-body-md text-on-surface-variant">
                  No classes scheduled for you today.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                {classesWithStatus.map(({ batch, studentCount, hasAttendanceToday }) => (
                  <div
                    key={batch.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-sm">
                      <div>
                        <h3 className="font-h4 text-h4 text-on-surface font-semibold">{batch.name}</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {studentCount} Students Enrolled
                        </p>
                      </div>
                      <span
                        className={`font-label-sm text-label-sm px-sm py-xs rounded-full font-semibold ${
                          hasAttendanceToday
                            ? "bg-primary-container text-on-primary-container"
                            : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {hasAttendanceToday ? "Attendance Taken" : "Pending"}
                      </span>
                    </div>

                    <div className="pt-md border-t border-surface-variant flex justify-between items-center">
                      <Link
                        href={`/attendance?batchId=${batch.id}`}
                        className="text-primary font-label-md text-label-md font-semibold hover:underline flex items-center gap-xs"
                      >
                        <Icon name="check_circle" className="text-[18px]" />
                        {hasAttendanceToday ? "Review Attendance" : "Take Attendance"}
                      </Link>
                      <Link
                        href={`/results?batchId=${batch.id}`}
                        className="text-on-surface-variant hover:text-primary font-label-sm text-label-sm flex items-center gap-xs"
                      >
                        <Icon name="add" className="text-[16px]" />
                        Enter Marks
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions Panel */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface mb-md">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
              <Link
                href="/attendance"
                className="flex flex-col items-center justify-center p-md rounded-lg border border-outline-variant hover:border-primary hover:bg-surface-container-high transition-colors text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-xs group-hover:scale-105 transition-transform">
                  <Icon name="fact_check" className="text-[20px]" />
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary">
                  Mark Attendance
                </span>
                <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                  Today's Roll Call
                </span>
              </Link>

              <Link
                href="/results"
                className="flex flex-col items-center justify-center p-md rounded-lg border border-outline-variant hover:border-primary hover:bg-surface-container-high transition-colors text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center mb-xs group-hover:scale-105 transition-transform">
                  <Icon name="grade" className="text-[20px]" />
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary">
                  Record Marks
                </span>
                <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                  Exam & Test Scores
                </span>
              </Link>

              <Link
                href="/teacher/batches"
                className="flex flex-col items-center justify-center p-md rounded-lg border border-outline-variant hover:border-primary hover:bg-surface-container-high transition-colors text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center mb-xs group-hover:scale-105 transition-transform">
                  <Icon name="groups" className="text-[20px]" />
                </div>
                <span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary">
                  My Batches
                </span>
                <span className="font-caption text-caption text-on-surface-variant mt-0.5">
                  Rosters & Details
                </span>
              </Link>
            </div>
          </section>
        </div>

        {/* Side Column: Timetable Preview & Notice Board */}
        <div className="space-y-xl">
          {/* Timetable Today */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
            <div className="flex justify-between items-center">
              <h2 className="font-h4 text-h4 font-semibold text-on-surface">Weekly Timetable</h2>
              <Link href="/teacher/timetable" className="text-primary font-label-md text-label-md hover:underline font-semibold">
                Full Routine
              </Link>
            </div>

            <div className="space-y-sm">
              {batches.slice(0, 3).map((batch) => (
                <div
                  key={batch.id}
                  className="p-sm bg-surface-container-low rounded-lg border border-outline-variant/60 flex items-center justify-between"
                >
                  <div>
                    <p className="font-label-md text-label-md font-semibold text-on-surface">{batch.name}</p>
                    <p className="font-caption text-caption text-on-surface-variant">
                      {batch.subject || "General"}
                    </p>
                  </div>
                  <span className="font-caption text-caption bg-surface-container text-on-surface px-sm py-xs rounded">
                    {batch.schedule || "Regular"}
                  </span>
                </div>
              ))}
              {batches.length === 0 && (
                <p className="text-caption font-caption text-on-surface-variant">No routine classes found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TeacherDashboardPage() {
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

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <TeacherSidebar activeTab="dashboard" instituteName={"EduFlow"} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Teacher Portal</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container cursor-pointer">
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <LanguageToggle />
            <div className="flex items-center gap-sm ml-sm">
              <ProfileDropdown
                userName={session?.user?.name || "Teacher"}
                userEmail={session?.user?.email || "teacher@eduflow.bd"}
                userRole={session?.user?.role || "TEACHER"}
                avatarUrl={session?.user?.image}
                onSignOut={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              />
            </div>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full">
          <Suspense fallback={<ContentSkeleton />}>
            <TeacherDashboardContent instituteId={instituteId} userName={session?.user?.name || "Teacher"} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

