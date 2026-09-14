"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Transaction } from "@/types";

export function TransactionTable({ transactions, onSelect }: { transactions: Transaction[]; onSelect: (t: Transaction) => void }) {
  const { t, locale } = useLanguage();

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("transactions.transactionId")}</TableHead>
            <TableHead>{t("common.date")}</TableHead>
            <TableHead className="text-right">{t("pos.discount")}</TableHead>
            <TableHead className="text-right">{t("common.total")}</TableHead>
            <TableHead className="text-right">{t("pos.payment")}</TableHead>
            <TableHead>{t("transactions.cashier")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} onClick={() => onSelect(tx)} className="cursor-pointer">
              <TableCell className="font-medium">{tx.code}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(tx.createdAt, locale)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {tx.discountAmount > 0 ? `-${formatCurrency(tx.discountAmount)}` : "-"}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">{formatCurrency(tx.total)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(tx.payment)}</TableCell>
              <TableCell className="text-muted-foreground">{tx.user?.name ?? "-"}</TableCell>
              <TableCell>
                <Badge variant={tx.status === "COMPLETED" ? "success" : "destructive"}>
                  {tx.status === "COMPLETED" ? t("transactions.completed") : t("transactions.voided")}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
