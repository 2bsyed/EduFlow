"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";

interface OwnerSidebarProps {
  activeTab?:
    | "dashboard"
    | "students"
    | "teachers"
    | "batches"
    | "attendance"
    | "fees"
    | "examinations"
    | "results"
    | "reports"
    | "expenses"
    | "notices"
    | "settings";
  instituteName?: string;
  hideLogo?: boolean;
}

export function OwnerSidebar({
  activeTab: propActiveTab,
  instituteName,
  hideLogo = false,
}: OwnerSidebarProps) {
  const t = useTranslations("Portal");
  const pathname = usePathname();

  const mainNavItems = [
    { id: "dashboard", label: "Home", href: "/dashboard", icon: "home" },
    { id: "students", label: t("students"), href: "/students", icon: "group" },
    { id: "teachers", label: "Teachers", href: "/teachers", icon: "person" },
    { id: "batches", label: t("batches"), href: "/batches", icon: "menu_book" },
    { id: "attendance", label: t("attendance"), href: "/attendance", icon: "calendar_today" },
    { id: "fees", label: "Fees & Payments", href: "/fees", icon: "credit_card" },
    { id: "examinations", label: "Examinations", href: "/results", icon: "assignment" },
    { id: "results", label: t("results"), href: "/results", icon: "bar_chart" },
    { id: "notices", label: t("notices"), href: "/notices", icon: "campaign" },
    { id: "reports", label: "Reports", href: "/reports", icon: "description" },
  ];

  const bottomNavItems = [
    { id: "website", label: "Institute Website", href: "/", icon: "language" },
    { id: "settings", label: t("settings"), href: "/settings", icon: "settings" },
  ];

  const allItems = [...mainNavItems, ...bottomNavItems];
  const matchedItem = allItems.find(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
  );
  const activeId = matchedItem ? matchedItem.id : propActiveTab;

  return (
    <aside className="w-60 border-r border-[#EAECF0] flex flex-col py-3 px-3 bg-white hidden md:flex shrink-0 select-none">
      {!hideLogo && (
        <div className="mb-4 px-2 flex flex-col items-start gap-1">
          <Image
            src="/images/eduflow-logo.png"
            alt="EduFlow"
            width={145}
            height={49}
            priority
            className="h-8 w-auto object-contain"
          />
          <p className="text-xs text-[#667085] truncate w-full">
            {instituteName || "Coaching Center"}
          </p>
        </div>
      )}

      {hideLogo && (
        <div className="flex justify-center py-1 mb-2 text-[#98A2B3] hover:text-[#475467] transition-colors cursor-pointer">
          <Icon name="keyboard_arrow_up" className="text-xl" />
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#EEF4FF] text-[#1570EF] font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#1570EF] before:rounded-r"
                  : "text-[#475467] hover:text-slate-900 hover:bg-[#F9FAFB]"
              }`}
            >
              <Icon
                name={item.icon}
                className={`text-[20px] ${isActive ? "text-[#1570EF]" : "text-[#667085]"}`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-3 mt-auto border-t border-[#F2F4F7] space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#EEF4FF] text-[#1570EF] font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#1570EF] before:rounded-r"
                  : "text-[#475467] hover:text-slate-900 hover:bg-[#F9FAFB]"
              }`}
            >
              <Icon
                name={item.icon}
                className={`text-[20px] ${isActive ? "text-[#1570EF]" : "text-[#667085]"}`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

