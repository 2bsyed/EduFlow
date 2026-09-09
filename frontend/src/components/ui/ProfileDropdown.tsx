"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

interface ProfileDropdownProps {
  userName: string;
  userEmail?: string;
  userRole?: string;
  avatarUrl?: string | null;
  onSignOut: () => Promise<void>;
}

export function ProfileDropdown({
  userName,
  userEmail = "owner@eduflow.bd",
  userRole = "OWNER",
  avatarUrl,
  onSignOut,
}: ProfileDropdownProps) {
  const t = useTranslations("Portal");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-sm px-sm py-1.5 rounded-lg hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/50 cursor-pointer text-left whitespace-nowrap shrink-0 max-w-[220px]"
        aria-label="User Profile Menu"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={userName}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-caption flex items-center justify-center shrink-0">
            {initials}
          </div>
        )}
        <span className="font-label-md text-label-md text-on-surface font-semibold truncate hidden sm:inline-block max-w-[140px] whitespace-nowrap">
          {userName}
        </span>
        <Icon name="arrow_drop_down" className="text-[18px] text-on-surface-variant shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-xs w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header Box */}
          <div className="px-md py-sm border-b border-outline-variant/60">
            <p className="font-label-md text-label-md font-bold text-on-surface truncate">
              {userName}
            </p>
            <p className="font-caption text-caption text-on-surface-variant truncate">
              {userEmail}
            </p>
            <span className="inline-block mt-xs bg-primary-container/20 text-primary font-label-md text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {userRole}
            </span>
          </div>

          {/* Menu Items */}
          <div className="py-xs space-y-0.5">
            {userRole === "TEACHER" ? (
              <Link
                href="/teacher/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-sm px-md py-sm font-body-sm text-body-sm text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
              >
                <Icon name="person" className="text-[18px]" />
                <span>{t("myProfile")}</span>
              </Link>
            ) : (
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-sm px-md py-sm font-body-sm text-body-sm text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
              >
                <Icon name="settings" className="text-[18px]" />
                <span>{t("settings")}</span>
              </Link>
            )}

            <Link
              href="/settings/language"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-sm px-md py-sm font-body-sm text-body-sm text-on-surface hover:bg-surface-container hover:text-primary transition-colors"
            >
              <Icon name="translate" className="text-[18px]" />
              <span>{t("languagePreference")}</span>
            </Link>
          </div>

          <div className="border-t border-outline-variant/60 pt-xs mt-xs">
            <form action={onSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-sm px-md py-sm font-body-sm text-body-sm text-error hover:bg-error-container/20 transition-colors text-left cursor-pointer font-medium"
              >
                <Icon name="logout" className="text-[18px]" />
                <span>{t("logOut")}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
