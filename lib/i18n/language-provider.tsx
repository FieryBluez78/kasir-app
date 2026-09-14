"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LOCALE, Locale, dictionaries } from "./dictionaries";

type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "kasir.locale";

function resolveKey(dict: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "id" || stored === "en") {
      setLocaleState(stored);
    } else {
      // Fall back to browser preference on first visit.
      const browserLang = navigator.language.toLowerCase();
      setLocaleState(browserLang.startsWith("id") ? "id" : "en");
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback<TranslateFn>(
    (key, vars) => {
      const dict = dictionaries[locale];
      let value = resolveKey(dict, key) ?? resolveKey(dictionaries[DEFAULT_LOCALE], key) ?? key;
      if (vars) {
        for (const [varKey, varValue] of Object.entries(vars)) {
          value = value.replace(`{${varKey}}`, String(varValue));
        }
      }
      return value;
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
