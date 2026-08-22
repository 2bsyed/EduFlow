"use client";

import React, { useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  unread: boolean;
  type: "fee" | "attendance" | "system";
}

const defaultNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Aisha Rahman paid ৳ 2,500 fee via bKash",
    time: "10 mins ago",
    unread: true,
    type: "fee",
  },
  {
    id: "notif-2",
    title: "Class 10 Higher Math attendance marked by Kamrul Hasan",
    time: "1 hour ago",
    unread: true,
    type: "attendance",
  },
  {
    id: "notif-3",
    title: "Monthly revenue report for October generated",
    time: "3 hours ago",
    unread: true,
    type: "system",
  },
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors relative cursor-pointer flex items-center justify-center"
        title="Notifications"
        aria-label="View notifications"
      >
        <Icon name="notifications" className="text-[20px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface-bright"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-xs w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl py-sm z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-md py-xs border-b border-outline-variant/60 flex justify-between items-center">
            <h4 className="font-label-md text-label-md font-bold text-on-surface">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-caption font-caption text-primary hover:underline cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-outline-variant/30">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-md hover:bg-surface-container transition-colors flex items-start gap-sm ${
                  n.unread ? "bg-primary-container/5" : ""
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-primary-container/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Icon
                    name={
                      n.type === "fee"
                        ? "payments"
                        : n.type === "attendance"
                        ? "event_available"
                        : "info"
                    }
                    className="text-[16px]"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-snug">
                    {n.title}
                  </p>
                  <span className="font-caption text-caption text-on-surface-variant block mt-xs">
                    {n.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
