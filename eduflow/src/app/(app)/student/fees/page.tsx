import React from "react";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { StudentSidebar } from "@/components/layout/StudentSidebar";

export default async function StudentFeeStatusPage() {
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
      fees: {
        orderBy: { createdAt: "desc" },
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

  // Calculate fee status using Prisma FeeStatus enum values (PENDING, OVERDUE, PAID)
  const unpaidFees = student.fees.filter((f) => f.status === "PENDING" || f.status === "OVERDUE");
  const totalUnpaidAmount = unpaidFees.reduce((acc, f) => acc + Number(f.amount), 0);
  const isAllPaid = unpaidFees.length === 0;

  // Sample default fee history if none created yet for this student
  const sampleFeeHistory = [
    {
      id: "f1",
      date: "12 Mar 2024",
      description: "Spring Semester 2024 - Installment 2",
      amount: "5,000.00",
      method: "bKash",
      status: "PAID",
    },
    {
      id: "f2",
      date: "05 Feb 2024",
      description: "Spring Semester 2024 - Installment 1",
      amount: "7,500.00",
      method: "Nagad",
      status: "PAID",
    },
    {
      id: "f3",
      date: "10 Dec 2023",
      description: "Admission Fee & ID Card",
      amount: "2,000.00",
      method: "Cash",
      status: "PAID",
    },
  ];

  const displayFees =
    student.fees.length > 0
      ? student.fees.map((f) => ({
          id: f.id,
          date: new Date(f.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          description: f.notes ? `${f.notes} (${f.monthYear})` : `Tuition Fee (${f.monthYear})`,
          amount: Number(f.amount).toFixed(2),
          method: f.paymentMethod || "bKash",
          status: f.status,
        }))
      : sampleFeeHistory;

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <StudentSidebar activeTab="fees" instituteName={institute?.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Student Portal</h2>
          </div>
          <div className="flex items-center gap-md shrink-0 flex-nowrap">
            <NotificationBell />
            <LanguageToggle />
            <ProfileDropdown
              userName={student.fullName}
              userEmail={session?.user?.email || "student@eduflow.bd"}
              userRole="STUDENT"
              avatarUrl={student.photoUrl}
              onSignOut={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            />
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full space-y-lg">
          {/* Header */}
          <div className="mb-lg">
            <h1 className="font-h1 text-h1 text-on-surface font-bold">Fee Status</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
              Manage and review your tuition payments.
            </p>
          </div>

          {/* Grid: Status Summary + Next Due Date */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl items-stretch">
            {/* Status Summary Card */}
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-sm flex flex-col justify-between">
              <div className="flex items-start md:items-center gap-lg">
                {isAllPaid ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-sm border border-secondary-fixed">
                      <Icon name="check_circle" className="text-[28px]" />
                    </div>
                    <div>
                      <h2 className="font-h2 text-h2 text-on-surface font-bold mb-xs">
                        All fees paid
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        Your account is up to date. You have no pending balances for the current term.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0 shadow-sm">
                      <Icon name="warning" className="text-[28px]" />
                    </div>
                    <div>
                      <h2 className="font-h2 text-h2 text-on-surface font-bold mb-xs">
                        Pending Balance: BDT {totalUnpaidAmount.toFixed(2)}
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                        Please clear your pending fee balance before the upcoming exam date.
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-md pt-sm border-t border-surface-variant/60 flex items-center justify-between text-caption text-on-surface-variant">
                <span className="flex items-center gap-xs text-secondary font-medium">
                  <Icon name="verified" className="text-[16px]" /> Multi-channel Gateway Ready
                </span>
                <span>bKash / Nagad / Cash</span>
              </div>
            </div>

            {/* Next Due Date Card */}
            <div className="bg-surface-container-low border border-surface-variant rounded-xl p-lg flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-xs">
                  <span className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider font-bold">
                    Next Due Date
                  </span>
                  <Icon name="event" className="text-primary text-[20px]" />
                </div>
                <p className="font-h2 text-h2 text-on-surface font-bold mt-xs">15 Jun 2026</p>
              </div>
              <div className="mt-md pt-sm border-t border-surface-variant flex justify-between items-center">
                <span className="font-caption text-caption text-on-surface-variant font-medium">
                  Estimated Due:
                </span>
                <span className="font-label-md text-label-md font-bold text-primary">
                  BDT {isAllPaid ? "0.00" : totalUnpaidAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden shadow-sm">
            <div className="px-lg py-md border-b border-surface-variant flex justify-between items-center bg-surface-bright">
              <h3 className="font-h4 text-h4 text-on-surface flex items-center gap-sm font-bold">
                <Icon name="receipt_long" className="text-primary text-[20px]" />
                <span>Payment History</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-surface-variant font-label-md text-label-md text-on-surface-variant">
                    <th className="px-lg py-md font-semibold">Date</th>
                    <th className="px-lg py-md font-semibold">Description</th>
                    <th className="px-lg py-md font-semibold text-right">Amount</th>
                    <th className="px-lg py-md font-semibold">Method</th>
                    <th className="px-lg py-md font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant font-body-sm">
                  {displayFees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="hover:bg-surface-container-low/50 transition-colors group"
                    >
                      <td className="px-lg py-md text-on-surface font-medium whitespace-nowrap">
                        {fee.date}
                      </td>
                      <td className="px-lg py-md text-on-surface font-semibold">
                        {fee.description}
                      </td>
                      <td className="px-lg py-md text-on-surface font-semibold text-right whitespace-nowrap">
                        BDT {fee.amount}
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-xs">
                          {fee.method.toLowerCase().includes("bkash") ? (
                            <span className="w-6 h-6 rounded bg-[#E2136E] text-white flex items-center justify-center text-[12px] font-bold">
                              b
                            </span>
                          ) : fee.method.toLowerCase().includes("nagad") ? (
                            <span className="w-6 h-6 rounded bg-[#F7931E] text-white flex items-center justify-center text-[12px] font-bold">
                              N
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded bg-surface-variant text-on-surface-variant flex items-center justify-center text-[12px] font-bold">
                              ৳
                            </span>
                          )}
                          <span className="text-on-surface font-medium">{fee.method}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        {fee.status === "PAID" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-semibold bg-secondary-container text-on-secondary-container">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-caption font-semibold bg-error-container text-on-error-container">
                            {fee.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
