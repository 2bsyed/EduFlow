"use client";

import React, { useState } from "react";
import { sendFeeReminderAction } from "@/app/actions/dashboard";

interface PendingStudent {
  studentId: string;
  studentName: string;
  amount: string;
}

interface PendingReminderListProps {
  students: PendingStudent[];
}

export function PendingReminderList({ students }: PendingReminderListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  const handleSendReminder = async (studentId: string, name: string, amount: string) => {
    setLoadingId(studentId);
    const res = await sendFeeReminderAction(studentId, name, amount);
    setLoadingId(null);

    if (res.success) {
      setSentMap((prev) => ({ ...prev, [studentId]: true }));
    }
  };

  if (!students || students.length === 0) {
    return (
      <div className="p-lg text-center font-body-sm text-on-surface-variant">
        No pending fee reminders found. All clear!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-sm">
      {students.map((student, idx) => {
        const initial = student.studentName.charAt(0).toUpperCase();
        const isSent = sentMap[student.studentId];
        const isLoading = loadingId === student.studentId;

        return (
          <React.Fragment key={student.studentId}>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low border border-transparent hover:border-outline-variant/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold text-lg">
                  {initial}
                </div>
                <div>
                  <p className="font-label-md text-on-surface">{student.studentName}</p>
                  <p className="font-caption text-error font-medium">Due: ৳{student.amount}</p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleSendReminder(student.studentId, student.studentName, student.amount)
                }
                disabled={isLoading || isSent}
                className={`px-3 py-1.5 border rounded-md font-label-md text-xs transition-colors cursor-pointer ${
                  isSent
                    ? "bg-secondary-container text-on-secondary-container border-secondary cursor-default"
                    : "border-primary text-primary hover:bg-primary/5 disabled:opacity-50"
                }`}
              >
                {isLoading ? "Sending..." : isSent ? "Sent ✓" : "Remind"}
              </button>
            </div>
            {idx < students.length - 1 && <hr className="border-outline-variant/30" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
