import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";

export default async function TeacherDashboardPage() {
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

  // Fetch Teacher record safely
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
    include: { user: true },
  });

  // Fetch Institute record safely
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  const teacherId = teacher?.id || "";

  // Fetch Batches strictly assigned to this teacher
  const batches = teacherId
    ? await prisma.batch.findMany({
        where: { instituteId, teacherId },
        include: {
          studentBatches: {
            include: {
              student: true,
            },
          },
          attendances: true,
        },
        orderBy: { name: "asc" },
      })
    : [];

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculate attendance status for today's classes
  const classesWithStatus = batches.map((b) => {
    const todayAttendances = b.attendances.filter((att) => {
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
      studentCount: b.studentBatches.length,
      hasAttendanceToday,
    };
  });

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      {/* SideNavBar */}
      <aside className="docked left-0 h-full w-64 border-r border-outline-variant shadow-sm flex flex-col py-lg px-md bg-surface-container-lowest hidden md:flex shrink-0">
        <div className="mb-xl px-sm flex items-center gap-sm">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
            <Icon name="school" className="text-[20px]" />
          </div>
          <div>
            <div className="flex items-center">
              <Image src="/images/logo.jpg" alt="EduFlow logo" width={100} height={32} className="object-contain -ml-2" />
            </div>
            <p className="font-caption text-caption text-on-surface-variant">
              {institute?.name || "Teacher Portal"}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-xs overflow-y-auto pr-sm">
          <Link
            href="/teacher"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-primary font-semibold border-r-4 border-primary bg-primary-fixed"
          >
            <Icon name="dashboard" className="text-[20px]" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/teacher/batches"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="groups" className="text-[20px]" />
            <span>My Batches</span>
          </Link>
          <Link
            href="/attendance"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="calendar_today" className="text-[20px]" />
            <span>Attendance</span>
          </Link>
          <Link
            href="/results"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="analytics" className="text-[20px]" />
            <span>Results</span>
          </Link>
          <Link
            href="/teacher/timetable"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="schedule" className="text-[20px]" />
            <span>Timetable</span>
          </Link>
          <Link
            href="/teacher/profile"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors mt-auto"
          >
            <Icon name="person" className="text-[20px]" />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

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
        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full space-y-xl">
          {/* Greeting Section */}
          <section className="mb-lg">
            <div>
              <h2 className="font-h2 text-h2 font-bold text-on-surface mb-xs">{t("teacherTitle")}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {t("welcome")}, {session?.user?.name || "Teacher"}.
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

                <div className="space-y-md">
                  {classesWithStatus.length === 0 ? (
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg text-center text-on-surface-variant">
                      No batches assigned yet.
                    </div>
                  ) : (
                    classesWithStatus.map(({ batch, studentCount, hasAttendanceToday }) => (
                      <div
                        key={batch.id}
                        className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                          <div className="flex-1">
                            <div className="flex items-center gap-sm mb-sm">
                              {!hasAttendanceToday ? (
                                <span className="bg-error-container text-on-error-container font-label-md text-caption px-sm py-xs rounded-full flex items-center gap-xs font-medium">
                                  <Icon name="error" className="text-[14px]" /> Attendance Pending
                                </span>
                              ) : (
                                <span className="bg-secondary-container text-on-secondary-container font-label-md text-caption px-sm py-xs rounded-full flex items-center gap-xs font-medium">
                                  <Icon name="check_circle" className="text-[14px]" /> Marked Today
                                </span>
                              )}
                              <span className="text-on-surface-variant font-caption text-caption flex items-center gap-xs">
                                <Icon name="schedule" className="text-[14px]" />{" "}
                                {batch.schedule || "Sun, Tue, Thu | 09:00 AM"}
                              </span>
                            </div>
                            <h3 className="font-h4 text-h4 font-semibold text-on-surface mb-xs">
                              {batch.name}
                            </h3>
                            <p className="font-body-md text-body-md text-on-surface-variant">
                              {batch.subject || "General Science"} • {studentCount} Students
                            </p>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-sm">
                            <Link
                              href={`/attendance?batchId=${batch.id}`}
                              className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-opacity-90 transition-all font-medium inline-block text-center"
                            >
                              Mark Attendance
                            </Link>
                            <Link
                              href={`/teacher/batches/${batch.id}`}
                              className="text-primary font-label-md text-label-md p-sm rounded-lg hover:bg-surface-container transition-colors border border-transparent font-medium"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* My Batches Summary */}
              <section>
                <div className="flex justify-between items-center mb-md">
                  <h2 className="font-h4 text-h4 font-semibold text-on-surface">
                    My Batches Overview
                  </h2>
                  <Link
                    href="/teacher/batches"
                    className="text-primary font-label-md text-label-md hover:underline font-semibold"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                  {batches.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md shadow-sm"
                    >
                      <h4 className="font-label-md text-label-md font-semibold text-on-surface mb-xs truncate">
                        {b.name}
                      </h4>
                      <div className="flex justify-between items-end mt-sm">
                        <div>
                          <p className="font-caption text-caption text-on-surface-variant">
                            Students
                          </p>
                          <p className="font-body-md text-body-md font-semibold text-on-surface">
                            {b.studentBatches.length}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-caption text-caption text-on-surface-variant">
                            Avg. Attendance
                          </p>
                          <p className="font-body-md text-body-md font-semibold text-secondary">
                            92%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column (Pending Tasks & Widgets) */}
            <div className="space-y-lg">
              {/* Pending Tasks Widget */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
                <div className="bg-surface-container p-md border-b border-outline-variant">
                  <h3 className="font-h4 text-h4 font-semibold text-on-surface flex items-center gap-sm">
                    <Icon name="task_alt" className="text-primary text-[20px]" />
                    <span>{t("actionRequired")}</span>
                  </h3>
                </div>
                <div className="p-md space-y-md">
                  {/* Task 1 */}
                  <div className="flex items-start gap-md">
                    <div className="bg-error-container text-on-error-container p-sm rounded-lg flex-shrink-0">
                      <Icon name="calendar_today" className="text-[18px]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-body-sm text-body-sm text-on-surface mb-xs font-medium">
                        Daily Attendance Marking
                      </p>
                      <Link
                        href="/attendance"
                        className="text-primary font-label-md text-caption hover:underline font-semibold"
                      >
                        Mark Attendance Now
                      </Link>
                    </div>
                  </div>
                  <hr className="border-outline-variant opacity-50" />
                  {/* Task 2 */}
                  <div className="flex items-start gap-md">
                    <div className="bg-secondary-container text-on-secondary-container p-sm rounded-lg flex-shrink-0">
                      <Icon name="analytics" className="text-[18px]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-body-sm text-body-sm text-on-surface mb-xs font-medium">
                        Results Entry
                      </p>
                      <Link
                        href="/results"
                        className="text-primary font-label-md text-caption hover:underline font-semibold"
                      >
                        Enter Exam Marks
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Notices Widget */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm p-md">
                <h3 className="font-h4 text-h4 font-semibold text-on-surface mb-md">
                  Recent Notices
                </h3>
                <ul className="space-y-sm">
                  <li className="flex items-start gap-sm">
                    <Icon
                      name="campaign"
                      className="text-on-surface-variant text-[18px] mt-xs"
                    />
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface font-medium">
                        Staff Meeting at 4 PM
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant">Today</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-sm">
                    <Icon
                      name="description"
                      className="text-on-surface-variant text-[18px] mt-xs"
                    />
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface font-medium">
                        Syllabus revision guidelines updated
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Yesterday
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
