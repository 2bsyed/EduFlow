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
    { id: "teachers", label: "Teachers", href: "/teachers", icon: "person" },
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
    <aside className="docked left-0 h-full w-60 border-r border-outline-variant flex flex-col py-5 px-3 bg-surface-container-lowest hidden md:flex shrink-0">
      <div className="mb-6 px-2 flex flex-col items-start gap-1">
        <Image src="/images/eduflow-logo.png" alt="EduFlow" width={145} height={49} priority className="h-9 w-auto object-contain" />
        <p className="text-xs text-on-surface-variant truncate w-full">
          {instituteName || "Coaching Management"}
        </p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                isActive
                  ? "text-primary font-semibold border-l-[3px] border-primary bg-[#f3f9fd]"
                  : "text-on-surface-variant border-l-[3px] border-transparent hover:text-on-surface hover:bg-surface-container-low"
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

