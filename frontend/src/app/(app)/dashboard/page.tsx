import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { AttendanceDonut } from "@/components/dashboard/AttendanceDonut";
import { GlobalSearch } from "@/components/layout/GlobalSearch";

type DashboardData = {
  totalStudents?: number;
  activeBatches?: number;
  feesCollectedThisMonth?: number;
  pendingFees?: number;
  today?: string;
  todayDhaka?: string;
  attendance?: { present: number; absent: number; late: number; percentage: number | null };
  pendingFeeRecords?: { studentId: string; studentName: string; amount: string; monthYear: string; status: string }[];
  batches?: { id: string; name: string; subject?: string | null; schedule?: string | null; teacher?: string | null }[];
  todaysClasses?: { id: string; title: string; batch: string; teacher: string; room?: string; time: string; status: string }[];
  recentStudents?: { id: string; rollNo?: string; name: string; status: string }[];
};

function MiniSparkline({ color }: { color: "blue" | "green" | "orange" | "purple" }) {
  const barColors = {
    blue: "bg-[#BFDBFE]",
    green: "bg-[#BBF7D0]",
    orange: "bg-[#FED7AA]",
    purple: "bg-[#E9D5FF]",
  };
  const heights = ["h-3", "h-4.5", "h-6", "h-7.5", "h-9"];

  return (
    <div className="flex items-end gap-1 h-9 shrink-0">
      {heights.map((h, i) => (
        <span key={i} className={`w-1.5 ${h} rounded-full ${barColors[color]}`} />
      ))}
    </div>
  );
}

export default async function OwnerDashboardPage() {
  const session = await auth();
  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AS";

  const data = await fetchApi("/api/v1/core/dashboard/kpi").catch(() => null) as DashboardData | null;

  // Honest production data: zero fake numbers
  const totalStudents = data?.totalStudents ?? 0;
  const activeBatches = data?.activeBatches ?? 0;
  const feesCollected = `৳ ${(data?.feesCollectedThisMonth ?? 0).toLocaleString("en-BD")}`;
  const outstandingFees = `৳ ${(data?.pendingFees ?? 0).toLocaleString("en-BD")}`;

  const cards = [
    {
      label: "Total Students",
      value: totalStudents.toLocaleString(),
      trend: "Enrolled in institute",
      trendType: "up",
      color: "blue" as const,
      icon: "group",
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#2563EB]",
      href: "/students",
    },
    {
      label: "Active Batches",
      value: activeBatches.toLocaleString(),
      trend: "Scheduled classes",
      trendType: "up",
      color: "green" as const,
      icon: "menu_book",
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#16A34A]",
      href: "/batches",
    },
    {
      label: "Fees Collected",
      value: feesCollected,
      trend: "This month",
      trendType: "up",
      color: "orange" as const,
      icon: "credit_card",
      iconBg: "bg-[#FFF7ED]",
      iconColor: "text-[#EA580C]",
      href: "/fees",
    },
    {
      label: "Outstanding Fees",
      value: outstandingFees,
      trend: "Pending / overdue",
      trendType: "danger",
      color: "purple" as const,
      icon: "schedule",
      iconBg: "bg-[#FAF5FF]",
      iconColor: "text-[#9333EA]",
      href: "/fees",
    },
  ];

  const todaysClasses = data?.todaysClasses || [];
  const recentStudents = data?.recentStudents || [];
  const pendingFees = data?.pendingFeeRecords || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#EAECF0] bg-white px-4 md:px-6">
        {/* Left: App Launcher, EduFlow Logo, Main Branch */}
        <div className="flex items-center gap-4 shrink-0">
          {/* 9-dot grid icon */}
          <button
            type="button"
            aria-label="App Launcher"
            className="flex h-9 w-9 items-center justify-center rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <circle cx="3" cy="3" r="1.5" />
              <circle cx="9" cy="3" r="1.5" />
              <circle cx="15" cy="3" r="1.5" />
              <circle cx="3" cy="9" r="1.5" />
              <circle cx="9" cy="9" r="1.5" />
              <circle cx="15" cy="9" r="1.5" />
              <circle cx="3" cy="15" r="1.5" />
              <circle cx="9" cy="15" r="1.5" />
              <circle cx="15" cy="15" r="1.5" />
            </svg>
          </button>

          {/* EduFlow Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1570EF] text-white shadow-2xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 4C5 2.89543 5.89543 2 7 2H11C12.1046 2 13 2.89543 13 4V9C13 10.1046 12.1046 11 11 11H7C5.89543 11 5 10.1046 5 9V4Z"
                  fill="white"
                />
                <path
                  d="M11 13C11 11.8954 11.8954 11 13 11H17C18.1046 11 19 11.8954 19 13V18C19 19.1046 18.1046 20 17 20H13C11.8954 20 11 19.1046 11 18V13Z"
                  fill="white"
                  fillOpacity="0.95"
                />
                <path
                  d="M5 13C5 11.8954 5.89543 11 7 11H9V18C9 19.1046 8.10457 20 7 20C5.89543 20 5 19.1046 5 18V13Z"
                  fill="white"
                  fillOpacity="0.8"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">EduFlow</span>
          </Link>

          {/* Main Branch Selector */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
            <svg
              className="w-4 h-4 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z" />
            </svg>
            <span>Main Branch</span>
            <Icon name="keyboard_arrow_down" className="text-base text-slate-400" />
          </div>
        </div>

        {/* Center: Search input with Ctrl+K shortcut */}
        <div className="mx-4 hidden max-w-[500px] flex-1 md:block">
          <GlobalSearch />
        </div>

        {/* Right: Notifications, Settings, Help, User Avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon name="notifications" className="text-xl" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#1570EF]" />
          </button>

          {/* Settings */}
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon name="settings" className="text-xl" />
          </Link>

          {/* Help */}
          <button
            type="button"
            aria-label="Help"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon name="help_outline" className="text-xl" />
          </button>

          {/* User Avatar with online indicator */}
          <div className="relative ml-1 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0086C9] text-xs font-bold text-white shadow-2xs">
              {userInitials}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#12B76A] ring-2 ring-white" />
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <OwnerSidebar activeTab="dashboard" hideLogo={true} />

        {/* Dashboard Content Container */}
        <main className="flex-1 min-w-0 p-5 md:p-7 space-y-6 overflow-y-auto">
          {/* Page Heading and Action Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 2L2 7h20L12 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">
                  Institute overview and key information at a glance.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* + Add Student Split Button */}
              <div className="inline-flex rounded-lg shadow-2xs overflow-hidden bg-[#0F5FC2] text-white">
                <Link
                  href="/students?action=new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium hover:bg-[#0D51A6] transition-colors"
                >
                  <Icon name="add" className="text-base" />
                  <span>Add Student</span>
                </Link>
                <div className="w-px bg-white/20 my-1" />
                <button
                  type="button"
                  aria-label="Add Student options"
                  className="px-2 py-2 hover:bg-[#0D51A6] transition-colors flex items-center justify-center"
                >
                  <Icon name="keyboard_arrow_down" className="text-base" />
                </button>
              </div>

              {/* Mark Attendance Button */}
              <Link
                href="/attendance"
                className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
              >
                <Icon name="calendar_today" className="text-base text-slate-500" />
                <span>Mark Attendance</span>
              </Link>

              {/* Record Fee Button */}
              <Link
                href="/fees"
                className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
              >
                <Icon name="credit_card" className="text-base text-slate-500" />
                <span>Record Fee</span>
              </Link>

              {/* Date Indicator Badge */}
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-2xs">
                <Icon name="calendar_today" className="text-base text-slate-500" />
                <span>{data?.todayDhaka || "Today"}</span>
              </div>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <section
            aria-label="Key Performance Indicators"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="group rounded-xl border border-[#EAECF0] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] transition hover:border-[#B2DDFF] hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  {/* Left Icon Container */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor} shrink-0`}
                  >
                    <Icon name={card.icon} className="text-2xl" />
                  </div>

                  {/* Middle Data */}
                  <div className="ml-4 flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#475467]">{card.label}</p>
                    <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 truncate">
                      {card.value}
                    </p>
                    <div
                      className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                        card.trendType === "danger" ? "text-[#D92D20]" : "text-[#16A34A]"
                      }`}
                    >
                      <span className="text-sm font-bold">↗</span>
                      <span>{card.trend}</span>
                    </div>
                  </div>

                  {/* Right Sparkline Bars */}
                  <MiniSparkline color={card.color} />
                </div>
              </Link>
            ))}
          </section>

          {/* Middle Row: Today's Classes & Attendance Summary */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* Today's Classes */}
            <div className="xl:col-span-7 rounded-xl border border-[#EAECF0] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="calendar_today" className="text-lg text-slate-700" />
                    <h2 className="font-bold text-base text-slate-900">Today&apos;s Classes</h2>
                  </div>
                  <Link
                    href="/batches"
                    className="text-sm font-semibold text-[#1570EF] hover:text-[#0D51A6] transition-colors"
                  >
                    View all
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#F2F4F7] text-xs font-semibold text-[#475467]">
                        <th className="py-2.5 pr-4 font-semibold text-[#475467]">Time</th>
                        <th className="py-2.5 px-4 font-semibold text-[#475467]">Class</th>
                        <th className="py-2.5 px-4 font-semibold text-[#475467]">Teacher</th>
                        <th className="py-2.5 px-4 font-semibold text-[#475467]">Room</th>
                        <th className="py-2.5 pl-4 font-semibold text-[#475467]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F2F4F7] text-sm">
                      {todaysClasses.length > 0 ? (
                        todaysClasses.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 pr-4 text-xs font-normal text-[#475467] whitespace-nowrap">
                              {item.time}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="w-1 h-7 bg-[#1570EF] rounded-full mr-2.5 shrink-0" />
                                <div>
                                  <p className="font-semibold text-slate-900 text-xs md:text-sm leading-tight">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-[#475467] mt-0.5">{item.batch}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs md:text-sm text-slate-800 font-normal whitespace-nowrap">
                              {item.teacher}
                            </td>
                            <td className="py-3.5 px-4 text-xs md:text-sm text-[#475467] font-normal whitespace-nowrap">
                              {item.room || "Room 101"}
                            </td>
                            <td className="py-3.5 pl-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#1D4ED8] border border-[#BFDBFE]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                                {item.status || "Upcoming"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <Icon name="event_busy" className="text-3xl text-slate-400" />
                              <p className="text-sm font-medium text-slate-800">No classes scheduled for today</p>
                              <p className="text-xs text-slate-500 max-w-sm">
                                Batches configured with schedules for {data?.todayDhaka?.split(",")[0] || "today"} will appear here automatically.
                              </p>
                              <Link
                                href="/batches"
                                className="mt-2 text-xs font-semibold text-[#1570EF] hover:underline"
                              >
                                View all batches &rarr;
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="xl:col-span-5 rounded-xl border border-[#EAECF0] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="bar_chart" className="text-lg text-slate-700" />
                  <h2 className="font-bold text-base text-slate-900">Attendance Summary</h2>
                </div>

                <AttendanceDonut
                  present={data?.attendance?.present ?? 0}
                  absent={data?.attendance?.absent ?? 0}
                  late={data?.attendance?.late ?? 0}
                  totalStudents={totalStudents}
                />
              </div>
            </div>
          </section>

          {/* Bottom Row: Recent Students & Pending Fees */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Recent Students */}
            <div className="rounded-xl border border-[#EAECF0] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="group" className="text-lg text-slate-700" />
                  <h2 className="font-bold text-base text-slate-900">Recent Students</h2>
                </div>
                <Link
                  href="/students"
                  className="text-sm font-semibold text-[#1570EF] hover:text-[#0D51A6] transition-colors"
                >
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F2F4F7] text-xs font-semibold text-[#475467]">
                      <th className="py-2.5 px-3 font-semibold text-[#475467]">Roll</th>
                      <th className="py-2.5 px-3 font-semibold text-[#475467]">Name</th>
                      <th className="py-2.5 px-3 font-semibold text-[#475467]">Status</th>
                      <th className="py-2.5 pl-2 w-8 font-normal"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7] text-sm">
                    {recentStudents.length > 0 ? (
                      recentStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 text-xs md:text-sm text-slate-600 font-normal whitespace-nowrap">
                            {st.rollNo || st.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 border border-slate-200">
                                {st.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-xs md:text-sm text-slate-900">
                                {st.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {st.status === "ACTIVE" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-medium text-[#15803D] border border-[#A7F3D0]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#12B76A]" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-medium text-[#B91C1C] border border-[#FECACA]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#F04438]" />
                                {st.status || "Inactive"}
                              </span>
                            )}
                          </td>
                          <td className="py-3 pl-2 text-right whitespace-nowrap">
                            <Link
                              href="/students"
                              aria-label={`View ${st.name}`}
                              className="p-1 text-slate-400 hover:text-slate-600 rounded inline-block"
                            >
                              <Icon name="arrow_forward" className="text-base" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Icon name="group" className="text-2xl text-slate-400" />
                            <p className="text-sm font-medium text-slate-700">No students enrolled yet</p>
                            <p className="text-xs text-slate-500">Admit students to see them in this directory.</p>
                            <Link href="/students?action=new" className="mt-2 text-xs font-medium text-[#1570EF] hover:underline">Add First Student &rarr;</Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Fees */}
            <div className="rounded-xl border border-[#EAECF0] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="credit_card" className="text-lg text-slate-700" />
                  <h2 className="font-bold text-base text-slate-900">Pending Fees</h2>
                </div>
                <Link
                  href="/fees"
                  className="text-sm font-semibold text-[#1570EF] hover:text-[#0D51A6] transition-colors"
                >
                  View all
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#F2F4F7] text-xs font-semibold text-[#475467]">
                      <th className="py-2.5 px-3 font-semibold text-[#475467]">Student</th>
                      <th className="py-2.5 px-3 font-semibold text-[#475467]">Due Month</th>
                      <th className="py-2.5 px-3 font-semibold text-[#475467]">Amount</th>
                      <th className="py-2.5 px-3 font-semibold text-[#475467]">Status</th>
                      <th className="py-2.5 pl-2 w-8 font-normal"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F4F7] text-sm">
                    {pendingFees.length > 0 ? (
                      pendingFees.map((fee, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-semibold text-xs md:text-sm text-slate-900 whitespace-nowrap">
                            {fee.studentName}
                          </td>
                          <td className="py-3 px-3 text-xs md:text-sm text-[#475467] font-normal whitespace-nowrap">
                            {fee.monthYear || "Current"}
                          </td>
                          <td className="py-3 px-3 font-semibold text-xs md:text-sm text-slate-900 whitespace-nowrap">
                            ৳ {fee.amount}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {fee.status === "OVERDUE" ? (
                              <span className="inline-flex items-center justify-center rounded-full bg-[#FEF2F2] px-3 py-0.5 text-xs font-medium text-[#B91C1C] border border-[#FECACA]">
                                Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center rounded-full bg-[#FEF3C7] px-3 py-0.5 text-xs font-medium text-[#B45309] border border-[#FDE68A]">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 pl-2 text-right whitespace-nowrap">
                            <Link
                              href="/fees"
                              className="p-1 text-slate-400 hover:text-slate-600 rounded inline-block"
                            >
                              <Icon name="arrow_forward" className="text-base" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Icon name="check_circle" className="text-2xl text-emerald-500" />
                            <p className="text-sm font-medium text-slate-700">All fees up to date</p>
                            <p className="text-xs text-slate-500">No pending or overdue fee records for this institute.</p>
                            <Link href="/fees" className="mt-2 text-xs font-medium text-[#1570EF] hover:underline">Open Fees &rarr;</Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
