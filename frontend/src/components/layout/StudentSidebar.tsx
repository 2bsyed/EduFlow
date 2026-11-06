"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";

interface StudentSidebarProps {
  activeTab?: "dashboard" | "attendance" | "results" | "fees" | "timetable" | "notices";
  instituteName?: string;
}

export function StudentSidebar({ activeTab: propActiveTab, instituteName }: StudentSidebarProps) {
  const t = useTranslations("Portal");
  const pathname = usePathname();

  const navItems = [
    { id: "dashboard", label: t("dashboard"), href: "/student", icon: "dashboard" },
    { id: "attendance", label: t("attendance"), href: "/student/attendance", icon: "calendar_today" },
    { id: "results", label: t("results"), href: "/student/results", icon: "grade" },
    { id: "fees", label: t("fees"), href: "/student/fees", icon: "payments" },
    { id: "timetable", label: t("timetable"), href: "/student/timetable", icon: "schedule" },
    { id: "notices", label: t("notices"), href: "/student/notices", icon: "campaign" },
  ];

  const matchedItem = navItems.find((item) => pathname === item.href || (item.href !== "/student" && pathname.startsWith(`${item.href}/`)));
  const activeId = matchedItem ? matchedItem.id : propActiveTab;

  return (
    <aside className="docked left-0 h-full w-60 border-r border-outline-variant flex flex-col py-5 px-3 bg-surface-container-lowest hidden md:flex shrink-0">
      <div className="mb-6 px-2 flex flex-col items-start gap-1">
        <Image src="/images/eduflow-logo.png" alt="EduFlow" width={145} height={49} priority className="h-9 w-auto object-contain" />
        <p className="text-xs text-on-surface-variant truncate w-full">
          {instituteName || "Student Portal"}
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

