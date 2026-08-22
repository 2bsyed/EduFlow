import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import {
  AttendanceMarkingClient,
  RosterItem,
  BatchOption,
} from "@/components/attendance/AttendanceMarkingClient";

import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { StudentSidebar } from "@/components/layout/StudentSidebar";

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
      {/* Role-based SideNavBar */}
      {role === "TEACHER" ? (
        <TeacherSidebar activeTab="attendance" instituteName={institute?.name} />
      ) : role === "STUDENT" ? (
        <StudentSidebar activeTab="attendance" instituteName={institute?.name} />
      ) : (
        <OwnerSidebar activeTab="attendance" instituteName={institute?.name || "EduFlow"} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md w-full max-w-md">
            <div className="md:hidden flex items-center">
              <Image src="/images/logo.jpg" alt="EduFlow logo" width={100} height={32} className="object-contain -ml-2" />
            </div>
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
          <div className="flex items-center gap-md shrink-0 flex-nowrap">
            <NotificationBell />
            <LanguageToggle />
            <ProfileDropdown
              userName={session?.user?.name || "Dr. Rafiqul Islam"}
              userEmail={session?.user?.email || "owner@eduflow.bd"}
              userRole={session?.user?.role || "OWNER"}
              avatarUrl={session?.user?.image}
              onSignOut={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-md md:p-gutter lg:p-margin relative">
          <AttendanceMarkingClient
            batches={batchOptions}
            initialBatchId={selectedBatchId}
            initialDate={selectedDate}
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
