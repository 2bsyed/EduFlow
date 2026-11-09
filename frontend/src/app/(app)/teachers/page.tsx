import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { TeacherCreateForm } from "@/components/teachers/TeacherCreateForm";
import { TeacherDirectoryClient, TeacherItem } from "@/components/teachers/TeacherDirectoryClient";

export default async function TeachersPage() {
  const session = await auth();
  if (session?.user?.role !== "OWNER") redirect("/login");
  const teachers: TeacherItem[] = await fetchApi("/api/v1/teachers/", { cache: "no-store" }).catch(() => []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#16191f]">
      <OwnerSidebar activeTab="teachers" instituteName={session.user.name || "Institute"} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-[#d9dee8] bg-white px-4 md:px-7">
          <div className="flex items-center gap-5">
            <Link href="/dashboard" aria-label="EduFlow dashboard">
              <Image src="/images/eduflow-logo.png" alt="EduFlow" width={145} height={49} className="h-9 w-auto object-contain" />
            </Link>
            <span className="border-l border-[#d9dee8] pl-4 text-sm font-medium text-slate-700">
              {session.user.name || "Institute"}
            </span>
          </div>
          <ProfileDropdown
            userName={session.user.name || "Account"}
            userEmail={session.user.email || undefined}
            userRole={session.user.role || "OWNER"}
            avatarUrl={session.user.image}
            onSignOut={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          />
        </header>
        <main className="space-y-6 p-4 md:p-7 max-w-7xl mx-auto">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Teachers</h1>
            <p className="mt-1 text-sm text-[#526071]">
              Manage teacher accounts, assign subjects, view schedules, and manage active status.
            </p>
          </div>
          <TeacherCreateForm />
          <TeacherDirectoryClient initialTeachers={teachers} />
        </main>
      </div>
    </div>
  );
}
