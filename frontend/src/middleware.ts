import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

function isTokenExpired(token: string | null | undefined): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const session = await auth();
  
  let role = null;
  let isLoggedIn = false;
  
  const accessToken = (session as any)?.accessToken;
  const tokenExpired = isTokenExpired(accessToken);

  if (session && session.user && !tokenExpired) {
    role = session.user.role;
    isLoggedIn = true;
  }

  const isAppRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/teacher") ||
    nextUrl.pathname.startsWith("/student") ||
    nextUrl.pathname.startsWith("/students") ||
    nextUrl.pathname.startsWith("/attendance") ||
    nextUrl.pathname.startsWith("/batches") ||
    nextUrl.pathname.startsWith("/fees") ||
    nextUrl.pathname.startsWith("/expenses") ||
    nextUrl.pathname.startsWith("/results") ||
    nextUrl.pathname.startsWith("/notices") ||
    nextUrl.pathname.startsWith("/settings");

  // 1. Unauthenticated users trying to access protected routes -> redirect to /login
  if (isAppRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated role protection & boundary checks
  if (isLoggedIn && isAppRoute) {
    if (role === "OWNER") {
      if (nextUrl.pathname.startsWith("/teacher") || nextUrl.pathname.startsWith("/student/") || nextUrl.pathname === "/student") {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
      }
    }

    if (role === "TEACHER") {
      const isAllowedTeacherRoute =
        nextUrl.pathname.startsWith("/teacher") ||
        nextUrl.pathname.startsWith("/attendance") ||
        nextUrl.pathname.startsWith("/results");

      if (!isAllowedTeacherRoute) {
        return NextResponse.redirect(new URL("/teacher", nextUrl.origin));
      }
    }

    if (role === "STUDENT") {
      const isAllowedStudentRoute =
        nextUrl.pathname.startsWith("/student") ||
        nextUrl.pathname.startsWith("/results/report-card/");

      if (!isAllowedStudentRoute) {
        return NextResponse.redirect(new URL("/student", nextUrl.origin));
      }
    }
  }

  // 3. Logged-in users visiting /login -> redirect to their role home
  if (isLoggedIn && nextUrl.pathname === "/login") {
    if (role === "OWNER") return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    if (role === "TEACHER") return NextResponse.redirect(new URL("/teacher", nextUrl.origin));
    if (role === "STUDENT") return NextResponse.redirect(new URL("/student", nextUrl.origin));
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/students/:path*",
    "/attendance/:path*",
    "/batches/:path*",
    "/fees/:path*",
    "/expenses/:path*",
    "/results/:path*",
    "/notices/:path*",
    "/settings/:path*",
    "/login",
  ],
};
