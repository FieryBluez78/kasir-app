import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface DashboardCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "warning" | "destructive";
}

export function DashboardCard({ label, value, icon: Icon, tone = "default" }: DashboardCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            tone === "warning" && "bg-warning/15 text-warning",
            tone === "destructive" && "bg-destructive/10 text-destructive",
            tone === "default" && "bg-primary/10 text-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
