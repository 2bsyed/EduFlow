"use server";

import { fetchApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createNoticeAction(formData: FormData): Promise<void> {
  const title = (formData.get("title") as string)?.trim();
  const category = (formData.get("category") as string) || "ACADEMIC";
  const urgent = formData.get("urgent") === "true";
  const rawTarget = (formData.get("targetScope") as string) || "EVERYONE";
  let targetScope = "EVERYONE";
  let batchId: string | null = (formData.get("batchId") as string) || null;

  if (rawTarget.startsWith("BATCH:")) {
    targetScope = "BATCH";
    batchId = rawTarget.replace("BATCH:", "");
  } else if (rawTarget !== "EVERYONE" && rawTarget.length > 0) {
    targetScope = "BATCH";
    batchId = rawTarget;
  }

  const content = (formData.get("content") as string)?.trim();

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
        content,
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
