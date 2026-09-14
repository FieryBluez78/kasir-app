"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/dictionaries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <span>{LOCALE_LABELS[locale].flag}</span>
          <span className="hidden sm:inline">{LOCALE_LABELS[locale].label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((code) => (
          <DropdownMenuItem key={code} onClick={() => setLocale(code)} className="gap-2">
            <span>{LOCALE_LABELS[code].flag}</span>
            <span>{LOCALE_LABELS[code].label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
