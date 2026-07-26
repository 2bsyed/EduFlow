import React from "react";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export default async function TeacherBatchesPage() {
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

  // Fetch Teacher record
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
  });

  const teacherId = teacher?.id || "";

  // Fetch Institute record
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Fetch Batches strictly assigned to this logged-in teacher
  const batches = teacherId
    ? await prisma.batch.findMany({
        where: { instituteId, teacherId },
        include: {
          studentBatches: true,
        },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-background font-sans">
      {/* SideNavBar */}
      <aside className="docked left-0 h-full w-64 border-r border-outline-variant shadow-sm flex flex-col py-lg px-md bg-surface-container-lowest hidden md:flex shrink-0">
        <div className="mb-xl px-sm flex items-center gap-sm">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
            <Icon name="school" className="text-[20px]" />
          </div>
          <div>
            <h1 className="font-h3 text-h3 font-bold text-primary">EduFlow</h1>
            <p className="font-caption text-caption text-on-surface-variant">
              {institute?.name || "Teacher Portal"}
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-xs overflow-y-auto pr-sm">
          <Link
            href="/teacher"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="dashboard" className="text-[20px]" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/teacher/batches"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-primary font-semibold border-r-4 border-primary bg-primary-fixed"
          >
            <Icon name="groups" className="text-[20px]" />
            <span>My Batches</span>
          </Link>
          <Link
            href="/attendance"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="calendar_today" className="text-[20px]" />
            <span>Attendance</span>
          </Link>
          <Link
            href="/results"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="analytics" className="text-[20px]" />
            <span>Results</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
          >
            <Icon name="schedule" className="text-[20px]" />
            <span>Timetable</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors mt-auto"
          >
            <Icon name="person" className="text-[20px]" />
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

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
          <header className="mb-xl flex justify-between items-end">
            <div>
              <h1 className="font-h1 text-h1 text-primary-container font-bold">My Batches</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-sm">
                You are currently assigned to{" "}
                <strong className="font-semibold text-primary">{batches.length}</strong> active
                batches.
              </p>
            </div>
          </header>

          {/* Card Grid for Assigned Batches */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {batches.length === 0 ? (
              <div className="col-span-full bg-surface-container-lowest border border-outline-variant rounded-xl p-xl text-center text-on-surface-variant font-body-md">
                No batches assigned to your teacher account.
              </div>
            ) : (
              batches.map((batch) => (
                <Link
                  key={batch.id}
                  href={`/teacher/batches/${batch.id}`}
                  className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden group hover:-translate-y-1"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-surface-tint"></div>
                  <div className="flex justify-between items-start mb-md">
                    <div>
                      <span className="inline-block px-sm py-xs bg-surface-container-low text-primary-container rounded font-caption text-caption font-medium mb-sm">
                        {batch.subject || "General Science"}
                      </span>
                      <h2 className="font-h4 text-h4 text-on-background group-hover:text-primary transition-colors font-semibold">
                        {batch.name}
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-sm mb-lg flex-1">
                    <div className="flex items-center gap-sm text-on-surface-variant font-body-sm text-body-sm">
                      <Icon name="calendar_today" className="text-[18px]" />
                      <span>{batch.schedule || "Sun, Tue, Thu | 09:00 AM"}</span>
                    </div>
                    <div className="flex items-center gap-sm text-on-surface-variant font-body-sm text-body-sm">
                      <Icon name="group" className="text-[18px]" />
                      <span>{batch.studentBatches.length} Enrolled Students</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-md border-t border-outline-variant">
                    <div className="flex justify-between items-center mb-xs">
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        Attendance Trend
                      </span>
                      <span className="font-caption text-caption text-secondary font-medium">+2%</span>
                    </div>
                    <div className="h-8 w-full bg-surface-container rounded flex items-end overflow-hidden p-1 gap-xs">
                      <div className="h-1/2 w-1/5 bg-secondary-container rounded-t-sm"></div>
                      <div className="h-3/5 w-1/5 bg-secondary-container rounded-t-sm"></div>
                      <div className="h-2/5 w-1/5 bg-secondary-container rounded-t-sm"></div>
                      <div className="h-4/5 w-1/5 bg-secondary-container rounded-t-sm"></div>
                      <div className="h-full w-1/5 bg-secondary rounded-t-sm"></div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
