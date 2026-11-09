"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";

interface AttendanceDonutProps {
  present?: number;
  absent?: number;
  late?: number;
  totalStudents?: number;
}

export function AttendanceDonut({
  present = 0,
  absent = 0,
  late = 0,
  totalStudents = 0,
}: AttendanceDonutProps) {
  const sum = present + absent + late;
  const hasData = sum > 0;
  const total = hasData ? sum : 0;
  const p = present;
  const a = absent;
  const l = late;

  const presentPct = hasData ? Math.round((p / total) * 100) : 0;
  const absentPct = hasData ? Math.round((a / total) * 100) : 0;
  const latePct = hasData ? Math.max(0, 100 - presentPct - absentPct) : 0;

  // SVG circle calculations
  const r = 58;
  const c = 2 * Math.PI * r; // ~364.42
  const pLength = (presentPct / 100) * c;
  const aLength = (absentPct / 100) * c;
  const lLength = (latePct / 100) * c;

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
        {/* Donut Chart */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background track circle */}
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="transparent"
              stroke="#F2F4F7"
              strokeWidth="15"
            />
            {/* Present slice - Vibrant Royal Blue */}
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="transparent"
              stroke="#1D4ED8"
              strokeWidth="15"
              strokeDasharray={`${pLength} ${c - pLength}`}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
            {/* Absent slice - Soft Lavender */}
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="transparent"
              stroke="#C7D2FE"
              strokeWidth="15"
              strokeDasharray={`${aLength} ${c - aLength}`}
              strokeDashoffset={-pLength}
            />
            {/* Late slice - Slate Gray/Blue */}
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="transparent"
              stroke="#CBD5E1"
              strokeWidth="15"
              strokeDasharray={`${lLength} ${c - lLength}`}
              strokeDashoffset={-(pLength + aLength)}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
              {hasData ? `${presentPct}%` : "—"}
            </span>
            <span className="text-[11px] font-medium text-slate-500 mt-1">
              {hasData ? "Present Today" : "No logs today"}
            </span>
          </div>
        </div>

        {/* Legend on the right */}
        <div className="w-full sm:w-auto flex-1 space-y-3 pl-0 sm:pl-2">
          {/* Present */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] shrink-0" />
              <span className="text-[#475467] font-medium text-xs md:text-sm">Present</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 text-xs md:text-sm">
                {p.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 w-8 text-right font-medium">
                {presentPct}%
              </span>
            </div>
          </div>

          {/* Absent */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C7D2FE] shrink-0" />
              <span className="text-[#475467] font-medium text-xs md:text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 text-xs md:text-sm">
                {a.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 w-8 text-right font-medium">
                {absentPct}%
              </span>
            </div>
          </div>

          {/* Late */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] shrink-0" />
              <span className="text-[#475467] font-medium text-xs md:text-sm">Late</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 text-xs md:text-sm">
                {l.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 w-8 text-right font-medium">
                {latePct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="border-t border-[#F2F4F7] pt-3.5 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
            <Icon name="group" className="text-lg" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {hasData
                ? `${p.toLocaleString()} / ${totalStudents.toLocaleString()}`
                : `${totalStudents.toLocaleString()} Enrolled`}
            </p>
            <p className="text-[11px] text-slate-500">
              {hasData ? "Students present today" : "Attendance pending today"}
            </p>
          </div>
        </div>

        <div className="text-right">
          {hasData ? (
            <>
              <div className="flex items-center justify-end gap-1 text-sm font-bold text-[#16A34A] leading-tight">
                <span className="text-base font-bold">↗</span> {presentPct}%
              </div>
              <p className="text-[11px] text-slate-500">attendance rate</p>
            </>
          ) : (
            <a href="/attendance" className="text-xs font-semibold text-[#1570EF] hover:underline">
              Mark now &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
