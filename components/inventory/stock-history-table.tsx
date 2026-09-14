"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { StockMovement } from "@/types";

const POSITIVE_TYPES = new Set(["RESTOCK", "ADJUSTMENT_ADD", "INITIAL", "RETURN"]);

export function StockHistoryTable({ movements }: { movements: StockMovement[] }) {
  const { t, locale } = useLanguage();

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("common.date")}</TableHead>
            <TableHead>{t("products.productName")}</TableHead>
            <TableHead>{t("inventory.movementType")}</TableHead>
            <TableHead className="text-right">{t("inventory.quantity")}</TableHead>
            <TableHead className="text-right">{t("inventory.stockBefore")}</TableHead>
            <TableHead className="text-right">{t("inventory.stockAfter")}</TableHead>
            <TableHead>{t("inventory.reason")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => {
            const positive = POSITIVE_TYPES.has(m.type);
            return (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(m.createdAt, locale)}
                </TableCell>
                <TableCell className="font-medium">{m.product.name}</TableCell>
                <TableCell>
                  <Badge variant={positive ? "success" : "destructive"}>{t(`inventory.types.${m.type}`)}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {positive ? "+" : "-"}
                  {m.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">{m.stockBefore}</TableCell>
                <TableCell className="text-right tabular-nums">{m.stockAfter}</TableCell>
                <TableCell className="max-w-[220px] truncate text-muted-foreground">{m.reason ?? "-"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
