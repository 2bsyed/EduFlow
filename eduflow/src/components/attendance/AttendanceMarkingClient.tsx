"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { upsertAttendanceAction, bulkMarkPresentAction } from "@/app/actions/attendance";

export interface RosterItem {
  studentId: string;
  fullName: string;
  rollNo: string;
  photoUrl?: string | null;
  status: "PRESENT" | "ABSENT" | "LATE" | null;
}

export interface BatchOption {
  id: string;
  name: string;
}

interface AttendanceMarkingClientProps {
  batches: BatchOption[];
  selectedBatchId: string;
  selectedDate: string;
  initialBatchId: string;
  initialDate: string;
  roster: RosterItem[];
  isAuthorized: boolean;
}

export function AttendanceMarkingClient({
  batches,
  initialBatchId,
  initialDate,
  roster,
  isAuthorized,
}: AttendanceMarkingClientProps) {
  const router = useRouter();
  const t = useTranslations("Attendance");

  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || "");
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Optimistic Status State
  const [statusMap, setStatusMap] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE" | null>>(
    {}
  );
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  useEffect(() => {
    const initialMap: Record<string, "PRESENT" | "ABSENT" | "LATE" | null> = {};
    roster.forEach((item) => {
      initialMap[item.studentId] = item.status;
    });
    setStatusMap(initialMap);
  }, [roster]);

  // Handle Batch / Date Dropdown Changes
  const handleBatchChange = (newBatchId: string) => {
    setSelectedBatchId(newBatchId);
    router.push(`/attendance?batchId=${newBatchId}&date=${selectedDate}`);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    router.push(`/attendance?batchId=${selectedBatchId}&date=${newDate}`);
  };

  // Live Summary Calculation
  const presentCount = Object.values(statusMap).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(statusMap).filter((s) => s === "ABSENT").length;
  const lateCount = Object.values(statusMap).filter((s) => s === "LATE").length;

  // Toggle Single Student Status
  const handleStatusToggle = async (studentId: string, newStatus: "PRESENT" | "ABSENT" | "LATE") => {
    if (!isAuthorized) return;

    // Optimistic UI Update
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));

    await upsertAttendanceAction(studentId, selectedBatchId, selectedDate, newStatus);
  };

  // Mark All Present Action
  const handleMarkAllPresent = async () => {
    if (!isAuthorized || roster.length === 0) return;

    setIsBulkLoading(true);

    // Optimistic UI Update
    const newMap: Record<string, "PRESENT" | "ABSENT" | "LATE" | null> = { ...statusMap };
    roster.forEach((item) => {
      newMap[item.studentId] = "PRESENT";
    });
    setStatusMap(newMap);

    const studentIds = roster.map((r) => r.studentId);
    await bulkMarkPresentAction(selectedBatchId, selectedDate, studentIds);
    setIsBulkLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-md md:space-y-lg pb-xl">
      {/* Page Header & Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-md">
          <div>
            <h2 className="font-h2 text-h2 text-on-background">{t("title")}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={handleMarkAllPresent}
            disabled={!isAuthorized || isBulkLoading || roster.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary-container text-primary-container bg-transparent hover:bg-primary-container hover:text-on-primary rounded-lg font-label-md text-label-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Icon name="done_all" className="text-[18px]" />
            <span>{isBulkLoading ? t("marking") : t("markAllPresent")}</span>
          </button>
        </div>

        {!isAuthorized && (
          <div className="mb-md p-md bg-error-container text-on-error-container rounded-lg font-body-sm flex items-center gap-2">
            <Icon name="warning" className="text-[20px]" />
            <span>{t("readOnlyWarning")}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-md">
          {/* Select Batch */}
          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <label className="block font-caption text-caption text-on-surface-variant mb-1 ml-1">
              {t("selectBatch")}
            </label>
            <div className="relative">
              <select
                value={selectedBatchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="appearance-none w-full bg-surface-bright border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer hover:border-outline transition-colors"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                <Icon name="expand_more" className="text-[20px]" />
              </div>
            </div>
          </div>

          {/* Select Date */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <label className="block font-caption text-caption text-on-surface-variant mb-1 ml-1">
              {t("selectDate")}
            </label>
            <div className="relative">
              <input
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full bg-surface-bright border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg pl-4 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-outline transition-colors"
                type="date"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Summary Bar */}
      <div className="flex items-center gap-md px-md py-sm bg-surface-container-low rounded-lg border border-surface-variant shadow-sm text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
          <span className="font-label-md text-label-md text-on-surface font-medium">
            {presentCount} Present
          </span>
        </div>
        <span className="text-outline-variant">•</span>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
          <span className="font-label-md text-label-md text-on-surface font-medium">
            {absentCount} Absent
          </span>
        </div>
        <span className="text-outline-variant">•</span>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#743d00]"></div>
          <span className="font-label-md text-label-md text-on-surface font-medium">
            {lateCount} Late
          </span>
        </div>
      </div>

      {/* Roster List */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        {/* Header Row */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_auto] items-center gap-4 px-lg py-sm bg-surface-bright border-b border-outline-variant">
          <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            {t("student")}
          </div>
          <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center w-[300px]">
            {t("status")}
          </div>
        </div>

        {roster.length === 0 ? (
          <div className="p-xl text-center font-body-md text-on-surface-variant">
            {t("noStudents")}
          </div>
        ) : (
          roster.map((student) => {
            const currentStatus = statusMap[student.studentId];
            const initials = student.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            return (
              <div
                key={student.studentId}
                className="flex flex-col sm:grid sm:grid-cols-[1fr_auto] items-start sm:items-center gap-md p-md sm:px-lg sm:py-md border-b border-outline-variant hover:bg-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-md w-full">
                  {student.photoUrl ? (
                    <Image
                      src={student.photoUrl}
                      alt={student.fullName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border border-outline-variant shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <span className="font-label-md text-label-md font-bold text-primary">
                        {initials}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body-md text-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                      {student.fullName}
                    </h3>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Roll: {student.rollNo}
                    </p>
                  </div>
                </div>

                {/* 3-State Toggle Button Group */}
                <div className="w-full sm:w-[300px] mt-2 sm:mt-0 flex bg-surface-bright border border-outline-variant rounded-lg overflow-hidden shadow-sm h-10">
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(student.studentId, "PRESENT")}
                    disabled={!isAuthorized}
                    className={`flex-1 sm:w-[100px] flex items-center justify-center gap-1 font-label-md transition-colors border-r border-outline-variant last:border-r-0 ${
                      currentStatus === "PRESENT"
                        ? "bg-primary text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
                    }`}
                  >
                    <Icon name="check_circle" className="text-[18px]" />
                    <span>{t("present")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(student.studentId, "LATE")}
                    disabled={!isAuthorized}
                    className={`flex-1 sm:w-[100px] flex items-center justify-center gap-1 font-label-md transition-colors border-r border-outline-variant last:border-r-0 ${
                      currentStatus === "LATE"
                        ? "bg-[#fbbc04] text-[#3d3000]"
                        : "text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
                    }`}
                  >
                    <Icon name="schedule" className="text-[18px]" />
                    <span>{t("late")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(student.studentId, "ABSENT")}
                    disabled={!isAuthorized}
                    className={`flex-1 sm:w-[100px] flex items-center justify-center gap-1 font-label-md transition-colors ${
                      currentStatus === "ABSENT"
                        ? "bg-error text-on-error"
                        : "text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
                    }`}
                  >
                    <Icon name="cancel" className="text-[18px]" />
                    <span>{t("absent")}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
