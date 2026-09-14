import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";

interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export function TopProductsCard({ products, title }: { products: TopProduct[]; title: string }) {
  const max = Math.max(...products.map((p) => p.quantitySold), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {products.length === 0 && <p className="text-sm text-muted-foreground">—</p>}
        {products.map((p, i) => (
          <div key={p.productId} className="flex items-center gap-3">
            <span className="w-4 text-xs font-medium text-muted-foreground">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium">{p.productName}</span>
                <span className="shrink-0 text-muted-foreground">{p.quantitySold}x</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(p.quantitySold / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatCurrency(p.revenue)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
