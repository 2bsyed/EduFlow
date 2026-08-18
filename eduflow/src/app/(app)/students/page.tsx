import React, { Suspense } from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { StudentTableClient, StudentItem } from "@/components/students/StudentTableClient";

import { OwnerSidebar } from "@/components/layout/OwnerSidebar";

export default async function StudentsPage() {
  const session = await auth();
  const instituteId = session?.user?.instituteId;

  if (!instituteId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Institute ID missing.
      </div>
    );
  }

  // Fetch Institute details
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Fetch Batches for filtering and dropdowns
  const batches = await prisma.batch.findMany({
    where: { instituteId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Fetch Students scoped to instituteId
  const rawStudents = await prisma.student.findMany({
    where: { instituteId },
    include: {
      studentBatches: {
        include: {
          batch: true,
        },
      },
      fees: true,
      attendances: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Map to UI-ready StudentItem objects
  const studentItems: StudentItem[] = rawStudents.map((s) => {
    const primaryBatch = s.studentBatches[0]?.batch;
    const batchId = primaryBatch?.id || (batches[0]?.id ?? "");
    const batchName = primaryBatch?.name || "General Batch";

    // Compute Fee Status
    let feeStatus: "Paid" | "Due" | "Overdue" = "Paid";
    const hasOverdue = s.fees.some((f) => f.status === "OVERDUE");
    const hasPending = s.fees.some((f) => f.status === "PENDING");
    if (hasOverdue) feeStatus = "Overdue";
    else if (hasPending) feeStatus = "Due";

    // Compute Attendance Percentage
    const totalAtt = s.attendances.length;
    const presentAtt = s.attendances.filter((a) => a.status === "PRESENT").length;
    const attendancePct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 95;

    return {
      id: s.id,
      fullName: s.fullName,
      rollNo: s.rollNo,
      email: s.email,
      phone: s.guardianPhone,
      guardianName: s.guardianName || "N/A",
      guardianPhone: s.guardianPhone || "N/A",
      address: s.address,
      status: s.status as "ACTIVE" | "INACTIVE" | "SUSPENDED",
      photoUrl: s.photoUrl,
      batchId,
      batchName,
      feeStatus,
      attendancePct,
    };
  });

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <OwnerSidebar activeTab="students" instituteName={institute?.name} />

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
                placeholder="Search EduFlow..."
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
        <main className="flex-1 overflow-y-auto p-margin">
          <Suspense fallback={<div className="p-md text-on-surface-variant font-body-md">Loading students...</div>}>
            <StudentTableClient students={studentItems} batches={batches} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
