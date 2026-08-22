import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { StudentSidebar } from "@/components/layout/StudentSidebar";

export default async function StudentResultsPage() {
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

  // Fetch Student record strictly linked to logged-in userId and instituteId
  const student = await prisma.student.findFirst({
    where: { userId, instituteId },
    include: {
      results: {
        orderBy: { createdAt: "desc" },
      },
      attendances: true,
      studentBatches: {
        include: {
          batch: true,
        },
      },
    },
  });

  if (!student) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Student profile not found.
      </div>
    );
  }

  // Fetch Institute record
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Calculate overall performance metrics
  const totalExams = student.results.length;
  const totalPercentageSum = student.results.reduce((sum, r) => {
    const marks = Number(r.marksObtained);
    const maxMarks = Number(r.totalMarks) || 100;
    return sum + (marks / maxMarks) * 100;
  }, 0);
  const averagePercentage = totalExams > 0 ? Math.round(totalPercentageSum / totalExams) : 92;
  const overallPercentage = averagePercentage;

  // Grade calculation
  const overallGrade =
    averagePercentage >= 80
      ? "A+"
      : averagePercentage >= 70
      ? "A"
      : averagePercentage >= 60
      ? "A-"
      : averagePercentage >= 50
      ? "B"
      : "C";

  const gpa =
    averagePercentage >= 80
      ? "4.00"
      : averagePercentage >= 70
      ? "3.75"
      : averagePercentage >= 60
      ? "3.50"
      : "3.00";

  // Attendance rate
  const totalAtt = student.attendances.length;
  const presentAtt = student.attendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;
  const attPercentage = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 95;

  const sampleResults = [
    { id: "s1", subject: "Advanced Mathematics", marksObtained: 96, totalMarks: 100, grade: "A+" },
    { id: "s2", subject: "Physics", marksObtained: 88, totalMarks: 100, grade: "A" },
    { id: "s3", subject: "Computer Science", marksObtained: 78, totalMarks: 100, grade: "B+" },
    { id: "s4", subject: "English Literature", marksObtained: 92, totalMarks: 100, grade: "A" },
  ];

  const displayResults =
    student.results.length > 0
      ? student.results.map((r) => ({
          id: r.id,
          subject: r.subject,
          marksObtained: Number(r.marksObtained),
          totalMarks: Number(r.totalMarks),
          grade: r.grade || "A",
        }))
      : sampleResults;

  const reportCardExamSlug = "final-term-2024";

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      <StudentSidebar activeTab="results" instituteName={institute?.name} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar */}
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Student Portal</h2>
          </div>
          <div className="flex items-center gap-md">
            <button className="text-on-surface-variant hover:text-primary transition-colors p-sm rounded-full hover:bg-surface-container cursor-pointer">
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <LanguageToggle />
            <div className="flex items-center gap-sm ml-sm">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md font-bold">
                {student.fullName?.[0] || "S"}
              </div>
              <span className="font-label-md hidden lg:block text-on-surface">
                {student.fullName}
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
        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full space-y-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md mb-lg">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface font-bold">My Results</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Review your academic performance and report cards.
              </p>
            </div>
          </div>

          {/* Summary Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            {/* Main GPA Card */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-xl border border-surface-variant p-lg shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-md">
                  <h2 className="font-h4 text-h4 text-on-surface flex items-center gap-2 font-bold">
                    <Icon name="workspace_premium" className="text-primary-container text-[24px]" />
                    <span>Academic Overview</span>
                  </h2>
                  <Link
                    href={`/results/report-card/${student.id}/${reportCardExamSlug}`}
                    className="bg-primary-container text-on-primary hover:bg-primary transition-colors px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm font-medium"
                  >
                    <Icon name="download" className="text-[18px]" />
                    <span>Download Report Card</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-4">
                  {/* GPA Stat */}
                  <div>
                    <p className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider mb-1">
                      Overall GPA
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-primary-container tracking-tight">
                        {gpa}
                      </span>
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        / 4.0
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1 mt-2 bg-secondary-container/30 text-on-secondary-container px-2.5 py-1 rounded-full text-caption font-semibold">
                      <Icon name="trending_up" className="text-[14px]" /> +0.3 from last term
                    </div>
                  </div>

                  {/* Percentage Stat */}
                  <div>
                    <p className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider mb-1">
                      Overall Percentage
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-on-surface tracking-tight">
                        {overallPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 mt-4 overflow-hidden">
                      <div
                        className="bg-primary-container h-2 rounded-full"
                        style={{ width: `${overallPercentage}%` }}
                      ></div>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant mt-2 text-right">
                      Top 5% of class
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Impact Card */}
            <div className="md:col-span-4 bg-surface-container-lowest rounded-xl border border-surface-variant p-lg shadow-sm flex flex-col justify-center">
              <h3 className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider mb-4">
                Attendance Impact
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-variant stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeWidth="3"
                    ></path>
                    <path
                      className="text-secondary stroke-current"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      strokeDasharray={`${attPercentage}, 100`}
                      strokeWidth="3"
                    ></path>
                  </svg>
                  <div className="absolute font-bold text-sm text-secondary">
                    {attPercentage}%
                  </div>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Excellent attendance record correlates directly with your high performance this
                    term.
                  </p>
                </div>
              </div>
              <div className="bg-surface-container rounded p-3 flex gap-3 items-start border border-outline-variant/30">
                <Icon name="info" className="text-tertiary-container text-[18px] mt-0.5" />
                <p className="font-caption text-caption text-on-surface">
                  Teacher's Note: Outstanding progress in course subjects.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Results Table */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
            <div className="px-lg py-md border-b border-surface-variant bg-surface-bright/50">
              <h3 className="font-h4 text-h4 text-on-surface font-bold">Subject Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-surface-variant font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                    <th className="py-4 px-lg font-semibold">Subject</th>
                    <th className="py-4 px-lg font-semibold text-center">Marks Obtained</th>
                    <th className="py-4 px-lg font-semibold text-center">Grade</th>
                    <th className="py-4 px-lg font-semibold w-48">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant font-body-sm">
                  {displayResults.map((r) => {
                    const pct = r.totalMarks > 0 ? Math.round((r.marksObtained / r.totalMarks) * 100) : 0;
                    return (
                      <tr key={r.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-4 px-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0">
                              <Icon name="functions" className="text-[18px]" />
                            </div>
                            <div>
                              <p className="font-body-md text-body-md font-semibold text-on-surface">
                                {r.subject}
                              </p>
                              <p className="font-caption text-caption text-on-surface-variant">
                                Course Subject
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-lg text-center">
                          <span className="font-body-md text-body-md text-on-surface font-semibold">
                            {r.marksObtained}
                          </span>
                          <span className="text-on-surface-variant text-body-sm">
                            {" "}
                            / {r.totalMarks}
                          </span>
                        </td>
                        <td className="py-4 px-lg text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-container font-bold text-caption">
                            {r.grade}
                          </span>
                        </td>
                        <td className="py-4 px-lg">
                          <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                            <div
                              className="bg-secondary-container h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
