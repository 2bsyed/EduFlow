"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function sendFeeReminderAction(studentId: string, studentName: string, amount: string) {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { success: false, error: "Unauthorized" };
  }

  const instituteId = session.user.instituteId;
  const userId = session.user.id;

  // Explicit Institute-Ownership Check for studentId
  const student = await prisma.student.findUnique({
    where: { id: studentId, instituteId },
  });

  if (!student) {
    return { success: false, error: "Student not found in your institute" };
  }

  try {
    await prisma.activityLog.create({
      data: {
        instituteId,
        userId,
        action: "FEE_REMINDER_SENT",
        details: `Sent fee reminder to ${student.fullName} for amount ৳ ${amount}`,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, message: `Reminder sent to ${student.fullName}` };
  } catch (error) {
    console.error("Failed to record fee reminder activity:", error);
    return { success: false, error: "Failed to send reminder" };
  }
}
