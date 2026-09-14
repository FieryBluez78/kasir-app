"use client";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StockBadge } from "@/components/common/stock-badge";
import { formatRelative } from "@/lib/utils/date";
import { useLanguage } from "@/lib/i18n/language-provider";
import { PackagePlus } from "lucide-react";
import type { Product } from "@/types";

interface StockTableProps {
  products: Product[];
  onAdjust: (product: Product) => void;
}

export function StockTable({ products, onAdjust }: StockTableProps) {
  const { t, locale } = useLanguage();

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("products.productName")}</TableHead>
            <TableHead>{t("products.sku")}</TableHead>
            <TableHead className="text-right">{t("inventory.currentStock")}</TableHead>
            <TableHead className="text-right">{t("products.minimumStock")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead>{t("inventory.lastUpdate")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">{product.sku}</TableCell>
              <TableCell className="text-right tabular-nums">{product.stock}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{product.minimumStock}</TableCell>
              <TableCell>
                <StockBadge stock={product.stock} minimumStock={product.minimumStock} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatRelative(product.updatedAt, locale)}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onAdjust(product)}>
                  <PackagePlus className="h-3.5 w-3.5" />
                  {t("inventory.addStock")}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
