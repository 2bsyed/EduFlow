"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors font-label-md text-label-md shadow-sm cursor-pointer"
    >
      <Icon name="print" className="text-[18px]" />
      <span>Print Report</span>
    </button>
  );
}
