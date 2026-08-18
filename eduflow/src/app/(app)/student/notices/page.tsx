import React from "react";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { StudentSidebar } from "@/components/layout/StudentSidebar";

export default async function StudentNoticesPage() {
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

  const student = await prisma.student.findFirst({
    where: { userId, instituteId },
  });

  if (!student) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Student profile not found.
      </div>
    );
  }

  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Official Notice List
  const notices = [
    {
      id: "n1",
      title: "Annual Term Final Examination Schedule 2026",
      category: "EXAM",
      date: "26 Jul 2026",
      urgent: true,
      author: "Academic Control Committee",
      content:
        "The routine for the upcoming Annual Term Final Examination has been published. All students are advised to clear their pending tuition fees before collecting their admit cards from the admin office.",
    },
    {
      id: "n2",
      title: "Special Model Test & Performance Review",
      category: "ACADEMIC",
      date: "22 Jul 2026",
      urgent: false,
      author: "HSC Academic Care",
      content:
        "Special revision model test classes for Physics and Higher Mathematics will be held this Friday from 09:00 AM to 12:00 PM. Attendance is mandatory for all registered batch students.",
    },
    {
      id: "n3",
      title: "Holiday Notice: National Mourning Day",
      category: "HOLIDAY",
      date: "15 Jul 2026",
      urgent: false,
      author: "Institute Administration",
      content:
        "Please be informed that all regular classes and administrative activities will remain closed on August 15 in observance of National Mourning Day. Regular classes resume on August 16.",
    },
    {
      id: "n4",
      title: "Monthly Tuition Fee Reminder for July 2026",
      category: "FEES",
      date: "10 Jul 2026",
      urgent: true,
      author: "Accounts Department",
      content:
        "Guardians and students are requested to clear monthly tuition fees for July 2026 via bKash or Nagad online merchant gateways to avoid late registration charges.",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      <StudentSidebar activeTab="notices" instituteName={institute?.name} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Student Portal</h2>
          </div>
          <div className="flex items-center gap-md shrink-0 flex-nowrap">
            <NotificationBell />
            <LanguageToggle />
            <ProfileDropdown
              userName={student.fullName}
              userEmail={session?.user?.email || "student@eduflow.bd"}
              userRole="STUDENT"
              avatarUrl={student.photoUrl}
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
              <h1 className="font-h1 text-h1 text-on-surface font-bold">Notice Board</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                Official announcements and academic circulars from your institute.
              </p>
            </div>
            <div className="inline-flex items-center gap-xs bg-tertiary-container/10 text-tertiary px-md py-sm rounded-lg font-label-md text-label-md font-semibold self-start sm:self-auto">
              <Icon name="campaign" className="text-[20px]" />
              <span>4 Active Circulars</span>
            </div>
          </div>

          {/* Notice Cards List */}
          <div className="space-y-md">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`bg-surface-container-lowest border rounded-xl p-lg shadow-sm transition-all hover:shadow-md ${
                  notice.urgent
                    ? "border-error/40 bg-error-container/5"
                    : "border-outline-variant"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-xs mb-sm">
                  <div className="flex items-center gap-sm">
                    {notice.category === "EXAM" && (
                      <span className="bg-primary-container/10 text-primary font-label-md text-caption px-md py-xs rounded-full font-bold">
                        Exam Circular
                      </span>
                    )}
                    {notice.category === "FEES" && (
                      <span className="bg-tertiary-container/10 text-tertiary font-label-md text-caption px-md py-xs rounded-full font-bold">
                        Fee Reminder
                      </span>
                    )}
                    {notice.category === "HOLIDAY" && (
                      <span className="bg-secondary-container/20 text-secondary font-label-md text-caption px-md py-xs rounded-full font-bold">
                        Holiday Notice
                      </span>
                    )}
                    {notice.category === "ACADEMIC" && (
                      <span className="bg-surface-container-highest text-on-surface-variant font-label-md text-caption px-md py-xs rounded-full font-bold">
                        Academic Notice
                      </span>
                    )}

                    {notice.urgent && (
                      <span className="bg-error-container text-on-error-container font-label-md text-caption px-sm py-xs rounded-full font-bold flex items-center gap-xs">
                        <Icon name="priority_high" className="text-[14px]" /> Urgent
                      </span>
                    )}
                  </div>

                  <span className="font-caption text-caption text-on-surface-variant flex items-center gap-xs">
                    <Icon name="event" className="text-[16px] text-outline" /> {notice.date}
                  </span>
                </div>

                <h3 className="font-h3 text-h3 text-on-surface font-bold mb-xs">
                  {notice.title}
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-md">
                  {notice.content}
                </p>

                <div className="pt-sm border-t border-surface-variant flex justify-between items-center text-caption font-caption text-on-surface-variant">
                  <span className="flex items-center gap-xs">
                    <Icon name="account_circle" className="text-[16px] text-outline" />
                    Issued by: <strong className="text-on-surface">{notice.author}</strong>
                  </span>
                  <span className="text-primary font-semibold flex items-center gap-xs hover:underline cursor-pointer">
                    Read Full Notice <Icon name="arrow_forward" className="text-[14px]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
