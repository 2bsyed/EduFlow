"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { studentSchema } from "@/lib/validations/student";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

/* Storage Note: Saved to local /public/uploads/ for dev — requires Vercel Blob / S3 for production */
async function saveUploadedFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function createOrUpdateStudentAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { success: false, error: "Unauthorized" };
  }

  const instituteId = session.user.instituteId;
  const userId = session.user.id;

  const rawValues = {
    id: (formData.get("id") as string) || undefined,
    fullName: formData.get("fullName") as string,
    rollNo: formData.get("rollNo") as string,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    guardianName: formData.get("guardianName") as string,
    guardianPhone: formData.get("guardianPhone") as string,
    address: (formData.get("address") as string) || undefined,
    batchId: formData.get("batchId") as string,
    status: (formData.get("status") as any) || "ACTIVE",
  };

  const parsed = studentSchema.safeParse(rawValues);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  const data = parsed.data;

  // Handle Photo File Upload if provided
  let photoUrl = (formData.get("existingPhotoUrl") as string) || undefined;
  const photoFile = formData.get("photoFile") as File | null;
  if (photoFile && photoFile.size > 0) {
    try {
      photoUrl = await saveUploadedFile(photoFile);
    } catch (e) {
      console.error("Failed to save student photo:", e);
    }
  }

  try {
    let student;
    const isEdit = !!data.id;

    if (isEdit) {
      student = await prisma.student.update({
        where: { id: data.id, instituteId },
        data: {
          fullName: data.fullName,
          rollNo: data.rollNo,
          email: data.email || null,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          address: data.address || null,
          status: data.status,
          photoUrl: photoUrl || null,
        },
      });

      // Update student batch link
      await prisma.studentBatch.deleteMany({ where: { studentId: student.id } });
      await prisma.studentBatch.create({
        data: {
          instituteId,
          studentId: student.id,
          batchId: data.batchId,
        },
      });

      await prisma.activityLog.create({
        data: {
          instituteId,
          userId,
          action: "STUDENT_UPDATED",
          details: `Student record updated for '${student.fullName}' (Roll: ${student.rollNo})`,
        },
      });
    } else {
      student = await prisma.student.create({
        data: {
          instituteId,
          fullName: data.fullName,
          rollNo: data.rollNo,
          email: data.email || null,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          address: data.address || null,
          status: data.status,
          photoUrl: photoUrl || null,
          studentBatches: {
            create: {
              instituteId,
              batchId: data.batchId,
            },
          },
        },
      });

      await prisma.activityLog.create({
        data: {
          instituteId,
          userId,
          action: "STUDENT_ENROLLED",
          details: `Student enrolled: ${student.fullName}`,
        },
      });
    }

    revalidatePath("/students");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: isEdit
        ? `Updated ${student.fullName} successfully`
        : `Student enrolled: ${student.fullName}`,
    };
  } catch (error: any) {
    console.error("Failed to save student record:", error);
    return {
      success: false,
      error: error.message || "Failed to save student record",
    };
  }
}
