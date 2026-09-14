"use client";

import { ImageOff, Pencil, PackagePlus, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StockBadge } from "@/components/common/stock-badge";
import { formatCurrency } from "@/lib/utils/currency";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useSession } from "@/lib/session-provider";
import { can } from "@/lib/auth/permissions";
import type { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onAddStock: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ products, onEdit, onAddStock, onDelete }: ProductTableProps) {
  const { t } = useLanguage();
  const { session } = useSession();

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>{t("products.productName")}</TableHead>
            <TableHead>{t("products.sku")}</TableHead>
            <TableHead>{t("products.category")}</TableHead>
            <TableHead className="text-right">{t("products.sellingPrice")}</TableHead>
            <TableHead className="text-right">{t("products.stock")}</TableHead>
            <TableHead>{t("common.status")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="relative h-10 w-10 overflow-hidden rounded-md bg-secondary">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="text-muted-foreground">{product.sku}</TableCell>
              <TableCell className="text-muted-foreground">{product.category?.name ?? "-"}</TableCell>
              <TableCell className="text-right tabular-nums">{formatCurrency(product.sellingPrice)}</TableCell>
              <TableCell className="text-right tabular-nums">{product.stock}</TableCell>
              <TableCell>
                <StockBadge stock={product.stock} minimumStock={product.minimumStock} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onAddStock(product)} title={t("inventory.addStock")}>
                    <PackagePlus className="h-4 w-4" />
                  </Button>
                  {can(session.role, "product:update") && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(product)} title={t("common.edit")}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {can(session.role, "product:delete") && (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(product)} title={t("common.delete")}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
