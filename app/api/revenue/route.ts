import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  getDashboardStats,
  getGrossProfit,
  getRevenueSummary,
  getTopProducts,
} from "@/lib/services/revenue";
import { startOfMonth } from "@/lib/utils/date";
import { requireSession } from "@/lib/auth/guard";

export async function GET() {
  const guard = await requireSession();
  if (guard instanceof NextResponse) return guard;

  const [stats, revenue, grossProfit, topProducts, recentTransactions] = await Promise.all([
    getDashboardStats(),
    getRevenueSummary(),
    getGrossProfit(startOfMonth()),
    getTopProducts(5),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true } } },
    }),
  ]);

  // Last 7 days of revenue for the dashboard chart.
  const days: { label: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const agg = await prisma.transaction.aggregate({
      where: { createdAt: { gte: day, lt: nextDay }, status: "COMPLETED" },
      _sum: { total: true },
    });
    days.push({
      label: day.toLocaleDateString("id-ID", { weekday: "short" }),
      total: agg._sum.total ?? 0,
    });
  }

  return NextResponse.json({ stats, revenue, grossProfit, topProducts, recentTransactions, chart: days });
}
