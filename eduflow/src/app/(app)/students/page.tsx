import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { StudentTableClient, StudentItem } from "@/components/students/StudentTableClient";

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
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      {/* SideNavBar */}
      <aside className="docked left-0 h-full w-64 border-r border-outline-variant shadow-sm flex flex-col py-lg px-md bg-surface-container-lowest hidden md:flex shrink-0">
        <div className="mb-xl px-sm flex items-center gap-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
            <Icon name="school" className="text-[24px]" />
          </div>
          <div>
            <h1 className="font-h3 text-h3 font-bold text-primary">EduFlow</h1>
            <p className="font-caption text-caption text-on-surface-variant">
              {institute?.name || "Coaching Management"}
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="home" className="text-[20px]" />
            <span className="font-label-md text-label-md">Home</span>
          </Link>
          <Link
            href="/students"
            className="flex items-center gap-md px-md py-sm rounded-lg text-primary font-semibold border-r-4 border-primary bg-primary-fixed scale-[0.98] transition-transform"
          >
            <Icon name="group" className="text-[20px]" />
            <span className="font-label-md text-label-md">Students</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
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
                placeholder="Search EduFlow..."
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
                {session?.user?.name || "Owner"}
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
        <main className="flex-1 overflow-y-auto p-margin">
          <StudentTableClient students={studentItems} batches={batches} />
        </main>
      </div>
    </div>
  );
}
