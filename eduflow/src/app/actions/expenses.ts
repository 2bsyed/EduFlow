"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createExpenseAction(formData: FormData): Promise<void> {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  if (!instituteId) return;

  const title = formData.get("title") as string;
  const category = (formData.get("category") as string) || "General";
  const amountStr = formData.get("amount") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!title || !amountStr) return;

  try {
    await prisma.expense.create({
      data: {
        instituteId,
        title,
        category,
        amount: parseFloat(amountStr),
        recordedBy: session?.user?.name || "Admin",
        notes,
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Failed to record expense:", err);
  }
}
