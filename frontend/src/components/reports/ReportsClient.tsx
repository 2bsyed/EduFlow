"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  getAttendanceReportAction,
  AttendanceReportResult,
} from "@/actions/attendance";

type FeeRecord = {
  receipt_no?: string | null;
  amount: number;
  month_year?: string | null;
  status: string;
  payment_method?: string | null;
  payment_date?: string | null;
  student?: { full_name?: string; roll_no?: string; batch_name?: string };
};

type ExpenseRecord = {
  title: string;
  category: string;
  amount: number;
  date: string;
};

type BatchItem = {
  id: string;
  name: string;
  subject?: string | null;
};

function csvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsClient({
  fees,
  expenses,
  batches = [],
}: {
  fees: FeeRecord[];
  expenses: ExpenseRecord[];
  batches?: BatchItem[];
}) {
  const [activeTab, setActiveTab] = useState<"finance" | "attendance">("finance");

  // Financial calculations
  const paid = fees.filter((fee) => fee.status === "PAID");
  const pending = fees.filter(
    (fee) => fee.status === "PENDING" || fee.status === "OVERDUE"
  );
  const totalPaid = paid.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
  const totalPending = pending.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  }).format(new Date());

  // Attendance Report State
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedBatchId, setSelectedBatchId] = useState("all");
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [reportError, setReportError] = useState<string | null>(null);

  const fetchAttendanceReport = () => {
    setReportError(null);
    startTransition(async () => {
      const res = await getAttendanceReportAction(startDate, endDate, selectedBatchId);
      if (res.success && res.data) {
        setAttendanceReport(res.data);
      } else {
        setReportError(res.error || "Failed to load attendance report.");
      }
    });
  };

  const exportAttendanceCsv = () => {
    if (!attendanceReport || !attendanceReport.students.length) return;
    const header = [
      "Roll No",
      "Student Name",
      "Present",
      "Absent",
      "Late",
      "Total Sessions",
      "Attendance %",
    ];
    const rows = attendanceReport.students.map((s) => [
      s.rollNo,
      s.name,
      s.present,
      s.absent,
      s.late,
      s.total,
      `${s.percentage}%`,
    ]);
    downloadCsv(`attendance-report-${startDate}-to-${endDate}.csv`, [header, ...rows]);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-5 md:p-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Institute Analytics & Records</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-600">
            Exportable summaries derived from recorded activity in EduFlow.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("finance")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "finance"
                ? "bg-[#0f6cbd] text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon name="payments" className="text-base" />
            Financial Summary
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("attendance");
              if (!attendanceReport && !isPending) {
                fetchAttendanceReport();
              }
            }}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === "attendance"
                ? "bg-[#0f6cbd] text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Icon name="event_available" className="text-base" />
            Attendance Period
          </button>
        </div>
      </div>

      {activeTab === "finance" ? (
        <>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={() =>
                downloadCsv("eduflow-fees.csv", [
                  [
                    "Student",
                    "Roll",
                    "Batch",
                    "Month",
                    "Amount (BDT)",
                    "Status",
                    "Payment method",
                    "Payment date",
                    "Receipt",
                  ],
                  ...fees.map((fee) => [
                    fee.student?.full_name,
                    fee.student?.roll_no,
                    fee.student?.batch_name,
                    fee.month_year,
                    fee.amount,
                    fee.status,
                    fee.payment_method,
                    fee.payment_date,
                    fee.receipt_no,
                  ]),
                ])
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <Icon name="download" className="text-lg" />
              Export fees CSV
            </button>
            <button
              onClick={() =>
                downloadCsv("eduflow-expenses.csv", [
                  ["Title", "Category", "Amount (BDT)", "Date"],
                  ...expenses.map((expense) => [
                    expense.title,
                    expense.category,
                    expense.amount,
                    expense.date,
                  ]),
                ])
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#0f6cbd] px-4 py-2 text-sm font-medium text-white hover:bg-[#115ea3] transition-colors"
            >
              <Icon name="download" className="text-lg" />
              Export expenses CSV
            </button>
          </div>

          <section
            aria-label="Institute financial summary"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            {[
              {
                label: "Paid fees",
                value: `৳ ${totalPaid.toLocaleString("en-BD")}`,
                note: `${paid.length} recorded payments`,
                icon: "payments",
                color: "text-emerald-700 bg-emerald-50",
              },
              {
                label: "Outstanding fees",
                value: `৳ ${totalPending.toLocaleString("en-BD")}`,
                note: `${pending.length} due records`,
                icon: "schedule",
                color: "text-orange-700 bg-orange-50",
              },
              {
                label: "Expenses recorded",
                value: `৳ ${totalExpenses.toLocaleString("en-BD")}`,
                note: `${expenses.length} entries`,
                icon: "receipt_long",
                color: "text-violet-700 bg-violet-50",
              },
              {
                label: "This month",
                value: monthLabel,
                note: "Based on Bangladesh time",
                icon: "calendar_month",
                color: "text-blue-700 bg-blue-50",
              },
            ].map((card) => (
              <article
                key={card.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{card.label}</span>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}
                  >
                    <Icon name={card.icon} className="text-xl" />
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs text-slate-500">{card.note}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Recent fee records</h2>
                  <p className="text-xs text-slate-500">
                    Paid and outstanding records for this institute
                  </p>
                </div>
                <a href="/fees" className="text-sm font-medium text-[#0f6cbd]">
                  Open fees
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.slice(0, 8).map((fee, index) => (
                      <tr
                        key={`${fee.receipt_no || fee.student?.roll_no}-${index}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3">
                          <span className="block font-medium text-slate-800">
                            {fee.student?.full_name || "Student"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {fee.student?.roll_no || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{fee.month_year || "—"}</td>
                        <td className="px-4 py-3">
                          ৳ {Number(fee.amount).toLocaleString("en-BD")}
                        </td>
                        <td className="px-4 py-3">{fee.status}</td>
                      </tr>
                    ))}
                    {!fees.length && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No fee records have been added.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Recent expenses</h2>
                  <p className="text-xs text-slate-500">
                    Recorded outflows; not a payroll report
                  </p>
                </div>
                <a href="/expenses" className="text-sm font-medium text-[#0f6cbd]">
                  Open expenses
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[440px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Expense</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 8).map((expense, index) => (
                      <tr
                        key={`${expense.title}-${index}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3">
                          <span className="block font-medium text-slate-800">
                            {expense.title}
                          </span>
                          <span className="text-xs text-slate-500">{expense.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          {expense.date
                            ? new Date(expense.date).toLocaleDateString("en-GB")
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          ৳ {Number(expense.amount).toLocaleString("en-BD")}
                        </td>
                      </tr>
                    ))}
                    {!expenses.length && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                          No expenses have been added.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </>
      ) : (
        /* Attendance Period Tab */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Batch Filter
                </label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#0f6cbd] focus:outline-none"
                >
                  <option value="all">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.subject ? `(${b.subject})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#0f6cbd] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#0f6cbd] focus:outline-none"
                />
              </div>

              <div className="flex items-end self-end">
                <button
                  type="button"
                  onClick={fetchAttendanceReport}
                  disabled={isPending}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f6cbd] px-4 text-sm font-semibold text-white hover:bg-[#115ea3] disabled:opacity-50 transition-colors"
                >
                  <Icon name="refresh" className={isPending ? "animate-spin text-base" : "text-base"} />
                  {isPending ? "Loading..." : "Generate Report"}
                </button>
              </div>
            </div>

            {attendanceReport && attendanceReport.students.length > 0 && (
              <button
                type="button"
                onClick={exportAttendanceCsv}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <Icon name="download" className="text-base text-slate-600" />
                Export CSV
              </button>
            )}
          </div>

          {reportError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {reportError}
            </div>
          )}

          {/* KPI Summary Cards */}
          {attendanceReport && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Sessions
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {attendanceReport.totalSessions}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Days with recorded attendance
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Attendance Records
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {attendanceReport.totalRecords}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Total student sessions evaluated
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overall Attendance Rate
                </p>
                <p className="mt-2 text-3xl font-bold text-[#0f6cbd]">
                  {attendanceReport.overallPercentage}%
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Institute-wide percentage in range
                </p>
              </div>
            </div>
          )}

          {/* Student Breakdown Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Student Attendance Breakdown</h2>
              <p className="text-xs text-slate-500">
                Detailed attendance ratios per student for the selected period ({startDate} to {endDate})
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-600 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Roll No</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3 text-center">Present</th>
                    <th className="px-5 py-3 text-center">Absent</th>
                    <th className="px-5 py-3 text-center">Late</th>
                    <th className="px-5 py-3 text-center">Total Sessions</th>
                    <th className="px-5 py-3 text-center">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceReport && attendanceReport.students.length > 0 ? (
                    attendanceReport.students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 font-semibold text-slate-800">
                          {st.rollNo || "—"}
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-900">{st.name}</td>
                        <td className="px-5 py-3 text-center text-emerald-600 font-medium">
                          {st.present}
                        </td>
                        <td className="px-5 py-3 text-center text-red-600 font-medium">
                          {st.absent}
                        </td>
                        <td className="px-5 py-3 text-center text-amber-600 font-medium">
                          {st.late}
                        </td>
                        <td className="px-5 py-3 text-center text-slate-700">
                          {st.total}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              st.percentage >= 80
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : st.percentage >= 60
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {st.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Icon name="event_busy" className="text-3xl text-slate-400" />
                          <p className="text-sm font-medium text-slate-800">
                            {isPending
                              ? "Computing attendance report..."
                              : "No attendance records found for this period"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Select a different date range or batch filter and click &ldquo;Generate Report&rdquo;.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
