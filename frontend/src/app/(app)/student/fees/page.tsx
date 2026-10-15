import React, { Suspense } from "react";
import { auth, signOut } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

async function StudentFeeContent({ instituteId }: { instituteId: string }) {
  const [institute, rawFeesData] = await Promise.all([
    fetchApi(`/api/v1/institutes/${instituteId}`).catch(() => null),
    fetchApi("/api/v1/fees/my").catch(() => []),
  ]);

  const rawFees = rawFeesData || [];
  const unpaidFees = rawFees.filter((f: any) => f.status === "PENDING" || f.status === "OVERDUE");
  const totalUnpaidAmount = unpaidFees.reduce((acc: any, f: any) => acc + Number(f.amount), 0);
  const isAllPaid = unpaidFees.length === 0;

  const displayFees = rawFees.map((f: any) => ({
    id: f.id,
    date: new Date(f.created_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    description: `Tuition Fee (${f.month_year})`,
    amount: Number(f.amount).toFixed(2),
    method: f.payment_method || "bKash",
    status: f.status,
  }));

  return (
    <div className="space-y-lg">
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
                  <Icon name="verified" className="text-[28px]" />
                </div>
                <div>
                  <h3 className="font-h3 text-h3 text-on-surface font-bold">
                    All Fees Cleared!
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    You have no outstanding balance for this session. Great job!
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0 shadow-sm border border-error">
                  <Icon name="pending_actions" className="text-[28px]" />
                </div>
                <div>
                  <h3 className="font-h3 text-h3 text-on-surface font-bold">
                    Tuition Fees Pending
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                    You have unpaid tuition invoices. Please clear your dues promptly.
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="mt-lg pt-md border-t border-surface-variant/40 flex justify-between items-center text-body-sm font-body-sm">
            <span className="text-on-surface-variant">Outstanding Invoices:</span>
            <span className="font-bold text-on-surface">{unpaidFees.length} Pending</span>
          </div>
        </div>

        {/* Amount Due Card */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-sm flex flex-col justify-between">
          <div>
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Outstanding Due
            </p>
            <h2 className={`font-h1 text-h1 font-black mt-xs ${isAllPaid ? "text-secondary" : "text-error"}`}>
              ৳ {totalUnpaidAmount.toLocaleString()}
            </h2>
          </div>
          <div className="mt-md pt-sm border-t border-surface-variant/40 text-caption font-caption text-on-surface-variant">
            {isAllPaid ? "Next cycle fee will post next month" : "Due within the 10th of this month"}
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-lg shadow-sm">
        <h3 className="font-h4 text-h4 text-on-surface font-bold mb-md">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead>
              <tr className="border-b border-surface-variant text-on-surface-variant font-label-md">
                <th className="pb-sm font-semibold">Invoice Date</th>
                <th className="pb-sm font-semibold">Description</th>
                <th className="pb-sm font-semibold">Amount</th>
                <th className="pb-sm font-semibold">Payment Method</th>
                <th className="pb-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/30">
              {displayFees.map((fee: any) => (
                <tr key={fee.id} className="hover:bg-surface-container-high transition-colors">
                  <td className="py-md text-on-surface-variant">{fee.date}</td>
                  <td className="py-md text-on-surface font-medium">{fee.description}</td>
                  <td className="py-md font-bold text-on-surface">৳ {fee.amount}</td>
                  <td className="py-md text-on-surface-variant flex items-center gap-xs">
                    <Icon name="payment" className="text-[16px]" />
                    {fee.method}
                  </td>
                  <td className="py-md">
                    <span
                      className={`font-label-sm text-label-sm font-semibold px-sm py-xs rounded-full ${
                        fee.status === "PAID"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {fee.status === "PAID" ? "Paid" : "Due"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <StudentSidebar activeTab="fees" instituteName={"EduFlow"} />

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
              userName={session?.user?.name || "Student"}
              userEmail={session?.user?.email || "student@eduflow.bd"}
              userRole="STUDENT"
              avatarUrl={session?.user?.image}
              onSignOut={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            />
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full">
          <Suspense fallback={<ContentSkeleton />}>
            <StudentFeeContent instituteId={instituteId} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
