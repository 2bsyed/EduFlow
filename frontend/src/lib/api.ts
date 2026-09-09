import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export async function getAuthToken() {
  const session = await auth();
  return (session as any)?.accessToken || null;
}

export async function getAuthHeaders() {
  const token = await getAuthToken();
  if (token) {
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }
  return {
    "Content-Type": "application/json"
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login?expired=1";
        return null;
      }
      redirect("/login?expired=1");
    }
    let errorMessage = `API request failed with status ${response.status}`;
    if (typeof errorData.detail === "string") {
      errorMessage = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      errorMessage = errorData.detail
        .map((e: any) => (e.loc ? `${e.loc.join(".")}: ${e.msg}` : e.msg || JSON.stringify(e)))
        .join("; ");
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
    throw new Error(errorMessage);
  }
  
  // Return null for 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}
