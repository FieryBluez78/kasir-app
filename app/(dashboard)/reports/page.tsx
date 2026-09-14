"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import { formatCurrency } from "@/lib/utils/currency";

interface ReportData {
  sales: {
    totalSales: number;
    totalDiscount: number;
    totalTransactions: number;
    bestSelling: { productId: string; productName: string; quantitySold: number; revenue: number }[];
  };
  stock: {
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    lowStockItems: { id: string; name: string; sku: string; stock: number; minimumStock: number }[];
    movementSummary: { type: string; quantity: number }[];
  };
  revenue: { revenue: number; cost: number; grossProfit: number; totalDiscount: number };
}

export default function ReportsPage() {
  const { t } = useLanguage();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = new URLSearchParams({
    ...(from ? { from: new Date(from).toISOString() } : {}),
    ...(to ? { to: new Date(to).toISOString() } : {}),
  }).toString();

  const { data, isLoading, error, refetch } = useApi<ReportData>(`/api/reports?${query}`, [query]);

  const handleExport = () => {
    window.open(`/api/reports/export?${query}`, "_blank");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold">{t("reports.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            {t("reports.exportCsv")}
          </Button>
        </div>
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <ErrorState message={t("errors.network")} onRetry={refetch} retryLabel={t("common.confirm")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("reports.salesReport")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("common.total")}</span>
                <span className="font-medium">{formatCurrency(data.sales.totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("pos.discount")}</span>
                <span className="font-medium">{formatCurrency(data.sales.totalDiscount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("transactions.title")}</span>
                <span className="font-medium">{data.sales.totalTransactions}</span>
              </div>
              <p className="pt-2 text-xs font-medium text-muted-foreground">{t("reports.bestSelling")}</p>
              {data.sales.bestSelling.slice(0, 5).map((p) => (
                <div key={p.productId} className="flex justify-between text-xs">
                  <span className="truncate">{p.productName}</span>
                  <span>{p.quantitySold}x</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("reports.stockReport")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("inventory.currentStock")}</span>
                <span className="font-medium">{data.stock.totalStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("products.lowStock")}</span>
                <Badge variant="warning">{data.stock.lowStockCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("products.outOfStock")}</span>
                <Badge variant="destructive">{data.stock.outOfStockCount}</Badge>
              </div>
              <p className="pt-2 text-xs font-medium text-muted-foreground">{t("reports.stockMovementSummary")}</p>
              {data.stock.movementSummary.map((m) => (
                <div key={m.type} className="flex justify-between text-xs">
                  <span>{t(`inventory.types.${m.type}`)}</span>
                  <span>{m.quantity}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("reports.revenueReport")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("revenue.title")}</span>
                <span className="font-medium">{formatCurrency(data.revenue.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("products.costPrice")}</span>
                <span className="font-medium">{formatCurrency(data.revenue.cost)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>{t("revenue.grossProfit")}</span>
                <span>{formatCurrency(data.revenue.grossProfit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("pos.discount")}</span>
                <span className="font-medium">{formatCurrency(data.revenue.totalDiscount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && data && data.stock.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("products.lowStock")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("products.productName")}</TableHead>
                  <TableHead>{t("products.sku")}</TableHead>
                  <TableHead className="text-right">{t("inventory.currentStock")}</TableHead>
                  <TableHead className="text-right">{t("products.minimumStock")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.stock.lowStockItems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-right">{p.stock}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{p.minimumStock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
