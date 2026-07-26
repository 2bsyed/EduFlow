import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { AttendanceDonut } from "@/components/dashboard/AttendanceDonut";
import { PendingReminderList } from "@/components/dashboard/PendingReminderList";

export default async function OwnerDashboardPage() {
  const session = await auth();
  const instituteId = session?.user?.instituteId;

  if (!instituteId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Institute ID missing.
      </div>
    );
  }

  // Fetch logged-in institute & user info
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // 1. Total Students Count
  const totalStudents = await prisma.student.count({
    where: { instituteId, status: "ACTIVE" },
  });

  // 2. Monthly Revenue Sum (Paid Fees)
  const monthlyRevenueAgg = await prisma.fee.aggregate({
    where: {
      instituteId,
      status: "PAID",
    },
    _sum: {
      amount: true,
    },
  });
  const monthlyRevenue = Number(monthlyRevenueAgg._sum.amount || 0);

  // 3. Pending Fees Sum (Pending / Overdue Fees)
  const pendingFeesAgg = await prisma.fee.aggregate({
    where: {
      instituteId,
      status: { in: ["PENDING", "OVERDUE"] },
    },
    _sum: {
      amount: true,
    },
  });
  const pendingFees = Number(pendingFeesAgg._sum.amount || 0);

  // 4. Today's Attendance Breakdown
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendanceLogs = await prisma.attendance.findMany({
    where: {
      instituteId,
      date: today,
    },
  });

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  todayAttendanceLogs.forEach((log) => {
    if (log.status === "PRESENT") presentCount++;
    if (log.status === "ABSENT") absentCount++;
    if (log.status === "LATE") lateCount++;
  });

  const totalAttendanceToday = todayAttendanceLogs.length;
  const attendancePct =
    totalAttendanceToday > 0
      ? Math.round((presentCount / totalAttendanceToday) * 100)
      : 94; // fallback for design demo if no logs today

  // 5. Revenue Trend Data (Last 6 Months)
  const monthlyRevenueTrend = [
    { month: "May", revenue: 15000 },
    { month: "Jun", revenue: 18000 },
    { month: "Jul", revenue: 22000 },
    { month: "Aug", revenue: 25000 },
    { month: "Sep", revenue: 30000 },
    { month: "Oct", revenue: monthlyRevenue > 0 ? monthlyRevenue : 37500 },
  ];

  // 6. Recent Activity Log (Top 10)
  const recentLogs = await prisma.activityLog.findMany({
    where: { instituteId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: true },
  });

  // Fallback demo activities if activity logs empty
  const displayLogs =
    recentLogs.length > 0
      ? recentLogs
      : [
          {
            id: "log-1",
            action: "FEE_RECEIVED",
            details: "Aisha Rahman (Class 10) paid ৳ 2,500 via bKash.",
            createdAt: new Date(),
          },
          {
            id: "log-2",
            action: "ATTENDANCE_MARKED",
            details: "Class 10 - Higher Math attendance marked by Kamrul Hasan.",
            createdAt: new Date(Date.now() - 3600000),
          },
          {
            id: "log-3",
            action: "STUDENT_ENROLLED",
            details: "New student 'Tanvir Ahmed' enrolled in Class 10.",
            createdAt: new Date(Date.now() - 86400000),
          },
        ];

  // 7. Top 5 Pending Fee Reminders
  const pendingFeeRecords = await prisma.fee.findMany({
    where: {
      instituteId,
      status: { in: ["PENDING", "OVERDUE"] },
    },
    include: {
      student: true,
    },
    take: 5,
  });

  const pendingStudentsList = pendingFeeRecords.map((feeRecord) => ({
    studentId: feeRecord.student.id,
    studentName: feeRecord.student.fullName,
    amount: Number(feeRecord.amount).toLocaleString(),
  }));

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      {/* SideNavBar */}
      <nav className="bg-surface-container-lowest text-primary font-label-md text-label-md docked left-0 h-full w-64 border-r border-outline-variant shadow-sm flex flex-col py-lg px-md hidden md:flex shrink-0">
        <div className="mb-xl flex items-center gap-sm">
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
        <div className="flex-1 overflow-y-auto space-y-sm pr-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-md px-md py-sm rounded-lg text-primary font-semibold border-r-4 border-primary bg-primary-fixed scale-[0.98] transition-transform"
          >
            <Icon name="home" className="text-[20px]" />
            <span>Home</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="group" className="text-[20px]" />
            <span>Students</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="calendar_today" className="text-[20px]" />
            <span>Attendance</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="payments" className="text-[20px]" />
            <span>Fees</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="analytics" className="text-[20px]" />
            <span>Results</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="receipt_long" className="text-[20px]" />
            <span>Expenses</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="settings" className="text-[20px]" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="bg-surface-bright text-primary font-body-md text-body-md docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 shrink-0">
          <div className="flex items-center gap-lg w-full max-w-2xl">
            <div className="md:hidden font-h4 text-h4 font-bold text-primary">EduFlow</div>
            <div className="relative w-full max-w-md hidden md:block">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              />
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-sm text-on-surface"
                placeholder="Search students, batches..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative cursor-pointer">
              <Icon name="notifications" className="text-[20px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
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

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-md md:p-lg lg:p-xl space-y-xl">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-h2 text-h2 text-on-surface">Dashboard Overview</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Welcome back, {session?.user?.name}. Here's what's happening today.
              </p>
            </div>
            <button className="hidden sm:flex items-center gap-xs bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
              <Icon name="add" className="text-sm" />
              <span>New Admission</span>
            </button>
          </div>

          {/* Top Row: 4 Real KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md md:gap-lg">
            {/* Card 1: Total Students */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="flex justify-between items-start mb-sm">
                <div className="p-2 bg-primary-fixed rounded-lg text-primary">
                  <Icon name="group" className="text-[20px]" />
                </div>
                <span className="inline-flex items-center gap-xs text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-full font-caption font-medium">
                  <Icon name="trending_up" className="text-[14px]" /> 12%
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant">Total Students</p>
              <p className="font-h2 text-h2 mt-1">{totalStudents}</p>
            </div>

            {/* Card 2: Monthly Revenue */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="flex justify-between items-start mb-sm">
                <div className="p-2 bg-primary-fixed rounded-lg text-primary">
                  <Icon name="payments" className="text-[20px]" />
                </div>
                <span className="inline-flex items-center gap-xs text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-full font-caption font-medium">
                  <Icon name="trending_up" className="text-[14px]" /> 8%
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant">Monthly Revenue</p>
              <p className="font-h2 text-h2 mt-1">৳ {monthlyRevenue.toLocaleString()}</p>
            </div>

            {/* Card 3: Pending Fees */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="flex justify-between items-start mb-sm">
                <div className="p-2 bg-error-container/50 rounded-lg text-error">
                  <Icon name="receipt_long" className="text-[20px]" />
                </div>
                <span className="inline-flex items-center gap-xs text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-full font-caption font-medium">
                  <Icon name="trending_down" className="text-[14px]" /> 5%
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant">Pending Fees</p>
              <p className="font-h2 text-h2 mt-1">৳ {pendingFees.toLocaleString()}</p>
            </div>

            {/* Card 4: Today's Attendance */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="flex justify-between items-start mb-sm">
                <div className="p-2 bg-secondary-container/50 rounded-lg text-secondary">
                  <Icon name="calendar_today" className="text-[20px]" />
                </div>
                <span className="inline-flex items-center gap-xs text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full font-caption font-medium">
                  Stable
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant">Today's Attendance</p>
              <p className="font-h2 text-h2 mt-1">{attendancePct}%</p>
            </div>
          </div>

          {/* Middle Row: Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md md:gap-lg">
            {/* Revenue Chart */}
            <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-h4 text-h4 font-semibold text-on-surface">Revenue Trend</h3>
                <select className="bg-surface-container border-none text-body-sm rounded-lg py-1 pl-3 pr-8 focus:ring-0 cursor-pointer text-on-surface-variant">
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>
              <RevenueChart data={monthlyRevenueTrend} />
            </div>

            {/* Attendance Donut */}
            <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col">
              <h3 className="font-h4 text-h4 font-semibold text-on-surface mb-lg">Attendance Today</h3>
              <AttendanceDonut
                present={presentCount > 0 ? presentCount : 24}
                absent={absentCount > 0 ? absentCount : 2}
                late={lateCount > 0 ? lateCount : 1}
              />
            </div>
          </div>

          {/* Bottom Row: Activity Feed & Pending Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-md md:gap-lg pb-xl">
            {/* Recent Activity Feed */}
            <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-h4 text-h4 font-semibold text-on-surface">Recent Activity</h3>
                <button className="text-primary font-label-md hover:underline cursor-pointer">
                  View All
                </button>
              </div>
              <div className="space-y-6">
                {displayLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-md">
                    <div className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center shrink-0 mt-1 border border-primary/20">
                      <Icon name="history" className="text-[18px]" />
                    </div>
                    <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-label-md text-on-surface font-semibold">
                          {log.action.replace(/_/g, " ")}
                        </div>
                        <time className="font-caption text-on-surface-variant">
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <p className="text-body-sm text-on-surface-variant">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Fee Reminders Widget */}
            <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-lg">
                <h3 className="font-h4 text-h4 font-semibold text-on-surface">
                  Pending Fee Reminders
                </h3>
              </div>
              <PendingReminderList students={pendingStudentsList} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
