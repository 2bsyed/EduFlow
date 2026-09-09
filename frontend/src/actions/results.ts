"use server";

import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api";

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

  try {
    const data = await fetchApi("/api/v1/results/save", {
      method: "POST",
      body: JSON.stringify({
        examName,
        batchId,
        subject,
        results,
      }),
    });

    revalidatePath("/results");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: data?.message || "Successfully saved marks!",
    };
  } catch (error: any) {
    console.error("Failed to save results via API:", error);
    return { success: false, error: error.message || "Failed to save results" };
  }
}
