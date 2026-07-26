import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import {
  AttendanceMarkingClient,
  RosterItem,
  BatchOption,
} from "@/components/attendance/AttendanceMarkingClient";

interface AttendancePageProps {
  searchParams: Promise<{
    batchId?: string;
    date?: string;
  }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!instituteId || !userId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Institute ID missing.
      </div>
    );
  }

  const { batchId: paramBatchId, date: paramDate } = await searchParams;

  // Fetch Institute details
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Fetch Batches for this institute
  const batches = await prisma.batch.findMany({
    where: { instituteId },
    select: { id: true, name: true, teacherId: true },
    orderBy: { name: "asc" },
  });

  const selectedBatchId = paramBatchId || batches[0]?.id || "";
  const todayStr = new Date().toISOString().split("T")[0];
  const selectedDate = paramDate || todayStr;

  // Authorization Check
  let isAuthorized = true;
  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
    });
    const currentBatch = batches.find((b) => b.id === selectedBatchId);
    isAuthorized = !!(teacher && currentBatch && currentBatch.teacherId === teacher.id);
  }

  // Fetch Enrolled Roster for selectedBatchId
  const studentBatches = selectedBatchId
    ? await prisma.studentBatch.findMany({
        where: { instituteId, batchId: selectedBatchId },
        include: { student: true },
        orderBy: { student: { rollNo: "asc" } },
      })
    : [];

  // Fetch Existing Attendance for selectedBatchId & selectedDate
  const parsedDate = new Date(selectedDate);
  parsedDate.setHours(0, 0, 0, 0);

  const existingAttendance = selectedBatchId
    ? await prisma.attendance.findMany({
        where: {
          instituteId,
          batchId: selectedBatchId,
          date: parsedDate,
        },
      })
    : [];

  // Map to RosterItem List
  const attendanceStatusMap = new Map<string, "PRESENT" | "ABSENT" | "LATE">();
  existingAttendance.forEach((att) => {
    attendanceStatusMap.set(att.studentId, att.status as "PRESENT" | "ABSENT" | "LATE");
  });

  const roster: RosterItem[] = studentBatches.map((sb) => ({
    studentId: sb.student.id,
    fullName: sb.student.fullName,
    rollNo: sb.student.rollNo,
    photoUrl: sb.student.photoUrl,
    status: attendanceStatusMap.get(sb.student.id) || null,
  }));

  const batchOptions: BatchOption[] = batches.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      {/* SideNavBar */}
      <aside className="docked left-0 h-full w-64 border-r border-outline-variant shadow-sm flex flex-col py-lg px-md bg-surface-container-lowest hidden md:flex shrink-0">
        <div className="mb-xl px-sm flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <Icon name="school" className="text-on-primary text-[20px]" />
          </div>
          <div>
            <h1 className="font-h3 text-h3 font-bold text-primary">EduFlow</h1>
            <p className="font-caption text-caption text-on-surface-variant">
              {institute?.name || "Coaching Management"}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-xs overflow-y-auto pr-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="home" className="text-[20px]" />
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link
            href="/students"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="group" className="text-[20px]" />
            <span className="font-label-md text-label-md">Students</span>
          </Link>
          <Link
            href="/attendance"
            className="flex items-center gap-md px-md py-sm rounded-lg text-primary font-semibold border-r-4 border-primary bg-primary-fixed scale-[0.98] transition-transform"
          >
            <Icon name="calendar_today" className="text-[20px]" />
            <span className="font-label-md text-label-md">Attendance</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="payments" className="text-[20px]" />
            <span className="font-label-md text-label-md">Fees</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="analytics" className="text-[20px]" />
            <span className="font-label-md text-label-md">Results</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="receipt_long" className="text-[20px]" />
            <span className="font-label-md text-label-md">Expenses</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors mt-auto"
          >
            <Icon name="settings" className="text-[20px]" />
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md w-full max-w-md">
            <div className="md:hidden font-h4 text-h4 font-bold text-primary">EduFlow</div>
            <div className="relative w-full hidden md:block">
              <Icon
                name="search"
                className="absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px]"
              />
              <input
                className="w-full pl-[36px] pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                placeholder="Search students, classes..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container cursor-pointer">
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <LanguageToggle />
            <div className="flex items-center gap-sm ml-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md">
                <Icon name="person" className="text-[18px]" />
              </div>
              <span className="font-label-md hidden lg:block text-on-surface">
                {session?.user?.name || "User"}
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-md md:p-gutter lg:p-margin relative">
          <AttendanceMarkingClient
            batches={batchOptions}
            selectedBatchId={selectedBatchId}
            selectedDate={selectedDate}
            roster={roster}
            isAuthorized={isAuthorized}
          />
        </main>
      </div>
    </div>
  );
}
