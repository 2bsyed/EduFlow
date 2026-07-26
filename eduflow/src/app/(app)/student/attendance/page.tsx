import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default async function StudentAttendancePage() {
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
      attendances: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!student) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Student profile not found.
      </div>
    );
  }

  // Fetch Institute record
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0-indexed

  const monthName = now.toLocaleString("default", { month: "long" });

  // Filter attendance records for current month
  const currentMonthAttendances = student.attendances.filter((att) => {
    const d = new Date(att.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonthIndex;
  });

  const presentCount = currentMonthAttendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const totalCount = currentMonthAttendances.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 94;

  // Build calendar grid days for current month
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  // Create attendance map for quick lookup by day number
  const attendanceByDay: Record<number, string> = {};
  currentMonthAttendances.forEach((att) => {
    const day = new Date(att.date).getDate();
    attendanceByDay[day] = att.status;
  });

  // Calendar cells
  const calendarCells = [];
  // Empty leading slots from previous month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push({ type: "empty", key: `empty-${i}` });
  }
  // Days 1 to daysInMonth
  for (let d = 1; d <= daysInMonth; d++) {
    const status = attendanceByDay[d] || null; // PRESENT, ABSENT, LATE, or null
    const isToday = d === now.getDate();
    calendarCells.push({ type: "day", day: d, status, isToday, key: `day-${d}` });
  }

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      {/* SideNavBar */}
      <aside className="docked left-0 h-full w-64 border-r border-outline-variant shadow-sm flex flex-col py-lg px-md bg-surface-container-lowest hidden md:flex shrink-0">
        <div className="mb-xl px-sm flex items-center gap-sm">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
            <Icon name="school" className="text-[20px]" />
          </div>
          <div>
            <h1 className="font-h3 text-h3 font-bold text-primary">EduFlow</h1>
            <p className="font-caption text-caption text-on-surface-variant">
              {institute?.name || "Student Portal"}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-xs overflow-y-auto pr-sm">
          <Link
            href="/student"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="dashboard" className="text-[20px]" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/student/attendance"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-primary font-semibold border-r-4 border-primary bg-primary-fixed"
          >
            <Icon name="calendar_today" className="text-[20px]" />
            <span>My Attendance</span>
          </Link>
          <Link
            href="/student/results"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="grade" className="text-[20px]" />
            <span>My Results</span>
          </Link>
          <Link
            href="/student/fees"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="payments" className="text-[20px]" />
            <span>Fee Status</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="schedule" className="text-[20px]" />
            <span>Timetable</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors mt-auto"
          >
            <Icon name="campaign" className="text-[20px]" />
            <span>Notices</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Student Portal</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container cursor-pointer">
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <LanguageToggle />
            <div className="flex items-center gap-sm ml-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md font-bold">
                {student.fullName?.[0] || "S"}
              </div>
              <span className="font-label-md hidden lg:block text-on-surface">
                {student.fullName}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="p-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <Icon name="logout" className="text-[20px]" />
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full space-y-lg">
          {/* Header */}
          <header className="mb-lg">
            <h1 className="font-h1 text-h1 text-on-surface font-bold">My Attendance</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs">
              Track your academic presence and schedule.
            </p>
          </header>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Stat Card */}
            <div className="lg:col-span-1 bg-surface-container-lowest border border-surface-variant rounded-xl p-lg shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-sm mb-md">
                  <Icon name="insights" className="text-primary text-[24px]" />
                  <h2 className="font-h4 text-h4 text-on-surface font-semibold">
                    Monthly Overview
                  </h2>
                </div>
                <div className="mb-sm">
                  <span className="text-5xl font-extrabold text-primary tracking-tight">
                    {attendanceRate}%
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                  attendance this month
                </p>
                <div className="w-full bg-surface-container-high rounded-full h-2.5 mb-md">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
                <p className="font-label-md text-label-md text-on-surface-variant">
                  {presentCount} of {totalCount || 30} classes attended
                </p>
              </div>

              <div className="mt-xl bg-secondary-container text-on-secondary-container px-md py-sm rounded-lg flex items-start gap-sm w-fit border border-secondary-fixed/50">
                <Icon name="sentiment_satisfied" className="text-[20px] mt-0.5" />
                <div>
                  <span className="font-label-md text-label-md font-semibold block">
                    Great job, keep it up!
                  </span>
                  <span className="font-caption text-caption">
                    You're on track for high academic performance.
                  </span>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-surface-variant rounded-xl p-lg shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-lg">
                <h2 className="font-h4 text-h4 text-on-surface font-semibold">
                  {monthName} {currentYear}
                </h2>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-sm text-center flex-grow">
                {/* Day Header Row */}
                <div className="font-label-md text-label-md text-on-surface-variant py-sm font-semibold">
                  Sun
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant py-sm font-semibold">
                  Mon
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant py-sm font-semibold">
                  Tue
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant py-sm font-semibold">
                  Wed
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant py-sm font-semibold">
                  Thu
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant py-sm font-semibold">
                  Fri
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant py-sm font-semibold">
                  Sat
                </div>

                {/* Day Cells */}
                {calendarCells.map((cell) => {
                  if (cell.type === "empty") {
                    return <div key={cell.key} className="p-sm"></div>;
                  }

                  const isPresent = cell.status === "PRESENT";
                  const isAbsent = cell.status === "ABSENT";
                  const isLate = cell.status === "LATE";

                  return (
                    <div
                      key={cell.key}
                      className={`p-sm flex flex-col items-center gap-xs rounded-lg ${
                        cell.isToday ? "bg-surface-container-low border border-primary/30" : ""
                      }`}
                    >
                      <span
                        className={`font-body-sm text-body-sm ${
                          cell.isToday ? "font-bold text-primary" : "text-on-surface"
                        }`}
                      >
                        {cell.day}
                      </span>
                      {isPresent && <span className="w-3 h-3 rounded-full bg-secondary"></span>}
                      {isAbsent && <span className="w-3 h-3 rounded-full bg-error"></span>}
                      {isLate && (
                        <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                      )}
                      {!cell.status && (
                        <span className="w-3 h-3 rounded-full bg-outline-variant/50"></span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-xl pt-lg border-t border-surface-variant flex flex-wrap gap-md justify-center sm:justify-start">
                <div className="flex items-center gap-xs">
                  <span className="w-3 h-3 rounded-full bg-secondary"></span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Present
                  </span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="w-3 h-3 rounded-full bg-error"></span>
                  <span className="font-caption text-caption text-on-surface-variant">Absent</span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                  <span className="font-caption text-caption text-on-surface-variant">Late</span>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    No Class / Unmarked
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
