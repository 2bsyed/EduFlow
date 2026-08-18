"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { AttendanceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function upsertAttendanceAction(
  studentId: string,
  batchId: string,
  dateStr: string,
  status: AttendanceStatus
) {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { success: false, error: "Unauthorized" };
  }

  const instituteId = session.user.instituteId;
  const userId = session.user.id;
  const parsedDate = new Date(dateStr);
  parsedDate.setHours(0, 0, 0, 0);

  // Explicit Institute-Ownership Check for studentId
  const student = await prisma.student.findUnique({
    where: { id: studentId, instituteId },
  });
  if (!student) {
    return { success: false, error: "Student not found in your institute" };
  }

  // Authorization check for teachers
  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
    });
    const batch = await prisma.batch.findUnique({
      where: { id: batchId, instituteId },
    });
    if (!teacher || batch?.teacherId !== teacher.id) {
      return { success: false, error: "You are not authorized to mark attendance for this batch" };
    }
  }

  try {
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_batchId_date: {
          studentId,
          batchId,
          date: parsedDate,
        },
      },
      update: {
        status,
        markedBy: session.user.name || userId,
      },
      create: {
        instituteId,
        studentId,
        batchId,
        date: parsedDate,
        status,
        markedBy: session.user.name || userId,
      },
    });

    revalidatePath("/attendance");
    revalidatePath("/dashboard");

    return { success: true, attendance };
  } catch (error: any) {
    console.error("Failed to upsert attendance:", error);
    return { success: false, error: error.message || "Failed to save attendance" };
  }
}

export async function bulkMarkPresentAction(
  batchId: string,
  dateStr: string,
  studentIds: string[]
) {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { success: false, error: "Unauthorized" };
  }

  const instituteId = session.user.instituteId;
  const userId = session.user.id;
  const parsedDate = new Date(dateStr);
  parsedDate.setHours(0, 0, 0, 0);

  // Explicit Institute-Ownership Check for studentIds
  const validStudents = await prisma.student.findMany({
    where: {
      id: { in: studentIds },
      instituteId,
    },
    select: { id: true },
  });

  const validStudentIds = validStudents.map((s) => s.id);
  if (validStudentIds.length === 0) {
    return { success: false, error: "No valid students found in your institute" };
  }

  // Authorization check for teachers
  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
    });
    const batch = await prisma.batch.findUnique({
      where: { id: batchId, instituteId },
    });
    if (!teacher || batch?.teacherId !== teacher.id) {
      return { success: false, error: "You are not authorized to mark attendance for this batch" };
    }
  }

  try {
    await Promise.all(
      validStudentIds.map((studentId) =>
        prisma.attendance.upsert({
          where: {
            studentId_batchId_date: {
              studentId,
              batchId,
              date: parsedDate,
            },
          },
          update: {
            status: "PRESENT",
            markedBy: session.user.name || userId,
          },
          create: {
            instituteId,
            studentId,
            batchId,
            date: parsedDate,
            status: "PRESENT",
            markedBy: session.user.name || userId,
          },
        })
      )
    );

    revalidatePath("/attendance");
    revalidatePath("/dashboard");

    return { success: true, message: `Marked ${validStudentIds.length} students present` };
  } catch (error: any) {
    console.error("Failed to bulk mark attendance present:", error);
    return { success: false, error: error.message || "Failed to bulk save attendance" };
  }
}
