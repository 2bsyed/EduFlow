"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";

interface OwnerSidebarProps {
  activeTab?:
    | "dashboard"
    | "students"
    | "batches"
    | "attendance"
    | "fees"
    | "results"
    | "expenses"
    | "notices"
    | "settings";
  instituteName?: string;
}

export function OwnerSidebar({ activeTab: propActiveTab, instituteName }: OwnerSidebarProps) {
  const t = useTranslations("Portal");
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", label: t("dashboard"), href: "/dashboard", icon: "home" },
    { id: "students", label: t("students"), href: "/students", icon: "group" },
    { id: "batches", label: t("batches"), href: "/batches", icon: "school" },
    { id: "attendance", label: t("attendance"), href: "/attendance", icon: "calendar_today" },
    { id: "fees", label: t("fees"), href: "/fees", icon: "payments" },
    { id: "results", label: t("results"), href: "/results", icon: "analytics" },
    { id: "expenses", label: t("expenses"), href: "/expenses", icon: "receipt_long" },
    { id: "notices", label: t("notices"), href: "/notices", icon: "campaign" },
    { id: "settings", label: t("settings"), href: "/settings", icon: "settings" },
  ];

  const matchedItem = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const activeId = matchedItem ? matchedItem.id : propActiveTab;

  return (
    <aside className="docked left-0 h-full w-64 border-r border-outline-variant shadow-sm flex flex-col py-lg px-md bg-surface-container-lowest hidden md:flex shrink-0">
      <div className="mb-xl px-sm flex flex-col items-start gap-xs">
        <h1 className="text-xl font-bold text-primary">EduFlow</h1>
        <p className="font-caption text-caption text-on-surface-variant truncate w-full">
          {instituteName || "Coaching Management"}
        </p>
      </div>
      <nav className="flex-1 space-y-xs overflow-y-auto pr-xs">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-all duration-150 ${
                isActive
                  ? "text-primary font-bold border-r-4 border-primary bg-primary-fixed"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
              }`}
            >
              <Icon name={item.icon} className="text-[20px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

