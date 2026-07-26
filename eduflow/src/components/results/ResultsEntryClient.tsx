"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { saveResultsAction } from "@/app/actions/results";

export interface StudentRow {
  studentId: string;
  fullName: string;
  rollNo: string;
  photoUrl?: string | null;
  initialMarks?: number | null;
}

export interface BatchOption {
  id: string;
  name: string;
}

interface ResultsEntryClientProps {
  batches: BatchOption[];
  initialBatchId: string;
  students: StudentRow[];
  initialExamName?: string;
  initialSubject?: string;
}

export function ResultsEntryClient({
  batches,
  initialBatchId,
  students,
  initialExamName = "First Term 2024",
  initialSubject = "Mathematics",
}: ResultsEntryClientProps) {
  const [selectedExam, setSelectedExam] = useState(initialExamName);
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);

  // Map of studentId -> marks string
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const initialMap: Record<string, string> = {};
    students.forEach((s) => {
      initialMap[s.studentId] = s.initialMarks !== undefined && s.initialMarks !== null ? String(s.initialMarks) : "";
    });
    setMarksMap(initialMap);
  }, [students]);

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  // Grade Calculation Helper
  const calculateGrade = (marksStr: string) => {
    if (!marksStr || isNaN(Number(marksStr))) return { grade: "-", class: "bg-surface-variant text-on-surface-variant" };
    const marks = Number(marksStr);
    if (marks >= 80) return { grade: "A+", class: "bg-secondary-container text-on-secondary-container font-bold" };
    if (marks >= 70) return { grade: "A", class: "bg-primary-fixed text-on-primary-fixed font-bold" };
    if (marks >= 60) return { grade: "A-", class: "bg-primary-fixed-dim text-on-primary-fixed-variant font-bold" };
    if (marks >= 50) return { grade: "B", class: "bg-tertiary-fixed text-on-tertiary-fixed font-bold" };
    if (marks >= 40) return { grade: "C", class: "bg-tertiary-container text-on-tertiary-container font-bold" };
    if (marks >= 33) return { grade: "D", class: "bg-surface-container-high text-on-surface-variant font-bold" };
    return { grade: "F", class: "bg-error-container text-on-error-container font-bold" };
  };

  // Compute summary stats
  const { enteredCount, averageScore } = useMemo(() => {
    let count = 0;
    let sum = 0;
    Object.values(marksMap).forEach((val) => {
      if (val !== "" && !isNaN(Number(val))) {
        count++;
        sum += Number(val);
      }
    });
    return {
      enteredCount: count,
      averageScore: count > 0 ? (sum / count).toFixed(1) : "0.0",
    };
  }, [marksMap]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    const resultPayload = Object.entries(marksMap)
      .filter(([_, val]) => val !== "" && !isNaN(Number(val)))
      .map(([studentId, val]) => ({
        studentId,
        marksObtained: Number(val),
        totalMarks: 100,
        grade: calculateGrade(val).grade,
      }));

    if (resultPayload.length === 0) {
      setStatusMessage({ type: "error", text: "Please enter marks for at least one student." });
      setIsSaving(false);
      return;
    }

    const res = await saveResultsAction({
      examName: selectedExam,
      batchId: selectedBatchId,
      subject: selectedSubject,
      results: resultPayload,
    });

    setIsSaving(false);

    if (res.success) {
      setStatusMessage({ type: "success", text: res.message || "Results saved successfully!" });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to save results." });
    }
  };

  const examSlug = selectedExam.toLowerCase().replace(/[^a-z0-9]/g, "-");

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* Page Header & Parameter Controls */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
        <div className="w-full md:w-auto">
          <h1 className="font-h2 text-h2 font-semibold text-on-surface mb-sm">Results Entry</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Select parameters to begin entering marks.
          </p>
        </div>

        <div className="flex flex-col md:flex-row w-full md:w-auto gap-md items-end">
          <div className="flex gap-md w-full md:w-auto flex-wrap">
            {/* Exam Selector */}
            <div className="flex flex-col gap-xs min-w-[150px]">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Select Exam
              </label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm px-sm py-xs focus:ring-primary focus:border-primary shadow-sm cursor-pointer"
              >
                <option value="First Term 2024">First Term 2024</option>
                <option value="Mid Term 2024">Mid Term 2024</option>
                <option value="Finals 2023">Finals 2023</option>
              </select>
            </div>

            {/* Batch Selector */}
            <div className="flex flex-col gap-xs min-w-[150px]">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Select Batch
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm px-sm py-xs focus:ring-primary focus:border-primary shadow-sm cursor-pointer"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selector */}
            <div className="flex flex-col gap-xs min-w-[150px]">
              <label className="font-label-md text-label-md text-on-surface-variant font-medium">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface text-on-surface font-body-sm px-sm py-xs focus:ring-primary focus:border-primary shadow-sm cursor-pointer"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Advanced Physics">Advanced Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Computer Science">Computer Science</option>
                <option value="English Literature">English Literature</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full md:w-auto bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-sm h-[42px] cursor-pointer disabled:opacity-50"
          >
            <Icon name="save" className="text-[18px]" />
            <span>{isSaving ? "Saving..." : "Save Results"}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-md rounded-lg font-body-sm flex items-center gap-sm ${
            statusMessage.type === "success"
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-error-container text-on-error-container"
          }`}
        >
          <Icon name={statusMessage.type === "success" ? "check_circle" : "error"} className="text-[20px]" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Spreadsheet Grid */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-md p-md border-b border-outline-variant bg-surface-container-low font-label-md text-label-md text-on-surface-variant sticky top-0 z-10 font-semibold">
          <div className="col-span-4 md:col-span-4 flex items-center">Student</div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center">Roll</div>
          <div className="col-span-3 md:col-span-3 flex items-center justify-center">
            Mark Entry (/100)
          </div>
          <div className="col-span-1 md:col-span-2 flex items-center justify-center">Total</div>
          <div className="col-span-1 md:col-span-1 flex items-center justify-center">Grade</div>
          <div className="col-span-1 md:col-span-1 flex items-center justify-end">Report Card</div>
        </div>

        {/* Table Body (Scrollable) */}
        <div className="overflow-y-auto flex-1 divide-y divide-surface-variant">
          {students.length === 0 ? (
            <div className="p-xl text-center text-on-surface-variant font-body-md">
              No students enrolled in this batch.
            </div>
          ) : (
            students.map((student) => {
              const currentMarks = marksMap[student.studentId] || "";
              const gradeInfo = calculateGrade(currentMarks);
              const initials = student.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={student.studentId}
                  className="data-row grid grid-cols-12 gap-md p-md items-center hover:bg-surface-bright transition-colors"
                >
                  {/* Student Info */}
                  <div className="col-span-4 md:col-span-4 flex items-center gap-md">
                    {student.photoUrl ? (
                      <img
                        src={student.photoUrl}
                        alt={student.fullName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-md font-bold shrink-0">
                        {initials}
                      </div>
                    )}
                    <span className="font-label-md text-label-md text-on-surface font-medium truncate">
                      {student.fullName}
                    </span>
                  </div>

                  {/* Roll No */}
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center font-body-sm text-on-surface-variant">
                    {student.rollNo}
                  </div>

                  {/* Marks Input */}
                  <div className="col-span-3 md:col-span-3 flex justify-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentMarks}
                      onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                      placeholder="-"
                      className="w-20 text-center rounded border border-outline-variant bg-surface text-on-surface font-body-sm py-1 focus:ring-primary focus:border-primary shadow-sm outline-none font-semibold"
                    />
                  </div>

                  {/* Total */}
                  <div className="col-span-1 md:col-span-2 flex items-center justify-center font-body-md text-on-surface font-medium">
                    {currentMarks !== "" ? currentMarks : "-"}
                  </div>

                  {/* Grade */}
                  <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                    <span
                      className={`px-sm py-xs rounded-full font-label-md text-caption ${gradeInfo.class}`}
                    >
                      {gradeInfo.grade}
                    </span>
                  </div>

                  {/* Report Card Link */}
                  <div className="col-span-1 md:col-span-1 flex items-center justify-end">
                    <Link
                      href={`/results/report-card/${student.studentId}/${examSlug}`}
                      className="p-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                      title="View Report Card"
                    >
                      <Icon name="description" className="text-[20px]" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table Footer / Summary Strip */}
        <div className="bg-surface-container p-md border-t border-outline-variant flex justify-between items-center text-body-sm text-on-surface-variant">
          <div>
            Showing {students.length} of {students.length} students
          </div>
          <div className="flex gap-md font-medium">
            <span>
              Average: <strong>{averageScore}</strong>
            </span>
            <span>
              Entered:{" "}
              <strong>
                {enteredCount}/{students.length}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
