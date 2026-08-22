"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export interface StudentResultInput {
  studentId: string;
  marksObtained: number;
  totalMarks?: number;
  grade?: string;
}

export async function saveResultsAction({
  examName,
  batchId,
  subject,
  results,
}: {
  examName: string;
  batchId: string;
  subject: string;
  results: StudentResultInput[];
}) {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { success: false, error: "Unauthorized" };
  }

  const instituteId = session.user.instituteId;
  const userId = session.user.id;

  if (!examName || !batchId || !subject || !results || results.length === 0) {
    return { success: false, error: "Missing required parameters or empty results list" };
  }

  // Explicit Institute-Ownership Check for batchId
  const batch = await prisma.batch.findUnique({
    where: { id: batchId, instituteId },
    select: { id: true, name: true, teacherId: true },
  });

  if (!batch) {
    return { success: false, error: "Batch not found in your institute" };
  }

  // Authorization check for teachers
  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher || batch.teacherId !== teacher.id) {
      return { success: false, error: "You are not authorized to save results for this batch" };
    }
  }

  // Verify all studentIds belong to this institute
  const studentIds = results.map((r) => r.studentId);
  const validStudents = await prisma.student.findMany({
    where: {
      id: { in: studentIds },
      instituteId,
    },
    select: { id: true },
  });

  const validStudentIdSet = new Set(validStudents.map((s) => s.id));
  const filteredResults = results.filter((r) => validStudentIdSet.has(r.studentId));

  if (filteredResults.length === 0) {
    return { success: false, error: "No valid students found in your institute for this result batch" };
  }

  try {
    // Save/Upsert result records for each valid student
    for (const item of filteredResults) {
      const total = item.totalMarks || 100;
      const marks = Math.min(total, Math.max(0, item.marksObtained));
      const percentage = (marks / total) * 100;

      let calculatedGrade = item.grade;
      if (!calculatedGrade) {
        if (percentage >= 80) calculatedGrade = "A+";
        else if (percentage >= 70) calculatedGrade = "A";
        else if (percentage >= 60) calculatedGrade = "A-";
        else if (percentage >= 50) calculatedGrade = "B";
        else if (percentage >= 40) calculatedGrade = "C";
        else if (percentage >= 33) calculatedGrade = "D";
        else calculatedGrade = "F";
      }

      // Check if result already exists for this student+batch+examName+subject
      const existing = await prisma.result.findFirst({
        where: {
          instituteId,
          studentId: item.studentId,
          batchId,
          examName,
          subject,
        },
      });

      if (existing) {
        await prisma.result.update({
          where: { id: existing.id },
          data: {
            marksObtained: marks,
            totalMarks: total,
            grade: calculatedGrade,
          },
        });
      } else {
        await prisma.result.create({
          data: {
            instituteId,
            studentId: item.studentId,
            batchId,
            examName,
            subject,
            marksObtained: marks,
            totalMarks: total,
            grade: calculatedGrade,
          },
        });
      }
    }

    // Write ActivityLog entry
    await prisma.activityLog.create({
      data: {
        instituteId,
        userId,
        action: "RESULTS_SAVED",
        details: `Saved results for ${filteredResults.length} students in ${batch.name} - Exam: ${examName} (${subject})`,
      },
    });

    revalidatePath("/results");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Successfully saved marks for ${filteredResults.length} students!`,
    };
  } catch (error: any) {
    console.error("Failed to save results:", error);
    return { success: false, error: error.message || "Failed to save results" };
  }
}
