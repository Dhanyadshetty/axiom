"use client";

import { Globe2 } from "lucide-react";
import { useLanguageSwitcher } from "@/components/i18n/language-provider";

export function LanguageToggle() {
  const { language, switchLanguage } = useLanguageSwitcher();

  const toggleLanguage = () => {
    switchLanguage(language === "en" ? "de" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex h-9 min-w-[100px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 text-[11px] font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 hover:scale-105 active:scale-95 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
      title={`Switch to ${language === "en" ? "German" : "English"}`}
      aria-label={`Language: ${language === "en" ? "English" : "German"}. Click to switch.`}
    >
      <Globe2 className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
      <div className="flex items-center gap-1.5">
        <span className={language === "en" ? "rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white shadow-sm" : "px-1 text-[10px] opacity-50"}>EN</span>
        <div className="h-2 w-px bg-emerald-300/50" />
        <span className={language === "de" ? "rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white shadow-sm" : "px-1 text-[10px] opacity-50"}>DE</span>
      </div>
    </button>
  );
}
