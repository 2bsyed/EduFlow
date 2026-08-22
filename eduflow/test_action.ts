import { recordPaymentAction } from './src/app/actions/fees';
import { prisma } from './src/lib/db/prisma';

async function main() {
  const student = await prisma.student.findFirst();
  console.log('Student:', student?.id);

  const formData = new FormData();
  formData.append("studentId", student?.id || "");
  formData.append("amount", "500");
  formData.append("date", "2026-08-09");
  formData.append("paymentMethod", "CASH");
  formData.append("receiptNo", "RCPT-123456");

  // We need to mock auth() if it's relying on session.
  // Actually, recordPaymentAction uses `await auth()`. So running it outside Next.js will fail because NextAuth needs the Request context.
}
main();
