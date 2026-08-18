import React from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { createNoticeAction } from "@/app/actions/notices";

export default async function NoticesPage() {
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

  // Redirect Student to student notices page
  if (role === "STUDENT") {
    redirect("/student/notices");
  }

  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Fetch batches available to this user based on role
  let eligibleBatches: Array<{ id: string; name: string; subject: string | null }> = [];
  if (role === "OWNER") {
    eligibleBatches = await prisma.batch.findMany({
      where: { instituteId },
      select: { id: true, name: true, subject: true },
      orderBy: { name: "asc" },
    });
  } else if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (teacher) {
      eligibleBatches = await prisma.batch.findMany({
        where: { instituteId, teacherId: teacher.id },
        select: { id: true, name: true, subject: true },
        orderBy: { name: "asc" },
      });
    }
  }

  // Fetch published notices from ActivityLog
  const rawNoticeLogs = await prisma.activityLog.findMany({
    where: {
      instituteId,
      action: { startsWith: "NOTICE:" },
    },
    orderBy: { createdAt: "desc" },
  });

  // Parse notice items
  const publishedNotices = rawNoticeLogs.map((log) => {
    try {
      const data = JSON.parse(log.details || "{}");
      return {
        id: log.id,
        title: data.title || "Announcement",
        content: data.content || "",
        category: data.category || "ACADEMIC",
        urgent: !!data.urgent,
        targetScope: data.targetScope || "EVERYONE",
        batchId: data.batchId || null,
        author: data.author || "Management",
        role: data.role || "OWNER",
        date: new Date(log.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    } catch {
      return {
        id: log.id,
        title: "Notice Circular",
        content: log.details || "",
        category: "ACADEMIC",
        urgent: false,
        targetScope: "EVERYONE",
        batchId: null,
        author: "Management",
        role: "OWNER",
        date: new Date(log.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    }
  });

  // Default sample notices if none created yet
  const sampleNotices = [
    {
      id: "sn1",
      title: "Annual Model Test Examination Schedule 2026",
      content: "All batch students must prepare for the upcoming Annual Model Test starting next Sunday.",
      category: "EXAM",
      urgent: true,
      targetScope: "EVERYONE",
      batchId: null,
      author: "Dr. Rafiqul Islam",
      role: "OWNER",
      date: "26 Jul 2026",
    },
    {
      id: "sn2",
      title: "Class 10 Special Revision Lecture Assignment",
      content: "Special problem-solving session on Chapter 5 Higher Mathematics scheduled for 4 PM.",
      category: "ACADEMIC",
      urgent: false,
      targetScope: "BATCH",
      batchId: null,
      author: "Kamrul Hasan",
      role: "TEACHER",
      date: "24 Jul 2026",
    },
  ];

  const displayNotices = publishedNotices.length > 0 ? publishedNotices : sampleNotices;

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      {role === "TEACHER" ? (
        <TeacherSidebar activeTab="notices" instituteName={institute?.name} />
      ) : (
        <OwnerSidebar activeTab="notices" instituteName={institute?.name} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">Notice Board Management</h2>
          </div>
          <div className="flex items-center gap-md shrink-0 flex-nowrap">
            <NotificationBell />
            <LanguageToggle />
            <ProfileDropdown
              userName={session?.user?.name || "User"}
              userEmail={session?.user?.email || "user@eduflow.bd"}
              userRole={role || "OWNER"}
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
              <h1 className="font-h1 text-h1 text-on-surface font-bold">Publish & Manage Notices</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                {role === "OWNER"
                  ? "Post announcements to everyone, faculty teachers, or specific batches."
                  : "Post announcements and revision notices to your assigned batches."}
              </p>
            </div>
          </div>

          {/* Post Notice Form */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
            <h3 className="font-h4 text-h4 text-on-surface font-bold flex items-center gap-sm">
              <Icon name="campaign" className="text-primary text-[22px]" />
              <span>Post New Notice</span>
            </h3>

            <form action={createNoticeAction} className="space-y-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                <div className="lg:col-span-2">
                  <label className="font-label-md text-label-md text-on-surface block mb-xs">
                    Notice Title
                  </label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Model Test Exam Date Announcement"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-xs">
                    Category Tag
                  </label>
                  <select
                    name="category"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                  >
                    <option value="ACADEMIC">Academic / Class</option>
                    <option value="EXAM">Exam Circular</option>
                    <option value="FEES">Tuition Fee Reminder</option>
                    <option value="HOLIDAY">Holiday Notice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-md items-end">
                {role === "OWNER" ? (
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-xs">
                      Target Audience / Scope
                    </label>
                    <select
                      name="targetScope"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                    >
                      <option value="EVERYONE">Everyone (All Students & Staff)</option>
                      <option value="TEACHERS">Teachers Only</option>
                      <option value="BATCH">Specific Batch</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-xs">
                      Target Audience
                    </label>
                    <input
                      type="hidden"
                      name="targetScope"
                      value="BATCH"
                    />
                    <div className="px-md py-sm bg-surface-container-high rounded-lg font-body-sm text-body-sm text-on-surface font-semibold">
                      Assigned Batch Only
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-xs">
                    Select Target Batch
                  </label>
                  <select
                    name="batchId"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                  >
                    <option value="">-- All / General --</option>
                    {eligibleBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.subject || "General"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-sm pb-xs">
                  <input
                    id="urgent-checkbox"
                    type="checkbox"
                    name="urgent"
                    value="true"
                    className="w-4 h-4 text-error rounded border-outline-variant cursor-pointer"
                  />
                  <label htmlFor="urgent-checkbox" className="font-label-md text-label-md text-error font-bold cursor-pointer">
                    Mark as High Priority / Urgent
                  </label>
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-xs">
                  Notice Body / Content
                </label>
                <textarea
                  name="content"
                  required
                  rows={3}
                  placeholder="Enter complete notice details here..."
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md font-body-sm text-body-sm focus:border-primary outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm px-xl rounded-lg shadow-sm transition-colors font-semibold flex items-center gap-xs cursor-pointer"
                >
                  <Icon name="send" className="text-[18px]" />
                  <span>Broadcast Notice</span>
                </button>
              </div>
            </form>
          </div>

          {/* Published Circulars Board */}
          <div className="space-y-md">
            <h3 className="font-h3 text-h3 text-on-surface font-bold">Published Circulars</h3>
            <div className="space-y-md">
              {displayNotices.map((notice) => (
                <div
                  key={notice.id}
                  className={`bg-surface-container-lowest border rounded-xl p-lg shadow-sm transition-all hover:shadow-md ${
                    notice.urgent ? "border-error/40 bg-error-container/5" : "border-outline-variant"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-xs mb-sm">
                    <div className="flex items-center gap-sm">
                      <span className="bg-primary-container/10 text-primary font-label-md text-caption px-md py-xs rounded-full font-bold">
                        {notice.category}
                      </span>
                      <span className="bg-surface-container-highest text-on-surface-variant font-label-md text-caption px-sm py-xs rounded-full font-medium">
                        Target: {notice.targetScope}
                      </span>
                      {notice.urgent && (
                        <span className="bg-error-container text-on-error-container font-label-md text-caption px-sm py-xs rounded-full font-bold flex items-center gap-xs">
                          <Icon name="priority_high" className="text-[14px]" /> High Priority
                        </span>
                      )}
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant flex items-center gap-xs">
                      <Icon name="event" className="text-[16px] text-outline" /> {notice.date}
                    </span>
                  </div>

                  <h4 className="font-h3 text-h3 text-on-surface font-bold mb-xs">{notice.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-md">
                    {notice.content}
                  </p>

                  <div className="pt-sm border-t border-surface-variant flex justify-between items-center text-caption font-caption text-on-surface-variant">
                    <span>
                      Posted by: <strong className="text-on-surface">{notice.author}</strong> ({notice.role})
                    </span>
                    <span className="text-secondary font-semibold">Broadcasting Live</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
