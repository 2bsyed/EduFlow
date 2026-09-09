"use server";

import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api";

export async function createBatchAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.instituteId) return;

  const name = formData.get("name") as string;
  const subject = formData.get("subject") as string;
  const schedule = formData.get("schedule") as string;
  const feeStr = formData.get("monthlyFee") as string;
  const teacherId = (formData.get("teacherId") as string) || null;

  if (!name) return;

  try {
    await fetchApi("/api/v1/batches/", {
      method: "POST",
      body: JSON.stringify({
        name,
        subject,
        schedule,
        monthly_fee: feeStr ? parseFloat(feeStr) : 0,
        teacher_id: teacherId,
      }),
    });

    revalidatePath("/batches");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Failed to create batch:", err);
  }
}

export async function assignStudentToBatchAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.instituteId) return;

  const studentId = formData.get("studentId") as string;
  const batchId = formData.get("batchId") as string;

  if (!studentId || !batchId) return;

  try {
    await fetchApi("/api/v1/batches/assign", {
      method: "POST",
      body: JSON.stringify({
        student_id: studentId,
        batch_id: batchId,
      }),
    });

    revalidatePath("/batches");
    revalidatePath("/students");
  } catch (err) {
    console.error("Failed to assign student to batch:", err);
  }
}
