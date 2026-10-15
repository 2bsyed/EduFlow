import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { createNoticeAction } from "@/actions/notices";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

interface NoticesContentProps {
  userRole?: string;
}

async function NoticesContent({ userRole }: NoticesContentProps) {
  const noticesData = await fetchApi("/api/v1/core/notices").catch(() => ({ batches: [], notices: [] }));

  const eligibleBatches: Array<{ id: string; name: string; subject?: string | null }> = noticesData.batches || [];
  const rawNoticeLogs: Array<any> = noticesData.notices || [];

  // Robustly parse notice items to avoid runtime object-in-jsx errors
  const publishedNotices = rawNoticeLogs.map((log: any) => {
    let data: any = {};
    if (log && typeof log.details === "object" && log.details !== null) {
      data = log.details;
    } else if (log && typeof log.details === "string") {
      try {
        data = JSON.parse(log.details);
      } catch {
        data = { content: log.details };
      }
    }

    const title = typeof data.title === "string" ? data.title : "Announcement";
    const content =
      typeof data.content === "string"
        ? data.content
        : typeof data.message === "string"
        ? data.message
        : "";
    const category = typeof data.category === "string" ? data.category : "ACADEMIC";
    const urgent = !!data.urgent;
    const targetScope = typeof data.targetScope === "string" ? data.targetScope : "EVERYONE";
    const batchId = data.batchId || null;
    const author = typeof data.author === "string" ? data.author : "Management";
    const role = typeof data.role === "string" ? data.role : "OWNER";
    const date = log?.createdAt
      ? new Date(log.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Recent";

    return {
      id: log?.id || Math.random().toString(),
      title,
      content,
      category,
      urgent,
      targetScope,
      batchId,
      author,
      role,
      date,
    };
  });

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
  const isTeacher = userRole === "TEACHER";
  const teacherHasNoBatches = isTeacher && eligibleBatches.length === 0;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-md">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface font-bold">
            {isTeacher ? "Teacher Notice Board" : "Publish & Manage Notices"}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
            {isTeacher
              ? "Broadcast batch announcements and academic updates to your students."
              : "Broadcast emergency alerts, exam circulars, and batch announcements."}
          </p>
        </div>
      </div>

      {/* Notice Broadcast Form */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-md">
        <h3 className="font-h4 text-h4 text-on-surface font-bold flex items-center gap-sm">
          <Icon name="campaign" className="text-primary text-[22px]" />
          <span>New Notice Circular</span>
        </h3>

        {teacherHasNoBatches ? (
          <div className="p-md rounded-lg bg-surface-container-low border border-outline-variant text-on-surface-variant font-body-sm">
            You do not currently have any assigned batches. Teachers can only publish notices to their assigned batches.
          </div>
        ) : (
          <form action={createNoticeAction} className="space-y-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-xs">
                  Notice Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Model Test Schedule Published"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-xs">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                >
                  <option value="ACADEMIC">Academic Announcement</option>
                  <option value="EXAM">Examination Routine</option>
                  {!isTeacher && <option value="FEES">Tuition Fee Notice</option>}
                  <option value="HOLIDAY">Holiday Notification</option>
                </select>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-xs">
                  Audience Scope
                </label>
                <select
                  name="targetScope"
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-sm font-body-sm text-body-sm focus:border-primary outline-none"
                >
                  {!isTeacher && (
                    <option value="EVERYONE">Broadcast to Everyone (All Batches)</option>
                  )}
                  {eligibleBatches.map((b) => (
                    <option key={b.id} value={`BATCH:${b.id}`}>
                      {isTeacher ? `Batch: ${b.name}` : `Target Batch: ${b.name}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-xs">
                Notice Details
              </label>
              <textarea
                name="content"
                required
                rows={3}
                placeholder="Write the complete announcement text here..."
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md font-body-sm text-body-sm focus:border-primary outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-md pt-xs">
              <label className="flex items-center gap-xs cursor-pointer font-label-md text-label-md text-error">
                <input
                  name="urgent"
                  type="checkbox"
                  value="true"
                  className="w-4 h-4 rounded border-error text-error focus:ring-error"
                />
                <span>Mark as High Priority / Urgent Notice</span>
              </label>

              <button
                type="submit"
                className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg shadow-sm transition-colors font-semibold flex items-center gap-xs cursor-pointer"
              >
                <Icon name="send" className="text-[18px]" />
                <span>Broadcast Notice</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active Notices Board */}
      <div className="space-y-md">
        <h3 className="font-h4 text-h4 text-on-surface font-bold flex items-center gap-sm">
          <Icon name="assignment" className="text-secondary text-[22px]" />
          <span>Active Circulars</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {displayNotices.map((notice: any) => (
            <div
              key={notice.id}
              className={`bg-surface-container-lowest border rounded-xl p-lg shadow-sm transition-shadow hover:shadow-md ${
                notice.urgent ? "border-error/50 bg-error-container/5" : "border-outline-variant"
              }`}
            >
              <div className="flex justify-between items-start gap-xs mb-sm">
                <div className="flex items-center gap-xs flex-wrap">
                  <span className="bg-primary-container/10 text-primary font-label-md text-[11px] px-2 py-0.5 rounded-full font-bold">
                    {notice.category}
                  </span>
                  {notice.urgent && (
                    <span className="bg-error-container text-on-error-container font-label-md text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Icon name="priority_high" className="text-[12px]" /> URGENT
                    </span>
                  )}
                  {notice.targetScope === "BATCH" ? (
                    <span className="bg-surface-variant text-on-surface-variant font-label-md text-[11px] px-2 py-0.5 rounded-full font-medium">
                      Batch Specific
                    </span>
                  ) : (
                    <span className="bg-secondary-container/30 text-secondary font-label-md text-[11px] px-2 py-0.5 rounded-full font-medium">
                      All Batches
                    </span>
                  )}
                </div>
                <span className="font-caption text-caption text-on-surface-variant flex items-center gap-xs">
                  <Icon name="event" className="text-[14px] text-outline" /> {notice.date}
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
    </>
  );
}

export default async function NoticesPage() {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!instituteId || !userId) {
    redirect("/login");
  }

  // Redirect Student to student notices page
  if (role === "STUDENT") {
    redirect("/student/notices");
  }

  return (
    <div className="flex h-screen overflow-hidden text-on-surface bg-surface font-sans">
      {role === "TEACHER" ? (
        <TeacherSidebar activeTab="notices" instituteName={(session?.user as any)?.instituteName || "EduFlow"} />
      ) : (
        <OwnerSidebar activeTab="notices" instituteName={(session?.user as any)?.instituteName || "EduFlow"} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="docked top-0 w-full border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-margin sticky top-0 z-50 bg-surface-bright shrink-0">
          <div className="flex items-center gap-md">
            <h2 className="font-h4 text-h4 font-semibold text-on-surface">
              {role === "TEACHER" ? "Teacher Notice Board" : "Notice Board Management"}
            </h2>
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
          <Suspense fallback={<ContentSkeleton />}>
            <NoticesContent userRole={role} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
