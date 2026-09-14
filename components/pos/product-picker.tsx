"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils/cn";
import type { Category, Product } from "@/types";

interface ProductPickerProps {
  onSelect: (product: Product) => void;
}

export function ProductPicker({ onSelect }: ProductPickerProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const query = new URLSearchParams({
    ...(search ? { search } : {}),
    ...(categoryId !== "all" ? { categoryId } : {}),
  }).toString();

  const { data: products } = useApi<Product[]>(`/api/products?${query}`, [query]);
  const { data: categories } = useApi<Category[]>("/api/categories");

  return (
    <div className="flex h-full flex-col gap-3">
      <SearchInput value={search} onChange={setSearch} placeholder={t("pos.searchProducts")} />

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setCategoryId("all")}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
            categoryId === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
          )}
        >
          {t("common.all")}
        </button>
        {categories?.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
              categoryId === c.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pb-2 scrollbar-thin sm:grid-cols-3 xl:grid-cols-4">
        {products?.map((product) => {
          const disabled = product.stock <= 0;
          return (
            <button
              key={product.id}
              disabled={disabled}
              onClick={() => onSelect(product)}
              className={cn(
                "flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-primary",
                disabled && "cursor-not-allowed opacity-50 hover:border-border"
              )}
            >
              <div className="relative aspect-square w-full bg-secondary">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageOff className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-0.5 p-2.5">
                <p className="truncate text-xs font-medium">{product.name}</p>
                <p className="text-xs font-semibold text-primary">{formatCurrency(product.sellingPrice)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t("products.stock")}: {product.stock}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
