import React, { Suspense } from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { ResultsEntryClient, StudentRow, BatchOption } from "@/components/results/ResultsEntryClient";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { fetchApi } from "@/lib/api";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

interface ResultsPageProps {
  searchParams: Promise<{
    batchId?: string;
    examName?: string;
    subject?: string;
  }>;
}

async function ResultsContent({ searchParams }: { searchParams: Promise<{ batchId?: string; examName?: string; subject?: string }> }) {
  const { batchId: paramBatchId, examName: paramExamName, subject: paramSubject } = await searchParams;

  const queryParams = new URLSearchParams();
  if (paramBatchId) queryParams.set("batchId", paramBatchId);
  if (paramExamName) queryParams.set("examName", paramExamName);
  if (paramSubject) queryParams.set("subject", paramSubject);

  let data: any;
  try {
    data = await fetchApi(`/api/v1/results/init?${queryParams.toString()}`, {
      cache: "no-store",
    });
  } catch (err: any) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Error loading results: {err.message}
      </div>
    );
  }

  const { batches = [], selectedBatchId = "", selectedExamName = "", selectedSubject = "", studentBatches = [], existingResults = [] } = data || {};

  const resultMap = new Map<string, any>();
  existingResults.forEach((r: any) => {
    resultMap.set(r.studentId, r.marksObtained);
  });

  const studentRows: StudentRow[] = studentBatches.map((sb: any) => ({
    studentId: sb.student.id,
    fullName: sb.student.fullName,
    rollNo: sb.student.rollNo,
    photoUrl: sb.student.photoUrl,
    initialMarks: resultMap.get(sb.student.id) ?? null,
  }));

  const batchOptions: BatchOption[] = batches.map((b: any) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <ResultsEntryClient
      batches={batchOptions}
      initialBatchId={selectedBatchId}
      students={studentRows}
      initialExamName={selectedExamName}
      initialSubject={selectedSubject}
    />
  );
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!instituteId || !userId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Institute ID missing.
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      {/* Role-based SideNavBar */}
      {role === "TEACHER" ? (
        <TeacherSidebar activeTab="results" />
      ) : role === "STUDENT" ? (
        <StudentSidebar activeTab="results" />
      ) : (
        <OwnerSidebar activeTab="results" />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md w-full max-w-md">
            <div className="md:hidden flex items-center">
              <h1 className="text-xl font-bold text-primary">EduFlow</h1>
            </div>
            <div className="relative w-full hidden md:block">
              <Icon
                name="search"
                className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"
              />
              <input
                className="w-full pl-[36px] pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm font-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                placeholder="Search..."
                type="text"
              />
            </div>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-md md:p-xl relative z-10">
          <Suspense fallback={<ContentSkeleton />}>
            <ResultsContent searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
