"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function createNoticeAction(formData: FormData): Promise<void> {
  const session = await auth();
  const instituteId = session?.user?.instituteId;
  const role = session?.user?.role;
  const userId = session?.user?.id;

  if (!instituteId || !userId || (role !== "OWNER" && role !== "TEACHER")) return;

  const title = formData.get("title") as string;
  const category = (formData.get("category") as string) || "ACADEMIC";
  const urgent = formData.get("urgent") === "true";
  const targetScope = (formData.get("targetScope") as string) || "EVERYONE";
  const batchId = (formData.get("batchId") as string) || null;
  const content = formData.get("content") as string;

  if (!title || !content) return;

  // Security Check for Teacher role
  if (role === "TEACHER") {
    if (targetScope !== "BATCH" || !batchId) return;
    const teacher = await prisma.teacher.findUnique({ where: { userId } });
    if (!teacher) return;

    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch || batch.teacherId !== teacher.id) return;
  }

  try {
    await prisma.activityLog.create({
      data: {
        instituteId,
        userId: session.user.id,
        action: `NOTICE:${category}:${targetScope}`,
        details: JSON.stringify({
          title,
          content,
          category,
          urgent,
          targetScope,
          batchId,
          author: session.user.name || (role === "OWNER" ? "Institute Owner" : "Teacher"),
          role,
          date: new Date().toISOString(),
        }),
      },
    });

    revalidatePath("/notices");
    revalidatePath("/student/notices");
    revalidatePath("/dashboard");
    revalidatePath("/teacher");
  } catch (err) {
    console.error("Failed to post notice:", err);
  }
}
