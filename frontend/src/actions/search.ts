"use server";

import { fetchApi } from "@/lib/api";
import { auth } from "@/lib/auth/auth";

export type SearchResult = {
  students: { id: string; name: string; rollNo?: string; href: string }[];
  teachers: { id: string; name: string; subject?: string; href: string }[];
  batches: { id: string; name: string; subject?: string; href: string }[];
};

export async function quickSearchAction(query: string): Promise<SearchResult> {
  const session = await auth();
  if (!session?.user?.instituteId) {
    return { students: [], teachers: [], batches: [] };
  }
  if (!query || query.trim().length < 2) {
    return { students: [], teachers: [], batches: [] };
  }
  try {
    const res = await fetchApi(`/api/v1/core/search?q=${encodeURIComponent(query.trim())}`);
    return res || { students: [], teachers: [], batches: [] };
  } catch {
    return { students: [], teachers: [], batches: [] };
  }
}
