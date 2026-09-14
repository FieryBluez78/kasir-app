"use client";

import Link from "next/link";
import { Package, Boxes, Wallet, Receipt, AlertTriangle, XCircle, Plus, ShoppingCart, PackagePlus, FileBarChart } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopProductsCard } from "@/components/dashboard/top-products-card";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useSession } from "@/lib/session-provider";
import { formatCurrency } from "@/lib/utils/currency";
import type { Transaction } from "@/types";

interface DashboardData {
  stats: { totalProducts: number; totalStock: number; lowStockCount: number; outOfStockCount: number };
  revenue: { today: { total: number; count: number } };
  topProducts: { productId: string; productName: string; quantitySold: number; revenue: number }[];
  recentTransactions: Transaction[];
  chart: { label: string; total: number }[];
}

export default function DashboardPage() {
  const { t, locale } = useLanguage();
  const { session } = useSession();
  const { data, isLoading, error, refetch } = useApi<DashboardData>("/api/revenue");

  const quickActions = [
    { href: "/products", label: t("dashboard.addProduct"), icon: Plus },
    { href: "/pos", label: t("dashboard.startTransaction"), icon: ShoppingCart },
    { href: "/inventory", label: t("dashboard.addStock"), icon: PackagePlus },
    { href: "/reports", label: t("dashboard.viewReports"), icon: FileBarChart },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-semibold">
            {t("dashboard.greeting", { name: session.name })} 👋
          </h2>
          <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <ErrorState message={t("errors.network")} onRetry={refetch} retryLabel={t("common.confirm")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">
          {t("dashboard.greeting", { name: session.name })} 👋
        </h2>
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {isLoading || !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <DashboardCard label={t("dashboard.totalProducts")} value={String(data.stats.totalProducts)} icon={Package} />
          <DashboardCard label={t("dashboard.totalStock")} value={String(data.stats.totalStock)} icon={Boxes} />
          <DashboardCard label={t("dashboard.revenueToday")} value={formatCurrency(data.revenue.today.total)} icon={Wallet} />
          <DashboardCard label={t("dashboard.transactionsToday")} value={String(data.revenue.today.count)} icon={Receipt} />
          <DashboardCard
            label={t("dashboard.lowStock")}
            value={String(data.stats.lowStockCount)}
            icon={AlertTriangle}
            tone="warning"
          />
          <DashboardCard
            label={t("dashboard.outOfStock")}
            value={String(data.stats.outOfStockCount)}
            icon={XCircle}
            tone="destructive"
          />
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap gap-3 p-5">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-2 rounded-md border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <action.icon className="h-4 w-4 text-primary" />
              {action.label}
            </Link>
          ))}
        </CardContent>
      </Card>

      {isLoading || !data ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={data.chart} />
          </div>
          <TopProductsCard products={data.topProducts} title={t("dashboard.topProducts")} />
        </div>
      )}

      {isLoading || !data ? (
        <Skeleton className="h-48" />
      ) : (
        <RecentTransactionsCard
          transactions={data.recentTransactions}
          title={t("dashboard.recentTransactions")}
          emptyLabel={t("dashboard.noTransactionsYet")}
          locale={locale}
        />
      )}
    </div>
  );
}
