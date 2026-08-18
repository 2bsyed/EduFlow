import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { NotificationBell } from "@/components/ui/NotificationBell";

interface BatchDetailPageProps {
  params: Promise<{
    batchId: string;
  }>;
}

export default async function TeacherBatchDetailPage({ params }: BatchDetailPageProps) {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!instituteId || !userId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Session missing.
      </div>
    );
  }

  const { batchId } = await params;

  // Strict Data-Layer Access Enforcement:
  // If user is a TEACHER, verify that this batch belongs to them.
  let batchWhere: any = { id: batchId, instituteId };
  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      return (
        <div className="p-margin text-center font-body-md text-error">
          Teacher profile not found.
        </div>
      );
    }
    batchWhere.teacherId = teacher.id;
  }

  const batch = await prisma.batch.findFirst({
    where: batchWhere,
    include: {
      studentBatches: {
        include: {
          student: true,
        },
        orderBy: { student: { rollNo: "asc" } },
      },
      attendances: true,
      results: true,
    },
  });

  if (!batch) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Batch not found or unauthorized access.
      </div>
    );
  }

  // Fetch Institute details
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      <TeacherSidebar activeTab="batches" instituteName={institute?.name || "EduFlow"} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Teacher Portal</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container cursor-pointer">
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <LanguageToggle />
            <div className="flex items-center gap-sm ml-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md font-bold">
                {session?.user?.name?.[0] || "T"}
              </div>
              <span className="font-label-md hidden lg:block text-on-surface">
                {session?.user?.name || "Teacher"}
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
        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full">
          {/* Breadcrumbs & Header */}
          <div className="mb-8">
            <nav className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant mb-4">
              <Link href="/teacher/batches" className="hover:text-primary transition-colors font-medium">
                My Batches
              </Link>
              <Icon name="chevron_right" className="text-sm" />
              <span className="text-on-surface font-semibold">{batch.name}</span>
            </nav>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md">
              <div>
                <h2 className="font-h1 text-h1-mobile md:text-h1 font-bold text-on-background">
                  {batch.name}
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                  {batch.subject || "General Subject"} ({batch.schedule || "Sun, Tue, Thu"})
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/attendance?batchId=${batch.id}`}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 font-medium"
                >
                  <Icon name="calendar_today" className="text-[18px]" />
                  <span>Mark Attendance</span>
                </Link>
                <Link
                  href={`/results?batchId=${batch.id}`}
                  className="px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-sm flex items-center gap-2 font-medium"
                >
                  <Icon name="analytics" className="text-[18px]" />
                  <span>Enter Results</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="border-b border-outline-variant mb-8 flex gap-8">
            <button className="pb-4 font-label-md text-label-md text-primary border-b-2 border-primary font-bold cursor-pointer">
              Students ({batch.studentBatches.length})
            </button>
          </div>

          {/* Student Roster Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-h3 text-on-background font-bold">
                Student Roster ({batch.studentBatches.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant text-on-surface-variant font-label-md text-label-md">
                    <th className="py-4 pl-4 font-semibold">Roll No</th>
                    <th className="py-4 font-semibold">Student</th>
                    <th className="py-4 font-semibold">Attendance %</th>
                    <th className="py-4 font-semibold">Guardian Contact</th>
                    <th className="py-4 text-right pr-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-sm">
                  {batch.studentBatches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-lg text-center text-on-surface-variant">
                        No students enrolled in this batch yet.
                      </td>
                    </tr>
                  ) : (
                    batch.studentBatches.map((sb) => {
                      const student = sb.student;
                      const initials = student.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-surface-container-low transition-colors group"
                        >
                          <td className="py-4 pl-4 font-body-md text-body-md text-on-surface font-semibold">
                            {student.rollNo}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              {student.photoUrl ? (
                                <Image
                                  src={student.photoUrl}
                                  alt={student.fullName}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden border border-outline-variant flex items-center justify-center text-primary font-bold shrink-0">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <p className="font-body-md text-body-md font-semibold text-on-background">
                                  {student.fullName}
                                </p>
                                <p className="font-caption text-caption text-on-surface-variant">
                                  {student.email || "No email provided"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-xs font-semibold">
                              92%
                            </span>
                          </td>
                          <td className="py-4 font-body-sm text-body-sm text-on-surface-variant">
                            {student.guardianName
                              ? `${student.guardianName} (${student.guardianPhone || "N/A"})`
                              : "N/A"}
                          </td>
                          <td className="py-4 pr-4 text-right">
                            <div className="flex justify-end gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                              <a
                                href={student.guardianPhone ? `tel:${student.guardianPhone}` : "#"}
                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-lg transition-colors inline-block"
                                title="Call Guardian"
                              >
                                <Icon name="call" className="text-[20px]" />
                              </a>
                              <a
                                href={student.guardianPhone ? `sms:${student.guardianPhone}` : "#"}
                                className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-lg transition-colors inline-block"
                                title="SMS Guardian"
                              >
                                <Icon name="sms" className="text-[20px]" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
