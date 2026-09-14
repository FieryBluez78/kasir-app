"use client";

import { useState } from "react";
import { Receipt as ReceiptIcon } from "lucide-react";
import { SearchInput } from "@/components/common/search-input";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog";
import { useApi } from "@/lib/hooks/use-api";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const query = new URLSearchParams({
    ...(search ? { search } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }).toString();

  const { data: transactions, isLoading, error, refetch } = useApi<Transaction[]>(`/api/transactions?${query}`, [query]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold">{t("transactions.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("transactions.subtitle")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder={t("transactions.searchPlaceholder")} className="sm:max-w-xs" />
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          <span className="text-sm text-muted-foreground">–</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : error ? (
        <ErrorState message={t("errors.network")} onRetry={refetch} retryLabel={t("common.confirm")} />
      ) : !transactions || transactions.length === 0 ? (
        <EmptyState icon={ReceiptIcon} title={t("transactions.noTransactionsTitle")} description={t("transactions.noTransactionsDesc")} />
      ) : (
        <TransactionTable transactions={transactions} onSelect={setSelected} />
      )}

      <TransactionDetailDialog transaction={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
