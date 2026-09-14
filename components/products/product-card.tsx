"use client";

import { ImageOff, Pencil, PackagePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockBadge } from "@/components/common/stock-badge";
import { formatCurrency } from "@/lib/utils/currency";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onAddStock: () => void;
}

export function ProductCard({ product, onEdit, onAddStock }: ProductCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] w-full bg-secondary">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
      </div>
      <CardContent className="space-y-2 p-4">
        <div>
          <p className="truncate font-display text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.sku}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-semibold">{formatCurrency(product.sellingPrice)}</span>
          <span className="text-xs text-muted-foreground">
            {t("products.stock")}: {product.stock}
          </span>
        </div>
        <StockBadge stock={product.stock} minimumStock={product.minimumStock} />
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            {t("common.edit")}
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onAddStock}>
            <PackagePlus className="h-3.5 w-3.5" />
            {t("inventory.addStock")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
