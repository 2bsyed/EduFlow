"use server";

import { auth } from "@/lib/auth/auth";
import { fetchApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateInquiryStatusAction(inquiryId: string, status: string) {
  const session = await auth();
  if (session?.user?.role !== "OWNER") throw new Error("Unauthorized");
  await fetchApi(`/api/v1/inquiries/${inquiryId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  revalidatePath("/admissions");
  return { success: true };
}

export async function updateWebsiteSettingsAction(data: {
  hero_headline?: string;
  hero_subhead?: string;
  hero_image_url?: string;
  about_text?: string;
  contact_phone?: string;
  contact_email?: string;
  is_published?: boolean;
}) {
  const session = await auth();
  if (session?.user?.role !== "OWNER") throw new Error("Unauthorized");
  await fetchApi(`/api/v1/settings/website`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  revalidatePath("/admissions");
  return { success: true };
}
