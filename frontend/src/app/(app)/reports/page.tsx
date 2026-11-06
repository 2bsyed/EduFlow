import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ReportsClient } from "@/components/reports/ReportsClient";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { Suspense } from "react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.instituteId || session.user.role !== "OWNER") redirect("/dashboard");
  const [fees, expenses] = await Promise.all([
    fetchApi("/api/v1/fees/", { cache: "no-store" }).catch(() => []),
    fetchApi("/api/v1/expenses/", { cache: "no-store" }).catch(() => []),
  ]);
  return <div className="flex h-screen overflow-hidden bg-surface text-on-surface"><OwnerSidebar activeTab="reports" instituteName={session.user.name || "Institute"} /><div className="flex min-w-0 flex-1 flex-col"><header className="flex h-16 shrink-0 items-center justify-between border-b border-outline-variant bg-white px-5"><Link href="/dashboard" className="flex items-center"><Image src="/images/eduflow-logo.png" alt="EduFlow" width={130} height={44} className="h-8 w-auto object-contain" /></Link><div className="flex items-center gap-3"><NotificationBell /><LanguageToggle /><ProfileDropdown userName={session.user.name || "Owner"} userEmail={session.user.email || undefined} userRole={session.user.role} avatarUrl={session.user.image} onSignOut={async () => { "use server"; await signOut({ redirectTo: "/login" }); }} /></div></header><div className="flex-1 overflow-y-auto"><Suspense fallback={<ContentSkeleton />}><ReportsClient fees={Array.isArray(fees) ? fees : []} expenses={Array.isArray(expenses) ? expenses : []} /></Suspense></div></div></div>;
}
