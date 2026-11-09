"use server";

import { auth } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export type TeacherFormState = { error?: string; success?: string };

export async function createTeacherAction(_state: TeacherFormState, formData: FormData): Promise<TeacherFormState> {
  const session = await auth();
  if (session?.user?.role !== "OWNER" || !session.user.instituteId) return { error: "Only the institute owner can add teachers." };
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const subject = String(formData.get("subject") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!name || !email || !subject || password.length < 10) return { error: "Enter a name, email, subject, and a password of at least 10 characters." };
  try {
    await fetchApi("/api/v1/teachers/", { method: "POST", body: JSON.stringify({ name, email, password, subject, phone: phone || null }) });
    revalidatePath("/teachers");
    revalidatePath("/dashboard");
    return { success: `Teacher account created for ${name}. Share the temporary password with them securely.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the teacher account." };
  }
}

export async function updateTeacherAction(teacherId: string, data: { name: string; subject: string; phone?: string | null }) {
  const session = await auth();
  if (session?.user?.role !== "OWNER") throw new Error("Unauthorized");
  await fetchApi(`/api/v1/teachers/${teacherId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  revalidatePath("/teachers");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleTeacherStatusAction(teacherId: string, isActive: boolean) {
  const session = await auth();
  if (session?.user?.role !== "OWNER") throw new Error("Unauthorized");
  await fetchApi(`/api/v1/teachers/${teacherId}/status`, {
    method: "POST",
    body: JSON.stringify({ is_active: isActive }),
  });
  revalidatePath("/teachers");
  return { success: true };
}

export async function resetTeacherPasswordAction(teacherId: string, newPassword: string) {
  const session = await auth();
  if (session?.user?.role !== "OWNER") throw new Error("Unauthorized");
  await fetchApi(`/api/v1/teachers/${teacherId}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ password: newPassword }),
  });
  return { success: true };
}
