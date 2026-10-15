import { fetchApi } from "@/lib/api";
import React, { Suspense } from "react";
import { auth, signOut } from "@/lib/auth/auth";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

async function TeacherProfileContent({ instituteId, session }: { instituteId: string; session: any }) {
  const [teacher, institute] = await Promise.all([
    fetchApi("/api/v1/teachers/me").catch(() => null),
    fetchApi(`/api/v1/institutes/${instituteId}`).catch(() => null),
  ]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm space-y-lg">
      <div className="flex items-center gap-lg border-b border-surface-variant pb-lg">
        <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary font-h1 font-bold flex items-center justify-center text-3xl">
          {teacher?.user?.name?.[0] || session?.user?.name?.[0] || "T"}
        </div>
        <div>
          <h1 className="font-h2 text-h2 text-on-surface font-bold">
            {teacher?.user?.name || session?.user?.name || "Kamrul Hasan"}
          </h1>
          <p className="font-body-md text-body-md text-primary font-semibold mt-xs">
            Faculty Instructor — {teacher?.subject || "Higher Mathematics"}
          </p>
          <p className="font-caption text-caption text-on-surface-variant mt-xs">
            {institute?.name || "EduFlow Coaching"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg font-body-md text-body-md">
        <div className="space-y-sm">
          <span className="font-label-md text-caption text-on-surface-variant block uppercase tracking-wider font-bold">
            Contact Information
          </span>
          <div className="flex items-center gap-sm">
            <Icon name="mail" className="text-primary text-[20px]" />
            <span>{teacher?.user?.email || session?.user?.email || "kamrul@eduflow.bd"}</span>
          </div>
          <div className="flex items-center gap-sm">
            <Icon name="call" className="text-primary text-[20px]" />
            <span>{teacher?.phone || "+880 1711 223344"}</span>
          </div>
        </div>

        <div className="space-y-sm">
          <span className="font-label-md text-caption text-on-surface-variant block uppercase tracking-wider font-bold">
            Academic Assignment
          </span>
          <div className="flex items-center gap-sm">
            <Icon name="auto_stories" className="text-secondary text-[20px]" />
            <span>Primary Subject: <strong>{teacher?.subject || "Higher Mathematics"}</strong></span>
          </div>
          <div className="flex items-center gap-sm">
            <Icon name="groups" className="text-secondary text-[20px]" />
            <span>Assigned Batches: <strong>{teacher?.batches?.length || 1} Batches</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TeacherProfilePage() {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  const userId = session?.user?.id;

  if (!instituteId || !userId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Session missing.
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <TeacherSidebar activeTab="profile" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Teacher Portal</h2>
          </div>
          <div className="flex items-center gap-md shrink-0 flex-nowrap">
            <NotificationBell />
            <LanguageToggle />
            <ProfileDropdown
              userName={session?.user?.name || "Kamrul Hasan"}
              userEmail={session?.user?.email || "teacher@eduflow.bd"}
              userRole="TEACHER"
              avatarUrl={session?.user?.image}
              onSignOut={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-4xl mx-auto w-full space-y-lg">
          <Suspense fallback={<ContentSkeleton />}>
            <TeacherProfileContent instituteId={instituteId} session={session} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
