import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { SettingsSubNav } from "@/components/settings/SettingsSubNav";
import { LanguageSettingsClient } from "@/components/settings/LanguageSettingsClient";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";

export default async function SettingsLanguagePage() {
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
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      <OwnerSidebar activeTab="settings" instituteName={institute.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Settings</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container cursor-pointer">
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <LanguageToggle />
            <div className="flex items-center gap-sm ml-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md font-bold">
                {session?.user?.name?.[0] || "A"}
              </div>
              <span className="font-label-md hidden lg:block text-on-surface">
                {session?.user?.name || "Admin"}
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

        {/* Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-margin md:p-xl flex gap-gutter">
          <SettingsSubNav />
          <LanguageSettingsClient currentLanguage={institute.defaultLanguage || "en"} />
        </main>
      </div>
    </div>
  );
}
