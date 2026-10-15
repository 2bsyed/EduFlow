import React, { Suspense } from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { FeesTableClient, FeeItem, StudentOption } from "@/components/fees/FeesTableClient";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { redirect } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

async function FeesContent({ instituteId }: { instituteId: string }) {
  const [institute, rawStudentsData, rawFeesData] = await Promise.all([
    fetchApi(`/api/v1/institutes/${instituteId}`, { cache: "no-store" }).catch(() => null),
    fetchApi(`/api/v1/students/`, { cache: "no-store" }).catch(() => []),
    fetchApi(`/api/v1/fees/`, { cache: "no-store" }).catch(() => []),
  ]);

  const rawStudents = rawStudentsData || [];
  const rawFees = rawFeesData || [];

  const studentOptions: StudentOption[] = rawStudents.map((s: any) => ({
    id: s.id,
    name: s.full_name,
    rollNo: s.roll_no,
    batchName: "General Batch", 
  }));

  let totalCollected = 0;
  let totalPending = 0;
  let totalOverdue = 0;

  for (const f of rawFees) {
    const amountVal = Number(f.amount) || 0;
    if (f.status === "PAID") totalCollected += amountVal;
    if (f.status === "PENDING") totalPending += amountVal;
    if (f.status === "OVERDUE") totalOverdue += amountVal;
  }

  const feeItems: FeeItem[] = rawFees.map((f: any) => {
    const amountVal = Number(f.amount) || 0;
    let statusMapped: "Paid" | "Due" | "Overdue" = "Paid";
    if (f.status === "PENDING") statusMapped = "Due";
    if (f.status === "OVERDUE") statusMapped = "Overdue";

    return {
      id: f.id,
      studentId: f.student_id,
      studentName: f.student?.full_name || "Unknown",
      studentRoll: f.student?.roll_no || "Unknown",
      photoUrl: f.student?.photo_url || null,
      batchName: f.student?.batch_name || "General Batch",
      amountDue: amountVal,
      amountPaid: f.status === "PAID" ? amountVal : 0,
      dueDate: f.payment_date
        ? new Date(f.payment_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          })
        : new Date(f.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "2-digit",
          }),
      status: statusMapped,
      paymentMethod: f.payment_method,
      receiptNo: f.receipt_no,
    };
  });

  return (
    <FeesTableClient
      fees={feeItems}
      students={studentOptions}
      totalCollected={totalCollected}
      totalPending={totalPending}
      totalOverdue={totalOverdue}
    />
  );
}

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

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <OwnerSidebar activeTab="fees" instituteName={"EduFlow"} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md w-full max-w-md">
            <div className="md:hidden flex items-center">
              <h1 className="text-xl font-bold text-primary">EduFlow</h1>
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
              userName={session?.user?.name || "Owner"}
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

        <main className="flex-1 overflow-y-auto p-md md:p-xl relative z-10">
          <Suspense fallback={<ContentSkeleton />}>
            <FeesContent instituteId={instituteId} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

