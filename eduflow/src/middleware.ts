import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAppRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/teacher") ||
    nextUrl.pathname.startsWith("/student") ||
    nextUrl.pathname.startsWith("/students") ||
    nextUrl.pathname.startsWith("/attendance") ||
    nextUrl.pathname.startsWith("/fees") ||
    nextUrl.pathname.startsWith("/results") ||
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
      // Owner can access all owner app routes (/dashboard, /students, /attendance, /fees, /results, /settings)
      if (nextUrl.pathname.startsWith("/teacher") || nextUrl.pathname.startsWith("/student")) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
      }
    }

    if (role === "TEACHER") {
      // Teacher can access /teacher/*, /attendance, /results
      const isAllowedTeacherRoute =
        nextUrl.pathname.startsWith("/teacher") ||
        nextUrl.pathname.startsWith("/attendance") ||
        nextUrl.pathname.startsWith("/results");

      if (!isAllowedTeacherRoute) {
        return NextResponse.redirect(new URL("/teacher", nextUrl.origin));
      }
    }

    if (role === "STUDENT") {
      // Student can only access /student/* or /results/report-card/*
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
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/students/:path*",
    "/attendance/:path*",
    "/fees/:path*",
    "/results/:path*",
    "/settings/:path*",
    "/login",
  ],
};
