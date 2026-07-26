"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { PaymentMethod, FeeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/*
  ========================================================================================
  TODO: PAYMENT GATEWAY INTEGRATION PASS
  ----------------------------------------------------------------------------------------
  Currently stubbed via processPayment() to mark payments as completed in development.
  When real SSLCommerz or Moneybag aggregator API credentials arrive:
  1. Swap processPayment() to initiate payment gateway session:
     - SSLCommerz: POST to /gwprocess/v4/api.php with store_id, store_passwd, total_amount, etc.
     - Moneybag: POST to /api/v1/checkout/create-session
  2. Implement webhook handler at /api/payments/ipn to verify signature & payload.
  3. Update Fee status to PAID, set paymentDate & transactionId upon gateway IPN callback.
  ========================================================================================
*/
async function processPayment(method: PaymentMethod, amount: number) {
  return {
    transactionId: `${method.toLowerCase()}_tx_${Date.now()}`,
    status: "PAID" as FeeStatus,
  };
}

export async function recordPaymentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { success: false, error: "Unauthorized" };
  }

  const instituteId = session.user.instituteId;
  const userId = session.user.id;

  const studentId = formData.get("studentId") as string;
  const amountStr = formData.get("amount") as string;
  const dateStr = formData.get("date") as string;
  const paymentMethod = (formData.get("paymentMethod") as PaymentMethod) || "CASH";
  const receiptNo = (formData.get("receiptNo") as string) || `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;

  if (!studentId || !amountStr || !dateStr) {
    return { success: false, error: "Please fill in all required fields" };
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Invalid payment amount" };
  }

  const paymentDate = new Date(dateStr);
  const monthYear = paymentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

  try {
    // Invoke payment processing stub
    const processed = await processPayment(paymentMethod, amount);

    // Fetch student for name and validation
    const student = await prisma.student.findUnique({
      where: { id: studentId, instituteId },
    });

    if (!student) {
      return { success: false, error: "Student not found" };
    }

    // Create Fee record in Prisma
    const feeRecord = await prisma.fee.create({
      data: {
        instituteId,
        studentId,
        receiptNo,
        amount,
        monthYear,
        status: processed.status,
        paymentMethod,
        transactionId: processed.transactionId,
        paymentDate,
        notes: `Recorded via web dashboard by ${session.user.name || "Owner"}`,
      },
    });

    // Write ActivityLog entry
    await prisma.activityLog.create({
      data: {
        instituteId,
        userId,
        action: "FEE_RECORDED",
        details: `Fee payment recorded: ৳ ${amount.toLocaleString()} for ${student.fullName} via ${paymentMethod} (Receipt: ${receiptNo})`,
      },
    });

    revalidatePath("/fees");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Recorded payment of ৳ ${amount.toLocaleString()} for ${student.fullName}`,
      receiptNo,
    };
  } catch (error: any) {
    console.error("Failed to record fee payment:", error);
    return { success: false, error: error.message || "Failed to record payment" };
  }
}
