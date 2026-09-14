"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Receipt } from "./receipt";
import { formatCurrency } from "@/lib/utils/currency";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Transaction } from "@/types";

export function TransactionDetailDialog({
  transaction,
  onOpenChange,
}: {
  transaction: Transaction | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLanguage();
  if (!transaction) return null;

  return (
    <Dialog open={Boolean(transaction)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("transactions.detail")} — {transaction.code}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("products.productName")}</TableHead>
                <TableHead className="text-right">{t("inventory.quantity")}</TableHead>
                <TableHead className="text-right">{t("products.sellingPrice")}</TableHead>
                <TableHead className="text-right">{t("common.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaction.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Receipt transaction={transaction} />
      </DialogContent>
    </Dialog>
  );
}
