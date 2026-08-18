import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";

interface StudentSidebarProps {
  activeTab: "dashboard" | "attendance" | "results" | "fees" | "timetable" | "notices";
  instituteName?: string;
}

export function StudentSidebar({ activeTab, instituteName }: StudentSidebarProps) {
  const t = useTranslations("Portal");

  const navItems = [
    { id: "dashboard", label: t("dashboard"), href: "/student", icon: "dashboard" },
    { id: "attendance", label: t("attendance"), href: "/student/attendance", icon: "calendar_today" },
    { id: "results", label: t("results"), href: "/student/results", icon: "grade" },
    { id: "fees", label: t("fees"), href: "/student/fees", icon: "payments" },
    { id: "timetable", label: t("timetable"), href: "/student/timetable", icon: "schedule" },
    { id: "notices", label: t("notices"), href: "/student/notices", icon: "campaign" },
  ];

  return (
    <aside className="docked left-0 h-full w-64 border-r border-outline-variant shadow-sm flex flex-col py-lg px-md bg-surface-container-lowest hidden md:flex shrink-0">
      <div className="mb-xl px-sm flex flex-col items-start gap-xs">
        <Image src="/images/logo.jpg" alt="EduFlow logo" width={120} height={40} className="object-contain -ml-2" />
        <p className="font-caption text-caption text-on-surface-variant truncate w-full">
            {instituteName || "Student Portal"}
          </p>
      </div>
      <nav className="flex-1 space-y-xs overflow-y-auto pr-xs">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-md px-md py-sm rounded-lg font-label-md text-label-md transition-colors ${
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
