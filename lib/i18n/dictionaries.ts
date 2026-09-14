import id from "./messages/id.json";
import en from "./messages/en.json";

export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];

export const DEFAULT_LOCALE: Locale = "id";

// Both dictionaries are typed against the Indonesian one so a missing key
// in either file is caught at compile time.
export type Dictionary = typeof id;

export const dictionaries: Record<Locale, Dictionary> = { id, en };

export const LOCALE_LABELS: Record<Locale, { flag: string; label: string }> = {
  id: { flag: "🇮🇩", label: "Indonesia" },
  en: { flag: "🇬🇧", label: "English" },
};
