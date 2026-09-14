"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/language-provider";

interface StockBadgeProps {
  stock: number;
  minimumStock: number;
}

export function StockBadge({ stock, minimumStock }: StockBadgeProps) {
  const { t } = useLanguage();

  if (stock <= 0) {
    return (
      <Badge variant="destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        {t("products.outOfStock")}
      </Badge>
    );
  }

  if (stock <= minimumStock) {
    return (
      <Badge variant="warning">
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        {t("products.lowStock")}
      </Badge>
    );
  }

  return (
    <Badge variant="success">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      {t("products.inStock")}
    </Badge>
  );
}
