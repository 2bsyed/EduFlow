import React from "react";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { createExpenseAction } from "@/app/actions/expenses";

export default async function ExpensesPage() {
  const session = await auth();
  const instituteId = session?.user?.instituteId;

  if (!instituteId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Institute ID missing.
      </div>
    );
  }

  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  const expenses = await prisma.expense.findMany({
    where: { instituteId },
    orderBy: { expenseDate: "desc" },
  });

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  // Sample default expense list if empty
  const sampleExpenses = [
    {
      id: "e1",
      title: "Monthly Rent & Utility Bill",
      category: "Rent & Utilities",
      amount: 18000,
      recordedBy: "Dr. Rafiqul Islam",
      expenseDate: new Date("2026-07-01"),
      notes: "July 2026 Premises Rent & Electricity",
    },
    {
      id: "e2",
      title: "Teacher Honorarium & Payroll",
      category: "Payroll",
      amount: 25000,
      recordedBy: "Dr. Rafiqul Islam",
      expenseDate: new Date("2026-07-05"),
      notes: "Monthly honorarium for faculty members",
    },
    {
      id: "e3",
      title: "Exam Sheet Printing & Stationary",
      category: "Supplies",
      amount: 3500,
      recordedBy: "Dr. Rafiqul Islam",
      expenseDate: new Date("2026-07-12"),
      notes: "Model test question papers",
    },
  ];

  const displayExpenses = expenses.length > 0 ? expenses : sampleExpenses;

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <OwnerSidebar activeTab="expenses" instituteName={institute?.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Institute Expenses</h2>
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

        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full space-y-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-md">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface font-bold">Expenses & Outflow</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                Track operational expenditure, rent, teacher salaries, and office supplies.
              </p>
            </div>
          </div>

          {/* Stat Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-bold block mb-xs">
                Total Expenses (Current Term)
              </span>
              <h2 className="font-h1 text-h1 text-error font-bold">
                ৳ {(totalExpenseAmount || 46500).toLocaleString("en-BD")}
              </h2>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-bold block mb-xs">
                Rent & Operations
              </span>
              <h2 className="font-h2 text-h2 text-on-surface font-bold">৳ 18,000</h2>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider font-bold block mb-xs">
                Faculty Honorarium
              </span>
              <h2 className="font-h2 text-h2 text-primary font-bold">৳ 25,000</h2>
            </div>
          </div>

          {/* Expense Entry Form Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
            <h3 className="font-h4 text-h4 text-on-surface font-bold flex items-center gap-sm">
              <Icon name="add_circle" className="text-primary text-[20px]" />
              <span>Record New Expense</span>
            </h3>

            <form action={createExpenseAction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-xs">
                  Expense Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Whiteboard Markers & Paper"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-xs">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                >
                  <option value="Rent & Utilities">Rent & Utilities</option>
                  <option value="Payroll">Payroll / Teacher Honorarium</option>
                  <option value="Supplies">Stationary & Printing</option>
                  <option value="Marketing">Marketing & Banners</option>
                  <option value="Maintenance">Maintenance & Repairs</option>
                </select>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-xs">
                  Amount (BDT)
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 2500"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded-lg shadow-sm transition-colors font-semibold flex items-center justify-center gap-xs cursor-pointer"
                >
                  <Icon name="save" className="text-[18px]" />
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>

          {/* Expense Log Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-md py-sm border-b border-surface-variant bg-surface-bright flex justify-between items-center">
              <h3 className="font-h4 text-h4 text-on-surface font-bold flex items-center gap-sm">
                <Icon name="receipt_long" className="text-primary text-[20px]" />
                <span>Expense History</span>
              </h3>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-surface-variant font-label-md text-caption text-on-surface-variant">
                    <th className="px-sm py-xs font-semibold">Date</th>
                    <th className="px-sm py-xs font-semibold">Title</th>
                    <th className="px-sm py-xs font-semibold">Category</th>
                    <th className="px-sm py-xs font-semibold text-right">Amount (BDT)</th>
                    <th className="px-sm py-xs font-semibold">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant font-body-sm">
                  {displayExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-sm py-xs text-on-surface font-medium whitespace-nowrap text-caption">
                        {new Date(exp.expenseDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="px-sm py-xs text-on-surface font-semibold text-caption">
                        {exp.title}
                        {exp.notes && (
                          <span className="block text-[10px] text-on-surface-variant font-normal">
                            {exp.notes}
                          </span>
                        )}
                      </td>
                      <td className="px-sm py-xs">
                        <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold bg-surface-container-highest text-on-surface-variant uppercase tracking-wide">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-sm py-xs text-error font-bold text-right whitespace-nowrap text-caption">
                        - ৳ {Number(exp.amount).toFixed(2)}
                      </td>
                      <td className="px-sm py-xs text-on-surface-variant text-caption">
                        {exp.recordedBy || "Admin"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="block md:hidden divide-y divide-surface-variant">
              {displayExpenses.map((exp) => (
                <div key={exp.id} className="p-md hover:bg-surface-container-low/50 transition-colors">
                  <div className="flex justify-between items-start mb-sm">
                    <div>
                      <h4 className="font-label-md text-on-surface font-semibold">{exp.title}</h4>
                      <p className="font-caption text-on-surface-variant text-[10px]">
                        {new Date(exp.expenseDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="font-label-md text-error font-bold whitespace-nowrap ml-sm">
                      - ৳ {Number(exp.amount).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-sm">
                    <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold bg-surface-container-highest text-on-surface-variant uppercase tracking-wide">
                      {exp.category}
                    </span>
                    <span className="font-caption text-on-surface-variant text-[10px]">
                      {exp.recordedBy || "Admin"}
                    </span>
                  </div>
                  {exp.notes && (
                    <div className="mt-sm pt-sm border-t border-outline-variant/30">
                      <p className="text-[10px] text-on-surface-variant italic">{exp.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
