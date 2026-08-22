import React from "react";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { AssignStudentClient } from "@/components/batches/AssignStudentClient";
import { createBatchAction, assignStudentToBatchAction } from "@/app/actions/batches";

export default async function OwnerBatchesPage() {
  const session = await auth();
  const instituteId = session?.user?.instituteId;

  if (!instituteId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: Institute ID missing.
      </div>
    );
  }

  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Fetch all batches
  const batches = await prisma.batch.findMany({
    where: { instituteId },
    include: {
      teacher: {
        include: {
          user: true,
        },
      },
      studentBatches: {
        include: {
          student: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch teachers for assignment dropdown
  const teachers = await prisma.teacher.findMany({
    where: { instituteId },
    include: { user: true },
  });

  // Fetch students for enrollment dropdown
  const students = await prisma.student.findMany({
    where: { instituteId, status: "ACTIVE" },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <OwnerSidebar activeTab="batches" instituteName={institute?.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Batch Management</h2>
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

        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full space-y-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-md">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface font-bold">Batches & Classes</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                Create batches, assign course teachers, and enroll students.
              </p>
            </div>
            <div className="inline-flex items-center gap-xs bg-primary-container/10 text-primary px-md py-sm rounded-lg font-label-md text-label-md font-semibold self-start sm:self-auto">
              <Icon name="school" className="text-[20px]" />
              <span>{batches.length} Active Batches</span>
            </div>
          </div>

          {/* Action Grid: Create Batch & Enroll Student Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Create Batch Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
              <h3 className="font-h4 text-h4 text-on-surface font-bold flex items-center gap-sm">
                <Icon name="add_circle" className="text-primary text-[20px]" />
                <span>Create New Batch</span>
              </h3>

              <form action={createBatchAction} className="space-y-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-xs">
                      Batch Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Class 10 - Physics Special"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-xs">
                      Subject
                    </label>
                    <input
                      name="subject"
                      type="text"
                      placeholder="e.g. Physics"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-xs">
                      Schedule
                    </label>
                    <input
                      name="schedule"
                      type="text"
                      placeholder="e.g. Sun, Tue, Thu | 04:00 PM"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-xs">
                      Monthly Fee (BDT)
                    </label>
                    <input
                      name="monthlyFee"
                      type="number"
                      placeholder="e.g. 2500"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-xs">
                    Assign Instructor / Teacher
                  </label>
                  <select
                    name="teacherId"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.user.name} ({t.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded-lg shadow-sm transition-colors font-semibold flex items-center justify-center gap-xs cursor-pointer"
                >
                  <Icon name="save" className="text-[18px]" />
                  <span>Create Batch</span>
                </button>
              </form>
            </div>

            {/* Enroll Student into Batch Card */}
            <AssignStudentClient students={students} batches={batches} />
          </div>

          {/* Active Batches List */}
          <div className="space-y-md">
            <h3 className="font-h3 text-h3 text-on-surface font-bold">Existing Batches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {batches.map((batch) => {
                const teacherName = batch.teacher?.user?.name || "Unassigned";
                return (
                  <div
                    key={batch.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-md">
                      <div>
                        <h4 className="font-h4 text-h4 text-on-surface font-bold">{batch.name}</h4>
                        <p className="font-body-sm text-body-sm text-primary font-semibold mt-xs">
                          {batch.subject || "General"}
                        </p>
                      </div>
                      <span className="bg-primary-container/10 text-primary text-caption font-bold px-sm py-xs rounded-full">
                        ৳ {Number(batch.monthlyFee).toFixed(0)}/mo
                      </span>
                    </div>

                    <div className="space-y-xs font-body-sm text-body-sm text-on-surface-variant mb-md">
                      <div className="flex items-center gap-xs">
                        <Icon name="person" className="text-[18px] text-outline" />
                        <span>Teacher: <strong className="text-on-surface">{teacherName}</strong></span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <Icon name="schedule" className="text-[18px] text-outline" />
                        <span>Schedule: <strong>{batch.schedule || "Regular Routine"}</strong></span>
                      </div>
                      <div className="flex items-center gap-xs">
                        <Icon name="group" className="text-[18px] text-outline" />
                        <span>Enrolled Students: <strong className="text-secondary">{batch.studentBatches.length}</strong></span>
                      </div>
                    </div>

                    <div className="pt-sm border-t border-surface-variant flex justify-between items-center text-caption font-caption text-on-surface-variant">
                      <span>Roster Status: Active</span>
                      <span className="text-primary font-semibold cursor-pointer hover:underline">
                        Manage Batch
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
