"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface AttendanceDonutProps {
  present: number;
  absent: number;
  late: number;
}

export function AttendanceDonut({ present, absent, late }: AttendanceDonutProps) {
  const total = present + absent + late;
  const presentPct = total > 0 ? Math.round((present / total) * 100) : 0;

  const data = [
    { name: "Present", value: present, color: "#006c4a" },
    { name: "Absent", value: absent, color: "#ba1a1a" },
    { name: "Late", value: late, color: "#743d00" },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-44 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#c4c5d5",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-h2 text-h2 font-bold text-on-surface">{presentPct}%</span>
          <span className="font-caption text-caption text-on-surface-variant">Present</span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-2 mt-4 text-body-sm">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#006c4a]"></span>
            <span>Present</span>
          </span>
          <span className="font-medium text-on-surface">{present}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ba1a1a]"></span>
            <span>Absent</span>
          </span>
          <span className="font-medium text-on-surface">{absent}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#743d00]"></span>
            <span>Late</span>
          </span>
          <span className="font-medium text-on-surface">{late}</span>
        </div>
      </div>
    </div>
  );
}
