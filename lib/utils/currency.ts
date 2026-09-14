/**
 * Currency formatting utilities.
 *
 * All monetary values are stored as whole-number integers (no decimals),
 * which matches how Rupiah is used day-to-day and avoids floating point
 * rounding issues in stock/discount/checkout math.
 *
 * The formatter is intentionally not hardcoded to Rupiah so a store running
 * in another currency can switch by changing `code` + `locale` in one place
 * (see StoreSettings.currency, wired up in lib/i18n).
 */

export interface CurrencyConfig {
  code: string; // ISO 4217, e.g. "IDR"
  locale: string; // e.g. "id-ID"
  symbol: string; // display symbol, e.g. "Rp"
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  IDR: { code: "IDR", locale: "id-ID", symbol: "Rp" },
  USD: { code: "USD", locale: "en-US", symbol: "$" },
};

export function formatCurrency(
  amount: number,
  currencyCode: string = "IDR"
): string {
  const config = CURRENCIES[currencyCode] ?? CURRENCIES.IDR;

  // Rupiah convention: "Rp 10.000" — symbol, space, dot-separated thousands, no decimals.
  if (config.code === "IDR") {
    const formatted = new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
    return `${config.symbol} ${formatted}`;
  }

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}
