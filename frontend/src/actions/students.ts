"use server";

import { auth } from "@/lib/auth/auth";
import { studentSchema } from "@/lib/validations/student";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { fetchApi } from "@/lib/api";

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
    const isEdit = !!data.id;
    
    const payload = {
        full_name: data.fullName,
        roll_no: data.rollNo,
        email: data.email || null,
        phone: data.phone || null,
        guardian_name: data.guardianName,
        guardian_phone: data.guardianPhone,
        address: data.address || null,
        batch_id: data.batchId,
        status: data.status,
        photo_url: photoUrl || null,
    };

    if (isEdit) {
      await fetchApi(`/api/v1/students/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } else {
      await fetchApi(`/api/v1/students/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    revalidatePath("/students");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: isEdit
        ? `Updated ${data.fullName} successfully`
        : `Student enrolled: ${data.fullName}`,
    };
  } catch (error: any) {
    console.error("Failed to save student record:", error);
    return {
      success: false,
      error: error.message || "Failed to save student record",
    };
  }
}

export async function deleteStudentAction(studentId: string) {
  const session = await auth();
  if (!session?.user?.instituteId || !session?.user?.id) {
    return { success: false, error: "Unauthorized access" };
  }

  if (session.user.role !== "OWNER") {
    return { success: false, error: "Only institute owners can delete student records" };
  }

  try {
    await fetchApi(`/api/v1/students/${studentId}`, {
      method: "DELETE",
    });

    revalidatePath("/students");
    revalidatePath("/dashboard");

    return { success: true, message: `Archived student successfully` };
  } catch (error: any) {
    console.error("Failed to delete student:", error);
    return { success: false, error: error.message || "Failed to delete student" };
  }
}
