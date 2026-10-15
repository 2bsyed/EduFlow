import { fetchApi } from "@/lib/api";
import React, { Suspense } from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
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
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

interface AttendancePageProps {
  searchParams: Promise<{
    batchId?: string;
    date?: string;
  }>;
}

async function AttendanceContent({
  searchParams,
  role,
}: {
  searchParams: Promise<{ batchId?: string; date?: string }>;
  role?: string;
}) {
  const { batchId: paramBatchId, date: paramDate } = await searchParams;

  // Parallel wave 1: fetch batches and teacher profile if needed
  const [batchesRes, teacherRes] = await Promise.all([
    fetchApi("/api/v1/batches/").catch(() => []),
    role === "TEACHER" ? fetchApi("/api/v1/teachers/me").catch(() => null) : Promise.resolve(null),
  ]);

  const rawBatches: any[] = Array.isArray(batchesRes) ? batchesRes : [];
  
  // Teachers ONLY see batches they are assigned to
  const teacherId = teacherRes?.id;
  const batches = role === "TEACHER"
    ? rawBatches.filter((b: any) => b.teacherId === teacherId)
    : rawBatches;

  if (role === "TEACHER" && batches.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center space-y-sm my-md">
        <Icon name="event_busy" className="text-outline text-[48px] mx-auto text-on-surface-variant" />
        <h3 className="font-h3 text-h3 font-bold text-on-surface">No Assigned Batches</h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
          You are not currently assigned to any batches. Attendance is only available for batches assigned to your teacher account.
        </p>
      </div>
    );
  }

  // Validate paramBatchId: teachers cannot see or access unassigned batches
  const isAllowedBatch = batches.some((b: any) => b.id === paramBatchId);
  const selectedBatchId = (isAllowedBatch ? paramBatchId : null) || batches[0]?.id || "";
  const todayStr = new Date().toISOString().split("T")[0];
  const selectedDate = paramDate || todayStr;

  // Authorization Check
  let isAuthorized = true;
  if (role === "TEACHER") {
    const currentBatch = batches.find((b: any) => b.id === selectedBatchId) as any;
    isAuthorized = !!(teacherId && currentBatch && currentBatch.teacherId === teacherId);
  }

  // Parallel wave 2: fetch roster and attendance for selectedBatchId
  const parsedDate = new Date(selectedDate);
  parsedDate.setHours(0, 0, 0, 0);

  const [studentBatchesRes, existingAttendanceRes] = await Promise.all([
    selectedBatchId
      ? fetchApi(`/api/v1/batches/${selectedBatchId}/students`).catch(() => [])
      : Promise.resolve([]),
    selectedBatchId
      ? fetchApi(`/api/v1/attendance?batchId=${selectedBatchId}&date=${parsedDate.toISOString()}`).catch(() => [])
      : Promise.resolve([]),
  ]);

  const studentBatches = Array.isArray(studentBatchesRes) ? studentBatchesRes : [];
  const existingAttendance = Array.isArray(existingAttendanceRes) ? existingAttendanceRes : [];

  // Map to RosterItem List
  const attendanceStatusMap = new Map<string, "PRESENT" | "ABSENT" | "LATE">();
  existingAttendance.forEach((att: any) => {
    const sId = att.studentId || att.student_id;
    if (sId) {
      attendanceStatusMap.set(sId, att.status as "PRESENT" | "ABSENT" | "LATE");
    }
  });

  const roster: RosterItem[] = (studentBatches as { student: { id: string; fullName: string; rollNo: string | null; photoUrl: string | null } }[]).map((sb) => ({
    studentId: sb.student.id,
    fullName: sb.student.fullName,
    rollNo: sb.student.rollNo,
    photoUrl: sb.student.photoUrl,
    status: attendanceStatusMap.get(sb.student.id) || null,
  }));

  const batchOptions: BatchOption[] = (batches as { id: string; name: string; teacherId?: string | null }[]).map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <AttendanceMarkingClient
      batches={batchOptions}
      initialBatchId={selectedBatchId}
      initialDate={selectedDate}
      selectedBatchId={selectedBatchId}
      selectedDate={selectedDate}
      roster={roster}
      isAuthorized={isAuthorized}
    />
  );
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

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      {/* Role-based SideNavBar */}
      {role === "TEACHER" ? (
        <TeacherSidebar activeTab="attendance" />
      ) : role === "STUDENT" ? (
        <StudentSidebar activeTab="attendance" />
      ) : (
        <OwnerSidebar activeTab="attendance" />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md w-full max-w-md">
            <div className="md:hidden flex items-center">
              <h1 className="text-xl font-bold text-primary">EduFlow</h1>
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
              userName={session?.user?.name || "User"}
              userEmail={session?.user?.email || "user@eduflow.bd"}
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
          <Suspense fallback={<ContentSkeleton />}>
            <AttendanceContent searchParams={searchParams} role={role} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
