import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { Icon } from "@/components/ui/Icon";
import { PrintButton } from "@/components/results/PrintButton";

interface ReportCardPageProps {
  params: Promise<{
    studentId: string;
    examId: string;
  }>;
}

export default async function ReportCardPage({ params }: ReportCardPageProps) {
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

  const { studentId, examId } = await params;

  // Fetch Student details
  const student = await prisma.student.findUnique({
    where: { id: studentId, instituteId },
    include: {
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
        Student not found.
      </div>
    );
  }

  // Security Check: If logged in as STUDENT, enforce that this is THEIR report card
  if (role === "STUDENT" && student.userId !== userId) {
    return (
      <div className="p-margin text-center font-body-md text-error">
        Unauthorized access: You cannot view another student's report card.
      </div>
    );
  }

  // Fetch Institute details
  const institute = await prisma.institute.findUnique({
    where: { id: instituteId },
  });

  // Decode exam name from examId slug
  const examNameClean = examId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Fetch all results for this student
  const results = await prisma.result.findMany({
    where: {
      instituteId,
      studentId,
    },
    orderBy: { subject: "asc" },
  });

  // Default sample subjects if none exist yet in database
  const sampleSubjects = [
    { subject: "Advanced Mathematics", marksObtained: 92, highestMarks: 98, grade: "A+", remarks: "Excellent logical reasoning." },
    { subject: "Physics", marksObtained: 88, highestMarks: 95, grade: "A", remarks: "Good grasp of concepts." },
    { subject: "Chemistry", marksObtained: 95, highestMarks: 97, grade: "A+", remarks: "Outstanding practical work." },
    { subject: "Computer Science", marksObtained: 100, highestMarks: 100, grade: "A+", remarks: "Perfect score. Exceptional." },
    { subject: "English Literature", marksObtained: 84, highestMarks: 92, grade: "B+", remarks: "Needs more focus on essays." },
  ];

  const displaySubjects =
    results.length > 0
      ? results.map((r) => ({
          subject: r.subject,
          marksObtained: Number(r.marksObtained),
          highestMarks: 98,
          grade: r.grade || "A",
          remarks: r.comments || "Good effort.",
        }))
      : sampleSubjects;

  // Compute total marks
  const totalObtained = displaySubjects.reduce((acc, curr) => acc + curr.marksObtained, 0);
  const totalMax = displaySubjects.length * 100;
  const avgMarks = displaySubjects.length > 0 ? (totalObtained / displaySubjects.length) : 0;

  // Compute sample GPA
  let gpa = "3.85";
  if (avgMarks >= 80) gpa = "4.00";
  else if (avgMarks >= 70) gpa = "3.50";
  else if (avgMarks >= 60) gpa = "3.00";

  const batchName = student.studentBatches[0]?.batch?.name || "Grade 10 - Science A";

  const backUrl = role === "STUDENT" ? "/student/results" : "/results";

  return (
    <div className="bg-surface text-on-surface min-h-screen py-xl px-md flex flex-col items-center font-sans print:py-0 print:px-0 print:bg-white">
      {/* Action Bar (Hidden in print) */}
      <div className="print:hidden w-full max-w-[210mm] flex justify-between items-center mb-lg">
        <Link
          href={backUrl}
          className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md font-medium"
        >
          <Icon name="arrow_back" className="text-[20px]" />
          <span>Back to Results</span>
        </Link>
        <PrintButton />
      </div>

      {/* A4 Document Container */}
      <div className="a4-container bg-surface-container-lowest w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-outline-variant p-[40px] flex flex-col relative print:shadow-none print:border-none print:m-0 print:w-full print:max-w-full print:p-0">
        {/* Header Section */}
        <div className="flex items-start justify-between border-b-2 border-primary pb-lg mb-lg">
          <div className="flex items-center gap-md">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-sm shrink-0">
              <Icon name="school" className="text-[36px]" />
            </div>
            <div>
              <h1 className="font-h3 text-h3 text-primary tracking-tight font-bold m-0">
                {institute?.name || "EduFlow Academy"}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant m-0 mt-xs">
                {institute?.address || "123 Education Boulevard, Knowledge City, Dhaka"}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant m-0">
                {institute?.email || "contact@eduflow.edu.bd"} | {institute?.phone || "+880 1700-000000"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block border border-outline-variant rounded px-md py-xs bg-surface-container-low mb-sm">
              <span className="font-label-md text-caption text-on-surface-variant uppercase tracking-wider block">
                Academic Year
              </span>
              <p className="font-h4 text-h4 text-on-surface font-bold m-0">2023 - 2024</p>
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-lg">
          <h2 className="font-h4 text-h4 text-on-surface uppercase tracking-widest border-b border-outline-variant inline-block pb-xs font-bold">
            Student Performance Report
          </h2>
        </div>

        {/* Student Bio Section */}
        <div className="grid grid-cols-2 gap-x-xl gap-y-md border border-outline-variant rounded-lg p-lg mb-xl bg-surface-bright">
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
              Student Name
            </span>
            <span className="font-body-lg text-body-lg text-on-surface font-bold">
              {student.fullName}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
              Roll Number
            </span>
            <span className="font-body-lg text-body-lg text-on-surface font-bold font-mono">
              {student.rollNo}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
              Batch / Grade
            </span>
            <span className="font-body-md text-body-md text-on-surface font-medium">
              {batchName}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
              Examination
            </span>
            <span className="font-body-md text-body-md text-on-surface font-medium">
              {examNameClean}
            </span>
          </div>
        </div>

        {/* Marks Table */}
        <div className="mb-xl flex-grow">
          <table className="w-full border-collapse border border-outline-variant text-left">
            <thead>
              <tr className="bg-surface-container border-b-2 border-outline-variant">
                <th className="font-label-md text-label-md text-on-surface py-sm px-md border-r border-outline-variant w-1/3 font-bold">
                  Subject
                </th>
                <th className="font-label-md text-label-md text-on-surface py-sm px-md border-r border-outline-variant text-center font-bold">
                  Marks Obt.
                </th>
                <th className="font-label-md text-label-md text-on-surface py-sm px-md border-r border-outline-variant text-center font-bold">
                  Highest
                </th>
                <th className="font-label-md text-label-md text-on-surface py-sm px-md border-r border-outline-variant text-center font-bold">
                  Grade
                </th>
                <th className="font-label-md text-label-md text-on-surface py-sm px-md text-center font-bold">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface">
              {displaySubjects.map((sub, idx) => (
                <tr key={idx} className="border-b border-outline-variant">
                  <td className="py-sm px-md border-r border-outline-variant font-medium">
                    {sub.subject}
                  </td>
                  <td className="py-sm px-md border-r border-outline-variant text-center font-semibold">
                    {sub.marksObtained}
                  </td>
                  <td className="py-sm px-md border-r border-outline-variant text-center text-on-surface-variant">
                    {sub.highestMarks}
                  </td>
                  <td className="py-sm px-md border-r border-outline-variant text-center font-bold text-primary">
                    {sub.grade}
                  </td>
                  <td className="py-sm px-md text-center text-on-surface-variant">
                    {sub.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Cards Section */}
        <div className="flex gap-md mb-xl justify-end">
          <div className="border border-outline-variant rounded-lg p-md bg-surface-container-low min-w-[120px] text-center">
            <span className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
              Total Marks
            </span>
            <span className="block font-h4 text-h4 text-primary font-bold">
              {totalObtained}{" "}
              <span className="text-on-surface-variant font-body-sm text-body-sm font-normal">
                / {totalMax}
              </span>
            </span>
          </div>
          <div className="border border-outline-variant rounded-lg p-md bg-surface-container-low min-w-[120px] text-center">
            <span className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
              GPA
            </span>
            <span className="block font-h4 text-h4 text-primary font-bold">{gpa}</span>
          </div>
          <div className="border border-outline-variant rounded-lg p-md bg-surface-container-low min-w-[120px] text-center">
            <span className="block font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-xs">
              Attendance
            </span>
            <span className="block font-h4 text-h4 text-primary font-bold">96%</span>
          </div>
        </div>

        {/* Teacher Remarks Box */}
        <div className="border border-outline-variant rounded-lg p-md mb-xl bg-surface-bright">
          <span className="block font-label-md text-label-md text-on-surface font-semibold mb-sm">
            Class Teacher's Remarks:
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant italic m-0">
            "{student.fullName} is a dedicated and highly motivated student. Her performance in STEM subjects is particularly commendable. With continued focus on humanities, she will achieve even greater overall success. Keep up the excellent work!"
          </p>
        </div>

        {/* Signatures (Pushed to bottom) */}
        <div className="mt-auto pt-xl flex justify-between items-end px-lg">
          <div className="flex flex-col items-center w-48">
            <div className="w-full border-b border-on-surface mb-sm"></div>
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Class Teacher
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              Mr. Robert Harrison
            </span>
          </div>

          <div className="flex flex-col items-center w-48 relative">
            <div className="w-16 h-16 rounded-full border border-outline-variant opacity-20 flex items-center justify-center mb-[-40px] z-0">
              <Icon name="verified" className="text-[32px] text-outline-variant" />
            </div>
            <div className="w-full border-b border-on-surface mb-sm relative z-10"></div>
            <span className="font-label-md text-label-md text-on-surface font-semibold relative z-10">
              Principal / Director
            </span>
            <span className="font-caption text-caption text-on-surface-variant relative z-10">
              Dr. Eleanor Vance
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-xl text-center border-t border-outline-variant pt-sm">
          <p className="font-caption text-caption text-on-surface-variant m-0">
            This document is electronically generated and does not require a physical seal to be considered valid for internal academic review.
          </p>
        </div>
      </div>
    </div>
  );
}
