"use server";

import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
import { fetchApi } from "@/lib/api";

export async function recordPaymentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { success: false, error: "Unauthorized" };
  }

  const studentId = formData.get("studentId") as string;
  const amountStr = formData.get("amount") as string;
  const dateStr = formData.get("date") as string;
  const paymentMethod = (formData.get("paymentMethod") as string) || "CASH";
  const receiptNo = (formData.get("receiptNo") as string) || `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;

  if (!studentId || !amountStr || !dateStr) {
    return { success: false, error: "Please fill in all required fields" };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Invalid payment amount" };
  }

  try {
    await fetchApi("/api/v1/fees/", {
      method: "POST",
      body: JSON.stringify({
        student_id: studentId,
        amount: amount,
        date: dateStr,
        payment_method: paymentMethod,
        receipt_no: receiptNo
      }),
    });

    revalidatePath("/fees");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Recorded payment successfully`,
      receiptNo,
    };
  } catch (error: any) {
    console.error("Failed to record fee payment:", error);
    return { success: false, error: error.message || "Failed to record payment" };
  }
}
