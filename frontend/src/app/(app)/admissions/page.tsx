import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { AdmissionsManagerClient } from "@/components/admissions/AdmissionsManagerClient";

export default async function AdmissionsPage() {
  const session = await auth();
  if (session?.user?.role !== "OWNER") redirect("/login");

  const inquiries = await fetchApi("/api/v1/inquiries", { cache: "no-store" }).catch(() => []) || [];
  const publicShowcase = session?.user?.instituteId
    ? await fetchApi(`/api/v1/institutes/public/${session.user.instituteId}`, { cache: "no-store" }).catch(() => null)
    : null;

  const initialSettings = {
    heroHeadline: publicShowcase?.heroHeadline || `Welcome to ${session.user.name || "Our Institute"}`,
    heroSubhead: publicShowcase?.heroSubhead || "Dedicated academic mentoring & coaching in Bangladesh",
    heroImageUrl: publicShowcase?.heroImageUrl || "/images/hero.png",
    aboutText: publicShowcase?.aboutText || "",
    contactPhone: publicShowcase?.phone || "",
    contactEmail: publicShowcase?.email || "",
    isPublished: publicShowcase?.isPublished ?? true,
    instituteId: session.user.instituteId,
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#16191f]">
      <OwnerSidebar activeTab="admissions" instituteName={session.user.name || "Institute"} />
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

        <main className="p-4 md:p-7 max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">
              Institute Website & Admissions
            </h1>
            <p className="mt-1 text-sm text-[#526071]">
              Manage prospective student inquiries submitted through your website and configure your public showcase.
            </p>
          </div>

          <AdmissionsManagerClient initialInquiries={inquiries} initialSettings={initialSettings} />
        </main>
      </div>
    </div>
  );
}
