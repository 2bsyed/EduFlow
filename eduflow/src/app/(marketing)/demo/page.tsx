import React from "react";
import Link from "next/link";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Icon } from "@/components/ui/Icon";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans antialiased relative">
      <header className="w-full flex justify-between items-center p-margin max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-xs">
          <Icon name="school" className="text-[28px] text-primary" />
          <span className="font-h3 text-h3 text-primary font-bold">EduFlow</span>
        </Link>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-margin">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl max-w-2xl w-full text-center shadow-sm space-y-lg">
          <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto text-secondary">
            <Icon name="play_circle" className="text-[36px]" />
          </div>
          <div>
            <h1 className="font-h2 text-h2 text-on-surface mb-xs">EduFlow Product Overview Demo</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Watch how EduFlow simplifies attendance, fee collection via bKash/Nagad, and exam results reporting.
            </p>
          </div>

          {/* Video Placeholder Container */}
          <div className="aspect-video bg-surface-container-high rounded-lg border border-outline-variant flex flex-col items-center justify-center p-md relative overflow-hidden group">
            <Icon name="video_library" className="text-[48px] text-on-surface-variant/50 mb-xs" />
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              Interactive Video Showcase Demo
            </span>
          </div>

          <div className="flex justify-center gap-md pt-sm">
            <Link
              href="/register"
              className="bg-primary text-on-primary font-label-md text-label-md px-lg py-md rounded-lg shadow-sm hover:bg-primary-container transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="border border-outline-variant text-on-surface font-label-md text-label-md px-lg py-md rounded-lg hover:bg-surface-container-low transition-colors"
            >
              Login to Demo Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
