"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/product-card";
import { ProductTable } from "@/components/products/product-table";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { StockAdjustmentModal } from "@/components/inventory/stock-adjustment-modal";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useSession } from "@/lib/session-provider";
import { can } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import type { Category, Product } from "@/types";

type ViewMode = "grid" | "table";

export default function ProductsPage() {
  const { t } = useLanguage();
  const { session } = useSession();
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [sort, setSort] = useState("name-asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const query = new URLSearchParams({
    ...(search ? { search } : {}),
    ...(categoryId !== "all" ? { categoryId } : {}),
    ...(stockStatus !== "all" ? { stockStatus } : {}),
    sort,
  }).toString();

  const { data: products, isLoading, error, refetch } = useApi<Product[]>(`/api/products?${query}`, [query]);
  const { data: categories } = useApi<Category[]>("/api/categories");

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(t("products.deleteSuccess"));
      refetch();
    } else {
      toast.error(t("errors.generic"));
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold">{t("products.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("products.subtitle")}</p>
        </div>
        {can(session.role, "product:create") && (
          <Button
            onClick={() => {
              setEditingProduct(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {t("products.addProduct")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder={t("products.searchPlaceholder")} className="sm:max-w-xs" />

        <div className="flex flex-wrap items-center gap-2">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t("products.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockStatus} onValueChange={setStockStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("common.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="in">{t("products.inStock")}</SelectItem>
              <SelectItem value="low">{t("products.lowStock")}</SelectItem>
              <SelectItem value="out">{t("products.outOfStock")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t("common.sort")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">{t("products.sortNameAsc")}</SelectItem>
              <SelectItem value="name-desc">{t("products.sortNameDesc")}</SelectItem>
              <SelectItem value="price-asc">{t("products.sortPriceAsc")}</SelectItem>
              <SelectItem value="price-desc">{t("products.sortPriceDesc")}</SelectItem>
              <SelectItem value="stock-desc">{t("products.sortStockDesc")}</SelectItem>
              <SelectItem value="stock-asc">{t("products.sortStockAsc")}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex overflow-hidden rounded-md border border-border">
            <button
              className={cn("p-2", view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
              onClick={() => setView("grid")}
              title={t("common.gridView")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              className={cn("p-2", view === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
              onClick={() => setView("table")}
              title={t("common.tableView")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={t("errors.network")} onRetry={refetch} retryLabel={t("common.confirm")} />
      ) : !products || products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t("products.noProductsTitle")}
          description={t("products.noProductsDesc")}
          actionLabel={can(session.role, "product:create") ? t("products.addProduct") : undefined}
          onAction={() => setFormOpen(true)}
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => {
                setEditingProduct(product);
                setFormOpen(true);
              }}
              onAddStock={() => setStockModalProduct(product)}
            />
          ))}
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={(p) => {
            setEditingProduct(p);
            setFormOpen(true);
          }}
          onAddStock={setStockModalProduct}
          onDelete={setDeleteTarget}
        />
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        categories={categories ?? []}
        onSaved={refetch}
      />

      <StockAdjustmentModal
        open={Boolean(stockModalProduct)}
        onOpenChange={(open) => !open && setStockModalProduct(null)}
        product={stockModalProduct}
        onAdjusted={refetch}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("products.deleteConfirmTitle")}
        description={t("products.deleteConfirmDesc")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
