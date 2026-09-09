"use server";

import { fetchApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function sendFeeReminderAction(studentId: string, studentName: string, amount: string) {
  try {
    const data = await fetchApi("/api/v1/core/dashboard/fee-reminder", {
      method: "POST",
      body: JSON.stringify({ studentId, amount }),
    });
    
    revalidatePath("/dashboard");
    return { success: true, message: data.message };
  } catch (error: any) {
    console.error("Failed to record fee reminder activity:", error);
    return { success: false, error: error.message || "Failed to send reminder" };
  }
}
