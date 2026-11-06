import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { TeacherCreateForm } from "@/components/teachers/TeacherCreateForm";
import { Icon } from "@/components/ui/Icon";

export default async function TeachersPage() {
  const session = await auth();
  if (session?.user?.role !== "OWNER") redirect("/login");
  const teachers: { id: string; subject: string; phone?: string | null; batchCount: number; user: { name: string; email?: string | null } }[] = await fetchApi("/api/v1/teachers/", { cache: "no-store" }).catch(() => []);

  return <div className="flex min-h-screen bg-[#f5f7fa] text-[#16191f]"><OwnerSidebar activeTab="teachers" instituteName={session.user.name || "Institute"} /><div className="min-w-0 flex-1">
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-[#d9dee8] bg-white px-4 md:px-7"><div className="flex items-center gap-5"><Link href="/dashboard" aria-label="EduFlow dashboard"><Image src="/images/eduflow-logo.png" alt="EduFlow" width={145} height={49} className="h-9 w-auto object-contain" /></Link><span className="border-l border-[#d9dee8] pl-4 text-sm font-medium">{session.user.name || "Institute"}</span></div><ProfileDropdown userName={session.user.name || "Account"} userEmail={session.user.email || undefined} userRole={session.user.role || "OWNER"} avatarUrl={session.user.image} onSignOut={async () => { "use server"; await signOut({ redirectTo: "/login" }); }} /></header>
    <main className="space-y-5 p-4 md:p-7"><div><h1 className="text-[28px] font-semibold tracking-tight">Teachers</h1><p className="mt-1 text-sm text-[#526071]">Manage teacher accounts and see their assigned batch count.</p></div><TeacherCreateForm />
      <section className="overflow-hidden rounded-lg border border-[#dce1e9] bg-white shadow-[0_1px_3px_rgba(16,24,40,.06)]"><div className="border-b border-[#e6eaf0] px-5 py-4"><h2 className="font-semibold">Teacher directory</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-[#f1f3f7] text-xs text-[#344054]"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Batches</th></tr></thead><tbody>{teachers.map((teacher) => <tr key={teacher.id} className="border-t border-[#e6eaf0]"><td className="px-5 py-3 font-medium">{teacher.user.name}</td><td className="px-5 py-3">{teacher.user.email || "—"}</td><td className="px-5 py-3">{teacher.subject}</td><td className="px-5 py-3">{teacher.phone || "—"}</td><td className="px-5 py-3">{teacher.batchCount}</td></tr>)}{!teachers.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-[#697586]"><Icon name="person" className="mb-2 block text-2xl" />No teacher accounts yet.</td></tr>}</tbody></table></div></section>
    </main>
  </div></div>;
}
