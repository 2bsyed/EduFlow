import React from "react";
import Link from "next/link";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Icon } from "@/components/ui/Icon";

export default function RegisterPage() {
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
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl max-w-md w-full text-center shadow-sm space-y-md">
          <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Icon name="rocket_launch" className="text-[32px]" />
          </div>
          <h1 className="font-h2 text-h2 text-primary">Start Your Free Trial</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Register your coaching center in minutes. No credit card required.
          </p>
          <div className="pt-md">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-sm bg-primary text-on-primary font-label-md text-label-md px-lg py-md rounded-lg shadow-sm hover:bg-primary-container transition-colors w-full"
            >
              <span>Already have an account? Sign In</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
