"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Printer, Download } from "lucide-react";
import type { Transaction } from "@/types";

export function Receipt({ transaction, storeName = "Toko Kasir" }: { transaction: Transaction; storeName?: string }) {
  const { t, locale } = useLanguage();

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const lines = [
      storeName,
      "================================",
      `Transaction: ${transaction.code}`,
      formatDate(transaction.createdAt, locale),
      "--------------------------------",
      ...transaction.items.map(
        (i) => `${i.productName} x${i.quantity}\n${formatCurrency(i.subtotal)}`
      ),
      "--------------------------------",
      `Subtotal: ${formatCurrency(transaction.subtotal)}`,
      transaction.discountAmount > 0 ? `Discount: ${formatCurrency(transaction.discountAmount)}` : "",
      `TOTAL: ${formatCurrency(transaction.total)}`,
      `Payment: ${formatCurrency(transaction.payment)}`,
      `Change: ${formatCurrency(transaction.change)}`,
      "================================",
      "Terima kasih",
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${transaction.code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div id="receipt-print" className="mx-auto max-w-xs rounded-lg border border-dashed border-border p-4 font-mono text-xs">
        <p className="text-center font-semibold">{storeName}</p>
        <p className="my-2 border-t border-dashed border-border" />
        <p>Transaction: {transaction.code}</p>
        <p className="text-muted-foreground">{formatDate(transaction.createdAt, locale)}</p>
        <p className="my-2 border-t border-dashed border-border" />
        {transaction.items.map((item) => (
          <div key={item.id} className="mb-1 flex justify-between gap-2">
            <span className="truncate">
              {item.productName} x{item.quantity}
            </span>
            <span className="shrink-0">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
        <p className="my-2 border-t border-dashed border-border" />
        <div className="flex justify-between">
          <span>{t("pos.subtotal")}</span>
          <span>{formatCurrency(transaction.subtotal)}</span>
        </div>
        {transaction.discountAmount > 0 && (
          <div className="flex justify-between">
            <span>{t("pos.discount")}</span>
            <span>-{formatCurrency(transaction.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold">
          <span>TOTAL</span>
          <span>{formatCurrency(transaction.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t("pos.payment")}</span>
          <span>{formatCurrency(transaction.payment)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t("pos.change")}</span>
          <span>{formatCurrency(transaction.change)}</span>
        </div>
        <p className="my-2 border-t border-dashed border-border" />
        <p className="text-center">Terima kasih</p>
      </div>

      <div className="no-print flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-3.5 w-3.5" />
          {t("common.print")}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5" />
          {t("common.download")}
        </Button>
      </div>
    </div>
  );
}
