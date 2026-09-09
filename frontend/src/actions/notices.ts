"use server";

import { fetchApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createNoticeAction(formData: FormData): Promise<void> {
  const title = formData.get("title") as string;
  const category = (formData.get("category") as string) || "ACADEMIC";
  const urgent = formData.get("urgent") === "true";
  const targetScope = (formData.get("targetScope") as string) || "EVERYONE";
  const batchId = (formData.get("batchId") as string) || null;
  const content = formData.get("content") as string;

  if (!title || !content) return;

  try {
    await fetchApi("/api/v1/core/notices", {
      method: "POST",
      body: JSON.stringify({
        title,
        category,
        urgent,
        targetScope,
        batchId,
        content
      }),
    });

    revalidatePath("/notices");
    revalidatePath("/student/notices");
    revalidatePath("/dashboard");
    revalidatePath("/teacher");
  } catch (err) {
    console.error("Failed to post notice:", err);
  }
}
