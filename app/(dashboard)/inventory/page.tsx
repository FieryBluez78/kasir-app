"use client";

import { useState } from "react";
import { Boxes } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchInput } from "@/components/common/search-input";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StockTable } from "@/components/inventory/stock-table";
import { StockHistoryTable } from "@/components/inventory/stock-history-table";
import { StockAdjustmentModal } from "@/components/inventory/stock-adjustment-modal";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Product, StockMovement } from "@/types";

export default function InventoryPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const query = new URLSearchParams(search ? { search } : {}).toString();
  const { data: products, isLoading, error, refetch } = useApi<Product[]>(`/api/products?${query}`, [query]);
  const {
    data: movements,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useApi<StockMovement[]>("/api/stock");

  const handleAdjusted = () => {
    refetch();
    refetchHistory();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">{t("inventory.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("inventory.subtitle")}</p>
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">{t("inventory.title")}</TabsTrigger>
          <TabsTrigger value="history">{t("inventory.history")}</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <SearchInput value={search} onChange={setSearch} placeholder={t("products.searchPlaceholder")} className="max-w-xs" />

          {isLoading ? (
            <Skeleton className="h-96" />
          ) : error ? (
            <ErrorState message={t("errors.network")} onRetry={refetch} retryLabel={t("common.confirm")} />
          ) : !products || products.length === 0 ? (
            <EmptyState icon={Boxes} title={t("products.noProductsTitle")} description={t("products.noProductsDesc")} />
          ) : (
            <StockTable products={products} onAdjust={setAdjustProduct} />
          )}
        </TabsContent>

        <TabsContent value="history">
          {historyLoading ? (
            <Skeleton className="h-96" />
          ) : historyError ? (
            <ErrorState message={t("errors.network")} onRetry={refetchHistory} retryLabel={t("common.confirm")} />
          ) : !movements || movements.length === 0 ? (
            <EmptyState icon={Boxes} title={t("inventory.history")} description="—" />
          ) : (
            <StockHistoryTable movements={movements} />
          )}
        </TabsContent>
      </Tabs>

      <StockAdjustmentModal
        open={Boolean(adjustProduct)}
        onOpenChange={(open) => !open && setAdjustProduct(null)}
        product={adjustProduct}
        onAdjusted={handleAdjusted}
      />
    </div>
  );
}
