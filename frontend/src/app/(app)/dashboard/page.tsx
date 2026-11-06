import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { AttendanceDonut } from "@/components/dashboard/AttendanceDonut";

type DashboardData = {
  totalStudents: number;
  activeBatches: number;
  feesCollectedThisMonth: number;
  pendingFees: number;
  attendance: { present: number; absent: number; late: number; percentage: number | null };
  pendingFeeRecords: { studentId: string; studentName: string; amount: string; monthYear: string; status: string }[];
  batches: { id: string; name: string; subject?: string | null; schedule?: string | null; teacher?: string | null }[];
  recentStudents: { id: string; rollNo: string; name: string; status: string }[];
};

const money = (value: number) => `৳ ${Number(value || 0).toLocaleString("en-BD")}`;

export default async function OwnerDashboardPage() {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  if (!instituteId) return <div className="p-8 text-center text-red-700">Your account is not linked to an institute.</div>;

  const data = await fetchApi("/api/v1/core/dashboard/kpi").catch(() => null) as DashboardData | null;
  const kpi = data ?? { totalStudents: 0, activeBatches: 0, feesCollectedThisMonth: 0, pendingFees: 0, attendance: { present: 0, absent: 0, late: 0, percentage: null }, pendingFeeRecords: [], batches: [], recentStudents: [] };
  const cards = [
    { label: "Total students", value: data ? kpi.totalStudents.toLocaleString() : "—", icon: "group", color: "blue", href: "/students" },
    { label: "Batches", value: data ? kpi.activeBatches.toLocaleString() : "—", icon: "menu_book", color: "green", href: "/batches" },
    { label: "Fees collected this month", value: data ? money(kpi.feesCollectedThisMonth) : "—", icon: "payments", color: "orange", href: "/fees" },
    { label: "Outstanding fees", value: data ? money(kpi.pendingFees) : "—", icon: "schedule", color: "purple", href: "/fees" },
  ];

  return <div className="flex min-h-screen bg-[#f5f7fa] text-[#16191f]">
    <OwnerSidebar activeTab="dashboard" instituteName={session.user.name || "Institute"} />
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-[#d9dee8] bg-white px-4 md:px-7">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" aria-label="EduFlow dashboard" className="block"><Image src="/images/eduflow-logo.png" alt="EduFlow" width={145} height={49} priority className="h-9 w-auto object-contain" /></Link>
          <div className="hidden h-8 border-l border-[#d9dee8] md:block" />
          <div className="flex items-center gap-2 text-sm font-medium"><Icon name="account_balance" className="text-xl text-[#3d4858]" />{session.user.name || "Institute"}</div>
        </div>
        <div className="mx-5 hidden max-w-[600px] flex-1 md:block"><label className="relative block"><Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#697586]" /><input aria-label="Search students, batches, teachers or pages" placeholder="Search students, batches, teachers, or pages" className="h-10 w-full rounded-md border border-[#c9d1df] bg-[#f8f9fc] pl-10 pr-4 text-sm outline-none focus:border-[#0f6cbd] focus:ring-2 focus:ring-blue-100" /></label></div>
        <div className="flex items-center gap-2"><Link href="/settings" aria-label="Settings" className="rounded-md p-2 text-[#344054] hover:bg-slate-100"><Icon name="settings" className="text-xl" /></Link><ProfileDropdown userName={session.user.name || "Account"} userEmail={session.user.email || undefined} userRole={session.user.role || "OWNER"} avatarUrl={session.user.image} onSignOut={async () => { "use server"; await signOut({ redirectTo: "/login" }); }} /></div>
      </header>
      <main className="space-y-5 p-4 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-[28px] font-semibold tracking-tight">Dashboard</h1><p className="mt-1 text-sm text-[#526071]">Institute overview and key information at a glance.</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/students?action=new" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0f6cbd] px-4 text-sm font-semibold text-white hover:bg-[#115ea3]"><Icon name="add" />Add student</Link><Link href="/attendance" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#c9d1df] bg-white px-4 text-sm font-medium hover:bg-slate-50"><Icon name="calendar_today" />Mark attendance</Link><Link href="/fees" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#c9d1df] bg-white px-4 text-sm font-medium hover:bg-slate-50"><Icon name="payments" />Record fee</Link></div>
        </div>

        <section aria-label="Institute summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => <Link key={card.label} href={card.href} className="group rounded-lg border border-[#dce1e9] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,.06)] transition hover:border-[#9abfe5]">
            <div className="flex items-center justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color === "blue" ? "bg-blue-50 text-blue-600" : card.color === "green" ? "bg-green-50 text-green-600" : card.color === "orange" ? "bg-orange-50 text-orange-600" : "bg-purple-50 text-purple-600"}`}><Icon name={card.icon} className="text-2xl" /></span></div>
            <p className="mt-4 text-sm text-[#526071]">{card.label}</p><p className="mt-1 text-[25px] font-semibold tracking-tight">{card.value}</p>
          </Link>)}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-[#dce1e9] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,.06)]">
            <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="menu_book" className="text-xl" />Batches</h2><Link href="/batches" className="text-sm font-medium text-[#0f6cbd]">View all</Link></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-[#f1f3f7] text-xs text-[#344054]"><tr><th className="px-3 py-2 font-semibold">Batch</th><th className="px-3 py-2 font-semibold">Subject</th><th className="px-3 py-2 font-semibold">Schedule</th><th className="px-3 py-2 font-semibold">Teacher</th></tr></thead><tbody>{kpi.batches.map((batch) => <tr key={batch.id} className="border-b border-[#e6eaf0]"><td className="px-3 py-3 font-medium">{batch.name}</td><td className="px-3 py-3">{batch.subject || "—"}</td><td className="px-3 py-3">{batch.schedule || "Not set"}</td><td className="px-3 py-3">{batch.teacher || "Unassigned"}</td></tr>)}{!kpi.batches.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-[#697586]">{data ? "No batches have been created yet." : "Batch data could not be loaded."}</td></tr>}</tbody></table></div>
          </div>
          <div className="rounded-lg border border-[#dce1e9] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,.06)]"><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Icon name="bar_chart" className="text-xl" />Attendance summary</h2>{!data ? <div className="flex min-h-[230px] items-center justify-center text-sm text-[#697586]">Attendance data could not be loaded.</div> : kpi.attendance.percentage === null ? <div className="flex min-h-[230px] items-center justify-center text-center text-sm text-[#697586]">No attendance has been recorded today.<br />Mark attendance to see the summary.</div> : <AttendanceDonut present={kpi.attendance.present} absent={kpi.attendance.absent} late={kpi.attendance.late} />}</div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-[#dce1e9] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,.06)]"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="group" className="text-xl" />Recent students</h2><Link href="/students" className="text-sm font-medium text-[#0f6cbd]">View all</Link></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f1f3f7] text-xs"><tr><th className="px-3 py-2">ID</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Status</th></tr></thead><tbody>{kpi.recentStudents.map((student) => <tr key={student.id} className="border-b border-[#e6eaf0]"><td className="px-3 py-3">{student.rollNo}</td><td className="px-3 py-3 font-medium">{student.name}</td><td className="px-3 py-3">{student.status}</td></tr>)}{!kpi.recentStudents.length && <tr><td colSpan={3} className="px-3 py-8 text-center text-[#697586]">{data ? "No student records yet." : "Student data could not be loaded."}</td></tr>}</tbody></table></div></div>
          <div className="rounded-lg border border-[#dce1e9] bg-white p-5 shadow-[0_1px_3px_rgba(16,24,40,.06)]"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="credit_card" className="text-xl" />Pending fees</h2><Link href="/fees" className="text-sm font-medium text-[#0f6cbd]">View all</Link></div>{kpi.pendingFeeRecords.length ? <div className="divide-y divide-[#e6eaf0]">{kpi.pendingFeeRecords.map((fee, index) => <div key={`${fee.studentId}-${index}`} className="flex items-center justify-between gap-3 py-3 text-sm"><div className="min-w-0"><span className="block truncate font-medium">{fee.studentName}</span><span className="text-xs text-[#697586]">{fee.monthYear} · {fee.status.toLowerCase()}</span></div><span className="shrink-0 font-medium">৳ {fee.amount}</span></div>)}</div> : <p className="flex min-h-32 items-center justify-center text-sm text-[#697586]">{data ? "No pending fee records." : "Fee data could not be loaded."}</p>}</div>
        </section>
      </main>
    </div>
  </div>;
}
