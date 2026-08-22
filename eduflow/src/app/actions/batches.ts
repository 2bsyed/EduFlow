"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createBatchAction(formData: FormData): Promise<void> {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  if (!instituteId) return;

  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const schedule = formData.get("schedule") as string;
  const feeStr = formData.get("monthlyFee") as string;
  const teacherId = (formData.get("teacherId") as string) || null;

  if (!name) return;

  try {
    await prisma.batch.create({
      data: {
        instituteId,
        name,
        subject,
        schedule,
        monthlyFee: feeStr ? parseFloat(feeStr) : 0,
        teacherId: teacherId || null,
      },
    });

    revalidatePath("/batches");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Failed to create batch:", err);
  }
}

export async function assignStudentToBatchAction(formData: FormData): Promise<void> {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  if (!instituteId) return;

  const studentId = formData.get("studentId") as string;
  const batchId = formData.get("batchId") as string;

  if (!studentId || !batchId) return;

  // Explicit Institute-Ownership Verification for studentId and batchId
  const student = await prisma.student.findUnique({
    where: { id: studentId, instituteId },
  });
  const batch = await prisma.batch.findUnique({
    where: { id: batchId, instituteId },
  });

  if (!student || !batch) {
    console.error("Unauthorized cross-tenant attempt in assignStudentToBatchAction");
    return;
  }

  try {
    await prisma.studentBatch.upsert({
      where: {
        studentId_batchId: { studentId, batchId },
      },
      update: {},
      create: {
        instituteId,
        studentId,
        batchId,
      },
    });

    revalidatePath("/batches");
    revalidatePath("/students");
  } catch (err) {
    console.error("Failed to assign student to batch:", err);
  }
}
