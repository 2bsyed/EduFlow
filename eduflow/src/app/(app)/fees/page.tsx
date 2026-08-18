import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { FeesTableClient, FeeItem, StudentOption } from "@/components/fees/FeesTableClient";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";

export default async function FeesPage() {
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

  // Fetch Students for dropdown selection
  const rawStudents = await prisma.student.findMany({
    where: { instituteId },
    include: {
      studentBatches: {
        include: {
          batch: true,
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const studentOptions: StudentOption[] = rawStudents.map((s) => ({
    id: s.id,
    name: s.fullName,
    rollNo: s.rollNo,
    batchName: s.studentBatches[0]?.batch?.name || "General Batch",
  }));

  // Fetch Fees for list view
  const rawFees = await prisma.fee.findMany({
    where: { instituteId },
    include: {
      student: {
        include: {
          studentBatches: {
            include: {
              batch: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute Aggregates
  let totalCollected = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  const feeItems: FeeItem[] = rawFees.map((f) => {
    const amountVal = Number(f.amount);
    if (f.status === "PAID") totalCollected += amountVal;
    if (f.status === "PENDING") totalPending += amountVal;
    if (f.status === "OVERDUE") totalOverdue += amountVal;

    let statusMapped: "Paid" | "Due" | "Overdue" = "Paid";
    if (f.status === "PENDING") statusMapped = "Due";
    if (f.status === "OVERDUE") statusMapped = "Overdue";

    return {
      id: f.id,
      studentId: f.studentId,
      studentName: f.student.fullName,
      studentRoll: f.student.rollNo,
      photoUrl: f.student.photoUrl,
      batchName: f.student.studentBatches[0]?.batch?.name || "General Batch",
      amountDue: amountVal,
      amountPaid: f.status === "PAID" ? amountVal : 0,
      dueDate: f.paymentDate
        ? new Date(f.paymentDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          })
        : f.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          }),
      status: statusMapped,
      paymentMethod: f.paymentMethod as any,
      receiptNo: f.receiptNo,
    };
  });

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <OwnerSidebar activeTab="fees" instituteName={institute?.name} />

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
                className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              />
              <input
                className="w-full pl-[36px] pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                placeholder="Search students, invoices..."
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
        <main className="flex-1 overflow-y-auto p-md md:p-xl relative z-10">
          <FeesTableClient
            fees={feeItems}
            students={studentOptions}
            totalCollected={totalCollected}
            totalPending={totalPending}
            totalOverdue={totalOverdue}
          />
        </main>
      </div>
    </div>
  );
}
