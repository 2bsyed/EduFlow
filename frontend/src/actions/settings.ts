"use server";

import { fetchApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateInstituteProfile(prevState: any, formData: FormData) {
  try {
    const name = (formData.get("name") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const subdomain = (formData.get("subdomain") as string)?.trim()?.toLowerCase();
    const currency = (formData.get("currency") as string)?.trim() || "BDT";
    const timezone = (formData.get("timezone") as string)?.trim() || "UTC+6";
    const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

    if (!name) {
      return { success: false, error: "Institute name is required." };
    }

    const data = await fetchApi("/api/v1/core/settings/profile", {
      method: "PUT",
      body: JSON.stringify({
        name,
        address: address || null,
        subdomain: subdomain || null,
        currency,
        timezone,
        logoUrl: logoUrl || null
      }),
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, message: data.message };
  } catch (error: any) {
    console.error("updateInstituteProfile error:", error);
    return { success: false, error: error.message || "Failed to update institute profile." };
  }
}

export async function updateInstituteLanguage(prevState: any, formData: FormData) {
  try {
    const language = (formData.get("language") as string)?.trim() || "en";

    const data = await fetchApi("/api/v1/core/settings/language", {
      method: "PUT",
      body: JSON.stringify({ language }),
    });

    revalidatePath("/settings");
    revalidatePath("/settings/language");

    return {
      success: true,
      message: data.message,
    };
  } catch (error: any) {
    console.error("updateInstituteLanguage error:", error);
    return { success: false, error: error.message || "Failed to update language settings." };
  }
}
