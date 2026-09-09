"use server";

import { fetchApi } from "@/lib/api";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";

export async function upsertAttendanceAction(
  studentId: string,
  batchId: string,
  dateStr: string,
  status: string
) {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { success: false, error: "Unauthorized" };
  }

  const instituteId = session.user.instituteId;
  const parsedDate = new Date(dateStr);
  parsedDate.setHours(0, 0, 0, 0);

  // Use API
  const student = await fetchApi(`/api/v1/students/${studentId}`);
  if (!student) {
    return { success: false, error: "Student not found in your institute" };
  }

  if (session.user.role === "TEACHER") {
    const teacher = await fetchApi("/api/v1/teachers/me");
    const batch = await fetchApi(`/api/v1/batches/${batchId}`);
    if (!teacher || batch?.teacherId !== teacher.id) {
      return { success: false, error: "You are not authorized to mark attendance for this batch" };
    }
  }

  try {
    const attendance = await fetchApi(`/api/v1/attendance/upsert`, { 
      method: "POST", 
      body: JSON.stringify({
        studentId,
        batchId,
        date: parsedDate.toISOString(),
        dateStr: parsedDate.toISOString(),
        status
      }) 
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

  const parsedDate = new Date(dateStr);
  parsedDate.setHours(0, 0, 0, 0);

  // Explicit Institute-Ownership Check for studentIds
  const validStudents = await fetchApi("/api/v1/students/");

  const validStudentIds = validStudents.map((s: any) => s.id);
  if (validStudentIds.length === 0) {
    return { success: false, error: "No valid students found in your institute" };
  }

  // Authorization check for teachers
  if (session.user.role === "TEACHER") {
    const teacher = await fetchApi("/api/v1/teachers/me");
    const batch = await fetchApi(`/api/v1/batches/${batchId}`);
    if (!teacher || batch?.teacherId !== teacher.id) {
      return { success: false, error: "You are not authorized to mark attendance for this batch" };
    }
  }

  try {
    await fetchApi("/api/v1/attendance/bulk-present", {
      method: "POST",
      body: JSON.stringify({
        batchId,
        date: parsedDate.toISOString(),
        dateStr: parsedDate.toISOString(),
        studentIds: validStudentIds
      }),
    });

    revalidatePath("/attendance");
    revalidatePath("/dashboard");

    return { success: true, message: `Marked ${validStudentIds.length} students present` };
  } catch (error: any) {
    console.error("Failed to bulk mark attendance present:", error);
    return { success: false, error: error.message || "Failed to bulk save attendance" };
  }
}
