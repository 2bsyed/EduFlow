import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { ResultsEntryClient, StudentRow, BatchOption } from "@/components/results/ResultsEntryClient";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";

interface ResultsPageProps {
  searchParams: Promise<{
    batchId?: string;
    examName?: string;
    subject?: string;
  }>;
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

  const { batchId: paramBatchId, examName: paramExamName, subject: paramSubject } = await searchParams;

  // Fetch Institute details
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  let teacherId: string | undefined;
  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) {
      return (
        <div className="p-margin text-center font-body-md text-error">
          Unauthorized access: Teacher record not found.
        </div>
      );
    }
    teacherId = teacher.id;
  } else if (role === "STUDENT") {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Students cannot view batch results.
      </div>
    );
  }

  // Fetch Batches for this institute
  const batches = await prisma.batch.findMany({
    where: { 
      instituteId,
      ...(role === "TEACHER" ? { teacherId } : {})
    },
    select: { id: true, name: true, subject: true },
    orderBy: { name: "asc" },
  });

  if (paramBatchId) {
    const isAuthorized = batches.some((b) => b.id === paramBatchId);
    if (!isAuthorized) {
      return (
        <div className="p-margin text-center font-body-md text-error">
          {role === "TEACHER" 
            ? "Unauthorized access: You are not assigned to this batch." 
            : "Batch not found."}
        </div>
      );
    }
  }

  const selectedBatchId = paramBatchId || batches[0]?.id || "";
  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const selectedExamName = paramExamName || "First Term 2024";
  const selectedSubject = paramSubject || selectedBatch?.subject || "Mathematics";

  // Fetch Enrolled Roster for selectedBatchId
  const studentBatches = selectedBatchId
    ? await prisma.studentBatch.findMany({
        where: { instituteId, batchId: selectedBatchId },
        include: { student: true },
        orderBy: { student: { rollNo: "asc" } },
      })
    : [];

  // Fetch Existing Results for selectedBatchId, selectedExamName, and selectedSubject
  const existingResults = selectedBatchId
    ? await prisma.result.findMany({
        where: {
          instituteId,
          batchId: selectedBatchId,
          examName: selectedExamName,
          subject: selectedSubject,
        },
      })
    : [];

  const resultMap = new Map<string, number>();
  existingResults.forEach((r) => {
    resultMap.set(r.studentId, Number(r.marksObtained));
  });

  const studentRows: StudentRow[] = studentBatches.map((sb) => ({
    studentId: sb.student.id,
    fullName: sb.student.fullName,
    rollNo: sb.student.rollNo,
    photoUrl: sb.student.photoUrl,
    initialMarks: resultMap.get(sb.student.id) ?? null,
  }));

  const batchOptions: BatchOption[] = batches.map((b) => ({
    id: b.id,
    name: b.name,
  }));

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      {/* Role-based SideNavBar */}
      {role === "TEACHER" ? (
        <TeacherSidebar activeTab="results" instituteName={institute?.name || "EduFlow"} />
      ) : role === "STUDENT" ? (
        <StudentSidebar activeTab="results" instituteName={institute?.name || "EduFlow"} />
      ) : (
        <OwnerSidebar activeTab="results" instituteName={institute?.name || "EduFlow"} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md w-full max-w-md">
            <div className="md:hidden flex items-center">
              <Image src="/images/logo.jpg" alt="EduFlow logo" width={100} height={32} className="object-contain -ml-2" />
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
          <ResultsEntryClient
            batches={batchOptions}
            initialBatchId={selectedBatchId}
            students={studentRows}
            initialExamName={selectedExamName}
            initialSubject={selectedSubject}
          />
        </main>
      </div>
    </div>
  );
}
