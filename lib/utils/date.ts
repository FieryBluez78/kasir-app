import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";

export function formatDate(date: Date | string, locale: "id" | "en" = "id"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy, HH:mm", { locale: locale === "id" ? idLocale : enUS });
}

export function formatDateShort(date: Date | string, locale: "id" | "en" = "id"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy", { locale: locale === "id" ? idLocale : enUS });
}

export function formatRelative(date: Date | string, locale: "id" | "en" = "id"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: locale === "id" ? idLocale : enUS });
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfWeek(): Date {
  const d = startOfToday();
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // week starts Monday
  d.setDate(d.getDate() - diff);
  return d;
}

export function startOfMonth(): Date {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

export function generateTransactionCode(sequence: number): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `TRX-${y}${m}${day}-${String(sequence).padStart(3, "0")}`;
}
