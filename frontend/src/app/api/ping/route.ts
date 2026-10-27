import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    // Allow up to 30 seconds for backend and database cold-start
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      durationMs,
      backend: data,
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return NextResponse.json(
      {
        ok: false,
        durationMs,
        error: err?.message || "Failed to reach backend",
      },
      { status: 502 }
    );
  }
}
