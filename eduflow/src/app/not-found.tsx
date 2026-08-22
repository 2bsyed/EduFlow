import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col items-center justify-center p-md md:p-xl font-sans">
      <div className="max-w-md w-full text-center bg-surface-container-lowest border border-outline-variant rounded-2xl p-xl shadow-lg space-y-lg">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
          <Icon name="search_off" className="text-[44px]" />
        </div>

        <div>
          <span className="font-caption text-caption text-primary font-bold tracking-widest uppercase block mb-xs">
            Error 404
          </span>
          <h1 className="font-h1 text-h1 text-on-surface font-extrabold tracking-tight">
            Page Not Found
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
            The page or resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-md border-t border-outline-variant flex flex-col sm:flex-row gap-sm justify-center">
          <Link
            href="/dashboard"
            className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm px-lg rounded-lg font-semibold transition-colors flex items-center justify-center gap-xs cursor-pointer shadow-sm"
          >
            <Icon name="home" className="text-[20px]" />
            <span>Go to Dashboard</span>
          </Link>

          <Link
            href="/"
            className="border border-outline-variant hover:bg-surface-container text-on-surface font-label-md text-label-md py-sm px-lg rounded-lg font-semibold transition-colors flex items-center justify-center gap-xs cursor-pointer"
          >
            <Icon name="arrow_back" className="text-[20px]" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
