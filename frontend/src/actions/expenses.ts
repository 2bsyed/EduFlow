"use server";

import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api";

export async function createExpenseAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.instituteId) return;

  const title = formData.get("title") as string;
  const category = (formData.get("category") as string) || "General";
  const amountStr = formData.get("amount") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!title || !amountStr) return;

  try {
    await fetchApi("/api/v1/expenses/", {
      method: "POST",
      body: JSON.stringify({
        title,
        category,
        amount: parseFloat(amountStr),
        notes,
      }),
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
  } catch (err) {
    console.error("Failed to record expense:", err);
  }
}
