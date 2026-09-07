"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGE_COOKIE, type Language } from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function writeLanguage(language: Language) {
  document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000`;
  window.localStorage.setItem(LANGUAGE_COOKIE, language);
  document.documentElement.lang = language;
}

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: Language) => {
        setLanguageState(next);
        writeLanguage(next);
      },
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}

export function useLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const switchLanguage = (next: Language) => {
    setLanguage(next);
  };

  return { language, switchLanguage };
}
