import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelative } from "@/lib/utils/date";
import { Receipt } from "lucide-react";
import type { Transaction } from "@/types";

export function RecentTransactionsCard({
  transactions,
  title,
  emptyLabel,
  locale,
}: {
  transactions: Transaction[];
  title: string;
  emptyLabel: string;
  locale: "id" | "en";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {transactions.length === 0 && <p className="text-sm text-muted-foreground">{emptyLabel}</p>}
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 rounded-md px-1 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{tx.code}</p>
              <p className="text-xs text-muted-foreground">{formatRelative(tx.createdAt, locale)}</p>
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums">{formatCurrency(tx.total)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
