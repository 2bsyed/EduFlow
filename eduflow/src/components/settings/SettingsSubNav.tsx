"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function SettingsSubNav() {
  const pathname = usePathname();

  const isProfileActive = pathname === "/settings" || pathname === "/settings/";
  const isLanguageActive = pathname === "/settings/language";

  return (
    <nav className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-xs overflow-x-auto lg:overflow-visible pb-md lg:pb-0 border-b lg:border-b-0 border-outline-variant">
      <Link
        href="/settings"
        className={`px-md py-sm rounded-lg font-label-md text-label-md transition-colors whitespace-nowrap lg:whitespace-normal flex items-center justify-between ${
          isProfileActive
            ? "bg-surface-container text-primary font-semibold"
            : "text-on-surface-variant hover:bg-surface-container-high"
        }`}
      >
        <span className="flex items-center gap-sm">
          <Icon name="account_balance" className="text-sm" />
          Institute Profile
        </span>
        {isProfileActive && <Icon name="chevron_right" className="text-sm" />}
      </Link>

      <Link
        href="/settings/language"
        className={`px-md py-sm rounded-lg font-label-md text-label-md transition-colors whitespace-nowrap lg:whitespace-normal flex items-center justify-between ${
          isLanguageActive
            ? "bg-surface-container text-primary font-semibold"
            : "text-on-surface-variant hover:bg-surface-container-high"
        }`}
      >
        <span className="flex items-center gap-sm">
          <Icon name="language" className="text-sm" />
          Language
        </span>
        {isLanguageActive && <Icon name="chevron_right" className="text-sm" />}
      </Link>

      <div className="opacity-50 pointer-events-none flex flex-col gap-xs">
        <span className="px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant flex items-center gap-sm">
          <Icon name="manage_accounts" className="text-sm" />
          Users & Roles (Coming soon)
        </span>
        <span className="px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant flex items-center gap-sm">
          <Icon name="credit_card" className="text-sm" />
          Billing (Coming soon)
        </span>
        <span className="px-md py-sm rounded-lg font-label-md text-label-md text-on-surface-variant flex items-center gap-sm">
          <Icon name="notifications" className="text-sm" />
          Notifications (Coming soon)
        </span>
      </div>
    </nav>
  );
}
