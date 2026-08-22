"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-md md:p-xl font-sans">
      <div className="max-w-md w-full text-center bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-lg space-y-lg">
        <div className="w-20 h-20 mx-auto rounded-full bg-error-container/20 text-error flex items-center justify-center">
          <Icon name="report_problem" className="text-[44px]" />
        </div>

        <div>
          <span className="font-caption text-caption text-error font-bold tracking-widest uppercase block mb-xs">
            Application Error
          </span>
          <h1 className="font-h1 text-h1 text-on-surface font-extrabold tracking-tight">
            Something Went Wrong
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
            An unexpected error occurred while processing your request. Our team has been notified.
          </p>
        </div>

        <div className="pt-md border-t border-outline-variant flex flex-col sm:flex-row gap-sm justify-center">
          <button
            onClick={() => reset()}
            className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg font-semibold transition-colors flex items-center justify-center gap-xs cursor-pointer shadow-sm"
          >
            <Icon name="refresh" className="text-[20px]" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="border border-outline-variant hover:bg-surface-container text-on-surface font-label-md text-label-md py-sm px-lg rounded-lg font-semibold transition-colors flex items-center justify-center gap-xs cursor-pointer"
          >
            <Icon name="home" className="text-[20px]" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
