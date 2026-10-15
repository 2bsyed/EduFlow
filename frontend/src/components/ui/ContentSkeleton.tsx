import React from "react";

export function ContentSkeleton() {
  return (
    <div className="space-y-lg animate-pulse w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md mb-md">
        <div className="space-y-2">
          <div className="h-8 bg-surface-container-high rounded-md w-56" />
          <div className="h-4 bg-surface-container rounded-md w-80" />
        </div>
        <div className="h-9 bg-surface-container rounded-lg w-32" />
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-lg space-y-sm shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container" />
              <div className="w-14 h-5 rounded-full bg-surface-container-high" />
            </div>
            <div className="h-4 bg-surface-container rounded w-24" />
            <div className="h-8 bg-surface-container-high rounded w-32" />
          </div>
        ))}
      </div>

      {/* Main Container / Table Skeleton */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-lg shadow-sm space-y-md">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-surface-container-high rounded w-44" />
          <div className="h-8 bg-surface-container rounded-lg w-28" />
        </div>
        <div className="space-y-sm pt-xs">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-surface-container-low rounded-lg w-full flex items-center px-md justify-between">
              <div className="flex items-center gap-md">
                <div className="w-8 h-8 rounded-full bg-surface-container" />
                <div className="space-y-1">
                  <div className="h-4 bg-surface-container rounded w-32" />
                  <div className="h-3 bg-surface-container rounded w-20" />
                </div>
              </div>
              <div className="h-6 bg-surface-container rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
