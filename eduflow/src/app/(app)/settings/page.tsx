import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { InstituteProfileClient } from "@/components/settings/InstituteProfileClient";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";

export default async function SettingsInstituteProfilePage() {
  const session = await auth();
  const instituteId = session?.user?.instituteId;

  if (!instituteId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Session missing.
      </div>
    );
  }

  // Fetch Institute record
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  if (!institute) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Institute record not found.
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <OwnerSidebar activeTab="settings" instituteName={institute?.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Settings</h2>
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

        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-margin md:p-xl flex gap-gutter">
          <SettingsSubNav />
          <InstituteProfileClient institute={institute} />
        </main>
      </div>
    </div>
  );
}
