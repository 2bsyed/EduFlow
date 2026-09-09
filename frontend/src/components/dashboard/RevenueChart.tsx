"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface RevenueDataPoint {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00288e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00288e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#c4c5d5" opacity={0.3} />
          <XAxis
            dataKey="month"
            stroke="#444653"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#444653"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `৳${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#c4c5d5",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value: any) => [
              `৳ ${Number(value ?? 0).toLocaleString()}`,
              "Revenue",
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#00288e"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
