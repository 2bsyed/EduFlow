"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function updateInstituteProfile(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    const instituteId = session?.user?.instituteId;
    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!instituteId || !userId) {
      return { success: false, error: "Unauthorized access: Session missing." };
    }

    if (role !== "OWNER") {
      return { success: false, error: "Only institute owners can update institute settings." };
    }

    const name = (formData.get("name") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const subdomain = (formData.get("subdomain") as string)?.trim()?.toLowerCase();
    const currency = (formData.get("currency") as string)?.trim() || "BDT";
    const timezone = (formData.get("timezone") as string)?.trim() || "UTC+6";
    const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

    if (!name) {
      return { success: false, error: "Institute name is required." };
    }

    // Validate subdomain uniqueness across other institutes
    if (subdomain) {
      const existing = await prisma.institute.findFirst({
        where: {
          subdomain,
          id: { not: instituteId },
        },
      });

      if (existing) {
        return {
          success: false,
          error: `Subdomain "${subdomain}" is already taken by another institute. Please choose a different subdomain.`,
        };
      }
    }

    // Update Institute record
    await prisma.institute.update({
      where: { id: instituteId },
      data: {
        name,
        address: address || null,
        subdomain: subdomain || null,
        currency,
        timezone,
        ...(logoUrl ? { logoUrl } : {}),
      },
    });

    // Write ActivityLog
    await prisma.activityLog.create({
      data: {
        instituteId,
        action: `Institute profile updated: ${name}`,
        userId,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, message: "Institute profile updated successfully!" };
  } catch (error: any) {
    console.error("updateInstituteProfile error:", error);
    return { success: false, error: error.message || "Failed to update institute profile." };
  }
}

export async function updateInstituteLanguage(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    const instituteId = session?.user?.instituteId;
    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!instituteId || !userId) {
      return { success: false, error: "Unauthorized access: Session missing." };
    }

    if (role !== "OWNER") {
      return { success: false, error: "Only institute owners can update institute settings." };
    }

    const language = (formData.get("language") as string)?.trim() || "en";

    if (language !== "en" && language !== "bn") {
      return { success: false, error: "Invalid language selection." };
    }

    // Persist owner's default language preference to the Institute record
    await prisma.institute.update({
      where: { id: instituteId },
      data: {
        defaultLanguage: language,
      },
    });

    // Write ActivityLog
    await prisma.activityLog.create({
      data: {
        instituteId,
        action: `Default language updated to ${language === "bn" ? "বাংলা" : "English"}`,
        userId,
      },
    });

    revalidatePath("/settings");
    revalidatePath("/settings/language");

    return {
      success: true,
      message: `Default language updated to ${language === "bn" ? "বাংলা" : "English"} successfully!`,
    };
  } catch (error: any) {
    console.error("updateInstituteLanguage error:", error);
    return { success: false, error: error.message || "Failed to update language settings." };
  }
}
