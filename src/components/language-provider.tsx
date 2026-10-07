"use client";

import * as React from "react";
import { t as translate, type Locale } from "@/lib/i18n";

type LanguageContextValue = {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "axiom-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Locale>("en");
  const [mounted, setMounted] = React.useState(false);

  // Read persisted preference on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "de" || saved === "en") {
        setLanguageState(saved);
      }
    } catch {
      // localStorage unavailable — keep default
    }
    setMounted(true);
  }, []);

  const setLanguage = React.useCallback((lang: Locale) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      // Also update Google Translate cookie
      const domain = window.location.hostname;
      const langCode = lang === "de" ? "de" : "en";
      
      // We set both root domain and current domain to be safe, standard Google Translate behavior
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      if (domain !== "localhost") {
        document.cookie = `googtrans=/en/${langCode}; domain=${domain}; path=/;`;
      }
      
      // Reload the page to ensure Google Translate initializes and processes the DOM
      window.location.reload();
    } catch {
      // localStorage unavailable
    }
  }, []);

  const tFn = React.useCallback(
    (key: string) => {
      const namespaces: ("common" | "header" | "sidebar" | "dashboard" | "portal" | "requests" | "auth" | "suppliers" | "documents" | "sourcing" | "admin" | "invoices" | "rfqDetail" | "misc")[] = [
        "common", "header", "sidebar", "dashboard", "portal", "requests", "auth", "suppliers", "documents", "sourcing", "admin", "invoices", "rfqDetail", "misc"
      ];
      for (const ns of namespaces) {
        const dict = translate(language, ns);
        if (dict && dict[key]) return dict[key];
      }
      return key;
    },
    [language],
  );

  const value = React.useMemo(
    () => ({ language, setLanguage, t: tFn }),
    [language, setLanguage, tFn],
  );

  // Avoid hydration mismatch — render children immediately but only enable
  // non-default language after mount
  if (!mounted) {
    const defaultT = (key: string) => {
      const namespaces: ("common" | "header" | "sidebar" | "dashboard" | "portal" | "requests" | "auth" | "suppliers" | "documents" | "sourcing" | "admin" | "invoices" | "rfqDetail" | "misc")[] = [
        "common", "header", "sidebar", "dashboard", "portal", "requests", "auth", "suppliers", "documents", "sourcing", "admin", "invoices", "rfqDetail", "misc"
      ];
      for (const ns of namespaces) {
        const dict = translate("en", ns);
        if (dict && dict[key]) return dict[key];
      }
      return key;
    };
    return (
      <LanguageContext.Provider value={{ language: "en", setLanguage, t: defaultT }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access the current language, setter, and translation function.
 */
export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
