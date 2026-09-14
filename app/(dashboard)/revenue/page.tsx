"use client";

import { Receipt, TrendingUp, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import { formatCurrency } from "@/lib/utils/currency";

interface RevenueData {
  revenue: {
    today: { total: number; count: number };
    week: { total: number; count: number };
    month: { total: number; count: number };
  };
  grossProfit: { revenue: number; cost: number; grossProfit: number };
  chart: { label: string; total: number }[];
}

export default function RevenuePage() {
  const { t } = useLanguage();
  const { data, isLoading, error, refetch } = useApi<RevenueData>("/api/revenue");

  const avgTransaction =
    data && data.revenue.month.count > 0 ? data.revenue.month.total / data.revenue.month.count : 0;

  if (error) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-xl font-semibold">{t("revenue.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("revenue.subtitle")}</p>
        </div>
        <ErrorState message={t("errors.network")} onRetry={refetch} retryLabel={t("common.confirm")} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">{t("revenue.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("revenue.subtitle")}</p>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{t("revenue.today")}</p>
              <p className="font-display text-xl font-semibold">{formatCurrency(data.revenue.today.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{t("revenue.thisWeek")}</p>
              <p className="font-display text-xl font-semibold">{formatCurrency(data.revenue.week.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{t("revenue.thisMonth")}</p>
              <p className="font-display text-xl font-semibold">{formatCurrency(data.revenue.month.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-1 p-5">
              <p className="text-sm text-muted-foreground">{t("revenue.grossProfit")}</p>
              <p className="font-display text-xl font-semibold">{formatCurrency(data.grossProfit.grossProfit)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading || !data ? (
        <Skeleton className="h-64" />
      ) : (
        <RevenueChart data={data.chart} />
      )}

      {!isLoading && data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Receipt className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t("revenue.totalTransactions")}</p>
                <p className="font-display font-semibold">{data.revenue.month.count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t("revenue.averageTransaction")}</p>
                <p className="font-display font-semibold">{formatCurrency(avgTransaction)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Percent className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{t("reports.revenueReport")}</p>
                <p className="font-display font-semibold">{formatCurrency(data.grossProfit.revenue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
