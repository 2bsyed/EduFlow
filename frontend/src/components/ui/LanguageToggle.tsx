"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Icon } from "./Icon";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "bn" : "en";
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors bg-surface-container-lowest/90 backdrop-blur-sm px-md py-sm rounded-full border border-surface-container-highest shadow-sm font-label-md text-label-md cursor-pointer disabled:opacity-50"
      aria-label="Toggle language"
    >
      <Icon name="translate" className="text-[18px]" />
      <span>{locale === "en" ? "বাংলা / EN" : "English / BN"}</span>
    </button>
  );
}
