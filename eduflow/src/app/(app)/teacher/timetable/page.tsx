import React from "react";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";

export default async function TeacherTimetablePage() {
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

  const teacher = await prisma.teacher.findUnique({
    where: { userId },
  });

  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  const teacherId = teacher?.id || "";

  const batches = teacherId
    ? await prisma.batch.findMany({
        where: { instituteId, teacherId },
        include: {
          studentBatches: true,
        },
      })
    : [];

  const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const defaultTimeslots = [
    { time: "08:00 AM - 09:30 AM", label: "Morning Lecture" },
    { time: "10:00 AM - 11:30 AM", label: "Mid-day Special" },
    { time: "03:00 PM - 04:30 PM", label: "Afternoon Class" },
    { time: "05:00 PM - 06:30 PM", label: "Evening Batch" },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <TeacherSidebar activeTab="timetable" instituteName={institute?.name} />

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

        <main className="flex-1 overflow-y-auto p-md md:p-margin max-w-7xl mx-auto w-full space-y-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-md">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface font-bold">Teaching Schedule</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                Weekly routine and lecture timetable for your assigned batches.
              </p>
            </div>
            <div className="inline-flex items-center gap-xs bg-primary-container/10 text-primary px-md py-sm rounded-lg font-label-md text-label-md font-semibold self-start sm:self-auto">
              <Icon name="event" className="text-[20px]" />
              <span>{batches.length} Assigned Batches</span>
            </div>
          </div>

          {/* Batches Routine Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {batches.map((batch, index) => (
              <div
                key={batch.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-md">
                  <div>
                    <span className="text-caption font-caption text-primary font-bold uppercase tracking-wider">
                      Batch #{index + 1}
                    </span>
                    <h3 className="font-h3 text-h3 text-on-surface font-bold mt-xs">
                      {batch.name}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Icon name="groups" className="text-[22px]" />
                  </div>
                </div>

                <div className="space-y-xs font-body-sm text-body-sm text-on-surface-variant mb-md">
                  <div className="flex items-center gap-xs">
                    <Icon name="subject" className="text-[18px] text-outline" />
                    <span>Subject: <strong className="text-on-surface">{batch.subject || "Higher Mathematics"}</strong></span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Icon name="group" className="text-[18px] text-outline" />
                    <span>Enrolled: <strong className="text-on-surface">{batch.studentBatches.length} Students</strong></span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Icon name="schedule" className="text-[18px] text-outline" />
                    <span>Schedule: <strong className="text-primary">{batch.schedule || "Sat, Mon, Wed (04:00 PM)"}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Routine Grid */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="px-lg py-md border-b border-surface-variant bg-surface-bright flex justify-between items-center">
              <h3 className="font-h4 text-h4 text-on-surface font-bold flex items-center gap-sm">
                <Icon name="calendar_view_week" className="text-primary text-[22px]" />
                <span>Weekly Lecture Routine</span>
              </h3>
              <span className="font-caption text-caption text-on-surface-variant">
                Timezone: Asia/Dhaka (GMT+6)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-surface-variant text-label-md font-label-md text-on-surface-variant">
                    <th className="px-md py-sm font-semibold w-40">Time Slot</th>
                    {daysOfWeek.map((day) => (
                      <th key={day} className="px-md py-sm font-semibold text-center min-w-[140px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant font-body-sm">
                  {defaultTimeslots.map((slot, sIdx) => (
                    <tr key={sIdx} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-md py-md font-semibold text-on-surface whitespace-nowrap bg-surface-container-lowest">
                        <div className="flex items-center gap-xs">
                          <Icon name="access_time" className="text-outline text-[16px]" />
                          <span>{slot.time}</span>
                        </div>
                      </td>
                      {daysOfWeek.map((day, dIdx) => {
                        const hasClass = (sIdx + dIdx) % 2 === 0;
                        const matchingBatch = batches[dIdx % (batches.length || 1)];
                        return (
                          <td key={day} className="px-xs py-xs text-center">
                            {hasClass && matchingBatch ? (
                              <div className="bg-primary-container/10 border border-primary-container/20 rounded-lg p-sm text-left shadow-xs">
                                <span className="font-label-md text-xs font-bold text-primary block truncate">
                                  {matchingBatch.name}
                                </span>
                                <span className="text-[11px] text-on-surface-variant block truncate">
                                  {matchingBatch.subject || "Class Lecture"}
                                </span>
                                <span className="text-[10px] text-secondary font-medium block mt-xs">
                                  Room {301 + (dIdx % 4)}
                                </span>
                              </div>
                            ) : (
                              <div className="p-sm text-outline text-[12px] italic">
                                —
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
